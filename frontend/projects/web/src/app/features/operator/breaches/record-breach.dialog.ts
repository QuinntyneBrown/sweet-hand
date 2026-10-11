import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Checkbox, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField, Textarea, type SummaryItem } from '@sweet-hand/components';
import { OperatorSettingsApi } from '../../../core/api/operator-settings-api';
import type { BreachInformation, BreachRecord, RecordBreachRequest } from '../../../core/api/operator-settings.models';
import { torontoToday } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { breachErrors, type BreachErrors, type BreachField } from './breach-rules';

const INFORMATION: { value: BreachInformation; label: string }[] = [
  { value: 'Names', label: $localize`:@@recordBreach.names:Names` },
  { value: 'Email addresses', label: $localize`:@@recordBreach.emails:Email addresses` },
  { value: 'Phone numbers', label: $localize`:@@recordBreach.phones:Phone numbers` },
  { value: 'Event details', label: $localize`:@@recordBreach.events:Event details` },
  { value: 'Messages', label: $localize`:@@recordBreach.messages:Messages` },
  { value: 'Food handler certificates', label: $localize`:@@recordBreach.certificates:Food handler certificates` },
];

/** Where each error's summary link goes (L2-068.3). */
const CONTROL: Record<BreachField, string> = { date: 'br-date', what: 'br-what', people: 'br-people', risk: 'risk-low', decision: 'decision-report' };

/** Record a breach (docs/mocks/dialogs/record-breach; RecordBreachScreen, L2-075.2). */
@Component({
  selector: 'app-record-breach-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Checkbox, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      size="form"
      [form]="true"
      [fullScreenOnPhone]="true"
      title="Record a breach"
      i18n-title="@@recordBreach.title"
      description="Kept for at least 24 months. You can’t edit or delete a record later."
      i18n-description="@@recordBreach.description"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="saving"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
      (submitted)="save()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="We couldn’t save this record" i18n-title="@@recordBreach.failedTitle"
          ><ng-container i18n="@@recordBreach.failedText">Nothing was saved. Everything you entered is still here; try again.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryTitle()" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="breach-summary" />
      <sh-form-field label="Date confirmed" i18n-label="@@recordBreach.date" controlId="br-date" [error]="errors().date ?? null">
        <sh-text-field [formControl]="date" type="date" name="date" [max]="today" [required]="true" [readonly]="busy()" [autofocus]="true" />
      </sh-form-field>
      <sh-form-field label="What happened" i18n-label="@@recordBreach.what" controlId="br-what" [error]="errors().what ?? null">
        <sh-textarea [formControl]="what" name="what" [rows]="3" [required]="true" [readonly]="busy()" />
      </sh-form-field>
      <fieldset>
        <legend i18n="@@recordBreach.information">Information involved</legend>
        <div class="option-grid">
          @for (option of options; track option.value) {
            <sh-checkbox name="info" [value]="option.value" [checked]="information().includes(option.value)" (checkedChange)="toggle(option.value, $event)" [disabled]="busy()">{{ option.label }}</sh-checkbox>
          }
        </div>
      </fieldset>
      <sh-form-field label="People affected" i18n-label="@@recordBreach.people" controlId="br-people" [error]="errors().people ?? null">
        <sh-text-field [formControl]="people" name="people" inputmode="numeric" autocomplete="off" [required]="true" [readonly]="busy()" />
      </sh-form-field>
      <sh-radio-group name="risk" [(value)]="risk" [error]="errors().risk ?? null" [disabled]="busy()">
        <span slot="legend" i18n="@@recordBreach.riskLegend">Risk of significant harm</span>
        <sh-radio value="low" inputId="risk-low" i18n="@@recordBreach.riskLow">Low</sh-radio>
        <sh-radio value="real" inputId="risk-real" i18n="@@recordBreach.riskReal">Real risk of significant harm</sh-radio>
      </sh-radio-group>
      <sh-form-field label="Risk assessment" i18n-label="@@recordBreach.riskNotes" controlId="br-risk">
        <sh-textarea [formControl]="riskNotes" name="risk_notes" [rows]="2" [readonly]="busy()" />
      </sh-form-field>
      <sh-radio-group name="decision" [(value)]="decision" [error]="errors().decision ?? null" [disabled]="busy()">
        <span slot="legend" i18n="@@recordBreach.decisionLegend">Notification decision</span>
        <sh-radio value="report" inputId="decision-report" i18n="@@recordBreach.decisionReport">Report to the Privacy Commissioner and notify the people affected</sh-radio>
        <sh-radio value="not" inputId="decision-not" i18n="@@recordBreach.decisionNot">Not reportable: no real risk of significant harm</sh-radio>
      </sh-radio-group>
      <sh-button slot="footer" type="submit" variant="primary" [busy]="busy()"><ng-container i18n="@@recordBreach.submit">Save record</ng-container></sh-button>
    </sh-dialog>
  `,
})
export class RecordBreachDialog {
  private readonly api = inject(OperatorSettingsApi);

  readonly open = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly recorded = output<BreachRecord>();

  protected readonly options = INFORMATION;
  protected readonly today = torontoToday();
  protected readonly date = new FormControl('', { nonNullable: true });
  protected readonly what = new FormControl('', { nonNullable: true });
  protected readonly people = new FormControl('', { nonNullable: true });
  protected readonly riskNotes = new FormControl('', { nonNullable: true });
  protected readonly information = signal<BreachInformation[]>([]);
  protected readonly risk = signal<string | null>(null);
  protected readonly decision = signal<string | null>(null);
  protected readonly errors = signal<BreachErrors>({});
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly saving = $localize`:@@recordBreach.busy:Saving the record`;
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return (Object.keys(CONTROL) as BreachField[]).filter((f) => e[f]).map((f) => ({ controlId: CONTROL[f], message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@recordBreach.action:save the record`));

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          for (const c of [this.date, this.what, this.people, this.riskNotes]) c.reset();
          this.information.set([]);
          this.risk.set(null);
          this.decision.set(null);
          this.errors.set({});
          this.failed.set(false);
          this.attempt.set(0);
        });
    });
  }

  protected toggle(value: BreachInformation, checked: boolean): void {
    this.information.update((all) => (checked ? [...all.filter((v) => v !== value), value] : all.filter((v) => v !== value)));
  }

  protected async save(): Promise<void> {
    if (this.busy()) return;
    const request: RecordBreachRequest = {
      date: this.date.value,
      what: this.what.value.trim(),
      information: INFORMATION.map((o) => o.value).filter((v) => this.information().includes(v)),
      people: this.people.value.trim(),
      risk: this.risk() as RecordBreachRequest['risk'],
      riskNotes: this.riskNotes.value.trim(),
      decision: this.decision() as RecordBreachRequest['decision'],
    };
    this.failed.set(false);
    const errors = breachErrors(request, this.today);
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      this.recorded.emit(await firstValueFrom(this.api.recordBreach(request)));
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        this.errors.set(Object.fromEntries(Object.entries(problem.errors).map(([f, m]) => [f, m[0]])) as BreachErrors);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
