import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink, type Params } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button, Combobox, Dialog, FormField, type AreaOption } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { toQueryParams, withArea, withRegion } from '../listing/listing-query';
import { interpretSearch, matchCountText } from './area-search';
import { DISCOVERY_SERVICE, ListingQuery } from '@sweet-hand/api';

const REGIONS = [
  { id: 'city-of-toronto', name: 'City of Toronto' },
  { id: 'peel', name: 'Peel' },
  { id: 'york-region', name: 'York Region' },
  { id: 'durham', name: 'Durham' },
  { id: 'halton', name: 'Halton' },
];

/** "Where’s your event?": search by area or postal code (docs/mocks/dialogs/search). */
@Component({
  selector: 'app-search-dialog',
  imports: [Dialog, Combobox, FormField, Button, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      title="Where’s your event?"
      i18n-title="@@search.title"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [form]="true"
      formRole="search"
      describedByIds="q-help"
      [busy]="busy()"
      [busyMessage]="busyMessage()"
      [returnFocus]="returnFocus()"
      (dismissed)="close()"
      (submitted)="submit()"
    >
      <sh-form-field label="Area or postal code" i18n-label="@@search.label" [labelHidden]="true" controlId="q" help="An area like Scarborough, or a postal code like M1B 2K3." i18n-help="@@search.help" [error]="error()" [warning]="warning()">
        <sh-combobox
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
          [autofocus]="true"
          (areaChosen)="goToArea($event.value)"
        />
      </sh-form-field>
      @if (!text().trim() || error() || warning() || busy()) {
        <div class="filter-group" role="group" aria-labelledby="q-regions">
          <h3 class="filter-group__title" id="q-regions" i18n="@@search.regions">Or choose a whole region</h3>
          <ul class="filter-list">
            @for (r of regions; track r.id) {
              <li><a class="filter-list__item" routerLink="/caterers" [queryParams]="regionParams(r.id)" (click)="closed.emit()">{{ r.name }}</a></li>
            }
          </ul>
        </div>
      }
      <sh-button slot="footer" type="submit" variant="primary" [busy]="busy()"><ng-container i18n="@@search.submit">Show caterers</ng-container></sh-button>
    </sh-dialog>
  `,
})
export class SearchDialog {
  readonly open = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);
  /** The listing's filters when opened from the listing: the area is added to them; from the header it replaces them. */
  readonly current = input<ListingQuery | null>(null);
  readonly closed = output<void>();

  private readonly api = inject(DISCOVERY_SERVICE);
  private readonly router = inject(Router);

  protected readonly regions = REGIONS;
  protected readonly matchCountText = matchCountText;
  protected readonly text = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly warning = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly busyMessage = computed(() => $localize`:@@search.busy:Finding caterers near ${this.text().trim().toUpperCase()}:postal:`);

  private readonly areas = rxResource({ params: () => this.open() || undefined, stream: () => this.api.serviceAreas() });
  private readonly list = computed(() => (this.areas.hasValue() ? this.areas.value() : []));
  protected readonly options = computed<AreaOption[]>(() => this.list().map((a) => ({ value: a.id, label: a.name, region: a.regionName })));

  protected close(): void {
    this.reset();
    this.closed.emit();
  }

  protected async goToArea(id: string): Promise<void> {
    this.reset();
    this.closed.emit();
    const current = this.current();
    await this.router.navigate(['/caterers'], { queryParams: current ? toQueryParams(withArea(current, id, true)) : { area: id } });
  }

  protected regionParams(id: string): Params {
    const current = this.current();
    return current ? toQueryParams(withRegion(current, id, true)) : { region: id };
  }

  protected async submit(): Promise<void> {
    this.error.set(null);
    this.warning.set(null);
    // A search sent before the area list has arrived waits for it rather than finding nothing.
    const areas = this.areas.hasValue() ? this.list() : await firstValueFrom(this.api.serviceAreas()).catch(() => []);
    const outcome = interpretSearch(this.text(), areas);
    switch (outcome.kind) {
      case 'area':
        return this.goToArea(outcome.area.id);
      case 'invalid-postal':
        this.error.set($localize`:@@search.invalidPostal:Enter a valid postal code, like M5V 2T6`);
        return;
      case 'no-match':
      case 'empty':
        return;
      case 'postal': {
        this.busy.set(true);
        try {
          const area = await firstValueFrom(this.api.resolveFsa(outcome.fsa));
          this.busy.set(false);
          return this.goToArea(area.id);
        } catch (e) {
          this.busy.set(false);
          if (problemOf(e).status === 404) this.warning.set($localize`:@@search.outOfArea:Sweet Hand currently serves Toronto and the GTA`);
        }
      }
    }
  }

  private reset(): void {
    this.text.set('');
    this.error.set(null);
    this.warning.set(null);
    this.busy.set(false);
  }
}
