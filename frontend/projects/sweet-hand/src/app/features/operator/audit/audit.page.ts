import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmptyState, Icon, Pagination, Table, TableNa, type TableColumn } from '@sweet-hand/components';
import { count } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { adminsToAsk } from '../admin-only';
import { ACTION_FILTERS, actionLabel, auditChange, auditCount, auditWhen, lastWeek, noMatchText } from './audit-view';
import { OPERATOR_SETTINGS_SERVICE } from '@sweet-hand/api';

/** The audit log, /admin/audit (docs/mocks/pages/admin-audit; AuditLogPage, L2-060). Admin only (L2-056.5). */
@Component({
  selector: 'app-audit-page',
  imports: [ReactiveFormsModule, RouterLink, EmptyState, Icon, Pagination, Table, TableNa],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (forbidden()) {
      <sh-empty-state heading="Only Admins can see the audit log" i18n-heading="@@audit.forbiddenTitle" [headingLevel]="1" [text]="forbiddenText()">
        <svg slot="icon" shIcon="lock"></svg>
        <a slot="actions" class="btn btn--primary" routerLink="/admin/queue" i18n="@@operator.backToTheQueue">Back to the queue</a>
      </sh-empty-state>
    } @else {
      <div class="page-intro">
        <h1 i18n="@@audit.title">Audit log</h1>
        <p class="subtitle" i18n="@@audit.subtitle">Append-only · newest first · kept for 7 years</p>
      </div>
      @if (result()?.anyEntries === false) {
        <sh-empty-state
          heading="No entries yet"
          i18n-heading="@@audit.emptyTitle"
          text="Every approval, edit, suspension, moderation decision and enquiry access is recorded here, permanently."
          i18n-text="@@audit.emptyText"
        >
          <svg slot="icon" shIcon="clock"></svg>
          <a slot="actions" class="btn btn--primary" routerLink="/admin/queue" i18n="@@operator.goToQueue">Go to the review queue</a>
        </sh-empty-state>
      } @else {
        <form class="toolbar" aria-label="Filter the audit log" i18n-aria-label="@@audit.filters" [formGroup]="filters" (ngSubmit)="apply()">
          <div class="field">
            <label class="field__label" for="op" i18n="@@audit.operator">Operator</label>
            <select class="select" id="op" formControlName="operator">
              <option value="" i18n="@@audit.allOperators">All operators</option>
              @for (o of operators(); track o.id) {
                <option [value]="o.id">{{ o.name }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="act" i18n="@@audit.action">Action</label>
            <select class="select" id="act" formControlName="action">
              <option value="" i18n="@@audit.allActions">All actions</option>
              @for (a of actions; track a.value) {
                <option [value]="a.value">{{ a.label }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label class="field__label" for="target" i18n="@@audit.target">Target</label>
            <input class="input" id="target" type="search" formControlName="target" placeholder="Name or ID" i18n-placeholder="@@audit.targetPlaceholder" autocomplete="off" />
          </div>
          <div class="field">
            <label class="field__label" for="from" i18n="@@audit.from">From</label>
            <input class="input" id="from" type="date" formControlName="from" [max]="today" />
          </div>
          <div class="field">
            <label class="field__label" for="to" i18n="@@audit.to">To</label>
            <input class="input" id="to" type="date" formControlName="to" [max]="today" />
          </div>
          <button class="btn btn--primary" type="submit" i18n="@@audit.apply">Apply</button>
        </form>
        @if (failure(); as f) {
          <sh-empty-state
            tone="error"
            heading="We couldn’t load the audit log"
            i18n-heading="@@audit.errorTitle"
            text="Your filters are kept. Nothing in the log has changed. Try again."
            i18n-text="@@audit.errorText"
            [reference]="f.reference"
            referenceLabel="Reference"
            i18n-referenceLabel="@@common.reference"
          >
            <svg slot="icon" shIcon="danger"></svg>
            <ng-container slot="actions">
              <button class="btn btn--primary" type="button" (click)="load()"><svg shIcon="refresh"></svg><ng-container i18n="@@common.tryAgain">Try again</ng-container></button>
              <a class="btn" routerLink="/admin/queue" i18n="@@operator.backToTheQueue">Back to the queue</a>
            </ng-container>
          </sh-empty-state>
        } @else if (result(); as r) {
          @if (r.total === 0) {
            <p class="result-count" role="status" i18n="@@audit.noMatchCount">No entries match these filters</p>
            <sh-empty-state heading="No entries match" i18n-heading="@@audit.noMatchTitle" [text]="noMatch()">
              <svg slot="icon" shIcon="search"></svg>
              <a slot="actions" class="btn btn--primary" routerLink="/admin/audit" i18n="@@audit.clearFilters">Clear filters</a>
            </sh-empty-state>
          } @else {
            <p class="result-count" role="status" style="margin-bottom: var(--space-4)">{{ countText() }}</p>
            <sh-table caption="Audit entries, newest first" i18n-caption="@@audit.caption" [columns]="columns" [region]="true">
              @for (e of rows(); track e.id) {
                <tr>
                  <td><time [attr.datetime]="e.at">{{ e.when }}</time></td>
                  <td>{{ e.operatorName }}</td>
                  <td><strong>{{ e.actionLabel }}</strong></td>
                  <td>{{ e.targetLabel }}<div class="list__meta">{{ e.targetId }}</div></td>
                  <td>{{ e.reason }}</td>
                  <td>
                    @if (e.change; as change) {
                      {{ change }}
                    } @else {
                      <sh-table-na label="No change" i18n-label="@@audit.noChange" />
                    }
                  </td>
                </tr>
              }
            </sh-table>
            <sh-pagination
              [page]="r.page"
              [pageCount]="pageCount()"
              [hrefFor]="hrefFor"
              label="Pagination"
              i18n-label="@@pagination.label"
              [summary]="pageSummary()"
              previousLabel="Previous page"
              i18n-previousLabel="@@pagination.previous"
              nextLabel="Next page"
              i18n-nextLabel="@@pagination.next"
              [pageLabel]="pageLabel"
            />
          }
        } @else {
          <sh-table caption="Audit entries, newest first" i18n-caption="@@audit.caption" [columns]="columns" [busy]="true" busyLabel="Loading audit entries" i18n-busyLabel="@@audit.loading" />
        }
      }
    }
  `,
})
export class AuditPage {
  private readonly api = inject(OPERATOR_SETTINGS_SERVICE);
  private readonly router = inject(Router);
  private readonly session = inject(Session);

  // Filters from the address (withComponentInputBinding).
  readonly operator = input<string>();
  readonly action = input<string>();
  readonly target = input<string>();
  readonly from = input<string>();
  readonly to = input<string>();
  readonly page = input<string>();

  protected readonly today = lastWeek().to;
  protected readonly actions = ACTION_FILTERS;
  protected readonly columns: TableColumn[] = [
    { key: 'when', label: $localize`:@@audit.when:When` },
    { key: 'operator', label: $localize`:@@audit.operator:Operator` },
    { key: 'action', label: $localize`:@@audit.action:Action` },
    { key: 'target', label: $localize`:@@audit.target:Target` },
    { key: 'reason', label: $localize`:@@audit.reason:Reason` },
    { key: 'change', label: $localize`:@@audit.change:Before → after` },
  ];
  protected readonly filters = new FormGroup({
    operator: new FormControl('', { nonNullable: true }),
    action: new FormControl('', { nonNullable: true }),
    target: new FormControl('', { nonNullable: true }),
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
  });

  protected readonly result = signal<AuditResult | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly forbidden = signal<string[] | null>(null);
  /** Kept from the last answer, so the filter keeps its names while a new page loads. */
  protected readonly operators = signal<{ id: string; name: string }[]>([]);

  private readonly query = computed<Required<Omit<AuditQuery, 'page'>> & { page: number }>(() => {
    const week = lastWeek();
    return {
      operator: this.operator() ?? '',
      action: this.action() ?? '',
      target: this.target() ?? '',
      from: this.from() || week.from,
      to: this.to() || week.to,
      page: Math.max(1, Number(this.page() ?? 1) || 1),
    };
  });

  protected readonly rows = computed(() =>
    (this.result()?.entries ?? []).map((e) => ({ ...e, when: auditWhen(e.at), actionLabel: actionLabel(e.action), change: auditChange(e) })),
  );
  protected readonly countText = computed(() => auditCount(this.result()?.total ?? 0, this.query().from, this.query().to));
  protected readonly pageCount = computed(() => {
    const r = this.result();
    return r ? Math.max(1, Math.ceil(r.total / r.pageSize)) : 1;
  });
  protected readonly pageSummary = computed(() => {
    const r = this.result();
    if (!r) return null;
    const first = (r.page - 1) * r.pageSize + 1;
    const last = Math.min(r.total, r.page * r.pageSize);
    return $localize`:@@audit.showing:Showing ${count(first)}:first:–${count(last)}:last: of ${count(r.total)}:total:`;
  });
  protected readonly noMatch = computed(() => {
    const q = this.query();
    const name = this.operators().find((o) => o.id === q.operator)?.name ?? null;
    return noMatchText(name, q.action, q.from, q.to);
  });
  protected readonly forbiddenText = computed(
    () =>
      $localize`:@@audit.forbiddenText:You’re signed in as ${this.session.user()?.displayName ?? ''}:name:, an operator. Ask ${adminsToAsk(this.forbidden() ?? [])}:admins:, an Admin, if you need an entry checked.`,
  );

  protected readonly hrefFor = (page: number) => this.router.serializeUrl(this.router.createUrlTree(['/admin/audit'], { queryParams: { ...this.queryParams(), page } }));
  protected readonly pageLabel = (page: number) => $localize`:@@pagination.page:Page ${page}:page:`;

  constructor() {
    effect(() => {
      const q = this.query();
      untracked(() => {
        this.filters.setValue({ operator: q.operator, action: q.action, target: q.target, from: q.from, to: q.to });
        void this.load();
      });
    });
  }

  protected async load(): Promise<void> {
    const q = this.query();
    this.failure.set(null);
    this.result.set(null);
    try {
      const result = await firstValueFrom(this.api.auditLog(q));
      this.operators.set(result.operators);
      this.result.set(result);
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 403) this.forbidden.set(Array.isArray(problem['admins']) ? (problem['admins'] as string[]) : []);
      else this.failure.set({ reference: reference(problem) });
    }
  }

  protected apply(): void {
    const v = this.filters.getRawValue();
    void this.router.navigate(['/admin/audit'], { queryParams: { operator: v.operator || null, action: v.action || null, target: v.target.trim() || null, from: v.from || null, to: v.to || null } });
  }

  private queryParams(): Record<string, string | null> {
    const q = this.query();
    return { operator: q.operator || null, action: q.action || null, target: q.target || null, from: this.from() || null, to: this.to() || null };
  }
}
