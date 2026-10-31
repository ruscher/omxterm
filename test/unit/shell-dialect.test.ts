import { describe, expect, it } from "vitest";
import {
  changeDirectoryForDialect,
  isShellDialect,
  platformShellDialect,
  quotePathForDialect,
  shellDialectOf,
} from "../../src/shared/shell-dialect";
import { formatFilePathInsertion } from "../../src/shared/file-path-insertion";

describe("shell dialect", () => {
  it.each([
    ["C:\\Windows\\System32\\cmd.exe", "cmd"],
    ["C:\\Program Files\\PowerShell\\7\\pwsh.exe", "powershell"],
    [
      "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      "powershell",
    ],
    ["C:\\Windows\\System32\\wsl.exe", "wsl"],
    ["C:\\Windows\\System32\\bash.exe", "wsl"],
    ["C:\\Program Files\\Git\\bin\\bash.exe", "posix"],
    ["C:\\msys64\\usr\\bin\\bash.exe", "posix"],
    ["C:\\cygwin64\\bin\\bash.exe", "posix"],
    ["C:\\Windows\\System32\\OpenSSH\\ssh.exe", "posix"],
    ["C:\\Tools\\unknown.exe", "powershell"],
  ])("reads %s as %s", (executable, dialect) => {
    expect(shellDialectOf(executable, "win32")).toBe(dialect);
  });

  it("is always POSIX away from Windows", () => {
    expect(shellDialectOf("/bin/cmd", "linux")).toBe("posix");
    expect(platformShellDialect("darwin")).toBe("posix");
    expect(platformShellDialect("win32")).toBe("powershell");
  });

  it("quotes a hostile name as one literal argument in each language", () => {
    const name = "C:\\O'Brien $(x) `y` %z%\\a b";
    expect(quotePathForDialect(name, "powershell")).toBe(
      "'C:\\O''Brien $(x) `y` %z%\\a b'",
    );
    expect(quotePathForDialect(name, "cmd")).toBe(`"${name}"`);
    expect(quotePathForDialect(name, "posix")).toBe(
      "'C:\\O'\\''Brien $(x) `y` %z%\\a b'",
    );
    expect(quotePathForDialect(name, "wsl")).toBe(
      `"$(wslpath -a 'C:\\O'\\''Brien $(x) \`y\` %z%\\a b')"`,
    );
  });

  it("doubles the curly quotes PowerShell treats as quotes", () => {
    expect(quotePathForDialect("C:\\a\u2019b", "powershell")).toBe(
      "'C:\\a\u2019\u2019b'",
    );
  });

  it("changes directory with each shell's own command", () => {
    expect(changeDirectoryForDialect("C:\\a b", "powershell")).toBe(
      "Set-Location -LiteralPath 'C:\\a b'",
    );
    expect(changeDirectoryForDialect("D:\\a b", "cmd")).toBe('cd /d "D:\\a b"');
    expect(changeDirectoryForDialect("/tmp/a b", "posix")).toBe(
      "cd -- '/tmp/a b'",
    );
    expect(changeDirectoryForDialect("C:\\a", "wsl")).toBe(
      `cd -- "$(wslpath -a 'C:\\a')"`,
    );
  });

  it("validates a dialect from the IPC boundary", () => {
    expect(isShellDialect("cmd")).toBe(true);
    expect(isShellDialect("bash")).toBe(false);
    expect(isShellDialect(undefined)).toBe(false);
  });

  it("formats dropped Windows paths for the pane's shell", () => {
    const paths = ["C:\\a b.txt", "D:\\c.txt"];
    expect(formatFilePathInsertion(paths, "win32")).toBe(
      "'C:\\a b.txt' 'D:\\c.txt'",
    );
    expect(formatFilePathInsertion(paths, "win32", "cmd")).toBe(
      '"C:\\a b.txt" "D:\\c.txt"',
    );
  });
});
