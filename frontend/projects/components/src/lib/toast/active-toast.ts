import type { ToastOptions } from './toast-options';
import type { ToastTone } from './toast-tone';
import type { ToastDismissReason } from './toast-dismiss-reason';

export interface ActiveToast extends Required<Pick<ToastOptions, 'title'>> {
  id: number;
  tone: ToastTone;
  text: string | null;
  action: ToastOptions['action'];
  persistent: boolean;
  durationMs: number;
  restoreFocusTo: HTMLElement | null;
  resolve: (reason: ToastDismissReason) => void;
  timer?: ReturnType<typeof setTimeout>;
}
