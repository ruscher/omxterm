import path from "node:path";
import type { UserConfiguration } from "../shared/user-configuration";
import {
  isWindowsShellProfileArguments,
  isWindowsShellProfileId,
  isWindowsShellProfileName,
  MAX_WINDOWS_SHELL_PROFILES,
  type WindowsShellProfile,
  type WindowsShellProfiles,
} from "../shared/windows-shell-profiles";
import { isLocalWindowsDriveAbsolutePath } from "../shared/windows-shells";
import { UserConfigurationError } from "./user-configuration-error";

export interface ConfiguredWindowsShellTarget {
  readonly executable: string;
  readonly location: string;
}

export function validateWindowsShell(
  value: unknown,
  configurationPath: string,
  platform: string,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length === 0 || value.includes("\0"))
    fail(
      configurationPath,
      "windowsShell",
      "must be a non-empty string without a NUL character",
    );
  if (platform === "win32" && !path.win32.isAbsolute(value))
    fail(
      configurationPath,
      "windowsShell",
      "must be an absolute Windows filesystem path",
    );
  return value;
}

export function windowsShellProperty(windowsShell: string | undefined): {
  readonly windowsShell?: string;
} {
  return windowsShell === undefined ? {} : { windowsShell };
}

export function windowsProfilesProperty(
  windowsProfiles: WindowsShellProfiles | undefined,
): { readonly windowsProfiles?: WindowsShellProfiles } {
  return windowsProfiles === undefined ? {} : { windowsProfiles };
}

export function validateWindowsProfiles(
  value: unknown,
  configurationPath: string,
): WindowsShellProfiles | undefined {
  if (value === undefined) return undefined;
  const collection = requireObject(value, configurationPath, "windowsProfiles");
  rejectUnknownKeys(collection, configurationPath, "windowsProfiles", [
    "default",
    "profiles",
  ]);
  if (!isWindowsShellProfileId(collection.default))
    fail(
      configurationPath,
      "windowsProfiles.default",
      "must be a lowercase profile id of at most 64 ASCII characters",
    );
  if (
    !Array.isArray(collection.profiles) ||
    collection.profiles.length === 0 ||
    collection.profiles.length > MAX_WINDOWS_SHELL_PROFILES
  )
    fail(
      configurationPath,
      "windowsProfiles.profiles",
      `must contain between 1 and ${MAX_WINDOWS_SHELL_PROFILES} profiles`,
    );

  const ids = new Set<string>();
  const profiles: WindowsShellProfile[] = [];
  for (const [index, rawProfile] of collection.profiles.entries()) {
    const location = `windowsProfiles.profiles[${index}]`;
    const profile = requireObject(rawProfile, configurationPath, location);
    rejectUnknownKeys(profile, configurationPath, location, [
      "id",
      "name",
      "executable",
      "arguments",
    ]);
    if (!isWindowsShellProfileId(profile.id))
      fail(
        configurationPath,
        `${location}.id`,
        "must be a lowercase profile id of at most 64 ASCII characters",
      );
    if (ids.has(profile.id))
      fail(configurationPath, `${location}.id`, "must be unique");
    ids.add(profile.id);
    if (!isWindowsShellProfileName(profile.name))
      fail(
        configurationPath,
        `${location}.name`,
        "must be a trimmed printable name of at most 128 characters",
      );
    if (!isLocalWindowsDriveAbsolutePath(profile.executable))
      fail(
        configurationPath,
        `${location}.executable`,
        "must be a bounded local drive-absolute Windows filesystem path",
      );
    const arguments_ = profile.arguments ?? [];
    if (!isWindowsShellProfileArguments(arguments_))
      fail(
        configurationPath,
        `${location}.arguments`,
        "must be a bounded array of literal strings without NUL characters",
      );
    profiles.push(
      Object.freeze({
        id: profile.id,
        name: profile.name,
        executable: profile.executable,
        arguments: Object.freeze([...arguments_]),
      }),
    );
  }
  if (!ids.has(collection.default))
    fail(
      configurationPath,
      "windowsProfiles.default",
      "must name one of windowsProfiles.profiles",
    );
  return Object.freeze({
    default: collection.default,
    profiles: Object.freeze(profiles),
  });
}

export function assertWindowsShellConfigurationExclusive(
  windowsShell: string | undefined,
  windowsProfiles: WindowsShellProfiles | undefined,
  configurationPath: string,
): void {
  if (windowsShell !== undefined && windowsProfiles !== undefined)
    fail(
      configurationPath,
      "windowsProfiles",
      "cannot be combined with windowsShell",
    );
}

export function configuredWindowsShellTargets(
  configuration: UserConfiguration,
): readonly ConfiguredWindowsShellTarget[] {
  if (configuration.windowsProfiles)
    return configuration.windowsProfiles.profiles.map((profile, index) => ({
      executable: profile.executable,
      location: `windowsProfiles.profiles[${index}].executable`,
    }));
  return configuration.windowsShell
    ? [{ executable: configuration.windowsShell, location: "windowsShell" }]
    : [];
}

function requireObject(
  value: unknown,
  configurationPath: string,
  location: string,
): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    fail(configurationPath, location, "must be an object");
  return value as Record<string, unknown>;
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  configurationPath: string,
  location: string,
  allowed: readonly string[],
): void {
  const unknown = Object.keys(value).find((key) => !allowed.includes(key));
  if (unknown !== undefined)
    fail(configurationPath, `${location}.${unknown}`, "is unknown");
}

function fail(
  configurationPath: string,
  location: string,
  reason: string,
): never {
  throw new UserConfigurationError(configurationPath, location, reason);
}
