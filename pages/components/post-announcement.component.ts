import type { Locator, Page } from '@playwright/test';

/** New announcement composer on a community Announcements tab. */
export class PostAnnouncementComponent {
  private readonly root: Locator;
  readonly messageField: Locator;
  readonly postAnnouncementButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page
      .locator('div')
      .filter({ has: page.getByText('New announcement') })
      .last();
    this.messageField = this.root.getByRole('textbox', {
      name: 'Share an update with every family in the group…',
    });
    this.postAnnouncementButton = this.root.getByRole('button', {
      name: 'Post announcement',
    });
  }

  /** Types an announcement without posting. */
  async fillMessage(message: string): Promise<void> {
    await this.messageField.fill(message);
  }
}
