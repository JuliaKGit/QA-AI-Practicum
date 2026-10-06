import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class CommunitiesPage {
  readonly header: HeaderComponent;
  readonly yourCommunitiesHeading: Locator;
  readonly createGroupLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.yourCommunitiesHeading = page.getByRole('heading', {
      name: 'Your communities',
    });
    this.createGroupLink = page.getByRole('link', { name: '+ Create group' });
  }

  /** Opens the communities list. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Communities);
  }

  /** Opens a community card by its visible name. */
  async openCommunity(name: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(name) }).click();
  }
}
