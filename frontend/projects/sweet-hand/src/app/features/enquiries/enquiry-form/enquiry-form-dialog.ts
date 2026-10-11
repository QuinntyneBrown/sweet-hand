import { ChangeDetectionStrategy, Component, ElementRef, Injector, type OnInit, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import {
  Alert,
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
  ToastNotifier,
  graphemeLength,
  type SelectGroup,
  type SelectOption,
  type SummaryItem,
} from '@sweet-hand/components';
import { EnquiryDraftStore } from '../../../core/enquiry/enquiry-draft-store';
import { RESUME_PARAM, RESUME_VALUE } from '../../../core/enquiry/enquiry-launcher';
import { count, shortDate, torontoToday } from '../../../core/format/format';
import { reference, type Problem } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { Session } from '../../../core/session/session';
import { areaWarning, dateRange, EMPTY_VALUES, enquiryErrors, type Field, FIELDS, guestsWarning, MESSAGE_MAX, serverErrors } from './enquiry-rules';
import type { FieldErrors } from './field-errors';
import { BotChallengeService, DiscoveryService, EnquiriesService, type EnquiryFormValues, type EnquiryRefusal, type SentEnquiryView } from '@sweet-hand/api';
import type { EnquiryFormRequest } from './enquiry-form-request';
import type { Mode } from './mode';
import type { Notice } from './notice';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { paths } from '../../../core/routing/paths';

/**
 * "Send an enquiry" (docs/detailed-designs/enquiries/send-enquiry,
 * `EnquiryFormDialog`; docs/mocks/dialogs/enquiry, every state).
 */
@Component({
  selector: 'app-enquiry-form-dialog',
  imports: [RouterLink, Alert, Button, Description, DescriptionList, Dialog, EmptyState, FormField, FormSummary, Icon, Select, TextField, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './enquiry-form-dialog.html',
})
export class EnquiryFormDialog implements OnInit {
  protected readonly paths = paths;
  readonly request = input.required<EnquiryFormRequest>();
  readonly closed = output<void>();

  private readonly api = inject(EnquiriesService);
  private readonly discovery = inject(DiscoveryService);
  private readonly challenge = inject(BotChallengeService);
  private readonly injector = inject(Injector);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly drafts = inject(EnquiryDraftStore);
  private readonly toasts = inject(ToastNotifier);

  protected readonly caterer = computed(() => this.request().caterer);
  protected readonly mode = signal<Mode>('form');
  protected readonly values = signal<EnquiryFormValues>(EMPTY_VALUES);
  /** The dialog exists only while it is open. */
  protected readonly state = new FormDialogState<FieldErrors>(signal(true), { noErrors: {} });
  /** What the summary lists: the errors of the last send, until the next one (form-layout CRD, "Fixing"). */
  private readonly reported = signal<FieldErrors>({});
  protected readonly notice = signal<Notice | null>(null);
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
    const e = this.reported();
    return FIELDS.filter((f) => e[f]).map((f) => ({ controlId: f, message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@enquiryForm.action:send your enquiry`));

  /** Limits can't be lifted by trying again now (docs/mocks/dialogs/enquiry/limit). */
  protected readonly limited = computed(() => this.notice()?.kind === 'limit');
  /** The send failed on our side: the button offers to try again. */
  protected readonly retry = computed(() => this.notice()?.kind === 'failed');

  private readonly firstName = computed(() => (this.session.user()?.displayName ?? '').split(/\s+/)[0]);
  protected readonly welcomeTitle = computed(() => $localize`:@@enquiryForm.welcomeBack:Welcome back, ${this.firstName()}:name:`);
  protected readonly unverifiedText = computed(
    () => $localize`:@@enquiryForm.unverifiedText:We sent a link to ${this.session.user()?.email ?? ''}:email:. Your enquiry is saved for 24 hours.`,
  );
  protected readonly limitTitle = computed(() => {
    const n = this.notice();
    return n?.kind === 'limit' && n.newAccount
      ? $localize`:@@enquiryForm.newAccountLimit:New accounts can send 3 enquiries in their first hour. Try again later.`
      : $localize`:@@enquiryForm.dailyLimit:You’ve reached today’s enquiry limit. Try again tomorrow.`;
  });
  protected readonly duplicateId = computed(() => {
    const n = this.notice();
    return n?.kind === 'duplicate' ? n.enquiryId : null;
  });
  protected readonly failureReference = computed(() => {
    const n = this.notice();
    return n?.kind === 'failed' ? n.reference : null;
  });

  protected readonly wrongAccountText = computed(() => {
    const user = this.session.user();
    if (!user) return '';
    return user.role === 'Caterer'
      ? $localize`:@@enquiryForm.wrongAccountCaterer:You’re signed in as ${user.displayName}:name: for ${user.caterer?.name ?? ''}:business:. Caterer accounts can’t send enquiries to other caterers.`
      : $localize`:@@enquiryForm.wrongAccountOperator:You’re signed in as ${user.displayName}:name:, a Sweet Hand operator. Operator accounts can’t send enquiries.`;
  });
  protected readonly catererUrl = computed(() => paths.caterer(this.caterer().slug));

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
  protected readonly notSentTitle = $localize`:@@enquiryForm.failedTitle:Your enquiry wasn’t sent`;
  protected readonly duplicateTitle = $localize`:@@enquiryForm.duplicate:You already have an open enquiry with this caterer for that date`;
  protected readonly unverifiedTitle = $localize`:@@enquiryForm.unverified:Verify your email to send enquiries`;

  private readonly inboxLink = viewChild<ElementRef<HTMLElement>>('inboxLink');
  private readonly alert = viewChild(Alert);

  /** Caterer and operator accounts can't send (L2-023.4); a customer's draft comes back (L2-023.1, L2-023.3). */
  ngOnInit(): void {
    void this.start();
  }

  private async start(): Promise<void> {
    const user = this.session.user();
    if (user && user.role !== 'Customer') {
      this.mode.set('wrong-account');
      return;
    }
    const restored = this.request().restored;
    if (restored) {
      this.values.set(restored);
      if (user) {
        this.notice.set({ kind: 'restored' });
        // Delivered: from here on the server keeps the draft if one is needed.
        this.drafts.clear();
      }
      return;
    }
    if (!user) return;
    const draft = await firstValueFrom(this.api.draft(this.caterer().slug)).catch(() => null);
    // Typing started meanwhile wins over a late draft.
    if (draft && this.values() === EMPTY_VALUES) {
      this.values.set(draft.values);
      this.notice.set({ kind: 'restored' });
    }
  }

  protected set(field: keyof EnquiryFormValues, value: string): void {
    this.values.update((v) => ({ ...v, [field]: value }));
    const control: Field = field === 'eventDate' ? 'date' : field === 'postalCode' ? 'postal' : field;
    // A field's error clears as it is fixed; the summary keeps it until the next send (form-layout CRD, "Fixing").
    if (this.state.errors()[control]) this.state.errors.update((e) => ({ ...e, [control]: undefined }));
  }

  protected async submit(): Promise<void> {
    if (this.state.busy() || this.limited()) return;
    const values = this.values();
    const errors = enquiryErrors(values, torontoToday());
    this.reported.set(errors);
    if (!this.state.validate(errors)) return;
    if (!this.session.user()) {
      this.signInFirst(values);
      return;
    }
    await this.state.submit(
      async () => {
        const challengeToken = await this.challenge.token('enquiry');
        const sent = await firstValueFrom(this.api.send({ ...values, catererSlug: this.caterer().slug, challengeToken }));
        this.sent.set(sent);
        this.notice.set(null);
        this.mode.set('sent');
        afterNextRender(() => this.inboxLink()?.nativeElement.focus(), { injector: this.injector });
      },
      (status, problem) => this.refused(status, problem, values),
    );
  }

  /** Every refusal has its own notice, so none falls back to the dialog's generic failure. */
  private refused(status: number, problem: Problem, values: EnquiryFormValues): true {
    const code = problem['code'] as EnquiryRefusal | undefined;
    if (status === 400 && problem.errors) {
      // The server checks every field again (L2-022.6); its errors show like the form's own.
      this.notice.set(null);
      const errors = serverErrors(problem.errors);
      this.reported.set(errors);
      return this.state.reject(errors);
    }
    if (status === 401) {
      // Signed out meanwhile: sign in again and come back to the same values.
      this.signInFirst(values);
      return true;
    }
    if (code === 'customer-only') {
      void this.session.refresh().then(() => this.mode.set('wrong-account'));
      return true;
    }
    if (code === 'email-unverified') {
      this.notice.set({ kind: 'unverified' });
      // Kept on the server, so it is still there after verifying (L2-023.3).
      void firstValueFrom(this.api.saveDraft(this.caterer().slug, values)).catch(() => undefined);
    } else if (code === 'duplicate') {
      this.notice.set({ kind: 'duplicate', enquiryId: String(problem['enquiryId'] ?? '') });
    } else if (code === 'daily-limit' || code === 'new-account-limit') {
      this.notice.set({ kind: 'limit', newAccount: code === 'new-account-limit' });
    } else {
      this.notice.set({ kind: 'failed', reference: reference(problem) });
    }
    afterNextRender(() => this.alert()?.focusTitle(), { injector: this.injector });
    return true;
  }

  /** A visitor signs in or registers first; what they typed comes back with them (L2-013.3, L2-023.1). */
  private signInFirst(values: EnquiryFormValues): void {
    const { slug, name, photo } = this.caterer();
    this.drafts.save({ caterer: { slug, name, photo }, values });
    const returnUrl = `${paths.caterer(slug)}?${RESUME_PARAM}=${RESUME_VALUE}`;
    void this.router.navigate([paths.signIn], { queryParams: { returnUrl } });
  }

  protected async resend(): Promise<void> {
    const email = this.session.user()?.email ?? '';
    try {
      await firstValueFrom(this.api.resendVerificationEmail());
      this.toasts.show({
        tone: 'success',
        title: $localize`:@@enquiryForm.resent:Verification email sent`,
        text: $localize`:@@enquiryForm.resentText:Check ${email}:email: for the link.`,
      });
    } catch {
      this.toasts.show({
        tone: 'danger',
        title: $localize`:@@enquiryForm.resendFailed:We couldn’t send the email`,
        text: $localize`:@@enquiryForm.resendFailedText:Something went wrong on our side. Try again in a moment.`,
      });
    }
  }

  protected close(): void {
    this.closed.emit();
  }
}
