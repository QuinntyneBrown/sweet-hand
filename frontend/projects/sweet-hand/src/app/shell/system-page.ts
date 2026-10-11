import { ChangeDetectionStrategy, Component, DOCUMENT, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ErrorPage, Icon } from '@sweet-hand/components';
import { longDate, time } from '../core/format/format';
import type { SystemPageKind } from './system-page-kind';

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
  templateUrl: './system-page.html',
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
