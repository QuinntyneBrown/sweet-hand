let last = 0;
/** A number that only increases within this process, to order records written in the same instant. */
export function nextSequence(): number {
  last = Math.max(last + 1, Math.floor((performance.timeOrigin + performance.now()) * 1000));
  return last;
}
