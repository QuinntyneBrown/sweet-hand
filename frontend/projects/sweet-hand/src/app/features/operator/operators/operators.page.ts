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
  template: `
    <div class="page-intro" [attr.aria-busy]="loading() ? 'true' : null">
      <div class="page-intro__row">
        <div>
          <h1 id="operators-title" tabindex="-1" i18n="@@operators.title">Operators</h1>
          @if (loading()) {
            <p class="subtitle"><span class="skeleton skeleton--text" style="width: 60%" aria-hidden="true"></span></p>
          } @else if (forbidden()) {
            <p class="subtitle" i18n="@@operators.adminsOnly">Admins only</p>
          } @else if (accounts()) {
            <p class="subtitle">{{ subtitle() }}</p>
          } @else {
            <p class="subtitle" i18n="@@operators.subtitlePlain">Two-step verification for everyone</p>
          }
        </div>
        @if (loading()) {
          <span class="skeleton skeleton--rect skeleton--pill" style="width: var(--space-32); height: var(--control-height-md)" aria-hidden="true"></span>
        } @else if (accounts()) {
          <sh-button variant="primary" haspopup="dialog" (activated)="openAdd($event)" i18n="@@operators.add">Add operator</sh-button>
        }
      </div>
    </div>
    @if (forbidden()) {
      <sh-empty-state heading="Only Admins can manage operators" i18n-heading="@@operators.forbiddenTitle" [text]="forbiddenText()">
        <svg slot="icon" shIcon="lock"></svg>
        <a slot="actions" class="btn btn--primary" routerLink="/admin/queue" i18n="@@operator.backToQueue">Back to review queue</a>
      </sh-empty-state>
    } @else if (failure(); as f) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load the operator list"
        i18n-heading="@@operators.errorTitle"
        text="No accounts were changed. Try again, or check the audit log for recent operator changes."
        i18n-text="@@operators.errorText"
        [reference]="f.reference"
        referenceLabel="Reference"
        i18n-referenceLabel="@@common.reference"
      >
        <svg slot="icon" shIcon="danger"></svg>
        <ng-container slot="actions">
          <button class="btn btn--primary" type="button" (click)="load()"><svg shIcon="refresh"></svg><ng-container i18n="@@common.tryAgain">Try again</ng-container></button>
          <a class="btn btn--ghost" routerLink="/admin/queue" i18n="@@operator.backToQueue">Back to review queue</a>
        </ng-container>
      </sh-empty-state>
    } @else {
      <sh-list
        family="settings"
        label="Operators"
        i18n-label="@@operators.listLabel"
        [busy]="loading()"
        busyLabel="Loading operators"
        i18n-busyLabel="@@operators.loading"
        [skeletonCount]="2"
        [skeletonAvatar]="true"
      >
        @for (a of rows(); track a.id) {
          <li sh-admin-row [title]="a.name" [meta]="a.meta" [initials]="a.initials">
            @if (a.self) {
              <span slot="badge" class="badge" i18n="@@operators.you">You</span>
            } @else if (a.status === 'Invited') {
              <span slot="badge" class="badge badge--info" i18n="@@operators.invited">Invited</span>
            }
            @if (!a.self && a.status !== 'Deactivated') {
              <sh-button slot="actions" variant="ghost" size="sm" haspopup="dialog" [ariaLabel]="a.deactivateLabel" (activated)="openDeactivate(a, $event)" i18n="@@operators.deactivate"
                >Deactivate</sh-button
              >
            }
          </li>
        }
      </sh-list>
      @if (!loading()) {
        <p class="text-caption" style="margin-top: var(--space-6)">
          <ng-container i18n="@@operators.note">Operators can’t sign up themselves. Every change here is written to the <a routerLink="/admin/audit">audit log</a>.</ng-container>
        </p>
      }
    }
    <app-add-operator-dialog [open]="adding()" [returnFocus]="opener()" (closed)="adding.set(false)" (added)="added($event)" />
    <app-deactivate-operator-dialog [open]="deactivateOpen()" [account]="deactivating()" [returnFocus]="opener()" (closed)="deactivateOpen.set(false)" (deactivated)="deactivated($event)" />
  `,
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
