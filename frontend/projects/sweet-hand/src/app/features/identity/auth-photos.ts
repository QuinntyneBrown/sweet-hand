import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The row of three round food photos above an account form's heading (mocks: `.auth__head .photo-row`). */
@Component({
  selector: 'app-auth-photos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="photo-row">
      @for (slug of photos(); track $index) {
        <span class="photo"><img [src]="'/media/' + slug + '.jpg?w=400&fm=jpeg'" alt="" width="104" height="104" /></span>
      }
    </div>
  `,
})
export class AuthPhotos {
  readonly photos = input.required<readonly string[]>();
}
