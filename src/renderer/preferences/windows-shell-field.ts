import { WINDOWS_SHELL_LABELS } from "../../shared/windows-shells";
import { field, textInput } from "../ui/form";
import { commitOnEnter, type PreferencesContext } from "./preferences-pages";

// Windows only: the program new local terminals start. Installed shells are
// offered as suggestions; any absolute path stays valid free text.
export function windowsShellField(context: PreferencesContext): HTMLElement {
  const snapshot = context.snapshot();
  const input = textInput(context.document, snapshot.values.windowsShell, {
    placeholder:
      "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
  });
  const list = context.document.createElement("datalist");
  list.id = "preferences-windows-shells";
  for (const suggestion of snapshot.windowsShells ?? []) {
    const option = context.document.createElement("option");
    option.value = suggestion.executable;
    option.label = context.t(WINDOWS_SHELL_LABELS[suggestion.kind]);
    list.append(option);
  }
  input.setAttribute("list", list.id);
  input.disabled = snapshot.windowsShellManaged === true;
  commitOnEnter(input);
  input.addEventListener("change", () =>
    context.save({ windowsShell: input.value.trim() }),
  );
  context.onSync((values) => {
    input.value = values.windowsShell;
  });
  const wrapper = field(
    context.document,
    context.t("prefs.windowsShell"),
    input,
    context.t(
      snapshot.windowsShellManaged
        ? "prefs.windowsShellManaged"
        : "prefs.windowsShellHint",
    ),
  );
  wrapper.element.append(list);
  return wrapper.element;
}
