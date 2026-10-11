import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Contact details shared in a thread, as plain text (card CRD, `sh-contact-card`). */
@Component({
  selector: 'sh-contact-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './contact-card.html',
})
export class ContactCard {
  readonly heading = input.required<string>();
  readonly email = input<string | null>(null);
  readonly phone = input<string | null>(null);
}
