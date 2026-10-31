# Windows status

This page records what OMXTerm does on Windows today and what was verified on a
real Windows machine. It is a tracking document; the application never reads it.
User-facing behavior is described in [configuration](../configuration.md) and
[the specification](../spec.md), and decisions in ADRs 0040–0046.

Statuses: **PASS** (verified natively), **PARTIAL** (works with a stated gap),
**NOT TESTED** (no native evidence), **ABSENT** (not implemented).

## Feature parity

| Feature                                  | Linux | macOS      | Windows     | Windows evidence or gap                                                                                    |
| ---------------------------------------- | ----- | ---------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| ConPTY sessions, resize, Ctrl+C          | —     | —          | PASS        | Windows 10 and 11 x64; bundled `conpty.dll`/`OpenConsole.exe`                                              |
| Unicode, emoji, CJK, Hangul, SGR, 24-bit | PASS  | NOT TESTED | PASS        | Hangul needed a Malgun Gothic fallback (fixed)                                                             |
| Tabs, splits, broadcast                  | PASS  | NOT TESTED | PASS        | Split inherits the PowerShell folder through OSC 7                                                         |
| Installed shells offered in Preferences  | —     | —          | PASS        | PowerShell 7, Windows PowerShell, CMD, Git Bash, MSYS2, Cygwin; never executed during discovery            |
| New tab with any shell or WSL distro     | —     | —          | PASS        | Toolbar tab menu; one entry per `wsl --list` distribution; renderer sends only an opaque id                |
| Saved profiles with literal arguments    | —     | —          | PASS        | `windowsProfiles` in config.json; no graphical profile editor yet                                          |
| Files panel follows the shell            | PASS  | NOT TESTED | PASS        | PowerShell reports its location through OSC 7 (`windowsShellIntegration`); other shells must emit OSC 7    |
| Paths quoted for the pane's shell        | PASS  | PASS       | PASS (unit) | PowerShell, CMD, POSIX shells and WSL (`wslpath`); native drag-and-drop not exercised                      |
| SSH Quick Connect, host key prompt       | PASS  | NOT TESTED | PASS        | Windows OpenSSH 9.5p2 against a Linux container                                                            |
| SFTP in the Files panel                  | PASS  | NOT TESTED | PASS        | Remote listing over the same OpenSSH client                                                                |
| Stored SSH passwords                     | PASS  | NOT TESTED | ABSENT      | Askpass broker uses a Unix socket; Windows keeps ssh's own prompt. A native broker is feasible (see below) |
| SSH connection reuse (ControlMaster)     | PASS  | PASS       | ABSENT      | Windows OpenSSH has no ControlMaster; each pane opens its own connection                                   |
| Interface language                       | PASS  | PASS       | PASS        | `system`, `en-US`, `pt-BR`; main resolves it for every window                                              |
| NSIS install, start and uninstall        | —     | —          | PASS        | Exact-installer verification on Windows 11 x64                                                             |
| Installer refuses to kill live terminals | —     | —          | PARTIAL     | Include tracked and pinned; refusal dialog not re-exercised in this round                                  |
| Windows ARM64                            | —     | —          | NOT TESTED  | No ARM64 hardware or VM available                                                                          |

## Verification on 2026-10-31

Branch `fix/reintegrate-main`, OMXTerm 0.22.2, Node 24.22, Electron 43.8.1.

| Environment                                 | Command or check                                                                                                               | Result                                                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Linux x64 host                              | `npx vitest run test/unit`                                                                                                     | PASS — 228 files, 2651 tests                                                                                         |
| Linux x64 host                              | `npm run typecheck`, `npm run lint`, `prettier --check .`                                                                      | PASS                                                                                                                 |
| Windows 11 Enterprise 26300 x64 (VM)        | `npm ci`, `tsc --noEmit`                                                                                                       | PASS                                                                                                                 |
| Windows 11 x64 (VM)                         | `npx vitest run test/unit`                                                                                                     | PASS — 226 files, 2589 tests, 62 skipped as Unix-only                                                                |
| Windows 11 x64 (VM)                         | `npm run package:win`                                                                                                          | PASS — `OMXTerm-0.22.2-x64.exe`                                                                                      |
| Windows 11 x64 (VM)                         | `npm run package:verify -- --disposable-vm-allow-omxterm-replacement`                                                          | PASS — install, start, uninstall                                                                                     |
| Windows 11 x64 (VM), installed app, by hand | Rendering, Preferences, tab menu, WSL Ubuntu, PowerShell 7, SSH, SFTP, Files panel following `cd`, split inheriting the folder | PASS                                                                                                                 |
| Windows 10 Pro 22H2 x64 (VM)                | `npm ci`, `tsc --noEmit`, `npx vitest run test/unit`, `npm run package:win`                                                    | PASS — 226 files, 2589 tests, 62 skipped as Unix-only                                                                |
| Windows 10 Pro 22H2 x64 (VM)                | Exact NSIS verification                                                                                                        | NOT RUN — the verifier refused the VM's pre-existing 0.21.1 installer cache, as designed; a clean snapshot is needed |
| Windows 10 Pro 22H2 x64 (VM)                | Silent upgrade 0.21.1 → 0.22.2, then start                                                                                     | PASS — config.json byte-identical, app starts, shell menu lists six shells and no WSL                                |

## Known limitations

- On Windows 10, an OMXTerm started by the scripted upgrade disappeared shortly
  after launch once; it was not reproduced, and a later launch stayed up. Cause
  unknown.

- PowerShell started with folder reporting shows no startup banner (`-NoLogo`).
  Set `windowsShellIntegration` to `false` for an untouched PowerShell.
- Windows panes always count as Busy because ConPTY hides the foreground
  process, so the Files panel never types `cd` into a Windows pane by itself.
- WSL needs nested virtualization inside a VM; the test VM printed a warning but
  still ran Ubuntu 26.04.
- CMD, Git Bash, MSYS2 and Cygwin do not report their folder unless their prompt
  emits OSC 7.
- No code signing: installers trigger SmartScreen. Signing belongs to the
  maintainer release workflow.

## Next steps (not implemented)

- A Windows askpass broker over a named pipe. A spike confirmed that Windows
  OpenSSH 9.5 honors `SSH_ASKPASS_REQUIRE=force` with a `.cmd` launcher that runs
  Electron as Node, so stored passwords can work without new dependencies.
- A graphical editor for `windowsProfiles`.
- Native drag-and-drop and Explorer "Open in OMXTerm" checks.
