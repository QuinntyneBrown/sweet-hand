import { ApplicationRef, EnvironmentInjector, Injectable, createComponent, inject, type ComponentRef } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { EnquiryDraftStore } from '../../../core/enquiry/enquiry-draft-store';
import { EnquiryLauncher, RESUME_PARAM, RESUME_VALUE, type EnquiryTarget } from '../../../core/enquiry/enquiry-launcher';
import type { EnquiryFormDialog, EnquiryFormRequest } from './enquiry-form-dialog';

/**
 * Opens the enquiry form over the caterer page (send-enquiry design,
 * `EnquiryFormDialog`). The dialog renders through the modal layer at the end
 * of `<body>`; leaving the page closes it.
 */
@Injectable({ providedIn: 'root' })
export class DialogEnquiryLauncher extends EnquiryLauncher {
  private readonly appRef = inject(ApplicationRef);
  private readonly environment = inject(EnvironmentInjector);
  private readonly router = inject(Router);
  private readonly drafts = inject(EnquiryDraftStore);
  private current: ComponentRef<EnquiryFormDialog> | null = null;
  /** Counts openings, so a navigation while the form is loading cancels it. */
  private opening = 0;

  constructor() {
    super();
    this.router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe(() => this.dismiss());
  }

  open(caterer: EnquiryTarget, trigger: HTMLElement | null): void {
    void this.show({ caterer, trigger });
  }

  resume(caterer: EnquiryTarget, trigger: HTMLElement | null): void {
    const url = this.router.parseUrl(this.router.url);
    if (url.queryParams[RESUME_PARAM] !== RESUME_VALUE) return;
    // Drop the marker first, so a reload or Back does not reopen the form.
    delete url.queryParams[RESUME_PARAM];
    const restored = this.drafts.get(caterer.slug)?.values ?? null;
    void this.router.navigateByUrl(url, { replaceUrl: true }).then(() => this.show({ caterer, trigger, restored }));
  }

  /** The form is loaded on first use, so caterer pages stay light (L2-086). */
  private async show(request: EnquiryFormRequest): Promise<void> {
    this.dismiss();
    const opening = ++this.opening;
    const { EnquiryFormDialog } = await import('./enquiry-form-dialog');
    if (opening !== this.opening) return;
    const ref = createComponent(EnquiryFormDialog, { environmentInjector: this.environment });
    ref.setInput('request', request);
    ref.instance.closed.subscribe(() => this.dismiss());
    this.appRef.attachView(ref.hostView);
    this.current = ref;
  }

  private dismiss(): void {
    this.opening++;
    const ref = this.current;
    if (!ref) return;
    this.current = null;
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}
