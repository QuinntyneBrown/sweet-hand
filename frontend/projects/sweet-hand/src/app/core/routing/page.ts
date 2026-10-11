import type { Route } from '@angular/router';

type LoadComponent = NonNullable<Route['loadComponent']>;

/**
 * A lazy page inside the standard container: `<main class="container">` unless
 * `route.data.mainClass` says otherwise. `title` is the page name only
 * (`PageTitleStrategy` adds the site's name).
 */
export function page(path: string, loadComponent: LoadComponent, title: string, route: Omit<Route, 'path' | 'loadComponent' | 'title'> = {}): Route {
  return { path, loadComponent, title, ...route, data: { mainClass: 'container', ...route.data } };
}
