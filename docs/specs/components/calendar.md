# Calendar

| Field | Value |
|---|---|
| Selector | `sh-calendar` (`.cal-toolbar` and the month table `.cal-wrap` / `.cal`, or the week grid `.week`), `sh-agenda` (`ul.agenda`), `sh-type-key` (`ul.type-key`) |
| Library path | `frontend/projects/components/src/lib/calendar/` |
| Status | planned |
| Traces to | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-119, L2-121 |
| Design system | [`calendar.html`](../../design-system/components/calendar.html) |
| Source mocks | [`pages/admin-calendar/default`](../../mocks/pages/admin-calendar/default.html), [`pages/admin-calendar/week`](../../mocks/pages/admin-calendar/week.html), [`pages/admin-calendar/day`](../../mocks/pages/admin-calendar/day.html), [`pages/admin-calendar/filtered`](../../mocks/pages/admin-calendar/filtered.html), [`pages/admin-calendar/loading`](../../mocks/pages/admin-calendar/loading.html), [`pages/admin-calendar/empty`](../../mocks/pages/admin-calendar/empty.html), [`pages/admin-event/recurring`](../../mocks/pages/admin-event/recurring.html) |
| Rendering | [`calendar.html`](calendar.html) |

## Purpose and scope

The calendar shows the directory's event occurrences by month or week, with
an agenda for the selected day (L2-121). Leah Mohammed and Tomas Reyes use it
to see what is on in Toronto and the GTA, spot clashes, and add an event on a
chosen day. Skipped and cancelled dates stay on it, struck through (L2-119,
L2-120). It is for operators only (L2-110).

Use the events [list](list.md) to search or work through events in order. Use
the browser's native date input inside a [text field](text-field.md) for a
date in a form. The calendar is not a date picker.

Out of scope:

- Which occurrences fall in the range, the holidays, the type filter and the
  summary ("19 events in October"): `calendarView` and the page
  (`view-events-calendar` design). The component draws the cells it is given.
- The type filter chips and "Add event" buttons: the page.
- The empty and error states: the page shows an [empty state](empty-state.md)
  ("Nothing scheduled in December", "We couldn't load the calendar") under or
  instead of the grid.
- The day view's heading and "Add event on <day>" button: the page composes
  `sh-agenda` with them.
- Skip and restore on the event page's stops list: the page uses a
  [list](list.md).

## Usage

Inventory from a search of `docs/mocks` for `cal-toolbar`, `cal`,
`cal-event`, `cal-more`, `week`, `agenda` and `type-key`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-calendar/default` | month, October 2026, today Sat 10 Oct | 19 occurrences; Thanksgiving; Expo spanning 16–18 Oct; "+2 more" on Sat 17 Oct; Truck Rally cancelled; Black cake pickup draft; agenda "Today · Saturday 10 October" | default, today, outside, holiday, span, more, cancelled, draft | canvas |
| `pages/admin-calendar/filtered` | month, 2 of 19 shown | Trade shows and workshops | default | canvas |
| `pages/admin-calendar/week` | week 11–17 Oct, 8 a.m.–11 p.m. | Expo all-day Fri–Sat; Harvest Fair, Doubles on Wheels, Jerk Drum Wednesdays; three overlapping on Sat 17 | week, overlap, today | canvas |
| `pages/admin-calendar/day` | agenda only | "Saturday 17 October", 4 items | agenda | canvas |
| `pages/admin-calendar/loading` | month, `busy` | skeleton cells | loading | canvas |
| `pages/admin-calendar/empty` | month, December 2026, no occurrences | Christmas Day, Boxing Day | holiday, empty | canvas |
| `pages/admin-calendar/*` | type key | Festival, Market, Trade show, Food truck stop, Pop-up, Workshop | — | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Toolbar** — `div.cal-toolbar` holds `div.cal-toolbar__nav` (previous and
   next [icon buttons](icon-button.md) with `.icon-btn--outline`, and a "Today"
   [button](button.md) `sm`), `h2.cal-toolbar__title[aria-live="polite"]` and
   a [button group](button-group.md) `ul.segmented` for Month and Week.
2. **Month table** — `div.cal-wrap > table.cal[aria-labelledby]`: `thead`
   with seven `th[scope=col] > abbr` (Sun to Sat), and one `tr` per week.
3. **Day cell** — `td` (`.cal--outside`, `.cal--holiday`) holding
   `div.cal__day`. Inside it are `a.cal__date[aria-label]`, an optional
   `span.cal__holiday`, `span.cal__dots[aria-hidden]` with one span per type,
   and `ul.cal__events`.
4. **Event** — `a.cal-event.ev--{type}` (`--span`, `--start`, `--end`,
   `--cancelled`, `--draft`) with `span.cal-event__time` and the short title.
   Visually hidden text carries the full title for a continuing day and the
   "(cancelled)" or "(draft)" suffix.
5. **More** — `a.cal-more`, "+N more", linking to the day.
6. **Week grid** — `div.week[role="region"][aria-label][tabindex="0"] >
   div.week__grid`. It holds `.week__head` (with `[aria-current="date"]`),
   `.week__col` (`--today`), `.week__allday-label`, `a.week__event.week__allday`,
   `.week__lines`, `.week__hour`, timed `a.week__event` and `.week__now`.
7. **Agenda** — `ul.agenda > li > a.agenda__item.ev--{type}` with
   `.agenda__time`, `.agenda__title` and `.agenda__meta`.
8. **Type key** — `ul.type-key[aria-label] > li.ev--{type}`.

Host: `sh-calendar`, `sh-agenda` and `sh-type-key` are `display: contents`.

## API

### `sh-calendar` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `view` | `'month' \| 'week'` | `'month'` | no | Which grid renders. Two-way: `viewChange`. |
| `title` | `string` | — | yes | "October 2026", or "11 – 17 Oct 2026" for a week. The live heading labels the table. |
| `previousLabel`, `nextLabel` | `string` | — | yes | "Previous month", "Next month" (the page passes "week" wording in week view). |
| `todayLabel` | `string` | — | yes | "Today". |
| `viewsLabel`, `monthLabel`, `weekLabel` | `string` | — | yes | "Calendar view", "Month", "Week". |
| `weekdays` | `{ short: string; long: string }[]` | — | yes | Seven entries, Sunday first: `{ short: 'Sun', long: 'Sunday' }`. |
| `weeks` | `CalendarDay[][]` | — | yes in month view | Rows of seven. `CalendarDay` is `{ date: string; number: string; label: string; outside: boolean; today: boolean; holiday: string \| null; dots: EventType[]; events: CalendarChip[]; more: { label: string; href: string } \| null; href: string }`. |
| `selected` | `string \| null` | `null` | no | ISO date of the selected day. Two-way: `selectedChange`. |
| `week` | `WeekView \| null` | `null` | yes in week view | `{ label: string; allDayLabel: string; hours: { label: string; row: number }[]; days: { date: string; weekday: string; number: string; today: boolean; holiday: string \| null }[]; events: WeekEvent[]; now: number \| null }`. |
| `busy` | `boolean` | `false` | no | Month view renders skeleton cells with `aria-busy="true"` on `.cal-wrap`. |

`CalendarChip` is `{ href: string; type: EventType; time: string \| null;
title: string; fullTitle: string \| null; suffix: string \| null; span:
'start' \| 'middle' \| 'end' \| null; cancelled: boolean; draft: boolean }`.
`WeekEvent` is `{ href: string; type: EventType; title: string; meta: string;
column: number; columnEnd: number; rowStart: number \| null; rowEnd: number \|
null; lane: 'full' \| 'left' \| 'right'; cancelled: boolean; draft: boolean;
suffix: string \| null }`. `rowStart` is `null` for all-day. `EventType` is
`'festival' \| 'market' \| 'trade' \| 'truck' \| 'popup' \| 'workshop'`.

### `sh-agenda` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `items` | `{ href: string; type: EventType; time: string; title: string; meta: string; cancelled: boolean; suffix: string \| null }[]` | — | yes | In start order. |

### `sh-type-key` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | "Event types". |
| `items` | `{ type: EventType; label: string }[]` | — | yes | Festival, Market, Trade show, Food truck stop, Pop-up, Workshop. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `navigate` | `{ to: 'previous' \| 'next' \| 'today' \| 'date'; date?: string }` | Previous, Next or Today is activated, or keyboard focus crosses the month edge or uses Page Up or Page Down (`to: 'date'` with the day to focus). |
| `viewChange` | `'month' \| 'week'` | Month or Week is chosen. |
| `selectedChange` | `string` | A date link is activated by Enter or a click. |

Event, "+N more" and agenda links navigate by their `href`. They emit nothing.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | | Every string is an input, so the grid can be built from `calendarView` data alone. |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Month | `view="month"` | The month at a glance, up to 2 events a day. |
| Week | `view="week"` | Comparing times across 7 days, 8 a.m. to 11 p.m. |
| Agenda | `sh-agenda` | A day's full list, under the month or as the day view. |
| Event types | `.ev--festival`, `--market`, `--trade`, `--truck`, `--popup`, `--workshop` | Dot, bar and border colour by type. |

| Size | Modifier | Day cell | Date | Type |
|---|---|---|---|---|
| one size | — | 7.5rem from 48rem, 3.25rem below | 2rem from 48rem, `--target-comfortable` below | `--text-label`, events `--text-caption` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Date default | — | Ink number in a 2rem pill. | Link named by `label`: "Thursday 15 October, no events". |
| Date hover | `:hover` | `--color-bg-subtle` pill. | — |
| Date focus | `:focus-visible` | Shared focus ring. | Focus on the link (the roving tab stop). |
| Today | `today` | `--color-accent` circle, `--color-fg-on-accent` number. | `aria-current="date"`; the label includes "today". |
| Selected | `selected` = date | Inset ink ring. | `aria-selected="true"`. |
| Outside the month | `outside` | `--color-bg-surface-sunken` cell, subtle number. | Same label pattern. |
| Holiday | `holiday` | Caption under the date: "Thanksgiving". | Read as text in the cell. |
| Event | — | Type dot, muted time, title clamped to 2 lines. | Link: "11 a.m. Doubles on Wheels". |
| Event hover / focus | `:hover`, `:focus-visible` | `--color-bg-subtle` / focus ring. | — |
| Cancelled or skipped | `cancelled` | Struck through, `--color-fg-subtle`. | Hidden suffix " (cancelled)". |
| Draft | `draft` | Outline dot. | Hidden suffix " (draft)". |
| Multi-day | `span` | Tinted bar across cells, square inner ends. | Later days carry the full title hidden before "continues". |
| More | `more` | "+2 more", muted. | Link to the day. |
| Loading | `busy` | Skeleton date and line in each cell. | `aria-busy="true"` on `.cal-wrap`. |
| Week event | — | Tinted block with a `--border-width-thick` type edge. | Link with title and meta. |

## Markup

```html
<!-- rendered: month, October 2026 -->
<div class="cal-toolbar">
  <div class="cal-toolbar__nav">
    <button class="icon-btn icon-btn--outline" type="button" aria-label="Previous month">…</button>
    <button class="icon-btn icon-btn--outline" type="button" aria-label="Next month">…</button>
    <button class="btn btn--sm" type="button">Today</button>
    <h2 class="cal-toolbar__title" id="cal-title" aria-live="polite">October 2026</h2>
  </div>
  <ul class="segmented" aria-label="Calendar view"><li><button type="button" aria-pressed="true">Month</button></li><li><button type="button" aria-pressed="false">Week</button></li></ul>
</div>
<div class="cal-wrap"><table class="cal" aria-labelledby="cal-title">
  <thead><tr><th scope="col"><abbr title="Sunday">Sun</abbr></th>…</tr></thead>
  <tbody>
    <tr>
      <td class="cal--outside"><div class="cal__day"><a class="cal__date" href="…" tabindex="-1" aria-label="Sunday 27 September, no events">27</a></div></td>
      …
      <td><div class="cal__day"><a class="cal__date" href="…" tabindex="0" aria-current="date" aria-selected="true" aria-label="Saturday 10 October, today, 1 event">10</a>
        <span class="cal__dots" aria-hidden="true"><span class="ev--market"></span></span>
        <ul class="cal__events"><li><a class="cal-event ev--market" href="…"><span class="cal-event__time">10 a.m.</span> Little Jamaica Market</a></li></ul>
      </div></td>
    </tr>
    <tr>…
      <td class="cal--holiday"><div class="cal__day"><a class="cal__date" href="…" tabindex="-1" aria-label="Monday 12 October, 1 event">12</a><span class="cal__holiday">Thanksgiving</span>…</div></td>
      …
      <td><div class="cal__day"><a class="cal__date" href="…" tabindex="-1" aria-label="Saturday 17 October, 4 events">17</a>…
        <ul class="cal__events">
          <li><a class="cal-event cal-event--span ev--trade" href="…"><span class="visually-hidden">GTA Caribbean Food &amp; Trade Expo, </span>continues</a></li>
          <li><a class="cal-event ev--market" href="…"><span class="cal-event__time">10 a.m.</span> Little Jamaica Market</a></li>
          <li><a class="cal-more" href="…">+2 more</a></li>
        </ul></div></td>
    </tr>
  </tbody>
</table></div>
```

```html
<!-- rendered: cancelled and draft events -->
<a class="cal-event ev--truck cal-event--cancelled" href="…"><span class="cal-event__time">11 a.m.</span> Truck Rally<span class="visually-hidden"> (cancelled)</span></a>
<a class="cal-event ev--popup cal-event--draft" href="…"><span class="cal-event__time">10 a.m.</span> Black cake pickup<span class="visually-hidden"> (draft)</span></a>
```

```html
<!-- rendered: week -->
<div class="week" role="region" aria-label="Week of 11 October, 8 a.m. to 11 p.m." tabindex="0"><div class="week__grid">
  <div class="week__head" style="grid-column: 2;">Sun<b>11</b></div><div class="week__col" style="grid-column: 2;"></div>
  …
  <div class="week__allday-label">All day</div>
  <a class="week__event week__allday ev--trade" style="grid-column: 7 / 9;" href="…"><b>GTA Caribbean Food &amp; Trade Expo</b>Fri–Sun · Mississauga</a>
  <div class="week__lines"></div>
  <div class="week__hour" style="grid-row: 3;">8 a.m.</div>…
  <a class="week__event ev--market" style="grid-column: 8; grid-row: 7 / 19; margin-right: 50%;" href="…"><b>Little Jamaica Market</b>10 a.m.–4 p.m.</a>
</div></div>
```

```html
<!-- rendered: agenda and type key -->
<ul class="agenda"><li><a class="agenda__item ev--market" href="…"><span class="agenda__time">10 a.m.–4 p.m.</span><span class="agenda__title">Little Jamaica Saturday Market</span><span class="agenda__meta">Eglinton Ave W &amp; Oakwood Ave · Jerk Drum Truck and 2 other vendors</span></a></li></ul>
<ul class="type-key" aria-label="Event types"><li class="ev--festival">Festival</li>…</ul>
```

```html
<!-- consumer: calendar page -->
<sh-calendar [view]="view()" (viewChange)="setView($event)" [title]="cal.title" [weekdays]="weekdays" [weeks]="cal.weeks" [week]="cal.week"
  [(selected)]="selectedDate" (navigate)="go($event)" previousLabel="Previous month" nextLabel="Next month" todayLabel="Today"
  viewsLabel="Calendar view" monthLabel="Month" weekLabel="Week" [busy]="loading()" />
<sh-type-key label="Event types" [items]="typeKey" />
<sh-agenda [items]="cal.agenda" />
```

## Design

- Toolbar: wraps with `--space-3` and `--space-6` gaps and `--space-4` below.
  The title is `--text-h2` on its own row below 48rem.
- Table: fixed layout. Headers use `--text-label` in `--color-fg-subtle`.
  Cells have `--space-1` padding and hairline top and left borders in
  `--color-border-default`.
- Events: `--text-caption` at line height 1.25, padding `--space-0-5` and
  `--space-1`, `--radius-xs`, a `--space-2` dot, `--space-0-5` between
  events. Multi-day bars mix the type colour at 16 % into
  `--color-bg-surface`.
- Week: hour height 3rem with half-hour rows; first column 3.5rem; day columns
  at least 6.5rem; grid at least 46rem. Events use `--radius-sm` with a 14 %
  tint, 24 % on hover, and `--z-raised`. The now line is
  `--border-width-thick` in `--color-accent`.
- Agenda: rows on a 6.5rem time column and the rest, `--space-4` padding,
  hairline separators. The title is `--text-body` medium and the meta is
  `--text-body-sm` muted.

Component tokens: none. The type colour is the private custom property
`--ev`, set by each `.ev--*` class to a semantic token.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Grid lines | `--color-border-default` | from tokens | from tokens |
| Outside-month cell | `--color-bg-surface-sunken` | | |
| Headers, outside dates, holiday, cancelled | `--color-fg-subtle` | | |
| Event time, agenda meta | `--color-fg-muted` | | |
| Dates, titles | `--color-fg-default` | | |
| Today, festival, now line | `--color-accent` | | |
| Today's number | `--color-fg-on-accent` | | |
| Hover | `--color-bg-subtle` | | |
| Market | `--color-success-solid` | | |
| Trade show | `--color-info-solid` | | |
| Food truck stop | `--color-warning-solid` | | |
| Pop-up | `--color-danger-solid` | | |
| Workshop | `--color-border-strong` | | |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Dates, event titles |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Times, headers |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Today's number |
| `--color-fg-subtle` | `--color-bg-surface-sunken` | 4.5:1 | Outside-month dates |
| `--color-warning-solid` | `--color-bg-surface` | 3:1 | Lightest type dot |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Workshop dot |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

## Responsive behaviour

- Below 48rem: cells are 3.25rem tall and centred. Dates become 44 px
  targets. `.cal__events` and `.cal__holiday` are hidden and `.cal__dots`
  shows one dot per type. The agenda under the grid carries the detail. The
  toolbar title takes its own row.
- 48rem and up: 7.5rem cells with up to 2 events and "+N more"; the toolbar
  is one row.
- 100rem and up: `.cal-layout--day` puts the agenda in a 20rem column (page
  layout).
- Week view: the grid is at least 46rem and scrolls sideways inside `.week`
  at every width below that.
- At 320 px nothing scrolls horizontally outside `.week` or clips; at 200 %
  zoom everything stays available; every target is at least 44 × 44 CSS px
  on touch devices.

## Accessibility

### Role and pattern

The month is a data `table` labelled by the live title, with `th[scope=col]`
day headers. Keyboard navigation follows the
[grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)'s model with
one roving tab stop on the date links (D-2). The table keeps its native
semantics, without `role="grid"`. The week grid is a named, focusable
`region`. The agenda and type key are lists. The view switch is a
[button group](button-group.md) with `aria-pressed`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Toolbar controls, then the one date in the tab order (selected, else today, else the 1st), then that day's events, then on. |
| <kbd>←</kbd> <kbd>→</kbd> | Previous or next day. Past the month's edge: `navigate` with that date, and focus lands on it in the new month. |
| <kbd>↑</kbd> <kbd>↓</kbd> | Same weekday a week earlier or later. |
| <kbd>Home</kbd>, <kbd>End</kbd> | First or last day of the row. |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Same day number in the previous or next month (last day if shorter). |
| <kbd>Enter</kbd> | Selects the focused day: `selectedChange`. The page updates the agenda. |
| <kbd>←</kbd> <kbd>→</kbd> on `.week` | Scrolls the week grid sideways when it overflows. |

### Focus

Date links, events, "+N more", agenda items and week events take the shared
focus ring. Moving between days moves the tab stop, so <kbd>Tab</kbd> back
into the grid returns to the last focused day. After a month change, focus
stays on the date in the new month.

### Labelling

Each date link's name is "{weekday} {day} {month}", then ", today" when it
applies, then ", N events" or ", no events": "Saturday 10 October, today, 1
event". Day headers are `abbr` with the full name. A continuing multi-day
event's name starts with the full title. Cancelled and draft events end with
"(cancelled)" or "(draft)".

### Announcements

The toolbar title is `aria-live="polite"`, so "November 2026" is announced
after a month change. Nothing else is announced by the component.

### Motion

Nothing animates. Month, week and selection changes swap content in place.

## Content and internationalisation

- Titles: "October 2026"; week "11 – 17 Oct 2026".
- Times: "10 a.m.", "6:30 p.m.", "12–8 p.m.", in Toronto time, formatted by
  the page (`core/format/format.ts`).
- Cell titles are short forms ("Jerk Drum Wed."); the agenda gives the full
  title ("Jerk Drum Wednesdays").
- Holidays: "Thanksgiving", "Christmas Day", "Boxing Day".
- Translatable: every label input, weekday names, "continues", "(cancelled)",
  "(draft)", "+N more", "All day", hour labels. Data: event titles, venues,
  dates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush`, signal
  inputs). The roving tab stop is a single signal; arrow keys move focus
  without re-rendering the table.
- The month is at most 42 cells with at most 3 links each. The week draws only
  the given events.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/EventsCalendar.ts`
  renders October 2026 from the cast (19 occurrences, today Sat 10 Oct);
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `EventsCalendarWeek`, `DarkTheme`.
- Layout stability: the loading table keeps the six-row shape, so the grid
  does not jump when data arrives.

## Acceptance criteria

### Rendering

- **AC-1** Given October 2026, when the month renders, then the table is labelled "October 2026", has 7 headers with abbreviations Sun to Sat, and 5 rows from Sun 27 Sep to Sat 31 Oct, with 27–30 Sep shaded as outside the month. (L2-121)
- **AC-2** Given Sat 17 Oct with 4 occurrences, when the month renders, then the cell shows 2 events by start time and "+2 more", linking to the day. (L2-121)
- **AC-3** Given the GTA Caribbean Food & Trade Expo from Fri 16 to Sun 18 Oct, when the month renders, then Fri 16 shows a bar with `.cal-event--start`, and Sat 17 and Sun 18 show "continues" bars. Each later bar's link name starts "GTA Caribbean Food & Trade Expo, ". (L2-121)
- **AC-4** Given Thanksgiving on Mon 12 Oct, when the month and week render, then the cell and the week head show "Thanksgiving". (L2-121)
- **AC-5** Given today is Sat 10 Oct, when the month renders, then that date link has `aria-current="date"`, a pepper circle and the name "Saturday 10 October, today, 1 event". (L2-121)
- **AC-6** Given the cancelled Lakeshore Food Truck Rally on Sun 4 Oct and the skipped Jerk Drum Wednesdays stop on Wed 11 Nov, when they render in month, week and agenda, then each is struck through and its link name ends "(cancelled)". (L2-119)
- **AC-7** Given the draft Black cake & sorrel pre-order pickup on Sat 24 Oct, when the month renders, then it has an outline dot and its link name ends "(draft)". (L2-121)
- **AC-8** Given the week of 11–17 Oct, when the week view renders, then the Expo sits in the all-day row across Fri and Sat. Harvest Caribbean Food Fair spans 12–8 p.m. on Sun. On Sat, Little Jamaica Market and Pepper Sauce Throwdown overlap side by side in the left and right lanes. (L2-121)
- **AC-9** Given Sat 17 Oct selected, when `sh-agenda` renders its 4 items, then they appear in start order with time, title and meta: "10 a.m.–6 p.m. GTA Caribbean Food & Trade Expo, Lakeview Expo Centre, Mississauga · day 2 of 3" first. (L2-121)
- **AC-10** Given `sh-type-key`, when it renders, then a list named "Event types" shows Festival, Market, Trade show, Food truck stop, Pop-up and Workshop, each with its type dot. (L2-121)

### States

- **AC-11** Given the month, when the operator activates Sat 17 Oct with Enter or a click, then `selectedChange` emits "2026-10-17" and that date link has `aria-selected="true"` and an ink ring. (L2-121)
- **AC-12** Given the calendar is loading, when it renders with `busy`, then the headers show, each cell holds skeletons, `.cal-wrap` has `aria-busy="true"`, and no date link is focusable. (L2-121)

### Keyboard and focus

- **AC-13** Given October with Sat 10 Oct selected, when a keyboard user tabs into the grid, then exactly one date link (10 Oct) is in the tab order. → moves focus to Sun 11 Oct, ↓ to Sun 18 Oct, Home to Sun 18, End to Sat 24, and Enter selects it. (L2-067)
- **AC-14** Given focus on Sat 31 Oct, when the operator presses →, then `navigate` emits `{ to: 'date', date: '2026-11-01' }` and, once November renders, focus is on Sun 1 Nov and "November 2026" is announced. (L2-121)
- **AC-15** Given keyboard focus on a date, event, "+N more" or agenda item in either theme, when it is displayed, then the focus ring has at least 3:1 contrast against the cell. (L2-067)

### Screen readers

- **AC-16** Given the month, when a screen reader moves through Mon 12 Oct, then it hears the column header "Monday", the link "Monday 12 October, 1 event", "Thanksgiving", and the link "11 a.m. Doubles on Wheels". The dots are not read. (L2-068)
- **AC-17** Given the month in default, selected and loading states, the week view and the agenda, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from the calendar, agenda or type key. (L2-066)

### Theming

- **AC-18** Given the light and the dark theme, when the calendar renders, then titles, times and outside dates have at least 4.5:1 against their cells, today's number at least 4.5:1 on pepper, and every type dot at least 3:1. Cancelled and draft events differ by strike-through or outline as well as colour. (L2-069)

### Responsive

- **AC-19** Given a 360 px viewport, when the month renders, then each cell shows only its date and one dot per type, each date is at least 44 × 44 CSS px, the agenda below lists the selected day, and the page does not scroll horizontally. (L2-121)
- **AC-20** Given a 360 px viewport in week view, when it renders, then the week grid scrolls sideways inside its frame and the page does not. (L2-121)
- **AC-21** Given a 360 px touch viewport, when the toolbar controls and dates are measured, then each is at least 44 × 44 CSS px. (L2-065)
- **AC-22** Given a 1280 px window at 200 % zoom, when the month renders, then every date, event and toolbar control is usable and the page does not scroll horizontally outside the week grid. (L2-064)

### Motion

- **AC-23** Given `prefers-reduced-motion: reduce` or not, when the month changes, the view switches or a day is selected, then the content changes with no animation. (L2-069)

### Performance

- **AC-24** Given October 2026 from the cast, when the operator presses → 20 times in the month grid, then each focus move completes within 50 ms and the table is not re-rendered. (L2-121)

## Implementation notes

- Folder `frontend/projects/components/src/lib/calendar/`; files
  `calendar.component.*`, `agenda.component.*`, `type-key.component.*`,
  `calendar-day.ts`, `calendar-chip.ts`, `week-view.ts`, `week-event.ts`,
  `event-type.ts`, one type per file.
- Styles: the "Calendar" section of `components.css` moves into the
  component, class names unscoped.
- Mock catch-up: the mocks put every date link in the tab order and use links
  for Month and Week. The component uses one roving tab stop (D-2) and
  `aria-pressed` buttons for the view switch (D-3).
- Composes [icon button](icon-button.md), [button](button.md),
  [button group](button-group.md) and [skeleton](skeleton.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, as every CRD does. The class names and attributes in *Markup* are the binding contract.
- **D-2** *Every date link in the tab order, or one roving stop?* One roving stop. The mock note says the arrow keys move between days, and 42 tab stops per month would make the toolbar-to-agenda path long (L2-067). The table keeps native table semantics so the column headers are still read.
- **D-3** *Are Month and Week links or buttons?* Buttons with `aria-pressed`. The view is page state kept in the URL by the page (L2-121 AC11), and the button group CRD uses `aria-pressed` for in-page switches.
- **D-4** *Is there a day grid?* No. The day view is `sh-agenda` with the page's heading and "Add event on <day>" button, as the day mock shows. The component offers Month and Week only.
- **D-5** *Who computes lanes for overlapping week events?* The page's `calendar-view.ts`, which sets `lane`. Two overlapping events take the left and right halves, as the week mock does. When three or more overlap, the week shows the first two by start time, and selecting the day lists all of them in the agenda.
