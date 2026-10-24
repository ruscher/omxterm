# Upstream integration of #622

Working notes for bringing parts of
[luizomf/omxterm#622](https://github.com/luizomf/omxterm/pull/622) into
upstream as small, focused pull requests. This branch exists only in the
`ruscher/omxterm` fork and is never proposed upstream.

- [Roadmap and decisions](roadmap.md): the maintainer's split, the feature
  map, and what each piece needs before code.
- [Verification log](verification-log.md): commands, environments, and real
  results per pull request.

## Ground rules

- The maintainer's proposal is the scope:
  [#622 comment](https://github.com/luizomf/omxterm/pull/622#issuecomment-6371745095).
  Our agreement and suggested order:
  [reply](https://github.com/luizomf/omxterm/pull/622#issuecomment-6373050635).
- Every branch starts from `upstream/main`. The fork's `main` is the head of
  #622 and stays untouched, so new commits there never reach #622.
- One behavior per pull request, with tests and the affected guides, spec,
  `CONTEXT.md`, and ADRs in the same commit.
- Anything that changes an ADR or the product contract (splits, a preferences
  writer, i18n infrastructure, persisted output, extensions) waits for a
  maintainer decision before code.
- Keep AshyTerm (MIT, Community Big) attribution wherever its code or data is
  adapted. Version bumps and releases stay with the maintainer.

## Status

| Piece                                                   | State                                                                                                                                                   | Link                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Coordination reply                                      | Posted 2026-10-23                                                                                                                                       | [#622 comment](https://github.com/luizomf/omxterm/pull/622#issuecomment-6373050635) |
| Compact About                                           | Done by the maintainer (#639), adapted from #622 with credits                                                                                           | [#639](https://github.com/luizomf/omxterm/pull/639)                                 |
| YAML snippets                                           | Done by the maintainer (#638, issue #381)                                                                                                               | [#638](https://github.com/luizomf/omxterm/pull/638)                                 |
| Auxiliary panel (Snippets)                              | Done by the maintainer (#652, issue #648)                                                                                                               | [#652](https://github.com/luizomf/omxterm/pull/652)                                 |
| Scrollback search + null/F11                            | Merged (squash `85e0871`)                                                                                                                               | [#626](https://github.com/luizomf/omxterm/pull/626)                                 |
| Explicit export (#629)                                  | Review fixes in `8e96b77`; maintainers' residual review found nothing and the native dialog smoke passed. Waiting on their Windows investigation (#643) | [#649](https://github.com/luizomf/omxterm/pull/649)                                 |
| Settings editor (#630)                                  | Main `d2b67d0` merged in `c6720b2`, mergeable                                                                                                           | [#651](https://github.com/luizomf/omxterm/pull/651)                                 |
| Interface Language (#632)                               | Open, waiting for review                                                                                                                                | [#661](https://github.com/luizomf/omxterm/pull/661)                                 |
| Language selector + Settings translations               | Bridge branch `feat/settings-localization`; it goes into whichever of #651/#661 lands second                                                            | —                                                                                   |
| Splits (#650)                                           | All four decisions approved 2026-10-24; implementation queued                                                                                           | [#650](https://github.com/luizomf/omxterm/issues/650)                               |
| Snippets Insert/Run + preview (#636)                    | Design resolved by the maintainer; first slice unassigned                                                                                               | [#636](https://github.com/luizomf/omxterm/issues/636)                               |
| Shortcut editor (#631)                                  | After #651                                                                                                                                              | [#631](https://github.com/luizomf/omxterm/issues/631)                               |
| Action discovery, Files, SSH, broadcast, layout restore | Local proposal drafts, not posted                                                                                                                       | [queue](queue.md)                                                                   |

See [queue.md](queue.md) for owners and order.
