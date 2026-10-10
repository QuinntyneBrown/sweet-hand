import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Icon, List, ListItem, PrivateNote } from '@sweet-hand/components';
import { AccountApi } from '../../core/api/account-api';
import type { AccountView, ActiveSession } from '../../core/api/account.models';
import { shortDate } from '../../core/format/format';
import { problemOf, reference } from '../../core/forms/problem';
import { Session } from '../../core/session/session';
import { initials, memberLine, orderSessions, sessionMeta } from './account-view';

/** Account settings, /account (docs/mocks/pages/account; manage-sessions, export and delete-account designs). */
@Component({
  selector: 'app-account-page',
  imports: [RouterLink, Icon, List, ListItem, PrivateNote],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account.page.html',
  styleUrl: './account.page.css',
})
export class AccountPage {
  private readonly api = inject(AccountApi);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  protected readonly account = signal<AccountView | null>(null);
  protected readonly sessions = signal<ActiveSession[] | null>(null);
  protected readonly loadFailed = signal<{ reference: string | null } | null>(null);

  protected readonly initials = computed(() => initials(this.account()?.displayName ?? ''));
  protected readonly memberLine = computed(() => {
    const a = this.account();
    return a ? memberLine(a) : '';
  });
  protected readonly isCaterer = computed(() => this.account()?.role === 'Caterer');
  protected readonly devices = computed(() => orderSessions(this.sessions() ?? []).map((s) => ({ ...s, meta: sessionMeta(s) })));
  protected readonly passwordChanged = computed(() => {
    const a = this.account();
    return a ? $localize`:@@account.passwordChanged:Last changed ${shortDate(a.passwordChangedAt)}:date:` : '';
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
    } catch (error) {
      this.loadFailed.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl('/sign-in');
  }
}
