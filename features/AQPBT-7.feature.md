Feature: Forgot password (request reset link): request a one-time reset link by email
  As a registered parent who is logged out
  I want to request a password reset link using my email
  So that I can regain access to BuddyTime without contacting support

# Happy paths

  Scenario: Open forgot-password from login (AC1)
    Given I am logged out and on "/login"
    When I click "Forgot password?"
    Then I am on "/forgot-password"
    And I see heading "Reset your password"
    And I see "Enter your email and we'll send you a reset link."
    And I see field "Email"
    And I see button "Send reset link"
    And I see link "← Back to log in"

  Scenario: Return to login without submitting (AC2)
    Given I am on "/forgot-password"
    When I click "← Back to log in" without clicking "Send reset link"
    Then I am on "/login"
    And I see heading "Welcome back"
    And I see fields "Email" and "Password"
    And I see button "Log in"

  Scenario: Unregistered email shows confirmation (AC3)
    Given I am on "/forgot-password"
    When I enter "nobody@example.com" and click "Send reset link"
    Then I do not see "Send reset link"
    And I see confirmation for "nobody@example.com"

  Scenario: Registered Family A email shows confirmation (AC4)
    Given I am on "/forgot-password"
    When I enter Family A registered email and click "Send reset link"
    Then I see the same confirmation pattern with Family A email shown

# Negative

  Scenario: Empty email stays on request view (AC5)
    Given I am on "/forgot-password" with empty "Email"
    When I click "Send reset link"
    Then I see heading "Reset your password"
    And I do not see "If an account exists for"

  Scenario: Malformed email stays on request view (AC6)
    Given I am on "/forgot-password"
    When I enter "notanemail" and click "Send reset link"
    Then I do not see "If an account exists for"
    And I see heading "Reset your password"
    And I see button "Send reset link"

# Edge cases

  Scenario: Signed-in Family A still sees public reset UI (E1)
    Given I am signed in as Family A
    When I open "/forgot-password"
    Then I see the request reset layout, not the signed-in app shell

  Scenario: Back to log in remains after successful submit (E2)
    Given I submitted a valid unregistered email on "/forgot-password"
    Then I still see link "← Back to log in"
    When I click "← Back to log in"
    Then I am on "/login" with heading "Welcome back"

  Scenario: After logout in an isolated session, forgot password is reachable (E3)
    Given I sign in and log out in a dedicated browser context
    When I open forgot password from "/login"
    Then I see heading "Reset your password"

<!--
  Ambiguities / gaps:
  - Literal Family A email comes from APP_USER_EMAIL (not named in Jira).
  - Browser validation copy for empty / malformed Email is not in AC.
  - Email delivery, reset link follow-through, and rate limits are out of scope.
  - Whitespace-only Email is not covered by AC5 (empty only).
-->
