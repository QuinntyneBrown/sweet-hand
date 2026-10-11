import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Checklist, ChecklistItem, Dialog, Icon } from '@sweet-hand/components';
import { AccountApi } from '../../../core/api/account-api';
import type { AccountView } from '../../../core/api/account.models';

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** The lines of "what the export holds" for the account's role (L2-071.1, L2-071.2). */
export function exportLines(account: AccountView): string[] {
  const c = account.exportContents;
  const lines: string[] = [];
  if (account.role === 'Caterer') {
    lines.push($localize`:@@download.catererAccount:Your account, profile and consent records`);
    if (c.photos) lines.push(plural(c.photos, $localize`:@@download.photo:1 full-size photo`, $localize`:@@download.photos:${c.photos}:count: full-size photos`));
    if (c.dishes)
      lines.push(
        plural(c.dishes, $localize`:@@download.dish:1 dish and your food handler certificate details`, $localize`:@@download.dishes:${c.dishes}:count: dishes and your food handler certificate details`),
      );
  } else {
    lines.push($localize`:@@download.profile:Your profile and consent records`);
  }
  if (c.enquiries)
    lines.push(plural(c.enquiries, $localize`:@@download.enquiry:1 enquiry and every message in it`, $localize`:@@download.enquiries:${c.enquiries}:count: enquiries and every message in them`));
  if (account.role === 'Caterer') {
    if (c.reviewResponses)
      lines.push(plural(c.reviewResponses, $localize`:@@download.response:1 response to a review`, $localize`:@@download.responses:${c.reviewResponses}:count: responses to reviews`));
  } else {
    if (c.reviews) lines.push(plural(c.reviews, $localize`:@@download.review:1 review you wrote`, $localize`:@@download.reviews:${c.reviews}:count: reviews you wrote`));
    if (c.reports) lines.push(plural(c.reports, $localize`:@@download.report:1 report you sent`, $localize`:@@download.reports:${c.reports}:count: reports you sent`));
  }
  return lines;
}

/** Download your data (docs/mocks/dialogs/download-data; export-personal-data design, DataExportDialog). */
@Component({
  selector: 'app-download-data-dialog',
  imports: [Alert, Checklist, ChecklistItem, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      size="form"
      [form]="!requested()"
      [tone]="requested() ? 'success' : null"
      [title]="requested() ? requestedTitle : title"
      [description]="requested() ? requestedDescription : description"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      [cancelLabel]="requested() ? null : cancel"
      [busy]="busy()"
      [busyMessage]="requesting"
      [returnFocus]="returnFocus()"
      (dismissed)="close()"
      (submitted)="request()"
    >
      <svg slot="icon" shIcon="success"></svg>
      @if (requested()) {
        <p i18n="@@download.preparing">We’re preparing your file. We’ll email a download link to <strong>{{ account().email }}</strong> within 24 hours.</p>
        <p class="text-muted" i18n="@@download.linkRule">The link works for 7 days, and only when you’re signed in as {{ firstName() }}.</p>
      } @else {
        @if (failed()) {
          <sh-alert tone="danger" live="assertive" title="Your export wasn’t requested" i18n-title="@@download.failedTitle"
            ><ng-container i18n="@@download.failedText">Something went wrong on our side. Try again in a moment.</ng-container></sh-alert
          >
        }
        <sh-checklist [prefixes]="false">
          @for (line of lines(); track $index) {
            <li sh-checklist-item [status]="null">{{ line }}</li>
          }
        </sh-checklist>
        @if (account().role === 'Caterer') {
          <p class="text-muted" i18n="@@download.contactsCaterer">Customers’ contact details are included only where they shared them with you.</p>
        } @else {
          <p class="text-muted" i18n="@@download.contacts">Caterers’ contact details are included only where they shared them with you.</p>
        }
      }
      @if (requested()) {
        <button #done slot="footer" class="btn btn--primary" type="button" (click)="close()" i18n="@@download.done">Done</button>
      } @else {
        <button
          slot="footer"
          class="btn btn--primary"
          type="submit"
          autofocus
          [attr.aria-busy]="busy() ? 'true' : null"
          [attr.aria-disabled]="busy() ? 'true' : null"
          i18n="@@download.request"
        >
          Request export
        </button>
      }
    </sh-dialog>
  `,
})
export class DownloadDataDialog {
  private readonly api = inject(AccountApi);
  private readonly injector = inject(Injector);

  readonly open = input(false);
  readonly account = input.required<AccountView>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  /** The account with its export in progress, once requested. */
  readonly exportRequested = output<AccountView>();

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly requested = signal<AccountView | null>(null);
  protected readonly lines = computed(() => exportLines(this.account()));
  protected readonly firstName = computed(() => this.account().displayName.trim().split(/\s+/)[0]);
  protected readonly title = $localize`:@@download.title:Download your data`;
  protected readonly description = $localize`:@@download.description:A JSON file with everything Sweet Hand holds about you.`;
  protected readonly requestedTitle = $localize`:@@download.requestedTitle:Export requested`;
  protected readonly requestedDescription = $localize`:@@download.requestedDescription:Nothing else to do for now.`;
  protected readonly cancel = $localize`:@@common.cancel:Cancel`;
  protected readonly requesting = $localize`:@@download.busy:Requesting your export`;
  private readonly done = viewChild<ElementRef<HTMLButtonElement>>('done');

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          this.requested.set(null);
          this.failed.set(false);
        });
    });
  }

  protected async request(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      this.requested.set(await firstValueFrom(this.api.requestDataExport()));
      afterNextRender(() => this.done()?.nativeElement.focus(), { injector: this.injector });
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  protected close(): void {
    const account = this.requested();
    if (account) this.exportRequested.emit(account);
    else this.closed.emit();
  }
}
