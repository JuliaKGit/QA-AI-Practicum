import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

export class ForgotPasswordPage {
  readonly resetHeading: Locator;
  readonly instructionParagraph: Locator;
  readonly emailField: Locator;
  readonly sendResetLinkButton: Locator;
  readonly backToLogInLink: Locator;
  readonly confirmationIfAccountExists: Locator;
  readonly confirmationOnTheWay: Locator;
  readonly confirmationExpires: Locator;
  readonly confirmationSpamFolder: Locator;

  constructor(private readonly page: Page) {
    this.resetHeading = page.getByRole('heading', {
      name: 'Reset your password',
    });
    this.instructionParagraph = page.getByText(
      /Enter your email and we.ll send you a reset link\./,
    );
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.sendResetLinkButton = page.getByRole('button', {
      name: 'Send reset link',
    });
    this.backToLogInLink = page.getByRole('link', { name: '← Back to log in' });
    this.confirmationIfAccountExists = page.getByText('If an account exists for', {
      exact: false,
    });
    this.confirmationOnTheWay = page.getByText('a reset link is on its way', {
      exact: false,
    });
    this.confirmationExpires = page.getByText(
      'The link works once and expires in 1 hour',
      { exact: false },
    );
    this.confirmationSpamFolder = page.getByText('check your spam folder too', {
      exact: false,
    });
  }

  /** Email address shown in the post-submit confirmation paragraph. */
  submittedEmailInConfirmation(email: string): Locator {
    return this.page.getByText(email, { exact: true });
  }

  /** Opens the forgot-password page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.ForgotPassword);
  }

  /** Fills email without sending the reset link. */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  /** Clicks **Send reset link**. */
  async submitResetLink(): Promise<void> {
    await this.sendResetLinkButton.click();
  }

  /** Fills **Email** and submits the reset request. */
  async requestResetLink(email: string): Promise<void> {
    await this.fillEmail(email);
    await this.submitResetLink();
  }

  /** Navigates back to log-in via **← Back to log in**. */
  async returnToLogIn(): Promise<void> {
    await this.backToLogInLink.click();
  }
}
