import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';
import type { IconName } from '../icon/icon-name';

/** Who sees something, with a lock, shield or info icon (card CRD, `sh-private-note`). */
@Component({
  selector: 'sh-private-note',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './private-note.html',
})
export class PrivateNote {
  readonly icon = input<'lock' | 'shield' | 'info'>('lock');
  readonly inline = input(false);
  readonly text = input.required<string>();

  protected readonly iconName = computed<IconName>(() => this.icon());
}
