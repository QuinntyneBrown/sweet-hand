import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, Icon, Radio, RadioGroup, Textarea, graphemeLength } from '@sweet-hand/components';
import { count, shortDate } from '../../../../core/format/format';
import { problemOf } from '../../../../core/forms/problem';
import { DETAILS_MAX, REPORT_REASONS, reportErrors } from './report-rules';
import { BotChallengeService, type ReportReason, type ReportRequest, ReportsService } from '@sweet-hand/api';

type Step = 'form' | 'sent' | 'duplicate';
type Failure = 'server' | 'limit' | null;

/**
 * "Report this listing" (docs/detailed-designs/moderation/report-content,
 * docs/mocks/dialogs/report). Open to everyone, signed in or not (L2-054).
 */
@Component({
  selector: 'app-report-dialog',
  imports: [Alert, Button, Dialog, FormField, Icon, Radio, RadioGroup, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report-dialog.html',
})
export class ReportDialog {
  readonly open = input(false);
  /** What is being reported: a caterer by slug, with the name the dialog shows. */
  readonly target = input.required<{ kind: ReportRequest['targetKind']; id: string; name: string }>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly closed = output<void>();

  private readonly api = inject(ReportsService);
  private readonly bot = inject(BotChallengeService);
  private readonly injector = inject(Injector);

  protected readonly reasons = REPORT_REASONS;
  protected readonly step = signal<Step>('form');
  protected readonly reason = signal<string | null>(null);
  protected readonly details = signal('');
  protected readonly errors = signal<{ reason: string | null; details: string | null }>({ reason: null, details: null });
  protected readonly busy = signal(false);
  protected readonly failure = signal<Failure>(null);
  protected readonly reportedAt = signal<string | null>(null);

  protected readonly length = computed(() => graphemeLength(this.details()));
  protected readonly counter = computed(() => `${count(this.length())} / ${count(DETAILS_MAX)}`);
  protected readonly detailsMarker = computed(() =>
    this.reason() === 'Other' ? $localize`:@@report.detailsNeeded:(needed for “Other”)` : $localize`:@@common.optional:(optional)`,
  );
  protected readonly duplicateText = computed(() => {
    const at = this.reportedAt();
    return at
      ? $localize`:@@report.duplicateText:Your report from ${shortDate(at)}:date: is still with our team. We’ll email you when it’s been reviewed.`
      : '';
  });
  protected readonly sentText = computed(() => $localize`:@@report.sentText:We review every report. ${this.target().name}:name: won’t be told who sent it.`);
  protected readonly sending = $localize`:@@report.busy:Sending your report`;

  private readonly group = viewChild(RadioGroup);
  private readonly detailsField = viewChild(FormField);
  private readonly done = viewChild('done', { read: Button });
  protected readonly cancelText = $localize`:@@common.cancel:Cancel`;

  protected choose(value: string): void {
    this.reason.set(value);
    this.errors.update((e) => ({ ...e, reason: null }));
  }

  protected async submit(): Promise<void> {
    if (this.busy() || this.failure() === 'limit') return;
    this.failure.set(null);
    const reason = this.reason() as ReportReason | null;
    const errors = reportErrors(reason, this.details(), this.length());
    this.errors.set(errors);
    if (errors.reason) return this.afterRender(() => this.group()?.focus());
    if (errors.details) return this.afterRender(() => this.detailsField()?.focusControl());

    this.busy.set(true);
    try {
      const challengeToken = await this.bot.token('report');
      const t = this.target();
      await firstValueFrom(this.api.submit({ targetKind: t.kind, targetId: t.id, reason: reason!, details: this.details().trim(), challengeToken }));
      this.finish('sent');
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 409) {
        this.reportedAt.set(typeof problem['reportedAt'] === 'string' ? problem['reportedAt'] : null);
        this.finish('duplicate');
      } else if (status === 429) {
        this.failure.set('limit');
      } else if (status === 400 && problem.errors?.['details']) {
        this.errors.set({ reason: null, details: problem.errors['details'][0] });
        this.afterRender(() => this.detailsField()?.focusControl());
      } else {
        this.failure.set('server');
      }
    } finally {
      this.busy.set(false);
    }
  }

  /** Closing resets the dialog, so the next report starts afresh. */
  protected reset(): void {
    this.step.set('form');
    this.reason.set(null);
    this.details.set('');
    this.errors.set({ reason: null, details: null });
    this.failure.set(null);
    this.reportedAt.set(null);
  }

  private finish(step: Step): void {
    this.step.set(step);
    this.afterRender(() => this.done()?.focus());
  }

  private afterRender(fn: () => void): void {
    afterNextRender(fn, { injector: this.injector });
  }
}
