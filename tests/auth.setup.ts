import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages';
import { AUTH_FILE, ALT_AUTH_FILE } from '../support/auth.constants';
import { AppRoute } from '../test-data/routes';

setup('authenticate main family', async ({ page }) => {
  const email = process.env.APP_USER_EMAIL;
  const password = process.env.APP_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'APP_USER_EMAIL and APP_USER_PASSWORD must be set in .env for main-family auth setup',
    );
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.logIn(email, password);

  await expect(page).toHaveURL(
    (url) => new URL(url).pathname === AppRoute.Dashboard,
  );
  await expect(page).not.toHaveURL(
    (url) => new URL(url).pathname === AppRoute.Login,
  );

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});

setup('authenticate second family', async ({ page }) => {
  setup.skip(
    !process.env.APP_ALT_USER_EMAIL || !process.env.APP_ALT_USER_PASSWORD,
    'APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD must be set in .env for second-family auth setup',
  );

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.logIn(
    process.env.APP_ALT_USER_EMAIL!,
    process.env.APP_ALT_USER_PASSWORD!,
  );

  await expect(page).toHaveURL(
    (url) => new URL(url).pathname === AppRoute.Dashboard,
  );
  await expect(page).not.toHaveURL(
    (url) => new URL(url).pathname === AppRoute.Login,
  );

  fs.mkdirSync(path.dirname(ALT_AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: ALT_AUTH_FILE });
});
