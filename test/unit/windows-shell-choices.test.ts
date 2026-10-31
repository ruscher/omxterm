import { describe, expect, it, vi } from "vitest";
import {
  createWindowsShellChoices,
  parseWslDistributions,
} from "../../src/main/windows-shell-choices";
import { launchTerminalSession } from "../../src/main/session-launch";
import type { LocalTerminalSession } from "../../src/main/local-terminal-session";
import { isTerminalLaunchSpec } from "../../src/shared/terminal-launch";
import { isWindowsShellChoices } from "../../src/shared/windows-shells";

const pwsh = "C:\\Program Files\\PowerShell\\7\\pwsh.exe";
const wsl = "C:\\Windows\\System32\\wsl.exe";

function choices(distributions: readonly string[] | Error = []) {
  return createWindowsShellChoices({
    environment: {},
    profiles: () => ({
      default: "mine",
      profiles: [
        {
          id: "mine",
          name: "My PowerShell",
          executable: pwsh,
          arguments: ["-NoLogo"],
        },
      ],
    }),
    kindLabel: (kind) => `label:${kind}`,
    discover: async () => [
      { kind: "powershell-core", executable: pwsh },
      { kind: "wsl", executable: wsl },
    ],
    listWslDistributions: async () => {
      if (distributions instanceof Error) throw distributions;
      return distributions;
    },
  });
}

describe("Windows shell choices", () => {
  it("offers profiles, installed shells and one entry per distribution", async () => {
    const service = choices(["Ubuntu", "Arch Linux"]);
    const listed = await service.list();
    expect(listed.map(({ id }) => id)).toEqual([
      "profile:mine",
      "installed:powershell-core",
      "wsl:Ubuntu",
      "wsl:Arch Linux",
    ]);
    expect(isWindowsShellChoices(listed)).toBe(true);
    expect(service.resolve("wsl:Arch Linux")).toEqual({
      shell: wsl,
      arguments: ["--distribution", "Arch Linux", "--cd", "~"],
      title: "Arch Linux (WSL)",
    });
    expect(service.resolve("profile:mine")?.arguments).toEqual(["-NoLogo"]);
  });

  it("keeps wsl.exe's own guidance when no distribution is listed", async () => {
    for (const none of [[], new Error("not installed")]) {
      const service = choices(none);
      await service.list();
      expect(service.resolve("installed:wsl")).toEqual({
        shell: wsl,
        arguments: [],
        title: "label:wsl",
      });
    }
  });

  it("resolves nothing it did not just offer", async () => {
    const service = choices();
    expect(service.resolve("installed:powershell-core")).toBeUndefined();
    await service.list();
    expect(service.resolve("wsl:Evil")).toBeUndefined();
    expect(service.resolve("C:\\evil.exe")).toBeUndefined();
  });

  it("refuses a distribution name that could become an option", async () => {
    const service = choices(["--system", "-d", "a;b", "Ubuntu"]);
    expect((await service.list()).map(({ id }) => id)).toContain("wsl:Ubuntu");
    expect(service.resolve("wsl:--system")).toBeUndefined();
    expect(service.resolve("wsl:a;b")).toBeUndefined();
  });

  it("parses wsl's UTF-16 and UTF-8 listings and skips Docker's", () => {
    const names =
      "Ubuntu-24.04\r\ndocker-desktop\r\ndocker-desktop-data\r\nDebian\r\n";
    expect(parseWslDistributions(Buffer.from(names, "utf16le"))).toEqual([
      "Ubuntu-24.04",
      "Debian",
    ]);
    expect(
      parseWslDistributions(
        Buffer.concat([
          Buffer.from([0xff, 0xfe]),
          Buffer.from(names, "utf16le"),
        ]),
      ),
    ).toEqual(["Ubuntu-24.04", "Debian"]);
    expect(parseWslDistributions(Buffer.from(names))).toEqual([
      "Ubuntu-24.04",
      "Debian",
    ]);
    expect(parseWslDistributions(Buffer.alloc(0))).toEqual([]);
  });

  it("validates the launch request at the IPC boundary", () => {
    expect(
      isTerminalLaunchSpec({ kind: "windows-shell", id: "wsl:Ubuntu" }),
    ).toBe(true);
    for (const id of ["C:\\evil.exe", "wsl:a;b", "other:x", "", 7])
      expect(isTerminalLaunchSpec({ kind: "windows-shell", id })).toBe(false);
    expect(
      isTerminalLaunchSpec({
        kind: "windows-shell",
        id: "wsl:Ubuntu",
        executable: "C:\\evil.exe",
      }),
    ).toBe(false);
  });

  it("starts the resolved shell and fails closed for an unknown id", () => {
    const start = vi.fn(() => ({}) as LocalTerminalSession);
    const context = {
      consumeLaunchRequest: () => ({ kind: "default-shell" }) as never,
      savedSessions: {} as never,
      start,
      windowsShell: (id: string) =>
        id === "wsl:Ubuntu"
          ? {
              shell: wsl,
              arguments: ["--distribution", "Ubuntu"],
              title: "Ubuntu (WSL)",
            }
          : undefined,
    };
    const base = {
      shell: pwsh,
      shellArguments: ["-NoLogo"],
      shellTitle: "Default",
    } as never;
    launchTerminalSession(
      { kind: "windows-shell", id: "wsl:Ubuntu" },
      base,
      context,
    );
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({
        shell: wsl,
        shellArguments: ["--distribution", "Ubuntu"],
        shellTitle: "Ubuntu (WSL)",
      }),
    );
    expect(() =>
      launchTerminalSession(
        { kind: "windows-shell", id: "wsl:No" },
        base,
        context,
      ),
    ).toThrow("Unknown Windows shell choice");
  });
});
