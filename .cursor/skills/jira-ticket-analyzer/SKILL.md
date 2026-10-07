---
name: jira-ticket-analyzer
description: Turns a Jira ticket's acceptance criteria into structured, reviewable Gherkin test scenarios. Use this skill whenever the user references a Jira ticket (AQPBT-1, AQPBT-2, etc.) and asks for test cases, a test plan, scenarios, or wants to plan testing for a ticket — even if they don't say the word "Gherkin".
---

# Jira Ticket to Gherkin Test Cases

The Gherkin is a human-readable checkpoint reviewed before any Playwright code is written. Steps:

1. Read the ticket with the Atlassian MCP: title, description, every acceptance criterion. If it links a Confluence page in space CONFLUENCE_SPACE_KEY, read that page too and use its business rules.
2. One Feature named after the ticket; every AC covered by at least one Scenario; add negative scenarios (what must NOT happen) and edge cases (boundaries, empty input, duplicates, special characters, max length, time-zone and overlap edges for scheduling rules, a second family's point of view).
3. Given / When / Then: Given = starting state, When = the action under test, Then = the observable expected outcome.
4. Group with comments: # Happy paths, # Negative, # Edge cases.
5. Use real, specific values from the ticket — never placeholders.
6. End with a comment block listing ambiguities or gaps in the acceptance criteria.

Output: features/<ticket-key>.feature.md
