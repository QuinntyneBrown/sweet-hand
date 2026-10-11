import { RenderMode, type ServerRoute } from '@angular/ssr';

/** Every page is prerendered at build time; the output is static files only (L2-105.1). */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
