import { expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { boardBacklog } from '../support/board-backlog';

export type BoardColumn = 'To do' | 'In progress' | 'Review' | 'Done';

interface OpenOptions {
  /** The moment "now" is pinned to. */
  today: Date;
  /** `?sprint=` in the address. */
  sprint?: number;
  /** The fictional backlog by default; `'real'` serves the file generated from docs/plans/launch-backlog.md. */
  backlog?: typeof boardBacklog | 'real';
  /** Keeps what earlier visits saved in this browser. */
  keepSaved?: boolean;
}

/** The sprint board (ADR 0013), served by the `board` application. */
export class BoardPage {
  constructor(readonly page: Page) {}

  async open({ today, sprint, backlog = boardBacklog }: OpenOptions) {
    await this.page.clock.setFixedTime(today);
    if (backlog !== 'real') {
      await this.page.route('**/backlog.json', (route) => route.fulfill({ json: backlog }));
    }
    await this.page.goto(sprint ? `/?sprint=${sprint}` : '/');
    await expect(this.sprintName).toBeVisible();
  }

  async reload() {
    await this.page.reload();
    await expect(this.sprintName).toBeVisible();
  }

  // Sprint header

  get sprintName() {
    return this.page.getByRole('heading', { level: 1 });
  }

  get sprintDates() {
    return this.page.locator('.eyebrow .dates');
  }

  get goal() {
    return this.page.getByRole('list', { name: 'Sprint goal' }).getByRole('listitem');
  }

  get sprintPicker() {
    return this.page.getByLabel('Sprint', { exact: true });
  }

  async chooseSprint(label: string) {
    await this.sprintPicker.selectOption({ label });
  }

  laneFilter(name: 'All' | 'Engineering' | 'Business') {
    return this.page.getByRole('group', { name: 'Show lane' }).getByRole('button', { name, exact: true });
  }

  async showLane(name: 'All' | 'Engineering' | 'Business') {
    await this.laneFilter(name).click();
  }

  // Reset, export and import

  get resetButton() {
    return this.page.locator('.toolbar .reset');
  }

  /** What the board says after reset, export and import. */
  get status() {
    return this.page.getByRole('status');
  }

  /** Downloads the board's state; returns the file's suggested name and where it was saved. */
  async exportBoard() {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.page.getByRole('button', { name: 'Export' }).click()]);
    return { name: download.suggestedFilename(), path: await download.path() };
  }

  async importBoard(path: string) {
    const [chooser] = await Promise.all([this.page.waitForEvent('filechooser'), this.page.getByRole('button', { name: 'Import' }).click()]);
    await chooser.setFiles(path);
  }

  /** Clears what this browser saved, as a cleared site would, and reloads. */
  async forgetSavedBoard() {
    await this.page.evaluate(() => localStorage.clear());
    await this.reload();
  }

  // Burndown

  /** "On track", "Behind ideal by 3 pts", … */
  get pace() {
    return this.page.locator('.burn .chip');
  }

  /** ["8 of 13 pts left", "1 of 4 stories done", "8 working days left"] */
  get burndownStats() {
    return this.page.locator('.burn .stats > span');
  }

  get burndownChart() {
    return this.page.getByRole('img', { name: /^Burndown/ });
  }

  // Board

  column(name: BoardColumn) {
    return this.page.getByRole('region', { name });
  }

  /** "4 · 13 pts" */
  columnSummary(name: BoardColumn) {
    return this.column(name).locator('.col-count');
  }

  /** The story IDs in a column, top to bottom. */
  cardIds(name: BoardColumn) {
    return this.column(name).locator('.card .id');
  }

  card(id: string) {
    return this.page.getByRole('button', { name: new RegExp(`^${id}:`) });
  }

  /** Drags a card by mouse onto a column, past the drag threshold. */
  async dragCard(id: string, to: BoardColumn) {
    const from = await this.card(id).boundingBox();
    const target = await this.column(to).boundingBox();
    if (!from || !target) throw new Error(`${id} or ${to} is not on screen`);
    await this.page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 });
    await this.page.mouse.move(target.x + target.width / 2, target.y + 60, { steps: 10 });
    await this.page.mouse.up();
  }

  // Story details

  get details() {
    return this.page.getByRole('dialog');
  }

  async openDetails(id: string) {
    await this.card(id).click();
    await expect(this.details).toBeVisible();
  }

  async closeDetails() {
    await this.details.getByRole('button', { name: 'Close' }).click();
    await expect(this.details).toBeHidden();
  }

  get detailsColumn() {
    return this.details.getByLabel('Column');
  }

  get detailsTitle() {
    return this.details.getByRole('heading', { level: 2 });
  }

  get definitionOfDone() {
    return this.details.getByRole('list', { name: 'Definition of done', exact: true }).getByRole('listitem');
  }

  async showLaneDefinitionOfDone(lane: 'Engineering' | 'Business') {
    await this.details.getByText(`${lane} Definition of Done`).click();
  }

  laneDefinitionOfDone(lane: 'Engineering' | 'Business') {
    return this.details.getByRole('list', { name: `${lane} Definition of Done` }).getByRole('listitem');
  }

  /** "1 of 3" */
  get taskProgress() {
    return this.details.locator('.d-prog');
  }

  task(name: string) {
    return this.details.getByRole('checkbox', { name });
  }

  get doneOn() {
    return this.details.getByLabel('Done on');
  }

  async moveCardWithDetails(id: string, to: BoardColumn) {
    await this.openDetails(id);
    await this.detailsColumn.selectOption({ label: to });
    await this.closeDetails();
  }

  usePhone(width = 375) {
    return this.page.setViewportSize({ width, height: 780 });
  }

  scrollsSideways() {
    return this.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  }

  /** Whether every column sits below the one before it, at the same left edge. */
  async columnsStack() {
    const boxes: ({ x: number; y: number } | null)[] = [];
    for (const name of ['To do', 'In progress', 'Review', 'Done'] as const) boxes.push(await this.column(name).boundingBox());
    return boxes.every((box, i) => {
      const above = boxes[i - 1];
      return i === 0 || (!!box && !!above && box.x === above.x && box.y > above.y);
    });
  }

  async expectNoAccessibilityViolations() {
    const size = this.page.viewportSize();
    for (const width of [375, 1280]) {
      for (const colorScheme of ['light', 'dark'] as const) {
        await this.page.setViewportSize({ width, height: 900 });
        await this.page.emulateMedia({ colorScheme });
        const results = await new AxeBuilder({ page: this.page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
        const summary = results.violations.map((v) => `${width}px ${colorScheme} ${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`);
        expect(summary, summary.join('\n')).toEqual([]);
      }
    }
    await this.page.emulateMedia({ colorScheme: null });
    if (size) await this.page.setViewportSize(size);
  }
}

/** A moment in Toronto on the given date, mid-morning. */
export function torontoDay(date: string) {
  return new Date(`${date}T10:00:00-04:00`);
}

export type { Locator };
