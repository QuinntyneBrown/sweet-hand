import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, TextField, type SummaryItem } from '@sweet-hand/components';
import { summaryHeading } from '../../../core/forms/validation';
import { cuisineNameError } from './cuisines-view';
import { type OperatorCuisine, OperatorSettingsService } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

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
  protected readonly state = new FormDialogState<string | null>(this.open, { noErrors: null, reset: () => this.name.reset() });
  /** The name that failed to save, for "We couldn’t add Caymanian". */
  protected readonly failedName = signal('');
  protected readonly adding = $localize`:@@addCuisine.busy:Adding the cuisine`;
  protected readonly failedTitle = computed(() => $localize`:@@addCuisine.failedTitle:We couldn’t add ${this.failedName()}:name:`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    return e ? [{ controlId: 'cuisine-name', message: e }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@addCuisine.action:add the cuisine`));

  protected async add(): Promise<void> {
    if (this.state.busy()) return;
    const name = this.name.value.replace(/\s+/g, ' ').trim();
    if (!this.state.validate(cuisineNameError(name, this.existing()))) return;
    this.failedName.set(name);
    await this.state.submit(
      async () => this.added.emit(await firstValueFrom(this.api.addCuisine({ name }))),
      (status, problem) => {
        const message = status === 400 ? problem.errors?.['name']?.[0] : undefined;
        return !!message && this.state.reject(message);
      },
    );
  }
}
