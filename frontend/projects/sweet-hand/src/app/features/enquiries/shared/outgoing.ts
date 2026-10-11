export interface Outgoing {
  id: number;
  text: string;
  state: 'pending' | 'failed';
}
