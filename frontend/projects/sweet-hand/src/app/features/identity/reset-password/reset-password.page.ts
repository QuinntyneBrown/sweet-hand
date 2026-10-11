import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, FormField, FormSummary, LabelAction, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { Session } from '../../../core/session/session';
import { AuthPhotos } from '../auth-photos';
import { PASSWORD_MIN, newPasswordError } from '../rules';
import { IdentityService } from '@sweet-hand/api';
import type { View } from './view';
import { paths } from '../../../core/routing/paths';

/** Choose a new password from a reset link, /reset-password/:token (L2-077.2, L2-077.4). */
@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, AuthPhotos, Button, FormField, FormSummary, LabelAction, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.page.html',
})
export class ResetPasswordPage {
  protected readonly paths = paths;
  private readonly api = inject(IdentityService);
  private readonly session = inject(Session);

  readonly token = input.required<string>();

  protected readonly view = signal<View>({ kind: 'loading' });
  protected readonly form = new FormGroup({ password: new FormControl('', { nonNullable: true }) });
  protected readonly error = signal<{ field: string; summary: string } | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly revealed = signal(false);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly saving = $localize`:@@reset.busy:Saving your new password`;
  private readonly alert = viewChild(Alert);

  protected readonly email = computed(() => {
    const v = this.view();
    return v.kind === 'form' ? v.email : '';
  });

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: 'password', message: e.summary }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@reset.action:save your new password`));

  constructor() {
    effect(() => {
      const token = this.token();
      untracked(() => void this.load(token));
    });
  }

  protected async load(token = this.token()): Promise<void> {
    this.view.set({ kind: 'loading' });
    try {
      const link = await firstValueFrom(this.api.passwordReset(token));
      this.view.set({ kind: 'form', email: link.email });
    } catch (error) {
      this.view.set(problemOf(error).status === 410 ? { kind: 'expired' } : { kind: 'load-failed' });
    }
  }

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const { password } = this.form.getRawValue();
    const problem = newPasswordError(password);
    this.failure.set(null);
    this.error.set(problem ? { field: problem, summary: [...password].length < PASSWORD_MIN && password ? $localize`:@@reset.shortSummary:Use at least 12 characters` : problem } : null);
    if (problem) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.resetPassword({ token: this.token(), password }));
      // Every session of the account has ended, this one included (L2-077.4).
      await this.session.refresh();
      this.view.set({ kind: 'done' });
    } catch (error) {
      const { status, problem: body } = problemOf(error);
      if (status === 410) {
        this.view.set({ kind: 'expired' });
      } else if (status === 400 && body.errors?.['password']) {
        const common = $localize`:@@register.passwordCommon:This password is too common. Choose one that’s harder to guess, at least 12 characters.`;
        this.error.set({ field: common, summary: $localize`:@@register.passwordCommonShort:This password is too common` });
        this.attempt.update((n) => n + 1);
      } else {
        this.failure.set({ reference: reference(body) });
        queueMicrotask(() => this.alert()?.focusTitle());
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@reset.serverErrorRef:Something went wrong on our side. Your link still works for a few more minutes; try again. Reference ${ref}:reference:.`
      : $localize`:@@reset.serverError:Something went wrong on our side. Your link still works for a few more minutes; try again.`;
  }
}
