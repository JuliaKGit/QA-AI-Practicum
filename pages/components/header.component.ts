import type { Locator, Page } from '@playwright/test';

/** Shared sidebar navigation and top banner on signed-in BuddyTime pages. */
export class HeaderComponent {
  readonly dashboardLink: Locator;
  readonly calendarLink: Locator;
  readonly friendsLink: Locator;
  readonly communitiesLink: Locator;
  readonly availabilityLink: Locator;
  readonly playdatesLink: Locator;
  readonly birthdaysLink: Locator;
  readonly discoverButton: Locator;
  readonly myProfileLink: Locator;
  readonly adminLink: Locator;
  readonly goPremiumButton: Locator;
  readonly notificationsButton: Locator;
  readonly logOutButton: Locator;

  constructor(private readonly page: Page) {
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.calendarLink = page.getByRole('link', { name: 'Calendar' });
    this.friendsLink = page.getByRole('link', { name: 'Friends' });
    this.communitiesLink = page.getByRole('link', {
      name: 'Communities',
      exact: true,
    });
    this.availabilityLink = page.getByRole('link', { name: 'Availability' });
    this.playdatesLink = page.getByRole('link', { name: 'Playdates' });
    this.birthdaysLink = page.getByRole('link', { name: 'Birthdays' });
    this.discoverButton = page.getByRole('button', { name: 'Discover' });
    this.myProfileLink = page.getByRole('link', { name: 'My Profile' });
    this.adminLink = page.getByRole('link', { name: 'Admin' });
    this.goPremiumButton = page.getByRole('button', { name: /Go Premium/ });
    this.notificationsButton = page.getByRole('button', {
      name: 'Notifications',
    });
    this.logOutButton = page.getByRole('button', { name: 'Log out' });
  }

  /** Opens the Dashboard from the sidebar. */
  async openDashboard(): Promise<void> {
    await this.dashboardLink.click();
  }

  /** Opens Calendar from the sidebar. */
  async openCalendar(): Promise<void> {
    await this.calendarLink.click();
  }

  /** Opens Friends from the sidebar. */
  async openFriends(): Promise<void> {
    await this.friendsLink.click();
  }

  /** Opens Communities from the sidebar. */
  async openCommunities(): Promise<void> {
    await this.communitiesLink.click();
  }

  /** Opens Availability from the sidebar. */
  async openAvailability(): Promise<void> {
    await this.availabilityLink.click();
  }

  /** Opens Playdates from the sidebar. */
  async openPlaydates(): Promise<void> {
    await this.playdatesLink.click();
  }

  /** Opens Birthdays from the sidebar. */
  async openBirthdays(): Promise<void> {
    await this.birthdaysLink.click();
  }

  /** Clicks Discover (shows a coming-soon status message). */
  async openDiscover(): Promise<void> {
    await this.discoverButton.click();
  }

  /** Opens My Profile from the sidebar. */
  async openMyProfile(): Promise<void> {
    await this.myProfileLink.click();
  }

  /** Opens Admin from the sidebar. */
  async openAdmin(): Promise<void> {
    await this.adminLink.click();
  }

  /** Opens the Go Premium upsell (coming-soon status message). */
  async openGoPremium(): Promise<void> {
    await this.goPremiumButton.click();
  }

  /** Toggles the notifications control in the top banner. */
  async openNotifications(): Promise<void> {
    await this.notificationsButton.click();
  }

  /** Signs out via the top banner Log out control. */
  async logOut(): Promise<void> {
    await this.logOutButton.click();
  }
}
