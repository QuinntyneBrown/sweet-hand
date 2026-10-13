import { Injectable, signal } from '@angular/core';
import type { Story } from '../backlog/story';
import { torontoToday } from '../sprint/toronto-today';
import type { CardState } from './card-state';
import type { ColumnId } from './column-id';
import { COLUMNS } from './columns';
import type { LaneFilter } from './lane-filter';
import { LANE_FILTERS } from './lane-filters';

const KEY = 'sweet-hand-board/v1';
const LANE_KEY = 'sweet-hand-board/v1:lane';
const isDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Every card's state, keyed by story ID across all sprints, saved in this browser (ADR 0013). */
@Injectable({ providedIn: 'root' })
export class BoardStore {
  private readonly cards = signal<Record<string, Partial<CardState>>>(read());
  private readonly laneFilter = signal<LaneFilter>(readLane());
  readonly lane = this.laneFilter.asReadonly();

  setLane(lane: LaneFilter) {
    this.laneFilter.set(lane);
    try {
      localStorage.setItem(LANE_KEY, lane);
    } catch {
      // Storage unavailable: the filter lasts until the page closes.
    }
  }

  /** The card's state, made whole: an unknown column is To do, Done always has a date, ticks match the tasks. */
  card(story: Story): CardState {
    const raw = this.cards()[story.id] ?? {};
    const col = COLUMNS.some((c) => c.id === raw.col) ? (raw.col as ColumnId) : 'todo';
    const doneAt = col === 'done' ? (isDate(raw.doneAt) ? raw.doneAt : torontoToday()) : null;
    const ticks = story.tasks.map((_, i) => Array.isArray(raw.ticks) && raw.ticks[i] === true);
    return { col, doneAt, ticks };
  }

  move(story: Story, col: ColumnId) {
    const card = this.card(story);
    if (card.col === col) return;
    this.put(story, { ...card, col, doneAt: col === 'done' ? torontoToday() : null });
  }

  tick(story: Story, task: number, on: boolean) {
    const card = this.card(story);
    this.put(story, { ...card, ticks: card.ticks.map((t, i) => (i === task ? on : t)) });
  }

  /** Changes a done card's date; anything but a `YYYY-MM-DD` date is ignored. */
  setDoneAt(story: Story, date: string) {
    const card = this.card(story);
    if (card.col === 'done' && isDate(date)) this.put(story, { ...card, doneAt: date });
  }

  /** Sends these stories' cards back to To do with no ticks. */
  reset(stories: Story[]) {
    const ids = new Set(stories.map((s) => s.id));
    this.cards.update((cards) => Object.fromEntries(Object.entries(cards).filter(([id]) => !ids.has(id))));
    this.save();
  }

  /** The board's state as a JSON file's text. */
  exportJson(): string {
    return JSON.stringify({ cards: this.cards() }, null, 2);
  }

  /** Replaces the board's state with an export; returns false, changing nothing, for anything else. */
  importJson(text: string): boolean {
    let cards: unknown;
    try {
      cards = JSON.parse(text)?.cards;
    } catch {
      return false;
    }
    if (!cards || typeof cards !== 'object' || Array.isArray(cards)) return false;
    this.cards.set(cards as Record<string, Partial<CardState>>);
    this.save();
    return true;
  }

  private put(story: Story, card: CardState) {
    this.cards.update((cards) => ({ ...cards, [story.id]: card }));
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ cards: this.cards() }));
    } catch {
      // Storage unavailable: the board still works until the page closes.
    }
  }
}

function readLane(): LaneFilter {
  try {
    const saved = localStorage.getItem(LANE_KEY) as LaneFilter;
    return LANE_FILTERS.includes(saved) ? saved : 'All';
  } catch {
    return 'All';
  }
}

function read(): Record<string, Partial<CardState>> {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    return saved && typeof saved.cards === 'object' ? saved.cards : {};
  } catch {
    return {};
  }
}
