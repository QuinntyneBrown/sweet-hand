import { Directive } from '@angular/core';

/** Marks the trailing status, note or action of a record value (`[slot=end]`). */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=end]' })
export class DescriptionEnd {}
