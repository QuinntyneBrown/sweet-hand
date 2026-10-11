import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { Photo } from '../photo/photo';
import type { GalleryPhoto } from './gallery-photo';

/** Image sizes for the lead and the thumbnails (gallery CRD D-8). */
const LEAD_SIZES = '(min-width: 62rem) 30rem, (min-width: 36rem) 24rem, 80vw';
const THUMB_SIZES = '(min-width: 62rem) 14rem, (min-width: 36rem) 8rem, 80vw';
/** Photos in the first view load eagerly; the rest wait (L2-085). */
const EAGER = 3;
/** The lead + grid shows 5 photos (LG–XL); the lead + strip shows 6 (SM–MD). */
const SCRIM_AT = [5, 6];

/**
 * The caterer page's photo gallery (docs/specs/components/gallery.md): a
 * carousel with dots on phones, a lead and strip on tablets, a lead and 2 × 2
 * grid on desktops, chosen by CSS. Every photo opens the viewer.
 */
@Component({
  selector: 'sh-gallery',
  imports: [Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    <section class="gallery" [attr.aria-label]="label()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        <ul class="gallery__track" aria-hidden="true">
          @for (i of [0, 1, 2, 3, 4]; track i) {
            <li><span class="photo"><span class="skeleton skeleton--circle"></span></span></li>
          }
        </ul>
      } @else {
        <ul #track class="gallery__track" (scroll)="onScroll()">
          @for (p of photos(); track $index; let i = $index) {
            <li>
              <button class="gallery__btn" type="button" aria-haspopup="dialog" [attr.aria-label]="names()[i]" (click)="opened.emit({ index: i, trigger: $any($event.currentTarget) })">
                <sh-photo
                  [src]="p.src"
                  [srcset]="p.srcset"
                  [sizes]="i === 0 ? leadSizes : thumbSizes"
                  alt=""
                  [width]="p.width"
                  [height]="p.height"
                  [loading]="i < eager ? 'eager' : 'lazy'"
                  [failedLabel]="failedLabel()"
                  (loadFailed)="markFailed(i)"
                />
              </button>
              @if (scrim(i); as more) {
                <span class="gallery__more" aria-hidden="true">{{ more.visible }}</span>
              }
            </li>
          }
        </ul>
        <div class="gallery__dots" aria-hidden="true">
          @for (p of photos(); track $index; let i = $index) {
            <span [attr.aria-current]="i === current() ? 'true' : null"></span>
          }
        </div>
      }
    </section>
  `,
  // The "+N" scrim is decoration over the button: a tap on it opens that photo.
  styles: `.gallery__more { pointer-events: none; }`,
})
export class Gallery {
  readonly photos = input.required<readonly GalleryPhoto[]>();
  readonly label = input.required<string>();
  readonly openLabel = input.required<(n: number, total: number, caption: string) => string>();
  readonly moreLabel = input.required<(hidden: number) => { visible: string; spoken: string }>();
  readonly failedSuffix = input.required<string>();
  readonly failedLabel = input.required<string>();
  readonly busy = input(false);

  readonly opened = output<{ index: number; trigger: HTMLElement }>();

  protected readonly leadSizes = LEAD_SIZES;
  protected readonly thumbSizes = THUMB_SIZES;
  protected readonly eager = EAGER;
  protected readonly current = signal(0);
  private readonly failed = signal<ReadonlySet<number>>(new Set());
  private readonly track = viewChild<ElementRef<HTMLUListElement>>('track');

  /** "+25 photos" on the 5th and 6th items when more photos exist than those layouts show (D-3). */
  protected scrim(i: number): { visible: string; spoken: string } | null {
    const n = i + 1;
    const hidden = this.photos().length - n;
    return SCRIM_AT.includes(n) && hidden > 0 ? this.moreLabel()(hidden) : null;
  }

  protected readonly names = computed(() => {
    const total = this.photos().length;
    const failed = this.failed();
    return this.photos().map((p, i) => {
      let name = this.openLabel()(i + 1, total, p.caption);
      if (failed.has(i)) name += this.failedSuffix();
      const more = this.scrim(i);
      if (more) name += `, ${more.spoken}`;
      return name;
    });
  });

  protected markFailed(i: number): void {
    this.failed.update((s) => new Set([...s, i]));
  }

  /** Dots follow the carousel's scroll position on phones. */
  protected onScroll(): void {
    const track = this.track()?.nativeElement;
    if (!track) return;
    const centre = track.scrollLeft + track.clientWidth / 2;
    const items = Array.from(track.children) as HTMLElement[];
    let best = 0;
    items.forEach((li, i) => {
      if (Math.abs(li.offsetLeft + li.offsetWidth / 2 - centre) < Math.abs(items[best].offsetLeft + items[best].offsetWidth / 2 - centre)) best = i;
    });
    this.current.set(best);
  }

  /**
   * Focus the button of the photo the viewer was showing; if the layout hides
   * it, the last visible thumbnail, the one that counts the hidden photos (D-5).
   */
  focusPhoto(index: number): void {
    const buttons = Array.from(this.track()?.nativeElement.querySelectorAll<HTMLElement>('.gallery__btn') ?? []);
    const target = buttons[index];
    if (target && target.offsetParent !== null) {
      target.focus();
      return;
    }
    buttons.filter((b) => b.offsetParent !== null).at(-1)?.focus();
  }
}
