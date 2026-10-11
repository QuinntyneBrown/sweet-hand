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
import { type AuditPage as AuditResult, type AuditQuery, OperatorSettingsService } from '@sweet-hand/api';
import { paths } from '../../../core/routing/paths';

/** The audit log, /admin/audit (docs/mocks/pages/admin-audit; AuditLogPage, L2-060). Admin only (L2-056.5). */
@Component({
  selector: 'app-audit-page',
  imports: [ReactiveFormsModule, RouterLink, EmptyState, Icon, Pagination, Table, TableNa],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit.page.html',
})
export class AuditPage {
  protected readonly paths = paths;
  private readonly api = inject(OperatorSettingsService);
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

  protected readonly hrefFor = (page: number) => this.router.serializeUrl(this.router.createUrlTree([paths.admin.audit], { queryParams: { ...this.queryParams(), page } }));
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
    void this.router.navigate([paths.admin.audit], { queryParams: { operator: v.operator || null, action: v.action || null, target: v.target.trim() || null, from: v.from || null, to: v.to || null } });
  }

  private queryParams(): Record<string, string | null> {
    const q = this.query();
    return { operator: q.operator || null, action: q.action || null, target: q.target || null, from: this.from() || null, to: this.to() || null };
  }
}
