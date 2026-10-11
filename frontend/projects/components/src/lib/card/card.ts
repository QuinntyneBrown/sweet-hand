import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon, type IconName } from '../icon/icon';

/**
 * A bounded surface for one self-contained thing (docs/specs/components/card.md).
 * With `href` the whole card is one link: the title's link is stretched over it.
 */
@Component({
  selector: 'sh-card',
  imports: [NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div [class]="cls()" [attr.role]="selectedAttr() ? 'option' : null" [attr.aria-selected]="selectedAttr() ? selected() : null">
      @if (heading() !== null) {
        @if (href()) {
          <ng-container *ngTemplateOutlet="titleTpl" />
        } @else {
          <div class="card__header">
            <ng-container *ngTemplateOutlet="titleTpl" />
            <ng-content select="[slot=meta]" />
          </div>
        }
      }
      <ng-content />
      <ng-content select="[slot=footer]" />
    </div>
    <ng-template #titleTpl>
      @switch (headingLevel()) {
        @case (2) {
          <h2 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h2>
        }
        @case (4) {
          <h4 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h4>
        }
        @case (5) {
          <h5 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h5>
        }
        @case (null) {
          <p class="card__title"><ng-container *ngTemplateOutlet="titleText" /></p>
        }
        @default {
          <h3 class="card__title"><ng-container *ngTemplateOutlet="titleText" /></h3>
        }
      }
    </ng-template>
    <ng-template #titleText>
      @if (href(); as link) {
        <a [routerLink]="link">{{ heading() }}</a>
      } @else {
        {{ heading() }}
      }
    </ng-template>
  `,
})
export class Card {
  readonly flush = input(false);
  /** Makes the whole card one link; the footer and meta slots are not allowed with it. */
  readonly href = input<string | null>(null);
  readonly heading = input<string | null>(null);
  readonly headingLevel = input<2 | 3 | 4 | 5 | null>(3);
  readonly selected = input(false);
  readonly selectedAttr = input(false);

  protected readonly cls = computed(() =>
    ['card', this.flush() && 'card--flush', this.href() && 'card--interactive', this.selected() && 'card--selected'].filter(Boolean).join(' '),
  );
}

/** Quoted or secondary content on a sunken surface: `div`, `figure` or `fieldset` (card CRD, `sh-well`). */
@Component({
  selector: 'sh-well',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @switch (tag()) {
      @case ('fieldset') {
        <fieldset [class]="cls()">
          <legend [class]="legendHidden() ? 'visually-hidden' : null">{{ legend() }}</legend>
          <ng-container *ngTemplateOutlet="body" />
        </fieldset>
      }
      @case ('figure') {
        <figure [class]="cls()"><ng-container *ngTemplateOutlet="body" /></figure>
      }
      @default {
        <div [class]="cls()"><ng-container *ngTemplateOutlet="body" /></div>
      }
    }
    <ng-template #body><ng-content /></ng-template>
  `,
})
export class Well {
  readonly as = input<'div' | 'figure' | 'fieldset'>('div');
  /** `as()` cannot be called in a template, where `as` is a keyword. */
  protected readonly tag = computed(() => this.as());
  readonly stack = input(true);
  readonly legend = input<string>('');
  readonly legendHidden = input(false);

  protected readonly cls = computed(() => (this.stack() ? 'well stack stack--sm' : 'well'));
}

/** The sunken line that ends a closed thread (card CRD, `sh-closed-note`). */
@Component({
  selector: 'sh-closed-note',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<p class="closed-note">{{ text() }}</p>`,
})
export class ClosedNote {
  readonly text = input.required<string>();
}

/** Contact details shared in a thread, as plain text (card CRD, `sh-contact-card`). */
@Component({
  selector: 'sh-contact-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="contact-card">
      <strong>{{ heading() }}</strong>
      @if (email()) {
        <span>{{ email() }}</span>
      }
      @if (phone()) {
        <span>{{ phone() }}</span>
      }
    </div>
  `,
})
export class ContactCard {
  readonly heading = input.required<string>();
  readonly email = input<string | null>(null);
  readonly phone = input<string | null>(null);
}

/** Who sees something, with a lock, shield or info icon (card CRD, `sh-private-note`). */
@Component({
  selector: 'sh-private-note',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (inline()) {
      <span class="private-note"><svg class="icon--sm" [shIcon]="iconName()"></svg>{{ text() }}</span>
    } @else {
      <p class="private-note"><svg class="icon--sm" [shIcon]="iconName()"></svg>{{ text() }}</p>
    }
  `,
})
export class PrivateNote {
  readonly icon = input<'lock' | 'shield' | 'info'>('lock');
  readonly inline = input(false);
  readonly text = input.required<string>();

  protected readonly iconName = computed<IconName>(() => this.icon());
}

/** The caterer page's side column at LG and XL (card CRD, `sh-enquiry-panel`). */
@Component({
  selector: 'sh-enquiry-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (skeleton()) {
      <aside class="enquiry-panel only-lg" aria-hidden="true">
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--text"></span>
        <span class="skeleton skeleton--rect"></span>
      </aside>
    } @else {
      <aside class="enquiry-panel only-lg" [attr.aria-label]="label()">
        <ng-content />
        <ng-content select="[slot=action]" />
        @if (note()) {
          <p class="enquiry-panel__note">{{ note() }}</p>
        }
      </aside>
    }
  `,
})
export class EnquiryPanel {
  readonly label = input.required<string>();
  readonly note = input<string | null>(null);
  readonly skeleton = input(false);
}
