import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Checkbox, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField, Textarea } from '@sweet-hand/components';
import { torontoToday } from '../../../core/format/format';
import { summaryFrom, summaryHeading } from '../../../core/forms/validation';
import { breachErrors, type BreachField } from './breach-rules';
import type { BreachErrors } from './breach-errors';
import { type BreachInformation, type BreachRecord, OperatorSettingsService, type RecordBreachRequest } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { applyProblem } from '../../../core/forms/problem';

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
  templateUrl: './record-breach.dialog.html',
})
export class RecordBreachDialog {
  private readonly api = inject(OperatorSettingsService);

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
  protected readonly state = new FormDialogState<BreachErrors>(this.open, {
    noErrors: {},
    reset: () => {
      for (const c of [this.date, this.what, this.people, this.riskNotes]) c.reset();
      this.information.set([]);
      this.risk.set(null);
      this.decision.set(null);
    },
  });
  protected readonly saving = $localize`:@@recordBreach.busy:Saving the record`;
  protected readonly summary = computed(() => summaryFrom(this.state.errors(), CONTROL));
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@recordBreach.action:save the record`));

  protected toggle(value: BreachInformation, checked: boolean): void {
    this.information.update((all) => (checked ? [...all.filter((v) => v !== value), value] : all.filter((v) => v !== value)));
  }

  protected async save(): Promise<void> {
    if (this.state.busy()) return;
    const request: RecordBreachRequest = {
      date: this.date.value,
      what: this.what.value.trim(),
      information: INFORMATION.map((o) => o.value).filter((v) => this.information().includes(v)),
      people: this.people.value.trim(),
      risk: this.risk() as RecordBreachRequest['risk'],
      riskNotes: this.riskNotes.value.trim(),
      decision: this.decision() as RecordBreachRequest['decision'],
    };
    if (!this.state.validate(breachErrors(request, this.today))) return;
    await this.state.submit(
      async () => this.recorded.emit(await firstValueFrom(this.api.recordBreach(request))),
      (status, problem) =>
        applyProblem(this.state, status, problem, Object.keys(CONTROL) as BreachField[]),
    );
  }
}
