import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/** Quoted or secondary content on a sunken surface: `div`, `figure` or `fieldset` (card CRD, `sh-well`). */
@Component({
  selector: 'sh-well',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './well.html',
})
export class Well {
  readonly as = input<'div' | 'figure' | 'fieldset'>('div');
  /** `as()` cannot be called in a template, where `as` is a keyword. */
  protected readonly tag = computed(() => this.as());
  readonly stack = input(true);
  readonly legend = input<string>('');
  readonly legendHidden = input(false);

  protected readonly cls = computed(() => (this.stack() ? 'well stack stack--sm' : 'well'));
}
