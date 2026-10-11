import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminRow, Button, EmptyState, Icon, List, ToastNotifier } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { AddCuisineDialog } from './add-cuisine.dialog';
import { cuisineMeta, cuisinesSubtitle, isNew } from './cuisines-view';
import { RetireCuisineDialog } from './retire-cuisine.dialog';
import { CuisineUsage, OPERATOR_SETTINGS_SERVICE, OperatorCuisine } from '@sweet-hand/api';

/** The cuisine catalogue, /admin/cuisines (docs/mocks/pages/admin-cuisines; manage-cuisine-list, L2-007). */
@Component({
  selector: 'app-cuisines-page',
  imports: [RouterLink, AddCuisineDialog, AdminRow, Button, EmptyState, Icon, List, RetireCuisineDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-intro" [attr.aria-busy]="loading() ? 'true' : null">
      <div class="page-intro__row">
        <div>
          <h1 id="cuisines-title" tabindex="-1" i18n="@@operatorCuisines.title">Cuisines</h1>
          @if (loading()) {
            <p class="subtitle"><span class="skeleton skeleton--text" style="width: 60%" aria-hidden="true"></span></p>
          } @else if (cuisines()) {
            <p class="subtitle">{{ subtitle() }}</p>
          } @else {
            <p class="subtitle" i18n="@@operatorCuisines.subtitlePlain">Shown in filters and caterer profiles</p>
          }
        </div>
        @if (loading()) {
          <span class="skeleton skeleton--rect skeleton--pill" style="width: var(--space-32); height: var(--control-height-md)" aria-hidden="true"></span>
        } @else if (cuisines()) {
          <sh-button variant="primary" haspopup="dialog" (activated)="openAdd($event)" i18n="@@operatorCuisines.add">Add cuisine</sh-button>
        }
      </div>
    </div>
    @if (failure(); as f) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load the cuisine list"
        i18n-heading="@@operatorCuisines.errorTitle"
        text="Nothing has changed: filters and caterer profiles still show the current list. Try again in a moment."
        i18n-text="@@operatorCuisines.errorText"
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
      <sh-list family="settings" label="Cuisines, A to Z" i18n-label="@@operatorCuisines.listLabel" [busy]="loading()" busyLabel="Loading cuisines" i18n-busyLabel="@@operatorCuisines.loading" [skeletonCount]="10">
        @for (c of rows(); track c.id) {
          <li sh-admin-row [title]="c.name" [meta]="c.meta">
            @if (c.isNew) {
              <span slot="badge" class="badge badge--info" i18n="@@operatorCuisines.new">New</span>
            }
            @if (!c.retired) {
              <sh-button slot="actions" variant="ghost" size="sm" haspopup="dialog" [ariaLabel]="c.retireLabel" (activated)="openRetire(c, $event)" i18n="@@operatorCuisines.retire">Retire</sh-button>
            }
          </li>
        }
      </sh-list>
      @if (!loading()) {
        <p class="text-caption" style="margin-top: var(--space-6)" i18n="@@operatorCuisines.note">Retired cuisines leave the filter and new profile choices. Caterers who already use one keep it on their page.</p>
      }
    }
    <app-add-cuisine-dialog [open]="adding()" [existing]="names()" [returnFocus]="opener()" (closed)="adding.set(false)" (added)="added($event)" />
    @if (retiring(); as r) {
      <app-retire-cuisine-dialog [open]="retireOpen()" [cuisine]="r" [returnFocus]="opener()" (closed)="retireOpen.set(false)" (retired)="retired($event)" />
    }
  `,
})
export class CuisinesPage {
  private readonly api = inject(OPERATOR_SETTINGS_SERVICE);
  private readonly toasts = inject(ToastNotifier);

  protected readonly cuisines = signal<OperatorCuisine[] | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly loading = computed(() => !this.cuisines() && !this.failure());
  protected readonly adding = signal(false);
  protected readonly retiring = signal<OperatorCuisine | null>(null);
  protected readonly retireOpen = signal(false);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly names = computed(() => (this.cuisines() ?? []).map((c) => c.name));
  protected readonly subtitle = computed(() => cuisinesSubtitle(this.cuisines() ?? []));
  protected readonly rows = computed(() =>
    (this.cuisines() ?? []).map((c) => ({
      ...c,
      meta: cuisineMeta(c),
      isNew: isNew(c),
      retireLabel: $localize`:@@operatorCuisines.retireNamed:Retire ${c.name}:name:`,
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
    this.opener.set(event.currentTarget as HTMLElement);
    this.adding.set(true);
  }

  protected openRetire(cuisine: OperatorCuisine, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.retiring.set(cuisine);
    this.retireOpen.set(true);
  }

  protected added(cuisine: OperatorCuisine): void {
    this.adding.set(false);
    this.cuisines.update((all) => [...(all ?? []), cuisine].sort((a, b) => a.name.localeCompare(b.name, 'en-CA')));
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@operatorCuisines.added:${cuisine.name}:name: added`,
      text: $localize`:@@addCuisine.note:Caterers can choose it straight away, and the listing filter offers it.`,
    });
  }

  /** L2-007.5: the operator sees which caterers keep the retired cuisine. */
  protected retired(usage: CuisineUsage): void {
    // The Retire button is gone; focus goes to the page heading (list D-6).
    this.opener.set(document.getElementById('cuisines-title'));
    this.retireOpen.set(false);
    this.cuisines.update((all) => (all ?? []).map((c) => (c.id === usage.cuisine.id ? usage.cuisine : c)));
    const names = usage.caterers.map((c) => c.name);
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@operatorCuisines.retiredTitle:${usage.cuisine.name}:name: is retired`,
      text: names.length
        ? $localize`:@@operatorCuisines.retiredKeep:${new Intl.ListFormat('en-CA', { style: 'long', type: 'conjunction' }).format(names)}:caterers: keep it on their pages.`
        : $localize`:@@operatorCuisines.retiredUnused:It’s no longer offered in filters or profiles.`,
    });
  }
}
