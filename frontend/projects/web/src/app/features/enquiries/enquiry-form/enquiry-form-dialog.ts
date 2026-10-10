import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import {
  Button,
  Description,
  DescriptionList,
  Dialog,
  EmptyState,
  FormField,
  FormSummary,
  Icon,
  Select,
  TextField,
  Textarea,
  graphemeLength,
  type SelectGroup,
  type SelectOption,
  type SummaryItem,
} from '@sweet-hand/components';
import { BotChallenge } from '../../../core/api/bot-challenge';
import { DiscoveryApi } from '../../../core/api/discovery-api';
import { EnquiriesApi } from '../../../core/api/enquiries-api';
import type { EnquiryFormValues, SentEnquiryView } from '../../../core/api/enquiries.models';
import { EnquiryDraftStore } from '../../../core/enquiry/enquiry-draft-store';
import { RESUME_PARAM, RESUME_VALUE, type EnquiryTarget } from '../../../core/enquiry/enquiry-launcher';
import { count, shortDate, torontoToday } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { Session } from '../../../core/session/session';
import { EMPTY_VALUES, FIELDS, MESSAGE_MAX, areaWarning, dateRange, enquiryErrors, guestsWarning, serverErrors, type Field, type FieldErrors } from './enquiry-rules';

/** What the launcher opens the form with. */
export interface EnquiryFormRequest {
  caterer: EnquiryTarget;
  /** The "Send an enquiry" button, for focus to return to (L2-067.4). */
  trigger: HTMLElement | null;
}

type Mode = 'form' | 'sent';

/**
 * "Send an enquiry" (docs/detailed-designs/enquiries/send-enquiry,
 * `EnquiryFormDialog`; docs/mocks/dialogs/enquiry, every state).
 */
@Component({
  selector: 'app-enquiry-form-dialog',
  imports: [RouterLink, Button, Description, DescriptionList, Dialog, EmptyState, FormField, FormSummary, Icon, Select, TextField, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enquiry-form-dialog.html',
})
export class EnquiryFormDialog {
  readonly request = input.required<EnquiryFormRequest>();
  readonly closed = output<void>();

  private readonly api = inject(EnquiriesApi);
  private readonly discovery = inject(DiscoveryApi);
  private readonly challenge = inject(BotChallenge);
  private readonly injector = inject(Injector);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly drafts = inject(EnquiryDraftStore);

  protected readonly caterer = computed(() => this.request().caterer);
  protected readonly mode = signal<Mode>('form');
  protected readonly values = signal<EnquiryFormValues>(EMPTY_VALUES);
  protected readonly errors = signal<FieldErrors>({});
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly sent = signal<SentEnquiryView | null>(null);

  protected readonly range = dateRange(torontoToday());

  private readonly areas = toSignal(this.discovery.serviceAreas().pipe(catchError(() => of([]))), { initialValue: [] });
  protected readonly areaGroups = computed<SelectGroup[]>(() => {
    const groups: SelectGroup[] = [];
    for (const a of this.areas()) {
      let group = groups.find((g) => g.label === a.regionName);
      if (!group) groups.push((group = { label: a.regionName, options: [] }));
      group.options.push({ value: a.id, label: a.name });
    }
    return groups;
  });
  protected readonly occasions = toSignal(
    this.discovery.occasions().pipe(
      map((list) => list.map<SelectOption>((o) => ({ value: o.id, label: o.name }))),
      catchError(() => of([] as SelectOption[])),
    ),
    { initialValue: [] as SelectOption[] },
  );

  protected readonly recipient = computed(() => $localize`:@@enquiryForm.to:to ${this.caterer().name}:name:`);
  protected readonly guestsHelp = computed(() => {
    const c = this.caterer();
    return $localize`:@@enquiryForm.guestsHelp:${c.name}:name: serves ${c.minGuests}:min:–${c.maxGuests}:max:`;
  });
  protected readonly privacyNote = computed(() => $localize`:@@enquiryForm.privacy:${this.caterer().name}:name: sees your name, not your email or phone.`);
  protected readonly guestsWarning = computed(() => guestsWarning(this.values().guests, this.caterer()));
  protected readonly areaWarning = computed(() => {
    const id = this.values().area;
    const name = id ? (this.areas().find((a) => a.id === id)?.name ?? null) : null;
    return areaWarning(name, this.caterer());
  });

  private readonly length = computed(() => graphemeLength(this.values().message));
  protected readonly counter = computed(() => `${count(this.length())} / ${count(MESSAGE_MAX)}`);
  protected readonly over = computed(() => this.length() > MESSAGE_MAX);
  protected readonly overBy = computed(() => $localize`:@@enquiryForm.overBy:${count(this.length() - MESSAGE_MAX)}:count: characters too many`);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return FIELDS.filter((f) => e[f]).map((f) => ({ controlId: f, message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@enquiryForm.action:send your enquiry`));

  protected readonly sentTitle = computed(() => $localize`:@@enquiryForm.sentTitle:Enquiry sent to ${this.sent()?.caterer.name ?? ''}:name:`);
  protected readonly sentText = computed(() => {
    const s = this.sent();
    if (!s) return '';
    return s.emailQueued
      ? $localize`:@@enquiryForm.sentQueued:${s.contactName}:name: gets an email as soon as our mail service catches up. We’ll email you when they reply, and the conversation lives in your inbox.`
      : $localize`:@@enquiryForm.sentText:${s.contactName}:name: gets an email now. We’ll email you when they reply, and the conversation lives in your inbox.`;
  });
  protected readonly sentDate = computed(() => (this.sent() ? shortDate(this.sent()!.eventDate) : ''));
  protected readonly backLabel = computed(() => $localize`:@@enquiryForm.back:Back to ${this.caterer().name}:name:`);

  protected readonly cancelText = $localize`:@@common.cancel:Cancel`;
  protected readonly sendingText = $localize`:@@enquiryForm.sending:Sending your enquiry`;

  private readonly inboxLink = viewChild<ElementRef<HTMLElement>>('inboxLink');

  protected set(field: keyof EnquiryFormValues, value: string): void {
    this.values.update((v) => ({ ...v, [field]: value }));
    const control: Field = field === 'eventDate' ? 'date' : field === 'postalCode' ? 'postal' : field;
    // A field's error clears as it is fixed; the summary waits for the next send (form-layout CRD, "Fixing").
    if (this.errors()[control]) this.errors.update((e) => ({ ...e, [control]: undefined }));
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const values = this.values();
    const errors = enquiryErrors(values, torontoToday());
    this.errors.set(errors);
    if (Object.keys(errors).length) {
      this.attempt.update((n) => n + 1);
      return;
    }
    if (!this.session.user()) {
      this.signInFirst(values);
      return;
    }
    this.busy.set(true);
    try {
      const challengeToken = await this.challenge.token();
      const sent = await firstValueFrom(this.api.send({ ...values, catererSlug: this.caterer().slug, challengeToken }));
      this.sent.set(sent);
      this.mode.set('sent');
      afterNextRender(() => this.inboxLink()?.nativeElement.focus(), { injector: this.injector });
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        // The server checks every field again (L2-022.6); its errors show like the form's own.
        this.errors.set(serverErrors(problem.errors));
        this.attempt.update((n) => n + 1);
      }
    } finally {
      this.busy.set(false);
    }
  }

  /** A visitor signs in or registers first; what they typed comes back with them (L2-013.3, L2-023.1). */
  private signInFirst(values: EnquiryFormValues): void {
    const { slug, name, photo } = this.caterer();
    this.drafts.save({ caterer: { slug, name, photo }, values });
    const returnUrl = `/caterers/${encodeURIComponent(slug)}?${RESUME_PARAM}=${RESUME_VALUE}`;
    void this.router.navigate(['/sign-in'], { queryParams: { returnUrl } });
  }

  protected close(): void {
    this.closed.emit();
  }
}
