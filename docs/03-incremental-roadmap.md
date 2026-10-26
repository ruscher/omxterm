# 03: Incremental roadmap

State on 2026-10-25: **there is no approved upstream feature waiting for an
implementation by @ruscher.** Every approved lane is either merged (#626,
#651, #661, #662, #663, #680, #682, #685) or under maintainer integration (#649).
Opening new upstream PRs now would deliver work nobody asked for, so none
were opened.

## Queue

| Order | Item                          | Dependency                                                                                  | Risk                                                    | Tests when it moves                                                              | Acceptance                                                                |
| ----- | ----------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1     | #649 export (open)            | #643 Windows teardown; maintainer-owned integration and ordering with the #685 menu changes | Context-menu composition conflicts with the merged #685 | Maintainers run export suite (47 focused tests) and native save/cancel/overwrite | Maintainer merge. We act only if they ask.                                |
| 2     | One of #669–#673, if approved | Maintainer product decision; #671 also needs a spec change ("SSH brokering outside scope")  | Scope creep; overlap with the Auxiliary Panel           | Per approved behavior, plus i18n (en-US/pt-BR) and accessibility                 | Approved issue text; one PR per proposal from the current `upstream/main` |

Suggested order if the maintainers approve several proposals, from smallest
contract change to largest:

1. #672 broadcast input (renderer-only, per tab).
2. #669 command palette (reuses the native menu, no new privileges).
3. #673 layout save/restore (geometry only).
4. #670 read-only Files view.
5. #671 SSH Hosts (needs a product and spec change).

## Fork-only work, not proposed upstream

These live in ruscher/omxterm and depend on product decisions upstream has not
made. They stay fork-only unless the maintainers ask for them.

- Saved SSH password in the keyring, the Solution dialog, and SSH tab and
  session status indicators. All depend on Saved Sessions; see #671.
- The omxterm-hero icon, which is the fork's identity; upstream has its own.

## Findings classified during this round

| Finding                                                                 | Class                   | Upstream action                                                                    |
| ----------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `.deb` missing `libasound2t64 \| libasound2` and `libgbm1`              | Normal fix              | Not applicable: upstream ships AppImage only on Linux. Fixed in the fork (0.22.1). |
| Group-wide SIGTERM (service stop, logout) aborts with a core dump       | Proposal / observation  | Known as #683. Added out-of-verifier evidence; maintainers decide.                 |
| AppImageLauncher (default on BigLinux) intercepts the AppImage relaunch | Observation, unverified | Not reported: I did not observe the dialog or establish the behavior.              |
| GNOME launched as a systemd service stays on native Wayland             | Not a defect            | Launching the way GNOME Shell does relaunches onto XWayland as designed.           |
