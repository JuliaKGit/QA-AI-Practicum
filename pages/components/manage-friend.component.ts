import type { Locator, Page } from '@playwright/test';

/** Inline manage actions for a friend family card on Friends. */
export class ManageFriendComponent {
  readonly manageButton: Locator;
  readonly reportButton: Locator;
  readonly blockButton: Locator;
  readonly removeButton: Locator;
  readonly cancelButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly familyName: string,
  ) {
    const card = page
      .locator('div')
      .filter({ has: page.getByText(familyName, { exact: true }) })
      .last();
    this.manageButton = card.getByRole('button', { name: 'manage' });
    this.reportButton = page.getByRole('button', { name: 'report' });
    this.blockButton = page.getByRole('button', { name: 'block' });
    this.removeButton = page.getByRole('button', { name: 'remove' });
    this.cancelButton = page.getByRole('button', { name: 'cancel' });
  }

  /** Expands manage actions for this family card. */
  async openManage(): Promise<void> {
    await this.manageButton.click();
  }

  /** Closes the manage panel without taking action. */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
