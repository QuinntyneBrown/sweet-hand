import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, DIETARY_TAGS, Dialog, Fieldset, FormField, FormSummary, TextField, Textarea, type DietaryTag, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { DIETARY_LABELS } from '../../discovery/caterer/dietary-labels';
import { CATERER_PROFILE_SERVICE, DietaryTag, DietaryTagId, OwnDishView, OwnProfileView } from '@sweet-hand/api';

type Errors = { name: string | null; description: string | null; price: string | null };
const NONE: Errors = { name: null, description: null, price: null };

/** Add a dish and Edit dish (docs/mocks/dialogs/dish; manage-menu, MenuItemDialog, L2-043). */
@Component({
  selector: 'app-dish-dialog',
  imports: [Alert, Dialog, Fieldset, FormField, FormSummary, TextField, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      size="form"
      [form]="true"
      [title]="dish() ? editTitle : addTitle"
      [description]="description()"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage()"
      (dismissed)="closed.emit()"
      (submitted)="save()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" [title]="failedTitle()"
          ><ng-container i18n="@@dish.failedText">Your entries are still here. Check your connection and try again.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryHeading()" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="dish-errors" />
      <sh-form-field label="Dish name" i18n-label="@@dish.name" controlId="dish-name" [error]="errors().name" [help]="errors().name ? null : nameHelp">
        <sh-text-field name="name" [maxlength]="80" [required]="true" [autofocus]="true" [readonly]="busy()" [value]="name()" (valueChange)="name.set($event)" />
      </sh-form-field>
      <sh-form-field
        label="Description"
        i18n-label="@@dish.description"
        optionalMarker="(optional)"
        i18n-optionalMarker="@@field.optional"
        controlId="dish-desc"
        [error]="errors().description"
        [counter]="counter()"
        [counterOver]="desc().trim().length > 300"
      >
        <sh-textarea name="description" [rows]="3" [readonly]="busy()" [value]="desc()" (valueChange)="desc.set($event)" />
      </sh-form-field>
      <sh-fieldset legend="Dietary tags" i18n-legend="@@dish.tags" optionalMarker="(optional)" i18n-optionalMarker="@@field.optional">
        <div class="option-grid">
          @for (tag of allTags; track tag) {
            <label class="choice"
              ><input type="checkbox" name="tags" [value]="tag" [checked]="tags().has(tag)" [disabled]="busy()" (change)="toggle(tag, $any($event.target).checked)" /><span class="choice__text"
                ><span>{{ tagLabels[tag] }}</span></span
              ></label
            >
          }
        </div>
      </sh-fieldset>
      <sh-form-field
        label="Price guidance"
        i18n-label="@@dish.price"
        optionalMarker="(optional)"
        i18n-optionalMarker="@@field.optional"
        controlId="dish-price"
        [error]="errors().price"
        [help]="errors().price ? null : priceHelp"
      >
        <sh-text-field name="price" [maxlength]="80" [readonly]="busy()" [value]="price()" (valueChange)="price.set($event)" />
      </sh-form-field>
      <button slot="footer" class="btn btn--primary" type="submit" [attr.aria-busy]="busy() ? 'true' : null" [attr.aria-disabled]="busy() ? 'true' : null">
        {{ submitLabel() }}
      </button>
    </sh-dialog>
  `,
})
export class DishDialog {
  private readonly api = inject(CATERER_PROFILE_SERVICE);

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
  protected readonly errors = signal<Errors>(NONE);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  protected readonly description = computed(() => {
    const d = this.dish();
    return d
      ? $localize`:@@dish.editDesc:${d.name}:name: · dish ${this.position()}:n: of ${this.total()}:total:`
      : $localize`:@@dish.addDesc:It goes to the end of your menu. You can move it after.`;
  });
  protected readonly counter = computed(() => $localize`:@@dish.counter:${this.desc().trim().length}:count: / 300`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
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
    if (this.failed()) return $localize`:@@common.tryAgain:Try again`;
    return this.dish() ? $localize`:@@common.saveChanges:Save changes` : $localize`:@@dish.add:Add dish`;
  });
  protected readonly busyMessage = computed(() => (this.dish() ? $localize`:@@dish.saving:Saving the dish` : $localize`:@@dish.adding:Adding the dish`));
  protected readonly failedTitle = computed(() => {
    const name = this.name().trim();
    return this.dish() ? $localize`:@@dish.failedSave:We couldn’t save “${name}:name:”` : $localize`:@@dish.failedAdd:We couldn’t add “${name}:name:”`;
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const d = this.dish();
      untracked(() => {
        this.name.set(d?.name ?? '');
        this.desc.set(d?.description ?? '');
        this.tags.set(new Set((d?.tags ?? []) as DietaryTag[]));
        this.price.set(d?.price ?? '');
        this.errors.set(NONE);
        this.failed.set(false);
        this.attempt.set(0);
      });
    });
  }

  protected toggle(tag: DietaryTag, on: boolean): void {
    const next = new Set(this.tags());
    if (on) next.add(tag);
    else next.delete(tag);
    this.tags.set(next);
  }

  /** Name 2–80, description up to 300, price guidance up to 60 (L2-043, L2-043.4). */
  protected async save(): Promise<void> {
    if (this.busy()) return;
    const name = this.name().trim();
    const description = this.desc().trim();
    const price = this.price().trim();
    const errors: Errors = {
      name: name.length < 2 || name.length > 80 ? $localize`:@@dish.nameError:Dish names are 2–80 characters` : null,
      description: description.length > 300 ? $localize`:@@dish.descriptionError:Keep the description to 300 characters` : null,
      price: price.length > 60 ? $localize`:@@dish.priceLong:Keep price guidance to 60 characters (this is ${price.length}:count:)` : null,
    };
    this.errors.set(errors);
    this.failed.set(false);
    if (errors.name || errors.description || errors.price) {
      this.attempt.update((n) => n + 1);
      return;
    }
    const request = { name, description, price, tags: DIETARY_TAGS.filter((t) => this.tags().has(t)) as DietaryTagId[] };
    const d = this.dish();
    this.busy.set(true);
    try {
      const profile = await firstValueFrom(d ? this.api.updateDish(d.id, request) : this.api.addDish(request));
      this.saved.emit(profile);
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        this.errors.set({ name: problem.errors['name']?.[0] ?? null, description: problem.errors['description']?.[0] ?? null, price: problem.errors['price']?.[0] ?? null });
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
