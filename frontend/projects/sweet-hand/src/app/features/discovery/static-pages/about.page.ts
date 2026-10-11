import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonAnchor } from '@sweet-hand/components';
import { paths } from '../../../core/routing/paths';

/** About, /about: why Sweet Hand exists (docs/mocks/pages/about). */
@Component({
  selector: 'app-about-page',
  imports: [ButtonAnchor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.page.html',
})
export class AboutPage {
  protected readonly paths = paths;
}
