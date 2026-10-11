import { InjectionToken } from '@angular/core';
import { type HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CertificateRequest, CertificateView, DishRequest, OwnPhotoView, OwnProfileView, OwnReviewPageView, ReferenceDataView, SectionRequest, UploadRequest } from '../models/caterer-profile.models';

/**
 * The signed-in caterer's own profile (set-up-profile, edit-published-profile,
 * manage-photos, manage-menu, provide-food-handler-certificate,
 * submit-profile-for-review and respond-to-review designs). The profile is
 * always the session's own; no call names a caterer.
 */
export interface ICatererProfileService {
  profile(): Observable<OwnProfileView>;
  referenceData(): Observable<ReferenceDataView>;
  /** Saves one section as a whole; a published name change waits for review (L2-044.2). */
  saveSection(request: SectionRequest): Observable<OwnProfileView>;

  /** Upload events, so the page can show progress (L2-041.1). */
  uploadPhoto(request: UploadRequest): Observable<HttpEvent<OwnPhotoView>>;
  replacePhoto(photoId: string, request: UploadRequest): Observable<OwnPhotoView>;
  updatePhoto(photoId: string, values: { caption: string; useAsCover: boolean }): Observable<OwnProfileView>;
  reorderPhotos(photoIds: string[]): Observable<OwnProfileView>;
  removePhoto(photoId: string): Observable<OwnProfileView>;
  /** Puts a just-removed photo back where it was ("Undo"). */
  restorePhoto(photoId: string): Observable<OwnProfileView>;

  addDish(dish: DishRequest): Observable<OwnProfileView>;
  updateDish(dishId: string, dish: DishRequest): Observable<OwnProfileView>;
  removeDish(dishId: string): Observable<OwnProfileView>;
  reorderDishes(dishIds: string[]): Observable<OwnProfileView>;

  saveCertificate(request: CertificateRequest): Observable<CertificateView>;
  uploadCertificateFile(request: UploadRequest): Observable<CertificateView>;
  removeCertificateFile(): Observable<CertificateView>;

  /** HTTP 422 with every failed rule when the profile is not ready (L2-039.3). */
  submit(): Observable<OwnProfileView>;
  withdraw(): Observable<OwnProfileView>;

  reviews(page: number): Observable<OwnReviewPageView>;
  /** HTTP 409 when the review already has a response (L2-052.2). */
  respond(reviewId: string, text: string): Observable<OwnReviewPageView['items'][number]>;
  editResponse(reviewId: string, text: string): Observable<OwnReviewPageView['items'][number]>;
  deleteResponse(reviewId: string): Observable<OwnReviewPageView['items'][number]>;
}

export const CATERER_PROFILE_SERVICE = new InjectionToken<ICatererProfileService>('CATERER_PROFILE_SERVICE');
