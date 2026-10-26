# 04: Quality assurance

Real commands and results from this round. Each result names its platform and
whether it is graphical or headless. Older results are labelled as such and
are not reused as evidence for code that changed later.

## Upstream v0.22.0 Linux x64 AppImage native smoke (#223)

### GNOME: completed

- **Hardware:** physical laptop, Intel HD 630 + NVIDIA GTX 1050 Ti Mobile.
- **System:** BigCommunity (Arch-based), glibc 2.44, GNOME Shell 50.4 Wayland session.

| Step           | Command / method                                                                                                                                                       | Result                                                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Download       | `curl -sSfL` of the four release files                                                                                                                                 | OK                                                                                                                                                                                                                        |
| Checksums      | `sha256sum --check OMXTerm-0.22.0-x64.AppImage.sha256` and `… linux_install.sh.sha256`                                                                                 | OK, OK                                                                                                                                                                                                                    |
| Launch         | `./OMXTerm-0.22.0-x64.AppImage` with a temporary empty `XDG_CONFIG_HOME`/`XDG_STATE_HOME`, started in the user's session through `systemd-run --user --scope` from SSH | Direct FUSE mount. Relaunched with `--ozone-platform=x11`. Window `user@host:~` with a visible prompt (portal screenshot). Log: `configuration.validated`, `application.started`, `window.opened`, `pty.control started`. |
| Resize         | `xdotool windowsize`                                                                                                                                                   | 960×640 → 1100×700, window intact (screenshot)                                                                                                                                                                            |
| Type a command | `xdotool type` (XTest)                                                                                                                                                 | **Not exercised.** GNOME raised the _Remote desktop → Allow remote interaction_ portal prompt; nothing was typed.                                                                                                         |
| Quit           | `wmctrl -c` (`_NET_CLOSE_WINDOW`)                                                                                                                                      | Clean exit, FUSE mount removed, no new core dump. Log: `close-requested`, `pty.exit`, `window.closed`.                                                                                                                    |
| Helper install | —                                                                                                                                                                      | Not exercised                                                                                                                                                                                                             |

The only stderr output was a Fontconfig warning about cache files written by a
newer Fontconfig (0x2012003).

### KDE: not counted

BigLinux, KDE Plasma 6.7.4 Wayland, physical machine with an AMD RX 9060 XT.
AppImageLauncher (binfmt) intercepted the AppImage, so this was not a default
launch. The run was stopped and left no process, mount or menu integration.

### KDE VM: not run

The VM (KVM, virtio GPU without 3D) had no graphical session at the time.

## Teardown reproduction (evidence added to #683)

| Environment                                                            | Action                        | Result                                               |
| ---------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| GNOME 50.4, fork build (Electron 43.7.7) run as a systemd user unit    | `systemctl --user stop`       | `code=dumped, status=5/TRAP`                         |
| Same                                                                   | TERM to the main process only | Clean exit, no new core dump                         |
| Fedora container + Xvfb, minimal Electron 43.7.7 app (no OMXTerm code) | `kill -TERM -<pgid>`          | exit 133, `GPU process isn't usable. Goodbye.` (4/4) |
| Same, with `process.on('SIGTERM')`                                     | same                          | Handler never ran; same abort                        |
| Same, exiting on `child-process-gone`                                  | same                          | 1/8 clean; races                                     |
| Same, with `--disable-gpu-process-crash-limit`                         | same                          | exit 0 (3/3); not adopted (removes GPU fallback)     |

## GNOME compatibility checks on fork builds (fork only, not upstream evidence)

- **GNOME-style launch** (desktop entry, transient scope): relaunches onto XWayland; all processes run with `--ozone-platform=x11`. The window class `omxterm` matches `StartupWMClass`, and the icon groups in the dash.
- **"Missing" title bar:** it was the user's `window.autoHideTitleBar: true` (set during use, 17:44); the documented default is `false`.

## Fork release 0.22.2 (fork only)

- **Local:** `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build` passed; `npx vitest run test/unit` 222 files / 2570 tests passed.
- **Local packaging:** `npm run package-built:linux`. The RPM installed on Fedora and `scripts/ci-installed-smoke.sh 0.22.2 omxterm` passed under Xvfb.
- **CI** [run 40252168957](https://github.com/ruscher/omxterm/actions/runs/40252168957) (PR #15): 24/24 jobs passed.
  - Packages for macOS, Windows and Linux on x64 and ARM64.
  - Install smoke on Ubuntu 24.04, Debian 12, Fedora x64/arm64, openSUSE and Ubuntu 22.04 (AppImage x64/arm64): each reported `OMXTerm 0.22.2` and started a session.
  - Both PKGBUILDs installed as `1:0.22.2-1` and started.
- **macOS and Windows:** static package verification only; no startup claim.

## Platform coverage statement

| Sistema | Arquitetura | Verificação nesta rodada                                                                               |
| ------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| Linux   | x86_64      | Native graphical on GNOME (upstream AppImage). Fork packages headless under Xvfb in CI and containers. |
| Linux   | ARM64       | Fork packages: CI build, install and Xvfb smoke only                                                   |
| Windows | x64, ARM64  | Fork packages: CI build and static verification only                                                   |
| macOS   | ARM64, x64  | Fork packages: CI build and static verification only                                                   |
