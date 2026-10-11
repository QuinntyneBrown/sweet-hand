import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The privacy notice, /privacy (docs/mocks/pages/privacy): what is collected
 * and why, who sees it, cookies, retention and the privacy officer's address
 * (L2-070.1, L2-073, L2-074.1, L2-075.3).
 */
@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy.page.html',
})
export class PrivacyPage {}
