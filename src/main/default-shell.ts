import { existsSync } from "node:fs";
import path from "node:path";
import { isLocalWindowsDriveAbsolutePath } from "../shared/windows-shells";
import { withPowerShellIntegration } from "./powershell-integration";
import {
  defaultWindowsShellProfile,
  type WindowsShellProfiles,
} from "../shared/windows-shell-profiles";

export interface DefaultShellLaunch {
  readonly shell: string;
  readonly arguments: readonly string[];
  readonly title: string;
}

export interface WindowsShellConfiguration {
  readonly windowsShell?: string;
  readonly windowsProfiles?: WindowsShellProfiles;
  readonly windowsShellIntegration?: boolean;
}

export function createDefaultShellResolver(
  accountShell: string | null | undefined,
  configuredWindowsShell: () => string | undefined,
  platform: NodeJS.Platform | string = process.platform,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): () => string {
  return () =>
    resolveDefaultShell(
      platform,
      accountShell,
      environment,
      configuredWindowsShell(),
    );
}

export function createDefaultShellLaunchResolver(
  accountShell: string | null | undefined,
  configured: () => WindowsShellConfiguration,
  platform: NodeJS.Platform | string = process.platform,
  environment: Readonly<Record<string, string | undefined>> = process.env,
): () => DefaultShellLaunch {
  return () =>
    resolveDefaultShellLaunch(
      platform,
      accountShell,
      environment,
      configured(),
    );
}

export function resolveDefaultShellLaunch(
  platform: NodeJS.Platform | string,
  accountShell: string | null | undefined,
  environment: Readonly<Record<string, string | undefined>>,
  configured: WindowsShellConfiguration = {},
  exists: (candidate: string) => boolean = existsSync,
): DefaultShellLaunch {
  if (platform === "win32" && configured.windowsProfiles) {
    const profile = defaultWindowsShellProfile(configured.windowsProfiles);
    if (!profile)
      throw new Error("The configured Windows Default Profile does not exist");
    return withPowerShellIntegration(
      Object.freeze({
        shell: profile.executable,
        arguments: profile.arguments,
        title: profile.name,
      }),
      configured.windowsShellIntegration === true,
    );
  }
  const shell = resolveDefaultShell(
    platform,
    accountShell,
    environment,
    configured.windowsShell,
    exists,
  );
  const launch: DefaultShellLaunch = Object.freeze({
    shell,
    arguments: Object.freeze([]),
    title: defaultShellName(platform, shell),
  });
  return platform === "win32"
    ? withPowerShellIntegration(
        launch,
        configured.windowsShellIntegration === true,
      )
    : launch;
}

export function defaultShellName(platform: string, executable: string): string {
  return platform === "win32"
    ? path.win32.basename(executable)
    : path.posix.basename(executable);
}

// os.userInfo().shell is null on Windows: the operating system has no
// login-shell concept there. The Windows Default Shell is resolved only from
// the standard SystemRoot layouts. ComSpec is deliberately not executable
// authority because it can name an arbitrary inherited path.
export function resolveDefaultShell(
  platform: NodeJS.Platform | string,
  accountShell: string | null | undefined,
  environment: Readonly<Record<string, string | undefined>>,
  configuredWindowsShell?: string,
  exists: (candidate: string) => boolean = existsSync,
): string {
  if (platform !== "win32") {
    if (!accountShell)
      throw new Error("The operating system did not provide a Default Shell");
    return accountShell;
  }
  if (configuredWindowsShell !== undefined) return configuredWindowsShell;
  const configuredSystemRoot = environment["SystemRoot"];
  const systemRoot = isLocalWindowsDriveAbsolutePath(configuredSystemRoot)
    ? path.win32.normalize(configuredSystemRoot)
    : "C:\\Windows";
  const powershell = path.win32.join(
    systemRoot,
    "System32",
    "WindowsPowerShell",
    "v1.0",
    "powershell.exe",
  );
  if (exists(powershell)) return powershell;
  const commandPrompt = path.win32.join(systemRoot, "System32", "cmd.exe");
  if (exists(commandPrompt)) return commandPrompt;
  throw new Error("The operating system did not provide a Default Shell");
}
