import type { Locator, Page } from '@playwright/test';

/** Add-child form on Dashboard (and similar family sections). */
export class AddChildFormComponent {
  readonly firstNameField: Locator;
  readonly birthYearField: Locator;
  readonly birthMonthField: Locator;
  readonly interestsField: Locator;
  readonly genderCombobox: Locator;
  readonly addChildButton: Locator;

  constructor(private readonly page: Page) {
    this.firstNameField = page.getByRole('textbox', {
      name: "Child's first name",
    });
    this.birthYearField = page.getByRole('spinbutton', { name: 'Birth year' });
    this.birthMonthField = page.getByRole('spinbutton', { name: 'Month' });
    this.interestsField = page.getByRole('textbox', {
      name: 'Interests (comma-separated)',
    });
    this.genderCombobox = page.getByRole('combobox', { name: 'Gender' });
    this.addChildButton = page.getByRole('button', { name: 'Add child' });
  }

  /** Fills the child's first name. */
  async fillFirstName(name: string): Promise<void> {
    await this.firstNameField.fill(name);
  }
}
