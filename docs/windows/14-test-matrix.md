# Test matrix

## Executed on 2026-10-28 and 2026-10-29

Host: Linux x86_64, kernel `7.2.12-1-big`, Node `v24.20.0`, npm `12.0.2`.

| Command                                                                                                                                                   | Result                     | Evidence boundary                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npx vitest run test/unit/windows-shell-discovery.test.ts test/unit/settings-service.test.ts test/unit/settings-dialog.test.ts test/unit/preload.test.ts` | PASS — 57 tests            | Pure discovery, Settings transport/UI and preload validation                                               |
| Focused saved-profile/configuration/default-shell/PTY/Settings/unknown-key suites                                                                         | PASS — 190 tests           | Profile structure, exact locations, literal argv, reload selection, Settings UI and strict schemas         |
| `npx vitest run test/unit --exclude test/unit/linux-appimage-installer.test.ts`                                                                           | PASS — 2,400 tests         | 185 headless files; excludes only the incompatible ARM64 AppImage installer fixture                        |
| `npm run typecheck`                                                                                                                                       | PASS                       | Static TypeScript only                                                                                     |
| `npm run lint`                                                                                                                                            | PASS                       | Static lint only                                                                                           |
| `npm run format:check`                                                                                                                                    | PASS                       | Repository formatting                                                                                      |
| `npm run build`                                                                                                                                           | PASS                       | Unpackaged Linux x64 build; not Windows runtime evidence                                                   |
| `npm test -- test/unit` before the increment                                                                                                              | FAIL — 2,351 pass, 36 fail | All failures are Linux AppImage installer fixture rejection on unsupported Linux x64; not Windows evidence |
| `npm run package:win:x64` after ADR 0038                                                                                                                  | PASS                       | Produced the x64 NSIS installer later executed in the disposable VM                                        |

Native environment: Windows 10 x64 build 19045.5435 in the `Win 10 Turbo`
libvirt VM, protected by snapshot `before-omxterm-adr36-20261028`.

| Native check                                      | Result  | Evidence boundary                                                                                                                              |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact NSIS safe update and installed-app startup  | PASS    | Live app refused; normal four-tab close + Retry updated and started cleanly; SHA-256 `64597ec39f631d56c604cfdb874344b4afce3f2f908aa34295f1138c1b4b0b82` |
| Passive installed-shell suggestions               | PASS    | PowerShell 7, Windows PowerShell, CMD, Git Bash, MSYS2 and Cygwin offered; absent WSL not offered                                              |
| Explicit CMD selection and new-tab launch         | PASS    | Settings reported save; the next tab started `C:\\Windows\\System32\\cmd.exe`                                                                  |
| Restore built-in default and new-tab launch       | PASS    | Clearing the field saved; the next tab started Windows PowerShell 5.1                                                                          |
| Six discovered shells reach an interactive prompt | PASS    | Windows PowerShell, PowerShell 7.6.0, CMD, Git Bash, MSYS2 and Cygwin                                                                          |
| Local CLI output                                  | PASS    | Git 2.56.0, Node 24.22.1, Python 3.13.15 and OpenSSH 9.5p1 version output                                                                      |
| ConPTY Ctrl+C and maximize/reflow smoke           | PASS    | Continuous native `ping` interrupted; active PowerShell screen reflowed after maximizing                                                       |
| Saved profile name and literal arguments          | PASS    | PowerShell 7 tab named `PowerShell 7 Literal Argv`; `-NoLogo`, `-NoExit` and literal `-Command` ran                                            |
| Restore profile-free configuration                | PASS    | Reload plus a future tab returned to the built-in Windows PowerShell 5.1 default                                                               |
| Full native interruption/resize/tool matrix       | PARTIAL | Not run; no broader lifecycle claim is inferred from this focused qualification                                                                |

## Required native matrix

| Environment                  | Architecture | Required scope                                                      | Status                                          |
| ---------------------------- | ------------ | ------------------------------------------------------------------- | ----------------------------------------------- |
| Windows 11 desktop           | x64          | Shell suggestions, ConPTY, UI, full native suites, unpacked package | NOT TESTED                                      |
| Windows 11 desktop           | ARM64        | Same plus ARM64 package                                             | NOT TESTED                                      |
| Supported Windows 10 desktop | x64          | Compatibility subset and shell lifecycle                            | PARTIAL — current increment PASS                |
| Windows 11 + WSL2            | x64          | Generic WSL launch now; distro work only after implementation       | NOT TESTED                                      |
| Windows + PowerShell 5.1/7   | x64/ARM64    | PSReadLine, Unicode, multiline, resize, Ctrl+C                      | PARTIAL — x64 startup/resize/Ctrl+C PASS        |
| Disposable Windows VM        | x64          | Exact NSIS install/update/uninstall with opt-in                     | PARTIAL — safe update PASS; uninstall not rerun |
| Linux ARM64 desktop          | ARM64        | `check:portable` regression                                         | NOT TESTED                                      |
| macOS ARM64 desktop          | ARM64        | `check:portable` and native regression                              | NOT TESTED                                      |

The exact installer was executed under the repository's disposable-VM policy,
but the complete `check:win` automation was not run inside the guest. The
manual focused result must not be promoted to a complete native-suite PASS.
