import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

export class LoginPage {
  readonly welcomeHeading: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly logInButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(private readonly page: Page) {
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome back' });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.forgotPasswordLink = page.getByRole('link', {
      name: 'Forgot password?',
    });
  }

  /** Opens the log-in page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }

  /** Submits email and password. */
  async logIn(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.logInButton.click();
  }

  /** Opens forgot password. */
  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
