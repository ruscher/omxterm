# 05: Pull request delivery

## Upstream (luizomf/omxterm)

**No new upstream pull request was opened in this round**, because no approved
feature was waiting for an implementation (see `03-incremental-roadmap.md`).

| PR                                                  | Funcionalidade                | Issue | Testes                                                                          | Estado                |
| --------------------------------------------------- | ----------------------------- | ----- | ------------------------------------------------------------------------------- | --------------------- |
| [#626](https://github.com/luizomf/omxterm/pull/626) | Scrollback Find               | —     | Contributor tests plus maintainer qualification                                 | Merged                |
| [#651](https://github.com/luizomf/omxterm/pull/651) | Settings                      | #630  | Maintainer composition in #676                                                  | Merged via #676       |
| [#661](https://github.com/luizomf/omxterm/pull/661) | en-US/pt-BR                   | #632  | Maintainer composition in #676                                                  | Merged via #676       |
| [#662](https://github.com/luizomf/omxterm/pull/662) | Snippet preview               | #636  | Maintainer composition in #676                                                  | Merged via #676       |
| [#663](https://github.com/luizomf/omxterm/pull/663) | Terminal panes                | #650  | Maintainer composition in #676                                                  | Merged via #676       |
| [#680](https://github.com/luizomf/omxterm/pull/680) | Shortcut editor               | #631  | Maintainer F1–F7 regressions; Fedora full portable 3098 passed / 41 skipped     | Merged                |
| [#682](https://github.com/luizomf/omxterm/pull/682) | Linux software WebGL fallback | #686  | Contributor VM A/B; maintainer Fedora ARM64 portable 3048 passed / 41 skipped   | Merged                |
| [#685](https://github.com/luizomf/omxterm/pull/685) | Close Pane in context menu    | —     | Contributor unit tests; maintainer ownership correction and native verification | Merged                |
| [#649](https://github.com/luizomf/omxterm/pull/649) | Export selection/content      | #629  | 47 focused export tests (maintainer)                                            | Open, blocked by #643 |

## Fork (ruscher/omxterm)

| PR                                                | Funcionalidade                            | Testes                                                      | Estado                              |
| ------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| [#12](https://github.com/ruscher/omxterm/pull/12) | Solution button for SSH failures          | Unit tests plus real `ssh-keygen` and OpenSSH 10.5 checks   | Merged                              |
| [#13](https://github.com/ruscher/omxterm/pull/13) | SSH tab icon/tooltip, session status dots | Unit tests                                                  | Merged                              |
| [#14](https://github.com/ruscher/omxterm/pull/14) | omxterm-hero icon                         | Icon tests, visual size check                               | Open                                |
| [#15](https://github.com/ruscher/omxterm/pull/15) | Release 0.22.2                            | CI 24/24, install smoke on 7 distro images plus 2 PKGBUILDs | Open, waiting for the owner's merge |
