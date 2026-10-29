import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_USER_CONFIGURATION,
  loadUserConfiguration,
  validateUserConfiguration,
} from "../../src/main/user-configuration";
import {
  DEFAULT_TERMINAL_KEYBINDS,
  terminalDefaultKeybinds,
} from "../../src/shared/terminal-keybinds";

const configPath = "/isolated/config/omxterm/config.json";
const windowsShell = "C:\\Program Files\\Git\\bin\\bash.exe";
const windowsProfiles = {
  default: "powershell-7",
  profiles: [
    {
      id: "powershell-7",
      name: "PowerShell 7",
      executable: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
      arguments: ["-NoLogo", "", "literal value"],
    },
    {
      id: "cmd",
      name: "Command Prompt",
      executable: "C:\\Windows\\System32\\cmd.exe",
    },
  ],
};

const getInstalledFontFamilyMetrics = vi.fn(async () => undefined);

function encodedConfiguration(document: object) {
  return vi.fn(async () =>
    new TextEncoder().encode(JSON.stringify(document)),
  ) as never;
}

describe("windowsShell User Configuration", () => {
  it.each(["darwin", "linux", "win32"])(
    "accepts a structurally valid value on %s",
    (platform) => {
      const configuration = validateUserConfiguration(
        { version: 1, windowsShell },
        configPath,
        new Set(),
        DEFAULT_TERMINAL_KEYBINDS,
        platform,
      );

      expect(configuration.windowsShell).toBe(windowsShell);
    },
  );

  it.each(["darwin", "linux", "win32"])(
    "rejects empty and NUL-containing values on %s",
    (platform) => {
      for (const invalid of ["", "C:\\bad\0shell.exe"]) {
        expect(() =>
          validateUserConfiguration(
            { version: 1, windowsShell: invalid },
            configPath,
            new Set(),
            DEFAULT_TERMINAL_KEYBINDS,
            platform,
          ),
        ).toThrow(expect.objectContaining({ location: "windowsShell" }));
      }
    },
  );

  it("rejects a relative value only on Windows", () => {
    expect(() =>
      validateUserConfiguration(
        { version: 1, windowsShell: ".\\bash.exe" },
        configPath,
        new Set(),
        DEFAULT_TERMINAL_KEYBINDS,
        "win32",
      ),
    ).toThrow(
      expect.objectContaining({
        location: "windowsShell",
        reason: "must be an absolute Windows filesystem path",
      }),
    );
    expect(
      validateUserConfiguration(
        { version: 1, windowsShell: ".\\bash.exe" },
        configPath,
        new Set(),
        DEFAULT_TERMINAL_KEYBINDS,
        "linux",
      ).windowsShell,
    ).toBe(".\\bash.exe");
  });

  it.each(["darwin", "linux"])(
    "loads the value on %s without filesystem inspection, warning, or effect",
    async (platform) => {
      const inspectWindowsShell = vi.fn(async () => {
        throw new Error("must not inspect on POSIX");
      });
      const load = await loadUserConfiguration({
        environment: { XDG_CONFIG_HOME: "/isolated" },
        homeDirectory: "/home/tester",
        platform,
        read: encodedConfiguration({ version: 1, windowsShell }),
        inspectWindowsShell,
        getInstalledFontFamilyMetrics,
      });

      expect(load.fallback).toBeUndefined();
      expect(load.warnings).toBeUndefined();
      expect(load.configuration.windowsShell).toBe(windowsShell);
      expect(inspectWindowsShell).not.toHaveBeenCalled();
    },
  );

  it("uses complete startup defaults for a relative Windows value without inspecting it", async () => {
    const inspectWindowsShell = vi.fn();
    const load = await loadUserConfiguration({
      environment: { XDG_CONFIG_HOME: "C:\\Users\\tester\\.config" },
      homeDirectory: "C:\\Users\\tester",
      platform: "win32",
      read: encodedConfiguration({
        version: 1,
        confirmClose: false,
        windowsShell: ".\\bash.exe",
      }),
      inspectWindowsShell: inspectWindowsShell as never,
      getInstalledFontFamilyMetrics,
    });

    expect(load.configuration).toEqual({
      ...DEFAULT_USER_CONFIGURATION,
      keybinds: terminalDefaultKeybinds("win32"),
    });
    expect(load.fallback).toMatchObject({
      surface: "configuration",
      error: {
        location: "windowsShell",
        reason: "must be an absolute Windows filesystem path",
      },
    });
    expect(inspectWindowsShell).not.toHaveBeenCalled();
  });

  it("keeps the path as written when inspection follows its final target to a regular file", async () => {
    const inspectWindowsShell = vi.fn(async () => ({ isFile: () => true }));
    const load = await loadUserConfiguration({
      environment: { XDG_CONFIG_HOME: "C:\\Users\\tester\\.config" },
      homeDirectory: "C:\\Users\\tester",
      platform: "win32",
      read: encodedConfiguration({ version: 1, windowsShell }),
      inspectWindowsShell: inspectWindowsShell as never,
      getInstalledFontFamilyMetrics,
    });

    expect(load.fallback).toBeUndefined();
    expect(load.configuration.windowsShell).toBe(windowsShell);
    expect(inspectWindowsShell).toHaveBeenCalledExactlyOnceWith(windowsShell);
  });

  it.each([
    [
      "missing or inaccessible",
      vi.fn(async () => Promise.reject(new Error("unavailable"))),
      "the final target could not be inspected",
    ],
    [
      "not a regular file",
      vi.fn(async () => ({ isFile: () => false })),
      "the final target must be an existing regular file",
    ],
  ])(
    "uses complete defaults when the Windows target is %s",
    async (_kind, inspectWindowsShell, reason) => {
      const load = await loadUserConfiguration({
        environment: { XDG_CONFIG_HOME: "C:\\Users\\tester\\.config" },
        homeDirectory: "C:\\Users\\tester",
        platform: "win32",
        read: encodedConfiguration({
          version: 1,
          confirmClose: false,
          windowsShell: "C:\\selected\\shell.exe",
        }),
        inspectWindowsShell: inspectWindowsShell as never,
        getInstalledFontFamilyMetrics,
      });

      expect(load.configuration).toEqual({
        ...DEFAULT_USER_CONFIGURATION,
        keybinds: terminalDefaultKeybinds("win32"),
      });
      expect(load.fallback).toMatchObject({
        surface: "configuration",
        error: { location: "windowsShell", reason },
      });
    },
  );
});

describe("windowsProfiles User Configuration", () => {
  it.each(["darwin", "linux", "win32"])(
    "accepts the same portable structure on %s and defaults omitted arguments",
    (platform) => {
      const configuration = validateUserConfiguration(
        { version: 1, windowsProfiles },
        configPath,
        new Set(),
        DEFAULT_TERMINAL_KEYBINDS,
        platform,
      );

      expect(configuration.windowsProfiles).toEqual({
        ...windowsProfiles,
        profiles: [
          windowsProfiles.profiles[0],
          { ...windowsProfiles.profiles[1], arguments: [] },
        ],
      });
    },
  );

  it("rejects combining profiles with the legacy executable", () => {
    expect(() =>
      validateUserConfiguration(
        { version: 1, windowsShell, windowsProfiles },
        configPath,
        new Set(),
        DEFAULT_TERMINAL_KEYBINDS,
        "win32",
      ),
    ).toThrow(
      expect.objectContaining({
        location: "windowsProfiles",
        reason: "cannot be combined with windowsShell",
      }),
    );
  });

  it.each([
    [
      "missing default",
      { ...windowsProfiles, default: "missing" },
      "windowsProfiles.default",
    ],
    [
      "duplicate id",
      {
        ...windowsProfiles,
        profiles: [windowsProfiles.profiles[0], windowsProfiles.profiles[0]],
      },
      "windowsProfiles.profiles[1].id",
    ],
    [
      "relative executable",
      {
        ...windowsProfiles,
        profiles: [
          { ...windowsProfiles.profiles[0], executable: ".\\pwsh.exe" },
        ],
      },
      "windowsProfiles.profiles[0].executable",
    ],
    [
      "UNC executable",
      {
        ...windowsProfiles,
        profiles: [
          {
            ...windowsProfiles.profiles[0],
            executable: "\\\\server\\share\\pwsh.exe",
          },
        ],
      },
      "windowsProfiles.profiles[0].executable",
    ],
    [
      "NUL argument",
      {
        ...windowsProfiles,
        profiles: [
          { ...windowsProfiles.profiles[0], arguments: ["bad\0argument"] },
        ],
      },
      "windowsProfiles.profiles[0].arguments",
    ],
    [
      "unknown profile key",
      {
        ...windowsProfiles,
        profiles: [{ ...windowsProfiles.profiles[0], commandLine: "pwsh" }],
      },
      "windowsProfiles.profiles[0].commandLine",
    ],
  ])("rejects a profile with %s", (_case, profiles, location) => {
    expect(() =>
      validateUserConfiguration(
        { version: 1, windowsProfiles: profiles },
        configPath,
        new Set(),
        DEFAULT_TERMINAL_KEYBINDS,
        "win32",
      ),
    ).toThrow(expect.objectContaining({ location }));
  });

  it("inspects every final Windows profile target and preserves literal argv", async () => {
    const inspectWindowsShell = vi.fn(async () => ({ isFile: () => true }));
    const load = await loadUserConfiguration({
      environment: { XDG_CONFIG_HOME: "C:\\Users\\tester\\.config" },
      homeDirectory: "C:\\Users\\tester",
      platform: "win32",
      read: encodedConfiguration({ version: 1, windowsProfiles }),
      inspectWindowsShell: inspectWindowsShell as never,
      getInstalledFontFamilyMetrics,
    });

    expect(load.fallback).toBeUndefined();
    expect(load.configuration.windowsProfiles?.profiles[0]?.arguments).toEqual([
      "-NoLogo",
      "",
      "literal value",
    ]);
    expect(inspectWindowsShell).toHaveBeenNthCalledWith(
      1,
      windowsProfiles.profiles[0]!.executable,
    );
    expect(inspectWindowsShell).toHaveBeenNthCalledWith(
      2,
      windowsProfiles.profiles[1]!.executable,
    );
  });

  it("reports the exact profile whose final target is unavailable", async () => {
    const inspectWindowsShell = vi
      .fn()
      .mockResolvedValueOnce({ isFile: () => true })
      .mockRejectedValueOnce(new Error("unavailable"));
    const load = await loadUserConfiguration({
      environment: { XDG_CONFIG_HOME: "C:\\Users\\tester\\.config" },
      homeDirectory: "C:\\Users\\tester",
      platform: "win32",
      read: encodedConfiguration({ version: 1, windowsProfiles }),
      inspectWindowsShell: inspectWindowsShell as never,
      getInstalledFontFamilyMetrics,
    });

    expect(load.configuration).toEqual({
      ...DEFAULT_USER_CONFIGURATION,
      keybinds: terminalDefaultKeybinds("win32"),
    });
    expect(load.fallback).toMatchObject({
      error: {
        location: "windowsProfiles.profiles[1].executable",
        reason: "the final target could not be inspected",
      },
    });
  });

  it.each(["darwin", "linux"])(
    "does not inspect ignored Windows profiles on %s",
    async (platform) => {
      const inspectWindowsShell = vi.fn();
      const load = await loadUserConfiguration({
        environment: { XDG_CONFIG_HOME: "/isolated" },
        homeDirectory: "/home/tester",
        platform,
        read: encodedConfiguration({ version: 1, windowsProfiles }),
        inspectWindowsShell: inspectWindowsShell as never,
        getInstalledFontFamilyMetrics,
      });

      expect(load.fallback).toBeUndefined();
      expect(load.configuration.windowsProfiles).toBeDefined();
      expect(inspectWindowsShell).not.toHaveBeenCalled();
    },
  );
});
