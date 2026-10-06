import type { Locator, Page } from '@playwright/test';

/** Danger-zone delete-account confirmation on Profile. */
export class DeleteAccountComponent {
  private readonly root: Locator;
  readonly deleteAccountButton: Locator;
  readonly passwordField: Locator;
  readonly deleteForeverButton: Locator;
  readonly keepMyAccountButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page
      .locator('div')
      .filter({ has: page.getByText('Danger zone') })
      .last();
    this.deleteAccountButton = this.root.getByRole('button', {
      name: 'Delete account…',
    });
    this.passwordField = this.root.getByRole('textbox', {
      name: 'Your password',
    });
    this.deleteForeverButton = this.root.getByRole('button', {
      name: 'Delete forever',
    });
    this.keepMyAccountButton = this.root.getByRole('button', {
      name: 'Keep my account',
    });
  }

  /** Opens the password confirmation step. */
  async open(): Promise<void> {
    await this.deleteAccountButton.click();
  }

  /** Dismisses delete confirmation and keeps the account. */
  async keepAccount(): Promise<void> {
    await this.keepMyAccountButton.click();
  }
}
