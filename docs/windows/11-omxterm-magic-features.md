# OMXTerm Magic features

These are differentiated proposals, not delivered features. Each stays deferred
until its prerequisite architecture and tests exist.

| Proposal               | Problem and audience                                      | Behavior/architecture                                                                                                    | Security/performance/tests                                         | Priority/result                        |
| ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | -------------------------------------- |
| Capability Lens        | Users cannot tell which terminal protocols are active     | Per-tab view of negotiated modes from the existing core, never guessed from output                                       | Memory-only, bounded; protocol fixture tests                       | P1 — deferred                          |
| Safe Session Handoff   | Administrators lose context when switching shells         | Create a new session with an explicit profile and optionally a verified directory; never replace a live session silently | Literal argv; lifecycle/native tests                               | P1 — profile picker/directory required |
| Environment Diff       | Developers struggle with PowerShell/WSL environment drift | User-requested comparison of allowlisted variable names, with values hidden by default                                   | Secret redaction and explicit collection; bounded output           | P2 — deferred                          |
| Path Bridge Preview    | WSL users cannot predict path translation                 | Show proposed Windows/WSL path conversion and its provenance before use                                                  | Call fixed `wsl.exe`/`wslpath` only on request; hostile path tests | P1 — WSL provider required             |
| Terminal Health Ledger | Long sessions hide repeated resize/render failures        | In-memory counters for safe operational categories, exportable without payload                                           | No command/title/path data; constant memory                        | P1 — deferred                          |
| Trust-Zone Tabs        | Operators confuse production and development hosts        | Explicit user-assigned visual zone and stronger confirmation policy                                                      | No host inference; accessible non-color signal                     | P1 — profile trust metadata required   |
| Repro Capsule          | Bug reports omit terminal capability context              | Export redacted app/runtime/config schema metadata, never terminal payload                                               | Preview before save; privacy unit tests                            | P1 — deferred                          |
| Protocol Playground    | TUI authors need repeatable compatibility checks          | Local fixture runner for selected VT/Kitty sequences with expected visual oracles                                        | Application-owned fixtures only; resource caps                     | P2 — deferred                          |
| Session Budget Guard   | Many tabs can exhaust memory/CPU                          | Show per-window Surface/session counts and warn at user-defined bounds                                                   | No background process inspection; benchmark 1/8/16 tabs            | P2 — deferred                          |
| Verified Action Cards  | Repeated admin commands are hard to review                | User-authored literal executable/argv templates with typed placeholders and preview                                      | No shell strings; explicit execution; injection tests              | P1 — deferred                          |
| Failure Replay Recipe  | Intermittent startup failures are hard to reproduce       | Export sanitized launch kind, platform and fixed failure category as a test recipe                                       | Exclude executable/path/env/payload by default                     | P2 — deferred                          |
| Offline Help Index     | Restricted hosts lack documentation access                | Bundled, versioned index for OMXTerm behavior and shortcuts                                                              | Static signed build input; lazy load                               | P2 — deferred                          |

Magic Workspace, Context, Command Blocks, Multi-Host Operations, Error Assistant,
Environment Switcher, Connection Observatory and Task Composer from the broader
roadmap are also not implemented. They must not imply process persistence,
semantic command boundaries or remote recovery without explicit shell/transport
protocol support.
