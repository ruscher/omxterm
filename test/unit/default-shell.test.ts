import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createDefaultShellLaunchResolver,
  createDefaultShellResolver,
  resolveDefaultShellLaunch,
  resolveDefaultShell,
} from "../../src/main/default-shell";

const windowsPowerShell = path.win32.join(
  "C:\\WINDOWS",
  "System32",
  "WindowsPowerShell",
  "v1.0",
  "powershell.exe",
);

describe("Default Shell resolution", () => {
  it("uses the account shell on POSIX and refuses a missing one", () => {
    expect(resolveDefaultShell("darwin", "/bin/zsh", {})).toBe("/bin/zsh");
    expect(() => resolveDefaultShell("linux", null, {})).toThrow(
      "The operating system did not provide a Default Shell",
    );
  });

  it.each([
    ["darwin", "/bin/zsh"],
    ["linux", "/bin/bash"],
  ])("ignores a configured Windows shell on %s", (platform, accountShell) => {
    expect(
      resolveDefaultShell(
        platform,
        accountShell,
        {},
        "C:\\Program Files\\Git\\bin\\bash.exe",
      ),
    ).toBe(accountShell);
  });

  it("uses a validated configured Windows shell as written", () => {
    const configured = "C:\\Program Files\\Git\\bin\\bash.exe";
    const exists = vi.fn(() => {
      throw new Error("built-in resolution must not run");
    });

    expect(resolveDefaultShell("win32", null, {}, configured, exists)).toBe(
      configured,
    );
    expect(exists).not.toHaveBeenCalled();
  });

  it("reads the current configured shell for every future resolution", () => {
    let configured = "C:\\initial\\shell.exe";
    const resolveCurrent = createDefaultShellResolver(
      null,
      () => configured,
      "win32",
      {},
    );

    expect(resolveCurrent()).toBe("C:\\initial\\shell.exe");
    configured = "C:\\reloaded\\shell.exe";
    expect(resolveCurrent()).toBe("C:\\reloaded\\shell.exe");
  });

  it("launches the selected Windows profile with literal arguments and title", () => {
    const launch = resolveDefaultShellLaunch(
      "win32",
      null,
      {},
      {
        windowsProfiles: {
          default: "powershell-7",
          profiles: [
            {
              id: "powershell-7",
              name: "PowerShell 7 (No Logo)",
              executable: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
              arguments: ["-NoLogo", "", "literal value"],
            },
          ],
        },
      },
      vi.fn(() => {
        throw new Error("built-in resolution must not run");
      }),
    );

    expect(launch).toEqual({
      shell: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      arguments: ["-NoLogo", "", "literal value"],
      title: "PowerShell 7 (No Logo)",
    });
  });

  it("reads the selected profile for every future launch", () => {
    let selected = "pwsh";
    const profiles = [
      {
        id: "pwsh",
        name: "PowerShell 7",
        executable: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
        arguments: ["-NoLogo"],
      },
      {
        id: "cmd",
        name: "Command Prompt",
        executable: "C:\\Windows\\System32\\cmd.exe",
        arguments: ["/Q"],
      },
    ] as const;
    const resolveCurrent = createDefaultShellLaunchResolver(
      null,
      () => ({ windowsProfiles: { default: selected, profiles } }),
      "win32",
      {},
    );

    expect(resolveCurrent()).toMatchObject({ title: "PowerShell 7" });
    selected = "cmd";
    expect(resolveCurrent()).toEqual({
      shell: "C:\\Windows\\System32\\cmd.exe",
      arguments: ["/Q"],
      title: "Command Prompt",
    });
  });

  it("prefers Windows PowerShell on win32", () => {
    expect(
      resolveDefaultShell(
        "win32",
        null,
        { SystemRoot: "C:\\WINDOWS" },
        undefined,
        (candidate) => candidate === windowsPowerShell,
      ),
    ).toBe(windowsPowerShell);
  });

  it("falls back to the standard Command Prompt and ignores ComSpec", () => {
    const commandPrompt = "C:\\WINDOWS\\System32\\cmd.exe";
    const inspected: string[] = [];
    expect(
      resolveDefaultShell(
        "win32",
        null,
        {
          SystemRoot: "C:\\WINDOWS",
          ComSpec: "D:\\untrusted\\command-processor.exe",
        },
        undefined,
        (candidate) => {
          inspected.push(candidate);
          return candidate === commandPrompt;
        },
      ),
    ).toBe(commandPrompt);
    expect(inspected).toEqual([windowsPowerShell, commandPrompt]);
    expect(inspected).not.toContain("D:\\untrusted\\command-processor.exe");
  });

  it("uses a bounded local fallback root and refuses unavailable defaults", () => {
    const inspected: string[] = [];
    expect(() =>
      resolveDefaultShell(
        "win32",
        null,
        {
          SystemRoot: "\\\\server\\windows",
          ComSpec: "D:\\untrusted\\command-processor.exe",
        },
        undefined,
        (candidate) => {
          inspected.push(candidate);
          return false;
        },
      ),
    ).toThrow("The operating system did not provide a Default Shell");
    expect(inspected).toEqual([
      "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      "C:\\Windows\\System32\\cmd.exe",
    ]);
  });
});
