import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input, signal, TemplateRef, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ValueWatch } from './value-watch';
import { DESCRIPTION_LIST, WRAPPED } from './description-list';
import { DescriptionEnd } from './description-end';

/**
 * One term and its value (description-list CRD, `sh-description`). It renders
 * nothing where it stands: its list places the pair directly in the `dl`, so
 * the `dl` holds only `dt`/`dd` groups or `div`s, as HTML requires.
 */
@Component({
  selector: 'sh-description',
  imports: [NgTemplateOutlet, ValueWatch],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #pair>
      @if (wrapped()) {
        <div [class]="message() ? 'enquiry-summary__message' : null"><ng-container *ngTemplateOutlet="cells" /></div>
      } @else {
        <ng-container *ngTemplateOutlet="cells" />
      }
    </ng-template>
    <ng-template #cells>
      <dt>{{ term() }}</dt>
      <dd [class.text-muted]="missing()" (shValueWatch)="empty.set($event)">
        @if (end()) {
          <span><ng-container *ngTemplateOutlet="value" /></span><ng-content select="[slot=end]" />
        } @else {
          <ng-container *ngTemplateOutlet="value" />
        }
        @if (missing()) {
          <span data-missing>{{ missingText() }}</span>
        }
        @if (message() && by()) {
          <p class="enquiry-summary__by">{{ by() }}</p>
        }
      </dd>
    </ng-template>
    <ng-template #value><ng-content /></ng-template>
  `,
})
export class Description {
  readonly term = input.required<string>();
  readonly missingText = input<string | null>(null);
  readonly message = input(false);
  readonly by = input<string | null>(null);

  /** The pair, placed in the `dl` by the parent list. */
  readonly pair = viewChild.required<TemplateRef<unknown>>('pair');

  private readonly list = inject(DESCRIPTION_LIST, { optional: true });
  protected readonly end = contentChild(DescriptionEnd);
  protected readonly empty = signal(false);

  protected readonly wrapped = computed(() => WRAPPED.includes(this.list?.layout() ?? 'plain'));
  protected readonly missing = computed(() => {
    const layout = this.list?.layout() ?? 'plain';
    return !!this.missingText() && this.empty() && layout !== 'facts' && layout !== 'regions';
  });
}
