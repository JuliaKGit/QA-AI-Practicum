import type { Locator, Page } from '@playwright/test';

/** Circle and co-parent invite link panels (Dashboard and similar). */
export class InviteCircleComponent {
  readonly inviteFamilyButton: Locator;
  readonly inviteCoParentButton: Locator;
  readonly circleInviteLabel: Locator;
  readonly coParentInviteLabel: Locator;
  readonly copyInviteLinkButton: Locator;

  constructor(private readonly page: Page) {
    this.inviteFamilyButton = page.getByRole('button', {
      name: '+ Invite a family',
    });
    this.inviteCoParentButton = page.getByRole('button', {
      name: 'Invite co-parent',
    });
    this.circleInviteLabel = page.getByText('Circle invite:');
    this.coParentInviteLabel = page.getByText('Co-parent invite:');
    this.copyInviteLinkButton = page.getByRole('button', { name: 'copy' });
  }

  /** Reveals the circle invite link. */
  async openFamilyInvite(): Promise<void> {
    await this.inviteFamilyButton.click();
  }

  /** Reveals the co-parent invite link. */
  async openCoParentInvite(): Promise<void> {
    await this.inviteCoParentButton.click();
  }
}
