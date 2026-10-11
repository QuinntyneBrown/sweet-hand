import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, Icon } from '@sweet-hand/components';
import { type CuisineUsage, type OperatorCuisine, OperatorSettingsService } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

/** Retire cuisine (docs/mocks/dialogs/retire-cuisine; RetireCuisineDialog, L2-007.5). */
@Component({
  selector: 'app-retire-cuisine-dialog',
  imports: [Alert, Button, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './retire-cuisine.dialog.html',
})
export class RetireCuisineDialog {
  private readonly api = inject(OperatorSettingsService);

  readonly open = input(false);
  readonly cuisine = input.required<OperatorCuisine>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly retired = output<CuisineUsage>();

  protected readonly usage = signal<CuisineUsage | null>(null);
  protected readonly usageFailed = signal(false);
  protected readonly state = new FormDialogState(this.open, {
    noErrors: null,
    from: () => this.cuisine().id,
    reset: (id) => {
      this.usage.set(null);
      this.usageFailed.set(false);
      firstValueFrom(this.api.cuisineUsage(id)).then(
        (u) => this.usage.set(u),
        () => this.usageFailed.set(true),
      );
    },
  });
  protected readonly title = computed(() => $localize`:@@retireCuisine.title:Retire ${this.cuisine().name}:name:?`);
  protected readonly retiring = computed(() => $localize`:@@retireCuisine.busy:Retiring ${this.cuisine().name}:name:`);
  protected readonly failedTitle = computed(() => $localize`:@@retireCuisine.failedTitle:We couldn’t retire ${this.cuisine().name}:name:`);
  protected readonly peopleLabel = computed(() => $localize`:@@retireCuisine.people:Caterers using ${this.cuisine().name}:name:`);
  protected readonly unusedText = computed(() => $localize`:@@retireCuisine.unused:No published caterers use ${this.cuisine().name}:name:.`);
  protected readonly warningTitle = computed(() => {
    const n = this.usage()?.caterers.length ?? 0;
    const name = this.cuisine().name;
    return n === 1
      ? $localize`:@@retireCuisine.warningOne:1 published caterer uses ${name}:name:`
      : $localize`:@@retireCuisine.warning:${n}:count: published caterers use ${name}:name:`;
  });

  protected async retire(): Promise<void> {
    if (this.state.busy()) return;
    await this.state.submit(async () => {
      this.retired.emit(await firstValueFrom(this.api.retireCuisine(this.cuisine().id)));
    });
  }
}
