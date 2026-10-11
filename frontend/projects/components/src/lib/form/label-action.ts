import { Directive } from '@angular/core';

/** Marks the label-row action (the password "Show" toggle). */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=labelAction]' })
export class LabelAction {}
