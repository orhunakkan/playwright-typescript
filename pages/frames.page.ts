import { Frame, Page } from '@playwright/test';

export class FramesPage {
  readonly locators: {
    headerFrame: () => Frame | null;
    bodyFrame: () => Frame | null;
    footerFrame: () => Frame | null;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      headerFrame: () => page.frame('frame-header'),
      bodyFrame: () => page.frame('frame-body'),
      footerFrame: () => page.frame('frame-footer'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/frames.html`);
      },
    };
  }
}
