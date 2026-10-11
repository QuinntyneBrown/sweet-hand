import type { Signal } from '@angular/core';
import type { DescriptionLayout } from './description-layout';

export interface DescriptionListContext {
  layout: Signal<DescriptionLayout>;
}
