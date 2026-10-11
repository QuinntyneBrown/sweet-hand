import { type HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CertificateRequest } from '../models/certificate-request';
import type { CertificateView } from '../models/certificate-view';
import type { DishRequest } from '../models/dish-request';
import type { OwnPhotoView } from '../models/own-photo-view';
import type { OwnProfileView } from '../models/own-profile-view';
import type { OwnReviewPageView } from '../models/own-review-page-view';
import type { ReferenceDataView } from '../models/reference-data-view';
import type { SectionRequest } from '../models/section-request';
import type { UploadRequest } from '../models/upload-request';

/**
 * The signed-in caterer's own profile (set-up-profile, edit-published-profile,
 * manage-photos, manage-menu, provide-food-handler-certificate,
 * submit-profile-for-review and respond-to-review designs). The profile is
 * always the session's own; no call names a caterer.
 */
export abstract class CatererProfileService {
  abstract profile(): Observable<OwnProfileView>;
  abstract referenceData(): Observable<ReferenceDataView>;
  /** Saves one section as a whole; a published name change waits for review (L2-044.2). */
  abstract saveSection(request: SectionRequest): Observable<OwnProfileView>;

  /** Upload events, so the page can show progress (L2-041.1). */
  abstract uploadPhoto(request: UploadRequest): Observable<HttpEvent<OwnPhotoView>>;
  abstract replacePhoto(photoId: string, request: UploadRequest): Observable<OwnPhotoView>;
  abstract updatePhoto(photoId: string, values: { caption: string; useAsCover: boolean }): Observable<OwnProfileView>;
  abstract reorderPhotos(photoIds: string[]): Observable<OwnProfileView>;
  abstract removePhoto(photoId: string): Observable<OwnProfileView>;
  /** Puts a just-removed photo back where it was ("Undo"). */
  abstract restorePhoto(photoId: string): Observable<OwnProfileView>;

  abstract addDish(dish: DishRequest): Observable<OwnProfileView>;
  abstract updateDish(dishId: string, dish: DishRequest): Observable<OwnProfileView>;
  abstract removeDish(dishId: string): Observable<OwnProfileView>;
  abstract reorderDishes(dishIds: string[]): Observable<OwnProfileView>;

  abstract saveCertificate(request: CertificateRequest): Observable<CertificateView>;
  abstract uploadCertificateFile(request: UploadRequest): Observable<CertificateView>;
  abstract removeCertificateFile(): Observable<CertificateView>;

  /** HTTP 422 with every failed rule when the profile is not ready (L2-039.3). */
  abstract submit(): Observable<OwnProfileView>;
  abstract withdraw(): Observable<OwnProfileView>;

  abstract reviews(page: number): Observable<OwnReviewPageView>;
  /** HTTP 409 when the review already has a response (L2-052.2). */
  abstract respond(reviewId: string, text: string): Observable<OwnReviewPageView['items'][number]>;
  abstract editResponse(reviewId: string, text: string): Observable<OwnReviewPageView['items'][number]>;
  abstract deleteResponse(reviewId: string): Observable<OwnReviewPageView['items'][number]>;
}
