import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BreachRecord as BreachRecordRow, Button, Description, DescriptionList, EmptyState, Icon, List, ToastNotifier } from '@sweet-hand/components';
import { count, shortDate } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { RecordBreachDialog } from './record-breach.dialog';
import { type BreachRecord, OperatorSettingsService } from '@sweet-hand/api';

/** "Confirmed Thu 17 Sep 2026 · recorded by Leah Mohammed" */
export function breachWhen(b: BreachRecord): string {
  // The year is always shown: records are kept for years.
  const date = shortDate(b.confirmedOn, new Date(0));
  return $localize`:@@breaches.when:Confirmed ${date}:date: · recorded by ${b.recordedBy}:name:`;
}

/** The breach register, /admin/breaches (docs/mocks/pages/admin-breaches; BreachRegisterPage, L2-075.2). */
@Component({
  selector: 'app-breaches-page',
  imports: [RouterLink, BreachRecordRow, Button, Description, DescriptionList, EmptyState, Icon, List, RecordBreachDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro" [attr.aria-busy]="loading() ? 'true' : null">
      <div class="page-intro__row">
        <div>
          <h1 i18n="@@breaches.title">Breach register</h1>
          @if (loading()) {
            <p class="subtitle"><span class="skeleton skeleton--text" style="width: 60%" aria-hidden="true"></span></p>
          } @else if (records()?.length) {
            <p class="subtitle">{{ subtitle() }}</p>
          } @else {
            <p class="subtitle" i18n="@@breaches.subtitlePlain">Each record is kept for at least 24 months</p>
          }
        </div>
        @if (loading()) {
          <span class="skeleton skeleton--rect skeleton--pill" style="width: var(--space-32); height: var(--control-height-md)" aria-hidden="true"></span>
        } @else if (records()?.length) {
          <sh-button variant="primary" haspopup="dialog" (activated)="openRecord($event)" i18n="@@breaches.record">Record a breach</sh-button>
        }
      </div>
    </div>
    @if (failure(); as f) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load the breach register"
        i18n-heading="@@breaches.errorTitle"
        text="The records are safe; only this view failed. Try again in a moment."
        i18n-text="@@breaches.errorText"
        [reference]="f.reference"
        referenceLabel="Reference"
        i18n-referenceLabel="@@common.reference"
      >
        <svg slot="icon" shIcon="danger"></svg>
        <ng-container slot="actions">
          <button class="btn btn--primary" type="button" (click)="load()"><svg shIcon="refresh"></svg><ng-container i18n="@@common.tryAgain">Try again</ng-container></button>
          <a class="btn btn--ghost" routerLink="/admin/queue" i18n="@@operator.backToQueue">Back to review queue</a>
        </ng-container>
      </sh-empty-state>
    } @else if (records()?.length === 0) {
      <sh-empty-state
        heading="No breaches recorded"
        i18n-heading="@@breaches.emptyTitle"
        text="Record a breach of security safeguards here as soon as it’s confirmed, even if nobody needs to be told."
        i18n-text="@@breaches.emptyText"
      >
        <svg slot="icon" shIcon="shield"></svg>
        <sh-button slot="actions" variant="primary" haspopup="dialog" (activated)="openRecord($event)" i18n="@@breaches.record">Record a breach</sh-button>
      </sh-empty-state>
    } @else {
      <sh-list family="breach" label="Recorded breaches, newest first" i18n-label="@@breaches.listLabel" [busy]="loading()" busyLabel="Loading breach records" i18n-busyLabel="@@breaches.loading" [skeletonCount]="2">
        @for (b of records(); track b.id) {
          <li sh-breach-record [title]="b.title" [when]="when(b)">
            <sh-description-list layout="record">
              <sh-description term="Information involved" i18n-term="@@breaches.information">{{ b.information }}</sh-description>
              <sh-description term="People affected" i18n-term="@@breaches.people">{{ people(b) }}</sh-description>
              <sh-description term="Risk assessment" i18n-term="@@breaches.risk">{{ b.riskAssessment }}</sh-description>
              <sh-description term="Notification decision" i18n-term="@@breaches.decision">{{ b.notificationDecision }}</sh-description>
            </sh-description-list>
          </li>
        }
      </sh-list>
    }
    <app-record-breach-dialog [open]="recording()" [returnFocus]="opener()" (closed)="recording.set(false)" (recorded)="recorded($event)" />
  `,
})
export class BreachesPage {
  private readonly api = inject(OperatorSettingsService);
  private readonly toasts = inject(ToastNotifier);

  protected readonly records = signal<BreachRecord[] | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly loading = computed(() => !this.records() && !this.failure());
  protected readonly recording = signal(false);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly subtitle = computed(() => {
    const n = this.records()?.length ?? 0;
    return n === 1
      ? $localize`:@@breaches.subtitleOne:1 record · kept for at least 24 months`
      : $localize`:@@breaches.subtitle:${n}:count: records · each kept for at least 24 months`;
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.failure.set(null);
    this.records.set(null);
    try {
      this.records.set(await firstValueFrom(this.api.breaches()));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected when(b: BreachRecord): string {
    return breachWhen(b);
  }

  protected people(b: BreachRecord): string {
    return count(b.peopleAffected);
  }

  protected openRecord(event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.recording.set(true);
  }

  /** Newest first: the new record goes in by its confirmed date. */
  protected recorded(record: BreachRecord): void {
    this.recording.set(false);
    this.records.update((all) => [record, ...(all ?? [])].sort((a, b) => b.confirmedOn.localeCompare(a.confirmedOn) || b.recordedAt.localeCompare(a.recordedAt)));
    this.toasts.show({ tone: 'success', title: $localize`:@@breaches.recorded:Breach recorded`, text: $localize`:@@breaches.recordedText:It’s kept for at least 24 months and can’t be changed.` });
  }
}
