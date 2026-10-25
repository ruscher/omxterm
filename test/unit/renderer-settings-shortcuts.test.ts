// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createSettingsDialog } from "../../src/renderer/settings/settings-dialog";
import type {
  SettingsBridge,
  SettingsResult,
  SettingsSnapshot,
} from "../../src/shared/settings";
import type {
  CapturedShortcut,
  SettingsKeybindChange,
} from "../../src/shared/settings-keybinds";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => document.body.replaceChildren());

const snapshot = (find: {
  effective: string | null;
  state: "inherit" | "custom" | "unbound";
}): SettingsSnapshot => ({
  configurationPath: "/synthetic/omxterm/config.json",
  platform: "linux",
  revision: "r1",
  text: '{ "version": 1 }\n',
  values: {},
  keybinds: {
    find,
    newTab: { effective: "Control+Shift+T", state: "inherit" },
  },
});

async function open() {
  let current = snapshot({ effective: "Control+Shift+F", state: "inherit" });
  let deliver: ((shortcut: CapturedShortcut) => void) | undefined;
  const stopCapture = vi.fn();
  const changeKeybind = vi.fn(
    async (change: SettingsKeybindChange): Promise<SettingsResult> => {
      const { choice } = change;
      current = snapshot(
        choice.state === "custom"
          ? { effective: choice.accelerator, state: "custom" }
          : choice.state === "unbound"
            ? { effective: null, state: "unbound" }
            : { effective: "Control+Shift+F", state: "inherit" },
      );
      return {
        status: "saved",
        snapshot: current,
        application: { applied: true, notices: [] },
      };
    },
  );
  const bridge: SettingsBridge = {
    snapshot: async () => current,
    change: vi.fn(),
    saveText: vi.fn(),
    changeKeybind,
    captureShortcut: vi.fn((listener: (shortcut: CapturedShortcut) => void) => {
      deliver = listener;
      return stopCapture;
    }),
    onOpen: () => () => {},
  };
  const dialog = createSettingsDialog(document, bridge, {
    focusTerminal: vi.fn(),
    onActivityChange: vi.fn(),
  });
  await dialog.open();
  [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    .find((tab) => tab.textContent === "Shortcuts")!
    .click();
  const row = (name: string) =>
    [...document.querySelectorAll<HTMLElement>(".settings-shortcut")].find(
      (element) =>
        element.querySelector(".settings-shortcut-name")?.textContent === name,
    )!;
  const cells = (name: string) =>
    [".settings-shortcut-value", ".settings-shortcut-state"].map(
      (selector) => row(name).querySelector(selector)!.textContent,
    );
  const button = (name: string, label: string) =>
    [...row(name).querySelectorAll("button")].find(
      (element) => element.textContent === label,
    )!;
  const settle = async () => {
    for (let index = 0; index < 4; index += 1) await Promise.resolve();
  };
  const status = () => document.querySelector(".settings-status")!.textContent;
  return {
    dialog,
    bridge,
    changeKeybind,
    stopCapture,
    deliver: (shortcut: CapturedShortcut) => deliver!(shortcut),
    cells,
    button,
    settle,
    status,
  };
}

describe("Shortcuts page", () => {
  it("shows each action's effective shortcut and state", async () => {
    const view = await open();
    expect(view.cells("Find")).toEqual(["Ctrl+Shift+F", "Default"]);
    expect(view.cells("New Tab")).toEqual(["Ctrl+Shift+T", "Default"]);
    expect(view.cells("Quit")).toEqual(["None", ""]);
    expect(view.button("Find", "Default").disabled).toBe(true);
  });

  it("records a shortcut from main and saves it as custom", async () => {
    const view = await open();
    view.button("Find", "Record").click();
    expect(view.cells("Find")[0]).toBe("Press a shortcut…");
    view.deliver({ invalid: true });
    expect(view.status()).toContain("cannot be a shortcut by itself");
    expect(view.changeKeybind).not.toHaveBeenCalled();
    view.deliver({ accelerator: "F2" });
    await view.settle();
    expect(view.changeKeybind).toHaveBeenCalledExactlyOnceWith({
      action: "find",
      choice: { state: "custom", accelerator: "F2" },
    });
    expect(view.cells("Find")).toEqual(["F2", "Custom"]);
    expect(view.status()).toBe("Saved.");
  });

  it("cancels recording without saving and unbinds or restores the default", async () => {
    const view = await open();
    view.button("Find", "Record").click();
    view.deliver({ cancelled: true });
    expect(view.status()).toBe("Recording cancelled.");
    expect(view.changeKeybind).not.toHaveBeenCalled();

    view.button("Find", "Unbind").click();
    await view.settle();
    expect(view.cells("Find")).toEqual(["None", "Unbound"]);
    view.button("Find", "Default").click();
    await view.settle();
    expect(
      view.changeKeybind.mock.calls.map(([change]) => change.choice),
    ).toEqual([{ state: "unbound" }, { state: "inherit" }]);
    expect(view.cells("Find")).toEqual(["Ctrl+Shift+F", "Default"]);
  });

  it("ends capture when recording is toggled off or the dialog closes", async () => {
    const view = await open();
    view.button("Find", "Record").click();
    view.button("Find", "Cancel").click();
    expect(view.stopCapture).toHaveBeenCalledOnce();
    view.button("New Tab", "Record").click();
    view.dialog.dispose();
    expect(view.stopCapture).toHaveBeenCalledTimes(2);
    view.deliver({ accelerator: "F3" });
    await view.settle();
    expect(view.changeKeybind).not.toHaveBeenCalled();
  });
});
