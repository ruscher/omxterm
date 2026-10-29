# Known limitations

- Shell suggestions refresh when Settings loads, not while it stays open.
- Suggestions establish file existence only, not executable architecture,
  publisher, ACL safety, successful startup or shell version.
- PowerShell 7 is suggested but never made default automatically.
- Visual Studio developer shells and custom-install locations are not
  discovered; users can enter an absolute custom path.
- WSL is a generic executable suggestion. A saved profile can supply literal
  `--distribution` arguments, but distribution enumeration is absent.
- Saved profiles have no graphical manager, environment, working directory,
  icon, theme or per-profile trust metadata. Legacy `windowsShell` still accepts
  only one executable.
- Dragged paths on Windows use PowerShell quoting even when the selected shell
  is CMD, WSL, Git Bash, MSYS2 or Cygwin.
- NSIS install, update and uninstall require the user to close a running
  OMXTerm normally and choose Retry; the installer deliberately does not offer
  forced close.
- Native qualification covers one Windows 10 x64 VM and a focused shell/
  installer smoke only. Windows 11, ARM64, WSL and the full `check:win`
  lifecycle matrix remain untested.
- SSH management, SFTP, splits, workspaces, AI, broadcast, Quake mode, command
  blocks and session persistence are absent and must not be presented as working.
