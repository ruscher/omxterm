# Report the PowerShell location through OSC 7

## Context

The Files panel and new panes follow a shell's folder. Linux can read it from
`/proc`; Windows cannot read it for PowerShell at all, because `Set-Location`
does not change the process working directory. Reading another process's
environment block would still report the wrong folder. A live test through
node-pty showed that ConPTY passes OSC 7 unchanged, and that the bundled Restty
patch dropped it before the host saw it, on every platform.

## Decision

Restty forwards OSC 7 to the host, which already bounds and validates it.

`windowsShellIntegration` defaults to `true`. A PowerShell started with an empty
argument vector receives `-NoLogo -NoExit -EncodedCommand` with a prompt wrapper
that reports file-system locations on drive paths and then runs the prompt it
wrapped. `false` restores the empty vector. This amends
[ADR 0044](0044-launch-saved-windows-shell-profiles-with-literal-arguments.md) only
for empty vectors: arguments a user wrote are never changed.

## Consequences

The feature works without a script file or an execution-policy change, and any
shell can use it by emitting OSC 7, such as an Oh My Posh prompt. PowerShell's
startup banner no longer prints while the setting is on. A pane still cannot tell
OMXTerm that a program is running: Windows panes stay conservatively Busy, so
browsing in the Files panel does not type a `cd` into them.
