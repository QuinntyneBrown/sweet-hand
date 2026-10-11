import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, Icon } from '@sweet-hand/components';
import { type CuisineUsage, type OperatorCuisine, OperatorSettingsService } from '@sweet-hand/api';

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
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
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

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const id = this.cuisine().id;
      untracked(() => {
        this.usage.set(null);
        this.usageFailed.set(false);
        this.failed.set(false);
        firstValueFrom(this.api.cuisineUsage(id)).then(
          (u) => this.usage.set(u),
          () => this.usageFailed.set(true),
        );
      });
    });
  }

  protected async retire(): Promise<void> {
    if (this.busy()) return;
    this.failed.set(false);
    this.busy.set(true);
    try {
      this.retired.emit(await firstValueFrom(this.api.retireCuisine(this.cuisine().id)));
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
