import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class AvailabilityPage {
  readonly header: HeaderComponent;
  readonly weeklyHeading: Locator;
  readonly weekendAfternoonsPreset: Locator;
  readonly addSlotButton: Locator;
  readonly saveAvailabilityButton: Locator;
  readonly oneOffChangesSection: Locator;
  readonly addExceptionButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.weeklyHeading = page.getByRole('heading', {
      name: 'Set your weekly free time',
    });
    this.weekendAfternoonsPreset = page.getByRole('button', {
      name: 'Weekend afternoons',
    });
    this.addSlotButton = page.getByRole('button', { name: '+ Add slot' });
    this.saveAvailabilityButton = page.getByRole('button', {
      name: 'Save availability',
    });
    this.oneOffChangesSection = page.getByText('One-off changes');
    this.addExceptionButton = page.getByRole('button', {
      name: 'Add exception',
    });
  }

  /** Opens weekly availability. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Availability);
  }
}
