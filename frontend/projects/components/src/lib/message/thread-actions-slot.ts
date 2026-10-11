import { Directive } from '@angular/core';

/** Marks content for the thread's action row (`slot="actions"`). */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=actions]' })
export class ThreadActionsSlot {}
