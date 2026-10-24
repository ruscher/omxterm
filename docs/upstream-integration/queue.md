# Queue and owners

Snapshot of 2026-10-24, upstream `main` at `d2b67d0`.

Two local Claude sessions work for the same contributor. To avoid duplicate
work, each owns separate branches and checkouts:

- **Session A** owns the main checkout and every `feat/*` branch:
  `feat/terminal-export` (#649), `feat/settings-editor` (#651),
  `feat/localization` (#661), `feat/settings-localization` (bridge), and the
  next code slices.
- **Session B** works only in separate worktrees: these planning notes and
  local proposal drafts. Nothing is posted without the contributor's approval.

## Waiting on the maintainers

| Item              | What they said                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #649 export       | Residual review found nothing; the native save, cancel and overwrite smoke passed on their side. A Windows native failure (#643) is under investigation. Nothing is pending from us. |
| #651 settings     | Mergeable after the main merge. The #651 ↔ #661 dependency is recorded: whichever lands last delivers the selector in Settings **and** translates the editor.                        |
| #661 i18n         | Waiting for review.                                                                                                                                                                  |
| #223 x64 AppImage | @Gaalbu owns the implementation. We only smoke-test the candidate on KDE/Wayland when it exists.                                                                                     |

## Ready code slices, in order

1. **Bridge:** the language selector on the Settings General page and translated Settings text, renderer and main notices. Session A.
2. **Splits (#650):**
   - working directory from OSC 7, falling back to home;
   - **View → Pane** menu with remappable shortcuts;
   - no maximize in the first slice;
   - 20 × 5 minimum;
   - privacy opt-in rule;
   - ADR 0016 and contracts updated in the same slice.

   Session A.

3. **Shortcut editor (#631):** after #651. Session A.
4. **Snippets Insert/Run + preview (#636 resolution):** renderer-only. Owner to be decided.

## Need a maintainer decision first

Drafts in the #650 style (numbered decisions, contracts touched, privacy and
ADR impact). They stay local until the contributor approves posting.

- Action discovery: a palette over the existing menu actions, with no second shortcut table.
- Files as an optional Auxiliary Panel tool, read-only first.
- SSH as an optional tool. This needs a product-scope change. Use system OpenSSH and `~/.ssh/config` read-only, never store credentials.
- Broadcast, after splits.
- Layout restore, after splits: opt-in, geometry only, never starts commands or connections.

## Not ours

- #634 translation guide: maintainer-owned.
- Extensions architecture: open; no proposal until the optional tools settle.
