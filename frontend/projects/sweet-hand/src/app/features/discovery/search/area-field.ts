import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { Combobox, FIELD_CONTEXT, type AreaOption, type FieldContext } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { interpretSearch, matchCountText } from './area-search';
import { DiscoveryService, type ServiceArea } from '@sweet-hand/api';

let nextId = 0;

/**
 * "Area or postal code" inside a filter group: the listing column, the Area
 * dropdown and the Filters sheet (docs/mocks/pages/caterers, postal-invalid and
 * out-of-area). Emits the chosen area; the host decides what choosing means.
 * Only the forward sortation area of a postal code is sent (L2-012.6).
 */
@Component({
  selector: 'app-area-field',
  imports: [Combobox, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FIELD_CONTEXT, useExisting: forwardRef(() => AreaField) }],
  host: { style: 'display: contents' },
  templateUrl: './area-field.html',
})
export class AreaField implements FieldContext {
  readonly areas = input.required<readonly ServiceArea[]>();
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly autofocus = input(false);
  /** False when the field sits inside another form, which must not get a nested one. */
  readonly ownForm = input(true);
  readonly areaChosen = output<string>();

  private readonly api = inject(DiscoveryService);
  private readonly combobox = viewChild.required(Combobox);

  readonly id = signal(`area-q-${++nextId}`).asReadonly();
  protected readonly text = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly warning = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly matchCountText = matchCountText;
  protected readonly options = computed<AreaOption[]>(() => this.areas().map((a) => ({ value: a.id, label: a.name, region: a.regionName })));

  readonly invalid = computed(() => !!this.error());
  readonly describedBy = computed(() => {
    const message = this.error() ? `${this.id()}-error` : this.warning() ? `${this.id()}-warning` : null;
    return [message, `${this.id()}-help`].filter(Boolean).join(' ');
  });

  focus(): void {
    this.combobox().focus();
  }

  protected choose(id: string): void {
    this.reset();
    this.areaChosen.emit(id);
  }

  protected onEnter(event: Event): void {
    if (event.defaultPrevented) return;
    void this.submit(event);
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy() || this.readonly()) return;
    this.error.set(null);
    this.warning.set(null);
    // A search sent before the area list has arrived waits for it rather than finding nothing.
    const areas = this.areas().length ? this.areas() : await firstValueFrom(this.api.serviceAreas()).catch(() => []);
    const outcome = interpretSearch(this.text(), areas);
    switch (outcome.kind) {
      case 'area':
        return this.choose(outcome.area.id);
      case 'invalid-postal':
        this.error.set($localize`:@@search.invalidPostal:Enter a valid postal code, like M5V 2T6`);
        return;
      case 'postal': {
        this.busy.set(true);
        try {
          const area = await firstValueFrom(this.api.resolveFsa(outcome.fsa));
          this.busy.set(false);
          this.choose(area.id);
        } catch (e) {
          this.busy.set(false);
          if (problemOf(e).status === 404) this.warning.set($localize`:@@search.outOfArea:Sweet Hand currently serves Toronto and the GTA`);
        }
        return;
      }
      default:
        return;
    }
  }

  private reset(): void {
    this.text.set('');
    this.error.set(null);
    this.warning.set(null);
    this.combobox().close();
  }
}
