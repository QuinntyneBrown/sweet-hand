import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  type WritableSignal,
} from '@angular/core';
import { Icon } from '../icon/icon';
import { ModalLayer, type ModalRef } from '../overlay/modal-layer';
import { Photo } from '../photo/photo';
import type { GalleryPhoto } from './gallery';

/** The viewer's words, from the consumer's resource files (gallery CRD, API). */
export interface ViewerLabels {
  close: string;
  previous: string;
  next: string;
  /** "Loading photo 3 of 6" */
  loading: (n: number, total: number) => string;
  /** "Photo 4 of 6 didn't load" */
  failed: (n: number, total: number) => string;
  failedNote: string;
  retry: string;
}

type Phase = 'arriving' | 'ready' | 'failed';

/** Only a photo slower than this shows the spinner (gallery CRD, Performance). */
const SPINNER_DELAY_MS = 300;
/** A horizontal move longer than this is a swipe. */
const SWIPE_PX = 40;

let nextId = 0;

/**
 * The full-screen photo viewer (docs/specs/components/gallery.md): a modal in
 * the page colour with the count, previous and next, swipe, arrow keys, Home
 * and End, and the caption. It never wraps at the ends (D-4). Rendered while
 * the consumer keeps it in the template; Close and Escape emit `closed`.
 */
@Component({
  selector: 'sh-photo-viewer',
  imports: [Icon, Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ng-template #overlay>
      <div
        class="viewer"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="ids.title"
        [attr.aria-describedby]="ids.caption"
        [attr.aria-busy]="slow() ? 'true' : null"
        (keydown)="onKey($event)"
      >
        <div class="viewer__bar">
          <h2 class="visually-hidden" [id]="ids.title">{{ title() }}</h2>
          <p class="viewer__count" aria-live="polite">{{ count() }}</p>
          <button class="icon-btn" type="button" [attr.aria-label]="labels().close" autofocus (click)="close()"><svg shIcon="close"></svg></button>
        </div>
        <div class="viewer__stage" (pointerdown)="swipeFrom = $event.clientX" (pointerup)="onSwipe($event)">
          <button class="icon-btn" type="button" [attr.aria-label]="labels().previous" [attr.aria-disabled]="atStart() ? 'true' : null" (click)="go(index() - 1)">
            <svg shIcon="chevron-left"></svg>
          </button>
          @switch (phase()) {
            @case ('ready') {
              <sh-photo [src]="src()" [alt]="photo().caption" [width]="560" [height]="560" loading="eager" [failedLabel]="''" [standaloneLabel]="null" (loadFailed)="markFailed()" />
            }
            @case ('failed') {
              <sh-photo [src]="src()" [alt]="photo().caption" [width]="560" [height]="560" loading="eager" [failedLabel]="''" [standaloneLabel]="failedName()" />
            }
            @default {
              @if (slow()) {
                <sh-photo [alt]="photo().caption" status="pending" pendingIndicator="spinner" [failedLabel]="''" [standaloneLabel]="loadingName()" />
              } @else {
                <span class="photo"></span>
              }
            }
          }
          <button class="icon-btn" type="button" [attr.aria-label]="labels().next" [attr.aria-disabled]="atEnd() ? 'true' : null" (click)="go(index() + 1)">
            <svg shIcon="chevron-right"></svg>
          </button>
        </div>
        <p class="viewer__caption" [id]="ids.caption">
          {{ photo().caption }}
          @if (phase() === 'failed') {
            <br /><span class="text-muted text-sm">{{ labels().failedNote }}</span>
            <button class="btn btn--sm viewer__retry" type="button" (click)="retry()"><svg shIcon="refresh"></svg>{{ labels().retry }}</button>
          }
        </p>
      </div>
    </ng-template>
  `,
  styles: `
    .viewer__stage { touch-action: pan-y; }
  `,
})
export class PhotoViewer {
  readonly photos = input.required<readonly GalleryPhoto[]>();
  readonly index = model(0);
  readonly title = input.required<string>();
  readonly countLabel = input.required<(n: number, total: number) => string>();
  readonly labels = input.required<ViewerLabels>();

  readonly closed = output<{ index: number }>();
  readonly retried = output<{ index: number }>();

  protected readonly ids = { title: `sh-viewer-${++nextId}-title`, caption: `sh-viewer-${nextId}-caption` };
  protected swipeFrom: number | null = null;

  private readonly overlay = viewChild.required<TemplateRef<unknown>>('overlay');
  private readonly vcr = inject(ViewContainerRef);
  private readonly layer = inject(ModalLayer);
  private ref: ModalRef | null = null;

  /** Load state of each rendition, so neighbours preload and a retry reloads (D-6). */
  private readonly loads = new Map<string, WritableSignal<Phase>>();
  private readonly attempts = signal<Record<number, number>>({});

  private readonly total = computed(() => this.photos().length);
  private readonly clamped = computed(() => Math.min(Math.max(this.index(), 0), Math.max(this.total() - 1, 0)));
  protected readonly photo = computed(() => this.photos()[this.clamped()]);
  protected readonly src = computed(() => this.srcOf(this.clamped()));
  protected readonly phase = computed(() => this.load(this.src())());
  protected readonly slow = signal(false);
  protected readonly atStart = computed(() => this.clamped() === 0);
  protected readonly atEnd = computed(() => this.clamped() === this.total() - 1);
  protected readonly count = computed(() => this.countLabel()(this.clamped() + 1, this.total()));
  protected readonly loadingName = computed(() => this.labels().loading(this.clamped() + 1, this.total()));
  protected readonly failedName = computed(() => this.labels().failed(this.clamped() + 1, this.total()));

  constructor() {
    afterNextRender(() => {
      this.ref = this.layer.open(this.overlay(), this.vcr, {
        onEscape: () => this.close(),
        initialFocus: (host) => host.querySelector<HTMLElement>('[autofocus]'),
      });
    });
    inject(DestroyRef).onDestroy(() => this.ref?.close());

    // Each photo shown starts loading with its neighbours; the spinner waits 300 ms.
    effect((onCleanup) => {
      const i = this.clamped();
      this.src();
      untracked(() => {
        for (const n of [i, i + 1, i - 1]) if (n >= 0 && n < this.total()) this.load(this.srcOf(n));
        this.slow.set(false);
      });
      const timer = setTimeout(() => this.slow.set(untracked(this.phase) === 'arriving'), SPINNER_DELAY_MS);
      onCleanup(() => clearTimeout(timer));
    });
    effect(() => {
      if (this.phase() !== 'arriving') untracked(() => this.slow.set(false));
    });
  }

  protected go(i: number): void {
    if (i < 0 || i >= this.total() || i === this.clamped()) return;
    this.index.set(i);
  }

  /**
   * The layer closes first, so the page is no longer inert when `closed`
   * fires and the consumer can move focus to the right thumbnail (D-5).
   */
  protected close(): void {
    this.ref?.close();
    this.ref = null;
    this.closed.emit({ index: this.clamped() });
  }

  protected onKey(event: KeyboardEvent): void {
    const moves: Record<string, number> = { ArrowRight: this.clamped() + 1, ArrowLeft: this.clamped() - 1, Home: 0, End: this.total() - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    this.go(moves[event.key]);
  }

  protected onSwipe(event: PointerEvent): void {
    if (this.swipeFrom === null) return;
    const dx = event.clientX - this.swipeFrom;
    this.swipeFrom = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    this.go(this.clamped() + (dx < 0 ? 1 : -1));
  }

  protected markFailed(): void {
    this.load(this.src()).set('failed');
  }

  protected retry(): void {
    const i = this.clamped();
    this.attempts.update((a) => ({ ...a, [i]: (a[i] ?? 0) + 1 }));
    this.retried.emit({ index: i });
  }

  private srcOf(i: number): string {
    const base = this.photos()[i]?.viewerSrc ?? '';
    const attempt = this.attempts()[i];
    return attempt ? `${base}${base.includes('?') ? '&' : '?'}retry=${attempt}` : base;
  }

  /** The load state of one rendition, starting the request the first time it is asked for. */
  private load(src: string): WritableSignal<Phase> {
    let phase = this.loads.get(src);
    if (!phase) {
      const created = signal<Phase>('arriving');
      phase = created;
      this.loads.set(src, created);
      const img = new Image();
      img.onload = () => created.set('ready');
      img.onerror = () => created.set('failed');
      img.src = src;
    }
    return phase;
  }
}
