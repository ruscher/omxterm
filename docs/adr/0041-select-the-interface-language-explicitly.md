# Select the interface language explicitly

## Context

OMXTerm's own interface text (native menus, dialogs, Window Chrome, the
Auxiliary Panel, Local Image Preview, About and Scrollback Search controls) was
English only. Contributors asked for Brazilian Portuguese. Inferring a language
from the operating system would make the interface depend on host state that the
User Configuration does not record, and different processes could disagree.

## Decision

The User Configuration's optional `language` key selects the interface language
from a closed list of exact values: `system` (default), `en-US` and `pt-BR`. Any
other value is a validation error under
[ADR 0003](0003-strict-non-mutating-user-configuration.md).

`system` follows the operating system's preferred languages, which is how OMXTerm
already behaved before this setting existed, so an upgrade keeps every existing
user's language. An explicit value overrides the system, so all processes agree
on a value the configuration records.

English is the source catalog. Other catalogs fall back to English for a missing
message, and unit tests require that every key is translated unless it is listed
as shared. Plural forms use `Intl.PluralRules` for the selected language.
Translations are bundled static data; parameters are interpolated as literal text.

The Preferences dialog offers the same key as a **Language** choice and writes it
like any other setting. Main applies it when configuration loads and on every
reload, so menus and native dialogs change at once. A renderer reads it once when
its window opens: open windows keep their language until reopened, so a change
never recreates tabs, Surfaces or sessions.

These stay English: the validator's diagnostic detail inside a translated reload
notice, failures reported before the configuration loads, Operational Events and
logs ([ADR 0004](0004-log-the-operational-envelope-not-terminal-payload.md)), `snippets.yaml`
diagnostics, and text owned by the operating system, Electron or Restty that
OMXTerm does not set.

## Consequences

Adding a language means adding one complete catalog and its tag; the config
schema, docs and tests list the accepted tags. Terminal Payload, shell output and
program text are never translated. Diagnostics stay in a single language for
support and issue reports.
