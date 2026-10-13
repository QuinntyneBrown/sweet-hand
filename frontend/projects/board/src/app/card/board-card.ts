import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { Story } from '../backlog/story';
import type { CardState } from '../state/card-state';
import { formatDay } from '../sprint/format-day';

/** A story's card on the board; activating it opens the story's details. */
@Component({
  selector: 'board-card',
  templateUrl: './board-card.html',
  styleUrl: './board-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardCard {
  readonly story = input.required<Story>();
  readonly state = input.required<CardState>();
  readonly opened = output<void>();

  protected readonly done = computed(() => this.state().col === 'done');
  protected readonly progress = computed(() => {
    const state = this.state();
    if (state.col === 'done' && state.doneAt) return `Done ${formatDay(state.doneAt)}`;
    return `${state.ticks.filter(Boolean).length}/${this.story().tasks.length} tasks`;
  });
  protected readonly label = computed(() => {
    const s = this.story();
    return `${s.id}: ${s.title}. ${s.lane}, ${s.points} ${s.points === 1 ? 'point' : 'points'}, ${this.progress()}. Open details`;
  });
}
