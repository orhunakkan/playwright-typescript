import { describe, expect, it } from 'vitest';
import { escapeHtml, html, raw, SafeHtml } from '../../../src/ui/html.ts';

describe('the html template', () => {
  it('NFR-07: escapes <script>, quotes and & in every interpolated string', () => {
    const title = `<script>alert("x")</script> & 'friends'`;

    expect(html`<h1 title="${title}">${title}</h1>`.value).toBe(
      '<h1 title="&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;friends&#39;">' +
        '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;friends&#39;</h1>',
    );
  });

  it('NFR-07: an attribute value can never break out of its quotes', () => {
    const attack = '" onmouseover="alert(1)';

    expect(html`<a href="/x?q=${attack}">x</a>`.value).toBe('<a href="/x?q=&quot; onmouseover=&quot;alert(1)">x</a>');
  });

  it('NFR-07: nested templates are inserted as markup, once, without double escaping', () => {
    const item = (name: string) => html`<li>${name}</li>`;

    // Prettier reflows markup in html`` templates, and this test is about exact output.
    // prettier-ignore
    const list = html`<ul>${['a&b', '<i>'].map(item)}</ul>`;

    expect(list.value).toBe('<ul><li>a&amp;b</li><li>&lt;i&gt;</li></ul>');
  });

  it('NFR-07: raw() keeps trusted constant markup as it is', () => {
    expect(html`<p>${raw('&nbsp;<br>')}</p>`.value).toBe('<p>&nbsp;<br></p>');
  });

  it('NFR-07: null, undefined and false render as nothing; numbers, true and 0 as text', () => {
    const missing: string | undefined = undefined;

    expect(html`[${null}][${missing}][${false}][${0}][${42}][${true}]`.value).toBe('[][][][0][42][true]');
  });

  it('NFR-07: escapeHtml handles every special character and leaves the rest, including unicode', () => {
    expect(escapeHtml(`&<>"' Zürich — 東京`)).toBe('&amp;&lt;&gt;&quot;&#39; Zürich — 東京');
  });

  it('NFR-07: SafeHtml converts to its markup as a string', () => {
    expect(String(new SafeHtml('<b>x</b>'))).toBe('<b>x</b>');
    expect(html`<i>${'<'}</i>`.toString()).toBe('<i>&lt;</i>');
  });
});
