/** A token link from a launch list email (confirm-launch-list-email, leave-launch-list designs). */
export type LaunchLink = { kind: 'confirm'; token: string } | { kind: 'remove'; token: string };

/** Reads the token link the page was opened with. */
export function readLaunchLink(location: Location): LaunchLink | null {
  const query = new URLSearchParams(location.search);
  const confirm = query.get('confirmed');
  if (confirm) return { kind: 'confirm', token: confirm };
  const remove = query.get('remove');
  if (remove) return { kind: 'remove', token: remove };
  return null;
}

/** Drops the token from the address bar, so reloading or sharing shows the default page (L2-099.3, L2-100.6). */
export function clearLaunchLink(location: Location, history: History): void {
  history.replaceState(history.state, '', location.pathname + location.hash);
}
