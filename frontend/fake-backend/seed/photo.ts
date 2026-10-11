export interface Photo {
  id: string;
  /** File name under docs/mocks/assets/img, served as /media/<file>. */
  file: string;
  caption: string;
  processing?: boolean;
  /** The name an uploaded photo arrived with (manage-photos design). */
  fileName?: string;
}
