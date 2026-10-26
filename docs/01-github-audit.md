# 01: GitHub audit

Internal working document for the contribution effort by @ruscher. It is not
part of the application and is not proposed to upstream.

- **Last consulted:** 2026-10-25 22:46 -0300 (upstream `main` at `6fd7600`).
- **Sources:** `gh pr view` / `gh issue view` / `gh api` on
  [luizomf/omxterm](https://github.com/luizomf/omxterm) and
  [ruscher/omxterm](https://github.com/ruscher/omxterm).

## Upstream pull requests by @ruscher

| Item                                                                         | Estado atual                                                                         | Responsável                    | Pendência                                                                                                     | Próxima ação                                           |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [#622](https://github.com/luizomf/omxterm/pull/622) original contribution    | Open (coordination record)                                                           | @ruscher (author), maintainers | Stays open while contributions and proposals are accounted for (maintainer decision).                         | None; do not close unilaterally. Thanks/status posted. |
| [#626](https://github.com/luizomf/omxterm/pull/626) scrollback Find          | Merged 2026-10-24                                                                    | maintainers                    | None                                                                                                          | None                                                   |
| [#649](https://github.com/luizomf/omxterm/pull/649) export selection/content | Open                                                                                 | maintainers (integration)      | Blocked by Windows teardown investigation #643. Maintainers asked for no further correction round or rebases. | Wait. Do not rebase or change.                         |
| [#651](https://github.com/luizomf/omxterm/pull/651) Settings                 | Merged via #676                                                                      | maintainers                    | None                                                                                                          | None                                                   |
| [#661](https://github.com/luizomf/omxterm/pull/661) en-US/pt-BR              | Merged via #676                                                                      | maintainers                    | None                                                                                                          | None                                                   |
| [#662](https://github.com/luizomf/omxterm/pull/662) snippet preview          | Merged via #676                                                                      | maintainers                    | None                                                                                                          | None                                                   |
| [#663](https://github.com/luizomf/omxterm/pull/663) terminal panes           | Merged via #676                                                                      | maintainers                    | None                                                                                                          | None                                                   |
| [#680](https://github.com/luizomf/omxterm/pull/680) shortcut editor          | Merged 2026-10-25 (maintainer corrections F1–F7, co-author credit)                   | maintainers                    | None                                                                                                          | None (thanked in #622)                                 |
| [#682](https://github.com/luizomf/omxterm/pull/682) software WebGL fallback  | Merged 2026-10-25 at `70c6635` (maintainer ADR 0037 wording)                         | maintainers                    | Shipment in next release (#686)                                                                               | None (thanked in #622)                                 |
| [#685](https://github.com/luizomf/omxterm/pull/685) Close Pane context menu  | Merged 2026-10-26 at `6fd7600` (maintainer fix: popup actions tied to original pane) | maintainers                    | None                                                                                                          | None (thanked in #622)                                 |

Integration PR by the maintainers: [#676](https://github.com/luizomf/omxterm/pull/676)
(merged 2026-10-25, `ff4e134`). It integrated #651, #661, #662 and #663 with the
contributor commits and the `f936da9` bridge as ancestors.

## Related issues

| Item                                                                                                                  | Estado atual                                   | Responsável                    | Pendência                                            | Próxima ação                                         |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------- |
| [#223](https://github.com/luizomf/omxterm/issues/223) Linux x64 AppImage                                              | Open (`help wanted`, `ready-for-human`)        | maintainers                    | Optional native smoke invitation (not an assignment) | Done: smoke report posted.                           |
| [#629](https://github.com/luizomf/omxterm/issues/629) export                                                          | Open                                           | @ruscher via #649              | Integration of #649                                  | Wait for #643.                                       |
| [#630](https://github.com/luizomf/omxterm/issues/630), [#632](https://github.com/luizomf/omxterm/issues/632)          | Closed by #676                                 | maintainers                    | None                                                 | None                                                 |
| [#631](https://github.com/luizomf/omxterm/issues/631) shortcuts                                                       | Closed by #680                                 | maintainers                    | None                                                 | None                                                 |
| [#635](https://github.com/luizomf/omxterm/issues/635), [#636](https://github.com/luizomf/omxterm/issues/636)          | Closed (design resolved)                       | maintainers                    | None                                                 | None                                                 |
| [#643](https://github.com/luizomf/omxterm/issues/643) Windows teardown crash                                          | Open                                           | maintainers                    | Cause not established; blocks #649                   | None from us.                                        |
| [#650](https://github.com/luizomf/omxterm/issues/650) panes proposal                                                  | Closed by #676                                 | maintainers                    | None                                                 | None                                                 |
| [#669](https://github.com/luizomf/omxterm/issues/669)–[#673](https://github.com/luizomf/omxterm/issues/673) proposals | Open, no maintainer reply yet                  | maintainers (product decision) | Consolidated product response promised in #622       | Wait. Implement nothing without approval.            |
| [#683](https://github.com/luizomf/omxterm/issues/683) group-teardown SIGTRAP                                          | Closed (verifier-induced race; verifier fixed) | maintainers                    | None                                                 | Added out-of-verifier evidence; no action requested. |
| [#686](https://github.com/luizomf/omxterm/issues/686) ship #682                                                       | Open                                           | maintainers                    | Next release                                         | None                                                 |
| [#687](https://github.com/luizomf/omxterm/issues/687) CJK Source Han fallback                                         | Closed, delivered in `6fd7600`                 | maintainers                    | None                                                 | None (thanked)                                       |
| [#688](https://github.com/luizomf/omxterm/issues/688) executable TMPDIR docs                                          | Closed, delivered in #691                      | maintainers                    | None                                                 | None (thanked)                                       |

Not ours, recorded only for context: #696 (optional context-menu disabling
proposal), #698, #679, #677, #640, #627, #624, #609, #598, #571, #568, #547. They
are maintainer triage items and not our responsibility.

## Maintainer decisions that bind our work

- Small PRs, one feature each, history preserved (#622).
- No moving-target rebases while maintainers integrate (#622, #649, #685).
- Maintainer comments are AI-assisted and marked as such. Otávio confirmed this
  in #622 on 2026-10-25.
- #669–#673 are recorded as behavior proposals, not implementation approvals.
- The software WebGL fallback is Linux-only; it is not extended to Windows (#682).
- Linux x64 artifacts are build-only qualified (#223).

## Fork (ruscher/omxterm), for completeness

The fork carries AshyTerm-derived features and its own releases. These are not
upstream contributions.

| Fork PR                                                                                              | Estado                 | Nota                                                            |
| ---------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------- |
| [#8](https://github.com/ruscher/omxterm/pull/8)–[#11](https://github.com/ruscher/omxterm/pull/11)    | Merged                 | Saved SSH password, WebGL port, Close Pane port, release 0.22.1 |
| [#12](https://github.com/ruscher/omxterm/pull/12), [#13](https://github.com/ruscher/omxterm/pull/13) | Merged                 | Solution button; SSH tab icon and session status dots           |
| [#14](https://github.com/ruscher/omxterm/pull/14)                                                    | Open                   | New omxterm-hero icon (fork identity)                           |
| [#15](https://github.com/ruscher/omxterm/pull/15)                                                    | Open, CI green (24/24) | Release 0.22.2; waiting for the owner's merge                   |
