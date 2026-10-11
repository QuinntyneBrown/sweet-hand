import { DestroyRef, computed, inject, signal } from '@angular/core';
import { time } from '../../../core/format/format';
import type { SaveState } from './save-state';

/** Draft autosave waits this long after the last change (L2-038.1). */
export const AUTOSAVE_DELAY_MS = 2000;

/**
 * Saves a section 2 seconds after the last change, or at once when a field
 * loses focus (set-up-profile, DraftAutosave). The page supplies `run`, which
 * validates and saves, resolving to the outcome.
 */
export class Autosave {
  readonly state = signal<SaveState>('saved');
  /** When the last save in this visit finished; null until then ("Saved"). */
  readonly savedAt = signal<Date | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;
  private dirty = false;
  private running: Promise<void> | null = null;

  constructor(
    private readonly run: () => Promise<'saved' | 'invalid' | 'failed'>,
    private readonly published: () => boolean,
  ) {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** "Saved", "Saved at 10:14 a.m. · live on your page within a minute", "Saving…". */
  readonly text = computed(() => {
    switch (this.state()) {
      case 'saving':
        return $localize`:@@autosave.saving:Saving…`;
      case 'failed':
        return $localize`:@@autosave.failed:Not saved: check your connection. We’ll try again when you make a change.`;
      case 'invalid':
        return '';
      default: {
        const at = this.savedAt();
        if (!at) return $localize`:@@autosave.saved:Saved`;
        return this.published()
          ? $localize`:@@autosave.savedLive:Saved at ${time(at)}:time: · live on your page within a minute`
          : $localize`:@@autosave.savedAt:Saved at ${time(at)}:time:`;
      }
    }
  });

  /** A value changed: save once typing has paused. */
  changed(): void {
    this.dirty = true;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), AUTOSAVE_DELAY_MS);
  }

  /** A field lost focus: save now if anything changed. */
  async flush(): Promise<void> {
    clearTimeout(this.timer);
    if (!this.dirty) return;
    if (this.running) await this.running;
    this.dirty = false;
    this.running = this.save();
    await this.running;
    this.running = null;
  }

  private async save(): Promise<void> {
    this.state.set('saving');
    const outcome = await this.run();
    if (outcome === 'saved') {
      this.savedAt.set(new Date());
      this.state.set('saved');
    } else {
      this.state.set(outcome);
    }
  }
}
