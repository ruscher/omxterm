# Competitive analysis

Research date: 2026-10-27. Links point to primary product documentation or
project repositories. This is a decision aid, not a feature-completeness claim.

## Findings

| Product          | Evidence-backed strengths                                                                                                                                                                                                                                                                                                                        | Lesson for OMXTerm                                                                                                 | Decision now                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Windows Terminal | Multiple profiles, tabs, panes, Unicode/UTF-8, GPU rendering and custom actions are documented by [Microsoft](https://learn.microsoft.com/en-us/windows/terminal/). Its [command palette](https://learn.microsoft.com/en-us/windows/terminal/command-palette) can generate actions from profiles.                                                | Shell identity should become structured data before palettes or panes depend on it.                                | Start with passive shell suggestions; do not claim profiles.              |
| WezTerm          | Official docs expose [multiplexing and SSH domains](https://wezterm.org/multiplexing.html), [SSH](https://wezterm.org/ssh.html), workspaces and a Lua configuration/plugin surface.                                                                                                                                                              | Multiplexing is an architecture, lifecycle and trust decision, not a tab UI detail.                                | Defer until OMXTerm has an explicit remote/session architecture.          |
| Tabby            | The project documents nested panes, a Quake window, shell profiles and an SSH client with forwarding, jump hosts and agents in its [README](https://github.com/Eugeny/tabby).                                                                                                                                                                    | A broad connection manager brings substantial credential and transfer attack surface.                              | Do not bolt SSH state into renderer configuration.                        |
| Wave             | Official docs describe graphical file/web widgets, AI, workspaces, connections and durable sessions in [one integrated product](https://docs.waveterm.dev/).                                                                                                                                                                                     | Visual tools are useful only with explicit data-access and privacy boundaries.                                     | Keep OMXTerm local/no-network unless product scope changes.               |
| electerm         | Its [quick-connect schema](https://github.com/electerm/electerm/wiki/quick-connect) covers SSH, SFTP, tunnels, hopping and agents; it also documents [OSC 633 CWD integration](https://github.com/electerm/electerm/wiki/How-Electerm-Gets-the-Current-Working-Directory-%28pwd%29-in-Terminal-When-%22SFTP-Follow-Terminal-Path%22-Is-Enabled). | Remote file browsing and shell integration require protocol validation and adversarial tests.                      | No remote file manager in this increment.                                 |
| Ghostty          | Official [feature documentation](https://ghostty.org/docs/features) emphasizes GPU rendering, tabs/splits, ligatures, grapheme clusters and Kitty graphics, with platform-native UI.                                                                                                                                                             | OMXTerm already benefits from Ghostty's core through Restty; host features still need independent lifecycle tests. | Preserve the pinned portable Surface rather than fork terminal semantics. |

## Security signals

Recent upstream release histories show why connection/file features cannot be
treated as ordinary UI additions: Tabby disclosed a Windows SFTP path traversal
in its [release notes](https://github.com/Eugeny/tabby/releases), while electerm
reported a Windows SFTP command-injection fix in its
[releases](https://github.com/electerm/electerm/releases). These are references,
not claims about current versions. OMXTerm should require literal argv,
destination-root containment, symlink/reparse-point tests, atomic replacement
where possible and independent host-key verification before offering equivalent
features.

## Other references

PuTTY/KiTTY, ConEmu/Cmder, Alacritty, Rio, Warp, Termius, SecureCRT, MobaXterm,
Hyper and Fluent Terminal remain useful references for focused future studies.
They were not inspected deeply enough in this increment to support implementation
claims. Commercial behavior must be evaluated from public documentation without
copying protected code, branding or interface trade dress.

## Opportunity selection

The best first move is not a large connection suite. It is a trustworthy shell
foundation that lets a Windows user choose an installed shell without typing a
path while retaining the existing strict configuration and PTY boundary. The
next bounded layer now adds file-configured saved profiles and literal argument
vectors. Per-distribution WSL discovery, a graphical profile manager, panes and
a palette remain separate designs so none is falsely implied by suggestions.
