# PowerShell integration

OMXTerm currently hosts Windows PowerShell or PowerShell 7 as ordinary ConPTY
children. It does not inject a profile or shell integration, replace PSReadLine,
inspect pipelines/objects, or execute generated commands. This preserves the
user's PowerShell profile, PSReadLine modes, completion and prediction behavior.

The completed increment makes the standard PowerShell 7 executable discoverable
as an explicit Settings suggestion. Selecting it affects new tabs only and uses
the existing strict executable validation.

Command Explorer and Script Lab are not implemented. Before either is accepted,
the project needs a main-process PowerShell query contract with literal scripts
from application-owned resources, bounded structured output, timeouts and clear
execution confirmation. PSScriptAnalyzer and Pester must remain optional local
tools; OMXTerm must never change execution policy to run them.
