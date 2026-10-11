import type { ToastTone } from './toast-tone';

export interface ToastOptions {
  tone?: ToastTone;
  title: string;
  text?: string | null;
  action?: { label: string; href?: string; run?: () => void } | null;
  persistent?: boolean;
  durationMs?: number;
  restoreFocusTo?: HTMLElement | null;
}
