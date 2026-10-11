import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink, type Params } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button, Combobox, Dialog, FormField, type AreaOption } from '@sweet-hand/components';
import { toQueryParams, withArea, withRegion } from '../listing/listing-query';
import { interpretSearch, matchCountText } from './area-search';
import { DiscoveryService, type ListingQuery } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

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
  templateUrl: './search-dialog.html',
})
export class SearchDialog {
  readonly open = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);
  /** The listing's filters when opened from the listing: the area is added to them; from the header it replaces them. */
  readonly current = input<ListingQuery | null>(null);
  readonly closed = output<void>();

  private readonly api = inject(DiscoveryService);
  private readonly router = inject(Router);

  protected readonly regions = REGIONS;
  protected readonly matchCountText = matchCountText;
  protected readonly text = signal('');
  protected readonly warning = signal<string | null>(null);
  protected readonly state = new FormDialogState<string | null>(this.open, {
    noErrors: null,
    reset: () => {
      this.text.set('');
      this.warning.set(null);
      this.state.busy.set(false);
    },
  });
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
    this.state.errors.set(null);
    this.warning.set(null);
    // A search sent before the area list has arrived waits for it rather than finding nothing.
    const areas = this.areas.hasValue() ? this.list() : await firstValueFrom(this.api.serviceAreas()).catch(() => []);
    const outcome = interpretSearch(this.text(), areas);
    switch (outcome.kind) {
      case 'area':
        return this.goToArea(outcome.area.id);
      case 'invalid-postal':
        this.state.errors.set($localize`:@@search.invalidPostal:Enter a valid postal code, like M5V 2T6`);
        return;
      case 'no-match':
      case 'empty':
        return;
      case 'postal': {
        let id: string | undefined;
        await this.state.submit(
          async () => (id = (await firstValueFrom(this.api.resolveFsa(outcome.fsa))).id),
          (status) => {
            if (status === 404) this.warning.set($localize`:@@search.outOfArea:Sweet Hand currently serves Toronto and the GTA`);
            return true;
          },
        );
        if (id) return this.goToArea(id);
      }
    }
  }

  private reset(): void {
    this.state.open();
  }
}
