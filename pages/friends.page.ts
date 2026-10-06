import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';
import { InviteCircleComponent } from './components/invite-circle.component';
import { ManageFriendComponent } from './components/manage-friend.component';

export class FriendsPage {
  readonly header: HeaderComponent;
  readonly inviteCircle: InviteCircleComponent;
  readonly exploreCommunitiesLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.inviteCircle = new InviteCircleComponent(page);
    this.exploreCommunitiesLink = page.getByRole('link', {
      name: 'Explore Communities',
    });
  }

  /** Opens the friends / circle page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Friends);
  }

  /** Manage panel for a connected family by display name. */
  manageFriend(familyName: string): ManageFriendComponent {
    return new ManageFriendComponent(this.page, familyName);
  }

  /** Schedules a playdate for a family (routes user via status hint). */
  async schedulePlaydate(familyName: string): Promise<void> {
    await this.page
      .locator('div')
      .filter({ has: this.page.getByText(familyName, { exact: true }) })
      .last()
      .getByRole('button', { name: 'Schedule Playdate' })
      .click();
  }
}
