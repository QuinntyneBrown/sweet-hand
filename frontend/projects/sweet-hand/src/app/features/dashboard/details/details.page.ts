import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, BackLink, EMPTY_STATE, FormField, FormSummary, Icon, PrivateNote, SaveStatus, TextField, Textarea, type SummaryItem } from '@sweet-hand/components';
import { RouterLink } from '@angular/router';
import { count, shortDate } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { Autosave } from '../shared/autosave';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { ProfileData } from '../shared/profile-data';
import { StatusNotice } from '../shared/status-notice';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { fixHeading, notSavedText } from '../shared/section-text';
import { CatererProfileService, type OwnProfileView } from '@sweet-hand/api';
import type { Errors } from './errors';
import { paths } from '../../../core/routing/paths';

/** Business details, /dashboard/profile/details (docs/mocks/pages/profile-details; set-up-profile and edit-published-profile designs). */
@Component({
  selector: 'app-details-page',
  imports: [RouterLink, Alert, BackLink, EMPTY_STATE, FormField, FormSummary, Icon, PrivateNote, SaveStatus, TextField, Textarea, DashboardLayout, ListingPreview, StatusNotice, WithdrawDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './details.page.html',
})
export class DetailsPage {
  protected readonly paths = paths;
  private readonly api = inject(CatererProfileService);
  protected readonly data = new ProfileData(this.api);
  protected readonly autosave = new Autosave(() => this.save(), () => this.data.published());

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly errors = signal<Errors>({ name: null, description: null });
  protected readonly attempt = signal(0);
  protected readonly withdrawOpen = signal(false);
  protected readonly withdrawOpener = signal<HTMLElement | null>(null);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return [e.name && { controlId: 'name', message: e.name }, e.description && { controlId: 'description', message: e.description }].filter(Boolean) as SummaryItem[];
  });
  protected readonly summaryHeading = computed(() => fixHeading(this.summary().length));
  protected readonly statusText = computed(() => (this.autosave.state() === 'invalid' ? notSavedText(this.summary().length) : this.autosave.text()));
  protected readonly saveState = computed(() => {
    const s = this.autosave.state();
    return s === 'saving' ? 'saving' : s === 'saved' ? 'saved' : 'error';
  });
  protected readonly counter = computed(() => $localize`:@@details.counter:${count(this.description().trim().length)}:count: / 2,000`);
  protected readonly paragraphs = computed(() => (this.data.profile()?.description ?? '').split(/\n\s*\n/).filter((p) => p.trim()));
  protected readonly pending = computed(() => this.data.profile()?.pendingName ?? null);
  protected readonly nameHelp = computed(() => {
    const p = this.pending();
    return p
      ? $localize`:@@details.nameWaiting:Waiting for review since ${shortDate(p.requestedAt)}:date:. Change it again to replace the request.`
      : $localize`:@@details.nameHelp:2–80 characters. A new name goes live after our team checks it.`;
  });
  protected readonly pendingText = computed(() => {
    const p = this.data.profile();
    return p?.pendingName
      ? $localize`:@@details.pendingText:Your page shows “${p.name}:current:” until our team approves “${p.pendingName.name}:requested:”. This usually takes up to 3 business days. Your page address changes when it’s approved.`
      : '';
  });
  protected readonly previewLabel = computed(() =>
    this.pending() ? $localize`:@@preview.currentName:Live preview: current public name` : this.data.previewLabel(),
  );
  /** Drafts preview what is typed; a published card keeps its public name until a change is approved. */
  protected readonly card = computed(() => {
    const c = this.data.card();
    if (!c) return null;
    return this.data.published() || this.data.readOnly() || !this.name().trim() ? c : { ...c, name: this.name().trim() };
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    await this.data.load();
    const p = this.data.profile();
    if (p) {
      this.name.set(p.pendingName?.name ?? p.name);
      this.description.set(p.description);
    }
  }

  protected changed(field: 'name' | 'description', value: string): void {
    (field === 'name' ? this.name : this.description).set(value);
    this.autosave.changed();
  }

  /** Validates as the server does, then saves the section (L2-038.1, L2-044). */
  private async save(): Promise<'saved' | 'invalid' | 'failed'> {
    const name = this.name().trim();
    const description = this.description().trim();
    const errors: Errors = { name: null, description: null };
    if (name.length < 2 || name.length > 80) errors.name = $localize`:@@details.nameError:Enter a business name of 2 to 80 characters`;
    if (description.length > 2000) errors.description = $localize`:@@details.descriptionLong:Write no more than 2,000 characters`;
    else if (this.data.published() && description.length < 50) {
      errors.description = $localize`:@@details.descriptionShort:Write at least 50 characters (${description.length}:count: so far)`;
    }
    this.errors.set(errors);
    if (errors.name || errors.description) {
      this.attempt.update((n) => n + 1);
      return 'invalid';
    }
    try {
      const profile = await firstValueFrom(this.api.saveSection({ section: 'details', values: { name, description } }));
      this.data.profile.set(profile);
      return 'saved';
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        this.errors.set({ name: problem.errors['name']?.[0] ?? null, description: problem.errors['description']?.[0] ?? null });
        this.attempt.update((n) => n + 1);
        return 'invalid';
      }
      return 'failed';
    }
  }

  protected openWithdraw(opener: HTMLElement): void {
    this.withdrawOpener.set(opener);
    this.withdrawOpen.set(true);
  }

  protected withdrawn(profile: OwnProfileView): void {
    this.data.profile.set(profile);
    this.withdrawOpen.set(false);
    this.withdrawOpener.set(null);
    this.name.set(profile.pendingName?.name ?? profile.name);
    this.description.set(profile.description);
  }
}
