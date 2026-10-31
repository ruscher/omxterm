# Launch saved Windows shell profiles with literal arguments

## Context

The original Windows setting represented one executable and always launched it
with an empty argument vector. That cannot distinguish named variants of one
shell or select a WSL distribution without encoding arguments into a command
string. Passive discovery deliberately remains metadata and must not become
authority to execute an unvalidated candidate.

## Decision

User Configuration may contain `windowsProfiles` with one `default` id and
between 1 and 16 named profiles. Each profile has a stable lowercase ASCII id,
a bounded printable name, a bounded local drive-absolute executable and an
optional bounded array of literal arguments. `windowsProfiles` and the legacy
`windowsShell` key are mutually exclusive.

The configuration loader validates the complete structure on every platform.
On Windows it also follows and inspects every executable's final target; all
must be existing regular files before the collection becomes active. A new
Windows tab resolves the currently selected profile once, passes its executable
and argument array directly to `node-pty`, and uses its name as the fallback tab
title. No shell parses or constructs an intermediate command string. Existing
tabs retain their running processes after configuration reload.

Settings exposes the active profile's executable as read-only and leaves
profile creation, ordering, arguments and default selection to the validated
Config File editor. Fixed-location discovery remains non-executing suggestions
for the legacy single-executable field; it does not create profiles or enumerate
WSL distributions.

## Consequences

PowerShell flags and an explicitly configured WSL distribution can now be
represented without quoting ambiguity. Limits bound IPC and process-launch
inputs, and one invalid or unavailable executable rejects the collection rather
than activating a partial profile set.

There is not yet a graphical profile manager, per-profile working directory,
environment, icon, automatic WSL distribution discovery or trust assertion.
The legacy `windowsShell` key remains compatible for one executable with no
arguments.
