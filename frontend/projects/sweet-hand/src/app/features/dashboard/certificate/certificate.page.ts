import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, BackLink, EMPTY_STATE, FileRow, FileUpload, FormActions, FormField, FormRow, FormSummary, Icon, PrivateNote, SaveStatus, Status, TextField, type SummaryItem } from '@sweet-hand/components';
import { longDate, torontoToday } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { ProfileData } from '../shared/profile-data';
import { dayMonthYear, savedOn } from '../shared/profile-text';
import { ProfileBanner } from '../shared/profile-banner';
import { StatusNotice } from '../shared/status-notice';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { readUpload } from '../photos/photo-rules';
import { CATERER_PROFILE_SERVICE, CertificateView, OwnProfileView } from '@sweet-hand/api';

type Field = 'holder' | 'issuer' | 'number' | 'expiry';
type Errors = Record<Field, string | null>;
const NONE: Errors = { holder: null, issuer: null, number: null, expiry: null };

/** The copy beside the form: the saved one, a newly chosen one, or one that was refused. */
type Copy = { kind: 'saved'; name: string; meta: string } | { kind: 'chosen'; file: File; meta: string } | { kind: 'failed'; file: File | null; name: string; message: string } | null;

const CERT_TYPES = 'application/pdf,image/jpeg,image/png';
const MAX_BYTES = 10 * 1024 * 1024;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "1.2 MB", "0.8 MB", "2 KB": megabytes from a tenth of one. */
function size(bytes: number): string {
  return bytes >= 100 * 1024 ? $localize`:@@file.mb:${(bytes / (1024 * 1024)).toFixed(1)}:size: MB` : $localize`:@@file.kb:${Math.max(1, Math.round(bytes / 1024))}:size: KB`;
}

function typeOf(file: File): string {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type === 'image/png') return 'PNG';
  if (file.type === 'image/jpeg') return 'JPEG';
  return file.name.split('.').pop()?.toUpperCase() ?? '';
}

/** Food safety, /dashboard/profile/food-safety (docs/mocks/pages/profile-certificate; provide-food-handler-certificate design, L2-040). */
@Component({
  selector: 'app-certificate-page',
  imports: [RouterLink, Alert, BackLink, EMPTY_STATE, FileRow, FileUpload, FormActions, FormField, FormRow, FormSummary, Icon, PrivateNote, SaveStatus, Status, TextField, DashboardLayout, ListingPreview, ProfileBanner, StatusNotice, WithdrawDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './certificate.page.html',
})
export class CertificatePage {
  private readonly api = inject(CATERER_PROFILE_SERVICE);
  private readonly injector = inject(Injector);
  protected readonly data = new ProfileData(this.api);
  private readonly upload = viewChild(FileUpload);

  protected readonly certTypes = CERT_TYPES;
  protected readonly yourCard = $localize`:@@preview.yourCard:Your listing card`;
  protected readonly today = torontoToday();
  protected readonly holder = signal('');
  protected readonly issuer = signal('');
  protected readonly number = signal('');
  protected readonly expiry = signal('');
  protected readonly copy = signal<Copy>(null);
  /** The saved copy is to be removed on the next save. */
  private removeSaved = false;
  protected readonly errors = signal<Errors>(NONE);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly withdrawOpen = signal(false);

  protected readonly certificate = computed(() => this.data.profile()?.certificate ?? null);
  /** Editable unless in review or removed; a suspended caterer can still replace it (L2-044.4). */
  protected readonly readOnly = computed(() => this.data.pending() || this.data.status() === 'Removed');
  protected readonly subtitle = computed(() =>
    this.certificate()
      ? $localize`:@@certificate.subtitle:Your food handler certificate`
      : $localize`:@@certificate.subtitleNeeded:You need a valid food handler certificate before you can submit your profile for review.`,
  );
  protected readonly savedText = computed(() => {
    const c = this.certificate();
    return c ? $localize`:@@certificate.saved:Saved ${savedOn(c.savedAt)}:date:` : null;
  });
  /** 30 days or fewer before a published certificate expires (L2-040.2). */
  protected readonly expiring = computed(() => {
    const c = this.certificate();
    if (!c || !this.data.published()) return null;
    const days = Math.round((new Date(`${c.expires}T12:00:00Z`).getTime() - new Date(`${this.today}T12:00:00Z`).getTime()) / DAY_MS);
    if (days < 0 || days > 30) return null;
    return {
      title: $localize`:@@certificate.expiringTitle:Your certificate expires on ${longDate(c.expires)}:date:`,
      text:
        days === 1
          ? $localize`:@@certificate.expiringTomorrow:That’s tomorrow. Add your renewed certificate here to keep your profile published.`
          : $localize`:@@certificate.expiringText:That’s ${days}:days: days from today. Add your renewed certificate here to keep your profile published.`,
    };
  });
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return (['holder', 'issuer', 'number', 'expiry'] as const).filter((f) => e[f]).map((f) => ({ controlId: f, message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@certificate.action:save`));
  protected readonly readOnlyRows = computed(() => {
    const c = this.certificate();
    if (!c) return [];
    return [
      { term: $localize`:@@certificate.holder:Name on the certificate`, value: c.holder },
      { term: $localize`:@@certificate.issuer:Issued by`, value: c.issuer },
      { term: $localize`:@@certificate.number:Certificate number`, value: c.number },
      { term: $localize`:@@certificate.expiry:Expiry date`, value: dayMonthYear(c.expires) },
      ...(c.file ? [{ term: $localize`:@@certificate.copy:Copy of certificate`, value: c.file.name }] : []),
    ];
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    await this.data.load();
    this.reset(this.certificate());
  }

  private reset(c: CertificateView | null): void {
    this.holder.set(c?.holder ?? '');
    this.issuer.set(c?.issuer ?? '');
    this.number.set(c?.number ?? '');
    this.expiry.set(c?.expires ?? '');
    this.removeSaved = false;
    this.copy.set(c?.file ? { kind: 'saved', name: c.file.name, meta: $localize`:@@certificate.fileMeta:${c.file.type}:type: · ${size(c.file.size)}:size: · uploaded ${savedOn(c.file.uploadedAt)}:date:` } : null);
  }

  /** PDF, JPEG or PNG of up to 10 MB (L2-040); the content is checked when it is saved. */
  protected choose(file: File): void {
    if (file.size > MAX_BYTES) {
      this.copy.set({ kind: 'failed', file: null, name: file.name, message: $localize`:@@certificate.fileTooBig:Certificate copies must be a PDF, JPEG or PNG of up to 10 MB` });
      return;
    }
    this.copy.set({ kind: 'chosen', file, meta: `${typeOf(file)} · ${size(file.size)}` });
  }

  protected removeCopy(): void {
    if (this.copy()?.kind === 'saved' || this.certificate()?.file) this.removeSaved = true;
    this.copy.set(null);
    afterNextRender(() => this.upload()?.focus(), { injector: this.injector });
  }

  protected async save(): Promise<void> {
    if (this.busy()) return;
    const errors: Errors = {
      holder: this.holder().trim() ? null : $localize`:@@certificate.holderError:Enter the name on the certificate`,
      issuer: this.issuer().trim() ? null : $localize`:@@certificate.issuerError:Enter who issued the certificate`,
      number: this.number().trim() ? null : $localize`:@@certificate.numberError:Enter the certificate number`,
      expiry: !this.expiry()
        ? $localize`:@@certificate.expiryError:Enter the expiry date`
        : this.expiry() < this.today
          ? $localize`:@@certificate.expired:This certificate has expired`
          : null,
    };
    this.errors.set(errors);
    this.failed.set(false);
    if (Object.values(errors).some(Boolean)) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      let cert = await firstValueFrom(this.api.saveCertificate({ holder: this.holder(), issuer: this.issuer(), number: this.number(), expires: this.expiry() }));
      const copy = this.copy();
      let refused: Copy = null;
      if (copy?.kind === 'chosen') {
        try {
          cert = await firstValueFrom(this.api.uploadCertificateFile(await readUpload(copy.file)));
        } catch (error) {
          const message = problemOf(error).problem.errors?.['file']?.[0];
          if (!message) throw error;
          refused = { kind: 'failed', file: copy.file, name: copy.file.name, message };
        }
      } else if (this.removeSaved && cert.file) {
        cert = await firstValueFrom(this.api.removeCertificateFile());
      }
      const p = this.data.profile();
      if (p) this.data.profile.set({ ...p, certificate: cert });
      this.reset(cert);
      if (refused) this.copy.set(refused);
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        const e = problem.errors;
        this.errors.set({ holder: e['holder']?.[0] ?? null, issuer: e['issuer']?.[0] ?? null, number: e['number']?.[0] ?? null, expiry: e['expires']?.[0] ?? null });
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected withdrawn(profile: OwnProfileView): void {
    this.data.profile.set(profile);
    this.reset(profile.certificate);
    this.withdrawOpen.set(false);
  }
}
