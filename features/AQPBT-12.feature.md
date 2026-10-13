Feature: Playdates add to calendar (Google / ICS) — export not offered on empty or cancelled rows
  As a signed-in parent with a set-up family
  I want calendar export not to appear on empty Upcoming or Cancelled Past rows
  So that I am not offered add-to-calendar for playdates that are not confirmed,
  and Profile Calendar Sync tells me that calendar links ship with playdates

# Happy paths

  Scenario: Empty Upcoming on /playdates shows empty copy and no calendar export (AC1)
    Given I am logged in as Family A (Lev Test / The Gorfels) with a completed dashboard
    When I open "/playdates" with Upcoming count 0
    Then I see "No upcoming playdates yet."
    And I do not see "Google"
    And I do not see "ICS"

  Scenario: Cancelled Past row shows Cancelled and no row actions (AC2)
    Given I am on "/playdates" looking at a Cancelled Past row
    And the row may be future-dated (e.g. "Fri, Oct 16, 3:00 PM")
    When I view that row
    Then I see status "Cancelled"
    And I do not see "Google", "ICS", "Accept", "Decline", or "cancel" on that row

  Scenario: /playdates/new shows the same empty Upcoming and cancelled Past without export (AC3)
    Given I am logged in as the same set-up Family A
    When I open "/playdates/new"
    Then I see "No upcoming playdates yet."
    And I see Cancelled Past rows
    And I do not see "Google" or "ICS"

  Scenario: Profile Calendar Sync stays on profile and shows shipping toast (AC4)
    Given I am on "/profile" as Family A
    When I click "Calendar Sync" (subtitle "Add-to-calendar links soon")
    Then I stay on "/profile"
    And I see "Calendar links ship with playdates 🗓️"

# Negative

  Scenario: Unset family sees Dashboard gate with no lists or calendar export (AC5)
    Given I am logged in as Family B (Anna Procopov) who has not set up a family on the Dashboard
    When I open "/playdates" or "/playdates/new"
    Then I see "Set up your family on the Dashboard before planning playdates."
    And I do not see "Upcoming", "Past", "Google", or "ICS"

  Scenario: Clicking a Cancelled Past row stays on /playdates without calendar export (AC6)
    Given I am on "/playdates" looking at a Cancelled Past row
    When I click that row
    Then I stay on "/playdates"
    And no calendar-export controls ("Google", "ICS") appear

# Edge cases

  Scenario: Future-dated Cancelled row still has empty actions (E1)
    Given I am on "/playdates" as Family A
    When I view a Past row with status "Cancelled" and a future date/time
    Then the row actions area has no "Google", "ICS", "Accept", "Decline", or "cancel"

  Scenario: Family B Calendar Sync also shows shipping toast without lists (E2)
    Given I am logged in as Family B (dashboard not set up)
    When I open "/profile" and click "Calendar Sync"
    Then I stay on "/profile"
    And I see "Calendar links ship with playdates 🗓️"

  Scenario: Empty Upcoming count label accompanies empty copy (E3)
    Given I am on "/playdates" as Family A with Upcoming count 0
    Then I see "Upcoming" with count 0
    And I see "No upcoming playdates yet."
    And I do not see calendar-export controls in the Upcoming block

<!--
  Ambiguities / gaps:
  - Confirmed Upcoming Google / ICS UI is out of scope (not observed; open questions on Confluence).
  - Exact accessible names for Google (link?) and ICS (button?) come from Feature map / POM convention; neither was on screen this session.
  - Past cancelled rows (The Nguyens, The Petrovs) are shared-env state from exploration; tests should assert Cancelled + absent actions if at least one Past Cancelled row exists, not hard-code Oct 16 dates.
  - Family A = APP_USER_EMAIL (main storageState); Family B = APP_ALT_USER_EMAIL (alt storageState) per ticket naming.
  - Birthday "Add to my calendar", dashboard widget Google/ICS, and /calendar export are out of scope.
  - Confluence: https://legionqaschool.atlassian.net/wiki/spaces/AQPBT/pages/317718530
-->
