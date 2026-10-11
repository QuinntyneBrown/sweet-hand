import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  templateUrl: './link.html',
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

