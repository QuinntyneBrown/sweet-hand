import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, EMPTY_STATE, Icon, InboxList, InboxRow, Meter, PrivateNote, SaveStatus, SectionList, Stat, StatGrid, Status, type InboxRowPicture } from '@sweet-hand/components';
import { shortDate, torontoToday } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { DownloadDataDialog } from '../../account/download-data/download-data.dialog';
import { activityTime, rowName, rowSummary, statusLabel as enquiryStatusLabel, statusTone as enquiryStatusTone } from '../../enquiries/enquiry-text';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { CHECK_LABELS, RULE_HREF, attentionAction, cardModel, checklistRows, publishedSections, sectionsLeft, statusLabel, statusTone } from '../shared/profile-text';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { SubmitDialog, type SubmitStep } from './submit-dialog';
import { AccountService, type AccountView, CatererProfileService, type ChecklistKey, EnquiriesService, type InboxPageView, type InboxRowView, type OwnProfileView, type OwnReviewPageView, type ReferenceDataView, type SubmissionProblem } from '@sweet-hand/api';

interface Loaded {
  profile: OwnProfileView;
  ref: ReferenceDataView;
  inbox: InboxPageView;
  reviews: OwnReviewPageView;
}

type ViewState = { kind: 'loading' } | { kind: 'error'; reference: string | null } | ({ kind: 'ready' } & Loaded);

const DISMISSED_KEY = 'sh-dismissed-live:';

function rememberedDismissal(id: string): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY + id) === '1';
  } catch {
    return false;
  }
}

/** The caterer's overview, /dashboard (docs/mocks/pages/dashboard; set-up-profile and submit-profile-for-review designs). */
@Component({
  selector: 'app-overview-page',
  imports: [
    RouterLink,
    Alert,
    EMPTY_STATE,
    Icon,
    InboxList,
    InboxRow,
    Meter,
    PrivateNote,
    SaveStatus,
    SectionList,
    Stat,
    StatGrid,
    Status,
    DashboardLayout,
    DownloadDataDialog,
    ListingPreview,
    SubmitDialog,
    WithdrawDialog,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './overview.page.html',
})
export class OverviewPage {
  private readonly api = inject(CatererProfileService);
  private readonly enquiries = inject(EnquiriesService);
  private readonly accounts = inject(AccountService);
  private readonly session = inject(Session);
  private readonly submitDialog = viewChild(SubmitDialog);

  protected readonly state = signal<ViewState>({ kind: 'loading' });
  protected readonly ready = computed(() => {
    const s = this.state();
    return s.kind === 'ready' ? s : null;
  });
  protected readonly profile = computed(() => this.ready()?.profile ?? null);
  protected readonly checkLabels = CHECK_LABELS();

  /** The business as the session knows it, for the error state. */
  protected readonly business = computed(() => this.session.user()?.caterer ?? null);
  protected readonly status = computed(() => this.profile()?.status ?? null);
  protected readonly tone = computed(() => (this.status() ? statusTone(this.status()!) : null));
  protected readonly statusText = computed(() => (this.status() ? statusLabel(this.status()!) : ''));
  protected readonly errorReference = computed(() => {
    const s = this.state();
    return s.kind === 'error' ? s.reference : null;
  });
  protected readonly card = computed(() => {
    const r = this.ready();
    return r ? cardModel(r.profile, r.ref) : null;
  });
  /** First run: nothing but the name so far (docs/mocks/pages/dashboard/empty). */
  protected readonly firstRun = computed(() => {
    const p = this.profile();
    return !!p && p.status === 'Draft' && !p.description && !p.cuisines.length && !p.photos.length && !p.dishes.length && !p.certificate;
  });
  protected readonly previewLabel = computed(() => {
    switch (this.status()) {
      case null:
      case 'Removed':
        return null;
      case 'Draft':
        return this.firstRun() ? $localize`:@@preview.yourCard:Your listing card` : $localize`:@@preview.live:Live preview`;
      case 'Pending review':
      case 'Changes requested':
        return $localize`:@@preview.howYouAppear:How you’ll appear`;
      case 'Suspended':
        return $localize`:@@preview.hidden:Hidden from the listing`;
      default:
        return $localize`:@@preview.yourCard:Your listing card`;
    }
  });
  protected readonly pageHref = computed(() => `/caterers/${this.profile()?.slug ?? this.business()?.slug ?? ''}`);
  protected readonly previewHref = computed(() => (this.status() === 'Published' && !this.profile()?.pendingName ? this.pageHref() : null));

  // Published
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
  protected readonly listLabel = computed(() => $localize`:@@enquiries.listLabel:${this.profile()?.name ?? ''}:business: enquiries`);
  protected readonly sections = computed(() => {
    const r = this.ready();
    return r ? publishedSections(r.profile, { total: r.reviews.total, unanswered: r.reviews.unanswered }) : [];
  });
  protected readonly renameText = computed(() => {
    const p = this.profile();
    return p?.pendingName
      ? $localize`:@@dashboard.renameText:You asked to rename “${p.name}:current:” to “${p.pendingName.name}:requested:” on ${shortDate(p.pendingName.requestedAt)}:date:. Your page keeps the current name until our team approves it, usually within 3 business days.`
      : '';
  });
  /** Approved today and not dismissed on this device (docs/mocks/notifications/profile-banner/success). */
  protected readonly liveBannerDismissed = signal(false);
  protected readonly showLive = computed(() => {
    const p = this.profile();
    return !!p?.publishedAt && p.status === 'Published' && torontoToday(new Date(p.publishedAt)) === torontoToday() && !this.liveBannerDismissed() && !rememberedDismissal(p.id + p.publishedAt);
  });
  protected readonly liveTitle = computed(() => $localize`:@@banner.liveTitle:${this.profile()?.name ?? ''}:business: is live`);

  // Setup and review
  protected readonly flagged = signal<ReadonlySet<ChecklistKey>>(new Set());
  protected readonly checklist = computed(() => {
    const r = this.ready();
    return r ? checklistRows(r.profile, r.ref, this.flagged()) : [];
  });
  protected readonly doneCount = computed(() => this.profile()?.checklist.filter((i) => i.done).length ?? 0);
  protected readonly meterText = computed(() => $localize`:@@setup.doneOf:${this.doneCount()}:done: of 10 done`);
  protected readonly firstName = computed(() => (this.profile()?.contactName ?? '').trim().split(/\s+/)[0] ?? '');
  protected readonly welcome = computed(() => $localize`:@@setup.welcome:Welcome, ${this.firstName()}:name:`);
  protected readonly leftText = computed(() => (this.profile() ? sectionsLeft(this.profile()!) : null));
  protected readonly statusDate = computed(() => {
    const p = this.profile();
    if (!p?.statusChangedAt) return null;
    const date = shortDate(p.statusChangedAt);
    switch (p.status) {
      case 'Pending review':
        return $localize`:@@dashboard.submittedOn:Submitted ${date}:date:`;
      case 'Suspended':
        return $localize`:@@dashboard.since:Since ${date}:date:`;
      case 'Changes requested':
      case 'Removed':
        return date;
      default:
        return null;
    }
  });
  protected readonly pendingText = computed(
    () =>
      $localize`:@@dashboard.pendingText:While we review it, your profile is read-only. We’ll email you at ${this.profile()?.email ?? ''}:email: when it’s live, or if anything needs changing.`,
  );
  protected readonly reasonText = computed(() => $localize`:@@dashboard.reasonByTeam:“${this.profile()?.statusReason ?? ''}:reason:” — Sweet Hand team`);
  protected readonly suspendedText = computed(
    () => $localize`:@@dashboard.suspendedText:“${this.profile()?.statusReason ?? ''}:reason:” — Sweet Hand team. Open enquiries were closed and those customers were told.`,
  );
  protected readonly removedText = computed(
    () =>
      $localize`:@@dashboard.removedText:“${this.profile()?.statusReason ?? ''}:reason:” Your page and photos are no longer shown and can’t be restored. If you think this is a mistake, reply to the email we sent you.`,
  );
  /** "Go to photos": the first section the operator flagged. */
  protected readonly attentionLink = computed(() => {
    const a = this.profile()?.attention[0];
    return a ? { href: RULE_HREF[a.key], label: attentionAction(a.key) } : null;
  });
  protected readonly certificateDone = computed(() => !!this.profile()?.checklist.find((i) => i.key === 'certificate')?.done);

  // Dialogs
  protected readonly submitStep = signal<SubmitStep | null>(null);
  protected readonly submitBusy = signal(false);
  protected readonly submitFailed = signal(false);
  protected readonly failures = signal<SubmissionProblem['failed']>([]);
  protected readonly withdrawOpen = signal(false);
  protected readonly account = signal<AccountView | null>(null);
  protected readonly downloadOpen = signal(false);
  protected readonly downloadOpener = signal<HTMLElement | null>(null);

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

  private setProfile(profile: OwnProfileView): void {
    const s = this.state();
    if (s.kind === 'ready') this.state.set({ ...s, profile });
  }

  /** A complete draft is confirmed first; an incomplete one is sent so the server lists every failed rule (L2-039.2, L2-039.3). */
  protected async startSubmit(): Promise<void> {
    this.submitFailed.set(false);
    if (this.profile()?.checklist.every((i) => i.done)) {
      this.submitStep.set('confirm');
      return;
    }
    await this.submit();
  }

  protected async submit(): Promise<void> {
    if (this.submitBusy()) return;
    this.submitBusy.set(true);
    this.submitFailed.set(false);
    try {
      const profile = await firstValueFrom(this.api.submit());
      this.setProfile(profile);
      this.flagged.set(new Set());
      this.showStep('success');
      void this.session.refresh();
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 422 && Array.isArray(problem['failed'])) {
        const failed = problem['failed'] as SubmissionProblem['failed'];
        this.failures.set(failed);
        this.flagged.set(new Set(failed.map((f) => f.key)));
        this.showStep('invalid');
      } else {
        this.submitFailed.set(true);
        if (!this.submitStep()) this.submitStep.set('confirm');
      }
    } finally {
      this.submitBusy.set(false);
    }
  }

  private showStep(step: SubmitStep): void {
    const wasOpen = this.submitStep() !== null;
    this.submitStep.set(step);
    if (wasOpen) this.submitDialog()?.focusAction();
  }

  protected closeSubmit(): void {
    this.submitStep.set(null);
  }

  protected withdrawn(profile: OwnProfileView): void {
    this.setProfile(profile);
    this.withdrawOpen.set(false);
  }

  protected dismissLive(): void {
    const p = this.profile();
    this.liveBannerDismissed.set(true);
    try {
      if (p) localStorage.setItem(DISMISSED_KEY + p.id + p.publishedAt, '1');
    } catch {
      // Private windows may refuse; the banner then returns on the next visit today.
    }
  }

  /** The removed caterer's data download reuses the account's dialog (L2-058.5, L2-071). */
  protected async openDownload(opener: HTMLElement): Promise<void> {
    this.downloadOpener.set(opener);
    if (!this.account()) this.account.set(await firstValueFrom(this.accounts.account()));
    this.downloadOpen.set(true);
  }
}


function picture(row: InboxRowView): InboxRowPicture {
  const p = row.otherParty;
  if (p.kind === 'caterer') return { kind: 'photo', src: p.photo };
  if (p.kind === 'customer') return { kind: 'initials', text: p.initials };
  return { kind: 'gone' };
}
