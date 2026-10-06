import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';
import { ProposePlaydateFormComponent } from './components/propose-playdate-form.component';

export class PlaydatesPage {
  readonly header: HeaderComponent;
  readonly proposeForm: ProposePlaydateFormComponent;
  readonly findPlaydateHeading: Locator;
  readonly upcomingSection: Locator;
  readonly cancelPlaydateButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.proposeForm = new ProposePlaydateFormComponent(page);
    this.findPlaydateHeading = page.getByRole('heading', {
      name: 'Find a playdate',
    });
    this.upcomingSection = page.getByText('Upcoming', { exact: true });
    this.cancelPlaydateButton = page.getByRole('button', { name: 'cancel' });
  }

  /** Opens the playdates hub. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Playdates);
  }

  /** Opens the new-playdate route (same hub UI). */
  async gotoNew(): Promise<void> {
    await this.page.goto(AppRoute.NewPlaydate);
  }
}
