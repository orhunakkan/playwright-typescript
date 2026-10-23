import { html, type SafeHtml } from '../html.ts';

// The page shown for any error outside /api/ (404, 409 invalid transition, 400 bad form, 500, …).

const TITLES: Readonly<Record<number, string>> = {
  400: 'That request is not valid',
  403: 'Blocked',
  404: 'Not found',
  405: 'Not allowed',
  409: "That can't be done",
  413: 'Too large',
  415: 'Not supported',
  421: 'Wrong address',
  500: 'Something went wrong',
};

export function errorTitle(status: number): string {
  return TITLES[status] ?? 'Error';
}

export function errorPage(status: number, message: string): SafeHtml {
  return html`
    <h1>${errorTitle(status)}</h1>
    <p class="error-message">${message}</p>
    <p><a href="/">Back to the board</a></p>
  `;
}
