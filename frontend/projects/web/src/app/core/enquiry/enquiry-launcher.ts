import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '../session/session';

/** The caterer an enquiry is for. */
export interface EnquiryTarget {
  slug: string;
  name: string;
}

/**
 * Starts an enquiry from a "Send an enquiry" button (L2-013.3, L2-015.4).
 * Pages depend on this contract; the enquiries area provides the form.
 * `trigger` is the button, so the form can return focus to it (L2-067.4).
 */
@Injectable({ providedIn: 'root', useFactory: () => new SignInFirstEnquiryLauncher() })
export abstract class EnquiryLauncher {
  abstract open(caterer: EnquiryTarget, trigger: HTMLElement): void;
}

/**
 * Until the enquiry form exists: a visitor is sent to sign in and comes back
 * to the caterer's page afterwards (L2-013.3); a signed-in person sees nothing yet.
 */
export class SignInFirstEnquiryLauncher extends EnquiryLauncher {
  private readonly router = inject(Router);
  private readonly session = inject(Session);

  open(caterer: EnquiryTarget, trigger: HTMLElement): void {
    void trigger;
    if (!this.session.user()) {
      void this.router.navigate(['/sign-in'], { queryParams: { returnUrl: `/caterers/${caterer.slug}` } });
    }
  }
}
