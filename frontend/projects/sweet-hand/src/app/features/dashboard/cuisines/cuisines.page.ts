import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BackLink, EMPTY_STATE, FormField, FormSummary, Fieldset, Icon, PrivateNote, SaveStatus, Select, type SelectOption, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { Autosave } from '../shared/autosave';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { ProfileData } from '../shared/profile-data';
import { areaName, areasCount, cardModel, cuisineName, cuisinesCount } from '../shared/profile-text';
import { fixHeading, notSavedText } from '../shared/section-text';
import { StatusNotice } from '../shared/status-notice';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { CatererProfileService, type OwnProfileView } from '@sweet-hand/api';
import type { Errors } from './errors';

const NONE: Errors = { cuisines: null, primaryCuisine: null, areas: null, primaryArea: null };

/** Cuisines and areas, /dashboard/profile/cuisines (docs/mocks/pages/profile-cuisines; L2-007, L2-010). */
@Component({
  selector: 'app-cuisines-page',
  imports: [RouterLink, BackLink, EMPTY_STATE, FormField, FormSummary, Fieldset, Icon, PrivateNote, SaveStatus, Select, DashboardLayout, ListingPreview, StatusNotice, WithdrawDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cuisines.page.html',
})
export class CuisinesPage {
  private readonly api = inject(CatererProfileService);
  protected readonly data = new ProfileData(this.api);
  protected readonly autosave = new Autosave(() => this.save(), () => this.data.published());

  protected readonly cuisines = signal<ReadonlySet<string>>(new Set());
  protected readonly primaryCuisine = signal<string | null>(null);
  protected readonly areas = signal<ReadonlySet<string>>(new Set());
  protected readonly primaryArea = signal<string | null>(null);
  protected readonly errors = signal<Errors>(NONE);
  protected readonly attempt = signal(0);
  protected readonly withdrawOpen = signal(false);

  private readonly refData = computed(() => this.data.ref() ?? { cuisines: [], regions: [], occasions: [] });
  protected readonly allCuisines = computed(() => this.refData().cuisines);
  protected readonly selectedCuisines = computed(() => this.allCuisines().filter((c) => this.cuisines().has(c.id)));
  protected readonly regions = computed(() =>
    this.refData().regions.map((r) => {
      const ticked = r.areas.filter((a) => this.areas().has(a.id)).length;
      return { ...r, ticked, all: ticked === r.areas.length, some: ticked > 0 && ticked < r.areas.length, countText: $localize`:@@cuisines.regionCount:${ticked}:ticked: of ${r.areas.length}:total: areas` };
    }),
  );
  protected readonly areaOptions = computed<SelectOption[]>(() =>
    this.refData()
      .regions.flatMap((r) => r.areas)
      .filter((a) => this.areas().has(a.id))
      .map((a) => ({ value: a.id, label: a.name })),
  );
  protected readonly subtitle = computed(() => `${cuisinesCount(this.cuisines().size)} · ${areasCount(this.areas().size)}`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    const firstCuisine = this.selectedCuisines()[0]?.id ?? this.allCuisines()[0]?.id;
    const firstArea = this.refData().regions[0]?.areas[0]?.id;
    return [
      e.cuisines && { controlId: `c-${firstCuisine}`, message: e.cuisines },
      e.primaryCuisine && { controlId: `pc-${this.selectedCuisines()[0]?.id}`, message: e.primaryCuisine },
      e.areas && { controlId: `a-${firstArea}`, message: e.areas },
      e.primaryArea && { controlId: 'primary-area', message: e.primaryArea },
    ].filter(Boolean) as SummaryItem[];
  });
  protected readonly summaryHeading = computed(() => fixHeading(this.summary().length));
  protected readonly statusText = computed(() => (this.autosave.state() === 'invalid' ? notSavedText(this.summary().length) : this.autosave.text()));
  protected readonly saveState = computed(() => {
    const s = this.autosave.state();
    return s === 'saving' ? 'saving' : s === 'saved' ? 'saved' : 'error';
  });
  /** The card follows what is ticked, as it would appear (ListingCardPreview). */
  protected readonly card = computed(() => {
    const p = this.data.profile();
    const r = this.data.ref();
    if (!p || !r) return null;
    const live: OwnProfileView = this.data.readOnly() ? p : { ...p, primaryCuisine: this.primaryCuisine(), primaryArea: this.primaryArea() };
    return cardModel(live, r);
  });

  /** Read-only rows: cuisines, then the primary area's region, then the other regions. */
  protected readonly readOnlyRows = computed(() => {
    const p = this.data.profile();
    const ref = this.data.ref();
    if (!p || !ref) return [];
    const rows: { term: string; primary: string | null; rest: string | null }[] = [];
    const others = p.cuisines.filter((id) => id !== p.primaryCuisine).map((id) => cuisineName(ref, id));
    rows.push({ term: $localize`:@@checklist.cuisines:Cuisines`, primary: cuisineName(ref, p.primaryCuisine), rest: others.length ? `, ${others.join(', ')}` : null });
    const primaryRegion = ref.regions.find((r) => r.areas.some((a) => a.id === p.primaryArea));
    const regions = primaryRegion ? [primaryRegion, ...ref.regions.filter((r) => r !== primaryRegion)] : ref.regions;
    for (const region of regions) {
      const names = region.areas.filter((a) => p.areas.includes(a.id) && a.id !== p.primaryArea).map((a) => a.name);
      if (region === primaryRegion) {
        rows.push({ term: region.name, primary: areaName(ref, p.primaryArea), rest: null });
        if (names.length) rows.push({ term: $localize`:@@cuisines.alsoIn:Also in ${region.name}:region:`, primary: null, rest: names.join(', ') });
      } else if (names.length) {
        rows.push({ term: region.name, primary: null, rest: names.join(', ') });
      }
    }
    return rows;
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    await this.data.load();
    const p = this.data.profile();
    if (p) this.reset(p);
  }

  private reset(p: OwnProfileView): void {
    this.cuisines.set(new Set(p.cuisines));
    this.primaryCuisine.set(p.primaryCuisine);
    this.areas.set(new Set(p.areas));
    this.primaryArea.set(p.primaryArea);
  }

  protected toggleCuisine(id: string, on: boolean): void {
    const next = new Set(this.cuisines());
    if (on) next.add(id);
    else next.delete(id);
    if (!on && this.primaryCuisine() === id) this.primaryCuisine.set(null);
    if (on && next.size === 1) this.primaryCuisine.set(id);
    this.cuisines.set(next);
    this.autosave.changed();
  }

  protected choosePrimaryCuisine(id: string): void {
    this.primaryCuisine.set(id);
    this.autosave.changed();
  }

  protected toggleArea(id: string, on: boolean): void {
    const next = new Set(this.areas());
    if (on) next.add(id);
    else next.delete(id);
    this.setAreas(next);
  }

  /** Ticking a whole region selects every area in it (L2-010.3); unticking a full region clears it. */
  protected toggleRegion(regionId: string): void {
    const region = this.regions().find((r) => r.id === regionId);
    if (!region) return;
    const next = new Set(this.areas());
    for (const a of region.areas) {
      if (region.all) next.delete(a.id);
      else next.add(a.id);
    }
    this.setAreas(next);
  }

  private setAreas(next: Set<string>): void {
    if (this.primaryArea() && !next.has(this.primaryArea()!)) this.primaryArea.set(null);
    if (!this.primaryArea() && next.size === 1) this.primaryArea.set([...next][0]);
    this.areas.set(next);
    this.autosave.changed();
  }

  protected choosePrimaryArea(id: string): void {
    this.primaryArea.set(id || null);
    this.autosave.changed();
  }

  private ordered(ids: ReadonlySet<string>, all: readonly { id: string }[]): string[] {
    return all.filter((x) => ids.has(x.id)).map((x) => x.id);
  }

  /** The L2-007 and L2-010 rules, then the save (set-up-profile, SetCuisines and SetServiceAreas). */
  private async save(): Promise<'saved' | 'invalid' | 'failed'> {
    const errors: Errors = { ...NONE };
    const n = this.cuisines().size;
    if (n < 1 || n > 5) errors.cuisines = $localize`:@@cuisines.count:Choose between 1 and 5 cuisines`;
    else if (!this.primaryCuisine()) errors.primaryCuisine = $localize`:@@cuisines.primary:Mark one cuisine as primary`;
    if (!this.areas().size) errors.areas = $localize`:@@cuisines.areas:Choose at least one area you serve`;
    else if (!this.primaryArea()) errors.primaryArea = $localize`:@@cuisines.primaryArea:Choose your primary area`;
    this.errors.set(errors);
    if (Object.values(errors).some(Boolean)) {
      this.attempt.update((x) => x + 1);
      return 'invalid';
    }
    const ref = this.refData();
    try {
      const profile = await firstValueFrom(
        this.api.saveSection({
          section: 'cuisines',
          values: {
            cuisines: this.ordered(this.cuisines(), ref.cuisines),
            primaryCuisine: this.primaryCuisine(),
            areas: this.ordered(this.areas(), ref.regions.flatMap((r) => r.areas)),
            primaryArea: this.primaryArea(),
          },
        }),
      );
      this.data.profile.set(profile);
      return 'saved';
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        const e = problem.errors;
        this.errors.set({ cuisines: e['cuisines']?.[0] ?? null, primaryCuisine: e['primaryCuisine']?.[0] ?? null, areas: e['areas']?.[0] ?? null, primaryArea: e['primaryArea']?.[0] ?? null });
        this.attempt.update((x) => x + 1);
        return 'invalid';
      }
      return 'failed';
    }
  }

  protected withdrawn(profile: OwnProfileView): void {
    this.data.profile.set(profile);
    this.reset(profile);
    this.withdrawOpen.set(false);
  }
}
