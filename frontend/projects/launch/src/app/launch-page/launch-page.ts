import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LaunchListService } from '@sweet-hand/api';
import { LaunchSignUpForm } from '../sign-up/launch-sign-up-form';
import { NotifyScroller } from './notify-scroller';
import { clearLaunchLink, readLaunchLink } from './launch-url-state';

type Panel = { kind: 'form' } | { kind: 'success'; email: string } | { kind: 'confirmed'; removalToken: string };
type Notice = { kind: 'link-expired' } | { kind: 'unsubscribed'; email?: string };

/**
 * The launch page (serve-launch-site design): hero, the sign-up panel,
 * "How it works" and the caterer call-out. The panel holds the form or a
 * result in its place; a notice above the page reports a token link's outcome.
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
  private readonly launchList = inject(LaunchListService);
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly form = viewChild(LaunchSignUpForm);

  protected readonly panel = signal<Panel>({ kind: 'form' });
  protected readonly notice = signal<Notice | null>(null);
  protected readonly successEmail = computed(() => {
    const panel = this.panel();
    return panel.kind === 'success' ? panel.email : '';
  });
  protected readonly removedEmail = computed(() => {
    const notice = this.notice();
    return notice?.kind === 'unsubscribed' ? notice.email : undefined;
  });

  constructor() {
    // The prerendered page never depends on the query string: token links are read after hydration.
    afterNextRender(() => this.followLink());
  }

  /** "Join as a caterer": the form starts as a caterer, keeping anything typed (L2-094.2, L2-094.3). */
  protected joinAsCaterer(event: Event): void {
    event.preventDefault();
    this.form()?.chooseRole('caterer');
    this.scroller.scrollToNotify();
  }

  /** "Check your email", the same whatever the address's history; focus moves to it (L2-098.1). */
  protected accepted(email: string): void {
    this.notice.set(null);
    this.panel.set({ kind: 'success', email });
    this.focusAfterRender('#notify-result');
  }

  /** "Use a different address": an empty form, focus on its heading (L2-098.3). */
  protected startOver(event: Event): void {
    event.preventDefault();
    this.panel.set({ kind: 'form' });
    this.focusAfterRender('#notify-title');
  }

  /** "Remove my email" on the confirmed panel: one click, no confirmation step (L2-100.1). */
  protected removeMyEmail(): void {
    const panel = this.panel();
    if (panel.kind === 'confirmed') this.remove(panel.removalToken);
  }

  private followLink(): void {
    const location = this.document.location;
    const link = readLaunchLink(location);
    if (!link) return;
    const done = () => clearLaunchLink(location, this.document.defaultView!.history);
    if (link.kind === 'confirm') {
      this.launchList.confirm(link.token).subscribe({
        next: (confirmation) => {
          this.panel.set({ kind: 'confirmed', removalToken: confirmation.removalToken });
          this.focusAfterRender('#notify-title');
          done();
        },
        // Expired, used, replaced or unknown: the page cannot tell which, and a failure looks the same (L2-099.4).
        error: () => {
          this.notice.set({ kind: 'link-expired' });
          done();
        },
      });
    } else {
      this.remove(link.token, done);
    }
  }

  private remove(token: string, done?: () => void): void {
    this.launchList.remove(token).subscribe({
      next: (removal) => {
        this.panel.set({ kind: 'form' });
        this.notice.set({ kind: 'unsubscribed', email: removal.email });
        done?.();
      },
      error: () => done?.(),
    });
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), { injector: this.injector });
  }
}
