import { ChangeDetectionStrategy, Component, computed, contentChildren, forwardRef, InjectionToken, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { DescriptionLayout } from './description-layout';
import type { DescriptionListContext } from './description-list-context';
import { Description } from './description';

const LAYOUT_CLASS: Record<DescriptionLayout, string> = {
  facts: 'facts',
  regions: 'regions',
  record: 'kv',
  'enquiry-summary': 'enquiry-summary',
  certificate: 'certificate',
  plain: 'dl',
};

/** Layouts whose pairs sit in a `div`, as HTML allows; the grids need direct `dt`/`dd` children. */
export const WRAPPED: DescriptionLayout[] = ['facts', 'regions', 'enquiry-summary'];

export const DESCRIPTION_LIST = new InjectionToken<DescriptionListContext>('DESCRIPTION_LIST');

/**
 * A description list in one of its layouts (docs/specs/components/description-list.md):
 * facts, areas served, record, enquiry summary, certificate or plain.
 */
@Component({
  selector: 'sh-description-list',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  providers: [{ provide: DESCRIPTION_LIST, useExisting: forwardRef(() => DescriptionList) }],
  template: `
    @if (busy()) {
      <div [class]="cls()" aria-hidden="true">
        @for (i of skeletons(); track i) {
          <span class="skeleton skeleton--text"></span>
        }
      </div>
      <p class="visually-hidden" role="status">{{ busyLabel() }}</p>
    } @else {
      <dl [class]="cls()">
        @for (d of descriptions(); track d) {
          <ng-container *ngTemplateOutlet="d.pair()" />
        }
      </dl>
      @if (layout() === 'certificate') {
        <p class="text-caption">{{ statement() }}</p>
      }
    }
    <ng-content />
  `,
})
export class DescriptionList implements DescriptionListContext {
  readonly layout = input<DescriptionLayout>('plain');
  readonly statement = input<string | null>(null);
  readonly busy = input(false);
  readonly busyLabel = input<string | null>(null);
  readonly skeletonCount = input(4);

  protected readonly descriptions = contentChildren(Description);
  protected readonly cls = computed(() => LAYOUT_CLASS[this.layout()]);
  protected readonly skeletons = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));
}

