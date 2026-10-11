import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, effect, inject, input, output, untracked, viewChild, afterNextRender, Injector } from '@angular/core';

export interface SummaryItem {
  controlId: string;
  message: string;
}

/**
 * The error summary at the top of a form (form-layout CRD, `sh-form-summary`;
 * L2-022.7, L2-068.3). Takes focus after each failed attempt; each link
 * focuses its field.
 */
@Component({
  selector: 'sh-form-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (items().length) {
      <div #box class="form-summary" role="alert" tabindex="-1" [id]="summaryId()" [attr.aria-labelledby]="summaryId() + '-title'">
        @if (headingLevel() === 3) {
          <h3 [id]="summaryId() + '-title'">{{ heading() }}</h3>
        } @else {
          <h2 [id]="summaryId() + '-title'">{{ heading() }}</h2>
        }
        <ul>
          @for (item of items(); track item.controlId) {
            <li><a [href]="'#' + item.controlId" (click)="go($event, item.controlId)">{{ item.message }}</a></li>
          }
        </ul>
      </div>
    }
  `,
})
export class FormSummary {
  readonly heading = input.required<string>();
  readonly headingLevel = input<2 | 3>(2);
  readonly items = input.required<readonly SummaryItem[]>();
  readonly attempt = input(0);
  readonly summaryId = input('error-summary');

  readonly itemActivated = output<string>();

  private readonly box = viewChild<ElementRef<HTMLElement>>('box');
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      const attempt = this.attempt();
      const has = this.items().length > 0;
      if (attempt > 0 && has) untracked(() => afterNextRender(() => this.focus(), { injector: this.injector }));
    });
  }

  focus(): void {
    this.box()?.nativeElement.focus();
  }

  protected go(event: Event, id: string): void {
    event.preventDefault();
    const el = this.document.getElementById(id);
    el?.focus();
    el?.scrollIntoView({ block: 'center' });
    this.itemActivated.emit(id);
  }
}
