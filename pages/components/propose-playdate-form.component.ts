import type { Locator, Page } from '@playwright/test';

/** Propose / find-a-playdate form on the Playdates page. */
export class ProposePlaydateFormComponent {
  private readonly root: Locator;
  readonly familyCombobox: Locator;
  readonly manualDateField: Locator;
  readonly manualStartTimeField: Locator;
  readonly manualEndTimeField: Locator;
  readonly locationTypeCombobox: Locator;
  readonly locationNoteField: Locator;
  readonly optionalNoteField: Locator;
  readonly sendRequestButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page
      .locator('div')
      .filter({
        has: page.getByRole('button', { name: 'Send request' }),
      })
      .last();
    this.familyCombobox = this.root.getByRole('combobox').first();
    this.manualDateField = this.root.getByRole('textbox').nth(0);
    this.manualStartTimeField = this.root.getByRole('textbox').nth(1);
    this.manualEndTimeField = this.root.getByRole('textbox').nth(2);
    this.locationTypeCombobox = this.root.getByRole('combobox').last();
    this.locationNoteField = this.root.getByRole('textbox', {
      name: 'Location note, park name, or address',
    });
    this.optionalNoteField = this.root.getByRole('textbox', {
      name: 'Optional note',
    });
    this.sendRequestButton = this.root.getByRole('button', {
      name: 'Send request',
    });
  }

  /** Selects a matched time slot by its accessible button name. */
  async selectMatchedSlot(slotLabel: string): Promise<void> {
    await this.root.getByRole('button', { name: slotLabel }).click();
  }
}
