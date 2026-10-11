import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { LaunchSignUpForm } from '../sign-up/launch-sign-up-form';
import { NotifyScroller } from './notify-scroller';

type Panel = { kind: 'form' } | { kind: 'success'; email: string };

/**
 * The launch page (serve-launch-site design): hero, the sign-up panel,
 * "How it works" and the caterer call-out. The panel holds the form or a
 * result in its place.
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
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly form = viewChild(LaunchSignUpForm);

  protected readonly panel = signal<Panel>({ kind: 'form' });
  protected readonly successEmail = computed(() => {
    const panel = this.panel();
    return panel.kind === 'success' ? panel.email : '';
  });

  /** "Join as a caterer": the form starts as a caterer, keeping anything typed (L2-094.2, L2-094.3). */
  protected joinAsCaterer(event: Event): void {
    event.preventDefault();
    this.form()?.chooseRole('caterer');
    this.scroller.scrollToNotify();
  }

  /** "Check your email", the same whatever the address's history; focus moves to it (L2-098.1). */
  protected accepted(email: string): void {
    this.panel.set({ kind: 'success', email });
    this.focusAfterRender('#notify-result');
  }

  /** "Use a different address": an empty form, focus on its heading (L2-098.3). */
  protected startOver(event: Event): void {
    event.preventDefault();
    this.panel.set({ kind: 'form' });
    this.focusAfterRender('#notify-title');
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}
