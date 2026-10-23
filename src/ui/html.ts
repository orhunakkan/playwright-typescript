// HTML building with escaping on by default (PLAN.md Phase 6, NFR-07). Every value interpolated into an
// `html` template is escaped unless it is already SafeHtml: either another `html` template or `raw()`, which is
// only for constant markup written in this code base, never for data.

export class SafeHtml {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }
}

/** A value that may appear in a template. null, undefined and false render as nothing, so `cond && html`…`` works. */
export type HtmlValue = SafeHtml | string | number | boolean | null | undefined | readonly HtmlValue[];

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export function raw(markup: string): SafeHtml {
  return new SafeHtml(markup);
}

export function html(strings: TemplateStringsArray, ...values: readonly HtmlValue[]): SafeHtml {
  let out = strings[0] ?? '';
  for (const [index, value] of values.entries()) {
    out += render(value) + (strings[index + 1] ?? '');
  }
  return new SafeHtml(out);
}

function render(value: HtmlValue): string {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  if (value === null || value === undefined || value === false) return '';
  return escapeHtml(String(value));
}
