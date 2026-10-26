# 06: Final report (round of 2026-10-25)

## GitHub

- **Audited:** 11 upstream PRs (#622, #626, #649, #651, #661, #662, #663, #676, #680, #682, #685) and 22 issues. That covers #223, #629–#632, #635, #636, #643, #650, #669–#673, #683, #686–#688, plus the open triage list (not ours).
- **Needed a response:**
  - #223, the optional smoke invitation.
  - #622, a collective thank-you for merges after the last update.
  - #683, new evidence beyond the maintainers' conclusion.
- **Published:** three comments, linked in `02-github-responses.md`. Nothing was posted only to show activity. No inline review comment was open.

## Implementations

None upstream in this round. Every approved lane is merged or under maintainer
integration, and the remaining ideas are unapproved proposals (#669–#673).

## Pull requests

No upstream PR was created or updated. The existing ones are listed in
`05-pull-request-delivery.md`. In the fork, PR #15 (release 0.22.2) is ready,
with CI 24/24, and waits for the owner's merge.

## Tests

See `04-quality-assurance.md`.

- **Upstream v0.22.0 Linux x64 AppImage on physical GNOME 50.4 Wayland:** launch, visible shell, resize and normal quit passed.
- **Not exercised:** typing, which was blocked by GNOME's remote-interaction portal, and helper install.
- **Not counted:** the KDE run (AppImageLauncher interception).
- **Teardown abort:** reproduced in a minimal Electron app.

## Pendências

| Pendência                                                           | Bloqueada por                               |
| ------------------------------------------------------------------- | ------------------------------------------- |
| #649 integration                                                    | Maintainers / #643 (Windows)                |
| #669–#673 decisions                                                 | Maintainers (consolidated product response) |
| #686 shipment                                                       | Next upstream release (maintainers)         |
| Fork release 0.22.2 publication and installs                        | Owner's merge of fork PR #15                |
| Cancel the GNOME _Remote desktop_ prompt left by the typing attempt | User on the GNOME machine                   |

## Melhorias futuras (proposals only, not started)

- If #671 is approved, saved-session work from the fork could be offered in small pieces. The order would be the definition and list, then the status indicator, then the Solution dialog.
- AppImageLauncher interplay on BigLinux deserves a deliberate test with its dialog visible before anything is reported.

## Contribuições já incorporadas pelos mantenedores

Find (#626); Settings, i18n, snippet preview and panes (#676); the shortcut
editor (#680); the software WebGL fallback (#682); Close Pane (#685, with an
ownership fix by the maintainers); and the follow-ups to my reports, the CJK
fallback (#687) and the TMPDIR docs (#688). None of them needs to be recreated.
