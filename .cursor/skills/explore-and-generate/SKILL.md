---
name: explore-and-generate
description: Finds untested user flows by diffing live UI exploration against existing Playwright specs. Use when the user says "find what we're not testing", "explore <page> for untested flows", "expand coverage", "what flows are missing", "coverage gap", or asks to discover new test scenarios without a Jira ticket. Do NOT use when a Jira ticket or acceptance criteria already exist — that is jira-ticket-analyzer. This skill is for ticket-less discovery only. Exploration is read-only: map coverage, crawl the UI, propose one Gherkin plan per run; do not write or run Playwright specs here.
---

# Explore and generate

- Guardrails: read-only (no data changes, no invites or approvals, no specs, no test runs); one flow per run; accessibility snapshot only, never screenshots; reuse playwright/.auth/user.json or sign in with the .env credentials.
- Steps: 1) map covered flows from tests/*.spec.ts and pages/ (page, action, asserted outcome); 2) crawl the target page with browser_navigate + browser_snapshot, opening dialogs and panels only as far as needed; 3) list real user flows (trigger, 2–5 steps, visible outcome); 4) diff against coverage, labelling each Gap or Partial; 5) pick ONE highest-value gap and say why in one sentence; 6) output a Gherkin plan with exactly two scenarios (one positive, one edge case), every Then assertable in Playwright, real control names from the snapshot.
- Output template: Coverage snapshot · Selected gap · Gherkin test plan · Locator hints · For test-writer (suggested file tests/<slug>.spec.ts, POM updates needed) · Suggested Jira story (so a ticket-less gap can become an AQPBT story after review).
- Save to features/explore-<page-slug>-<flow-slug>.feature.md.
