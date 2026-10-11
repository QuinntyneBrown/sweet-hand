export interface ReferenceDataView {
  /** Active cuisines in alphabetical order, plus retired ones this caterer still holds. */
  cuisines: { id: string; name: string }[];
  regions: { id: string; name: string; areas: { id: string; name: string }[] }[];
  occasions: { id: string; name: string }[];
}
