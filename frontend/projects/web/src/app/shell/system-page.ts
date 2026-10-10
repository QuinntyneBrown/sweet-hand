import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ErrorPage, Icon } from '@sweet-hand/components';
import { longDate, time } from '../core/format/format';

export type SystemPageKind = 'not-found' | 'forbidden' | 'server-error' | 'rate-limited' | 'offline' | 'maintenance';

const PHOTOS: Record<SystemPageKind, [string, string, string]> = {
  'not-found': ['demerara-kitchen', 'ti-kay', 'sugar-dumplin'],
  forbidden: ['maracas-bay', 'cook-up', 'pimento-and-thyme'],
  'server-error': ['sunday-pot', 'pelau-house', 'scotch-bonnet-social'],
  'rate-limited': ['sugar-dumplin', 'black-cake-co', 'sorrel-and-spice'],
  offline: ['cou-cou', 'maracas-bay', 'cook-up'],
  maintenance: ['pelau-house', 'black-cake-co', 'ti-kay'],
};

/** Not found, no access, server error, rate limited, offline and maintenance pages (docs/mocks/pages). */
@Component({
  selector: 'app-system-page',
  imports: [ErrorPage, RouterLink, Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (kind()) {
      @case ('not-found') {
        <sh-error-page heading="Page not found" i18n-heading="@@system.notFound.heading" text="We couldn’t find that page. It may have moved, or the caterer may no longer be listed." i18n-text="@@system.notFound.text" code="Error 404" i18n-code="@@system.notFound.code">
          <ng-container slot="photos" *ngTemplateOutlet="photos" />
          <a slot="actions" class="btn btn--primary btn--lg" routerLink="/caterers" i18n="@@system.browseCaterers">Browse caterers</a>
        </sh-error-page>
      }
      @case ('forbidden') {
        <sh-error-page heading="No access" i18n-heading="@@system.forbidden.heading" text="Your account can’t open this page. If you think it should, ask a Sweet Hand admin." i18n-text="@@system.forbidden.text" code="Error 403" i18n-code="@@system.forbidden.code">
          <ng-container slot="photos" *ngTemplateOutlet="photos" />
          <ng-container slot="actions">
            <a class="btn btn--primary btn--lg" routerLink="/caterers" i18n="@@system.goToSweetHand">Go to Sweet Hand</a>
            <a class="btn btn--lg" routerLink="/sign-in" i18n="@@system.signInAnother">Sign in with another account</a>
          </ng-container>
        </sh-error-page>
      }
      @case ('server-error') {
        <sh-error-page
          heading="Something went wrong"
          i18n-heading="@@system.serverError.heading"
          text="That one’s on us, not you. Try again in a moment. If it keeps happening, email help@sweethand.example and quote the reference below."
          i18n-text="@@system.serverError.text"
          [reference]="ref() ?? null"
          referenceLabel="Reference"
          i18n-referenceLabel="@@system.reference"
          copyLabel="Copy"
          i18n-copyLabel="@@system.copy"
          copyAriaLabel="Copy reference"
          i18n-copyAriaLabel="@@system.copyReference"
          copiedLabel="Copied"
          i18n-copiedLabel="@@system.copied"
        >
          <ng-container slot="photos" *ngTemplateOutlet="photos" />
          <ng-container slot="actions">
            <button class="btn btn--primary btn--lg" type="button" (click)="reload()"><svg shIcon="refresh"></svg><ng-container i18n="@@system.tryAgain">Try again</ng-container></button>
            <a class="btn btn--lg" routerLink="/caterers" i18n="@@system.browseCaterers">Browse caterers</a>
          </ng-container>
        </sh-error-page>
      }
      @case ('rate-limited') {
        <sh-error-page heading="Slow down a little" i18n-heading="@@system.rateLimited.heading" text="We’ve had a lot of requests from your network in the last minute. Wait a moment, then try again." i18n-text="@@system.rateLimited.text" code="Error 429" i18n-code="@@system.rateLimited.code">
          <ng-container slot="photos" *ngTemplateOutlet="photos" />
          <button slot="actions" class="btn btn--primary btn--lg" type="button" aria-disabled="true"><svg shIcon="clock"></svg><ng-container i18n="@@system.tryAgainInMinute">Try again in 1 minute</ng-container></button>
        </sh-error-page>
      }
      @case ('offline') {
        <sh-error-page heading="You’re offline" i18n-heading="@@system.offline.heading" text="Check your connection. Caterer pages you opened recently still work; enquiries can be sent once you’re back online." i18n-text="@@system.offline.text">
          <ng-container slot="photos" *ngTemplateOutlet="photos" />
          <button slot="actions" class="btn btn--primary btn--lg" type="button" (click)="reload()"><svg shIcon="refresh"></svg><ng-container i18n="@@system.tryAgain">Try again</ng-container></button>
        </sh-error-page>
      }
      @case ('maintenance') {
        <sh-error-page heading="Back soon" i18n-heading="@@system.maintenance.heading" [text]="maintenanceText()" [code]="maintenanceWindow()">
          <ng-container slot="photos" *ngTemplateOutlet="photos" />
          <button slot="actions" class="btn btn--primary btn--lg" type="button" (click)="reload()"><svg shIcon="refresh"></svg><ng-container i18n="@@system.checkAgain">Check again</ng-container></button>
        </sh-error-page>
      }
    }
    <ng-template #photos>
      @for (file of photoFiles(); track $index) {
        <span class="photo"><img [src]="'/media/' + file + '.jpg?w=400&fm=jpeg'" alt="" [width]="$index === 1 ? 104 : 72" [height]="$index === 1 ? 104 : 72" /></span>
      }
    </ng-template>
  `,
})
export class SystemPage {
  readonly kind = input.required<SystemPageKind>();
  /** Correlation ID of the failed request (L2-089.4). */
  readonly ref = input<string>();
  /** Maintenance window from the 503 problem body. */
  readonly from = input<string>();
  readonly until = input<string>();

  protected readonly photoFiles = computed(() => PHOTOS[this.kind()]);
  protected readonly maintenanceText = computed(() => {
    const until = this.until();
    return until
      ? $localize`:@@system.maintenance.textUntil:Sweet Hand is down for planned maintenance until ${time(until)}:time: Toronto time. Your enquiries and messages are safe.`
      : $localize`:@@system.maintenance.text:Sweet Hand is down for planned maintenance. Your enquiries and messages are safe.`;
  });
  protected readonly maintenanceWindow = computed(() => {
    const from = this.from();
    const until = this.until();
    if (!from || !until) return null;
    return `${longDate(from)} · ${time(from).replace(/ [ap]\.m\.$/, '')} ${$localize`:@@system.maintenance.to:to`} ${time(until)}`;
  });

  private readonly location = inject(DOCUMENT).location;

  protected reload(): void {
    this.location.reload();
  }
}
