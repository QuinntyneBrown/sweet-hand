import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY_STATE, Icon, Pagination, Status, ToastNotifier } from '@sweet-hand/components';
import { ModerationApi } from '../../../../core/api/operator-moderation-api';
import type { RecentChangesPageView } from '../../../../core/api/operator-moderation.models';
import { problemOf, reference } from '../../../../core/forms/problem';
import { reasonError } from '../decisions/decision-text';
import { ReasonDialog } from '../decisions/reason-dialog';
import { firstName, pageName, pageSummary, readPage } from '../moderation-text';
import { changeEntry, changesSubtitle, revertDescription, revertTitle, type ChangeEntry } from './changes-view';

/**
 * Edits to published profiles from the last 30 days, newest first, each with a
 * Revert (work-review-queue and edit-profile-as-operator designs; docs/mocks/pages/admin-changes).
 */
@Component({
  selector: 'app-recent-changes-page',
  imports: [RouterLink, EMPTY_STATE, Icon, Pagination, Status, ReasonDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro">
      <h1 i18n="@@nav.recentChanges">Recent changes</h1>
      @if (view(); as v) {
        <p class="subtitle">{{ subtitle() }}</p>
      } @else if (failed()) {
        <p class="subtitle" i18n="@@changes.lastThirty">Last 30 days</p>
      } @else {
        <p class="subtitle"><span class="skeleton skeleton--text changes-skeleton" aria-hidden="true"></span><span class="visually-hidden" i18n="@@common.loading">Loading</span></p>
      }
    </div>

    @if (failed()) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load recent changes"
        i18n-heading="@@changes.errorTitle"
        text="The server didn’t answer in time. Nothing has been changed. Try again in a moment."
        i18n-text="@@changes.errorText"
        [reference]="errorReference()"
        referenceLabel="Reference"
        i18n-referenceLabel="@@system.reference"
      >
        <svg slot="icon" shIcon="danger"></svg>
        <button slot="actions" class="btn btn--primary" type="button" (click)="feed.reload()" i18n="@@common.tryAgain">Try again</button>
        <a slot="actions" class="btn" routerLink="/admin/queue" i18n="@@record.backToQueue">Back to the queue</a>
      </sh-empty-state>
    } @else if (view()?.total === 0) {
      <sh-empty-state
        heading="No changes in the last 30 days"
        i18n-heading="@@changes.emptyTitle"
        text="When a published caterer edits their description, menu, photos or areas, the edit shows here so you can check it."
        i18n-text="@@changes.emptyText"
      >
        <svg slot="icon" shIcon="edit"></svg>
        <a slot="actions" class="btn btn--primary" routerLink="/admin/queue" i18n="@@changes.toQueue">Go to the review queue</a>
      </sh-empty-state>
    } @else if (!view()) {
      <p class="visually-hidden" role="status" i18n="@@changes.loading">Loading recent changes</p>
      <ul class="review-list" aria-busy="true">
        @for (i of [1, 2, 3, 4]; track i) {
          <li class="review review--skeleton" aria-hidden="true">
            <div class="review__head"><span class="photo photo--xs"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text changes-skeleton--45"></span></div>
            <span class="skeleton skeleton--text changes-skeleton--15"></span>
            <span class="skeleton skeleton--text changes-skeleton--80"></span>
            <span class="skeleton skeleton--text changes-skeleton--15"></span>
            <span class="skeleton skeleton--text changes-skeleton--70"></span>
          </li>
        }
      </ul>
    } @else {
      <ul class="review-list">
        @for (e of entries(); track e.id) {
          <li class="review">
            <div class="review__head">
              @if (e.photo) {
                <span class="photo photo--xs"><img [src]="e.photo" alt="" width="40" height="40" loading="lazy" /></span>
              }
              <span class="review__author">{{ e.heading }}</span><span class="review__date">{{ e.byline }}</span>
            </div>
            @if (e.isPhoto) {
              <div class="cluster changes-photos">
                <span class="stack stack--sm changes-photo"
                  ><span class="text-caption" i18n="@@changes.was">Was</span>@if (e.old?.kind === 'photo') {<span class="photo photo--md"
                      ><img [src]="$any(e.old).src" [alt]="e.oldText" width="96" height="96" loading="lazy" /></span
                  >}</span
                >
                <span class="stack stack--sm changes-photo"
                  ><span class="text-caption" i18n="@@changes.now">Now</span>@if (e.new?.kind === 'photo') {<span class="photo photo--md"
                      ><img [src]="$any(e.new).src" [alt]="e.newText" width="96" height="96" loading="lazy" /></span
                  >}</span
                >
              </div>
            } @else {
              <dl class="dl">
                <dt i18n="@@changes.was">Was</dt>
                <dd>
                  @if (e.old) {
                    <del class="diff-old">{{ e.oldText }}</del>
                  } @else {
                    <span class="text-muted">{{ e.oldText }}</span>
                  }
                </dd>
                <dt i18n="@@changes.now">Now</dt>
                <dd>
                  @if (e.new) {
                    <ins class="diff-new">{{ e.newText }}</ins>
                  } @else {
                    <span class="text-muted">{{ e.newText }}</span>
                  }
                </dd>
              </dl>
            }
            <div class="review__actions">
              @if (e.reverted) {
                <sh-status tone="closed" [label]="e.reverted" />
              } @else {
                <button class="btn btn--sm" type="button" aria-haspopup="dialog" (click)="openRevert(e, $event)">
                  <ng-container i18n="@@changes.revert">Revert</ng-container><span class="visually-hidden">{{ e.revertObject }}</span>
                </button>
              }
            </div>
          </li>
        }
      </ul>
      @if (view(); as v) {
        <sh-pagination
          [page]="v.page"
          [pageCount]="v.pageCount"
          [hrefFor]="hrefFor"
          label="Pagination"
          i18n-label="@@pagination.label"
          [summary]="summary()"
          previousLabel="Previous page"
          i18n-previousLabel="@@pagination.previous"
          nextLabel="Next page"
          i18n-nextLabel="@@pagination.next"
          [pageLabel]="pageName"
        />
      }
    }

    @if (reverting(); as e) {
      <app-reason-dialog
        [open]="true"
        [title]="revertTitle(e)"
        [description]="revertDescription(e)"
        [name]="e.view.catererName"
        label="Reason"
        i18n-label="@@revert.label"
        help="Sent to the caterer and kept in the audit log."
        i18n-help="@@revert.help"
        submitLabel="Revert change"
        i18n-submitLabel="@@revert.submit"
        retryLabel="Try again"
        i18n-retryLabel="@@common.tryAgain"
        busyMessage="Reverting the change"
        i18n-busyMessage="@@revert.busy"
        failedTitle="We couldn’t revert the change"
        i18n-failedTitle="@@revert.failedTitle"
        [failedText]="failedKept"
        [summaryHeading]="revertSummary"
        [validate]="validateReason"
        [action]="revertAction"
        conflictHref="/admin/changes"
        conflictLink="Back to recent changes"
        i18n-conflictLink="@@revert.backToChanges"
        [returnFocus]="opener()"
        (dismissed)="reverting.set(null)"
        (done)="reverted(e)"
      >
        <div slot="before" class="well stack stack--sm">
          <p><span class="text-caption" i18n="@@revert.goesBack">Goes back to</span><br />{{ e.oldText }}</p>
          <p><span class="text-caption" i18n="@@revert.replaces">Replaces</span><br /><del class="diff-old">{{ e.newText }}</del></p>
        </div>
      </app-reason-dialog>
    }
  `,
  styles: `
    .changes-skeleton {
      display: inline-block;
      width: 40%;
    }
    .changes-skeleton--45 {
      width: 45%;
    }
    .changes-skeleton--15 {
      width: 15%;
    }
    .changes-skeleton--70 {
      width: 70%;
    }
    .changes-skeleton--80 {
      width: 80%;
    }
    .changes-photos {
      gap: var(--space-4);
    }
    .changes-photo {
      align-items: center;
    }
  `,
})
export class RecentChangesPage {
  private readonly api = inject(ModerationApi);
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
  protected readonly hrefFor = (page: number): string => (page > 1 ? `/admin/changes?page=${page}` : '/admin/changes');

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
