import { computed, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { problemOf, reference } from '../../../core/forms/problem';
import { cardModel, statusLabel, statusTone } from './profile-text';
import { type CatererProfileService, type OwnProfileView, type ReferenceDataView } from '@sweet-hand/api';
import type { LoadState } from './load-state';

/** The caterer's own profile and the reference lists, as one section page loads them. */
export class ProfileData {
  readonly state = signal<LoadState>({ kind: 'loading' });
  readonly profile = signal<OwnProfileView | null>(null);
  readonly ref = signal<ReferenceDataView | null>(null);

  readonly status = computed(() => this.profile()?.status ?? null);
  readonly statusTone = computed(() => (this.status() ? statusTone(this.status()!) : null));
  readonly statusText = computed(() => (this.status() ? statusLabel(this.status()!) : ''));
  readonly errorReference = computed(() => {
    const s = this.state();
    return s.kind === 'error' ? s.reference : null;
  });
  /** In review: every field is read-only, with Withdraw submission (L2-039.4). */
  readonly pending = computed(() => this.status() === 'Pending review');
  readonly suspended = computed(() => this.status() === 'Suspended');
  readonly readOnly = computed(() => this.pending() || this.suspended() || this.status() === 'Removed');
  readonly published = computed(() => this.status() === 'Published');
  readonly card = computed(() => {
    const p = this.profile();
    const r = this.ref();
    return p && r ? cardModel(p, r) : null;
  });
  readonly pageHref = computed(() => `/caterers/${this.profile()?.slug ?? ''}`);

  constructor(private readonly api: CatererProfileService) {}

  async load(): Promise<void> {
    this.state.set({ kind: 'loading' });
    try {
      const [profile, ref] = await Promise.all([firstValueFrom(this.api.profile()), firstValueFrom(this.api.referenceData())]);
      this.profile.set(profile);
      this.ref.set(ref);
      this.state.set({ kind: 'ready' });
    } catch (error) {
      this.state.set({ kind: 'error', reference: reference(problemOf(error).problem) });
    }
  }

  /** "Your listing card", "How you’ll appear", "Hidden from the listing" (container CRD, preview labels). */
  previewLabel(editing: string = $localize`:@@preview.live:Live preview`): string | null {
    switch (this.status()) {
      case null:
      case 'Removed':
        return null;
      case 'Pending review':
      case 'Changes requested':
        return $localize`:@@preview.howYouAppear:How you’ll appear`;
      case 'Suspended':
        return $localize`:@@preview.hidden:Hidden from the listing`;
      default:
        return editing;
    }
  }
}
