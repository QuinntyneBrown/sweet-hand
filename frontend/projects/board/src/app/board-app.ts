import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, type CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import type { Backlog } from './backlog/backlog';
import { loadBacklog } from './backlog/load-backlog';
import type { Story } from './backlog/story';
import { burndown } from './burndown/burndown';
import { BurndownChart } from './burndown/burndown-chart';
import { BoardCard } from './card/board-card';
import { CardDialog } from './card/card-dialog';
import type { CardDialogData } from './card/card-dialog-data';
import { BoardStore } from './state/board-store';
import type { ColumnId } from './state/column-id';
import { LANE_FILTERS } from './state/lane-filters';
import { COLUMNS } from './state/columns';
import { currentSprint } from './sprint/current-sprint';
import { formatRange } from './sprint/format-day';
import { torontoToday } from './sprint/toronto-today';

/** The sprint board: one screen, no router (ADR 0013). */
@Component({
  selector: 'board-root',
  imports: [BoardCard, BurndownChart, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './board-app.html',
  styleUrl: './board-app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardApp {
  protected readonly store = inject(BoardStore);
  private readonly dialog = inject(Dialog);
  private readonly announcer = inject(LiveAnnouncer);
  protected readonly backlog = signal<Backlog | null>(null);
  protected readonly failed = signal(false);
  protected readonly sprintNumber = signal(0);
  protected readonly today = signal(torontoToday());
  protected readonly status = signal('');
  protected readonly resetArmed = signal(false);
  private disarm?: ReturnType<typeof setTimeout>;

  protected readonly sprint = computed(() => this.backlog()?.sprints.find((s) => s.number === this.sprintNumber()) ?? null);
  protected readonly dates = computed(() => {
    const s = this.sprint();
    return s ? `Sprint ${s.number} · ${formatRange(s.start, s.end)}` : '';
  });
  protected readonly lanes = LANE_FILTERS;
  /** The sprint's stories in plan order, in the lane being shown. */
  protected readonly stories = computed(() => {
    const backlog = this.backlog();
    const sprint = this.sprint();
    const lane = this.store.lane();
    if (!backlog || !sprint) return [];
    return sprint.stories
      .map((id) => backlog.stories.find((s) => s.id === id))
      .filter((s): s is Story => !!s && (lane === 'All' || s.lane === lane));
  });
  protected readonly burndown = computed(() => {
    const sprint = this.sprint();
    return sprint ? burndown(sprint, this.stories(), (s) => this.store.card(s), this.today()) : null;
  });
  protected readonly chartLabel = computed(() => {
    const b = this.burndown();
    return b ? `Burndown: ${b.left} of ${b.total} points remaining; ${b.pace}.` : '';
  });
  protected readonly board = computed(() =>
    COLUMNS.map((column) => {
      const stories = this.stories().filter((s) => this.store.card(s).col === column.id);
      return { ...column, stories, points: stories.reduce((sum, s) => sum + s.points, 0) };
    }),
  );

  constructor() {
    loadBacklog().then(
      (backlog) => {
        const asked = Number(new URLSearchParams(location.search).get('sprint'));
        const sprint = backlog.sprints.find((s) => s.number === asked) ?? currentSprint(backlog.sprints, this.today());
        this.sprintNumber.set(sprint.number);
        this.backlog.set(backlog);
      },
      () => this.failed.set(true),
    );
  }

  protected drop(event: CdkDragDrop<ColumnId, ColumnId, Story>) {
    if (event.previousContainer === event.container) return;
    const story = event.item.data;
    this.store.move(story, event.container.data);
    this.announcer.announce(`${story.id} moved to ${COLUMNS.find((c) => c.id === event.container.data)?.name}`);
  }

  protected openDetails(story: Story) {
    const backlog = this.backlog();
    const sprint = this.sprint();
    if (!backlog || !sprint) return;
    this.dialog.open<void, CardDialogData>(CardDialog, {
      data: { story, sprint, laneDod: backlog.laneDod },
      ariaLabelledBy: 'd-title',
      autoFocus: 'dialog',
    });
  }

  /** The first press asks; a second press within four seconds resets the sprint's cards. */
  protected reset() {
    const sprint = this.sprint();
    if (!sprint) return;
    clearTimeout(this.disarm);
    if (!this.resetArmed()) {
      this.resetArmed.set(true);
      this.disarm = setTimeout(() => this.resetArmed.set(false), 4000);
      return;
    }
    this.resetArmed.set(false);
    const backlog = this.backlog()!;
    this.store.reset(backlog.stories.filter((s) => sprint.stories.includes(s.id)));
    this.status.set(`Sprint ${sprint.number} reset`);
  }

  protected exportBoard() {
    const url = URL.createObjectURL(new Blob([this.store.exportJson()], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `sweet-hand-board-${torontoToday()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected async importBoard(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const imported = this.store.importJson(await file.text());
    this.status.set(imported ? 'Board imported' : 'That file isn’t a board export. Nothing changed.');
  }

  protected chooseSprint(value: string) {
    this.sprintNumber.set(Number(value));
    history.replaceState(null, '', `?sprint=${value}`);
  }
}
