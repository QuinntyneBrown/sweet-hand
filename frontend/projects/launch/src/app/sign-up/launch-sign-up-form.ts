import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, Injector, output, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { BotChallengeService, LaunchListService, type LaunchRole } from '@sweet-hand/api';
import { LAUNCH_FIELDS, emptyLaunchForm, failureReference, fieldFixed, fromServerErrors, toRequest, validateLaunchForm, type LaunchField, type LaunchFormErrors, type LaunchFormValues } from './launch-form';

/** No answer within 15 seconds counts as a failure (L2-097.3). */
const SEND_TIMEOUT_MS = 15_000;

/** The sign-up form inside the launch page's sign-up panel (join-launch-list design). */
@Component({
  selector: 'launch-sign-up-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './launch-sign-up-form.html',
})
export class LaunchSignUpForm {
  /** The address a sign-up was accepted for; the page shows "Check your email". */
  readonly accepted = output<string>();

  private readonly launchList = inject(LaunchListService);
  private readonly challenge = inject(BotChallengeService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly values = signal<LaunchFormValues>(emptyLaunchForm());
  protected readonly state = signal<'editing' | 'sending' | 'failed'>('editing');
  /** Inline messages; a fixed field loses its message at once (L2-096.4). */
  protected readonly errors = signal<LaunchFormErrors>({});
  /** The summary's items as of the last submit; it updates on the next one (L2-096.4). */
  protected readonly summary = signal<{ target: string; message: string }[]>([]);
  protected readonly reference = signal('');
  protected readonly sending = computed(() => this.state() === 'sending');

  chooseRole(role: LaunchRole): void {
    this.update({ role });
  }

  protected setEmail(email: string): void {
    this.update({ email });
  }

  protected setBusinessName(businessName: string): void {
    this.update({ businessName });
  }

  protected setConsent(consent: boolean): void {
    this.update({ consent });
  }

  protected describedBy(field: LaunchField, ...others: string[]): string | null {
    return [this.errors()[field] ? `${field}-error` : null, ...others].filter(Boolean).join(' ') || null;
  }

  protected focusField(event: Event, target: string): void {
    event.preventDefault();
    this.document.getElementById(target)?.focus();
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.sending()) return;
    const values = this.values();
    const errors = validateLaunchForm(values);
    if (Object.keys(errors).length) return this.showErrors(errors);
    this.errors.set({});
    this.summary.set([]);
    this.state.set('sending');
    try {
      const token = await this.challenge.token('launch-sign-up');
      await firstValueFrom(this.launchList.signUp(toRequest(values, token)).pipe(timeout(SEND_TIMEOUT_MS)));
      this.state.set('editing');
      this.accepted.emit(values.email.trim());
    } catch (err) {
      const fieldErrors = err instanceof HttpErrorResponse && err.status === 400 ? fromServerErrors(err.error?.errors) : {};
      if (Object.keys(fieldErrors).length) {
        this.state.set('editing');
        return this.showErrors(fieldErrors);
      }
      // 5xx, 429, network failures, timeouts and refusals with no field to point at keep the details (L2-097.3, L2-097.5).
      this.reference.set(failureReference(err instanceof HttpErrorResponse ? err.headers.get('x-correlation-id') : null));
      this.state.set('failed');
    }
  }

  private update(change: Partial<LaunchFormValues>): void {
    if (this.sending()) return;
    const values = { ...this.values(), ...change };
    this.values.set(values);
    const errors = { ...this.errors() };
    for (const field of Object.keys(errors) as LaunchField[]) if (fieldFixed(field, values)) delete errors[field];
    this.errors.set(errors);
  }

  private showErrors(errors: LaunchFormErrors): void {
    this.errors.set(errors);
    this.summary.set(LAUNCH_FIELDS.filter((f) => errors[f.field]).map((f) => ({ target: f.target, message: errors[f.field]! })));
    this.state.set('editing');
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('#error-summary')?.focus(), { injector: this.injector });
  }
}
