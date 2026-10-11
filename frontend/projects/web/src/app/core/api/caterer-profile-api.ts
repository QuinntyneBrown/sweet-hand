import { Injectable, inject } from '@angular/core';
import { HttpClient, type HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  CertificateRequest,
  CertificateView,
  DishRequest,
  OwnPhotoView,
  OwnProfileView,
  OwnReviewPageView,
  ReferenceDataView,
  SectionRequest,
  UploadRequest,
} from './caterer-profile.models';

/**
 * The signed-in caterer's own profile (set-up-profile, edit-published-profile,
 * manage-photos, manage-menu, provide-food-handler-certificate,
 * submit-profile-for-review and respond-to-review designs). The profile is
 * always the session's own; no call names a caterer.
 */
export abstract class CatererProfileApi {
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

const BASE = '/api/caterer/profile';

@Injectable()
export class HttpCatererProfileApi extends CatererProfileApi {
  private readonly http = inject(HttpClient);

  profile(): Observable<OwnProfileView> {
    return this.http.get<OwnProfileView>(BASE);
  }

  referenceData(): Observable<ReferenceDataView> {
    return this.http.get<ReferenceDataView>(`${BASE}/reference-data`);
  }

  saveSection(request: SectionRequest): Observable<OwnProfileView> {
    return this.http.put<OwnProfileView>(`${BASE}/sections/${request.section}`, request.values);
  }

  uploadPhoto(request: UploadRequest): Observable<HttpEvent<OwnPhotoView>> {
    return this.http.post<OwnPhotoView>(`${BASE}/photos`, request, { observe: 'events', reportProgress: true });
  }

  replacePhoto(photoId: string, request: UploadRequest): Observable<OwnPhotoView> {
    return this.http.post<OwnPhotoView>(`${BASE}/photos/${encodeURIComponent(photoId)}/replacement`, request);
  }

  updatePhoto(photoId: string, values: { caption: string; useAsCover: boolean }): Observable<OwnProfileView> {
    return this.http.patch<OwnProfileView>(`${BASE}/photos/${encodeURIComponent(photoId)}`, values);
  }

  reorderPhotos(photoIds: string[]): Observable<OwnProfileView> {
    return this.http.put<OwnProfileView>(`${BASE}/photos/order`, { photoIds });
  }

  removePhoto(photoId: string): Observable<OwnProfileView> {
    return this.http.delete<OwnProfileView>(`${BASE}/photos/${encodeURIComponent(photoId)}`);
  }

  restorePhoto(photoId: string): Observable<OwnProfileView> {
    return this.http.post<OwnProfileView>(`${BASE}/photos/${encodeURIComponent(photoId)}/restoration`, {});
  }

  addDish(dish: DishRequest): Observable<OwnProfileView> {
    return this.http.post<OwnProfileView>(`${BASE}/menu-items`, dish);
  }

  updateDish(dishId: string, dish: DishRequest): Observable<OwnProfileView> {
    return this.http.put<OwnProfileView>(`${BASE}/menu-items/${encodeURIComponent(dishId)}`, dish);
  }

  removeDish(dishId: string): Observable<OwnProfileView> {
    return this.http.delete<OwnProfileView>(`${BASE}/menu-items/${encodeURIComponent(dishId)}`);
  }

  reorderDishes(dishIds: string[]): Observable<OwnProfileView> {
    return this.http.put<OwnProfileView>(`${BASE}/menu-items/order`, { dishIds });
  }

  saveCertificate(request: CertificateRequest): Observable<CertificateView> {
    return this.http.put<CertificateView>(`${BASE}/certificate`, request);
  }

  uploadCertificateFile(request: UploadRequest): Observable<CertificateView> {
    return this.http.post<CertificateView>(`${BASE}/certificate/file`, request);
  }

  removeCertificateFile(): Observable<CertificateView> {
    return this.http.delete<CertificateView>(`${BASE}/certificate/file`);
  }

  submit(): Observable<OwnProfileView> {
    return this.http.post<OwnProfileView>(`${BASE}/submission`, {});
  }

  withdraw(): Observable<OwnProfileView> {
    return this.http.delete<OwnProfileView>(`${BASE}/submission`);
  }

  reviews(page: number): Observable<OwnReviewPageView> {
    return this.http.get<OwnReviewPageView>('/api/caterer/reviews', { params: { page } });
  }

  respond(reviewId: string, text: string) {
    return this.http.post<OwnReviewPageView['items'][number]>(`/api/caterer/reviews/${encodeURIComponent(reviewId)}/response`, { text });
  }

  editResponse(reviewId: string, text: string) {
    return this.http.put<OwnReviewPageView['items'][number]>(`/api/caterer/reviews/${encodeURIComponent(reviewId)}/response`, { text });
  }

  deleteResponse(reviewId: string) {
    return this.http.delete<OwnReviewPageView['items'][number]>(`/api/caterer/reviews/${encodeURIComponent(reviewId)}/response`);
  }
}
