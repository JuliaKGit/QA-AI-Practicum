import type { Locator, Page } from '@playwright/test';

/** Avatar picker expanded after Change avatar on Profile. */
export class ChangeAvatarComponent {
  readonly foxAvatar: Locator;
  readonly dinoAvatar: Locator;
  readonly doneButton: Locator;

  constructor(private readonly page: Page) {
    this.foxAvatar = page.getByRole('button', { name: 'Fox' });
    this.dinoAvatar = page.getByRole('button', { name: 'Dino' });
    this.doneButton = page.getByRole('button', { name: 'done' });
  }

  /** Opens the picker from a child row's Change avatar control. */
  async openFromChildRow(changeAvatarButton: Locator): Promise<void> {
    await changeAvatarButton.click();
  }

  /** Closes the picker via Done without picking a new avatar if unchanged. */
  async done(): Promise<void> {
    await this.doneButton.click();
  }
}
