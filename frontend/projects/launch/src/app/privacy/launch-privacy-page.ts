import { ChangeDetectionStrategy, Component } from '@angular/core';
import { launchSiteConfig } from '../launch-site-config';

/**
 * The privacy notice served before launch, with its launch list section
 * (L2-103.4). No mock yet: built from the design system's text styles.
 */
@Component({
  selector: 'launch-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './launch-privacy-page.html',
})
export class LaunchPrivacyPage {
  protected readonly config = launchSiteConfig;
}
