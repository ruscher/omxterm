import { clipboard, dialog, type BrowserWindow } from "electron";
import {
  isFilePathPlatform,
  readClipboardPathInsertion,
} from "../shared/file-path-insertion";
import type { TerminalContextMenuRequest } from "../shared/terminal-contract";
import { mainTranslator } from "./main-translator";
import { confirmProtectedPaste } from "./native-confirmations";
import { showTerminalContextMenu } from "./terminal-context-menu";

const showClipboardError = () =>
  dialog.showErrorBox(
    mainTranslator().t("failure.clipboard.title"),
    mainTranslator().t("failure.clipboard.message"),
  );

export function windowClipboardOptions(
  window: BrowserWindow,
  closePane: () => void,
  keybinds: () => { readonly closePane: string | null },
) {
  return {
    writeClipboardText: (text: string) => clipboard.writeText(text),
    readClipboardText: () =>
      isFilePathPlatform(process.platform)
        ? readClipboardPathInsertion(clipboard, process.platform)
        : clipboard.readText(),
    onClipboardError: showClipboardError,
    confirmPaste: () => confirmProtectedPaste(window),
    showClipboardContextMenu: (request?: TerminalContextMenuRequest) =>
      showTerminalContextMenu(
        window,
        request?.closePane
          ? { click: closePane, accelerator: keybinds().closePane }
          : undefined,
      ),
  };
}
