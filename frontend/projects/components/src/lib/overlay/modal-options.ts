export interface ModalOptions {
  /** Called when Escape is pressed inside the overlay. */
  onEscape: () => void;
  /** Element to focus first; defaults to the first `[autofocus]`, then the first focusable element. */
  initialFocus?: (host: HTMLElement) => HTMLElement | null;
  /** Where focus goes on close; defaults to the element focused when it opened (L2-067.4). */
  returnFocus?: () => HTMLElement | null;
}
