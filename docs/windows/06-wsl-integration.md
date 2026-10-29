# WSL integration

The current increment can suggest the fixed system `wsl.exe` executable as a
generic Default Shell. This does not prove that WSL is enabled, that any
distribution is installed, or that launching the executable will succeed.

Users can save a profile whose executable is `wsl.exe` and whose literal
arguments are `--distribution`, followed by an explicit distribution name.
OMXTerm validates the executable but does not validate or discover that name.

Per-distribution discovery, Windows/WSL path conversion, `wslpath`,
`\\wsl$`/`\\wsl.localhost` navigation and file copy are not implemented.

Future discovery should execute only the fixed System32 `wsl.exe` with literal
arguments, bound time/output, preserve localized/encoding failures as unknown,
and never assume `/mnt/<drive>` automount policy. Native tests need absent WSL,
zero distributions, stopped distributions, international names and paths with
spaces.
