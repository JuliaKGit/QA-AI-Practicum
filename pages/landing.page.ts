import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

export class LandingPage {
  readonly heroLine: Locator;
  readonly getStartedLink: Locator;
  readonly logInLink: Locator;

  constructor(private readonly page: Page) {
    this.heroLine = page.getByText(
      "See when your kids' friends are free — and book a playdate in three taps.",
    );
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.logInLink = page.getByRole('link', { name: 'Log in', exact: true });
  }

  /** Opens the public landing page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Landing);
  }

  /** Navigates to sign up. */
  async openSignUp(): Promise<void> {
    await this.getStartedLink.click();
  }

  /** Navigates to log in. */
  async openLogIn(): Promise<void> {
    await this.logInLink.click();
  }
}
