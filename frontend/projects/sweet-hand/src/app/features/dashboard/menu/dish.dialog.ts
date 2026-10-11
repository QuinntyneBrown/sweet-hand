import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, DIETARY_TAGS, Dialog, Fieldset, FormField, FormSummary, TextField, Textarea, type DietaryTag, type SummaryItem } from '@sweet-hand/components';
import { DIETARY_LABELS } from '../../discovery/caterer/dietary-labels';
import { CatererProfileService, type DietaryTagId, type OwnDishView, type OwnProfileView } from '@sweet-hand/api';
import type { Errors } from './errors';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

const NONE: Errors = { name: null, description: null, price: null };

/** Add a dish and Edit dish (docs/mocks/dialogs/dish; manage-menu, MenuItemDialog, L2-043). */
@Component({
  selector: 'app-dish-dialog',
  imports: [Alert, Dialog, Fieldset, FormField, FormSummary, TextField, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dish.dialog.html',
})
export class DishDialog {
  private readonly api = inject(CatererProfileService);

  readonly open = input(false);
  /** The dish being edited, or null to add one. */
  readonly dish = input<OwnDishView | null>(null);
  readonly position = input(0);
  readonly total = input(0);

  readonly closed = output<void>();
  readonly saved = output<OwnProfileView>();

  protected readonly allTags = DIETARY_TAGS;
  protected readonly tagLabels: Record<DietaryTag, string> = DIETARY_LABELS;
  protected readonly addTitle = $localize`:@@dish.addTitle:Add a dish`;
  protected readonly editTitle = $localize`:@@dish.editTitle:Edit dish`;
  protected readonly nameHelp = $localize`:@@dish.nameHelp:As your customers call it, like “Pepperpot” or “Buss up shut”`;
  protected readonly priceHelp = $localize`:@@dish.priceHelp:Up to 60 characters, like “From $18 per person”`;

  protected readonly name = signal('');
  protected readonly desc = signal('');
  protected readonly tags = signal<ReadonlySet<DietaryTag>>(new Set());
  protected readonly price = signal('');
  protected readonly state = new FormDialogState<Errors, OwnDishView | null>(this.open, {
    noErrors: NONE,
    from: this.dish,
    reset: (d) => {
      this.name.set(d?.name ?? '');
      this.desc.set(d?.description ?? '');
      this.tags.set(new Set((d?.tags ?? []) as DietaryTag[]));
      this.price.set(d?.price ?? '');
    },
  });

  protected readonly description = computed(() => {
    const d = this.dish();
    return d
      ? $localize`:@@dish.editDesc:${d.name}:name: · dish ${this.position()}:n: of ${this.total()}:total:`
      : $localize`:@@dish.addDesc:It goes to the end of your menu. You can move it after.`;
  });
  protected readonly counter = computed(() => $localize`:@@dish.counter:${this.desc().trim().length}:count: / 300`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    const priceSummary = $localize`:@@dish.priceError:Keep price guidance to 60 characters`;
    return [
      e.name && { controlId: 'dish-name', message: e.name },
      e.description && { controlId: 'dish-desc', message: e.description },
      e.price && { controlId: 'dish-price', message: priceSummary },
    ].filter(Boolean) as SummaryItem[];
  });
  protected readonly summaryHeading = computed(() => {
    const n = this.summary().length;
    if (this.dish()) return n === 1 ? $localize`:@@dish.fixOneSave:Fix 1 thing to save this dish` : $localize`:@@dish.fixManySave:Fix ${n}:count: things to save this dish`;
    return n === 1 ? $localize`:@@dish.fixOneAdd:Fix 1 thing to add this dish` : $localize`:@@dish.fixManyAdd:Fix ${n}:count: things to add this dish`;
  });
  protected readonly submitLabel = computed(() => {
    if (this.state.failed()) return $localize`:@@common.tryAgain:Try again`;
    return this.dish() ? $localize`:@@common.saveChanges:Save changes` : $localize`:@@dish.add:Add dish`;
  });
  protected readonly busyMessage = computed(() => (this.dish() ? $localize`:@@dish.saving:Saving the dish` : $localize`:@@dish.adding:Adding the dish`));
  protected readonly failedTitle = computed(() => {
    const name = this.name().trim();
    return this.dish() ? $localize`:@@dish.failedSave:We couldn’t save “${name}:name:”` : $localize`:@@dish.failedAdd:We couldn’t add “${name}:name:”`;
  });

  protected toggle(tag: DietaryTag, on: boolean): void {
    const next = new Set(this.tags());
    if (on) next.add(tag);
    else next.delete(tag);
    this.tags.set(next);
  }

  /** Name 2–80, description up to 300, price guidance up to 60 (L2-043, L2-043.4). */
  protected async save(): Promise<void> {
    if (this.state.busy()) return;
    const name = this.name().trim();
    const description = this.desc().trim();
    const price = this.price().trim();
    const errors: Errors = {
      name: name.length < 2 || name.length > 80 ? $localize`:@@dish.nameError:Dish names are 2–80 characters` : null,
      description: description.length > 300 ? $localize`:@@dish.descriptionError:Keep the description to 300 characters` : null,
      price: price.length > 60 ? $localize`:@@dish.priceLong:Keep price guidance to 60 characters (this is ${price.length}:count:)` : null,
    };
    if (!this.state.validate(errors)) return;
    const request = { name, description, price, tags: DIETARY_TAGS.filter((t) => this.tags().has(t)) as DietaryTagId[] };
    const d = this.dish();
    await this.state.submit(
      async () => this.saved.emit(await firstValueFrom(d ? this.api.updateDish(d.id, request) : this.api.addDish(request))),
      (status, problem) =>
        status === 400 &&
        !!problem.errors &&
        this.state.reject({ name: problem.errors['name']?.[0] ?? null, description: problem.errors['description']?.[0] ?? null, price: problem.errors['price']?.[0] ?? null }),
    );
  }
}
