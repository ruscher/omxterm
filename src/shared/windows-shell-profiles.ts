import { isLocalWindowsDriveAbsolutePath } from "./windows-shells";

export const MAX_WINDOWS_SHELL_PROFILES = 16;
export const MAX_WINDOWS_SHELL_PROFILE_ARGUMENTS = 32;
export const MAX_WINDOWS_SHELL_PROFILE_ARGUMENT_LENGTH = 8_192;
export const MAX_WINDOWS_SHELL_PROFILE_ARGUMENTS_LENGTH = 32_768;

export interface WindowsShellProfile {
  readonly id: string;
  readonly name: string;
  readonly executable: string;
  readonly arguments: readonly string[];
}

export interface WindowsShellProfiles {
  readonly default: string;
  readonly profiles: readonly WindowsShellProfile[];
}

export function isWindowsShellProfileId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 64 &&
    /^[a-z0-9][a-z0-9._-]*$/u.test(value)
  );
}

export function isWindowsShellProfileName(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    value.trim() === value &&
    !/[\u0000-\u001f\u007f]/u.test(value)
  );
}

export function isWindowsShellProfileArguments(
  value: unknown,
): value is readonly string[] {
  if (
    !Array.isArray(value) ||
    value.length > MAX_WINDOWS_SHELL_PROFILE_ARGUMENTS
  )
    return false;
  let length = 0;
  for (const argument of value) {
    if (
      typeof argument !== "string" ||
      argument.length > MAX_WINDOWS_SHELL_PROFILE_ARGUMENT_LENGTH ||
      argument.includes("\0")
    )
      return false;
    length += argument.length;
    if (length > MAX_WINDOWS_SHELL_PROFILE_ARGUMENTS_LENGTH) return false;
  }
  return true;
}

export function isWindowsShellProfile(
  value: unknown,
): value is WindowsShellProfile {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const profile = value as Record<string, unknown>;
  return (
    Object.keys(profile).length === 4 &&
    isWindowsShellProfileId(profile.id) &&
    isWindowsShellProfileName(profile.name) &&
    isLocalWindowsDriveAbsolutePath(profile.executable) &&
    isWindowsShellProfileArguments(profile.arguments)
  );
}

export function isWindowsShellProfiles(
  value: unknown,
): value is WindowsShellProfiles {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const collection = value as Record<string, unknown>;
  if (
    Object.keys(collection).length !== 2 ||
    !isWindowsShellProfileId(collection.default) ||
    !Array.isArray(collection.profiles) ||
    collection.profiles.length === 0 ||
    collection.profiles.length > MAX_WINDOWS_SHELL_PROFILES ||
    !collection.profiles.every(isWindowsShellProfile)
  )
    return false;
  const ids = new Set<string>();
  for (const profile of collection.profiles) {
    if (ids.has(profile.id)) return false;
    ids.add(profile.id);
  }
  return ids.has(collection.default);
}

export function defaultWindowsShellProfile(
  profiles: WindowsShellProfiles,
): WindowsShellProfile | undefined {
  return profiles.profiles.find((profile) => profile.id === profiles.default);
}
