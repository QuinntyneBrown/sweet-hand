import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';

export type CheckStatus = 'missing' | 'done' | 'attention';

/** The visually hidden words before each item: "To do: ", "Done: ", "Needs attention: ". */
export interface CheckStatusLabels {
  missing: string;
  done: string;
  attention: string;
}

/**
 * The round check: an empty ring (to do), a filled disc with a tick (done) or
 * a danger ring with an exclamation (docs/specs/components/checklist.md,
 * `sh-check`). Always hidden from assistive technology: the words carry the state.
 */
@Component({
  selector: 'sh-check',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @switch (status()) {
      @case ('done') {
        <span class="check check--done" aria-hidden="true"><svg shIcon="check"></svg></span>
      }
      @case ('attention') {
        <span class="check check--error" aria-hidden="true"><svg shIcon="exclamation"></svg></span>
      }
      @default {
        <span class="check" aria-hidden="true"></span>
      }
    }
  `,
})
export class Check {
  readonly status = input.required<CheckStatus>();
}

/** A compact list of checked lines (checklist CRD, `sh-checklist`). Items are `sh-checklist-item` children. */
@Component({
  selector: 'sh-checklist',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (ordered()) {
      <ol class="checklist" [attr.aria-labelledby]="ariaLabelledby()"><ng-container *ngTemplateOutlet="items" /></ol>
    } @else {
      <ul class="checklist" [attr.aria-labelledby]="ariaLabelledby()"><ng-container *ngTemplateOutlet="items" /></ul>
    }
    <ng-template #items><ng-content /></ng-template>
  `,
})
export class Checklist {
  readonly ordered = input(false);
  readonly statusLabels = input<CheckStatusLabels | null>(null);
  /** `false` only when every item is done and a heading says so (D-3). */
  readonly prefixes = input(true);
  readonly ariaLabelledby = input<string | null>(null);
}

/**
 * One line of a checklist (checklist CRD, `sh-checklist-item`). `status` null
 * renders a plain or icon line. Used as an attribute on the `li` itself
 * (`<li sh-checklist-item status="done">`): an element host between the list
 * and its `li` would break the list's semantics, `display: contents` or not.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-checklist-item]',
  imports: [Check],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-missing]': "status() === 'missing' ? '' : null", '[attr.data-highlight]': "highlight() ? '' : null" },
  template: `
    @if (status(); as s) {
      <sh-check [status]="s" />
    } @else {
      <ng-content select="[slot=icon]" />
    }
    <span
      >@if (prefix()) {<span class="visually-hidden">{{ prefix() }}</span>}<ng-content
    /></span>
  `,
})
export class ChecklistItem {
  readonly status = input.required<CheckStatus | null>();
  readonly highlight = input(false);

  private readonly list = inject(Checklist, { optional: true });

  protected readonly prefix = computed(() => {
    const s = this.status();
    if (!s || !this.list?.prefixes()) return null;
    return this.list.statusLabels()?.[s] ?? null;
  });
}
