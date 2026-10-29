# Suggest Windows shells without executing them

## Context

The User Configuration accepts one validated absolute `windowsShell` executable
path, but Settings previously required users to type that path even for common
installed shells. Searching `PATH`, starting candidates to ask for a version or
parsing shell output would make opening Settings depend on executable content
and ambient process search order. A suggestion is not a saved profile: the
current model carries no arguments, environment or WSL distribution identity.

## Decision

On every Windows Settings load, main checks a bounded fixed set of local-drive
installation paths for PowerShell 7, Windows PowerShell, Command Prompt, the WSL
launcher, Git Bash, MSYS2 and Cygwin. It accepts only bounded drive-absolute
environment roots, rejecting UNC, device, root-relative and malformed values so
discovery cannot touch a network share. Candidates are deduplicated
case-insensitively and included only when their final target is an existing
regular file. Inspection failures mean unavailable.

Main sends at most 16 bounded suggestions through the validated Settings
snapshot. Renderer exposes them through the existing editable shell field; a
custom absolute path remains possible. Discovery never searches `PATH`, starts
a candidate, reads its output, writes configuration or changes the Default
Shell. An explicit user selection still passes the ordinary full configuration
loader and atomic write path.

## Consequences

PowerShell 7 can be selected conveniently without changing existing users'
defaults or implying trust from file existence. Settings load performs a small
fixed number of asynchronous file inspections and no background polling.

Custom installation roots, Visual Studio developer environments, PowerShell
preview channels and individual WSL distributions are not discovered. File
existence does not establish publisher, architecture, ACL safety or successful
startup. The later saved-profile model remains separate and uses literal
argument vectors (ADR 0038).
