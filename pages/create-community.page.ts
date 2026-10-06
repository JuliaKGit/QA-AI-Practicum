import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class CreateCommunityPage {
  readonly header: HeaderComponent;
  readonly groupNameField: Locator;
  readonly typeCombobox: Locator;
  readonly descriptionField: Locator;
  readonly childrenGroup: Locator;
  readonly createGroupButton: Locator;
  readonly cancelLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.groupNameField = page.getByRole('textbox', { name: 'Group name' });
    this.typeCombobox = page.getByRole('combobox', { name: 'Type' });
    this.descriptionField = page.getByRole('textbox', {
      name: 'Description (optional)',
    });
    this.childrenGroup = page.getByRole('group', {
      name: 'Which of your children are in this group?',
    });
    this.createGroupButton = page.getByRole('button', { name: 'Create group' });
    this.cancelLink = page.getByRole('link', { name: 'Cancel' });
  }

  /** Opens the create-community form. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.CreateCommunity);
  }

  /** Returns to the communities list without creating. */
  async cancel(): Promise<void> {
    await this.cancelLink.click();
  }
}
