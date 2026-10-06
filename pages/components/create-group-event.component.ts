import type { Locator, Page } from '@playwright/test';

/** Create a group event form on a community Events tab. */
export class CreateGroupEventComponent {
  private readonly root: Locator;
  readonly eventTitle: Locator;
  readonly eventDate: Locator;
  readonly venue: Locator;
  readonly details: Locator;
  readonly invitationCardGroup: Locator;
  readonly createEventButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page
      .locator('div')
      .filter({ has: page.getByText('Create a group event') })
      .last();
    this.eventTitle = this.root.getByRole('textbox', { name: 'Event title' });
    this.eventDate = this.root.getByRole('textbox').nth(1);
    this.venue = this.root.getByRole('textbox', { name: 'Venue (optional)' });
    this.details = this.root.getByRole('textbox', {
      name: 'Details for families (optional)',
    });
    this.invitationCardGroup = this.root.getByRole('radiogroup', {
      name: 'Invitation card',
    });
    this.createEventButton = this.root.getByRole('button', {
      name: 'Create event',
    });
  }

  /** Fills the event title field. */
  async fillTitle(title: string): Promise<void> {
    await this.eventTitle.fill(title);
  }
}
