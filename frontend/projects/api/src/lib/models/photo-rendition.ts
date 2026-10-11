export interface PhotoRendition {
  /** The 160 px rendition for tiles, or the 280 px one for the card. */
  src: string;
  srcset: string;
  width: number;
  height: number;
}
