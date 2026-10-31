import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { DefaultShellLaunch } from "./default-shell";
import { withPowerShellIntegration } from "./powershell-integration";
import { discoverWindowsShells } from "./windows-shell-discovery";
import type { WindowsShellProfiles } from "../shared/windows-shell-profiles";
import {
  isLocalWindowsDriveAbsolutePath,
  MAX_WINDOWS_SHELL_CHOICES,
  type WindowsShellChoice,
  type WindowsShellKind,
  type WindowsShellSuggestion,
} from "../shared/windows-shells";

const execFileAsync = promisify(execFile);
const WSL_LIST_TIMEOUT_MS = 4_000;
const WSL_DISTRIBUTION = /^[A-Za-z0-9][\w.+ -]{0,63}$/u;

export interface WindowsShellChoicesOptions {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly profiles: () => WindowsShellProfiles | undefined;
  readonly integration?: () => boolean;
  readonly kindLabel: (kind: WindowsShellKind) => string;
  readonly discover?: () => Promise<readonly WindowsShellSuggestion[]>;
  readonly listWslDistributions?: (wsl: string) => Promise<readonly string[]>;
}

export interface WindowsShellChoices {
  // Refreshes what the menu offers. Ids resolve only against the latest result.
  list(): Promise<readonly WindowsShellChoice[]>;
  resolve(id: string): DefaultShellLaunch | undefined;
}

export function createWindowsShellChoices(
  options: WindowsShellChoicesOptions,
): WindowsShellChoices {
  const discover =
    options.discover ??
    (() => discoverWindowsShells({ environment: options.environment }));
  const listDistributions =
    options.listWslDistributions ?? listInstalledWslDistributions;
  let launches = new Map<string, DefaultShellLaunch>();
  return {
    async list() {
      const next = new Map<string, DefaultShellLaunch>();
      const choices: WindowsShellChoice[] = [];
      const add = (id: string, launch: DefaultShellLaunch) => {
        if (choices.length >= MAX_WINDOWS_SHELL_CHOICES || next.has(id)) return;
        next.set(
          id,
          withPowerShellIntegration(
            Object.freeze(launch),
            options.integration?.() === true,
          ),
        );
        choices.push(Object.freeze({ id, label: launch.title }));
      };
      for (const profile of options.profiles()?.profiles ?? [])
        add(`profile:${profile.id}`, {
          shell: profile.executable,
          arguments: profile.arguments,
          title: profile.name,
        });
      const installed = await discover().catch(() => []);
      for (const { kind, executable } of installed) {
        if (kind !== "wsl")
          add(`installed:${kind}`, {
            shell: executable,
            arguments: [],
            title: options.kindLabel(kind),
          });
      }
      const wsl = installed.find(({ kind }) => kind === "wsl")?.executable;
      if (wsl) {
        const distributions = await listDistributions(wsl).catch(() => []);
        for (const name of distributions.filter(isWslDistributionName))
          add(`wsl:${name}`, {
            shell: wsl,
            arguments: ["--distribution", name, "--cd", "~"],
            title: `${name} (WSL)`,
          });
        // Without a distribution wsl.exe explains how to install one.
        if (distributions.length === 0)
          add("installed:wsl", {
            shell: wsl,
            arguments: [],
            title: options.kindLabel("wsl"),
          });
      }
      launches = next;
      return Object.freeze(choices);
    },
    resolve: (id) => launches.get(id),
  };
}

export function isWslDistributionName(name: string): boolean {
  return WSL_DISTRIBUTION.test(name);
}

// `wsl --list --quiet` writes UTF-16LE unless WSL_UTF8 says otherwise, and its
// language never changes the names. Internal Docker distributions hold no shell.
export function parseWslDistributions(output: Buffer): readonly string[] {
  const utf16 =
    (output[0] === 0xff && output[1] === 0xfe) ||
    (output.length > 1 && output[1] === 0);
  const text = output
    .toString(utf16 ? "utf16le" : "utf8")
    .replace(/^\uFEFF/u, "");
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        isWslDistributionName(line) &&
        !/^docker-desktop(?:-data)?$/iu.test(line),
    );
}

// Runs only the wsl.exe discovery found at System32, on request, without a
// shell; listing does not start a stopped distribution.
async function listInstalledWslDistributions(
  wsl: string,
): Promise<readonly string[]> {
  if (
    !isLocalWindowsDriveAbsolutePath(wsl) ||
    path.win32.basename(wsl).toLowerCase() !== "wsl.exe"
  )
    return [];
  const { stdout } = await execFileAsync(wsl, ["--list", "--quiet"], {
    encoding: "buffer",
    timeout: WSL_LIST_TIMEOUT_MS,
    windowsHide: true,
  });
  return parseWslDistributions(stdout);
}
