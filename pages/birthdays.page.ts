import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { CreateBirthdayPartyComponent } from './components/create-birthday-party.component';
import { HeaderComponent } from './components/header.component';

export class BirthdaysPage {
  readonly header: HeaderComponent;
  readonly createParty: CreateBirthdayPartyComponent;
  readonly pastAndCancelledSection: Locator;
  readonly copyRsvpLinkButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createParty = new CreateBirthdayPartyComponent(page);
    this.pastAndCancelledSection = page.getByText('Past & cancelled');
    this.copyRsvpLinkButton = page.getByRole('button', {
      name: 'copy RSVP link',
    });
  }

  /** Opens birthdays and party planning. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Birthdays);
  }
}
