import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FileUpload } from './file-upload';
import { Icon } from '../icon/icon';

/**
 * An uploaded or chosen file with Replace and Remove (file-upload CRD,
 * `sh-file-row`): the certificate copy.
 */
@Component({
  selector: 'sh-file-row',
  imports: [FileUpload, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './file-row.html',
})
export class FileRow {
  readonly fileName = input.required<string>();
  readonly meta = input.required<string>();
  readonly state = input<'default' | 'failed'>('default');
  readonly labelledBy = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly accept = input.required<string>();
  readonly replaceLabel = input.required<string>();
  readonly removeLabel = input.required<string>();
  readonly disabled = input(false);

  readonly replaceSelected = output<File>();
  readonly removed = output<void>();
}
