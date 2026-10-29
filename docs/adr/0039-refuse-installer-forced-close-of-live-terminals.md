# Refuse installer forced close of live terminals

## Context

The electron-builder NSIS template normally detects processes below the
installation directory, calls `Stop-Process`, waits briefly, and then forces
any survivors to exit. OMXTerm owns live ConPTY sessions whose completion is
tracked independently of its windows. Terminating Electron outside that drain
barrier can tear down a pseudoconsole while its shell is still running. A
Windows 10 x64 update reproduced this as a Windows PowerShell application
exception even though installation itself completed.

## Decision

Windows install, update and uninstall never terminate a running OMXTerm
process. A custom NSIS running-application check presents Retry/Cancel and
requires the user to close every OMXTerm instance through its normal UI before
continuing. Silent operation cancels while a matching process is live.

Normal application close remains governed by Busy Session confirmation and the
native-session completion barrier in ADRs 0017 and 0028. The installer retries
only process discovery; it does not execute a shell, send terminal input, waive
confirmation, impose a PTY timeout or infer completion from window loss.

The exact-installer verifier pins the custom include together with
`electron-builder.yml`. Changing either input requires an explicit review and a
new installer-footprint digest.

## Consequences

Interactive updates require one extra deliberate close-and-retry step when
OMXTerm is running. This favors terminal integrity over an apparently seamless
update. A hung native session can keep both ordinary quit and the installer
blocked; Cancel leaves the installed application untouched rather than forcing
success.

Packaging tests reject the reviewed include if the pinned footprint changes and
assert that it contains no `KILL_PROCESS` or `Stop-Process` path. Exact Windows
10 x64 VM qualification covered a four-tab instance: NSIS refused the live
process, normal close drained it, Retry completed the update, and the installed
application started without the earlier PowerShell exception.
