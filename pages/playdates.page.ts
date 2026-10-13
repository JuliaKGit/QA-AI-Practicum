import type { Locator, Page } from '@playwright/test';
import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';
import { ProposePlaydateFormComponent } from './components/propose-playdate-form.component';

export class PlaydatesPage {
  readonly header: HeaderComponent;
  readonly proposeForm: ProposePlaydateFormComponent;
  readonly findPlaydateHeading: Locator;
  readonly upcomingSection: Locator;
  readonly upcomingHeader: Locator;
  readonly noUpcomingPlaydatesMessage: Locator;
  readonly pastSection: Locator;
  readonly cancelledStatus: Locator;
  readonly familySetupGate: Locator;
  readonly cancelPlaydateButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.proposeForm = new ProposePlaydateFormComponent(page);
    this.findPlaydateHeading = page.getByRole('heading', {
      name: 'Find a playdate',
    });
    this.upcomingSection = page.getByText('Upcoming', { exact: true });
    this.upcomingHeader = page
      .locator('div')
      .filter({ has: page.getByText('Upcoming', { exact: true }) })
      .filter({ has: page.getByText('0', { exact: true }) })
      .first();
    this.noUpcomingPlaydatesMessage = page.getByText(
      'No upcoming playdates yet.',
    );
    this.pastSection = page.getByText('Past', { exact: true });
    this.cancelledStatus = page.getByText('Cancelled', { exact: true });
    this.familySetupGate = page.getByText(
      'Set up your family on the Dashboard before planning playdates.',
    );
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

  /**
   * Leaf Cancelled Past card rows (one Cancelled badge each; excludes section wrappers).
   */
  cancelledPastRows(): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByText('Cancelled', { exact: true }) })
      .filter({
        hasNot: this.page
          .locator('div')
          .filter({ has: this.page.getByText('Cancelled', { exact: true }) }),
      });
  }

  /**
   * A single Cancelled Past card row.
   * @param index Zero-based leaf row index (default first).
   */
  cancelledPastRow(index = 0): Locator {
    return this.cancelledPastRows().nth(index);
  }

  /**
   * First Cancelled Past row whose date/time is after now (e.g. future-dated cancelled).
   * Falls back to the first Cancelled row when none parse as future.
   */
  async futureCancelledPastRow(): Promise<Locator> {
    const rows = this.cancelledPastRows();
    const count = await rows.count();
    const now = Date.now();
    const year = new Date().getFullYear();

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = await row.innerText();
      const match = text.match(
        /\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), ([A-Z][a-z]{2} \d{1,2}), (\d{1,2}:\d{2} [AP]M)\b/,
      );
      if (!match) {
        continue;
      }
      const parsed = Date.parse(`${match[1]}, ${year} ${match[2]}`);
      if (!Number.isNaN(parsed) && parsed > now) {
        return row;
      }
    }

    return this.cancelledPastRow(0);
  }

  /** Clicks a Cancelled Past card row. */
  async clickCancelledPastRow(index = 0): Promise<void> {
    await this.cancelledPastRow(index).click();
  }

  /**
   * Upcoming card that includes the empty-state copy (header + body).
   */
  upcomingEmptyBlock(): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.upcomingSection })
      .filter({ has: this.noUpcomingPlaydatesMessage })
      .first();
  }

  /** Google export control (link or button) scoped to a row or the page. */
  googleExport(scope?: Locator): Locator {
    const root = scope ?? this.page;
    return root
      .getByRole('link', { name: 'Google' })
      .or(root.getByRole('button', { name: 'Google' }));
  }

  /** ICS export control (link or button) scoped to a row or the page. */
  icsExport(scope?: Locator): Locator {
    const root = scope ?? this.page;
    return root
      .getByRole('button', { name: 'ICS' })
      .or(root.getByRole('link', { name: 'ICS' }));
  }

  /** Accept control scoped to a playdate row. */
  acceptOn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'Accept' });
  }

  /** Decline control scoped to a playdate row. */
  declineOn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'Decline' });
  }

  /** Cancel control scoped to a playdate row. */
  cancelOn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'cancel' });
  }

  /** Cancelled status badge scoped to a playdate row. */
  cancelledOn(scope: Locator): Locator {
    return scope.getByText('Cancelled', { exact: true });
  }
}
