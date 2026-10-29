import { describe, expect, it } from "vitest";
import {
  isLocalWindowsDriveAbsolutePath,
  isWindowsShellSuggestion,
  isWindowsShellSuggestions,
} from "../../src/shared/windows-shells";

describe("Windows shell suggestion contract", () => {
  it.each(["C:\\Program Files\\PowerShell\\7\\pwsh.exe", "d:/tools/bash.exe"])(
    "accepts bounded local drive-absolute paths: %s",
    (candidate) => {
      expect(isLocalWindowsDriveAbsolutePath(candidate)).toBe(true);
    },
  );

  it.each([
    "pwsh.exe",
    "\\Windows\\System32\\cmd.exe",
    "C:relative\\pwsh.exe",
    "\\\\server\\share\\pwsh.exe",
    "\\\\?\\C:\\pwsh.exe",
    "C:\\bad|name\\pwsh.exe",
    "C:\\trailing. \\pwsh.exe",
    `C:\\${"x".repeat(32_768)}`,
  ])("rejects non-local or malformed paths: %s", (candidate) => {
    expect(isLocalWindowsDriveAbsolutePath(candidate)).toBe(false);
  });

  it("requires the exact bounded suggestion shape", () => {
    expect(
      isWindowsShellSuggestion({
        kind: "powershell-core",
        executable: "C:\\PowerShell\\pwsh.exe",
      }),
    ).toBe(true);
    expect(
      isWindowsShellSuggestion({
        kind: "powershell-core",
        executable: "pwsh.exe",
      }),
    ).toBe(false);
    expect(
      isWindowsShellSuggestion({
        kind: "other",
        executable: "C:\\Shell\\shell.exe",
      }),
    ).toBe(false);
    expect(
      isWindowsShellSuggestion({
        kind: "wsl",
        executable: "C:\\Windows\\System32\\wsl.exe",
        arguments: ["--distribution", "Ubuntu"],
      }),
    ).toBe(false);
  });

  it("accepts no more than sixteen suggestions", () => {
    const suggestion = {
      kind: "powershell-core" as const,
      executable: "C:\\PowerShell\\pwsh.exe",
    };
    expect(isWindowsShellSuggestions(Array(16).fill(suggestion))).toBe(true);
    expect(isWindowsShellSuggestions(Array(17).fill(suggestion))).toBe(false);
  });
});
