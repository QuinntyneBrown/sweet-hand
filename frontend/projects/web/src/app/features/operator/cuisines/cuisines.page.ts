import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminRow, Button, EmptyState, Icon, List } from '@sweet-hand/components';
import { OperatorSettingsApi } from '../../../core/api/operator-settings-api';
import type { OperatorCuisine } from '../../../core/api/operator-settings.models';
import { problemOf, reference } from '../../../core/forms/problem';
import { cuisineMeta, cuisinesSubtitle, isNew } from './cuisines-view';

/** The cuisine catalogue, /admin/cuisines (docs/mocks/pages/admin-cuisines; manage-cuisine-list, L2-007). */
@Component({
  selector: 'app-cuisines-page',
  imports: [RouterLink, AdminRow, Button, EmptyState, Icon, List],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro" [attr.aria-busy]="loading() ? 'true' : null">
      <div class="page-intro__row">
        <div>
          <h1 i18n="@@cuisines.title">Cuisines</h1>
          @if (loading()) {
            <p class="subtitle"><span class="skeleton skeleton--text" style="width: 60%" aria-hidden="true"></span></p>
          } @else if (cuisines()) {
            <p class="subtitle">{{ subtitle() }}</p>
          } @else {
            <p class="subtitle" i18n="@@cuisines.subtitlePlain">Shown in filters and caterer profiles</p>
          }
        </div>
        @if (loading()) {
          <span class="skeleton skeleton--rect skeleton--pill" style="width: var(--space-32); height: var(--control-height-md)" aria-hidden="true"></span>
        } @else if (cuisines()) {
          <sh-button variant="primary" haspopup="dialog" (activated)="openAdd($event)" i18n="@@cuisines.add">Add cuisine</sh-button>
        }
      </div>
    </div>
    @if (failure(); as f) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load the cuisine list"
        i18n-heading="@@cuisines.errorTitle"
        text="Nothing has changed: filters and caterer profiles still show the current list. Try again in a moment."
        i18n-text="@@cuisines.errorText"
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
      <sh-list family="settings" label="Cuisines, A to Z" i18n-label="@@cuisines.listLabel" [busy]="loading()" busyLabel="Loading cuisines" i18n-busyLabel="@@cuisines.loading" [skeletonCount]="10">
        @for (c of rows(); track c.id) {
          <li sh-admin-row [title]="c.name" [meta]="c.meta">
            @if (c.isNew) {
              <span slot="badge" class="badge badge--info" i18n="@@cuisines.new">New</span>
            }
            @if (!c.retired) {
              <sh-button slot="actions" variant="ghost" size="sm" haspopup="dialog" [ariaLabel]="c.retireLabel" (activated)="openRetire(c, $event)" i18n="@@cuisines.retire">Retire</sh-button>
            }
          </li>
        }
      </sh-list>
      @if (!loading()) {
        <p class="text-caption" style="margin-top: var(--space-6)" i18n="@@cuisines.note">Retired cuisines leave the filter and new profile choices. Caterers who already use one keep it on their page.</p>
      }
    }
  `,
})
export class CuisinesPage {
  private readonly api = inject(OperatorSettingsApi);

  protected readonly cuisines = signal<OperatorCuisine[] | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly loading = computed(() => !this.cuisines() && !this.failure());
  protected readonly subtitle = computed(() => cuisinesSubtitle(this.cuisines() ?? []));
  protected readonly rows = computed(() =>
    (this.cuisines() ?? []).map((c) => ({
      ...c,
      meta: cuisineMeta(c),
      isNew: isNew(c),
      retireLabel: $localize`:@@cuisines.retireNamed:Retire ${c.name}:name:`,
    })),
  );

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.failure.set(null);
    this.cuisines.set(null);
    try {
      this.cuisines.set(await firstValueFrom(this.api.cuisines()));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected openAdd(event: MouseEvent): void {
    void event;
  }

  protected openRetire(cuisine: OperatorCuisine, event: MouseEvent): void {
    void cuisine;
    void event;
  }
}
