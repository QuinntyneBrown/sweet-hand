import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, effect, inject, signal, viewChild, viewChildren } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, BackLink, EMPTY_STATE, FileUpload, Icon, PhotoManager, PhotoTile, SaveStatus, Status, ToastNotifier, type PhotoTileLabels } from '@sweet-hand/components';
import { fieldError, problemOf } from '../../../core/forms/problem';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ListingPreview } from '../shared/listing-preview';
import { ProfileData } from '../shared/profile-data';
import { StatusNotice } from '../shared/status-notice';
import { WithdrawDialog } from '../shared/withdraw-dialog';
import { PhotoDetailsDialog } from './photo-details.dialog';
import { MAX_PHOTOS, MIN_PUBLISHED_PHOTOS, PHOTO_TYPES, photoSizeMessage, photosSubtitle, readUpload, tooBig } from './photo-rules';
import { RemovePhotoDialog } from './remove-photo.dialog';
import { CatererProfileService, type OwnPhotoView, type OwnProfileView } from '@sweet-hand/api';
import type { Upload } from './upload';

/** How often photos still processing are checked (L2-041.1: a preview within 10 seconds). */
const PROCESSING_POLL_MS = 10_000;

/** Photos, /dashboard/profile/photos (docs/mocks/pages/profile-photos; manage-photos design, L2-041, L2-042, L2-045.1, L2-091.2). */
@Component({
  selector: 'app-photos-page',
  imports: [RouterLink, Alert, BackLink, EMPTY_STATE, FileUpload, Icon, PhotoManager, PhotoTile, SaveStatus, Status, DashboardLayout, ListingPreview, PhotoDetailsDialog, RemovePhotoDialog, StatusNotice, WithdrawDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photos.page.html',
})
export class PhotosPage {
  private readonly api = inject(CatererProfileService);
  private readonly toasts = inject(ToastNotifier);
  private readonly injector = inject(Injector);
  protected readonly data = new ProfileData(this.api);

  private readonly tiles = viewChildren(PhotoTile);
  private readonly uploadErrorsBox = viewChild<ElementRef<HTMLElement>>('uploadErrorsBox');
  private readonly addInput = viewChild(FileUpload);

  protected readonly photoTypes = PHOTO_TYPES;
  protected readonly uploads = signal<Upload[]>([]);
  protected readonly uploadErrors = signal<{ fileName: string; message: string }[]>([]);
  protected readonly announcement = signal<string | null>(null);
  protected readonly withdrawOpen = signal(false);
  /** The photo whose details dialog is open, and the Edit button that opened it. */
  protected readonly detailsId = signal<string | null>(null);
  protected readonly removeId = signal<string | null>(null);
  private opener: HTMLElement | null = null;
  private nextKey = 0;

  protected readonly photos = computed(() => this.data.profile()?.photos ?? []);
  protected readonly full = computed(() => this.photos().length + this.uploads().length >= MAX_PHOTOS);
  protected readonly processing = computed(() => this.photos().some((p) => p.state === 'Processing'));
  protected readonly subtitle = computed(() => photosSubtitle(this.photos(), this.uploads().length, this.data.readOnly()));
  protected readonly empty = computed(() => !this.photos().length && !this.uploads().length && !this.data.readOnly());
  protected readonly saveText = computed(() => {
    const n = this.uploads().length;
    if (!n) return $localize`:@@autosave.saved:Saved`;
    return n === 1 ? $localize`:@@photos.uploadingOne:Uploading 1 photo…` : $localize`:@@photos.uploadingMany:Uploading ${n}:count: photos…`;
  });
  protected readonly errorsHeading = computed(() => {
    const n = this.uploadErrors().length;
    return n === 1 ? $localize`:@@photos.notAddedOne:1 photo wasn’t added` : $localize`:@@photos.notAddedMany:${n}:count: photos weren’t added`;
  });
  protected readonly previewLabel = computed(() => this.data.previewLabel($localize`:@@preview.yourCard:Your listing card`));
  protected readonly previewHref = computed(() => (this.data.published() ? this.data.pageHref() : null));
  protected readonly details = computed(() => this.photos().find((p) => p.id === this.detailsId()) ?? null);
  protected readonly detailsPosition = computed(() => this.photos().findIndex((p) => p.id === this.detailsId()) + 1);
  protected readonly removing = computed(() => this.photos().find((p) => p.id === this.removeId()) ?? null);
  protected readonly removeBlocked = computed(() => this.data.published() && this.photos().length <= MIN_PUBLISHED_PHOTOS);

  protected readonly labels: PhotoTileLabels = {
    cover: $localize`:@@photos.cover:Cover`,
    moveUp: $localize`:@@photos.moveUp:Move photo {n} up`,
    moveDown: $localize`:@@photos.moveDown:Move photo {n} down`,
    edit: $localize`:@@photos.edit:Edit`,
    editObject: $localize`:@@photos.editObject: photo {n}`,
    missingCaption: $localize`:@@photos.missingCaption:Add a caption`,
    addCaption: $localize`:@@photos.addCaption:Add caption`,
    addCaptionObject: $localize`:@@photos.addCaptionObject: to photo {n}`,
    uploading: $localize`:@@photos.uploadingFile:Uploading {file}`,
    uploadingValue: $localize`:@@photos.uploadingValue:{pct}%, uploading`,
    cancel: $localize`:@@common.cancel:Cancel`,
    cancelObject: $localize`:@@photos.cancelObject: upload of {file}`,
    processing: $localize`:@@photos.processing:Processing`,
  };

  constructor() {
    void this.data.load();
    // While a photo is processing, check on it; it appears by itself once ready (L2-091.2).
    let timer: ReturnType<typeof setInterval> | undefined;
    effect(() => {
      clearInterval(timer);
      if (this.processing()) timer = setInterval(() => void this.checkProcessing(), PROCESSING_POLL_MS);
    });
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      for (const u of this.uploads()) u.subscription?.unsubscribe();
    });
  }

  protected reload(): void {
    void this.data.load();
  }

  private setProfile(profile: OwnProfileView): void {
    this.data.profile.set(profile);
  }

  // Uploads (L2-041)

  protected upload(files: File[]): void {
    this.uploadErrors.set([]);
    const room = MAX_PHOTOS - this.photos().length - this.uploads().length;
    const accepted: File[] = [];
    const refused: { fileName: string; message: string }[] = [];
    for (const file of files) {
      if (tooBig(file)) refused.push({ fileName: file.name, message: photoSizeMessage() });
      else if (accepted.length < room) accepted.push(file);
    }
    this.uploadErrors.set(refused);
    if (!accepted.length) {
      this.afterBatch();
      return;
    }
    let pending = accepted.length;
    for (const file of accepted) {
      void this.send(file).then(() => {
        if (--pending === 0) this.afterBatch(files);
      });
    }
  }

  private afterBatch(files: readonly File[] = []): void {
    // Listed in the order the files were picked, whichever answer came first.
    const order = (name: string) => files.findIndex((f) => f.name === name);
    this.uploadErrors.update((list) => [...list].sort((a, b) => order(a.fileName) - order(b.fileName)));
    if (this.uploadErrors().length) afterNextRender(() => this.uploadErrorsBox()?.nativeElement.focus(), { injector: this.injector });
  }

  private async send(file: File): Promise<void> {
    const key = ++this.nextKey;
    const upload: Upload = { key, file, progress: 0, subscription: null };
    this.uploads.update((list) => [...list, upload]);
    const request = await readUpload(file);
    await new Promise<void>((done) => {
      upload.subscription = this.api.uploadPhoto(request).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((event.loaded / event.total) * 100);
            this.uploads.update((list) => list.map((u) => (u.key === key ? { ...u, progress } : u)));
          } else if (event.type === HttpEventType.Response && event.body) {
            this.accepted(event.body);
          }
        },
        error: (error: unknown) => {
          this.refused(file, error);
          this.finish(key);
          done();
        },
        complete: () => {
          this.finish(key);
          done();
        },
      });
      // Cancelled before it finished: the subscription closes without completing.
      upload.subscription.add(() => {
        this.finish(key);
        done();
      });
    });
  }

  private finish(key: number): void {
    this.uploads.update((list) => list.filter((u) => u.key !== key));
  }

  private accepted(photo: OwnPhotoView): void {
    const p = this.data.profile();
    if (p) this.setProfile({ ...p, photos: [...p.photos, photo] });
    if (photo.state === 'Processing') {
      this.toasts.show({
        tone: 'warning',
        title: $localize`:@@photos.stillProcessing:Still processing`,
        text: $localize`:@@photos.stillProcessingText:${photo.fileName ?? ''}:file: is taking longer than usual. It will appear on your page by itself when it’s ready.`,
      });
    }
    // The checklist and cover come from the server.
    void firstValueFrom(this.api.profile())
      .then((fresh) => this.setProfile(fresh))
      .catch(() => undefined);
  }

  private refused(file: File, error: unknown): void {
    const { status, problem } = problemOf(error);
    const message = fieldError(problem, 'file');
    if (status === 400 && message) {
      this.uploadErrors.update((list) => [...list, { fileName: file.name, message }]);
      return;
    }
    this.toasts.show({
      tone: 'danger',
      title: $localize`:@@photos.uploadFailed:Upload failed`,
      text: $localize`:@@photos.uploadFailedText:${file.name}:file: didn’t upload. Check your connection and try again.`,
      action: { label: $localize`:@@common.retry:Retry`, run: () => this.upload([file]) },
    });
  }

  protected cancelUpload(fileName: string): void {
    const upload = this.uploads().find((u) => u.file.name === fileName);
    upload?.subscription?.unsubscribe();
    if (upload) this.finish(upload.key);
  }

  private async checkProcessing(): Promise<void> {
    const before = this.photos().filter((p) => p.state === 'Processing');
    const fresh = await firstValueFrom(this.api.profile()).catch(() => null);
    if (!fresh) return;
    this.setProfile(fresh);
    for (const was of before) {
      const now = fresh.photos.find((p) => p.id === was.id);
      if (now?.state === 'Ready') {
        this.toasts.show({
          tone: 'success',
          title: $localize`:@@photos.added:Photo added`,
          text: $localize`:@@photos.addedText:${now.caption ? `“${now.caption}”` : (now.fileName ?? '')}:photo: is now on your page.`,
          action: { label: $localize`:@@dashboard.viewPage:View your page`, href: this.data.pageHref() },
        });
      }
    }
  }

  // Order and cover (L2-042.1, L2-042.6)

  private moveSeq = 0;

  /** The order changes at once and is saved in the background; only the latest answer is applied (L2-042.1). */
  protected async move(event: { position: number; direction: 'up' | 'down' }): Promise<void> {
    const before = this.data.profile();
    if (!before) return;
    const photos = [...before.photos];
    const from = event.position - 1;
    const to = event.direction === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= photos.length) return;
    const [moved] = photos.splice(from, 1);
    photos.splice(to, 0, moved);
    this.setProfile({ ...before, photos });
    this.announcement.set(
      to === 0
        ? $localize`:@@photos.movedCover:Photo ${event.position}:from: moved to position 1. It is now your cover.`
        : $localize`:@@photos.moved:Photo ${event.position}:from: moved to position ${to + 1}:to:.`,
    );
    // Focus follows the photo to its new tile, on the same direction's button (photo-tile CRD).
    afterNextRender(() => this.tiles()[to]?.focusMove(event.direction), { injector: this.injector });
    const seq = ++this.moveSeq;
    try {
      const profile = await firstValueFrom(this.api.reorderPhotos(photos.map((p) => p.id)));
      if (seq === this.moveSeq) this.setProfile(profile);
      this.toasts.show({ tone: 'info', title: $localize`:@@photos.orderSaved:Photo order saved`, text: $localize`:@@photos.orderSavedText:Your page shows the new order within a minute.` });
    } catch {
      if (seq === this.moveSeq) void this.data.load();
      this.toasts.show({ tone: 'danger', title: $localize`:@@photos.orderFailed:Photo order not saved`, text: $localize`:@@photos.orderFailedText:Check your connection and try again.` });
    }
  }

  // Details, replace and remove

  protected openDetails(position: number): void {
    this.opener = document.activeElement as HTMLElement | null;
    this.detailsId.set(this.photos()[position - 1]?.id ?? null);
  }

  protected detailsSaved(event: { profile: OwnProfileView; cover: boolean }): void {
    const position = this.detailsPosition();
    this.setProfile(event.profile);
    this.detailsId.set(null);
    this.toasts.show(
      event.cover
        ? { tone: 'success', title: $localize`:@@photos.coverChanged:Cover photo changed`, text: $localize`:@@photos.coverChangedText:It leads your listing card within a minute.` }
        : { tone: 'success', title: $localize`:@@photos.captionSaved:Caption saved`, text: $localize`:@@photos.captionSavedText:Photo ${position}:n: has a new caption.` },
    );
  }

  protected replaced(photo: OwnPhotoView): void {
    const p = this.data.profile();
    if (p) this.setProfile({ ...p, photos: p.photos.map((x) => (x.id === photo.id ? photo : x)) });
    this.detailsId.set(null);
    this.toasts.show({ tone: 'success', title: $localize`:@@photos.replaced:Photo replaced`, text: $localize`:@@photos.replacedText:The new photo keeps this one’s place and caption.` });
  }

  protected askToRemove(): void {
    const id = this.detailsId();
    this.detailsId.set(null);
    this.removeId.set(id);
  }

  /** Removed, with Undo for the life of the toast (docs/mocks/notifications/dashboard-toast/with-action). */
  protected removed(event: { profile: OwnProfileView; photo: OwnPhotoView }): void {
    this.setProfile(event.profile);
    this.removeId.set(null);
    afterNextRender(() => this.addInput()?.focus(), { injector: this.injector });
    this.toasts.show({
      tone: 'success',
      title: $localize`:@@photos.removed:Photo removed`,
      text: $localize`:@@photos.removedText:“${event.photo.caption || event.photo.fileName || ''}:caption:” is off your page.`,
      action: {
        label: $localize`:@@common.undo:Undo`,
        run: () =>
          void firstValueFrom(this.api.restorePhoto(event.photo.id))
            .then((profile) => this.setProfile(profile))
            .catch(() => undefined),
      },
    });
  }

  protected removeReturnFocus(): HTMLElement | null {
    return this.opener;
  }

  protected withdrawn(profile: OwnProfileView): void {
    this.setProfile(profile);
    this.withdrawOpen.set(false);
  }
}
