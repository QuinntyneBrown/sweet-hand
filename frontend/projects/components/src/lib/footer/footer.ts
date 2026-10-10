import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FooterLink {
  label: string;
  href: string;
  current?: boolean;
}

/** The site footer (docs/specs/components/footer.md): a wordmark, one line and a few links. */
@Component({
  selector: 'sh-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ':host { display: contents; }',
  template: `
    <footer class="site-footer">
      <div class="site-footer__brand"><strong>{{ brandName() }}</strong><span>{{ line() }}</span></div>
      <nav [attr.aria-label]="label()">
        <ul>
          @for (link of links(); track link.href) {
            <li><a [routerLink]="link.href" [attr.aria-current]="link.current ? 'page' : null">{{ link.label }}</a></li>
          }
        </ul>
      </nav>
    </footer>
  `,
})
export class Footer {
  readonly brandName = input.required<string>();
  readonly line = input.required<string>();
  readonly label = input.required<string>();
  readonly links = input.required<FooterLink[]>();
}
