import type { Locator, Page } from '@playwright/test';

/** Create a birthday party form on Birthdays. */
export class CreateBirthdayPartyComponent {
  private readonly root: Locator;
  readonly birthdayChildCombobox: Locator;
  readonly inviteChildrenGroup: Locator;
  readonly partyTitleField: Locator;
  readonly partyDateField: Locator;
  readonly venueField: Locator;
  readonly detailsField: Locator;
  readonly invitationCardGroup: Locator;
  readonly createPartyButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page
      .locator('div')
      .filter({ has: page.getByText('Create a birthday party') })
      .last();
    this.birthdayChildCombobox = this.root.getByRole('combobox').first();
    this.inviteChildrenGroup = this.root.getByRole('group', {
      name: 'Invite children',
    });
    this.partyTitleField = this.root.getByRole('textbox', {
      name: 'Party title',
    });
    this.partyDateField = this.root.getByRole('textbox').nth(1);
    this.venueField = this.root.getByRole('textbox', {
      name: 'Venue (e.g. our backyard, Chuck E. Cheese…)',
    });
    this.detailsField = this.root.getByRole('textbox', {
      name: 'Details for guests (optional)',
    });
    this.invitationCardGroup = this.root.getByRole('radiogroup', {
      name: 'Invitation card',
    });
    this.createPartyButton = this.root.getByRole('button', {
      name: 'Create party',
    });
  }

  /** Fills the party title. */
  async fillTitle(title: string): Promise<void> {
    await this.partyTitleField.fill(title);
  }
}
