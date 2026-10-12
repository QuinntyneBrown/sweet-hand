/** One line of a story's definition of done; `depth` keeps the markdown's nesting. */
export interface DodItem {
  depth: number;
  text: string;
}
