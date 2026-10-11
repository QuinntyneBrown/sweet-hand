import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Alert, BackLink, Button, EMPTY_STATE, Icon, Message, MessageList, Stars, Status } from '@sweet-hand/components';
import { longDate, shortDate } from '../../../../core/format/format';
import { problemOf, reference } from '../../../../core/forms/problem';
import { Session } from '../../../../core/session/session';
import { ReasonDialog } from '../decisions/reason-dialog';
import { dayTime, fullDate, profileStatusLabel, profileStatusTone } from '../moderation-text';
import {
  eventLine,
  hiddenText,
  hiddenTitle,
  privacyNote,
  reportByline,
  reportHeading,
  reportSubtitle,
  resolvedText,
  resolvedTitle,
  reviewStatusLabel,
} from './report-view';
import { ResolveReportDialog } from './resolve-report-dialog';
import { OPERATOR_MODERATION_SERVICE } from '@sweet-hand/api';

/** One reported item and its reports, /admin/reports/:id (handle-reports design; docs/mocks/pages/admin-report). */
@Component({
  selector: 'app-report-page',
  imports: [RouterLink, Alert, BackLink, Button, EMPTY_STATE, Icon, Message, MessageList, Stars, Status, ReasonDialog, ResolveReportDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report.page.html',
  styleUrl: './report.page.css',
})
export class ReportPage {
  private readonly api = inject(OPERATOR_MODERATION_SERVICE);
  private readonly session = inject(Session);

  /** The report id from the route. */
  readonly id = input.required<string>();

  protected readonly report = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.report(params),
  });
  /** The group as loaded, or as the last decision returned it. */
  protected readonly view = linkedSignal<ReportGroupView | undefined>(() => (this.report.hasValue() ? this.report.value() : undefined));
  protected readonly failed = computed(() => !!this.report.error() && !this.view());
  protected readonly errorReference = computed(() => reference(problemOf(this.report.error()).problem));
  protected readonly admin = computed(() => !!this.session.user()?.admin);

  private readonly g = computed(() => this.view()!);
  protected readonly heading = computed(() => reportHeading(this.g()));
  protected readonly subtitle = computed(() => reportSubtitle(this.g()));
  protected readonly reviewStatus = computed(() => reviewStatusLabel(this.g()));
  protected readonly privacy = computed(() => privacyNote(this.g()));
  protected readonly autoHidden = computed(() => {
    const t = this.g().target;
    return this.g().status === 'Open' && t.kind === 'Review' && t.status === 'Hidden' && t.hiddenBy === 'reports';
  });
  protected readonly hiddenTitle = computed(() => hiddenTitle(this.g()));
  protected readonly hiddenText = computed(() => hiddenText(this.g()));
  protected readonly resolvedTitle = computed(() => resolvedTitle(this.g()));
  protected readonly resolvedText = computed(() => resolvedText(this.g()));
  protected readonly reportsHeading = computed(() => {
    const g = this.g();
    if (g.reports.length === 1) return g.target.kind === 'Review' ? $localize`:@@queue.oneReport:1 report` : $localize`:@@report.single:Report`;
    return $localize`:@@queue.reports:${g.reports.length}:count: reports`;
  });
  protected readonly enquiryLine = computed(() => {
    const e = this.g().linkedEnquiry;
    if (!e) return '';
    return $localize`:@@report.enquiryLine:${e.customer}:customer: → ${e.caterer}:caterer: · ${this.dayDate(e.eventDate)}:date: · ${e.guests}:guests: guests · ${e.status}:status:`;
  });
  protected readonly enquiryDescription = computed(() => {
    const e = this.g().linkedEnquiry;
    return e ? `${e.customer} → ${e.caterer} · ${this.dayDate(e.eventDate)}` : '';
  });
  protected readonly enquiryExplanation = computed(
    () => $localize`:@@openEnquiry.explanation:Enquiries are private between a customer and a caterer. You can open this one because it’s linked to report ${this.g().id}:id:.`,
  );

  protected readonly eventLine = eventLine;
  protected readonly byline = reportByline;
  protected readonly fullDate = fullDate;
  protected readonly statusTone = profileStatusTone;
  protected readonly statusLabel = profileStatusLabel;
  protected readonly outOf5 = (n: number) => $localize`:@@reviews.outOf5:${n}:rating: out of 5`;

  protected readonly dialog = signal<'resolve' | 'enquiry' | null>(null);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly enquiry = signal<ReportEnquiryView | null>(null);
  protected readonly validateEnquiryReason = (reason: string) => (reason.trim() ? null : $localize`:@@openEnquiry.reasonRequired:Add a reason for opening this enquiry`);
  protected readonly enquiryAction = (reason: string) => this.api.openEnquiry(this.g().id, reason);
  protected readonly enquirySummary = $localize`:@@openEnquiry.summary:Fix 1 thing to open the enquiry`;
  protected readonly enquiryFailedText = $localize`:@@openEnquiry.failedText:Nothing was recorded. Check your connection and try again.`;

  protected open(kind: 'resolve' | 'enquiry', event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.dialog.set(kind);
  }

  protected resolved(view: ReportGroupView): void {
    this.dialog.set(null);
    this.view.set(view);
    void this.session.refresh();
  }

  protected opened(view: ReportEnquiryView): void {
    this.dialog.set(null);
    this.enquiry.set(view);
  }

  /** "Sat 12 Sep 2026" */
  protected dayDate(date: string): string {
    const parts = longDate(date).split(' ');
    return `${parts[0].slice(0, 3)} ${parts[1]} ${parts[2].slice(0, 3)} ${parts[3]}`;
  }

  protected messageTime(at: string): string {
    return dayTime(at);
  }

  protected sentOn(at: string): string {
    return shortDate(at);
  }
}
