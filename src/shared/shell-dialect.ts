// How a pane's shell reads a typed path. Windows hosts several incompatible
// command languages behind one platform; POSIX systems need only one.
export const SHELL_DIALECTS = ["posix", "powershell", "cmd", "wsl"] as const;
export type ShellDialect = (typeof SHELL_DIALECTS)[number];

export function isShellDialect(value: unknown): value is ShellDialect {
  return (
    typeof value === "string" &&
    (SHELL_DIALECTS as readonly string[]).includes(value)
  );
}

export function platformShellDialect(platform: string): ShellDialect {
  return platform === "win32" ? "powershell" : "posix";
}

// Decided from the executable path alone; nothing is run. An unknown Windows
// program keeps the PowerShell quoting that was always used there.
export function shellDialectOf(
  executable: string,
  platform: string,
): ShellDialect {
  if (platform !== "win32") return "posix";
  const parts = executable.toLowerCase().split(/[\\/]/u);
  const name = parts.at(-1)?.replace(/\.(?:exe|cmd|bat)$/u, "") ?? "";
  if (name === "cmd") return "cmd";
  if (name === "pwsh" || name === "powershell") return "powershell";
  // System32\bash.exe is the WSL launcher, unlike the bash of Git or MSYS2.
  if (
    name === "wsl" ||
    name === "wslhost" ||
    (name === "bash" && parts.at(-2) === "system32")
  )
    return "wsl";
  if (["bash", "sh", "zsh", "fish", "dash", "ssh"].includes(name))
    return "posix";
  return "powershell";
}

function singleQuoted(filePath: string): string {
  return `'${filePath.replaceAll("'", `'\\''`)}'`;
}

// Quotes a path as one literal argument for the shell that will read it.
export function quotePathForDialect(
  filePath: string,
  dialect: ShellDialect,
): string {
  switch (dialect) {
    case "powershell":
      return `'${filePath.replace(/['‘-‛]/gu, "$&$&")}'`;
    case "cmd":
      return `"${filePath}"`;
    case "wsl":
      // The distribution's own wslpath honors its automount configuration
      // when the line runs, so no drive mapping is assumed here.
      return `"$(wslpath -a ${singleQuoted(filePath)})"`;
    case "posix":
      return singleQuoted(filePath);
  }
}

// The command that changes the shell's directory, typed for the user.
export function changeDirectoryForDialect(
  filePath: string,
  dialect: ShellDialect,
): string {
  const quoted = quotePathForDialect(filePath, dialect);
  if (dialect === "powershell") return `Set-Location -LiteralPath ${quoted}`;
  return dialect === "cmd" ? `cd /d ${quoted}` : `cd -- ${quoted}`;
}
