import { execFile } from "node:child_process";
import {
  mkdtemp,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type {
  SessionDefinition,
  SshSessionDefinition,
} from "../shared/saved-sessions";
import {
  isSshSessionReference,
  sessionIpc,
  type SshSessionReference,
} from "../shared/session-ipc";
import type { IpcEvent, IpcMainPort } from "./terminal-ipc-types";
import { registerTrustedHandlers } from "./trusted-ipc";
import { mainTranslator } from "./main-translator";

// Removes a host's keys from the user's own known_hosts. `ssh-keygen -R`
// decides which lines belong to the host, run on a private copy because it
// refuses to rewrite a file that has any invalid line. OMXTerm then removes
// exactly those lines from the real file, keeps the previous one as
// known_hosts.old and leaves every other line, valid or not, untouched. Only
// an explicit Solution request does this, for a host taken from the session
// definition; the reconnect that follows makes ssh ask about the new key in
// the terminal (ADR 0039).

// ssh-keygen's name for a host on a non-default port: [host]:port.
export function knownHostsName(
  session: Pick<SshSessionDefinition, "host" | "port">,
): string {
  const host = session.host.replace(/^\[(.*)\]$/u, "$1");
  return session.port !== undefined && session.port !== 22
    ? `[${host}]:${session.port}`
    : host;
}

export function userKnownHostsFile(
  homeDirectory: string,
  platform: string = process.platform,
): string {
  const join = platform === "win32" ? path.win32.join : path.posix.join;
  return join(homeDirectory, ".ssh", "known_hosts");
}

export type RunFile = (
  executable: string,
  arguments_: readonly string[],
) => Promise<{ readonly stdout: string }>;

// ssh-keygen's exit status is ignored: on a file with invalid lines it still
// reports the host's lines and only declines to write the copy.
const runFile: RunFile = (executable, arguments_) =>
  new Promise((resolve, reject) => {
    execFile(
      executable,
      [...arguments_],
      { timeout: 10_000, windowsHide: true },
      (error, stdout) =>
        error && (typeof error.code !== "number" || error.killed)
          ? reject(error)
          : resolve({ stdout }),
    );
  });

// Resolves whether a key for the host was found and removed.
export async function forgetHostKey(
  session: Pick<SshSessionDefinition, "host" | "port">,
  options: {
    readonly sshKeygen: string;
    readonly knownHostsFile: string;
    readonly run?: RunFile;
  },
): Promise<boolean> {
  const file = options.knownHostsFile;
  let original: Buffer;
  try {
    original = await readFile(file);
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw cause;
  }
  const scratch = await mkdtemp(path.join(tmpdir(), "omxterm-known-hosts-"));
  let lines: ReadonlySet<number>;
  try {
    const copy = path.join(scratch, "known_hosts");
    await writeFile(copy, original, { mode: 0o600 });
    const { stdout } = await (options.run ?? runFile)(options.sshKeygen, [
      "-R",
      knownHostsName(session),
      "-f",
      copy,
    ]);
    lines = new Set(
      [...stdout.matchAll(/\bfound: line (\d+)/gu)].map((match) =>
        Number(match[1]),
      ),
    );
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  if (lines.size === 0) return false;
  const next = original
    .toString("utf8")
    .split("\n")
    .filter((_line, index) => !lines.has(index + 1))
    .join("\n");
  // Another ssh may have added a host meanwhile; never overwrite that.
  if (!(await readFile(file)).equals(original))
    throw new Error("known_hosts changed while it was being updated");
  const mode = (await stat(file)).mode & 0o777;
  await writeFile(`${file}.old`, original, { mode });
  const temporary = `${file}.omxterm-${process.pid}`;
  await writeFile(temporary, next, { mode });
  await rename(temporary, file);
  return true;
}

// Serves the Solution's "remove the old key" request. The renderer names the
// session, never a host; failures cross as short fixed reasons.
export function registerHostKeyIpc(
  ipcMain: IpcMainPort,
  isTrusted: (event: IpcEvent) => boolean,
  options: {
    readonly resolve: (
      reference: SshSessionReference,
    ) => SessionDefinition | undefined;
    readonly sshKeygen: () => string | undefined;
    readonly knownHostsFile: string;
    readonly run?: RunFile;
  },
  onRejected?: () => void,
): () => void {
  return registerTrustedHandlers(
    ipcMain,
    isTrusted,
    {
      [sessionIpc.forgetHostKey]: async (_event, payload) => {
        if (!isSshSessionReference(payload))
          throw new Error("Invalid session reference");
        const session = options.resolve(payload);
        if (session?.kind !== "ssh")
          throw new Error(mainTranslator().t("sessions.error.notSsh"));
        const sshKeygen = options.sshKeygen();
        if (!sshKeygen)
          throw new Error(mainTranslator().t("sessions.error.noSshKeygen"));
        try {
          return {
            removed: await forgetHostKey(session, {
              sshKeygen,
              knownHostsFile: options.knownHostsFile,
              ...(options.run ? { run: options.run } : {}),
            }),
          };
        } catch {
          throw new Error(
            mainTranslator().t("sessions.error.knownHostsUpdate"),
          );
        }
      },
    },
    onRejected,
  );
}
