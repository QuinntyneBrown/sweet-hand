import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EMPTY_STATE, Icon, InboxList, InboxRow, SectionList, Stat, StatGrid, Status, type InboxRowPicture } from '@sweet-hand/components';
import { CatererProfileApi } from '../../../core/api/caterer-profile-api';
import type { OwnProfileView, OwnReviewPageView, ReferenceDataView } from '../../../core/api/caterer-profile.models';
import { EnquiriesApi } from '../../../core/api/enquiries-api';
import type { InboxPageView, InboxRowView } from '../../../core/api/enquiries.models';
import { problemOf, reference } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { activityTime, rowName, rowSummary, statusLabel as enquiryStatusLabel, statusTone as enquiryStatusTone } from '../../enquiries/enquiry-text';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { CHECK_LABELS, cardModel, publishedSections, statusLabel, statusTone } from '../shared/profile-text';

interface Loaded {
  profile: OwnProfileView;
  ref: ReferenceDataView;
  inbox: InboxPageView;
  reviews: OwnReviewPageView;
}

type ViewState = { kind: 'loading' } | { kind: 'error'; reference: string | null } | ({ kind: 'ready' } & Loaded);

/** The caterer's overview, /dashboard (docs/mocks/pages/dashboard; set-up-profile and submit-profile-for-review designs). */
@Component({
  selector: 'app-overview-page',
  imports: [RouterLink, EMPTY_STATE, Icon, InboxList, InboxRow, SectionList, Stat, StatGrid, Status, DashboardLayout, ListingPreview],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.page.html',
})
export class OverviewPage {
  private readonly api = inject(CatererProfileApi);
  private readonly enquiries = inject(EnquiriesApi);
  private readonly session = inject(Session);

  protected readonly state = signal<ViewState>({ kind: 'loading' });
  protected readonly ready = computed(() => {
    const s = this.state();
    return s.kind === 'ready' ? s : null;
  });
  protected readonly checkLabels = CHECK_LABELS();

  /** The business as the session knows it, for the error state. */
  protected readonly business = computed(() => this.session.user()?.caterer ?? null);
  protected readonly status = computed(() => this.ready()?.profile.status ?? null);
  protected readonly tone = computed(() => (this.status() ? statusTone(this.status()!) : null));
  protected readonly statusText = computed(() => (this.status() ? statusLabel(this.status()!) : ''));
  protected readonly card = computed(() => {
    const r = this.ready();
    return r ? cardModel(r.profile, r.ref) : null;
  });
  protected readonly previewLabel = computed(() => {
    switch (this.status()) {
      case null:
      case 'Removed':
        return null;
      default:
        return $localize`:@@preview.yourCard:Your listing card`;
    }
  });
  protected readonly errorReference = computed(() => {
    const s = this.state();
    return s.kind === 'error' ? s.reference : null;
  });
  protected readonly previewHref = computed(() => (this.status() === 'Published' ? this.pageHref() : null));
  protected readonly pageHref = computed(() => `/caterers/${this.ready()?.profile.slug ?? this.business()?.slug ?? ''}`);

  protected readonly rating = computed(() => {
    const r = this.ready()?.reviews;
    return r && r.total ? r.average.toFixed(1) : null;
  });
  protected readonly openCount = computed(() => {
    const c = this.ready()?.inbox.counts;
    return c ? String(c.open + c.replied) : '0';
  });
  protected readonly rows = computed(() => {
    const now = new Date();
    return (this.ready()?.inbox.items ?? []).slice(0, 3).map((row) => ({
      id: row.id,
      href: `/dashboard/enquiries/${row.id}`,
      name: rowName(row),
      picture: picture(row),
      time: activityTime(row.lastActivityAt, now),
      datetime: row.lastActivityAt,
      summary: rowSummary(row, 'caterer', now),
      tone: enquiryStatusTone(row.status),
      statusLabel: enquiryStatusLabel(row.status),
      unread: row.unread,
    }));
  });
  protected readonly listLabel = computed(() => $localize`:@@enquiries.listLabel:${this.ready()?.profile.name ?? ''}:business: enquiries`);
  protected readonly sections = computed(() => {
    const r = this.ready();
    return r ? publishedSections(r.profile, { total: r.reviews.total, unanswered: r.reviews.unanswered }) : [];
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.state.set({ kind: 'loading' });
    try {
      const [profile, ref, inbox, reviews] = await Promise.all([
        firstValueFrom(this.api.profile()),
        firstValueFrom(this.api.referenceData()),
        firstValueFrom(this.enquiries.inbox({ status: null, page: 1 })),
        firstValueFrom(this.api.reviews(1)),
      ]);
      this.state.set({ kind: 'ready', profile, ref, inbox, reviews });
    } catch (error) {
      this.state.set({ kind: 'error', reference: reference(problemOf(error).problem) });
    }
  }
}

function picture(row: InboxRowView): InboxRowPicture {
  const p = row.otherParty;
  if (p.kind === 'caterer') return { kind: 'photo', src: p.photo };
  if (p.kind === 'customer') return { kind: 'initials', text: p.initials };
  return { kind: 'gone' };
}
