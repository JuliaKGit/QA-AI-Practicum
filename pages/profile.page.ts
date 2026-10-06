import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { ChangeAvatarComponent } from './components/change-avatar.component';
import { DeleteAccountComponent } from './components/delete-account.component';
import { HeaderComponent } from './components/header.component';

export class ProfilePage {
  readonly header: HeaderComponent;
  readonly deleteAccount: DeleteAccountComponent;
  readonly changeAvatar: ChangeAvatarComponent;
  readonly displayNameField: Locator;
  readonly phoneField: Locator;
  readonly saveMyDetailsButton: Locator;
  readonly familyNameField: Locator;
  readonly hostAddressField: Locator;
  readonly saveFamilyDetailsButton: Locator;
  readonly privacySettingsButton: Locator;
  readonly notificationsSettingsButton: Locator;
  readonly profileLogOutButton: Locator;
  readonly privacyPolicyLink: Locator;
  readonly changeAvatarButtons: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.deleteAccount = new DeleteAccountComponent(page);
    this.changeAvatar = new ChangeAvatarComponent(page);
    this.displayNameField = page.getByRole('textbox', {
      name: 'Display name (how your circle sees you)',
    });
    this.phoneField = page.getByRole('textbox', { name: 'Phone (optional)' });
    this.saveMyDetailsButton = page.getByRole('button', {
      name: 'Save my details',
    });
    this.familyNameField = page.getByRole('textbox', { name: 'Family name' });
    this.hostAddressField = page.getByRole('textbox', {
      name: 'Host address or meeting note',
    });
    this.saveFamilyDetailsButton = page.getByRole('button', {
      name: 'Save family details',
    });
    this.privacySettingsButton = page.getByRole('button', {
      name: /Privacy & Safety/,
    });
    this.notificationsSettingsButton = page.getByRole('button', {
      name: /Notifications/,
    });
    this.profileLogOutButton = page
      .getByRole('button', { name: 'Log out' })
      .last();
    this.privacyPolicyLink = page.getByRole('link', { name: 'Privacy Policy' });
    this.changeAvatarButtons = page.getByRole('button', {
      name: 'Change avatar',
    });
  }

  /** Opens My Profile. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Profile);
  }

  /** Opens privacy policy in a new navigation. */
  async openPrivacyPolicy(): Promise<void> {
    await this.privacyPolicyLink.click();
  }
}
