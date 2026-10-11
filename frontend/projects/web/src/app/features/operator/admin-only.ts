/** "Leah Mohammed" or "Leah Mohammed or Ravi Persaud": who to ask on an Admin-only page (L2-056.5). */
export function adminsToAsk(admins: string[]): string {
  return admins.length ? new Intl.ListFormat('en-CA', { style: 'long', type: 'disjunction' }).format(admins) : $localize`:@@operator.anAdmin:an Admin`;
}
