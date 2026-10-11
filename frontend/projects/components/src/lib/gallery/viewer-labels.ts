/** The viewer's words, from the consumer's resource files (gallery CRD, API). */
export interface ViewerLabels {
  close: string;
  previous: string;
  next: string;
  /** "Loading photo 3 of 6" */
  loading: (n: number, total: number) => string;
  /** "Photo 4 of 6 didn't load" */
  failed: (n: number, total: number) => string;
  failedNote: string;
  retry: string;
}
