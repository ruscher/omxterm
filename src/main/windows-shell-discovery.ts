import { stat } from "node:fs/promises";
import path from "node:path";
import type {
  WindowsShellKind,
  WindowsShellSuggestion,
} from "../shared/windows-shells";
import { isLocalWindowsDriveAbsolutePath } from "../shared/windows-shells";

interface Candidate {
  readonly kind: WindowsShellKind;
  readonly executable: string | undefined;
}

export interface WindowsShellDiscoveryOptions {
  readonly environment: Readonly<Record<string, string | undefined>>;
  readonly inspect?: typeof stat;
}

// Discovery is deliberately passive. It checks a small fixed set of documented
// installation layouts and never searches PATH, invokes a shell, resolves an
// App Execution Alias, or reads shell-controlled output.
export async function discoverWindowsShells(
  options: WindowsShellDiscoveryOptions,
): Promise<readonly WindowsShellSuggestion[]> {
  const environment = options.environment;
  const inspect = options.inspect ?? stat;
  const systemRoot = absoluteEnvironmentPath(environment.SystemRoot);
  const programRoots = uniquePaths([
    absoluteEnvironmentPath(environment.ProgramW6432),
    absoluteEnvironmentPath(environment.ProgramFiles),
    absoluteEnvironmentPath(environment["ProgramFiles(x86)"]),
  ]);
  const candidates: Candidate[] = [];

  for (const root of programRoots)
    candidates.push({
      kind: "powershell-core",
      executable: path.win32.join(root, "PowerShell", "7", "pwsh.exe"),
    });

  candidates.push(
    {
      kind: "windows-powershell",
      executable: systemRoot
        ? path.win32.join(
            systemRoot,
            "System32",
            "WindowsPowerShell",
            "v1.0",
            "powershell.exe",
          )
        : undefined,
    },
    {
      kind: "command-prompt",
      executable: systemRoot
        ? path.win32.join(systemRoot, "System32", "cmd.exe")
        : undefined,
    },
    {
      kind: "wsl",
      executable: systemRoot
        ? path.win32.join(systemRoot, "System32", "wsl.exe")
        : undefined,
    },
  );

  for (const root of programRoots)
    candidates.push({
      kind: "git-bash",
      executable: path.win32.join(root, "Git", "bin", "bash.exe"),
    });

  const systemDrive = windowsDrive(environment.SystemDrive, systemRoot);
  if (systemDrive) {
    candidates.push(
      {
        kind: "msys2",
        executable: path.win32.join(
          systemDrive,
          "msys64",
          "usr",
          "bin",
          "bash.exe",
        ),
      },
      {
        kind: "cygwin",
        executable: path.win32.join(systemDrive, "cygwin64", "bin", "bash.exe"),
      },
    );
  }

  const discovered: WindowsShellSuggestion[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate.executable) continue;
    const key = candidate.executable.toLocaleLowerCase("en-US");
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      if (!(await inspect(candidate.executable)).isFile()) continue;
    } catch {
      continue;
    }
    discovered.push(
      Object.freeze({
        kind: candidate.kind,
        executable: candidate.executable,
      }),
    );
  }
  return Object.freeze(discovered);
}

function absoluteEnvironmentPath(
  value: string | undefined,
): string | undefined {
  if (!isLocalWindowsDriveAbsolutePath(value)) return undefined;
  const normalized = path.win32.normalize(value);
  // Standard shell locations are local. Reject UNC, device and root-relative
  // environment values so passive discovery cannot touch a network share.
  return isLocalWindowsDriveAbsolutePath(normalized) &&
    path.win32.isAbsolute(normalized)
    ? normalized
    : undefined;
}

function uniquePaths(
  values: readonly (string | undefined)[],
): readonly string[] {
  const unique = new Map<string, string>();
  for (const value of values) {
    if (value) unique.set(value.toLocaleLowerCase("en-US"), value);
  }
  return [...unique.values()];
}

function windowsDrive(
  configured: string | undefined,
  systemRoot: string | undefined,
): string | undefined {
  if (configured && /^[a-z]:\\?$/iu.test(configured))
    return `${configured.slice(0, 2)}\\`;
  const parsed = systemRoot ? path.win32.parse(systemRoot).root : "";
  return /^[a-z]:\\$/iu.test(parsed) ? parsed : undefined;
}
