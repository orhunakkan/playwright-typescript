export class UrlManager {
  private baseUrl: string;
  private docsPath: string;

  constructor(baseUrl: string, docsPath: string) {
    this.baseUrl = baseUrl;
    this.docsPath = docsPath;
  }

  isValidDocUrl(url: string): boolean {
    try {
      const urlObj = new URL(url, this.baseUrl);
      return urlObj.hostname === new URL(this.baseUrl).hostname && urlObj.pathname.startsWith(this.docsPath) && !urlObj.hash;
    } catch {
      return false;
    }
  }

  normalizeUrl(url: string): string {
    const urlObj = new URL(url, this.baseUrl);
    urlObj.hash = '';
    return urlObj.href;
  }

  getPathname(url: string): string {
    const urlObj = new URL(url);
    return urlObj.pathname;
  }
}
