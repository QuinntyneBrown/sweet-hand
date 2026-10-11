import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BreachRecord as BreachRecordRow, Button, Description, DescriptionList, EmptyState, Icon, List, ToastNotifier } from '@sweet-hand/components';
import { count, shortDate } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { RecordBreachDialog } from './record-breach.dialog';
import { type BreachRecord, OperatorSettingsService } from '@sweet-hand/api';
import { paths } from '../../../core/routing/paths';

/** "Confirmed Thu 17 Sep 2026 · recorded by Leah Mohammed" */
export function breachWhen(b: BreachRecord): string {
  // The year is always shown: records are kept for years.
  const date = shortDate(b.confirmedOn, new Date(0));
  return $localize`:@@breaches.when:Confirmed ${date}:date: · recorded by ${b.recordedBy}:name:`;
}

/** The breach register, /admin/breaches (docs/mocks/pages/admin-breaches; BreachRegisterPage, L2-075.2). */
@Component({
  selector: 'app-breaches-page',
  imports: [RouterLink, BreachRecordRow, Button, Description, DescriptionList, EmptyState, Icon, List, RecordBreachDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breaches.page.html',
})
export class BreachesPage {
  protected readonly paths = paths;
  private readonly api = inject(OperatorSettingsService);
  private readonly toasts = inject(ToastNotifier);

  protected readonly records = signal<BreachRecord[] | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly loading = computed(() => !this.records() && !this.failure());
  protected readonly recording = signal(false);
  protected readonly opener = signal<HTMLElement | null>(null);
  protected readonly subtitle = computed(() => {
    const n = this.records()?.length ?? 0;
    return n === 1
      ? $localize`:@@breaches.subtitleOne:1 record · kept for at least 24 months`
      : $localize`:@@breaches.subtitle:${n}:count: records · each kept for at least 24 months`;
  });

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.failure.set(null);
    this.records.set(null);
    try {
      this.records.set(await firstValueFrom(this.api.breaches()));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected when(b: BreachRecord): string {
    return breachWhen(b);
  }

  protected people(b: BreachRecord): string {
    return count(b.peopleAffected);
  }

  protected openRecord(event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.recording.set(true);
  }

  /** Newest first: the new record goes in by its confirmed date. */
  protected recorded(record: BreachRecord): void {
    this.recording.set(false);
    this.records.update((all) => [record, ...(all ?? [])].sort((a, b) => b.confirmedOn.localeCompare(a.confirmedOn) || b.recordedAt.localeCompare(a.recordedAt)));
    this.toasts.show({ tone: 'success', title: $localize`:@@breaches.recorded:Breach recorded`, text: $localize`:@@breaches.recordedText:It’s kept for at least 24 months and can’t be changed.` });
  }
}
