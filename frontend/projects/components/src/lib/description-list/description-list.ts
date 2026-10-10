import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  TemplateRef,
  afterNextRender,
  computed,
  contentChild,
  contentChildren,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  type Signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';

export type DescriptionLayout = 'facts' | 'regions' | 'record' | 'enquiry-summary' | 'certificate' | 'plain';

const LAYOUT_CLASS: Record<DescriptionLayout, string> = {
  facts: 'facts',
  regions: 'regions',
  record: 'kv',
  'enquiry-summary': 'enquiry-summary',
  certificate: 'certificate',
  plain: 'dl',
};

/** Layouts whose pairs sit in a `div`, as HTML allows; the grids need direct `dt`/`dd` children. */
const WRAPPED: DescriptionLayout[] = ['facts', 'regions', 'enquiry-summary'];

interface DescriptionListContext {
  layout: Signal<DescriptionLayout>;
}

const DESCRIPTION_LIST = new InjectionToken<DescriptionListContext>('DESCRIPTION_LIST');

/** Marks the trailing status, note or action of a record value (`[slot=end]`). */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=end]' })
export class DescriptionEnd {}

/** Reports whether a value cell received any content, so a missing value can say so. */
@Directive({ selector: '[shValueWatch]' })
export class ValueWatch {
  readonly shValueWatch = output<boolean>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const check = () => {
        const content = Array.from(el.childNodes).filter((n) => !(n instanceof HTMLElement && n.matches('.enquiry-summary__by, [data-missing]')));
        this.shValueWatch.emit(content.every((n) => n.nodeType === Node.COMMENT_NODE || (n.nodeType === Node.TEXT_NODE && !n.textContent?.trim())));
      };
      check();
      const observer = new MutationObserver(check);
      observer.observe(el, { childList: true, subtree: true, characterData: true });
      destroy.onDestroy(() => observer.disconnect());
    });
  }
}

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

/** `ul.inline-list`: commas between items come from CSS. */
@Component({
  selector: 'sh-inline-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<ul class="inline-list">@for (item of items(); track $index) {<li>{{ item }}</li>}</ul>`,
})
export class InlineList {
  readonly items = input.required<readonly string[]>();
}

/** An old or new value in a change review: `del.diff-old` or `ins.diff-new`. */
@Component({
  selector: 'sh-change-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  imports: [NgTemplateOutlet],
  template: `@if (kind() === 'old') {<del class="diff-old"><ng-container *ngTemplateOutlet="text" /></del>} @else {<ins class="diff-new"><ng-container *ngTemplateOutlet="text" /></ins>}
    <ng-template #text><ng-content /></ng-template>`,
})
export class ChangeValue {
  readonly kind = input.required<'old' | 'new'>();
}

/** "Changed since changes were requested" (`span.changed-flag`). */
@Component({
  selector: 'sh-changed-flag',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<span class="changed-flag">@if (icon()) {<svg class="icon--sm" shIcon="info"></svg>}<ng-content /></span>`,
})
export class ChangedFlag {
  readonly icon = input(false);
}
