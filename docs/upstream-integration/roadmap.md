# Roadmap and decisions

Snapshot of 2026-10-23, against `upstream/main` at `7134d10`. #622 holds
366 files (+48,364/−2,309) in 53 commits; nothing is merged wholesale.

## What the maintainer asked for

From the [#622 proposal](https://github.com/luizomf/omxterm/pull/622#issuecomment-6371745095):

- **Core:** splits, search, output export, settings, translations, and a
  compact About that links to a contributors file instead of listing names.
  Broadcast and layout restore are interesting but need a defined scope.
- **Shared interface:** one resizable auxiliary panel that shows one tool at
  a time, plus a consistent way to discover actions and settings. The #622
  panel helpers can be adapted.
- **Optional tools:** files, SSH connection management, and one evolution of
  Snippets/Commands. Official and community extensions are wanted, but the
  architecture is open.
- **Constraints:** unify Snippets and Commands, preserve users' existing
  configuration files, separate layout restore from starting commands or
  connections, and keep credits plus AshyTerm references and licenses even
  when code arrives through another PR.
- The maintainer plans to open issues linked to #622. We coordinate there to
  avoid duplicate work.

## Upstream contracts these pieces touch

| Contract                                                              | Source                                                | Affected pieces                             |
| --------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| Splits are outside the product contract                               | `docs/spec.md` "Product scope"                        | Splits, broadcast, layout restore           |
| One live session per tab                                              | ADR 0016                                              | Splits, broadcast                           |
| Configuration is never migrated, repaired or rewritten                | ADR 0003                                              | Preferences UI, Snippets/Commands migration |
| Terminal Payload never becomes history, logs or persisted state       | `CONTEXT.md`, ADR 0004                                | Output export, layout restore               |
| SSH brokering, AI assistance and persistent sessions are out of scope | `docs/spec.md` "Product"                              | SSH manager, assistant, saved sessions      |
| No shell integration is injected                                      | ADR 0013                                              | Working-directory tracking for files        |
| The renderer has no local capabilities                                | ADR 0006                                              | Files, export, any tool panel               |
| Snippets move to YAML (`ready-for-agent`)                             | [#381](https://github.com/luizomf/omxterm/issues/381) | Snippets/Commands unification               |

## Pieces, sources, and what each needs first

Fork sources are paths on the `ruscher/omxterm` `main` branch.

| #   | Piece                             | Main fork sources                                                                                        | Blocking decision                                                                                                         | State                                                     |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1   | Scrollback search                 | `terminal-surface/restty-terminal-surface.ts` (Restty search UI)                                         | None. Default key on Linux/Windows asked in the PR                                                                        | [#626](https://github.com/luizomf/omxterm/pull/626) draft |
| 2   | Output export                     | `main/output-file-wiring.ts`, `terminal-surface` `outputText`                                            | Is an explicit, dialog-chosen file allowed under the Terminal Payload contract? Whole buffer or selection?                | Waiting                                                   |
| 3   | Compact About + contributors file | `renderer/about/*`, `main/about-wiring.ts`                                                               | The maintainer said he would slim the About himself                                                                       | Left to the maintainer                                    |
| 4   | Translations                      | `shared/i18n.ts`, `shared/locales/*`                                                                     | Upstream has no i18n layer: which loader, which locales, and how menus in main translate                                  | Waiting                                                   |
| 5   | Preferences UI                    | `main/preferences-*.ts`, `renderer/preferences/*`                                                        | The fork writes `config.json`, which conflicts with ADR 0003. Read-only UI, or an ADR for explicit user-initiated writes? | Waiting                                                   |
| 6   | Splits                            | `renderer/pane-layout.ts`, `pane-view.ts`, `terminal-pane-lifecycle.ts`                                  | Spec scope plus ADR 0016 follow-up: sessions per pane, close semantics, focus, keybinds                                   | Waiting                                                   |
| 7   | Auxiliary panel                   | `renderer/workspace-sidebar.ts`, `renderer/ui/*`                                                         | One tool at a time; the snippets sidebar is the first tenant. Should land with or after the first tool                    | Waiting                                                   |
| 8   | Action discovery                  | `renderer/command-palette.ts`, `renderer/header-toolbar.ts`                                              | Palette or not; must not create a second shortcut system (spec: the menu is the single registration point)                | Waiting                                                   |
| 9   | Snippets + Commands               | `shared/commands.ts`, `main/command-library.ts`, `shared/command-builtins/*`                             | One model compatible with #381 YAML; migration must not rewrite user files (ADR 0003)                                     | Waiting                                                   |
| 10  | File browser                      | `main/file-browser*.ts`, `renderer/files/*`                                                              | Optional-tool boundary; the cwd source without shell integration (OSC 7 only?)                                            | Waiting                                                   |
| 11  | SSH manager                       | `main/saved-sessions.ts`, `main/ssh-command.ts`, `main/ssh-config-import.ts`, `main/credential-store.ts` | Out of product scope today. If accepted: system OpenSSH and agent only, and drop stored passwords                         | Waiting                                                   |
| 12  | Broadcast, layout restore         | `renderer/broadcast-indicator.ts`, `main/workspace-service.ts`                                           | The maintainer asked for a defined scope. Restore must never start commands or connections                                | Design only                                               |
| 13  | Extensions                        | none                                                                                                     | Architecture open                                                                                                         | Design only                                               |

Out of the maintainer's list (assistant, output highlighting, SFTP, colour
schemes) stays out unless he asks; they are extension candidates at most.

## Suggested order

1. Land or adjust #626 based on feedback. It also settles the PR format.
2. Output export, once the payload question is answered. It's small and
   reuses the Surface boundary from #626.
3. Translations and Preferences after the infrastructure and ADR answers,
   since both shape every later UI string and setting.
4. Auxiliary panel together with its first tool (snippets), then the
   Snippets/Commands unification aligned with #381.
5. Splits after a written behavior proposal in an issue.
6. Files and SSH as optional tools once the extension direction is clearer.

## Notes for later PRs

- `THIRD_PARTY_NOTICES.md` on fork `main` points to
  `licenses/ashyterm.txt`, but the file is `assets/licenses/ashyterm-MIT.txt`.
  Fix this wherever AshyTerm-derived data lands.
- Most AshyTerm commits belong to other BigLinux contributors (bigbruno,
  talesam, leoberbert and others), so attribute to "AshyTerm (Community Big)"
  rather than to one person.
- Upstream `src/main/index.ts` and several functions sit exactly at their
  oxlint size limits. Expect small helper extractions in each feature PR.
