import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { FooterLink } from './footer-link';

/** The site footer (docs/specs/components/footer.md): a wordmark, one line and a few links. */
@Component({
  selector: 'sh-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './footer.html',
})
export class Footer {
  readonly brandName = input.required<string>();
  readonly line = input.required<string>();
  readonly label = input.required<string>();
  readonly links = input.required<FooterLink[]>();
}
