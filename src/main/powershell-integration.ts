import path from "node:path";
import type { DefaultShellLaunch } from "./default-shell";

// PowerShell keeps its location apart from the process's working directory, so
// nothing outside the shell can read it. This wraps the prompt, after the user's
// profile has set one, to report the folder through OSC 7. It runs inline, so no
// script file or execution policy is involved.
const REPORT_LOCATION = `
$global:__omxtermPrompt = $function:prompt
function global:prompt {
  $location = $executionContext.SessionState.Path.CurrentLocation
  if ($location.Provider.Name -eq 'FileSystem' -and $location.ProviderPath -match '^[A-Za-z]:') {
    $parts = ($location.ProviderPath -replace '\\\\', '/') -split '/' | ForEach-Object { [uri]::EscapeDataString($_) }
    [Console]::Write("$([char]27)]7;file://localhost/$($parts -join '/')$([char]27)\\")
  }
  & $global:__omxtermPrompt
}
`;

export function isPowerShellExecutable(executable: string): boolean {
  return /^(?:pwsh|powershell)\.exe$/iu.test(path.win32.basename(executable));
}

// Only a PowerShell started without arguments is changed: arguments a user wrote
// in a profile stay exactly what runs.
export function withPowerShellIntegration(
  launch: DefaultShellLaunch,
  enabled: boolean,
): DefaultShellLaunch {
  if (
    !enabled ||
    launch.arguments.length > 0 ||
    !isPowerShellExecutable(launch.shell)
  )
    return launch;
  return Object.freeze({
    ...launch,
    arguments: Object.freeze([
      "-NoLogo",
      "-NoExit",
      "-EncodedCommand",
      Buffer.from(REPORT_LOCATION, "utf16le").toString("base64"),
    ]),
  });
}
