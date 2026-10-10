/**
 * Display rules of the caterer page (docs/detailed-designs/discovery/view-caterer-page):
 * description paragraphs, the guest range and the text used for link previews.
 */

/** Blank-line-separated blocks become paragraphs (L2-015.2); the text itself is rendered as text, never HTML. */
export function paragraphs(description: string): string[] {
  return description
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** The meta and Open Graph description: the description's opening, cut at a word near 160 characters. */
export function previewText(description: string, max = 160): string {
  const text = description.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '')}…`;
}
