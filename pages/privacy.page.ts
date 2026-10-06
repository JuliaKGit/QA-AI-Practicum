import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

export class PrivacyPage {
  readonly privacyHeading: Locator;
  readonly shortVersionHeading: Locator;

  constructor(private readonly page: Page) {
    this.privacyHeading = page.getByRole('heading', {
      name: 'Privacy Policy',
      level: 1,
    });
    this.shortVersionHeading = page.getByRole('heading', {
      name: 'The short version',
    });
  }

  /** Opens the privacy policy page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Privacy);
  }
}
