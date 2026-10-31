# Resolve the Windows Default Shell from system layouts

## Context

When `windowsShell` is absent, OMXTerm needs a dependable interactive shell.
It previously preferred Windows PowerShell under `SystemRoot` and then executed
the inherited `ComSpec` value. Unlike a user-selected `windowsShell`, `ComSpec`
did not pass configuration validation and can name an arbitrary executable.
That made ambient process state an implicit executable-selection boundary.

## Decision

The built-in Windows resolution checks only two fixed layouts under a bounded
local-drive `SystemRoot`: Windows PowerShell 5.1, then Command Prompt. An absent
or malformed root uses the conventional local `C:\\Windows` fallback. UNC,
device and root-relative roots are not inspected. `ComSpec` is ignored.

An explicit `windowsShell` remains authoritative only after the existing
configuration loader has validated its absolute path and final regular-file
target. Candidate paths are passed directly to `node-pty`; no command string,
`PATH` search, candidate execution or shell-output probe is introduced.

## Consequences

The ordinary fallback remains Windows PowerShell followed by Command Prompt,
but cannot be redirected by `ComSpec`. Windows installed on a non-default drive
still uses its valid `SystemRoot`. A severely damaged environment with no valid
root and no shell under `C:\\Windows` fails explicitly instead of running an
ambient executable.
