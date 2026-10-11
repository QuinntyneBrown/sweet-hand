import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Checkbox, Dialog, FileUpload, FormField, FormSummary, Icon, Textarea, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { PHOTO_TYPES, readUpload } from './photo-rules';
import { CatererProfileService, type OwnPhotoView, type OwnProfileView } from '@sweet-hand/api';

/** Photo details (docs/mocks/dialogs/photo-details; manage-photos, PhotoDetailsDialog): caption, cover, replace, remove. */
@Component({
  selector: 'app-photo-details-dialog',
  imports: [Alert, Checkbox, Dialog, FileUpload, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      [form]="true"
      title="Photo details"
      i18n-title="@@photoDetails.title"
      [description]="positionText()"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage()"
      (dismissed)="closed.emit()"
      (submitted)="save()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" [title]="failedTitle()"
          ><ng-container i18n="@@photoDetails.failedText">Your caption is still here. Check your connection and try again.</ng-container></sh-alert
        >
      }
      <sh-form-summary heading="Fix 1 thing to save" i18n-heading="@@photoDetails.fixOne" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="photo-summary" />
      @if (photo()?.image; as image) {
        <div class="dialog__photo">
          <span class="photo"><img [src]="image.src" [alt]="photo()!.caption" width="160" height="160" /></span>
        </div>
      }
      <sh-form-field
        label="Caption"
        i18n-label="@@photoDetails.caption"
        controlId="caption"
        [error]="captionError()"
        [help]="captionError() ? null : captionHelp"
        [counter]="counter()"
        [counterOver]="caption().trim().length > 125"
      >
        <sh-textarea name="caption" [rows]="2" [autofocus]="true" [readonly]="busy()" [value]="caption()" (valueChange)="caption.set($event)" />
      </sh-form-field>
      <sh-checkbox
        name="cover"
        [checked]="cover()"
        (checkedChange)="cover.set($event)"
        [disabled]="busy() || position() === 1"
        description="Shown on your listing card and when your page is shared"
        i18n-description="@@photoDetails.coverHelp"
        ><ng-container i18n="@@photoDetails.cover">Use as cover photo</ng-container></sh-checkbox
      >
      <div class="field">
        <span class="cluster">
          <sh-file-upload [accept]="photoTypes" inputId="replace" describedBy="replace-help" [disabled]="busy()" (filesSelected)="replace($event[0])"
            ><svg shIcon="camera"></svg><ng-container i18n="@@photoDetails.replace">Replace photo</ng-container></sh-file-upload
          >
        </span>
        <span class="field__help" id="replace-help" i18n="@@photoDetails.replaceHelp">The new photo keeps this one’s place and caption</span>
      </div>
      <p>
        <button class="btn btn--link btn--sm" type="button" aria-haspopup="dialog" [disabled]="busy()" (click)="removeRequested.emit()">
          <svg shIcon="trash"></svg><ng-container i18n="@@photoDetails.remove">Remove photo</ng-container>
        </button>
      </p>
      <button slot="footer" class="btn btn--primary" type="submit" [attr.aria-busy]="busy() ? 'true' : null" [attr.aria-disabled]="busy() ? 'true' : null">
        @if (failed()) {
          <ng-container i18n="@@common.tryAgain">Try again</ng-container>
        } @else {
          <ng-container i18n="@@common.save">Save</ng-container>
        }
      </button>
    </sh-dialog>
  `,
})
export class PhotoDetailsDialog {
  private readonly api = inject(CatererProfileService);

  readonly open = input(false);
  readonly photo = input<OwnPhotoView | null>(null);
  readonly position = input(1);
  readonly total = input(1);

  readonly closed = output<void>();
  /** The saved profile and whether the photo became the cover. */
  readonly saved = output<{ profile: OwnProfileView; cover: boolean }>();
  readonly replaced = output<OwnPhotoView>();
  readonly removeRequested = output<void>();

  protected readonly photoTypes = PHOTO_TYPES;
  protected readonly caption = signal('');
  protected readonly cover = signal(false);
  protected readonly busy = signal(false);
  protected readonly failed = signal<'save' | 'replace' | null>(null);
  protected readonly captionError = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly captionHelp = $localize`:@@photoDetails.captionHelp:Describe the food for people who can’t see the photo`;

  protected readonly positionText = computed(() => $localize`:@@photoDetails.position:Photo ${this.position()}:n: of ${this.total()}:total:`);
  protected readonly counter = computed(() => $localize`:@@photoDetails.counter:${this.caption().trim().length}:count: / 125`);
  protected readonly summary = computed<SummaryItem[]>(() => (this.captionError() ? [{ controlId: 'caption', message: this.captionError()! }] : []));
  protected readonly busyMessage = computed(() =>
    this.failed() === 'replace' || this.replacing() ? $localize`:@@photoDetails.replacing:Replacing the photo` : $localize`:@@photoDetails.busy:Saving the photo details`,
  );
  protected readonly failedTitle = computed(() =>
    this.failed() === 'replace' ? $localize`:@@photoDetails.replaceFailed:We couldn’t replace this photo` : $localize`:@@photoDetails.failedTitle:We couldn’t save this photo’s details`,
  );
  private readonly replacing = signal(false);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const p = this.photo();
      untracked(() => {
        this.caption.set(p?.caption ?? '');
        this.cover.set(false);
        this.failed.set(null);
        this.captionError.set(null);
        this.attempt.set(0);
      });
    });
  }

  /** Captions describe the photo in 5–125 characters (L2-042.3); "Use as cover photo" moves it to position 1 (L2-042.6). */
  protected async save(): Promise<void> {
    const p = this.photo();
    if (!p || this.busy()) return;
    const caption = this.caption().trim();
    if (caption.length < 5 || caption.length > 125) {
      this.captionError.set($localize`:@@photoDetails.captionError:Captions describe the photo in 5–125 characters`);
      this.attempt.update((n) => n + 1);
      return;
    }
    this.captionError.set(null);
    this.failed.set(null);
    this.busy.set(true);
    try {
      const profile = await firstValueFrom(this.api.updatePhoto(p.id, { caption, useAsCover: this.cover() }));
      this.saved.emit({ profile, cover: this.cover() });
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['caption']) {
        this.captionError.set(problem.errors['caption'][0]);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set('save');
      }
    } finally {
      this.busy.set(false);
    }
  }

  /** The new image takes this one's place and caption (L2-042.2). */
  protected async replace(file: File): Promise<void> {
    const p = this.photo();
    if (!p || this.busy()) return;
    this.busy.set(true);
    this.replacing.set(true);
    this.failed.set(null);
    try {
      const photo = await firstValueFrom(this.api.replacePhoto(p.id, await readUpload(file)));
      this.replaced.emit(photo);
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['file']) {
        this.captionError.set(null);
        this.failed.set('replace');
      } else {
        this.failed.set('replace');
      }
    } finally {
      this.busy.set(false);
      this.replacing.set(false);
    }
  }
}
