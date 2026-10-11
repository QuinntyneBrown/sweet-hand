import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { Icon } from '../icon/icon';
import type { Size } from './size';

/**
 * One round photo (docs/specs/components/photo.md): the image, a placeholder,
 * processing, failed or loading. The host is layout-transparent so parent
 * rules on `.photo` keep working.
 */
@Component({
  selector: 'sh-photo',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './photo.html',
})
export class Photo {
  readonly src = input<string | null>(null);
  readonly srcset = input<string | null>(null);
  readonly sizes = input<string | null>(null);
  readonly alt = input.required<string>();
  readonly width = input<number | null>(null);
  readonly height = input<number | null>(null);
  readonly loading = input<'eager' | 'lazy'>('lazy');
  readonly size = input<Size>('fluid');
  readonly status = input<'ready' | 'pending' | 'processing'>('ready');
  readonly pendingIndicator = input<'skeleton' | 'spinner'>('skeleton');
  readonly placeholderLabel = input<string | null>(null);
  readonly processingLabel = input<string | null>(null);
  readonly failedLabel = input<string | null>(null);
  readonly standaloneLabel = input<string | null>(null);

  readonly loadFailed = output<{ src: string }>();
  readonly loaded = output<{ src: string }>();

  protected readonly failed = signal(false);
  protected readonly cls = computed(() => (this.size() === 'fluid' ? 'photo' : `photo photo--${this.size()}`));
  /** Words fit only on fluid and large photos (D-3). */
  protected readonly showsLabel = computed(() => this.size() === 'fluid' || this.size() === 'lg');

  constructor() {
    // A new source is a new load: it clears the failed state (D-6).
    effect(() => {
      this.src();
      untracked(() => this.failed.set(false));
    });
  }

  protected fail(): void {
    this.failed.set(true);
    this.loadFailed.emit({ src: this.src() ?? '' });
  }
}

