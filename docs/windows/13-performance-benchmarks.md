# Performance benchmarks

No before/after runtime benchmark is claimed for this increment. Shell
discovery performs at most a small fixed number of asynchronous `stat` calls
once each time Settings loads on Windows. It creates no polling loop, process or
persistent cache.

The broader benchmark suite requested for startup, 1/16 sessions, sustained
output, scrollback, SSH and SFTP does not exist as one reproducible harness.
Existing rendering and output stress fixtures cover narrower contracts. A
future baseline must record hardware, Windows version, architecture, display,
Electron/Node versions, sample count and raw artifacts, then compare identical
build conditions. SSH/SFTP metrics cannot be added before those services exist.
