import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { CreateGroupEventComponent } from './components/create-group-event.component';
import { HeaderComponent } from './components/header.component';
import { PostAnnouncementComponent } from './components/post-announcement.component';

export class CommunityDetailPage {
  readonly header: HeaderComponent;
  readonly createGroupEvent: CreateGroupEventComponent;
  readonly postAnnouncement: PostAnnouncementComponent;
  readonly allCommunitiesLink: Locator;
  readonly communityHeading: Locator;
  readonly inviteFamiliesButton: Locator;
  readonly copyInviteLinkButton: Locator;
  readonly membersTab: Locator;
  readonly eventsTab: Locator;
  readonly announcementsTab: Locator;
  readonly familiesHeading: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createGroupEvent = new CreateGroupEventComponent(page);
    this.postAnnouncement = new PostAnnouncementComponent(page);
    this.allCommunitiesLink = page.getByRole('link', {
      name: '← All communities',
    });
    this.communityHeading = page.getByRole('heading', { level: 2 }).first();
    this.inviteFamiliesButton = page.getByRole('button', {
      name: 'Invite families',
    });
    this.copyInviteLinkButton = page.getByRole('button', {
      name: 'Copy invite link',
    });
    this.membersTab = page.getByRole('tab', { name: 'Members' });
    this.eventsTab = page.getByRole('tab', { name: 'Events' });
    this.announcementsTab = page.getByRole('tab', { name: 'Announcements' });
    this.familiesHeading = page.getByRole('heading', {
      name: 'Families',
      level: 3,
    });
  }

  /** Opens the Maple Class community visited during exploration. */
  async gotoMapleClass(): Promise<void> {
    await this.page.goto(AppRoute.MapleClassCommunity);
  }

  /** Switches to the Events tab. */
  async openEventsTab(): Promise<void> {
    await this.eventsTab.click();
  }

  /** Switches to the Announcements tab. */
  async openAnnouncementsTab(): Promise<void> {
    await this.announcementsTab.click();
  }

  /** Copies the group invite link (clipboard toast). */
  async copyInviteLink(): Promise<void> {
    await this.copyInviteLinkButton.click();
  }
}
