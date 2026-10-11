import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { LaunchRole } from '@sweet-hand/api';
import { emptyLaunchForm, type LaunchFormValues } from './launch-form';

/** The sign-up form inside the launch page's sign-up panel (join-launch-list design). */
@Component({
  selector: 'launch-sign-up-form',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './launch-sign-up-form.html',
})
export class LaunchSignUpForm {
  protected readonly values = signal<LaunchFormValues>(emptyLaunchForm());

  chooseRole(role: LaunchRole): void {
    this.values.update((v) => ({ ...v, role }));
  }

  protected setEmail(email: string): void {
    this.values.update((v) => ({ ...v, email }));
  }

  protected setBusinessName(businessName: string): void {
    this.values.update((v) => ({ ...v, businessName }));
  }

  protected setConsent(consent: boolean): void {
    this.values.update((v) => ({ ...v, consent }));
  }

  protected submit(event: Event): void {
    event.preventDefault();
  }
}
