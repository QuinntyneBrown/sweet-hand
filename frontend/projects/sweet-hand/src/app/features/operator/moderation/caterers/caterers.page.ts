import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActiveFilters, ChangedFlag, EMPTY_STATE, FormField, Icon, Pagination, Queue, QueueItem, Segmented, Status, TextField } from '@sweet-hand/components';
import { problemOf, reference } from '../../../../core/forms/problem';
import { pageName, pageSummary, readPage } from '../moderation-text';
import { caterersHref, caterersSubtitle, catererRow, noResults, readStatusFilter, statusFilters, statusOfFilter } from './caterers-view';
import { profileStatusLabel } from '../moderation-text';
import { OPERATOR_MODERATION_SERVICE } from '@sweet-hand/api';

/** Every caterer in every status, /admin/caterers (suspend-reinstate-remove-profile design; docs/mocks/pages/admin-caterers). */
@Component({
  selector: 'app-operator-caterers-page',
  imports: [RouterLink, ActiveFilters, ChangedFlag, EMPTY_STATE, FormField, Icon, Pagination, Queue, QueueItem, Segmented, Status, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro">
      <h1 i18n="@@nav.caterers">Caterers</h1>
      @if (view(); as v) {
        <p class="subtitle">{{ subtitle() }}</p>
      } @else if (failed()) {
        <p class="subtitle" i18n="@@caterers.didNotLoad">Caterers didn’t load</p>
      } @else {
        <p class="subtitle"><span class="skeleton skeleton--text caterers-skeleton" aria-hidden="true"></span><span class="visually-hidden" i18n="@@common.loading">Loading</span></p>
      }
    </div>
    <form role="search" class="caterers-search" (submit)="search($event)">
      <sh-form-field label="Search caterers by business or owner name" i18n-label="@@caterers.searchLabel" [labelHidden]="true" controlId="cat-q">
        <sh-text-field
          type="search"
          variant="search"
          name="q"
          autocomplete="off"
          placeholder="Business or owner name"
          i18n-placeholder="@@caterers.searchPlaceholder"
          [(value)]="query"
          [disabled]="!view() || view()!.counts.all === 0"
        />
      </sh-form-field>
    </form>
    <sh-segmented ariaLabel="Filter by status" i18n-ariaLabel="@@caterers.filterLabel" [items]="filters()" [selected]="status() ?? 'all'" />
    @if (chips().length && view()) {
      <sh-active-filters label="Active filters" i18n-label="@@filters.active" [chips]="chips()" [removeLabel]="removeLabel" (removed)="removeChip($event)" />
    }

    @if (failed()) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load caterers"
        i18n-heading="@@caterers.errorTitle"
        text="The list didn’t come back from the server. Nothing has changed. Try again, or work from the review queue meanwhile."
        i18n-text="@@caterers.errorText"
        [reference]="errorReference()"
        referenceLabel="Reference"
        i18n-referenceLabel="@@system.reference"
      >
        <svg slot="icon" shIcon="danger"></svg>
        <button slot="actions" class="btn btn--primary" type="button" (click)="list.reload()" i18n="@@common.tryAgain">Try again</button>
        <a slot="actions" class="btn" routerLink="/admin/queue" i18n="@@caterers.toQueue">Go to the review queue</a>
      </sh-empty-state>
    } @else if (view()?.counts?.all === 0) {
      <sh-empty-state
        heading="No caterers have registered"
        i18n-heading="@@caterers.emptyTitle"
        text="Caterers appear here the moment they sign up, as a draft. Submitted profiles also land in the review queue."
        i18n-text="@@caterers.emptyText"
      >
        <svg slot="icon" shIcon="plate"></svg>
        <a slot="actions" class="btn" routerLink="/join" i18n="@@caterers.signUpPage">See the caterer sign-up page</a>
      </sh-empty-state>
    } @else if (view()?.total === 0) {
      <sh-empty-state [heading]="none().heading" [text]="none().text">
        <svg slot="icon" shIcon="search"></svg>
        <a slot="actions" class="btn" routerLink="/admin/caterers" i18n="@@filters.clear">Clear filters</a>
      </sh-empty-state>
    } @else {
      <sh-queue [stack]="true" [busy]="!view()" busyLabel="Loading caterers" i18n-busyLabel="@@caterers.loading" [skeletonCount]="8">
        @for (row of rows(); track row.id) {
          <sh-queue-item [stack]="true" [href]="row.href" [title]="row.name" [media]="row.photo ? 'photo' : 'placeholder'" [photo]="row.photo" [meta]="row.meta">
            <sh-status slot="status" [tone]="row.statusTone" [label]="row.statusLabel" />
            @if (row.flag) {
              <sh-changed-flag slot="flag">{{ row.flag }}</sh-changed-flag>
            }
          </sh-queue-item>
        }
      </sh-queue>
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
  `,
  styles: `
    .caterers-search {
      max-width: 28rem;
      margin-bottom: var(--space-4);
    }
    .caterers-skeleton {
      display: inline-block;
      width: min(16rem, 80%);
    }
  `,
})
export class OperatorCaterersPage {
  private readonly api = inject(OPERATOR_MODERATION_SERVICE);
  private readonly router = inject(Router);
  private readonly params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  protected readonly status = computed(() => readStatusFilter(this.params().get('status')));
  protected readonly q = computed(() => (this.params().get('q') ?? '').trim());
  protected readonly page = computed(() => readPage(this.params().get('page')));
  protected readonly query = signal('');
  protected readonly list = rxResource({
    params: () => ({ status: this.status(), q: this.q(), page: this.page() }),
    stream: ({ params }) => this.api.caterers(params),
  });
  protected readonly view = computed<CaterersPageView | undefined>(() => (this.list.hasValue() ? this.list.value() : undefined));
  protected readonly failed = computed(() => !!this.list.error() && !this.view());
  protected readonly errorReference = computed(() => reference(problemOf(this.list.error()).problem));
  protected readonly subtitle = computed(() => {
    const v = this.view();
    return v ? caterersSubtitle(v, !!this.status() || !!this.q()) : '';
  });
  protected readonly filters = computed(() => statusFilters(this.view(), this.q()));
  protected readonly rows = computed(() => (this.view()?.items ?? []).map((c) => catererRow(c)));
  protected readonly chips = computed(() => {
    const chips: { value: string; label: string }[] = [];
    if (this.q()) chips.push({ value: 'q', label: `“${this.q()}”` });
    const s = this.status();
    if (s) chips.push({ value: 'status', label: profileStatusLabel(statusOfFilter(s)) });
    return chips;
  });
  protected readonly none = computed(() => {
    const v = this.view();
    return v ? noResults(v, this.status(), this.q()) : { heading: '', text: '' };
  });
  protected readonly summary = computed(() => {
    const v = this.view();
    return v ? pageSummary(v.page, v.pageSize, v.total) : null;
  });
  protected readonly pageName = pageName;
  protected readonly hrefFor = (page: number): string => caterersHref({ status: this.status(), q: this.q(), page });
  protected readonly removeLabel = (label: string): string =>
    label.startsWith('“') ? $localize`:@@caterers.removeSearch:Remove search ${label}:query:` : $localize`:@@caterers.removeStatus:Remove ${label}:status: filter`;

  constructor() {
    // The box shows the search in the address, also after Back.
    effect(() => {
      const q = this.q();
      untracked(() => this.query.set(q));
    });
  }

  protected search(event: Event): void {
    event.preventDefault();
    void this.router.navigateByUrl(caterersHref({ status: this.status(), q: this.query().trim() }));
  }

  protected removeChip(value: string): void {
    const href = value === 'q' ? caterersHref({ status: this.status() }) : caterersHref({ q: this.q() });
    void this.router.navigateByUrl(href);
  }
}
