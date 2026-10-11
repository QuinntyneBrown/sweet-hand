import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * A group of related controls with its question as the legend
 * (docs/specs/components/form-layout.md, `sh-fieldset`). One help line and one
 * group error serve every control in it.
 */
@Component({
  selector: 'sh-fieldset',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <fieldset class="stack" [attr.aria-describedby]="describedBy()">
      <legend
        >@switch (legendHeading()) {
          @case ('h2') {
            <h2>{{ legend() }}</h2>
          }
          @case ('h3') {
            <h3>{{ legend() }}</h3>
          }
          @default {
            {{ legend() }}
          }
        }@if (optionalMarker()) {&ngsp;<span class="optional">{{ optionalMarker() }}</span>}</legend
      >
      @if (error()) {
        <span class="field__error" [id]="id() + '-error'">{{ error() }}</span>
      }
      @if (help()) {
        <span class="field__help" [id]="id() + '-help'">{{ help() }}</span>
      }
      <ng-content />
    </fieldset>
  `,
})
export class Fieldset {
  readonly legend = input.required<string>();
  readonly legendHeading = input<'h2' | 'h3' | null>(null);
  readonly optionalMarker = input<string | null>(null);
  readonly help = input<string | null>(null);
  readonly error = input<string | null>(null);
  /** The prefix of the help and error ids ("occasions" gives `occasions-error`). */
  readonly fieldId = input<string | null>(null);

  private readonly generated = `sh-fieldset-${++nextId}`;
  protected readonly id = computed(() => this.fieldId() ?? this.generated);
  protected readonly describedBy = computed(() => [this.error() && `${this.id()}-error`, this.help() && `${this.id()}-help`].filter(Boolean).join(' ') || null);
}

/** Two fields side by side from SM (form-layout CRD, `sh-form-row`). */
@Component({
  selector: 'sh-form-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div class="field-row"><ng-content /></div>`,
})
export class FormRow {}

/** The primary action and an optional save status (form-layout CRD, `sh-form-actions`). */
@Component({
  selector: 'sh-form-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div [class]="sticky() ? 'form-actions form-actions--sticky' : 'form-actions'"><ng-content /></div>`,
})
export class FormActions {
  readonly sticky = input(false);
}

/**
 * "Saved", "Saving…", "Not saved: fix 2 things below" (form-layout CRD,
 * `sh-save-status`). In the page intro it is a polite status; inline after a
 * submit button it is plain text.
 */
@Component({
  selector: 'sh-save-status',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (inline()) {
      <span [class]="cls()">@switch (state()) {
          @case ('saving') {
            <span class="dot dot--pulse" aria-hidden="true"></span>
          }
          @case ('error') {
            <svg class="icon--sm" shIcon="danger"></svg>
          }
          @default {
            <svg class="icon--sm" shIcon="success"></svg>
          }
        }{{ text() }}</span
      >
    } @else {
      <p [class]="cls()" role="status">@switch (state()) {
          @case ('saving') {
            <span class="dot dot--pulse" aria-hidden="true"></span>
          }
          @case ('error') {
            <svg class="icon--sm" shIcon="danger"></svg>
          }
          @default {
            <svg class="icon--sm" shIcon="success"></svg>
          }
        }{{ text() }}</p>
    }
  `,
})
export class SaveStatus {
  readonly state = input<'saved' | 'saving' | 'error'>('saved');
  readonly text = input.required<string>();
  readonly inline = input(false);

  protected readonly cls = computed(() => ['save-status', this.state() === 'saved' && 'save-status--saved', this.state() === 'error' && 'save-status--error'].filter(Boolean).join(' '));
}
