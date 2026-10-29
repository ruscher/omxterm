# Windows architecture

## Current boundary

```text
Renderer (unprivileged Settings UI)
        ↓ validated snapshot/change messages
Preload (minimal typed bridge)
        ↓
Electron main
  ├─ strict config validation and atomic user-requested writes
  ├─ passive fixed-location shell discovery
  ├─ saved-profile selection and literal argv validation
  └─ node-pty session ownership
             ↓
       ConPTY / child shell
```

Shell suggestions are metadata only. Main performs filesystem inspection;
renderer receives a bounded list and can only request the existing
`windowsShell` configuration change. Choosing a value does not bypass the
startup loader's absolute-path and regular-file validation.

Saved profiles are separate user configuration. Main validates every
executable and literal argument vector, selects the configured default for each
new tab, and passes `file` plus `argv` directly to node-pty. Settings displays
an active profile as read-only; structural changes use the raw Config File
editor and the same loader.

The portable Terminal Surface continues to receive an Adapter and imports no
Electron, node-pty or Windows APIs. Platform checks remain concentrated in main
services and host construction rather than terminal parsing/rendering.

## Future boundary

The current profile model deliberately omits starting directory, environment,
icon and platform identity. WSL distribution discovery would be a separate
main-process provider. It must not encode arguments into a single command
string or turn a displayed suggestion into authority to execute.
