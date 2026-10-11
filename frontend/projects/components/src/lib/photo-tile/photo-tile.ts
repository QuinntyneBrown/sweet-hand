import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';
import { Progress } from '../progress/progress';

/**
 * Translated copy for a photo tile (photo-tile CRD, API). `{n}` is the
 * position and `{file}` the uploaded file's name; `{pct}` the percent sent.
 */
export interface PhotoTileLabels {
  /** "Cover" */
  cover: string;
  /** "Move photo {n} up" */
  moveUp: string;
  /** "Move photo {n} down" */
  moveDown: string;
  /** "Edit" */
  edit: string;
  /** " photo {n}" */
  editObject: string;
  /** "Add a caption" */
  missingCaption: string;
  /** "Add caption" */
  addCaption: string;
  /** " to photo {n}" */
  addCaptionObject: string;
  /** "Uploading {file}" */
  uploading: string;
  /** "{pct}%, uploading" */
  uploadingValue: string;
  /** "Cancel" */
  cancel: string;
  /** " upload of {file}" */
  cancelObject: string;
  /** "Processing" */
  processing: string;
}

export interface TilePhoto {
  src: string;
  width: number;
  height: number;
}

/**
 * One photo in the caterer's photo manager (docs/specs/components/photo-tile.md,
 * `sh-photo-tile`), used as `<li sh-photo-tile>` so the list keeps `li`
 * children. Reordering is by Move up and Move down only (L2-042.1).
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-photo-tile]',
  imports: [Icon, Progress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'photo-tile' },
  template: `
    @switch (mode()) {
      @case ('uploading') {
        <span [class]="photo() ? 'photo' : 'photo photo--placeholder'"
          >@if (photo(); as p) {<img [src]="p.src" alt="" width="160" height="160" />} @else {<svg shIcon="upload"></svg>}<span
            class="photo-tile__progress"
            aria-hidden="true"
            >{{ progress() }}%</span
          ></span
        >
        <p class="photo-tile__caption">{{ fileName() }}</p>
        <sh-progress [value]="progress()" [label]="fill(labels().uploading)" [valueText]="fill(labels().uploadingValue)" />
        <button class="btn btn--link btn--sm" type="button" (click)="cancelRequested.emit({ fileName: fileName() })">
          {{ labels().cancel }}<span class="visually-hidden">{{ fill(labels().cancelObject) }}</span>
        </button>
      }
      @case ('processing') {
        <span class="photo photo--placeholder"><svg shIcon="clock"></svg></span>
        <p class="photo-tile__caption">{{ caption() || fileName() }}</p>
        <span class="status status--pending">{{ labels().processing }}</span>
      }
      @default {
        <span class="photo"
          >@if (photo(); as p) {<img [src]="p.src" alt="" [width]="p.width" [height]="p.height" [attr.loading]="position() > 6 ? 'lazy' : null" />}@if (position() === 1) {<span
              class="photo-tile__cover"
              >{{ labels().cover }}</span
            >}</span
        >
        @if (caption() || mode() === 'readonly') {
          <p class="photo-tile__caption">{{ caption() }}</p>
        } @else {
          <p class="photo-tile__caption photo-tile__caption--missing">{{ labels().missingCaption }}</p>
        }
        @if (mode() === 'editable') {
          <div class="photo-tile__move">
            <button #up class="icon-btn" type="button" [attr.aria-label]="fill(labels().moveUp)" [attr.aria-disabled]="position() === 1 ? 'true' : null" (click)="move('up')">
              <svg shIcon="arrow-up"></svg>
            </button>
            <button #down class="icon-btn" type="button" [attr.aria-label]="fill(labels().moveDown)" [attr.aria-disabled]="position() === total() ? 'true' : null" (click)="move('down')">
              <svg shIcon="arrow-down"></svg>
            </button>
          </div>
          <button #edit class="btn btn--link btn--sm" type="button" aria-haspopup="dialog" (click)="editRequested.emit({ position: position() })">
            @if (caption()) {
              {{ labels().edit }}<span class="visually-hidden">{{ fill(labels().editObject) }}</span>
            } @else {
              {{ labels().addCaption }}<span class="visually-hidden">{{ fill(labels().addCaptionObject) }}</span>
            }
          </button>
          <ng-content select="[slot=actions]" />
        }
      }
    }
  `,
})
export class PhotoTile {
  readonly mode = input<'editable' | 'readonly' | 'uploading' | 'processing'>('editable');
  readonly position = input.required<number>();
  readonly total = input.required<number>();
  readonly photo = input<TilePhoto | null>(null);
  readonly caption = input<string | null>(null);
  readonly fileName = input('');
  readonly progress = input(0);
  readonly labels = input.required<PhotoTileLabels>();

  readonly moveRequested = output<{ position: number; direction: 'up' | 'down' }>();
  readonly editRequested = output<{ position: number }>();
  readonly cancelRequested = output<{ fileName: string }>();

  private readonly up = viewChild<ElementRef<HTMLButtonElement>>('up');
  private readonly down = viewChild<ElementRef<HTMLButtonElement>>('down');
  private readonly edit = viewChild<ElementRef<HTMLButtonElement>>('edit');

  protected readonly fill = (text: string): string =>
    text.replace('{n}', String(this.position())).replace('{file}', this.fileName()).replace('{pct}', String(this.progress()));

  protected move(direction: 'up' | 'down'): void {
    if (direction === 'up' && this.position() === 1) return;
    if (direction === 'down' && this.position() === this.total()) return;
    this.moveRequested.emit({ position: this.position(), direction });
  }

  /** Focus after a move follows the photo to its new tile (photo-tile CRD, implementation notes). */
  focusMove(direction: 'up' | 'down'): void {
    (direction === 'up' ? this.up() : this.down())?.nativeElement.focus();
  }

  focusEdit(): void {
    this.edit()?.nativeElement.focus();
  }
}

/** The grid of photo tiles in public order (photo-tile CRD, `sh-photo-manager`). */
@Component({
  selector: 'sh-photo-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul class="photo-manager" [attr.aria-label]="label()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        @for (i of skeletons(); track i) {
          <li class="photo-tile photo-tile--skeleton" aria-hidden="true">
            <span class="photo"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text"></span>
          </li>
        }
      } @else {
        <ng-content />
      }
    </ul>
    <p class="visually-hidden" role="status" aria-live="polite">{{ announcement() }}</p>
  `,
})
export class PhotoManager {
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly skeletonCount = input(6);
  readonly announcement = input<string | null>(null);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(30, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
