# Packaging and distribution

The repository configures per-user, one-click NSIS installers for Windows ARM64
and x64. User application data is preserved on uninstall. The payload uses ZIP
compression because the documented ARM64 BCJ2/NSIS extraction combination can
silently omit PE files. Packages include only the architecture-selected
node-pty prebuild.

The x64 NSIS installer was built and executed in the authorized disposable
Windows 10 VM after snapshot `before-omxterm-adr36-20261028`. The installed app
started successfully and passed the focused shell-selection checks. It was then
updated with the ADR 0038 profile build, which passed literal-argument launch.
That installer exposed an unsafe forced-close PowerShell exception. ADR 0039
replaced the packager default with a Retry/Cancel gate that never terminates the
running app. The corrected exact installer SHA-256 was
`64597ec39f631d56c604cfdb874344b4afce3f2f908aa34295f1138c1b4b0b82`.
In the same VM it refused a four-tab instance, allowed normal confirmed close to
drain its sessions, completed after Retry and started cleanly without the prior
exception.

No code signing identity, MSIX, winget manifest, portable distribution or
Explorer context-menu registration was added. Uninstall, Windows 11 and Windows
ARM64 packaging remain unqualified. Release versioning and publication remain
maintainer-owned.
