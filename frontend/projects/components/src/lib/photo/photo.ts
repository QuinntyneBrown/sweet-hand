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
  template: `
    @if (status() === 'pending') {
      @if (pendingIndicator() === 'spinner') {
        <span [class]="cls() + ' photo--placeholder'" [attr.role]="standaloneLabel() ? 'img' : null" [attr.aria-label]="standaloneLabel()"><span class="spinner spinner--lg"></span></span>
      } @else {
        <span [class]="cls()" [attr.role]="standaloneLabel() ? 'img' : null" [attr.aria-label]="standaloneLabel()"><span class="skeleton skeleton--circle"></span></span>
      }
    } @else if (status() === 'processing') {
      <span [class]="cls() + ' photo--placeholder'"><svg shIcon="clock"></svg>@if (showsLabel() && processingLabel()) {<span class="photo__label">{{ processingLabel() }}</span>}</span>
    } @else if (failed()) {
      <span [class]="cls() + ' photo--failed'" [attr.role]="standaloneLabel() ? 'img' : null" [attr.aria-label]="standaloneLabel()"
        ><svg shIcon="plate"></svg>@if (showsLabel() && !standaloneLabel()) {<span class="photo__label">{{ failedLabel() }}</span>}</span
      >
    } @else if (src()) {
      <span [class]="cls()"
        ><img
          [src]="src()"
          [attr.srcset]="srcset()"
          [attr.sizes]="sizes()"
          [alt]="alt()"
          [width]="width()"
          [height]="height()"
          [attr.loading]="loading() === 'lazy' ? 'lazy' : null"
          (load)="loaded.emit({ src: src()! })"
          (error)="fail()"
      /></span>
    } @else {
      <span [class]="cls() + ' photo--placeholder'"><svg shIcon="plate"></svg>@if (showsLabel() && placeholderLabel()) {<span class="photo__label">{{ placeholderLabel() }}</span>}</span>
    }
  `,
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

