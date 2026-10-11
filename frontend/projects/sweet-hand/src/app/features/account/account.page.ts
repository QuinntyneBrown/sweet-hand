import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Icon, List, ListItem, PrivateNote, SideNav, ToastNotifier } from '@sweet-hand/components';
import { shortDate, time, torontoToday } from '../../core/format/format';
import { problemOf, reference } from '../../core/forms/problem';
import { Session } from '../../core/session/session';
import { initials, memberLine, orderSessions, sessionMeta } from './account-view';
import { catererNavGroups } from './caterer-nav';
import { ChangePasswordDialog } from './change-password/change-password.dialog';
import { EditDetailsDialog } from './edit-details/edit-details.dialog';
import { DeleteAccountDialog } from './delete-account/delete-account.dialog';
import { DownloadDataDialog } from './download-data/download-data.dialog';
import { EndSessionDialog } from './end-session/end-session.dialog';
import { AccountService, type AccountView, type ActiveSession } from '@sweet-hand/api';
import type { AccountDialog } from './account-dialog';
import { paths } from '../../core/routing/paths';

/** Account settings, /account (docs/mocks/pages/account; manage-sessions, export and delete-account designs). */
@Component({
  selector: 'app-account-page',
  imports: [RouterLink, Alert, ChangePasswordDialog, DeleteAccountDialog, DownloadDataDialog, EditDetailsDialog, EndSessionDialog, Icon, List, ListItem, PrivateNote, SideNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account.page.html',
  styleUrl: './account.page.css',
})
export class AccountPage {
  protected readonly paths = paths;
  private readonly api = inject(AccountService);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastNotifier);
  private readonly injector = inject(Injector);
  private readonly deviceList = viewChild(List);

  /** `?edit=details` opens the details dialog, from the bounced-email banner (L2-030.3). */
  readonly edit = input<string>();

  /** The one dialog open over the page (no inline forms: AGENTS.md). */
  protected readonly dialog = signal<AccountDialog>(null);
  protected readonly account = signal<AccountView | null>(null);
  protected readonly sessions = signal<ActiveSession[] | null>(null);
  protected readonly loadFailed = signal<{ reference: string | null } | null>(null);
  /** The device being signed out, and the button that asked. */
  protected readonly ending = signal<ActiveSession | null>(null);
  protected readonly endOpener = signal<HTMLElement | null>(null);

  protected readonly initials = computed(() => initials(this.account()?.displayName ?? ''));
  protected readonly memberLine = computed(() => {
    const a = this.account();
    return a ? memberLine(a) : '';
  });
  protected readonly isCaterer = computed(() => (this.account()?.role ?? this.session.role()) === 'Caterer');
  protected readonly catererNav = computed(() => catererNavGroups(this.session.unread()));
  protected readonly bouncingTitle = computed(() => $localize`:@@account.bouncingTitle:Emails to ${this.account()?.email ?? ''}:email: are bouncing`);
  protected readonly verifyText = computed(() => {
    const a = this.account();
    if (!a) return '';
    return a.verificationSentAt
      ? $localize`:@@account.verifySentOn:We sent a link to ${a.email}:email: on ${shortDate(a.verificationSentAt)}:date:. It works for 24 hours.`
      : $localize`:@@account.verifySent:We sent a link to ${a.email}:email:. It works for 24 hours.`;
  });
  protected readonly devices = computed(() => orderSessions(this.sessions() ?? []).map((s) => ({ ...s, meta: sessionMeta(s) })));
  protected readonly passwordChanged = computed(() => {
    const a = this.account();
    return a ? $localize`:@@account.passwordChanged:Last changed ${shortDate(a.passwordChangedAt)}:date:` : '';
  });
  protected readonly passwordChangedSentence = computed(() => {
    const a = this.account();
    return a ? $localize`:@@changePassword.lastChanged:Last changed ${shortDate(a.passwordChangedAt)}:date:.` : '';
  });
  protected readonly privacyLine = computed(() => {
    const a = this.account();
    if (!a) return '';
    const accepted = shortDate(a.privacy.acceptedAt);
    return this.isCaterer()
      ? $localize`:@@account.termsAccepted:Caterer terms and privacy notice version ${a.privacy.version}:version:, accepted ${accepted}:date:.`
      : $localize`:@@account.privacyAccepted:Privacy notice version ${a.privacy.version}:version:, accepted ${accepted}:date:.`;
  });
  protected readonly deleteText = computed(() => {
    const a = this.account();
    return a?.business
      ? $localize`:@@account.deleteTextCaterer:Takes ${a.business.name}:business: off Sweet Hand and closes your open enquiries. This can’t be undone.`
      : $localize`:@@account.deleteText:Removes your profile and reviews. Caterers keep your messages, signed “Former Sweet Hand user”. This can’t be undone.`;
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loadFailed.set(null);
    this.account.set(null);
    this.sessions.set(null);
    try {
      const [account, sessions] = await Promise.all([firstValueFrom(this.api.account()), firstValueFrom(this.api.sessions())]);
      this.account.set(account);
      this.sessions.set(sessions);
      if (this.edit() === 'details') this.dialog.set('details');
    } catch (error) {
      this.loadFailed.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected detailsSaved(event: { account: AccountView; message: string }): void {
    this.account.set(event.account);
    this.dialog.set(null);
    this.toasts.show({ tone: 'success', title: $localize`:@@editDetails.saved:Details saved`, text: event.message });
    void this.session.refresh();
  }

  /** The other sessions ended: the device list shows only this one (L2-078). */
  protected async onPasswordChanged(): Promise<void> {
    this.dialog.set(null);
    this.toasts.show({ tone: 'success', title: $localize`:@@changePassword.done:Password changed`, text: $localize`:@@changePassword.doneText:Your other devices were signed out.` });
    const [account, sessions] = await Promise.all([firstValueFrom(this.api.account()), firstValueFrom(this.api.sessions())]).catch(() => [null, null]);
    if (account) this.account.set(account);
    if (sessions) this.sessions.set(sessions);
  }

  protected exportRequested(account: AccountView): void {
    this.account.set(account);
    this.dialog.set(null);
  }

  /** "Export requested today at 10:14 a.m." */
  protected exportRequestedTitle(at: string): string {
    return torontoToday(new Date(at)) === torontoToday()
      ? $localize`:@@account.exportRequestedToday:Export requested today at ${time(at)}:time:`
      : $localize`:@@account.exportRequestedOn:Export requested ${shortDate(at)}:date:`;
  }

  /** Signed out on the server; the person lands on the listing with a confirmation (L2-072.1). */
  protected async accountDeleted(): Promise<void> {
    this.dialog.set(null);
    await this.session.refresh();
    await this.router.navigateByUrl(paths.caterers);
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@delete.done:Your account is deleted`,
      text: $localize`:@@delete.doneText:We’ve sent a confirmation email. Thank you for using Sweet Hand.`,
    });
  }

  /** The "Check your email" page sends a new link to the signed-in account (L2-023.2). */
  protected async resendVerification(): Promise<void> {
    await this.router.navigateByUrl(paths.verifyEmailSent);
  }

  protected signOutLabel(device: string): string {
    return $localize`:@@account.signOutNamed:Sign out ${device}:device:`;
  }

  protected askToEnd(session: ActiveSession, event: Event): void {
    this.ending.set(session);
    this.endOpener.set(event.currentTarget as HTMLElement);
    this.dialog.set('session');
  }

  /** The row goes; focus moves to the next row's button, or the heading (list CRD D-6). */
  protected sessionEnded(session: ActiveSession): void {
    const index = this.devices().findIndex((d) => d.id === session.id);
    this.sessions.update((all) => (all ?? []).filter((s) => s.id !== session.id));
    this.endOpener.set(null);
    this.dialog.set(null);
    this.toasts.show({ tone: 'success', title: $localize`:@@endSession.done:Device signed out`, text: $localize`:@@endSession.doneText:${session.device}:device: is signed out of Sweet Hand.` });
    afterNextRender(() => this.deviceList()?.focusItem(index), { injector: this.injector });
  }

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl(paths.signIn);
  }
}
