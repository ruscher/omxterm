# Implementation progress

| Phase                   | Deliverable                           | Status      | Evidence                                                                   |
| ----------------------- | ------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| 0 — diagnosis           | Repository audit and parity baseline  | PARTIAL     | Audit/matrix complete for current checkout; native baselines unavailable   |
| 1 — stabilization       | ConPTY/default-shell fixes            | PARTIAL     | Fixed SystemRoot fallback; Windows 10 x64 focused ConPTY smoke passed      |
| 2 — PowerShell/profiles | Saved profiles with literal arguments | PARTIAL     | Model, unit tests and Windows 10 x64 launch pass; graphical manager absent |
| 3 — SSH/SFTP            | Integrated remote suite               | BLOCKED     | Outside current contract; prerequisite architecture absent                 |
| 4 — WSL                 | Generic WSL executable suggestion     | PARTIAL     | Implemented; distro/path integration absent                                |
| 5 — Windows features    | Explorer/dashboard/winget             | NOT STARTED | No backend/UI added                                                        |
| 6 — premium UX          | Native visual qualification           | NOT TESTED  | Linux host cannot establish Windows DPI/accessibility                      |
| 7 — Magic               | Proposals                             | PARTIAL     | Proposals documented; none falsely marked implemented                      |
| 8 — performance         | Reproducible benchmarks               | NOT STARTED | No comparative measurements                                                |
| 9 — security            | Shell discovery threat review         | PARTIAL     | Boundary/tests added; broader audit outstanding                            |
| 10 — packaging          | Windows packages                      | PARTIAL     | x64 safe update/start passed; uninstall and other targets remain           |
| 11 — final audit        | Cross-platform release candidate      | NOT STARTED | Earlier phases incomplete                                                  |

## Files implementing the current increment

- `src/main/windows-shell-discovery.ts`
- `src/shared/windows-shells.ts`
- `src/main/default-shell.ts`
- Settings shared/main/renderer integration
- Focused unit tests for discovery, transport and UI
- ADR 0037 fixed-layout Default Shell resolution and tests
- ADR 0038 saved Windows profiles and literal argument launch
- ADR 0039 NSIS live-process refusal and exact x64 update qualification
- Product/configuration/Windows evidence documentation
