import { StyleConfig, PDFConfig } from '../config/app-config.js';

export class StyleGenerator {
  constructor(
    private styleConfig: StyleConfig,
    private pdfConfig: PDFConfig
  ) {}

  generateStyles(): string {
    const { backgroundColor, textColor, codeBackgroundColor, codeTextColor, linkColor, columnCount, columnGap } = this.styleConfig;
    const { margins } = this.pdfConfig;

    return `
      <style>
        @page {
          size: A4;
          margin: ${margins.top} ${margins.right} ${margins.bottom} ${margins.left};
          background-color: ${backgroundColor};
        }

        * {
          box-sizing: border-box;
        }

        body {
          background-color: ${backgroundColor};
          color: ${textColor};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }

        html {
          background-color: ${backgroundColor};
        }

        article {
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
        }

        .page-content {
          padding: 20px;
        }

        h1, h2, h3, h4, h5, h6 {
          color: #e4e4e4;
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.25;
        }

        h1 {
          font-size: 2em;
          border-bottom: 1px solid #404040;
          padding-bottom: 0.3em;
        }

        h2 {
          font-size: 1.5em;
          border-bottom: 1px solid #404040;
          padding-bottom: 0.3em;
        }

        h3 {
          font-size: 1.25em;
        }

        a {
          color: ${linkColor};
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        code {
          background-color: ${codeBackgroundColor};
          color: #dcdcaa;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
          font-size: 0.9em;
        }

        pre {
          background-color: ${codeBackgroundColor} !important;
          border-radius: 6px;
          padding: 16px;
          overflow-x: auto;
          margin: 16px 0;
          color: ${codeTextColor} !important;
        }

        pre code {
          background-color: ${codeBackgroundColor} !important;
          padding: 0;
          font-size: 0.85em;
          color: ${codeTextColor} !important;
        }

        pre code *,
        pre *,
        div[class*="codeBlock"] *,
        div[class*="code-block"] *,
        div[class*="language-"] * {
          color: ${codeTextColor} !important;
        }

        div[class*="codeBlock"],
        div[class*="code-block"],
        div[class*="language-"] {
          background-color: ${codeBackgroundColor} !important;
          color: ${codeTextColor} !important;
        }

        .token.comment,
        .token.prolog,
        .token.doctype,
        .token.cdata {
          color: #6a9955 !important;
        }

        .token.punctuation {
          color: #d4d4d4 !important;
        }

        .token.property,
        .token.tag,
        .token.boolean,
        .token.number,
        .token.constant,
        .token.symbol,
        .token.deleted {
          color: #b5cea8 !important;
        }

        .token.selector,
        .token.attr-name,
        .token.string,
        .token.char,
        .token.builtin,
        .token.inserted {
          color: #ce9178 !important;
        }

        .token.operator,
        .token.entity,
        .token.url,
        .language-css .token.string,
        .style .token.string {
          color: #d4d4d4 !important;
        }

        .token.atrule,
        .token.attr-value,
        .token.keyword {
          color: #c586c0 !important;
        }

        .token.function,
        .token.class-name {
          color: #dcdcaa !important;
        }

        .token.regex,
        .token.important,
        .token.variable {
          color: #d16969 !important;
        }

        blockquote {
          border-left: 4px solid ${linkColor};
          padding-left: 16px;
          margin-left: 0;
          color: #b0b0b0;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin: 16px 0;
        }

        th, td {
          border: 1px solid #404040;
          padding: 8px 12px;
          text-align: left;
        }

        th {
          background-color: ${codeBackgroundColor};
          font-weight: 600;
        }

        tr:nth-child(even) {
          background-color: #252526;
        }

        ul, ol {
          padding-left: 2em;
          margin: 16px 0;
        }

        li {
          margin: 4px 0;
        }

        img {
          max-width: 100%;
          height: auto;
          display: none;
        }

        .page-break {
          page-break-after: always;
          break-after: page;
        }

        .toc {
          margin: 0;
          padding: 0;
        }

        .toc h1 {
          text-align: center;
          margin: 0 0 10px 0;
          font-size: 1.8em;
        }

        .toc p {
          text-align: center;
          margin: 0 0 30px 0;
          font-size: 0.9em;
        }

        .toc-content {
          column-count: ${columnCount};
          column-gap: ${columnGap};
          column-rule: 1px solid #404040;
        }

        .toc-section {
          break-inside: avoid;
          min-height: 0;
          page-break-inside: avoid;
        }

        .toc ul {
          list-style-type: none;
          padding-left: 0;
          margin: 0;
        }

        .toc li {
          margin: 3px 0;
          font-size: 0.92em;
          line-height: 1.3;
        }

        .toc li.api-label {
          margin-top: 16px;
          margin-bottom: 8px;
          padding-top: 8px;
          border-top: 1px solid #404040;
          font-size: 0.85em;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .toc li.api-section {
          margin: 2px 0;
        }

        .toc a {
          color: ${linkColor};
          font-size: inherit;
          text-decoration: none;
        }

        .toc a:hover {
          text-decoration: underline;
        }

        .page-header {
          margin-bottom: 30px;
          padding-bottom: 10px;
          border-bottom: 2px solid ${linkColor};
        }

        .page-url {
          color: #888;
          font-size: 0.9em;
          margin-top: 5px;
        }
      </style>
    `;
  }
}
