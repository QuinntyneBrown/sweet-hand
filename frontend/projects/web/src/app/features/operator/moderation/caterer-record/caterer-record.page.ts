import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Alert, BackLink, Button, EMPTY_STATE, Icon, PhotoRow, Status } from '@sweet-hand/components';
import { ModerationApi } from '../../../../core/api/operator-moderation-api';
import type { CatererRecordView } from '../../../../core/api/operator-moderation.models';
import { problemOf, reference } from '../../../../core/forms/problem';
import { shortDate } from '../../../../core/format/format';
import { Session } from '../../../../core/session/session';
import { guestRange } from '../../../discovery/caterer/caterer-view';
import { openCertificate } from '../certificate-link';
import { dayTime, firstName, fullDate, profileStatusLabel, profileStatusTone } from '../moderation-text';
import {
  copyLabel,
  dishCount,
  enquiryLine,
  expiredText,
  expiredTitle,
  historyNote,
  removedText,
  removedTitle,
  reportLine,
  reviewLine,
  suspendedText,
  suspendedTitle,
  withPrimary,
} from './record-view';

export type RecordDialog = 'edit' | 'suspend' | 'reinstate' | 'remove';

/**
 * One caterer's record for operators, /admin/caterers/:id
 * (suspend-reinstate-remove-profile and edit-profile-as-operator designs; docs/mocks/pages/admin-caterer).
 */
@Component({
  selector: 'app-caterer-record-page',
  imports: [RouterLink, Alert, BackLink, Button, EMPTY_STATE, Icon, PhotoRow, Status],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './caterer-record.page.html',
  styleUrl: './caterer-record.page.css',
})
export class CatererRecordPage {
  private readonly api = inject(ModerationApi);
  private readonly session = inject(Session);
  protected readonly admin = computed(() => !!this.session.user()?.admin);

  /** The caterer id from the route. */
  readonly id = input.required<string>();

  protected readonly record = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.caterer(params),
  });
  protected readonly view = computed<CatererRecordView | undefined>(() => (this.record.hasValue() ? this.record.value() : undefined));
  protected readonly failed = computed(() => !!this.record.error() && !this.view());
  protected readonly errorReference = computed(() => reference(problemOf(this.record.error()).problem));

  protected readonly statusTone = profileStatusTone;
  protected readonly statusLabel = profileStatusLabel;
  protected readonly historyNote = historyNote;
  protected readonly dayTime = dayTime;
  protected readonly fullDate = fullDate;

  private readonly r = computed(() => this.view()!);
  protected readonly expired = computed(() => this.view()?.status === 'Published' && !!this.view()?.certificate?.expired);
  protected readonly expiredTitle = computed(() => expiredTitle(this.r()));
  protected readonly expiredText = computed(() => expiredText(this.r()));
  protected readonly suspendedTitle = computed(() => suspendedTitle(this.r()));
  protected readonly suspendedText = computed(() => suspendedText(this.r()));
  protected readonly removedTitle = computed(() => removedTitle(this.r()));
  protected readonly removedText = computed(() => removedText(this.r()));
  protected readonly nameWaiting = computed(
    () => $localize`:@@record.nameWaitingText:${this.r().name}:old: → ${this.r().pendingName ?? ''}:new:. The current name stays live until it’s approved.`,
  );
  protected readonly since = computed(() => shortDate(this.r().owner.since));
  protected readonly photos = computed(() => this.r().profile.photos.map((p) => ({ src: p.src, alt: p.alt, width: 72, height: 72 })));
  protected readonly cuisines = computed(() => withPrimary(this.r().profile.cuisines));
  protected readonly areas = computed(() => withPrimary(this.r().profile.areas));
  protected readonly guests = computed(() => guestRange(this.r().profile.minGuests, this.r().profile.maxGuests));
  protected readonly dishes = computed(() => dishCount(this.r().profile.dishes.length));
  protected readonly address = computed(() => `/caterers/${this.r().slug}`);
  protected readonly enquiries = computed(() => enquiryLine(this.r()));
  protected readonly reviews = computed(() => reviewLine(this.r()));
  protected readonly reports = computed(() => reportLine(this.r()));
  protected readonly copyLabel = computed(() => copyLabel(this.r().certificate?.fileName ?? '', this.r().certificate?.fileSize ?? null));
  protected readonly statement = computed(
    () =>
      $localize`:@@record.statement:The file opens through a link that expires after 5 minutes. ${firstName(this.r().owner.name)}:name:’s own statement; Sweet Hand doesn’t certify kitchens.`,
  );

  /** The open decision dialog and the button that opened it. */
  protected readonly dialog = signal<RecordDialog | null>(null);
  protected readonly opener = signal<HTMLElement | null>(null);

  protected openDialog(kind: RecordDialog, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.dialog.set(kind);
  }

  protected openCertificate(): void {
    openCertificate(this.api, this.id());
  }
}
