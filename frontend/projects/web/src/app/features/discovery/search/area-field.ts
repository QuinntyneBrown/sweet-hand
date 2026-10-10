import { ChangeDetectionStrategy, Component, computed, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Combobox, FIELD_CONTEXT, type AreaOption, type FieldContext } from '@sweet-hand/components';
import { DiscoveryApi } from '../../../core/api/discovery-api';
import type { ServiceArea } from '../../../core/api/discovery.models';
import { problemOf } from '../../../core/forms/problem';
import { interpretSearch, matchCountText } from './area-search';

let nextId = 0;

/**
 * "Area or postal code" inside a filter group: the listing column, the Area
 * dropdown and the Filters sheet (docs/mocks/pages/caterers, postal-invalid and
 * out-of-area). Emits the chosen area; the host decides what choosing means.
 * Only the forward sortation area of a postal code is sent (L2-012.6).
 */
@Component({
  selector: 'app-area-field',
  imports: [Combobox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: FIELD_CONTEXT, useExisting: forwardRef(() => AreaField) }],
  host: { style: 'display: contents' },
  template: `
    <form role="search" novalidate (submit)="submit($event)">
      <div class="field">
        <label class="visually-hidden" [for]="id()" i18n="@@search.label">Area or postal code</label>
        <sh-combobox
          suggestions="inline"
          [areas]="options()"
          [(value)]="text"
          placeholder="Area or postal code"
          i18n-placeholder="@@search.label"
          listLabel="Matching areas"
          i18n-listLabel="@@search.listLabel"
          noMatchText="No matching areas"
          i18n-noMatchText="@@search.noMatch"
          [matchCountText]="matchCountText"
          [readonly]="busy()"
          [disabled]="disabled()"
          [autofocus]="autofocus()"
          [errorAnnouncement]="error()"
          (areaChosen)="choose($event.value)"
        />
        @if (error()) {
          <span class="field__error" [id]="id() + '-error'">{{ error() }}</span>
        } @else if (warning()) {
          <span class="field__warning" [id]="id() + '-warning'">{{ warning() }}</span>
        }
        <span class="field__help visually-hidden" [id]="id() + '-help'" i18n="@@search.columnHelp">Type an area like Scarborough or a postal code like M1B 2K3.</span>
        <span class="visually-hidden" role="status">{{ warning() ?? '' }}</span>
      </div>
    </form>
  `,
})
export class AreaField implements FieldContext {
  readonly areas = input.required<readonly ServiceArea[]>();
  readonly disabled = input(false);
  readonly autofocus = input(false);
  readonly areaChosen = output<string>();

  private readonly api = inject(DiscoveryApi);
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

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.busy()) return;
    this.error.set(null);
    this.warning.set(null);
    const outcome = interpretSearch(this.text(), this.areas());
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
