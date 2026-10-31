import { app, ipcMain } from "electron";
import { terminalIpc } from "../shared/terminal-ipc";
import type { WindowsShellProfiles } from "../shared/windows-shell-profiles";
import { WINDOWS_SHELL_LABELS } from "../shared/windows-shells";
import { mainTranslator } from "./main-translator";
import type { IpcMainPort, TerminalIpcRouter } from "./terminal-ipc-types";
import { registerTrustedHandlers } from "./trusted-ipc";
import {
  createWindowsShellChoices,
  type WindowsShellChoices,
} from "./windows-shell-choices";

export function startWindowsShellChoices(
  router: Pick<TerminalIpcRouter, "isTrustedSender">,
  configured: () => {
    readonly windowsProfiles?: WindowsShellProfiles;
    readonly windowsShellIntegration: boolean;
  },
): WindowsShellChoices {
  const choices = createWindowsShellChoices({
    environment: process.env,
    profiles: () => configured().windowsProfiles,
    integration: () => configured().windowsShellIntegration,
    kindLabel: (kind) => mainTranslator().t(WINDOWS_SHELL_LABELS[kind]),
  });
  app.once(
    "will-quit",
    registerTrustedHandlers(
      ipcMain as unknown as IpcMainPort,
      router.isTrustedSender,
      {
        [terminalIpc.windowsShells]: () =>
          process.platform === "win32" ? choices.list() : [],
      },
    ),
  );
  return choices;
}
