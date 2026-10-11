import { Radio } from './radio';

export interface RadioGroupContext {
  name: () => string;
  value: () => string | null;
  variant: () => 'plain' | 'card';
  required: () => boolean;
  isDisabled: () => boolean;
  invalid: () => boolean;
  isAutofocusTarget(radio: Radio): boolean;
  autofocus: () => boolean;
  choose(value: string): void;
}
