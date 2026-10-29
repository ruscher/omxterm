import { describe, expect, it } from "vitest";
import {
  defaultWindowsShellProfile,
  isWindowsShellProfile,
  isWindowsShellProfileArguments,
  isWindowsShellProfiles,
  MAX_WINDOWS_SHELL_PROFILES,
} from "../../src/shared/windows-shell-profiles";

const profile = Object.freeze({
  id: "powershell-7",
  name: "PowerShell 7",
  executable: "C:\\Program Files\\PowerShell\\7\\pwsh.exe",
  arguments: Object.freeze(["-NoLogo", "", "literal value"]),
});

describe("Windows shell profile contract", () => {
  it("accepts a bounded profile and preserves empty literal arguments", () => {
    expect(isWindowsShellProfile(profile)).toBe(true);
    expect(isWindowsShellProfileArguments(profile.arguments)).toBe(true);
  });

  it.each([
    { ...profile, id: "PowerShell" },
    { ...profile, id: "../pwsh" },
    { ...profile, name: " PowerShell" },
    { ...profile, name: "Power\nShell" },
    { ...profile, executable: "\\\\server\\pwsh.exe" },
    { ...profile, executable: ".\\pwsh.exe" },
    { ...profile, arguments: ["bad\0argument"] },
    { ...profile, arguments: Array.from({ length: 33 }, () => "arg") },
    { ...profile, extra: true },
  ])("rejects an invalid profile: %#", (value) => {
    expect(isWindowsShellProfile(value)).toBe(false);
  });

  it("requires unique ids and an existing default", () => {
    expect(
      isWindowsShellProfiles({ default: profile.id, profiles: [profile] }),
    ).toBe(true);
    expect(
      isWindowsShellProfiles({
        default: "missing",
        profiles: [profile],
      }),
    ).toBe(false);
    expect(
      isWindowsShellProfiles({
        default: profile.id,
        profiles: [profile, { ...profile }],
      }),
    ).toBe(false);
  });

  it("bounds the number of profiles", () => {
    const profiles = Array.from(
      { length: MAX_WINDOWS_SHELL_PROFILES },
      (_, i) => ({
        ...profile,
        id: `profile-${i}`,
      }),
    );
    expect(isWindowsShellProfiles({ default: "profile-0", profiles })).toBe(
      true,
    );
    expect(
      isWindowsShellProfiles({
        default: "profile-0",
        profiles: [...profiles, { ...profile, id: "overflow" }],
      }),
    ).toBe(false);
  });

  it("finds the configured default defensively", () => {
    const profiles = {
      default: profile.id,
      profiles: [profile],
    } as const;
    expect(defaultWindowsShellProfile(profiles)).toBe(profile);
  });
});
