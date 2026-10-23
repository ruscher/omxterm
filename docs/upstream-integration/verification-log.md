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
- `test/integration/failure-acknowledgement.test.ts`: 2 failed (`native exec
failure must not be an ordinary code-1 exit`), reproduced in a clean
  worktree. They come from the locally built x86_64 `node-pty`.

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
