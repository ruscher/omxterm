# Current Windows increment report

## Executive summary

This increment completed the first safe piece of Windows shell ergonomics:
Settings can offer common installed shells from fixed standard locations while
preserving custom paths, strict configuration validation and explicit user
choice. It also corrected the roadmap's assumptions against the actual small
product: no nonexistent SSH/SFTP/credential modules or unimplemented UI is
claimed.

## Implemented

- Passive discovery for PowerShell 7, Windows PowerShell, Command Prompt, WSL,
  Git Bash, MSYS2 and Cygwin.
- Case-insensitive root/candidate deduplication and bounded environment inputs.
- Bounded shared snapshot validation and an editable Settings datalist.
- Explicit Settings-load discovery with no polling, candidate execution or
  config write.
- Unit tests for fixed-location behavior, hostile/malformed paths, failures,
  Settings-load refresh, UI suggestions and custom input.
- A separate saved Windows profile schema with strict ids/names, 1–16 validated
  executables, bounded literal argument vectors and current-default selection.
- Direct `file`/`argv` profile launch for future tabs, with a profile-name
  fallback title and no intermediate command string.

## Verification

Focused unit tests, formatting, TypeScript checking, lint, the unpackaged build
and Windows x64 packaging passed on Linux x64. The pre-change full unit baseline
had 36 Linux AppImage installer failures due to the unsupported x64 host
rejecting ARM64-only fixture input. The exact x64 NSIS artifact was then
installed in a snapshotted Windows 10 x64 VM: the packaged app started, offered
six actually installed shells, and reached an interactive prompt with every
one. It carried Git, Node, Python and OpenSSH version output, interrupted a
continuous native command with Ctrl+C, reflowed on maximize, saved and launched
CMD, and restored the built-in Windows PowerShell default. The ADR 0038 update
was then installed from exact SHA-256
`f1ce838909bdd56c486bea24b981531d2c150f5ec17bdb17630688962604bdb1`.
The update completed and relaunched the app, although its forced close of the
running multi-tab instance displayed a Windows PowerShell exception dialog, so
the update-close experience remains partial.
A saved PowerShell 7 profile opened under its configured name, suppressed the
logo, printed `OMXTERM_PROFILE_ARGV_OK` through its literal `-Command`, remained
interactive through `-NoExit`, and returned future tabs to Windows PowerShell
after the profile-free configuration was restored. This focused PASS does not
cover Windows 11, ARM64, WSL, SFTP or full `check:win`.

## Security

No executable is launched during discovery, no `PATH` search occurs and no
setting changes without explicit input. The existing loader remains the final
absolute-path/regular-file authority. Built-in resolution also ignores ambient
`ComSpec` and uses fixed SystemRoot layouts. Publisher, ACL and runtime
qualification are intentionally not inferred from existence.

## Pending

The full roadmap is not complete. Highest-value next work is the remaining
ConPTY lifecycle matrix, followed by optional per-distribution WSL discovery
and profile environment/working-directory design. SSH/SFTP and other large
features need separate scope and architecture decisions.
