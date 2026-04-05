import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class DialogBoxesPage {
  readonly locators: {
    heading: Locator;
    launchAlertButton: Locator;
    launchConfirmButton: Locator;
    launchPromptButton: Locator;
    launchModalButton: Locator;
    modal: Locator;
    modalTitle: Locator;
    modalBodyText: Locator;
    closeButton: Locator;
    saveChangesButton: Locator;
    confirmText: Locator;
    promptText: Locator;
    modalText: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    launchAlert: () => Promise<void>;
    launchConfirm: () => Promise<void>;
    launchPrompt: () => Promise<void>;
    launchModal: () => Promise<void>;
    closeModal: () => Promise<void>;
    saveModal: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Dialog boxes' }),
      launchAlertButton: page.getByRole('button', { name: 'Launch alert' }),
      launchConfirmButton: page.getByRole('button', { name: 'Launch confirm' }),
      launchPromptButton: page.getByRole('button', { name: 'Launch prompt' }),
      launchModalButton: page.getByRole('button', { name: 'Launch modal' }),
      modal: page.locator('#example-modal'),
      modalTitle: page.locator('#exampleModalLabel'),
      modalBodyText: page.getByText('This is the modal body'),
      closeButton: page.getByRole('button', { name: 'Close' }),
      saveChangesButton: page.getByRole('button', { name: 'Save changes' }),
      confirmText: page.locator('#confirm-text'),
      promptText: page.locator('#prompt-text'),
      modalText: page.locator('#modal-text'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/dialog-boxes.html`);
      },
      launchAlert: async () => {
        await this.locators.launchAlertButton.click();
      },
      launchConfirm: async () => {
        await this.locators.launchConfirmButton.click();
      },
      launchPrompt: async () => {
        await this.locators.launchPromptButton.click();
      },
      launchModal: async () => {
        await this.locators.launchModalButton.click();
      },
      closeModal: async () => {
        await this.locators.closeButton.click();
      },
      saveModal: async () => {
        await this.locators.saveChangesButton.click();
      },
    };
  }
}
