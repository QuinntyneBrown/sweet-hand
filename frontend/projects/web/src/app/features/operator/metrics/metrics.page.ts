import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  Alert,
  Button,
  ChartCard,
  ChartGrid,
  EmptyState,
  FormField,
  FormSummary,
  Icon,
  Select,
  Stat,
  StatGrid,
  Table,
  TextField,
  ToastNotifier,
  type SelectOption,
  type SummaryItem,
  type TableColumn,
} from '@sweet-hand/components';
import { MetricsApi } from '../../../core/api/metrics-api';
import type { EnquiryMetrics, Granularity, MetricsQuery, MetricsReport } from '../../../core/api/metrics.models';
import { count, torontoToday } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { charts, emptyText, lastSixWeeks, percent, publishedDelta, rangeError, rangeSubtitle, statusCaption, statusName, sum } from './metrics-view';

/** The metrics dashboard, /admin/metrics (docs/mocks/pages/admin-metrics; MetricsDashboardPage, L2-061, L2-063). */
@Component({
  selector: 'app-metrics-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, ChartCard, ChartGrid, EmptyState, FormField, FormSummary, Icon, Select, Stat, StatGrid, Table, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro">
      <h1 i18n="@@metrics.title">Metrics</h1>
      <p class="subtitle">{{ subtitle() }}</p>
    </div>
    <sh-form-summary [heading]="summaryTitle()" [items]="summary()" [attempt]="attempt()" summaryId="metrics-summary" />
    <form class="toolbar" aria-label="Date range" i18n-aria-label="@@metrics.rangeForm" [formGroup]="form" (ngSubmit)="apply()">
      <sh-form-field label="From" i18n-label="@@metrics.from" controlId="from" [error]="error()?.field === 'from' ? error()!.message : null">
        <sh-text-field formControlName="from" type="date" name="from" [max]="today" />
      </sh-form-field>
      <sh-form-field label="To" i18n-label="@@metrics.to" controlId="to" [error]="error()?.field === 'to' ? error()!.message : null">
        <sh-text-field formControlName="to" type="date" name="to" [max]="today" />
      </sh-form-field>
      <sh-form-field label="Show by" i18n-label="@@metrics.showBy" controlId="by">
        <sh-select formControlName="by" name="by" [options]="granularities" />
      </sh-form-field>
      <sh-button type="submit" variant="primary" i18n="@@metrics.apply">Apply</sh-button>
      <sh-button [disabled]="!canExport()" [busy]="exporting()" (activated)="exportCsv()"><svg shIcon="download"></svg><ng-container i18n="@@metrics.export">Export CSV</ng-container></sh-button>
    </form>
    @if (failure(); as f) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load metrics"
        i18n-heading="@@metrics.errorTitle"
        text="The metrics service didn’t answer. Your range is kept; try again."
        i18n-text="@@metrics.errorText"
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
    } @else if (report()?.hasData === false) {
      <sh-empty-state heading="No activity in this range" i18n-heading="@@metrics.emptyTitle" [text]="empty()">
        <svg slot="icon" shIcon="calendar"></svg>
        <a slot="actions" class="btn btn--primary" routerLink="/admin/metrics" i18n="@@metrics.lastSixWeeks">Show the last 6 weeks</a>
      </sh-empty-state>
    } @else if (report(); as r) {
      <div class="metrics__stats">
      <sh-stat-grid>
        <sh-stat label="Published caterers" i18n-label="@@metrics.publishedCaterers" [value]="published()" [delta]="delta().text" [direction]="delta().direction" [sentiment]="delta().sentiment" />
        <sh-stat label="Enquiries" i18n-label="@@metrics.enquiries" [value]="enquiryTotal()" missingLabel="Not loaded" i18n-missingLabel="@@metrics.notLoaded" />
        <sh-stat label="Replied within 48 hours" i18n-label="@@metrics.replied" [value]="repliedTotal()" missingLabel="Not loaded" i18n-missingLabel="@@metrics.notLoaded" />
        <sh-stat label="Caterer page visits" i18n-label="@@metrics.catererVisits" [value]="catererTotal()" />
      </sh-stat-grid>
      </div>
      <h2 class="visually-hidden" i18n="@@metrics.charts">Charts</h2>
      @if (enquiriesFailed()) {
        <div class="metrics__alert">
        <sh-alert tone="danger" live="assertive" title="2 charts didn’t load" i18n-title="@@metrics.partialTitle"
          ><ng-container i18n="@@metrics.othersOk">The other figures are up to date.</ng-container>
          <div slot="actions" class="alert__actions">
            <sh-button size="sm" (activated)="reloadEnquiries()"><ng-container i18n="@@common.tryAgain">Try again</ng-container></sh-button>
          </div></sh-alert
        >
        </div>
      }
      <sh-chart-grid>
        @for (c of chartViews(); track c.key) {
          <sh-chart-card
            [title]="c.title"
            [total]="c.total"
            [label]="c.label"
            [points]="c.points"
            [scale]="c.scale"
            [current]="c.current"
            soFarLabel="so far"
            i18n-soFarLabel="@@metrics.soFar"
            [periodHeader]="c.periodHeader"
            [valueHeader]="c.valueHeader"
            tableLabel="Show as a table"
            i18n-tableLabel="@@metrics.showTable"
            [failed]="c.failed"
            failedTitle="This chart didn’t load"
            i18n-failedTitle="@@metrics.chartFailed"
            failedText="The other figures are up to date."
            i18n-failedText="@@metrics.othersOk"
            retryLabel="Try again"
            i18n-retryLabel="@@common.tryAgain"
            (retried)="reloadEnquiries()"
          />
        }
      </sh-chart-grid>
      <section class="caterer-section" aria-labelledby="status-title">
        <h2 id="status-title" i18n="@@metrics.byStatus">Caterers by status</h2>
        <sh-table [caption]="statusTableCaption()" [columns]="statusColumns">
          @for (s of r.statuses; track s.status) {
            <tr>
              <th scope="row">{{ statusLabel(s.status) }}</th>
              <td class="num">{{ format(s.count) }}</td>
            </tr>
          }
        </sh-table>
      </section>
    } @else if (!blocked()) {
      <div class="metrics__stats"><sh-stat-grid [busy]="true" busyLabel="Loading metrics" i18n-busyLabel="@@metrics.loading" /></div>
      <sh-chart-grid>
        @for (i of sixCharts; track i) {
          <sh-chart-card title="" label="" [busy]="true" />
        }
      </sh-chart-grid>
    }
  `,
  styles: `
    .metrics__stats {
      margin-bottom: var(--space-10);
    }
    .metrics__alert {
      margin-bottom: var(--space-6);
    }
  `,
})
export class MetricsPage {
  private readonly api = inject(MetricsApi);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastNotifier);

  // The range in the address (withComponentInputBinding): ?from=…&to=…&by=week
  readonly from = input<string>();
  readonly to = input<string>();
  readonly by = input<string>();

  protected readonly today = torontoToday();
  protected readonly sixCharts = [0, 1, 2, 3, 4, 5];
  protected readonly granularities: SelectOption[] = [
    { value: 'day', label: $localize`:@@metrics.day:Day` },
    { value: 'week', label: $localize`:@@metrics.week:Week` },
    { value: 'month', label: $localize`:@@metrics.month:Month` },
  ];
  protected readonly statusColumns: TableColumn[] = [
    { key: 'status', label: $localize`:@@metrics.status:Status` },
    { key: 'count', label: $localize`:@@metrics.caterers:Caterers`, numeric: true },
  ];
  protected readonly form = new FormGroup({
    from: new FormControl('', { nonNullable: true }),
    to: new FormControl('', { nonNullable: true }),
    by: new FormControl<string>('week', { nonNullable: true }),
  });

  protected readonly query = computed<MetricsQuery>(() => {
    const d = lastSixWeeks();
    const by = this.by();
    return { from: this.from() || d.from, to: this.to() || d.to, granularity: by === 'day' || by === 'month' ? by : 'week' };
  });
  protected readonly report = signal<MetricsReport | null>(null);
  protected readonly enquiries = signal<EnquiryMetrics | null>(null);
  protected readonly enquiriesFailed = signal(false);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly error = signal<{ field: 'from' | 'to'; message: string } | null>(null);
  protected readonly attempt = signal(0);
  protected readonly exporting = signal(false);
  /** The address holds a range the dashboard refuses: nothing loads until a valid one is applied. */
  protected readonly blocked = signal(false);

  protected readonly subtitle = computed(() => {
    const q = this.query();
    return rangeSubtitle(q.from, q.to, q.granularity, this.report()?.hasData !== false);
  });
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: e.field, message: e.message }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@metrics.action:apply the range`));
  /** Every figure is loaded and the range is valid, so a file never has silent gaps. */
  protected readonly canExport = computed(() => !!this.report()?.hasData && !!this.enquiries() && !this.error());
  protected readonly chartViews = computed(() => (this.report() ? charts(this.report()!, this.enquiriesFailed() ? null : this.enquiries()) : []));
  protected readonly published = computed(() => count(this.report()?.statuses.find((s) => s.status === 'Published')?.count ?? 0));
  protected readonly delta = computed(() => publishedDelta(sum(this.report()?.newPublished ?? [])));
  protected readonly enquiryTotal = computed(() => (this.enquiries() && !this.enquiriesFailed() ? count(sum(this.enquiries()!.enquiries)) : null));
  protected readonly repliedTotal = computed(() => {
    const e = this.enquiries();
    if (!e || this.enquiriesFailed()) return null;
    return e.repliedOverall === null ? '–' : percent(e.repliedOverall);
  });
  protected readonly catererTotal = computed(() => count(sum(this.report()?.catererVisits ?? [])));
  protected readonly statusTableCaption = computed(() => statusCaption(this.query().to));
  protected readonly empty = computed(() => emptyText(this.report()?.countingSince ?? '2026-08-03'));

  constructor() {
    effect(() => {
      const q = this.query();
      untracked(() => {
        this.form.setValue({ from: q.from, to: q.to, by: q.granularity });
        const error = rangeError(q.from, q.to, this.today);
        this.error.set(error);
        this.blocked.set(!!error);
        if (error) {
          this.report.set(null);
          this.attempt.update((n) => n + 1);
        } else {
          void this.load();
        }
      });
    });
  }

  protected statusLabel(status: string): string {
    return statusName(status);
  }

  protected format(n: number): string {
    return count(n);
  }

  protected async load(): Promise<void> {
    const q = this.query();
    this.failure.set(null);
    this.report.set(null);
    this.enquiries.set(null);
    this.enquiriesFailed.set(false);
    const enquiries = firstValueFrom(this.api.enquiries(q)).then(
      (e) => this.enquiries.set(e),
      () => this.enquiriesFailed.set(true),
    );
    try {
      this.report.set(await firstValueFrom(this.api.report(q)));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
    await enquiries;
  }

  protected async reloadEnquiries(): Promise<void> {
    try {
      const e = await firstValueFrom(this.api.enquiries(this.query()));
      this.enquiries.set(e);
      this.enquiriesFailed.set(false);
    } catch {
      this.enquiriesFailed.set(true);
    }
  }

  /** The charts keep the last valid range until a valid one is applied (L2-061.2). */
  protected apply(): void {
    const v = this.form.getRawValue();
    const error = rangeError(v.from, v.to, this.today);
    this.error.set(error);
    if (error) {
      this.attempt.update((n) => n + 1);
      return;
    }
    void this.router.navigate(['/admin/metrics'], { queryParams: { from: v.from, to: v.to, by: v.by as Granularity } });
  }

  protected async exportCsv(): Promise<void> {
    if (!this.canExport() || this.exporting()) return;
    this.exporting.set(true);
    try {
      const { filename, file } = await firstValueFrom(this.api.exportCsv(this.query()));
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      this.toasts.show({ tone: 'info', title: $localize`:@@metrics.exportReady:Metrics export ready`, text: filename });
    } catch {
      this.toasts.show({ tone: 'danger', title: $localize`:@@metrics.exportFailed:Couldn’t export the metrics`, text: $localize`:@@metrics.exportFailedText:Nothing was downloaded. Try again.` });
    } finally {
      this.exporting.set(false);
    }
  }
}
