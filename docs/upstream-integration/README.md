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

| Piece              | State                                                              | Link                                                                                |
| ------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Coordination reply | Posted 2026-10-23                                                  | [#622 comment](https://github.com/luizomf/omxterm/pull/622#issuecomment-6373050635) |
| Compact About      | Done by the maintainer (#639), adapted from #622 with credits      | [#639](https://github.com/luizomf/omxterm/pull/639)                                 |
| YAML snippets      | Done by the maintainer (#638, issue #381)                          | [#638](https://github.com/luizomf/omxterm/pull/638)                                 |
| Scrollback search  | Round 3 pushed (`c18fa86`): Escape gesture, wording, `main` merged | [#626](https://github.com/luizomf/omxterm/pull/626)                                 |
| Everything else    | Waiting on the decisions in the roadmap                            | —                                                                                   |
