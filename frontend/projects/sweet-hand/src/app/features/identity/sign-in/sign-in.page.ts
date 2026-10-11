import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Checkbox, FormField, FormSummary, LabelAction, TextField, Well, type SummaryItem } from '@sweet-hand/components';
import { time } from '../../../core/format/format';
import { EnquiryDraftStore } from '../../../core/enquiry/enquiry-draft-store';
import { problemOf, reference } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { landingFor, safeReturnUrl } from '../../../core/session/guards';
import { Session } from '../../../core/session/session';
import { AuthPhotos } from '../auth-photos';
import { BOT_CHALLENGE_SERVICE, IDENTITY_SERVICE, SignInLocked, SignInRequest } from '@sweet-hand/api';

type Failure = { kind: 'server'; reference: string | null } | { kind: 'locked'; until: string } | null;
interface Errors {
  email: string | null;
  password: string | null;
  human: string | null;
}
const NO_ERRORS: Errors = { email: null, password: null, human: null };

/** Sign in, /sign-in (docs/detailed-designs/identity-and-security/sign-in). */
@Component({
  selector: 'app-sign-in-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, AuthPhotos, Button, Checkbox, FormField, FormSummary, LabelAction, TextField, Well],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sign-in.page.html',
})
export class SignInPage {
  private readonly api = inject(IDENTITY_SERVICE);
  private readonly bots = inject(BOT_CHALLENGE_SERVICE);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly drafts = inject(EnquiryDraftStore);

  readonly returnUrl = input<string>();

  /** Sent here from the enquiry form: the caterer and the saved enquiry are named (docs/mocks/pages/sign-in/return.html). */
  protected readonly returning = computed(() => this.drafts.forReturnUrl(this.returnUrl()));
  protected readonly returnSubtitle = computed(
    () =>
      $localize`:@@signIn.returnSubtitle:Your enquiry to ${this.returning()?.caterer.name ?? ''}:name: is saved. Sign in, or create a free account, and we’ll take you straight back to it.`,
  );

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    human: new FormControl(false, { nonNullable: true }),
  });
  protected readonly errors = signal<Errors>(NO_ERRORS);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly revealed = signal(false);
  protected readonly failure = signal<Failure>(null);
  /** Too many failed sign-ins from this network: the person confirms they are one first (L2-076.5). */
  protected readonly challenge = signal(false);
  protected readonly signingIn = $localize`:@@signIn.busy:Signing in`;
  private readonly alert = viewChild(Alert);
  private unlockTimer: ReturnType<typeof setTimeout> | undefined;

  /** Sign-in is paused for the account (L2-076.4): the form stays read-only until the time given. */
  protected readonly locked = computed(() => this.failure()?.kind === 'locked');
  /** An operator signed out after 30 idle minutes (L2-078.3). */
  protected readonly expired = this.session.expired;
  protected readonly photos = computed(() => (this.expired() ? ['cook-up', 'pimento-and-thyme', 'ti-kay'] : ['pelau-house', 'ti-kay', 'black-cake-co']));

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.unlockTimer));
    const expired = this.session.expired();
    if (expired) this.form.controls.email.setValue(expired.email);
  }

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    const items: SummaryItem[] = [];
    if (e.email) items.push({ controlId: 'email', message: e.email });
    if (e.password) items.push({ controlId: 'password', message: e.password });
    if (e.human) items.push({ controlId: 'human', message: e.human });
    return items;
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@signIn.action:sign in`));

  protected async submit(): Promise<void> {
    if (this.busy() || this.locked()) return;
    const { email, password, human } = this.form.getRawValue();
    const errors: Errors = {
      email: emailError(email),
      password: password ? null : $localize`:@@signIn.passwordRequired:Enter your password`,
      human: this.challenge() && !human ? $localize`:@@signIn.humanRequired:Tick the box to show you’re a person` : null,
    };
    this.failure.set(null);
    this.errors.set(errors);
    if (errors.email || errors.password || errors.human) {
      this.attempt.update((n) => n + 1);
      return;
    }

    this.busy.set(true);
    try {
      const request: SignInRequest = { email: email.trim(), password };
      if (this.challenge()) request.challengeToken = await this.bots.token('sign-in');
      const result = await firstValueFrom(this.api.signIn(request));
      await this.session.refresh();
      const user = this.session.user();
      if (result.secondFactorRequired) {
        await this.router.navigate(['/sign-in/verify'], { queryParams: { returnUrl: safeReturnUrl(this.returnUrl()) } });
      } else if (result.privacyUpdateRequired) {
        await this.router.navigate(['/privacy/accept'], { queryParams: { returnUrl: safeReturnUrl(this.returnUrl()) } });
      } else {
        await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()) ?? landingFor(user?.role ?? 'Customer'));
      }
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 423) {
        this.pause((problem as Partial<SignInLocked>).lockedUntil ?? new Date().toISOString());
      } else if (status === 400 && problem['challengeRequired']) {
        // Nothing was checked yet: the password stays so the person only ticks the box (L2-082.2).
        this.challenge.set(true);
        this.form.controls.human.setValue(false);
      } else if (status === 401 || status === 400) {
        // The same message whatever was wrong, so the form never reveals who has an account (L2-076.3).
        this.form.controls.password.setValue('');
        this.form.controls.human.setValue(false);
        this.errors.set({ ...NO_ERRORS, password: $localize`:@@signIn.incorrect:Email or password is incorrect` });
        this.attempt.update((n) => n + 1);
      } else {
        this.failure.set({ kind: 'server', reference: reference(problem) });
        queueMicrotask(() => this.alert()?.focusTitle());
      }
    } finally {
      this.busy.set(false);
    }
  }

  private pause(until: string): void {
    this.form.controls.password.setValue('');
    this.errors.set(NO_ERRORS);
    this.failure.set({ kind: 'locked', until });
    clearTimeout(this.unlockTimer);
    this.unlockTimer = setTimeout(() => this.failure.set(null), Math.max(0, Date.parse(until) - Date.now()));
  }

  protected lockedText(until: string): string {
    return $localize`:@@signIn.lockedText:After 5 attempts that didn’t match, we pause sign-in for 15 minutes to keep the account safe. Try again at ${time(until)}:time: We’ve emailed the account owner.`;
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@signIn.serverErrorRef:Something went wrong on our side. Your email is still here; try again in a moment. Reference ${ref}:reference:.`
      : $localize`:@@signIn.serverError:Something went wrong on our side. Your email is still here; try again in a moment.`;
  }
}
