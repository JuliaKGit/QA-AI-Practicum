import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class AdminPage {
  readonly header: HeaderComponent;
  readonly refreshButton: Locator;
  readonly parentsSignedUpMetric: Locator;
  readonly latestSignUpsTable: Locator;
  readonly showAsTableToggle: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.refreshButton = page.getByRole('button', { name: 'Refresh' });
    this.parentsSignedUpMetric = page.getByText('Parents signed up');
    this.latestSignUpsTable = page.getByRole('table');
    this.showAsTableToggle = page.getByText('Show as table');
  }

  /** Opens the admin dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Admin);
  }

  /** Reloads admin metrics. */
  async refresh(): Promise<void> {
    await this.refreshButton.click();
  }
}
