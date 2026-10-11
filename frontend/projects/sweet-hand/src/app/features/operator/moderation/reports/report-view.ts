import { monthYear, shortDate, time } from '../../../../core/format/format';
import { daysSince, dayTime, firstName } from '../moderation-text';

export function reportHeading(g: ReportGroupView): string {
  const t = g.target;
  return t.kind === 'Review' ? $localize`:@@report.headingReview:Report about a review of ${t.caterer.name}:caterer:` : $localize`:@@report.headingCaterer:Report about ${t.name}:caterer:`;
}

/** "Report R-2041 · 2 reports · since Thu 8 Oct" */
export function reportSubtitle(g: ReportGroupView, now: Date = new Date()): string {
  const n = g.reports.length === 1 ? $localize`:@@queue.oneReport:1 report` : $localize`:@@queue.reports:${g.reports.length}:count: reports`;
  const since = daysSince(g.since, now) === 0 ? dayTime(g.since, now) : shortDate(g.since, now);
  return $localize`:@@report.subtitle:Report ${g.id}:id: · ${n}:count: · since ${since}:since:`;
}

/** "Thu 8 Oct, 4:12 p.m. · Signed-in customer" */
export function reportByline(r: ReportEntryView, now: Date = new Date()): string {
  const who = r.signedIn ? $localize`:@@report.signedIn:Signed-in customer` : $localize`:@@report.visitor:Visitor, not signed in`;
  return `${dayTime(r.at, now)} · ${who}`;
}

export function eventLine(eventDate: string): string {
  return $localize`:@@reviews.event:Event in ${monthYear(eventDate)}:month:`;
}

export function reviewStatusLabel(g: ReportGroupView): { tone: 'published' | 'hidden' | 'removed'; label: string } {
  const t = g.target;
  if (t.kind !== 'Review') return { tone: 'published', label: '' };
  if (t.status === 'Hidden')
    return t.hiddenBy === 'reports'
      ? { tone: 'hidden', label: $localize`:@@report.hiddenAuto:Hidden automatically` }
      : { tone: 'hidden', label: $localize`:@@report.hiddenOperator:Hidden by an operator` };
  if (t.status === 'Removed') return { tone: 'removed', label: $localize`:@@report.reviewRemoved:Removed` };
  return { tone: 'published', label: $localize`:@@report.showing:Showing on ${t.caterer.name}:caterer:’s page` };
}

export function privacyNote(g: ReportGroupView): string {
  const t = g.target;
  if (t.kind === 'Review') return $localize`:@@report.neverSeeReview:${t.author}:author: and ${t.caterer.name}:caterer: never see who reported this.`;
  return g.reports.every((r) => !r.signedIn)
    ? $localize`:@@report.neverSeeVisitors:${t.name}:caterer: never sees who reported it. Visitors leave no email, so nobody is told the outcome.`
    : $localize`:@@report.neverSee:${t.name}:caterer: never sees who reported it.`;
}

function outcomeWords(outcome: ReportOutcome): string {
  switch (outcome) {
    case 'dismissed':
      return $localize`:@@report.outcomeDismissed:dismissed`;
    case 'hidden':
      return $localize`:@@report.outcomeHidden:review hidden`;
    case 'review-removed':
      return $localize`:@@report.outcomeReviewRemoved:review removed`;
    case 'suspended':
      return $localize`:@@report.outcomeSuspended:caterer suspended`;
    case 'removed':
      return $localize`:@@report.outcomeRemoved:caterer removed`;
  }
}

/** "Resolved at 10:52 a.m. by Leah Mohammed: review hidden" */
export function resolvedTitle(g: ReportGroupView, now: Date = new Date()): string {
  const r = g.resolution!;
  const when = daysSince(r.at, now) === 0 ? time(r.at) : dayTime(r.at, now);
  return $localize`:@@report.resolvedTitle:Resolved at ${when}:when: by ${r.by}:name:: ${outcomeWords(r.outcome)}:outcome:`;
}

export function resolvedText(g: ReportGroupView): string {
  const r = g.resolution!;
  const t = g.target;
  const told = r.reporterEmailed
    ? $localize`:@@report.reporterTold:The signed-in reporter was emailed that their report was reviewed, without the outcome.`
    : $localize`:@@report.nobodyTold:Visitors leave no email, so no reporter was told.`;
  if (r.outcome === 'dismissed') return `${$localize`:@@report.dismissNote:Note: “${r.note}:note:”`} ${told}`;
  const recipient = t.kind === 'Review' ? t.author : firstName(t.owner);
  return `${$localize`:@@report.reasonSent:Reason sent to ${recipient}:name:: “${r.note}:reason:”`} ${told}`;
}

/** "Hidden from Maracas Bay's page since 8:05 a.m." */
export function hiddenTitle(g: ReportGroupView, now: Date = new Date()): string {
  const t = g.target;
  if (t.kind !== 'Review' || !t.hiddenAt) return '';
  const when = daysSince(t.hiddenAt, now) === 0 ? time(t.hiddenAt) : dayTime(t.hiddenAt, now);
  return $localize`:@@report.hiddenTitle:Hidden from ${t.caterer.name}:caterer:’s page since ${when}:when:`;
}

export function hiddenText(g: ReportGroupView): string {
  return $localize`:@@report.hiddenText:Reported ${g.reports.length}:count: times within 7 days. It stays hidden, and out of the rating, until you resolve this report. Dismissing puts it back.`;
}
