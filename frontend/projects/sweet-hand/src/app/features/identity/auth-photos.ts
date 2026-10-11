import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The row of three round food photos above an account form's heading (mocks: `.auth__head .photo-row`). */
@Component({
  selector: 'app-auth-photos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './auth-photos.html',
})
export class AuthPhotos {
  readonly photos = input.required<readonly string[]>();
}
