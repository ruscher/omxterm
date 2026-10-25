import type { SettingsBridge, SettingsSnapshot } from "../../shared/settings";
import type {
  KeybindChoice,
  KeybindState,
} from "../../shared/settings-keybinds";
import {
  displayAccelerator,
  TERMINAL_ACTION_NAMES,
  type TerminalActionName,
} from "../../shared/terminal-keybinds";
import { describeSettingsResult } from "./settings-dialog";

const LABELS: Readonly<Record<TerminalActionName, string>> = {
  quit: "Quit",
  copy: "Copy",
  paste: "Paste",
  selectAll: "Select All",
  find: "Find",
  newWindow: "New Window",
  closeWindow: "Close Window",
  newTab: "New Tab",
  closeTab: "Close Tab",
  nextTab: "Next Tab",
  previousTab: "Previous Tab",
  ...(Object.fromEntries(
    Array.from({ length: 9 }, (_, index) => [
      `selectTab${index + 1}`,
      `Select Tab ${index + 1}`,
    ]),
  ) as Record<`selectTab${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`, string>),
  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  actualSize: "Actual Size",
  toggleFullScreen: "Toggle Full Screen",
  toggleSnippets: "Toggle Snippets",
  toggleTabBar: "Toggle Tab Bar",
  toggleTitleBar: "Toggle Title Bar",
  reloadConfig: "Reload User Configuration",
};

const STATES: Readonly<Record<KeybindState, string>> = {
  inherit: "Default",
  custom: "Custom",
  unbound: "Unbound",
};

// Shortcut controls adapted from ruscher/omxterm PR #622 at
// b3c3a4ad6c1f2224bded65873ba0b09a07ec5d38 (MIT), for the nullable contract:
// each action inherits its default, has a custom binding or is unbound. A
// recorded key comes from main, so it never runs or reaches the terminal.
export function renderShortcuts(
  document: Document,
  bridge: SettingsBridge,
  context: {
    readonly snapshot: () => SettingsSnapshot | undefined;
    readonly platform: string;
    readonly live: () => boolean;
    readonly adopt: (next: SettingsSnapshot) => void;
    readonly report: (text: string, error: boolean) => void;
    readonly syncs: (() => void)[];
  },
) {
  const panel = document.createElement("div");
  panel.className = "settings-panel settings-shortcuts";
  const hint = document.createElement("p");
  hint.className = "settings-hint";
  hint.textContent =
    "Default follows the built-in shortcut. Unbound keeps the action in the menu without a key. App shortcuts take their key before terminal programs see it.";
  panel.append(hint);
  let recording: TerminalActionName | undefined;
  let stopCapture: (() => void) | undefined;
  const syncs: (() => void)[] = [];
  const syncAll = () => {
    for (const sync of syncs) sync();
  };
  // Ends any capture: on a new recording, cancel, page close or disposal.
  const release = () => {
    stopCapture?.();
    stopCapture = undefined;
    recording = undefined;
    syncAll();
  };
  const save = (action: TerminalActionName, choice: KeybindChoice) => {
    context.report("Saving…", false);
    void bridge.changeKeybind({ action, choice }).then(
      (result) => {
        if (!context.live()) return;
        context.adopt(result.snapshot);
        const message = describeSettingsResult(result);
        context.report(message.text, message.error);
      },
      () => {
        if (context.live())
          context.report("Not saved: the request failed.", true);
      },
    );
  };
  const record = (action: TerminalActionName) => {
    const again = recording === action;
    release();
    if (again) return;
    recording = action;
    syncAll();
    context.report("Press the new shortcut, or Escape to cancel.", false);
    stopCapture = bridge.captureShortcut((shortcut) => {
      if (!context.live() || recording !== action) return;
      if ("invalid" in shortcut) {
        context.report(
          "That key cannot be a shortcut by itself. Add Ctrl, Alt, Cmd or AltGr, or use F1–F24.",
          true,
        );
        return;
      }
      stopCapture = undefined;
      recording = undefined;
      syncAll();
      if ("cancelled" in shortcut)
        context.report("Recording cancelled.", false);
      else save(action, { state: "custom", accelerator: shortcut.accelerator });
    });
  };

  for (const action of TERMINAL_ACTION_NAMES) {
    const row = document.createElement("div");
    row.className = "settings-shortcut";
    const name = document.createElement("span");
    name.className = "settings-shortcut-name";
    name.textContent = LABELS[action];
    const value = document.createElement("span");
    value.className = "settings-shortcut-value";
    const state = document.createElement("span");
    state.className = "settings-shortcut-state";
    const button = (text: string, onClick: () => void) => {
      const element = document.createElement("button");
      element.type = "button";
      element.textContent = text;
      element.addEventListener("click", onClick);
      return element;
    };
    const recordButton = button("Record", () => record(action));
    recordButton.addEventListener("blur", () => {
      if (recording === action) release();
    });
    const unbind = button("Unbind", () => {
      release();
      save(action, { state: "unbound" });
    });
    const inherit = button("Default", () => {
      release();
      save(action, { state: "inherit" });
    });
    syncs.push(() => {
      const keybind = context.snapshot()?.keybinds?.[action];
      const shown =
        keybind?.effective === null || keybind === undefined
          ? "None"
          : (displayAccelerator(keybind.effective, context.platform) ??
            keybind.effective);
      value.textContent = recording === action ? "Press a shortcut…" : shown;
      state.textContent = keybind ? STATES[keybind.state] : "";
      recordButton.textContent = recording === action ? "Cancel" : "Record";
      recordButton.setAttribute(
        "aria-label",
        `Record shortcut for ${LABELS[action]}`,
      );
      unbind.disabled = keybind?.state === "unbound";
      inherit.disabled = keybind?.state === "inherit";
    });
    row.append(name, value, state, recordButton, unbind, inherit);
    panel.append(row);
  }
  context.syncs.push(syncAll);
  return { element: panel, release };
}
