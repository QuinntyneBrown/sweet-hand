import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { LaunchSignUpForm } from '../sign-up/launch-sign-up-form';
import { NotifyScroller } from './notify-scroller';

/**
 * The launch page (serve-launch-site design): hero, the sign-up panel,
 * "How it works" and the caterer call-out.
 */
@Component({
  selector: 'launch-page',
  imports: [LaunchSignUpForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './launch-page.html',
})
export class LaunchPage {
  private readonly scroller = inject(NotifyScroller);
  private readonly form = viewChild(LaunchSignUpForm);

  /** "Join as a caterer": the form starts as a caterer, keeping anything typed (L2-094.2, L2-094.3). */
  protected joinAsCaterer(event: Event): void {
    event.preventDefault();
    this.form()?.chooseRole('caterer');
    this.scroller.scrollToNotify();
  }
}
