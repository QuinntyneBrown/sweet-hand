export type ChangeValue =
  | { kind: 'text'; text: string }
  | { kind: 'guests'; min: number; max: number }
  | { kind: 'list'; items: string[] }
  | { kind: 'dish'; name: string; price: string | null; tags: string[] }
  | { kind: 'photo'; src: string; alt: string };
