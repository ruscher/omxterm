export const WINDOWS_SHELL_KINDS = [
  "powershell-core",
  "windows-powershell",
  "command-prompt",
  "wsl",
  "git-bash",
  "msys2",
  "cygwin",
] as const;

export const MAX_WINDOWS_SHELL_SUGGESTIONS = 16;

export type WindowsShellKind = (typeof WINDOWS_SHELL_KINDS)[number];

export interface WindowsShellSuggestion {
  readonly kind: WindowsShellKind;
  readonly executable: string;
}

export function isLocalWindowsDriveAbsolutePath(
  value: unknown,
): value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 32_767 ||
    !/^[a-z]:[\\/]/iu.test(value)
  )
    return false;
  const pathWithoutDrive = value.slice(2);
  if (/[\u0000-\u001f"<>|?*:]/u.test(pathWithoutDrive)) return false;
  return !pathWithoutDrive
    .split(/[\\/]/u)
    .some((segment) => segment.length > 0 && /[ .]$/u.test(segment));
}

export function isWindowsShellSuggestion(
  value: unknown,
): value is WindowsShellSuggestion {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const suggestion = value as Record<string, unknown>;
  return (
    Object.keys(suggestion).length === 2 &&
    WINDOWS_SHELL_KINDS.includes(suggestion.kind as WindowsShellKind) &&
    isLocalWindowsDriveAbsolutePath(suggestion.executable)
  );
}

export function isWindowsShellSuggestions(
  value: unknown,
): value is readonly WindowsShellSuggestion[] {
  return (
    Array.isArray(value) &&
    value.length <= MAX_WINDOWS_SHELL_SUGGESTIONS &&
    value.every(isWindowsShellSuggestion)
  );
}
