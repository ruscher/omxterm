import { afterEach, describe, expect, it } from "vitest";
import { terminalApplicationMenuTemplate } from "../../src/main/application-menu";
import {
  mainTranslator,
  useInterfaceLanguage,
  useSystemLanguages,
} from "../../src/main/main-translator";
import {
  terminalApplicationFailure,
  terminalApplicationFailureDisplay,
} from "../../src/main/terminal-application-failure";
import { terminalSessionFailureDialog } from "../../src/main/terminal-session-failure";
import type { TerminalApplicationMenuActions } from "../../src/main/application-menu";
import { DEFAULT_TERMINAL_KEYBINDS } from "../../src/shared/terminal-keybinds";

const actions = new Proxy(
  {},
  { get: () => () => {} },
) as unknown as TerminalApplicationMenuActions;

afterEach(() => {
  useSystemLanguages(["en"]);
});

describe("main process language", () => {
  it("lets config.json override the system's languages", () => {
    useSystemLanguages(["pt-BR"]);
    expect(useInterfaceLanguage("en-US").locale).toBe("en");
    expect(useInterfaceLanguage("system").locale).toBe("pt-BR");
    useSystemLanguages(["en-GB"]);
    expect(useInterfaceLanguage("pt-BR").locale).toBe("pt-BR");
  });

  it("starts in English and follows the system's languages", () => {
    expect(mainTranslator().locale).toBe("en");
    useSystemLanguages(["pt-BR", "en-US"]);
    expect(mainTranslator().locale).toBe("pt-BR");

    const labels = terminalApplicationMenuTemplate(
      "OMXTerm",
      actions,
      DEFAULT_TERMINAL_KEYBINDS,
    ).map((item) => item.label);
    expect(labels).toEqual([
      "OMXTerm",
      "Editar",
      "Arquivo",
      "Exibir",
      "Terminal",
      "Janela",
    ]);
    expect(
      terminalSessionFailureDialog({
        reason: "rendering",
        launchKind: "default-shell",
      }).title,
    ).toBe("Falha na renderização do terminal");
    expect(
      terminalApplicationFailureDisplay(
        terminalApplicationFailure("new-window", new Error("x")),
      ).title,
    ).toBe("A janela de terminal não pôde abrir");
  });
});
