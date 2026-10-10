import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

/** Paths inside the app are followed by the router; fragments, `mailto:` and other sites by the browser. */
function isAppPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

/**
 * An inline, standalone or external link (docs/specs/components/link.md).
 * Always a real `<a href>`; the label is the projected text and the name.
 */
@Component({
  selector: 'sh-link',
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (appPath()) {
      <a [class]="cls()" [routerLink]="href()" [attr.aria-current]="current() ? 'page' : null" (click)="followed.emit($event)"><ng-container *ngTemplateOutlet="content" /></a>
    } @else {
      <a [class]="cls()" [href]="href()" [attr.aria-current]="current() ? 'page' : null" (click)="followed.emit($event)"><ng-container *ngTemplateOutlet="content" /></a>
    }
    <ng-template #content
      ><ng-content />@if (external()) {<span class="visually-hidden">{{ externalLabel() }}</span
        ><svg class="icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5" /></svg>
      } @else {<ng-content select="[slot=icon]" />}</ng-template
    >
  `,
})
export class Link {
  readonly href = input.required<string>();
  readonly variant = input<'inline' | 'standalone' | null>(null);
  readonly external = input(false);
  readonly externalLabel = input<string | null>(null);
  readonly current = input(false);

  readonly followed = output<MouseEvent>();

  protected readonly appPath = computed(() => isAppPath(this.href()));
  protected readonly cls = computed(() => {
    const standalone = this.variant() === 'standalone' || (this.external() && this.variant() === null);
    return [standalone && 'link--standalone', this.external() && 'link--external'].filter(Boolean).join(' ') || null;
  });
}

/** The `.eyebrow` back link above a page title, naming the page it returns to (link CRD). */
@Component({
  selector: 'sh-back-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<a [class]="untilLg() ? 'eyebrow until-lg' : 'eyebrow'" [routerLink]="href()" (click)="followed.emit($event)"><svg class="icon--sm" shIcon="chevron-left"></svg><ng-content /></a>`,
})
export class BackLink {
  readonly href = input.required<string>();
  readonly untilLg = input(false);

  readonly followed = output<MouseEvent>();
}
