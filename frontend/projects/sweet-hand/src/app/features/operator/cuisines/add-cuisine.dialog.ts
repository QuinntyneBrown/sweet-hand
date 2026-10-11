import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { cuisineNameError } from './cuisines-view';
import { type OperatorCuisine, OperatorSettingsService } from '@sweet-hand/api';

/** Add cuisine (docs/mocks/dialogs/add-cuisine; AddCuisineDialog, L2-007.4). */
@Component({
  selector: 'app-add-cuisine-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Dialog, FormField, FormSummary, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-cuisine.dialog.html',
})
export class AddCuisineDialog {
  private readonly api = inject(OperatorSettingsService);

  readonly open = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);
  /** The cuisines already on the list, to catch a duplicate before sending. */
  readonly existing = input<readonly string[]>([]);

  readonly closed = output<void>();
  readonly added = output<OperatorCuisine>();

  protected readonly name = new FormControl('', { nonNullable: true });
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  /** The name that failed to save, for "We couldn’t add Caymanian". */
  protected readonly failedName = signal<string | null>(null);
  protected readonly adding = $localize`:@@addCuisine.busy:Adding the cuisine`;
  protected readonly failedTitle = computed(() => $localize`:@@addCuisine.failedTitle:We couldn’t add ${this.failedName() ?? ''}:name:`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: 'cuisine-name', message: e }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@addCuisine.action:add the cuisine`));

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          this.name.reset();
          this.error.set(null);
          this.failedName.set(null);
          this.attempt.set(0);
        });
    });
  }

  protected async add(): Promise<void> {
    if (this.busy()) return;
    const name = this.name.value.replace(/\s+/g, ' ').trim();
    this.failedName.set(null);
    const error = cuisineNameError(name, this.existing());
    this.error.set(error);
    if (error) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      this.added.emit(await firstValueFrom(this.api.addCuisine({ name })));
    } catch (e) {
      const { status, problem } = problemOf(e);
      const message = status === 400 ? problem.errors?.['name']?.[0] : undefined;
      if (message) {
        this.error.set(message);
        this.attempt.update((n) => n + 1);
      } else {
        this.failedName.set(name);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
