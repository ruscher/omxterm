# ConPTY and shells

## Implemented

- node-pty owns local session creation and requests `useConptyDll: true` on
  Windows so terminal image payloads survive the packaged path.
- The default resolution order is the selected `windowsProfiles` entry, legacy
  `windowsShell`, Windows PowerShell, then Command Prompt at fixed `SystemRoot`
  layouts. Ambient `ComSpec` is not executable authority.
- Settings now inspects fixed standard locations and suggests existing regular
  files for PowerShell 7, Windows PowerShell, Command Prompt, WSL, Git Bash,
  MSYS2 and Cygwin.
- Suggestions never execute a candidate, search `PATH` or change configuration
  without a user action. Custom absolute paths remain supported.
- Saved profiles carry a display name, validated executable and literal
  argument vector directly to node-pty; reload affects future tabs only.

## Not implemented

- Suggestions do not create profiles. Saved profiles still carry no
  environment, working directory, icon, theme or restore policy.
- Visual Studio developer shells and individual WSL distributions are not
  discovered.
- The app does not prefer PowerShell 7 automatically or change existing users'
  defaults.

## Required native qualification

On both Windows ARM64 and x64, exercise PowerShell 5.1, PowerShell 7, CMD, WSL,
Git Bash, `ssh.exe`, `sftp.exe`, Git, Python and Node for startup, resize,
Unicode, Ctrl+C, unexpected exit and owned-process cleanup. Optional tools such
as winget, Docker, kubectl and Azure CLI are tested only when installed. Results
must record actual versions and must not infer success from compilation.

## Native evidence obtained

On Windows 10 x64 build 19045.5435, the exact NSIS package built for this
increment started Windows PowerShell 5.1 through ConPTY, carried interactive
input/output, created additional tabs, selected and started Command Prompt, and
returned future tabs to Windows PowerShell after clearing the explicit setting.
Settings discovered the installed PowerShell 7, Windows PowerShell, Command
Prompt, Git Bash, MSYS2 and Cygwin executables. Each discovered shell was
selected explicitly and reached its interactive prompt in a new ConPTY tab.
The packaged app also carried Git 2.56.0, Node 24.22.1, Python 3.13.15 and
OpenSSH 9.5p1 version output, interrupted a continuous native `ping` with
Ctrl+C, and reflowed the active PowerShell screen after maximizing the window.
WSL was absent and therefore was not offered. This is a focused PASS, not the
full long-session, unexpected-exit, SFTP or process-cleanup matrix above.

The later ADR 0038 x64 package update also launched a saved PowerShell 7
profile named `PowerShell 7 Literal Argv`. Its literal `-NoLogo`, `-NoExit` and
`-Command` arguments suppressed the logo, printed the expected
`OMXTERM_PROFILE_ARGV_OK` marker and left an interactive prompt. After restoring
a profile-free configuration, a future tab returned to Windows PowerShell 5.1.
