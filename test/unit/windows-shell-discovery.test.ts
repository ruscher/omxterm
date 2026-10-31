import { describe, expect, it, vi } from "vitest";
import { discoverWindowsShells } from "../../src/main/windows-shell-discovery";

const file = { isFile: () => true } as never;
const directory = { isFile: () => false } as never;

describe("Windows shell discovery", () => {
  it("finds supported shells only at fixed installation locations", async () => {
    const available = new Set([
      "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      "C:\\Windows\\System32\\cmd.exe",
      "C:\\Windows\\System32\\wsl.exe",
      "C:\\Program Files\\Git\\bin\\bash.exe",
      "C:\\msys64\\usr\\bin\\bash.exe",
      "C:\\cygwin64\\bin\\bash.exe",
    ]);
    const inspect = vi.fn(async (candidate: string) =>
      available.has(candidate) ? file : directory,
    );

    await expect(
      discoverWindowsShells({
        environment: {
          SystemRoot: "C:\\Windows",
          SystemDrive: "C:",
          ProgramFiles: "C:\\Program Files",
          ProgramW6432: "C:\\Program Files",
          ComSpec: "C:\\untrusted\\command-processor.exe",
          PATH: "C:\\untrusted\\bin",
        },
        inspect: inspect as never,
      }),
    ).resolves.toEqual([
      {
        kind: "powershell-core",
        executable: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      },
      {
        kind: "windows-powershell",
        executable:
          "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      },
      {
        kind: "command-prompt",
        executable: "C:\\Windows\\System32\\cmd.exe",
      },
      {
        kind: "wsl",
        executable: "C:\\Windows\\System32\\wsl.exe",
      },
      {
        kind: "git-bash",
        executable: "C:\\Program Files\\Git\\bin\\bash.exe",
      },
      {
        kind: "msys2",
        executable: "C:\\msys64\\usr\\bin\\bash.exe",
      },
      {
        kind: "cygwin",
        executable: "C:\\cygwin64\\bin\\bash.exe",
      },
    ]);
    expect(inspect.mock.calls.flat().join("\n")).not.toContain("untrusted");
  });

  it("deduplicates roots, ignores inaccessible candidates and never throws", async () => {
    const inspect = vi.fn(async (candidate: string) => {
      if (candidate.endsWith("pwsh.exe")) throw new Error("EACCES");
      return candidate.endsWith("cmd.exe") ? file : directory;
    });
    const result = await discoverWindowsShells({
      environment: {
        SystemRoot: "C:\\WINDOWS",
        SystemDrive: "C:\\",
        ProgramFiles: "C:\\Program Files",
        ProgramW6432: "c:\\program files\\",
        ComSpec: "C:\\WINDOWS\\System32\\cmd.exe",
      },
      inspect: inspect as never,
    });

    expect(result).toEqual([
      {
        kind: "command-prompt",
        executable: "C:\\WINDOWS\\System32\\cmd.exe",
      },
    ]);
    expect(
      inspect.mock.calls.filter(([candidate]) =>
        String(candidate).endsWith("PowerShell\\7\\pwsh.exe"),
      ),
    ).toHaveLength(1);
  });

  it("refuses relative, network, device and malformed environment paths", async () => {
    const inspect = vi.fn(async () => file);
    const result = await discoverWindowsShells({
      environment: {
        SystemRoot: "\\\\server\\share\\Windows",
        SystemDrive: "relative",
        ProgramFiles: `C:\\${"x".repeat(32_768)}`,
        ProgramW6432: "\\\\?\\C:\\Program Files",
        "ProgramFiles(x86)": "C:\\bad\0root",
        ComSpec: "C:\\ignored\\cmd.exe",
      },
      inspect: inspect as never,
    });
    expect(result).toEqual([]);
    expect(inspect).not.toHaveBeenCalled();
  });

  it("rejects invalid Win32 root characters before inspecting candidates", async () => {
    const inspect = vi.fn(async () => file);
    const result = await discoverWindowsShells({
      environment: {
        SystemRoot: "C:\\Windows|other",
        SystemDrive: "C::",
        ProgramFiles: "C:\\Program Files?",
        ProgramW6432: "C:\\Program Files. ",
        "ProgramFiles(x86)": "\\Windows",
      },
      inspect: inspect as never,
    });
    expect(result).toEqual([]);
    expect(inspect).not.toHaveBeenCalled();
  });
});
