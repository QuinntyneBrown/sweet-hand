/** How a `FormDialogState` starts each time its dialog opens. */
export interface FormDialogOptions<E, S> {
  /** The errors of a fresh form: none. */
  noErrors: E;
  /** What the dialog starts from, read tracked: a change while it is open starts it again. */
  from?: () => S;
  /** Puts the dialog's own fields back, from `from`, each time it opens. */
  reset?: (from: S) => void;
}
