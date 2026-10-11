import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonAnchor } from '@sweet-hand/components';

/** About, /about: why Sweet Hand exists (docs/mocks/pages/about). */
@Component({
  selector: 'app-about-page',
  imports: [ButtonAnchor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.page.html',
})
export class AboutPage {}
