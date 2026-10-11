import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminRow, Button, EmptyState, Icon, List, ToastNotifier } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { adminsToAsk } from '../admin-only';
import { AddOperatorDialog } from './add-operator.dialog';
import { DeactivateOperatorDialog } from './deactivate-operator.dialog';
import { operatorMeta, operatorsSubtitle } from './operators-view';
import { type OperatorAccount, OperatorSettingsService } from '@sweet-hand/api';

/** Operator accounts, /admin/operators (docs/mocks/pages/admin-operators; OperatorAccountsPage, L2-056). */
@Component({
  selector: 'app-operators-page',
  imports: [RouterLink, AddOperatorDialog, AdminRow, Button, DeactivateOperatorDialog, EmptyState, Icon, List],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './operators.page.html',
})
export class OperatorsPage {
  private readonly api = inject(OperatorSettingsService);
  private readonly toasts = inject(ToastNotifier);

  protected readonly accounts = signal<OperatorAccount[] | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  /** The Admins to ask, when this operator is not one (L2-056.5). */
  protected readonly forbidden = signal<string[] | null>(null);
  protected readonly loading = computed(() => !this.accounts() && !this.failure() && !this.forbidden());
  protected readonly adding = signal(false);
  protected readonly deactivating = signal<OperatorAccount | null>(null);
  protected readonly deactivateOpen = signal(false);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly subtitle = computed(() => operatorsSubtitle(this.accounts() ?? []));
  protected readonly forbiddenText = computed(() => $localize`:@@operators.forbiddenText:Ask ${adminsToAsk(this.forbidden() ?? [])}:admins:, an Admin, to add or deactivate an operator.`);
  protected readonly rows = computed(() =>
    (this.accounts() ?? []).map((a) => ({ ...a, meta: operatorMeta(a), deactivateLabel: $localize`:@@operators.deactivateNamed:Deactivate ${a.name}:name:` })),
  );

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.failure.set(null);
    this.accounts.set(null);
    try {
      this.accounts.set(await firstValueFrom(this.api.operators()));
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 403) this.forbidden.set(Array.isArray(problem['admins']) ? (problem['admins'] as string[]) : []);
      else this.failure.set({ reference: reference(problem) });
    }
  }

  protected openAdd(event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.adding.set(true);
  }

  protected openDeactivate(account: OperatorAccount, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.deactivating.set(account);
    this.deactivateOpen.set(true);
  }

  protected added(account: OperatorAccount): void {
    this.adding.set(false);
    this.accounts.update((all) => [...(all ?? []), account]);
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@operators.invitationSent:Invitation sent`,
      text: $localize`:@@operators.invitationSentText:${account.name}:name: has 24 hours to accept it at ${account.email}:email:.`,
    });
  }

  protected deactivated(account: OperatorAccount): void {
    // The button that opened the dialog is gone; focus goes to the page heading (list D-6).
    this.opener.set(document.getElementById('operators-title'));
    this.deactivateOpen.set(false);
    this.accounts.update((all) => (all ?? []).map((a) => (a.id === account.id ? account : a)));
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@operators.deactivatedTitle:${account.name}:name: is deactivated`,
      text: $localize`:@@operators.deactivatedText:They’re signed out everywhere and can’t sign in again.`,
    });
  }
}
