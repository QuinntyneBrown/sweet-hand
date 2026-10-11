import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BackLink, EMPTY_STATE, FormField, FormRow, FormSummary, Fieldset, Icon, PrivateNote, SaveStatus, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { Autosave } from '../shared/autosave';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { ProfileData } from '../shared/profile-data';
import { guestRange, guestSpan, occasionsCount } from '../shared/profile-text';
import { fixHeading, notSavedText } from '../shared/section-text';
import { StatusNotice } from '../shared/status-notice';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { CATERER_PROFILE_SERVICE, OwnProfileView } from '@sweet-hand/api';

type Errors = { minGuests: string | null; maxGuests: string | null; occasions: string | null };
const NONE: Errors = { minGuests: null, maxGuests: null, occasions: null };

/** "Enter a whole number from 1 to 5,000" unless the text is one (L2-020.4). */
function wholeGuests(text: string): string | null {
  const v = text.trim();
  return /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 5000 ? null : $localize`:@@events.whole:Enter a whole number from 1 to 5,000`;
}

/** Guests and occasions, /dashboard/profile/events (docs/mocks/pages/profile-events; L2-020, L2-021). */
@Component({
  selector: 'app-events-page',
  imports: [RouterLink, BackLink, EMPTY_STATE, FormField, FormRow, FormSummary, Fieldset, Icon, PrivateNote, SaveStatus, TextField, DashboardLayout, ListingPreview, StatusNotice, WithdrawDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './events.page.html',
})
export class EventsPage {
  private readonly api = inject(CATERER_PROFILE_SERVICE);
  protected readonly data = new ProfileData(this.api);
  protected readonly autosave = new Autosave(() => this.save(), () => this.data.published());

  protected readonly min = signal('');
  protected readonly max = signal('');
  protected readonly occasions = signal<ReadonlySet<string>>(new Set());
  protected readonly errors = signal<Errors>(NONE);
  protected readonly attempt = signal(0);
  protected readonly withdrawOpen = signal(false);

  protected readonly allOccasions = computed(() => this.data.ref()?.occasions ?? []);
  /** "Serves 20–300 guests" as the page says it now, from the saved values. */
  protected readonly saved = computed(() => {
    const p = this.data.profile();
    return p?.minGuests && p.maxGuests ? guestRange(p.minGuests, p.maxGuests) : null;
  });
  protected readonly subtitle = computed(() => {
    const min = Number(this.min());
    const max = Number(this.max());
    const range = this.errors().minGuests || this.errors().maxGuests || !min || !max ? null : guestSpan(min, max);
    const p = this.data.profile();
    const shown = range ?? (p?.minGuests && p.maxGuests ? guestSpan(p.minGuests, p.maxGuests) : null);
    return [shown, occasionsCount(this.occasions().size)].filter(Boolean).join(' · ');
  });
  protected readonly guestsHelp = computed(() => {
    const s = this.saved();
    if (!s) return $localize`:@@events.helpNew:Whole numbers from 1 to 5,000.`;
    return this.errors().minGuests || this.errors().maxGuests
      ? $localize`:@@events.helpKept:Whole numbers from 1 to 5,000. Your page keeps showing “${s}:range:” until this is fixed.`
      : $localize`:@@events.help:Whole numbers from 1 to 5,000. Your page says “${s}:range:”.`;
  });
  protected readonly occasionNames = computed(() => {
    const p = this.data.profile();
    return this.allOccasions()
      .filter((o) => p?.occasions.includes(o.id))
      .map((o) => o.name)
      .join(', ');
  });
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return [
      e.minGuests && { controlId: 'min-guests', message: e.minGuests },
      e.maxGuests && { controlId: 'max-guests', message: e.maxGuests },
      e.occasions && { controlId: `o-${this.allOccasions()[0]?.id}`, message: e.occasions },
    ].filter(Boolean) as SummaryItem[];
  });
  protected readonly summaryHeading = computed(() => fixHeading(this.summary().length));
  protected readonly statusText = computed(() => (this.autosave.state() === 'invalid' ? notSavedText(this.summary().length) : this.autosave.text()));
  protected readonly saveState = computed(() => {
    const s = this.autosave.state();
    return s === 'saving' ? 'saving' : s === 'saved' ? 'saved' : 'error';
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
    this.min.set(p.minGuests ? String(p.minGuests) : '');
    this.max.set(p.maxGuests ? String(p.maxGuests) : '');
    this.occasions.set(new Set(p.occasions));
  }

  protected setGuests(which: 'min' | 'max', value: string): void {
    (which === 'min' ? this.min : this.max).set(value);
    this.autosave.changed();
  }

  protected toggleOccasion(id: string, on: boolean): void {
    const next = new Set(this.occasions());
    if (on) next.add(id);
    else next.delete(id);
    this.occasions.set(next);
    this.autosave.changed();
  }

  /** GuestRange and Occasion rules (L2-020.3, L2-020.4, L2-021.2), then the save. */
  private async save(): Promise<'saved' | 'invalid' | 'failed'> {
    const errors: Errors = { minGuests: wholeGuests(this.min()), maxGuests: wholeGuests(this.max()), occasions: null };
    if (!errors.minGuests && !errors.maxGuests && Number(this.min()) > Number(this.max())) {
      errors.minGuests = $localize`:@@events.minMax:Minimum guests can’t be more than maximum guests`;
    }
    if (!this.occasions().size) errors.occasions = $localize`:@@events.occasions:Choose at least one occasion`;
    this.errors.set(errors);
    if (Object.values(errors).some(Boolean)) {
      this.attempt.update((x) => x + 1);
      return 'invalid';
    }
    const ids = this.allOccasions().map((o) => o.id).filter((id) => this.occasions().has(id));
    try {
      const profile = await firstValueFrom(this.api.saveSection({ section: 'events', values: { minGuests: this.min().trim(), maxGuests: this.max().trim(), occasions: ids } }));
      this.data.profile.set(profile);
      return 'saved';
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        const e = problem.errors;
        this.errors.set({ minGuests: e['minGuests']?.[0] ?? null, maxGuests: e['maxGuests']?.[0] ?? null, occasions: e['occasions']?.[0] ?? null });
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
