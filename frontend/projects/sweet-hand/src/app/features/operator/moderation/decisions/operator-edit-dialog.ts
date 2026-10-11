import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Select, TextField, Textarea, graphemeLength, type SelectOption, type SummaryItem } from '@sweet-hand/components';
import { count } from '../../../../core/format/format';
import { problemOf } from '../../../../core/forms/problem';
import { summaryHeading } from '../../../../core/forms/validation';
import { firstName } from '../moderation-text';
import { reasonError } from './decision-text';
import { type CatererRecordView, type EditableField, type OperatorEditRequest, OperatorModerationService } from '@sweet-hand/api';
import type { EditField } from './edit-field';
import type { EditOutcome } from './edit-outcome';

const DESCRIPTION_MAX = 2000;

/**
 * "Edit Pelau House": one field, photo or menu item at a time, always with a
 * reason the caterer is emailed (edit-profile-as-operator design; docs/mocks/dialogs/operator-edit).
 */
@Component({
  selector: 'app-operator-edit-dialog',
  imports: [Alert, Dialog, FormField, FormSummary, Select, TextField, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './operator-edit-dialog.html',
})
export class OperatorEditDialog {
  private readonly api = inject(OperatorModerationService);

  readonly open = input(false);
  readonly record = input.required<CatererRecordView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly dismissed = output<void>();
  readonly done = output<EditOutcome>();

  protected readonly fields: SelectOption[] = [
    { value: 'name', label: $localize`:@@edit.name:Business name` },
    { value: 'description', label: $localize`:@@edit.description:Description` },
    { value: 'cuisines', label: $localize`:@@record.cuisines:Cuisines` },
    { value: 'areas', label: $localize`:@@record.areas:Areas` },
    { value: 'guests', label: $localize`:@@edit.guests:Guest range` },
    { value: 'occasions', label: $localize`:@@caterer.occasions:Occasions` },
    { value: 'photo', label: $localize`:@@edit.aPhoto:A photo` },
    { value: 'dish', label: $localize`:@@edit.aDish:A menu item` },
  ];

  protected readonly field = signal<EditField>('description');
  protected readonly text = signal('');
  protected readonly min = signal('');
  protected readonly max = signal('');
  protected readonly item = signal('');
  protected readonly reason = signal('');
  protected readonly errors = signal<Record<string, string>>({});
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  protected readonly title = computed(() => $localize`:@@edit.title:Edit ${this.record().name}:name:`);
  protected readonly description = computed(() => $localize`:@@edit.descriptionLine:Live within a minute. ${firstName(this.record().owner.name)}:name: is emailed your reason.`);
  protected readonly reasonLabel = computed(() => $localize`:@@decision.reasonFor:Reason (sent to ${firstName(this.record().owner.name)}:name:)`);
  protected readonly over = computed(() => graphemeLength(this.text()) > DESCRIPTION_MAX);
  protected readonly counter = computed(() => `${count(graphemeLength(this.text()))} / ${count(DESCRIPTION_MAX)}`);
  protected readonly photoOptions = computed<SelectOption[]>(() =>
    this.record().profile.photos.map((p, i) => ({ value: p.id, label: $localize`:@@edit.photoOption:Photo ${i + 1}:n:: ${p.alt}:caption:` })),
  );
  protected readonly dishOptions = computed<SelectOption[]>(() => this.record().profile.dishes.map((d) => ({ value: d.id, label: d.name })));
  protected readonly listLabel = computed(() => this.fields.find((f) => f.value === this.field())?.label ?? '');
  protected readonly submitLabel = computed(() =>
    this.field() === 'photo'
      ? $localize`:@@edit.removePhoto:Remove photo`
      : this.field() === 'dish'
        ? $localize`:@@edit.removeDish:Remove dish`
        : $localize`:@@edit.save:Save change`,
  );
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return (['value', 'min', 'max', 'reason'] as const).filter((k) => e[k]).map((k) => ({ controlId: k, message: e[k] }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@edit.action:save the change`));

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.reason.set('');
        this.failed.set(false);
        this.attempt.set(0);
        this.choose('description');
      });
    });
  }

  /** A new field starts from the profile's current value. */
  protected choose(field: EditField): void {
    const p = this.record().profile;
    this.field.set(field);
    this.errors.set({});
    this.text.set(
      field === 'name'
        ? this.record().name
        : field === 'description'
          ? p.description
          : field === 'cuisines'
            ? p.cuisines.join(', ')
            : field === 'areas'
              ? p.areas.join(', ')
              : field === 'occasions'
                ? p.occasions.join(', ')
                : '',
    );
    this.min.set(String(p.minGuests));
    this.max.set(String(p.maxGuests));
    this.item.set(field === 'photo' ? (p.photos[0]?.id ?? '') : field === 'dish' ? (p.dishes[0]?.id ?? '') : '');
  }

  private validate(): Record<string, string> {
    const e: Record<string, string> = {};
    const f = this.field();
    const text = this.text().trim();
    if (f === 'name' && !text) e['value'] = $localize`:@@edit.nameRequired:Enter the business name`;
    if (f === 'description' && (graphemeLength(text) < 50 || graphemeLength(text) > DESCRIPTION_MAX)) e['value'] = $localize`:@@edit.descriptionLength:Write 50 to 2,000 characters`;
    if ((f === 'cuisines' || f === 'areas' || f === 'occasions') && !text) e['value'] = $localize`:@@edit.listRequired:Choose at least one`;
    if (f === 'guests') {
      const min = Number(this.min());
      const max = Number(this.max());
      if (!Number.isInteger(min) || min < 1) e['min'] = $localize`:@@edit.minWhole:Enter the fewest guests as a whole number`;
      else if (!Number.isInteger(max) || max < min) e['max'] = $localize`:@@edit.maxAtLeast:Make the most guests at least the fewest`;
    }
    if ((f === 'photo' || f === 'dish') && !this.item()) e['value'] = $localize`:@@edit.chooseItem:Choose which one to remove`;
    const r = reasonError(this.reason());
    if (r) e['reason'] = r;
    return e;
  }

  private request(): OperatorEditRequest {
    const f = this.field() as EditableField;
    const value =
      f === 'guests'
        ? { min: Number(this.min()), max: Number(this.max()) }
        : f === 'cuisines' || f === 'areas' || f === 'occasions'
          ? this.text()
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean)
          : this.text().trim();
    return { field: f, value, reason: this.reason().trim() };
  }

  protected async save(): Promise<void> {
    if (this.busy()) return;
    const errors = this.validate();
    this.errors.set(errors);
    this.failed.set(false);
    if (Object.keys(errors).length) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    const f = this.field();
    try {
      if (f === 'photo' || f === 'dish') {
        const result = await firstValueFrom(this.api.removeItem(this.record().id, { kind: f, id: this.item() }, this.reason().trim()));
        this.done.emit({ kind: f, replaceBy: result.replaceBy });
      } else {
        await firstValueFrom(this.api.edit(this.record().id, this.request()));
        this.done.emit({ kind: 'edit' });
      }
    } catch (e) {
      const { status, problem } = problemOf(e);
      if (status === 400 && problem.errors) {
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(problem.errors)) mapped[k === 'field' ? 'value' : k] = v[0];
        this.errors.set(mapped);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
