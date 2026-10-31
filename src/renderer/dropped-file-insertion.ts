import type { ShellDialect } from "../shared/shell-dialect";
import { TERMINAL_TAB_DRAG_DATA_TYPE } from "./tab-strip";

interface FileDropOptions {
  readonly previewActive: () => boolean;
  readonly insert:
    ((files: readonly File[], dialect?: ShellDialect) => string) | undefined;
  readonly inject: (text: string) => void;
  // A live pane's state, when one is focused and main can report it.
  readonly focusedPane: () =>
    Promise<{ readonly dialect?: ShellDialect } | null> | undefined;
  readonly isDisposed: () => boolean;
}

// Dropped files become quoted paths for the focused pane's shell when main can
// name it; without a live pane the quoting stays the platform's.
export function fileDropHandlers(options: FileDropOptions) {
  const isInternalTabDrag = (event: DragEvent) =>
    [...(event.dataTransfer?.types ?? [])].includes(
      TERMINAL_TAB_DRAG_DATA_TYPE,
    );
  return {
    onDragOver(event: DragEvent) {
      event.preventDefault();
      if (options.previewActive() || !isInternalTabDrag(event))
        event.stopPropagation();
    },
    onDrop(event: DragEvent) {
      // Capture before the Terminal Surface or another target can interpret a
      // native file URI.
      event.preventDefault();
      if (options.previewActive()) {
        event.stopPropagation();
        return;
      }
      if (isInternalTabDrag(event)) return;
      event.stopPropagation();
      const files = event.dataTransfer?.files;
      const insert = options.insert;
      if (!files || files.length === 0 || !insert) return;
      const dropped = [...files];
      const insertFor = (dialect?: ShellDialect) => {
        const insertion =
          dialect === undefined ? insert(dropped) : insert(dropped, dialect);
        if (insertion.length > 0) options.inject(insertion);
      };
      const pane = options.focusedPane();
      if (!pane) {
        insertFor();
        return;
      }
      void pane
        .catch(() => null)
        .then((state) => {
          if (!options.isDisposed()) insertFor(state?.dialect);
        });
    },
  };
}
