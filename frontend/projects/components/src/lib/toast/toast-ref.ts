import type { ToastDismissReason } from './toast-dismiss-reason';

export interface ToastRef {
  dismiss(): void;
  readonly dismissed: Promise<ToastDismissReason>;
}
