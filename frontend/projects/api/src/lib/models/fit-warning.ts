export interface FitWarning {
  kind: 'area' | 'guests';
  /** Area name for an `area` warning. */
  area?: string;
  /** The caterer's guest range for a `guests` warning. */
  min?: number;
  max?: number;
}
