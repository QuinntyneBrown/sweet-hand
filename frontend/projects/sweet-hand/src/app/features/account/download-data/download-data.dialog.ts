import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Checklist, ChecklistItem, Dialog, Icon } from '@sweet-hand/components';
import { AccountService, type AccountView } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

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
  templateUrl: './download-data.dialog.html',
})
export class DownloadDataDialog {
  private readonly api = inject(AccountService);
  private readonly injector = inject(Injector);

  readonly open = input(false);
  readonly account = input.required<AccountView>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  /** The account with its export in progress, once requested. */
  readonly exportRequested = output<AccountView>();

  protected readonly requested = signal<AccountView | null>(null);
  protected readonly state = new FormDialogState(this.open, { noErrors: null, reset: () => this.requested.set(null) });
  protected readonly lines = computed(() => exportLines(this.account()));
  protected readonly firstName = computed(() => this.account().displayName.trim().split(/\s+/)[0]);
  protected readonly title = $localize`:@@download.title:Download your data`;
  protected readonly description = $localize`:@@download.description:A JSON file with everything Sweet Hand holds about you.`;
  protected readonly requestedTitle = $localize`:@@download.requestedTitle:Export requested`;
  protected readonly requestedDescription = $localize`:@@download.requestedDescription:Nothing else to do for now.`;
  protected readonly cancel = $localize`:@@common.cancel:Cancel`;
  protected readonly requesting = $localize`:@@download.busy:Requesting your export`;
  private readonly done = viewChild<ElementRef<HTMLButtonElement>>('done');

  protected async request(): Promise<void> {
    if (this.state.busy()) return;
    await this.state.submit(async () => {
      this.requested.set(await firstValueFrom(this.api.requestDataExport()));
      afterNextRender(() => this.done()?.nativeElement.focus(), { injector: this.injector });
    });
  }

  protected close(): void {
    const account = this.requested();
    if (account) this.exportRequested.emit(account);
    else this.closed.emit();
  }
}
