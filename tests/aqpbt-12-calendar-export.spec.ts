import { test, expect } from '../fixtures/cleanup.fixture';
import { ALT_AUTH_FILE } from '../support/auth.constants';
import { AppRoute } from '../test-data/routes';
import { PlaydatesPage } from '../pages/playdates.page';
import { ProfilePage } from '../pages/profile.page';
import type { Locator } from '@playwright/test';

async function expectNoCalendarExport(
  playdatesPage: PlaydatesPage,
  scope?: Locator,
): Promise<void> {
  await expect(playdatesPage.googleExport(scope)).not.toBeVisible();
  await expect(playdatesPage.icsExport(scope)).not.toBeVisible();
}

async function expectNoRowActions(
  playdatesPage: PlaydatesPage,
  row: Locator,
): Promise<void> {
  await expectNoCalendarExport(playdatesPage, row);
  await expect(playdatesPage.acceptOn(row)).not.toBeVisible();
  await expect(playdatesPage.declineOn(row)).not.toBeVisible();
  await expect(playdatesPage.cancelOn(row)).not.toBeVisible();
}

test.describe('AQPBT-12 Playdates calendar export (empty / cancelled)', () => {
  test.describe('Family A (set up)', () => {
    test(
      'empty Upcoming on /playdates shows empty copy and no calendar export (AC1)',
      { tag: '@smoke' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        await playdatesPage.goto();

        await expect(playdatesPage.noUpcomingPlaydatesMessage).toBeVisible();
        await expectNoCalendarExport(playdatesPage);
      },
    );

    test(
      'Cancelled Past row shows Cancelled and no row actions (AC2)',
      { tag: '@sanity' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        await playdatesPage.goto();
        await expect(playdatesPage.cancelledStatus.first()).toBeVisible();

        const row = playdatesPage.cancelledPastRow(0);

        await expect(playdatesPage.cancelledOn(row)).toBeVisible();
        await expectNoRowActions(playdatesPage, row);
      },
    );

    test(
      '/playdates/new shows empty Upcoming and cancelled Past without export (AC3)',
      { tag: '@regression' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        await playdatesPage.gotoNew();

        await expect(playdatesPage.noUpcomingPlaydatesMessage).toBeVisible();
        await expect(playdatesPage.pastSection).toBeVisible();
        await expect(playdatesPage.cancelledStatus.first()).toBeVisible();
        await expectNoCalendarExport(playdatesPage);
      },
    );

    test(
      'Profile Calendar Sync stays on profile and shows shipping toast (AC4)',
      { tag: '@sanity' },
      async ({ page }) => {
        const profilePage = new ProfilePage(page);

        await profilePage.goto();
        await expect(profilePage.calendarSyncButton).toBeVisible();
        await expect(profilePage.calendarSyncButton).toContainText(
          'Add-to-calendar links soon',
        );

        await profilePage.openCalendarSync();

        await expect(page).toHaveURL(
          (url) => new URL(url).pathname === AppRoute.Profile,
        );
        await expect(profilePage.calendarLinksShippingToast).toBeVisible();
      },
    );

    test(
      'clicking a Cancelled Past row stays on /playdates without calendar export (AC6)',
      { tag: '@regression' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        await playdatesPage.goto();
        await expect(playdatesPage.cancelledStatus.first()).toBeVisible();

        await playdatesPage.clickCancelledPastRow(0);

        await expect(page).toHaveURL(
          (url) => new URL(url).pathname === AppRoute.Playdates,
        );
        await expectNoCalendarExport(playdatesPage);
      },
    );

    test(
      'future-dated Cancelled row still has empty actions (E1)',
      { tag: '@regression' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        await playdatesPage.goto();
        await expect(playdatesPage.cancelledStatus.first()).toBeVisible();

        const row = await playdatesPage.futureCancelledPastRow();

        await expect(playdatesPage.cancelledOn(row)).toBeVisible();
        await expectNoRowActions(playdatesPage, row);
      },
    );

    test(
      'empty Upcoming count label accompanies empty copy (E3)',
      { tag: '@sanity' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        await playdatesPage.goto();

        await expect(playdatesPage.upcomingHeader).toBeVisible();
        await expect(playdatesPage.upcomingHeader).toContainText('Upcoming');
        await expect(playdatesPage.upcomingHeader).toContainText('0');
        await expect(playdatesPage.noUpcomingPlaydatesMessage).toBeVisible();

        const upcomingBlock = playdatesPage.upcomingEmptyBlock();
        await expectNoCalendarExport(playdatesPage, upcomingBlock);
      },
    );
  });

  test.describe('Family B (dashboard not set up)', () => {
    test.use({ storageState: ALT_AUTH_FILE });

    test(
      'unset family sees Dashboard gate with no lists or calendar export (AC5)',
      { tag: '@regression' },
      async ({ page }) => {
        const playdatesPage = new PlaydatesPage(page);

        for (const open of [
          () => playdatesPage.goto(),
          () => playdatesPage.gotoNew(),
        ]) {
          await open();

          await expect(playdatesPage.familySetupGate).toBeVisible();
          await expect(playdatesPage.upcomingSection).not.toBeVisible();
          await expect(playdatesPage.pastSection).not.toBeVisible();
          await expectNoCalendarExport(playdatesPage);
        }
      },
    );

    test(
      'Family B Calendar Sync also shows shipping toast without lists (E2)',
      { tag: '@sanity' },
      async ({ page }) => {
        const profilePage = new ProfilePage(page);

        await profilePage.goto();
        await profilePage.openCalendarSync();

        await expect(page).toHaveURL(
          (url) => new URL(url).pathname === AppRoute.Profile,
        );
        await expect(profilePage.calendarLinksShippingToast).toBeVisible();
      },
    );
  });
});
