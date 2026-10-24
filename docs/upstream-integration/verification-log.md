# Verification log

Real results only. Anything not run is listed as not verified.

## Environment (2026-10-23)

- Linux x86_64, KDE Plasma, Wayland session with XWayland rendering (`DISPLAY=:0`).
- Node 24.20.0, `npm ci` against the upstream lockfile.
- x86_64 isn't a supported release target: `node-pty` has no linux-x64
  prebuild, and npm blocks its install script. It was built locally with
  `npx node-gyp rebuild` inside `node_modules/node-pty`, then
  `node scripts/prepare-node-pty-runtime.mjs` was re-run.
- The VS Code extension host exports `ELECTRON_RUN_AS_NODE=1`, which makes
  Electron reject `--no-sandbox`. Graphical suites must run with
  `env -u ELECTRON_RUN_AS_NODE`.

## Baseline on untouched `upstream/main`

- `npm test -- test/unit`: 2113 passed, 36 failed. All 36 failures are in
  `linux-appimage-installer.test.ts`, which requires an ARM64 AppImage.
- `test/integration/failure-acknowledgement.test.ts`: 2 failed, reproduced in
  a clean worktree. The assertion says a native exec failure must not look
  like an ordinary code-1 exit; it comes from the locally built x86_64
  `node-pty`.

## #626 — Scrollback search (`feat/terminal-search`, `a819449`)

| Check                                                                                                                 | Result                       |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `npm run format:check`, `lint`, `typecheck`, `build`, `git diff --check`                                              | pass                         |
| Unit tests without the ARM64 installer suite                                                                          | 162 files, 2110 tests pass   |
| `test/integration/restty-search-core.test.ts`                                                                         | 5 pass                       |
| Host oracle `-t "Scrollback Search"`                                                                                  | pass, about 2.3 s            |
| Oracle negative control (`find()` turned into a no-op)                                                                | fails as expected            |
| `restty-host-integration`, `window-chrome`, `developer-tools`, `initialization-cancellation`, `pending-tab-ownership` | pass                         |
| `failure-acknowledgement`                                                                                             | 2 fail, same as the baseline |

Measured on the real core: searching a full 10 MB-capped history (about 13k
rows of 80 columns) completes in one step of about 11–14 ms. Core "next"
moves to older output above and "previous" to newer output below; Restty
binds `Enter` to "previous".

Visual check: a screenshot of the production host shows the bar in the top
right, themed from the fixture theme.

Not verified: macOS, Linux ARM64, Windows, and the complete
`npm run check:portable` graphical run. Upstream has no GitHub Actions
workflows, so no CI runs on the PR.

## #626 round 2 (`a8d3ae2`, `a25a0e2`, 2026-10-24)

Maintainer decisions: Find on `Ctrl+Shift+F`, full screen on `F11`
(Linux/Windows), `null` disables a shortcut, conflicts stay errors that name
both actions and the key. Review fixes: clipboard actions follow the focused
query field, the counter badge follows the theme, and the focus wording.

| Check                                                                                                           | Result                                                                   |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Static checks and `git diff --check`                                                                            | pass                                                                     |
| Unit tests without the ARM64 installer suite                                                                    | 164 files, 2145 tests pass                                               |
| Core search tests                                                                                               | 5 pass                                                                   |
| Host oracle (clipboard IPC, terminal click, `Enter`/`Escape` to the PTY, counter colors)                        | pass                                                                     |
| Negative controls (no routing, no counter paint)                                                                | fail as expected                                                         |
| `intrinsic-shift`, `restty-host-integration`, `window-chrome`, `developer-tools`, `initialization-cancellation` | pass                                                                     |
| `pending-tab-ownership`                                                                                         | 2 of 21 runs failed on this branch, detail not captured; upstream 6 of 6 |

Fixture note: an `Escape` sent to the fixture's bash leaves readline waiting
for a Meta sequence, which blocks teardown; the oracle completes it with
`Enter`.
