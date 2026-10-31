import {
  createTranslator,
  resolveInterfaceLocale,
  resolveLocale,
  type InterfaceLanguage,
  type Translator,
} from "../shared/i18n";

// The language of menus and dialogs drawn by the main process: English until
// startup applies the system's preferred languages, then whatever config.json
// selects once it has loaded.
let active: Translator = createTranslator("en");
let systemLanguages: readonly string[] = [];

export const mainTranslator = (): Translator => active;

export function useSystemLanguages(languages: readonly string[]): Translator {
  systemLanguages = [...languages];
  active = createTranslator(resolveLocale(languages));
  return active;
}

export function useInterfaceLanguage(language: InterfaceLanguage): Translator {
  active = createTranslator(resolveInterfaceLocale(language, systemLanguages));
  return active;
}
