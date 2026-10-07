import { test, expect } from '../fixtures/cleanup.fixture';
import { AUTH_FILE } from '../support/auth.constants';
import {
  buildAc3UnregisteredPasswordResetRequest,
  buildRegisteredPasswordResetRequest,
  buildUnregisteredPasswordResetRequest,
} from '../test-data/factories/password-reset-request.factory';
import { invalidForgotPasswordInputs } from '../test-data/invalid-forgot-pwd';
import { AppRoute } from '../test-data/routes';
import { DashboardPage } from '../pages/dashboard.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { LoginPage } from '../pages/login.page';

async function expectResetLinkConfirmation(
  forgotPasswordPage: ForgotPasswordPage,
  email: string,
): Promise<void> {
  await expect(forgotPasswordPage.sendResetLinkButton).not.toBeVisible();
  await expect(forgotPasswordPage.confirmationIfAccountExists).toBeVisible();
  await expect(forgotPasswordPage.submittedEmailInConfirmation(email)).toBeVisible();
  await expect(forgotPasswordPage.confirmationOnTheWay).toBeVisible();
  await expect(forgotPasswordPage.confirmationExpires).toBeVisible();
  await expect(forgotPasswordPage.confirmationSpamFolder).toBeVisible();
  await expect(forgotPasswordPage.backToLogInLink).toBeVisible();
}

test.describe('AQPBT-7 Forgot password (request reset link)', () => {
  test.describe('logged out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test(
      'opens forgot-password from login with request form (AC1)',
      { tag: '@smoke' },
      async ({ page }) => {
        const loginPage = new LoginPage(page);
        const forgotPasswordPage = new ForgotPasswordPage(page);

        await loginPage.goto();
        await loginPage.openForgotPassword();

        await expect(page).toHaveURL(
          (url) => new URL(url).pathname === AppRoute.ForgotPassword,
        );
        await expect(forgotPasswordPage.resetHeading).toBeVisible();
        await expect(forgotPasswordPage.instructionParagraph).toBeVisible();
        await expect(forgotPasswordPage.emailField).toBeVisible();
        await expect(forgotPasswordPage.sendResetLinkButton).toBeVisible();
        await expect(forgotPasswordPage.backToLogInLink).toBeVisible();
      },
    );

    test(
      'returns to login via Back to log in without submitting (AC2)',
      { tag: '@sanity' },
      async ({ page }) => {
        const loginPage = new LoginPage(page);
        const forgotPasswordPage = new ForgotPasswordPage(page);

        await forgotPasswordPage.goto();
        await forgotPasswordPage.returnToLogIn();

        await expect(page).toHaveURL(
          (url) => new URL(url).pathname === AppRoute.Login,
        );
        await expect(loginPage.welcomeHeading).toBeVisible();
        await expect(loginPage.emailField).toBeVisible();
        await expect(loginPage.passwordField).toBeVisible();
        await expect(loginPage.logInButton).toBeVisible();
      },
    );

    test(
      'shows confirmation for unregistered nobody@example.com (AC3)',
      { tag: '@regression' },
      async ({ page }) => {
        const forgotPasswordPage = new ForgotPasswordPage(page);
        const { email } = buildAc3UnregisteredPasswordResetRequest();

        await forgotPasswordPage.goto();
        await forgotPasswordPage.requestResetLink(email);

        await expectResetLinkConfirmation(forgotPasswordPage, email);
      },
    );

    test(
      'shows confirmation for registered Family A email (AC4)',
      { tag: '@regression' },
      async ({ page }) => {
        const registeredEmail = process.env.APP_USER_EMAIL;
        if (!registeredEmail) {
          throw new Error('APP_USER_EMAIL must be set for Family A reset-link test');
        }

        const forgotPasswordPage = new ForgotPasswordPage(page);
        const { email } = buildRegisteredPasswordResetRequest(registeredEmail);

        await forgotPasswordPage.goto();
        await forgotPasswordPage.requestResetLink(email);

        await expectResetLinkConfirmation(forgotPasswordPage, email);
      },
    );

    test(
      'empty Email keeps request view without confirmation (AC5)',
      { tag: '@regression' },
      async ({ page }) => {
        const forgotPasswordPage = new ForgotPasswordPage(page);

        await forgotPasswordPage.goto();
        await forgotPasswordPage.fillEmail(invalidForgotPasswordInputs.emptyEmail);
        await forgotPasswordPage.submitResetLink();

        await expect(forgotPasswordPage.resetHeading).toBeVisible();
        await expect(forgotPasswordPage.confirmationIfAccountExists).not.toBeVisible();
      },
    );

    test(
      'notanemail keeps request form without confirmation (AC6)',
      { tag: '@regression' },
      async ({ page }) => {
        const forgotPasswordPage = new ForgotPasswordPage(page);

        await forgotPasswordPage.goto();
        await forgotPasswordPage.requestResetLink(
          invalidForgotPasswordInputs.missingAtSign,
        );

        await expect(forgotPasswordPage.confirmationIfAccountExists).not.toBeVisible();
        await expect(forgotPasswordPage.resetHeading).toBeVisible();
        await expect(forgotPasswordPage.sendResetLinkButton).toBeVisible();
      },
    );

    test(
      'Back to log in remains after successful submit and returns to login (E2)',
      { tag: '@sanity' },
      async ({ page }) => {
        const loginPage = new LoginPage(page);
        const forgotPasswordPage = new ForgotPasswordPage(page);
        const { email } = buildUnregisteredPasswordResetRequest();

        await forgotPasswordPage.goto();
        await forgotPasswordPage.requestResetLink(email);
        await expectResetLinkConfirmation(forgotPasswordPage, email);

        await forgotPasswordPage.returnToLogIn();

        await expect(page).toHaveURL(
          (url) => new URL(url).pathname === AppRoute.Login,
        );
        await expect(loginPage.welcomeHeading).toBeVisible();
      },
    );
  });

  test(
    'signed-in Family A sees public reset UI on /forgot-password (E1)',
    { tag: '@sanity' },
    async ({ browser }) => {
      const context = await browser.newContext({ storageState: AUTH_FILE });
      const page = await context.newPage();
      const forgotPasswordPage = new ForgotPasswordPage(page);
      const dashboardPage = new DashboardPage(page);

      await forgotPasswordPage.goto();

      await expect(page).toHaveURL(
        (url) => new URL(url).pathname === AppRoute.ForgotPassword,
      );
      await expect(forgotPasswordPage.resetHeading).toBeVisible();
      await expect(forgotPasswordPage.sendResetLinkButton).toBeVisible();
      await expect(forgotPasswordPage.backToLogInLink).toBeVisible();
      await expect(dashboardPage.header.logOutButton).not.toBeVisible();
      await expect(dashboardPage.greetingHeading).not.toBeVisible();

      await context.close();
    },
  );

  test(
    'after logout in an isolated session, forgot password opens from login (E3)',
    { tag: '@e2e' },
    async ({ browser }) => {
      const email = process.env.APP_USER_EMAIL;
      const password = process.env.APP_USER_PASSWORD;
      if (!email || !password) {
        throw new Error(
          'APP_USER_EMAIL and APP_USER_PASSWORD must be set for logout isolation test',
        );
      }

      const context = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      const page = await context.newPage();
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      const forgotPasswordPage = new ForgotPasswordPage(page);

      await loginPage.goto();
      await loginPage.logIn(email, password);
      await expect(dashboardPage.greetingHeading).toBeVisible();
      await dashboardPage.header.logOut();
      await expect(loginPage.welcomeHeading).toBeVisible();

      await loginPage.openForgotPassword();
      await expect(forgotPasswordPage.resetHeading).toBeVisible();

      await context.close();
    },
  );
});
