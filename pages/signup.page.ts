import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';

export class SignUpPage {
  readonly createAccountHeading: Locator;
  readonly yourNameField: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly signUpButton: Locator;
  readonly logInLink: Locator;

  constructor(private readonly page: Page) {
    this.createAccountHeading = page.getByRole('heading', {
      name: 'Create your account',
    });
    this.yourNameField = page.getByRole('textbox', { name: 'Your name' });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.passwordField = page.getByRole('textbox', {
      name: 'Password (8+ characters)',
    });
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.logInLink = page.getByRole('link', { name: 'Log in', exact: true });
  }

  /** Opens the sign-up page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.SignUp);
  }

  /** Fills sign-up fields without submitting. */
  async fillForm(name: string, email: string, password: string): Promise<void> {
    await this.yourNameField.fill(name);
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
  }
}
