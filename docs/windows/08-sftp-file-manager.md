# SFTP file manager

No SFTP file manager or transfer queue is implemented. `sftp` can run as a CLI
child. Local image preview is not remote preview: a visible remote path still
names a file on the OMXTerm host.

Before an integrated manager is in scope, its design needs a separately audited
SSH transport, destination-root containment across Windows reparse points and
case rules, temporary-file plus atomic-replace policy, explicit overwrite,
cancellation/backpressure, size limits and hostile-server tests. HTML, scripts,
macros and active remote content must never execute as preview.
