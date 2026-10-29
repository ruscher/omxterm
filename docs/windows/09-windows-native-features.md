# Windows native features

## Present

- Frameless Windows title chrome with native minimize, maximize/restore, close,
  resize and snap behavior.
- Optional Windows Acrylic with opaque fallback.
- Per-user NSIS targets for ARM64 and x64.
- Passive installed-shell suggestions in Settings.
- PowerShell-aware lexical quoting for dropped local paths.

## Deferred

Explorer context-menu registration, Quake mode/global shortcuts, system
dashboard, administrative launchers, winget UI, taskbar integration and Windows
notifications are not implemented. Context-menu work also requires installer
ownership, update and uninstall tests; admin tools must elevate only the child
action rather than the whole terminal.
