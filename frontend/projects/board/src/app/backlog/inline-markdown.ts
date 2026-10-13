const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** The backlog's inline markdown as HTML: `code`, **bold**, *emphasis*; links keep only their text. */
export function inlineMarkdown(text: string): string {
  return text
    .replace(/[&<>"']/g, (c) => ESCAPES[c])
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
