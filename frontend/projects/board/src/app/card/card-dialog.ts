import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { inlineMarkdown } from '../backlog/inline-markdown';
import { BoardStore } from '../state/board-store';
import type { ColumnId } from '../state/column-id';
import { COLUMNS } from '../state/columns';
import type { CardDialogData } from './card-dialog-data';

/** A story's details: where its card is, what done means and its tasks. */
@Component({
  selector: 'board-card-dialog',
  templateUrl: './card-dialog.html',
  styleUrl: './card-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDialog {
  protected readonly data = inject<CardDialogData>(DIALOG_DATA);
  protected readonly ref = inject(DialogRef);
  private readonly store = inject(BoardStore);
  protected readonly columns = COLUMNS;
  protected readonly md = inlineMarkdown;
  protected readonly story = this.data.story;
  protected readonly sprint = this.data.sprint;
  protected readonly laneDod = this.data.laneDod[this.story.lane];
  protected readonly card = computed(() => this.store.card(this.story));
  protected readonly ticked = computed(() => this.card().ticks.filter(Boolean).length);

  protected move(col: string) {
    this.store.move(this.story, col as ColumnId);
  }

  protected tick(task: number, on: boolean) {
    this.store.tick(this.story, task, on);
  }

  protected setDoneAt(date: string) {
    if (date >= this.sprint.start && date <= this.sprint.end) this.store.setDoneAt(this.story, date);
  }
}
