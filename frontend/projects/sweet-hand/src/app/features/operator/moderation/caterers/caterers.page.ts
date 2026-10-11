import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActiveFilters, ChangedFlag, EMPTY_STATE, FormField, Icon, Pagination, Queue, QueueItem, Segmented, Status, TextField } from '@sweet-hand/components';
import { problemOf, reference } from '../../../../core/forms/problem';
import { pageName, pageSummary, readPage } from '../moderation-text';
import { caterersHref, caterersSubtitle, catererRow, noResults, readStatusFilter, statusFilters, statusOfFilter } from './caterers-view';
import { profileStatusLabel } from '../moderation-text';
import { type CaterersPageView, OperatorModerationService } from '@sweet-hand/api';
import { paths } from '../../../../core/routing/paths';

/** Every caterer in every status, /admin/caterers (suspend-reinstate-remove-profile design; docs/mocks/pages/admin-caterers). */
@Component({
  selector: 'app-operator-caterers-page',
  imports: [RouterLink, ActiveFilters, ChangedFlag, EMPTY_STATE, FormField, Icon, Pagination, Queue, QueueItem, Segmented, Status, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './caterers.page.html',
  styleUrl: './caterers.page.css',
})
export class OperatorCaterersPage {
  protected readonly paths = paths;
  private readonly api = inject(OperatorModerationService);
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
