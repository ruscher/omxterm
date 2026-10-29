# SSH architecture

OMXTerm has no SSH broker, saved connections, OpenSSH configuration importer,
known-hosts manager, credential store, forwarding manager or connection
observatory in this checkout. Users may run the platform `ssh` executable in a
normal terminal session, so host-key checking, agents, ProxyJump and MFA remain
owned by that client.

An integrated suite is deferred pending a product/architecture decision. Any
future implementation must keep credentials out of argv, renderer state, URLs
and logs; preserve strict host-key checking; never remove `known_hosts` entries
automatically; distinguish native OpenSSH capabilities by platform; and avoid
claiming ControlMaster-style multiplexing on Windows without real shared-channel
evidence.
