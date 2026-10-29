# Project audit

Audit date: 2026-10-28. Checkout: `feat/settings-localization` at the working
tree supplied for this task.

## Evidence summary

- OMXTerm is an Electron/TypeScript terminal with a portable DOM Terminal
  Surface using Restty 0.3.0 and its Ghostty WASM core.
- Local sessions are created in Electron main through `node-pty` 1.1.0. On
  Windows, the adapter requests the packaged ConPTY DLL. Renderer Node
  integration is disabled and context isolation remains enabled.
- Windows ARM64 and x64 NSIS targets exist. The only checked-in Windows CI
  workflow is a manually dispatched Windows Server x64 headless build; its own
  summary explicitly excludes real PTY, GUI, package inspection and NSIS
  execution evidence.
- The product is deliberately small. Its current contract excludes splits,
  graphical profile management, SSH brokering, SFTP, AI assistance and
  persistent sessions.
  SSH can still be run as a normal child CLI program.
- The prompt's hypothesized `ssh-command.ts`, `ssh-config-import.ts`,
  `ssh-known-hosts.ts` and `credential-store.ts` modules are absent from this
  checkout. No change should be based on those hypotheses.

## Windows behavior found

- `default-shell.ts` uses the selected saved Windows profile or an explicitly
  configured legacy `windowsShell`, otherwise Windows PowerShell and then
  Command Prompt from fixed `SystemRoot` layouts. Ambient `ComSpec` is not
  executable authority.
- A configured executable must be an absolute existing regular-file target.
  Saved profile arguments are bounded and passed literally to the PTY.
- ConPTY sessions are conservatively treated as busy because node-pty exposes a
  static console title rather than a trustworthy foreground process name.
- Windows uses an app-drawn frameless title row, native resize/snap behavior,
  optional Acrylic with an opaque fallback, and a native popup application menu.
- Local preview is bounded to static PNG/JPEG. Paths produced by remote shells
  still refer to the local OMXTerm host.

## Baseline executed

`npm test -- test/unit` before this increment produced 2,351 passing tests and
36 failures, all in `linux-appimage-installer.test.ts`. The host is Linux x64,
while that fixture requires a Linux ARM64 ELF AppImage, so the installer rejected
the synthetic x64 input before its intended assertions. This is a baseline
environment incompatibility, not Windows evidence and not a PASS.

The available host is Linux x86_64. A disposable Windows 10 x64 VM was later
qualified against the exact locally built NSIS installer. Windows 11, Windows
ARM64, WSL and macOS qualification remain unavailable; the Windows 10 run does
not establish those environments.

## Priorities

| Priority | Gap                                                                                    | Decision                                                              |
| -------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| P0       | Users must type a Windows shell path even for common installed shells                  | Implement passive, fixed-location suggestions without execution       |
| P0       | Native Windows behavior lacked evidence                                                | Windows 10 x64 current increment qualified; retain other matrix gaps  |
| P1       | Profile launch needs literal arguments without overloading `windowsShell`              | Implemented saved model; graphical manager and WSL discovery remain   |
| P1       | ConPTY shutdown, resize, Unicode and interactive-tool qualification remains incomplete | Run real native suites before changing lifecycle code                 |
| P2       | SSH/SFTP/AI/workspaces conflict with current product scope                             | Require explicit architecture/product decisions before implementation |
