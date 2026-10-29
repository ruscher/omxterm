# Windows engineering program

This directory records evidence for the OMXTerm Windows engineering program.
It is not a claim that the broad roadmap is complete. The authoritative product
contract remains [the specification](../spec.md); these documents distinguish
implemented behavior from proposals and native validation still required.

## Current verified increment

OMXTerm now passively discovers installed shell executables in fixed standard
Windows locations and offers them in the editable Settings shell field. The
implementation does not execute candidates, search `PATH`, alter user
configuration on open, or turn discovery into execution authority. A separate
saved-profile model passes bounded literal arguments to new Windows tabs.
Focused unit tests run on the Linux x64 development host. Shell suggestions,
legacy selection and a saved PowerShell 7 profile with literal arguments have
focused Windows 10 x64 VM evidence. The exact x64 NSIS also has a qualified
safe-update path that refuses forced close and preserves normal PTY drain.

## Documents

- [Project audit](00-project-audit.md)
- [Feature parity matrix](01-feature-parity-matrix.md)
- [Competitive analysis](02-competitive-analysis.md)
- [Windows architecture](03-windows-architecture.md)
- [ConPTY and shells](04-conpty-and-shells.md)
- [PowerShell integration](05-powershell-integration.md)
- [WSL integration](06-wsl-integration.md)
- [SSH architecture](07-ssh-architecture.md)
- [SFTP file manager](08-sftp-file-manager.md)
- [Windows native features](09-windows-native-features.md)
- [UX/UI design system](10-ux-ui-design-system.md)
- [OMXTerm Magic proposals](11-omxterm-magic-features.md)
- [Security and privacy](12-security-and-privacy.md)
- [Performance benchmarks](13-performance-benchmarks.md)
- [Test matrix](14-test-matrix.md)
- [Packaging and distribution](15-packaging-and-distribution.md)
- [Implementation progress](16-implementation-progress.md)
- [Known limitations](17-known-limitations.md)
- [Current report](18-final-report.md)
