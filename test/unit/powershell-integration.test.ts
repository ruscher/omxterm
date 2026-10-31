import { describe, expect, it } from "vitest";
import {
  isPowerShellExecutable,
  withPowerShellIntegration,
} from "../../src/main/powershell-integration";

const pwsh = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
const launch = { shell: pwsh, arguments: [], title: "PowerShell 7" };

function script(args: readonly string[]): string {
  return Buffer.from(args.at(-1)!, "base64").toString("utf16le");
}

describe("PowerShell integration", () => {
  it("recognizes only PowerShell executables", () => {
    expect(isPowerShellExecutable(pwsh)).toBe(true);
    expect(
      isPowerShellExecutable(
        "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\POWERSHELL.EXE",
      ),
    ).toBe(true);
    expect(isPowerShellExecutable("C:\\Windows\\System32\\cmd.exe")).toBe(
      false,
    );
    expect(isPowerShellExecutable("C:\\tools\\mypwsh.exe")).toBe(false);
  });

  it("adds an inline prompt wrapper and keeps the session interactive", () => {
    const result = withPowerShellIntegration(launch, true);
    expect(result.arguments.slice(0, 3)).toEqual([
      "-NoLogo",
      "-NoExit",
      "-EncodedCommand",
    ]);
    const source = script(result.arguments);
    expect(source).toContain("]7;file://localhost/");
    expect(source).toContain("& $global:__omxtermPrompt");
    expect(source).toContain("[uri]::EscapeDataString");
    expect(source).not.toMatch(/ExecutionPolicy|Invoke-Expression|\.ps1/u);
    expect(result.title).toBe("PowerShell 7");
  });

  it("leaves everything alone when disabled or given other work", () => {
    expect(withPowerShellIntegration(launch, false)).toBe(launch);
    const profile = { ...launch, arguments: ["-NoLogo"] };
    expect(withPowerShellIntegration(profile, true)).toBe(profile);
    const cmd = {
      shell: "C:\\Windows\\System32\\cmd.exe",
      arguments: [],
      title: "CMD",
    };
    expect(withPowerShellIntegration(cmd, true)).toBe(cmd);
  });
});
