import { effect, signal, untracked, type Signal, type WritableSignal } from '@angular/core';
import type { FormDialogOptions } from './form-dialog-options';
import { problemOf, type Problem } from './problem';

/**
 * The lifecycle every dialog with a form shares: the attempt count that moves
 * focus to the error summary, the busy and failed flags, and the field errors.
 * Each opening starts afresh. Create it in a field initializer, where `effect`
 * has its injection context.
 */
export class FormDialogState<E = null, S = void> {
  /** Counts rejected submits so the error summary takes focus each time. */
  readonly attempt = signal(0);
  readonly busy = signal(false);
  /** The last request failed for a reason the form cannot show. */
  readonly failed = signal(false);
  readonly errors: WritableSignal<E>;

  private readonly options: FormDialogOptions<E, S>;

  constructor(open: Signal<boolean>, options: FormDialogOptions<E, S>) {
    this.options = options;
    this.errors = signal<E>(options.noErrors);
    effect(() => {
      if (!open()) return;
      const from = options.from?.() as S;
      untracked(() => this.open(from));
    });
  }

  /** Starts the dialog afresh. */
  open(from: S): void {
    this.errors.set(this.options.noErrors);
    this.failed.set(false);
    this.attempt.set(0);
    this.options.reset?.(from);
  }

  /** Shows `errors`, counting the attempt when there are any. True when the form can be sent. */
  validate(errors: E): boolean {
    this.failed.set(false);
    this.errors.set(errors);
    if (!hasErrors(errors)) return true;
    this.attempt.update((n) => n + 1);
    return false;
  }

  /** Shows errors the server found, counting the attempt. Returns true, for a `submit` handler. */
  reject(errors: E): true {
    this.errors.set(errors);
    this.attempt.update((n) => n + 1);
    return true;
  }

  /**
   * Runs `action` while busy. A failure goes to `handle`, which returns true
   * when it dealt with it (usually through `reject`); otherwise the dialog
   * shows that the request failed.
   */
  async submit(action: () => Promise<unknown>, handle?: (status: number, problem: Problem) => boolean | void | Promise<boolean>): Promise<void> {
    this.failed.set(false);
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (!(await handle?.(status, problem))) this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

/** A message, or an object holding at least one message. */
function hasErrors(errors: unknown): boolean {
  if (!errors) return false;
  if (typeof errors === 'object') return Object.values(errors).some(Boolean);
  return true;
}
