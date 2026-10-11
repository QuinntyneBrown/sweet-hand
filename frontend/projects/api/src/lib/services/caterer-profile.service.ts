import { Injectable, inject } from '@angular/core';
import { HttpClient, type HttpEvent } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CertificateRequest, CertificateView, DishRequest, OwnPhotoView, OwnProfileView, OwnReviewPageView, ReferenceDataView, SectionRequest, UploadRequest } from '../models/caterer-profile.models';
import type { ICatererProfileService } from './caterer-profile.service.contract';

const BASE = '/api/caterer/profile';

@Injectable()
export class CatererProfileService implements ICatererProfileService {
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
