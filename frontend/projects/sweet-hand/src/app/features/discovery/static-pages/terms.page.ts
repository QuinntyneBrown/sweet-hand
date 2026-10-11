import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { paths } from '../../../core/routing/paths';

/** Terms, /terms (docs/mocks/pages/terms). */
@Component({
  selector: 'app-terms-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './terms.page.html',
})
export class TermsPage {
  protected readonly paths = paths;
}
