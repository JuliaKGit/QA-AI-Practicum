import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { AddChildFormComponent } from './components/add-child-form.component';
import { HeaderComponent } from './components/header.component';
import { InviteCircleComponent } from './components/invite-circle.component';

export class DashboardPage {
  readonly header: HeaderComponent;
  readonly inviteCircle: InviteCircleComponent;
  readonly addChildForm: AddChildFormComponent;
  readonly greetingHeading: Locator;
  readonly findPlaydateLink: Locator;
  readonly viewAllPlaydatesLink: Locator;
  readonly enablePushRemindersButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.inviteCircle = new InviteCircleComponent(page);
    this.addChildForm = new AddChildFormComponent(page);
    this.greetingHeading = page.getByRole('heading', { name: /Good (morning|afternoon|evening)/ });
    this.findPlaydateLink = page.getByRole('link', { name: 'Find a Playdate' });
    this.viewAllPlaydatesLink = page.getByRole('link', { name: 'View all' });
    this.enablePushRemindersButton = page.getByRole('button', {
      name: 'Enable push reminders',
    });
  }

  /** Opens the signed-in dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }
}
