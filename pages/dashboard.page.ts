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

  /** Greeting banner shown on the signed-in dashboard home. */
  get dashboardBanner(): Locator {
    return this.greetingHeading;
  }

  /** Family section on the dashboard (name + child rows + add-child form). */
  familyBlock(familyName: string): Locator {
    return this.page.locator('div').filter({ hasText: familyName }).first();
  }

  /** Visible child summary line (e.g. `Maria, 7 · Girl`). */
  childSummaryLocator(familyName: string, summaryLine: string): Locator {
    return this.familyBlock(familyName).getByText(summaryLine);
  }

  /** One child row in the family block (avatar control + summary + remove). */
  private childRows(familyName: string): Locator {
    return this.familyBlock(familyName)
      .locator('div')
      .filter({ has: this.page.getByRole('button', { name: 'Change avatar' }) })
      .filter({ has: this.page.getByRole('button', { name: 'remove' }) });
  }

  /** Row container for one child, located by summary text within the family block. */
  childRowBySummary(familyName: string, summaryLine: string): Locator {
    return this.childRows(familyName).filter({ hasText: summaryLine });
  }

  /** Clicks remove on the child row matching the summary line. */
  async removeChild(familyName: string, summaryLine: string): Promise<void> {
    const rows = this.childRows(familyName);
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      if ((await row.getByRole('button', { name: 'remove' }).count()) !== 1) {
        continue;
      }
      if ((await row.getByText(summaryLine, { exact: true }).count()) === 0) {
        continue;
      }
      await row.getByRole('button', { name: 'remove' }).click();
      return;
    }
    throw new Error(`No child row found for summary: ${summaryLine}`);
  }

  /** Reads the My Kids stat value from the dashboard summary chips. */
  async getMyKidsCount(): Promise<number> {
    const label = this.page.getByText('My Kids', { exact: true });
    const valueText = await label.locator('..').locator('div').first().innerText();
    return Number(valueText.trim());
  }

  /** Opens the signed-in dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }
}
