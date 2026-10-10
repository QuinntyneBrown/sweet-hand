// @ts-check
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['projects/**/*.ts'],
    extends: [...tseslint.configs.recommended, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: ['app', 'sh'], style: 'kebab-case' }],
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['app', 'sh'], style: 'camelCase' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['projects/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      // Dialogs and sheets move focus to their first field or Close with autofocus (dialog CRD D-5).
      '@angular-eslint/template/no-autofocus': 'off',
    },
  },
  {
    // Composite widgets (menus, listboxes) handle keys on their container and rove focus inside it.
    files: ['projects/components/**/*.html', 'projects/components/**/*.ts'],
    rules: { '@angular-eslint/template/interactive-supports-focus': 'off', '@angular-eslint/template/click-events-have-key-events': 'off' },
  },
  {
    // User-facing text in the product must be externalised (ADR 0005, L2-064.4).
    files: ['projects/web/src/app/**/*.html'],
    rules: {
      '@angular-eslint/template/i18n': [
        'error',
        {
          checkId: false,
          checkText: true,
          checkAttributes: true,
          ignoreAttributes: ['formRole', 'describedByIds', 'controlId', 'controls', 'live', 'headingLevel', 'returnFocus', 'inputId', 'describedBy', 'extraDescribedBy', 'haspopup', 'searchIcon', 'summaryId', 'formAction', 'slot', 'shIcon', 'bodyAs', 'descriptionRole', 'initialFocus', 'formId', 'queryParamsHandling', 'routerLinkActive', 'class', 'id', 'type', 'name', 'autocomplete', 'inputmode', 'autocapitalize', 'enterkeyhint', 'role', 'variant', 'size', 'icon', 'href', 'routerLink', 'for', 'loading', 'tone', 'spellcheck', 'viewBox', 'd', 'cx', 'cy', 'r', 'x', 'y', 'rx', 'width', 'height', 'method', 'action', 'data-label', 'data-text', 'aria-controls', 'aria-describedby', 'aria-labelledby', 'formControlName', 'formGroupName', 'fragment', 'tabindex', 'accept', 'capture', 'min', 'max', 'step', 'pattern', 'maxlength', 'minlength', 'dir', 'lang', 'srcset', 'sizes', 'src', 'target', 'rel', 'value', 'placement', 'align', 'aria-live', 'aria-hidden', 'aria-current', 'aria-haspopup', 'aria-expanded', 'aria-pressed', 'aria-busy', 'aria-modal', 'aria-atomic', 'aria-invalid', 'aria-required', 'aria-autocomplete', 'aria-orientation', 'aria-selected', 'aria-checked', 'aria-disabled', 'aria-level', 'aria-posinset', 'aria-setsize', 'aria-sort', 'decoding', 'fetchpriority', 'datetime', 'download', 'form', 'list', 'wrap', 'cols', 'rows', 'span', 'colspan', 'rowspan', 'scope', 'headers', 'xmlns', 'fill', 'stroke', 'points', 'transform', 'preserveAspectRatio', 'focusable', 'shape', 'kind', 'status', 'state', 'density', 'layout', 'mode', 'track', 'sortKey', 'labelPosition', 'emphasis', 'surface', 'scheme', 'level', 'tag', 'as', 'columns', 'gap', 'width', 'clip', 'count', 'clearHref', 'allHref', 'panelId', 'suggestions'],
          ignoreTags: ['svg', 'path', 'circle', 'rect', 'polyline', 'line', 'g'],
        },
      ],
    },
  },
);
