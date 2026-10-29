# Security and privacy

The shell suggestion increment keeps privileged filesystem inspection in main.
It validates environment-derived roots as bounded absolute Windows paths,
rejects UNC/device/root-relative values so discovery cannot touch a network
share, deduplicates case-insensitively, follows each final target only to ask
whether it is a regular file, and ignores failures. It does not search `PATH`,
spawn a candidate, read its output or write configuration during discovery.

Built-in Default Shell resolution likewise ignores inherited `ComSpec`. It
checks only Windows PowerShell and Command Prompt under a bounded local-drive
`SystemRoot`, with `C:\\Windows` as the conventional fallback when that root is
missing or malformed. Explicit custom shells still require full configuration
validation.

Saved profiles remain a configuration boundary rather than a discovery result.
Their ids, names, local drive-absolute executables, counts and literal argument
vectors are bounded before use. On Windows every final executable target must
be a regular file. Main passes `file` and `argv` separately to node-pty; it never
interpolates profile data into a command string. The complete collection is
rejected on one invalid member, and Settings cannot rewrite the selected
profile through its legacy executable control.

Shared IPC validation bounds the suggestion count to 16, accepts only a closed
shell-kind vocabulary, and limits executable strings to the Windows maximum
path-scale bound of 32,767 while rejecting NUL. Localized display names come
from OMXTerm's static catalogs rather than main-process data. Suggestions are
not an authorization boundary: when the user selects one, the existing
configuration loader again requires an absolute existing regular-file target
before an atomic config replacement.

Residual risk: existence does not establish publisher identity, ACL safety,
architecture compatibility or successful execution. Standard locations can be
modified by software with appropriate local privileges. The UI therefore calls
discovered items suggestions, while saved profiles are user configuration
rather than trusted executables. Windows native ACL/reparse-point adversarial
tests remain outstanding.
