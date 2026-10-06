import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class CalendarPage {
  readonly header: HeaderComponent;
  readonly monthLabel: Locator;
  readonly familyCalendarSubtitle: Locator;
  readonly noPlansMessage: Locator;
  readonly birthdaysThisMonthHeading: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.monthLabel = page.getByText(/\w+ \d{4}/).first();
    this.familyCalendarSubtitle = page.getByText('Your family calendar');
    this.noPlansMessage = page.getByText('No plans in the next 7 days.');
    this.birthdaysThisMonthHeading = page.getByText('Birthdays this month');
  }

  /** Opens the family calendar. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Calendar);
  }
}
