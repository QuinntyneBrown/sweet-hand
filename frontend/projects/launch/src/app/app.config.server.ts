import { ChangeDetectionStrategy, Component, type ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { LAUNCH_PAGES } from './launch-pages';

/** Renders nothing: the router exists only so the builder can discover the pages to prerender. */
@Component({ selector: 'launch-prerender-route', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class PrerenderRoute {}

/** Build-time providers: the browser bundle carries no router (app.config.ts). */
export const serverConfig: ApplicationConfig = mergeApplicationConfig(appConfig, {
  providers: [provideRouter(LAUNCH_PAGES.map((path) => ({ path, component: PrerenderRoute }))), provideServerRendering(withRoutes(serverRoutes))],
});
