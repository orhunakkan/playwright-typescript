export class TitleCleaner {
  cleanTitle(title: string): string {
    return title.replace(/\s*\|\s*Playwright\s*$/i, '').trim();
  }
}
