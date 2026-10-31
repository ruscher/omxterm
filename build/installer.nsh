; A terminal process owns live ConPTY children. Terminating Electron from the
; installer can strand those children or make their shells fail while Windows
; tears down the pseudoconsole. Require the user to close OMXTerm through its
; normal quit path, which drains every native session before Electron exits.
!macro customCheckAppRunning
  !insertmacro IS_POWERSHELL_AVAILABLE

  checkOmxtermClosed:
    !insertmacro FIND_PROCESS "${APP_EXECUTABLE_FILENAME}" $R0
    ${if} $R0 == 0
      MessageBox MB_RETRYCANCEL|MB_ICONEXCLAMATION "$(appCannotBeClosed)" /SD IDCANCEL IDRETRY checkOmxtermClosed
      Quit
    ${endIf}
!macroend
