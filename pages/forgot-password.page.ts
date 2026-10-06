import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

export class ForgotPasswordPage {
  readonly resetHeading: Locator;
  readonly emailField: Locator;
  readonly sendResetLinkButton: Locator;
  readonly backToLogInLink: Locator;

  constructor(private readonly page: Page) {
    this.resetHeading = page.getByRole('heading', {
      name: 'Reset your password',
    });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.sendResetLinkButton = page.getByRole('button', {
      name: 'Send reset link',
    });
    this.backToLogInLink = page.getByRole('link', { name: '← Back to log in' });
  }

  /** Opens the forgot-password page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.ForgotPassword);
  }

  /** Fills email without sending the reset link. */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }
}
