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
  template: `
    <div class="file-row" role="group" [attr.aria-labelledby]="labelledBy()" [attr.aria-label]="labelledBy() ? null : ariaLabel()" [attr.data-state]="state() === 'failed' ? 'failed' : null">
      <svg shIcon="document"></svg>
      <span class="file-row__name"><span>{{ fileName() }}</span><span class="file-row__meta">{{ meta() }}</span></span>
      <span class="cluster">
        <sh-file-upload [accept]="accept()" size="sm" [disabled]="disabled()" (filesSelected)="replaceSelected.emit($event[0])"
          >{{ replaceLabel() }}<span class="visually-hidden">&ngsp;{{ fileName() }}</span></sh-file-upload
        >
        <button class="btn btn--sm btn--ghost" type="button" [disabled]="disabled()" (click)="removed.emit()">
          {{ removeLabel() }}<span class="visually-hidden">&ngsp;{{ fileName() }}</span>
        </button>
      </span>
    </div>
  `,
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
