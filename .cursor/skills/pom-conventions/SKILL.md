---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this project. Apply whenever generating, refactoring, or reviewing any Playwright test that interacts with the app under test (BuddyTime) — even if the user doesn't say "POM". Tests should never contain inline locators.
paths: "tests/**, pages/**"
---

# POM conventions

- Steps: one class per page or distinct component; locators as readonly properties set in the constructor (getByRole, getByLabel, getByText — never CSS); methods for user actions that do not assert; no expect() in pages/; compose components inside pages; specs import POMs and instantiate them with new XxxPage(page).
- Locator rules: scope dialog locators to the dialog; use { exact: true } where labels share a prefix; act on rows and cards by accessible name; never hardcode APP_URL (pages use relative paths; Playwright's baseURL comes from APP_URL); shared parts such as the header are components a page holds — never a base class it extends; two-family flows use one page object instance per context.
- Output: page objects in pages/, specs in tests/ that import them.

## BuddyTime page inventory

| Route | Page object | Notes |
|-------|-------------|--------|
| `/` | `LandingPage` | Public landing; links to sign up and log in |
| `/login` | `LoginPage` | Log-in form |
| `/signup` | `SignUpPage` | Registration |
| `/forgot-password` | `ForgotPasswordPage` | Password reset request |
| `/privacy` | `PrivacyPage` | Privacy policy |
| `/app` | `DashboardPage` | Signed-in home; holds `HeaderComponent`, `InviteCircleComponent`, `AddChildFormComponent` |
| `/calendar` | `CalendarPage` | Calendar |
| `/friends` | `FriendsPage` | Holds `HeaderComponent`, `InviteCircleComponent`; `manageFriend(name)` → `ManageFriendComponent` |
| `/communities` | `CommunitiesPage` | Community list |
| `/communities/new` | `CreateCommunityPage` | New community form |
| `/communities/15f52f3a-ba2f-46b7-b859-047ed8f6b50f` | `CommunityDetailPage` | Maple Class detail (`gotoMapleClass()`); holds `HeaderComponent`, `CreateGroupEventComponent`, `PostAnnouncementComponent` |
| `/availability` | `AvailabilityPage` | Weekly availability |
| `/playdates` | `PlaydatesPage` | Playdate list |
| `/playdates/new` | `PlaydatesPage` | `gotoNew()`; holds `HeaderComponent`, `ProposePlaydateFormComponent` |
| `/birthdays` | `BirthdaysPage` | Holds `HeaderComponent`, `CreateBirthdayPartyComponent` |
| `/profile` | `ProfilePage` | Profile; holds `HeaderComponent`, `ChangeAvatarComponent`, `DeleteAccountComponent` |
| `/admin` | `AdminPage` | Admin |

**Components** (no route — composed on pages above): `HeaderComponent`, `AddChildFormComponent`, `ChangeAvatarComponent`, `CreateBirthdayPartyComponent`, `CreateGroupEventComponent`, `DeleteAccountComponent`, `InviteCircleComponent`, `ManageFriendComponent`, `PostAnnouncementComponent`, `ProposePlaydateFormComponent`.

Routes live in `test-data/routes.ts` (`AppRoute`); page `goto()` methods use those enum values, not hardcoded hosts.

## Known app issues

| Bug key | Reason | Test marker |
|---------|--------|-------------|
| *(none)* | Add a row only when the instructor confirms a defect; mark the test with `test.fail(true, '<AQPBT bug key>: <reason>')`. | |

## Examples (this repo)

**POM** — `pages/login.page.ts`:

```typescript
export class LoginPage {
  readonly welcomeHeading: Locator;
  constructor(private readonly page: Page) {
    this.welcomeHeading = page.getByRole('heading', { name: 'Welcome back' });
  }
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }
}
```

**Spec** — pattern from `tests/aqpbt-7-forgot-pwd.spec.ts` (AC1):

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';
import { LoginPage } from '../pages/login.page';

test('login shows welcome heading', { tag: '@smoke' }, async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await expect(loginPage.welcomeHeading).toBeVisible();
});
```

Verify: new chat: "Write a test that the login page shows its heading." The spec uses a page object without being told.
