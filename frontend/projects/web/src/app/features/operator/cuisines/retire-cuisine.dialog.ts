import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, Icon } from '@sweet-hand/components';
import { OperatorSettingsApi } from '../../../core/api/operator-settings-api';
import type { CuisineUsage, OperatorCuisine } from '../../../core/api/operator-settings.models';

/** Retire cuisine (docs/mocks/dialogs/retire-cuisine; RetireCuisineDialog, L2-007.5). */
@Component({
  selector: 'app-retire-cuisine-dialog',
  imports: [Alert, Button, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      tone="danger"
      [title]="title()"
      description="It leaves the listing filter and the choices on new and edited profiles."
      i18n-description="@@retireCuisine.description"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      initialFocus="cancel"
      [busy]="busy()"
      [busyMessage]="retiring()"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
    >
      <svg slot="icon" shIcon="warning"></svg>
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" [title]="failedTitle()"
          ><ng-container i18n="@@retireCuisine.failedText">It’s still active everywhere. Try again in a moment.</ng-container></sh-alert
        >
      }
      @if (usage(); as u) {
        @if (u.caterers.length) {
          <sh-alert tone="warning" [title]="warningTitle()"
            ><ng-container i18n="@@retireCuisine.warningText">They keep it on their pages. It just won’t be offered to anyone new.</ng-container></sh-alert
          >
          <ul class="dialog-people" [attr.aria-label]="peopleLabel()">
            @for (c of u.caterers; track c.slug) {
              <li><span class="photo"><img [src]="c.photo" alt="" width="80" height="80" /></span>{{ c.name }}</li>
            }
          </ul>
        } @else {
          <p>{{ unusedText() }}</p>
        }
      } @else if (usageFailed()) {
        <p i18n="@@retireCuisine.usageFailed">We couldn’t check which caterers use it. Caterers who use it keep it on their pages.</p>
      } @else {
        <p><span class="skeleton skeleton--text" aria-hidden="true"></span></p>
      }
      <sh-button slot="footer" variant="danger" [busy]="busy()" (activated)="retire()"><ng-container i18n="@@retireCuisine.submit">Retire cuisine</ng-container></sh-button>
    </sh-dialog>
  `,
})
export class RetireCuisineDialog {
  private readonly api = inject(OperatorSettingsApi);

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
