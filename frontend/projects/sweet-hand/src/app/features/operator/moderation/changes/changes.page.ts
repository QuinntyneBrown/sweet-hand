import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY_STATE, Icon, Pagination, Status, ToastNotifier } from '@sweet-hand/components';
import { problemOf, reference } from '../../../../core/forms/problem';
import { reasonError } from '../decisions/decision-text';
import { ReasonDialog } from '../decisions/reason-dialog';
import { firstName, pageName, pageSummary, readPage } from '../moderation-text';
import { changeEntry, changesSubtitle, revertDescription, revertTitle, type ChangeEntry } from './changes-view';
import { OperatorModerationService, type RecentChangesPageView } from '@sweet-hand/api';
import { paths } from '../../../../core/routing/paths';

/**
 * Edits to published profiles from the last 30 days, newest first, each with a
 * Revert (work-review-queue and edit-profile-as-operator designs; docs/mocks/pages/admin-changes).
 */
@Component({
  selector: 'app-recent-changes-page',
  imports: [RouterLink, EMPTY_STATE, Icon, Pagination, Status, ReasonDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './changes.page.html',
  styleUrl: './changes.page.css',
})
export class RecentChangesPage {
  protected readonly paths = paths;
  private readonly api = inject(OperatorModerationService);
  private readonly toasts = inject(ToastNotifier);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  protected readonly page = computed(() => readPage(this.params().get('page')));
  protected readonly feed = rxResource({
    params: () => this.page(),
    stream: ({ params }) => this.api.recentChanges(params),
  });
  protected readonly view = computed<RecentChangesPageView | undefined>(() => (this.feed.hasValue() ? this.feed.value() : undefined));
  protected readonly failed = computed(() => !!this.feed.error() && !this.view());
  protected readonly errorReference = computed(() => reference(problemOf(this.feed.error()).problem));
  protected readonly subtitle = computed(() => (this.view() ? changesSubtitle(this.view()!) : ''));
  protected readonly entries = computed(() => (this.view()?.items ?? []).map((c) => changeEntry(c)));
  protected readonly summary = computed(() => {
    const v = this.view();
    return v ? pageSummary(v.page, v.pageSize, v.total) : null;
  });
  protected readonly pageName = pageName;
  protected readonly hrefFor = (page: number): string => (page > 1 ? `${paths.admin.changes}?page=${page}` : paths.admin.changes);

  protected readonly reverting = signal<ChangeEntry | null>(null);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly validateReason = reasonError;
  protected readonly revertSummary = $localize`:@@revert.summary:Fix 1 thing to revert the change`;
  protected readonly failedKept = $localize`:@@decision.failedKept:Nothing has changed. Check your connection and try again; your reason is kept.`;
  protected readonly revertAction = (reason: string) => this.api.revert(this.reverting()!.id, reason);
  protected revertTitle = (e: ChangeEntry) => revertTitle(e.view);
  protected revertDescription = (e: ChangeEntry) => revertDescription(e.view, e.view.by);

  protected openRevert(e: ChangeEntry, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.reverting.set(e);
  }

  protected reverted(e: ChangeEntry): void {
    this.reverting.set(null);
    this.toasts.show({
      title: $localize`:@@revert.toastTitle:Change reverted`,
      text: $localize`:@@revert.toastText:${e.view.catererName}:name: is back to the earlier value. ${firstName(e.view.by)}:owner: has been emailed your reason.`,
    });
    this.feed.reload();
  }
}
