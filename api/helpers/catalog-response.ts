import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';

/** Values recorded in api/CATALOG.md (2026-10-16 API test pass). */
export const CATALOG_GET_AUTH_STATUS = 200;
export const CATALOG_GET_ANON_STATUS = 401;
export const CATALOG_JSON_CONTENT_TYPE = 'application/json';

export function expectCatalogAuthenticatedGet(response: APIResponse): void {
  expect(response.status()).toBe(CATALOG_GET_AUTH_STATUS);
  expect(response.headers()['content-type'] ?? '').toContain(CATALOG_JSON_CONTENT_TYPE);
}

export async function expectCatalogUnauthenticatedGet(
  api: APIRequestContext,
  path: string,
): Promise<void> {
  const response = await api.get(path);
  expect(response.status()).toBe(CATALOG_GET_ANON_STATUS);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectString(value: unknown): void {
  expect(typeof value).toBe('string');
}

function expectStringOrNull(value: unknown): void {
  expect(value === null || typeof value === 'string').toBe(true);
}

function expectNumber(value: unknown): void {
  expect(typeof value).toBe('number');
}

function expectBoolean(value: unknown): void {
  expect(typeof value).toBe('boolean');
}

function expectArray(value: unknown): void {
  expect(Array.isArray(value)).toBe(true);
}

function expectObjectArray(value: unknown): void {
  expectArray(value);
  for (const item of value as unknown[]) {
    expect(isRecord(item)).toBe(true);
  }
}

function expectFamilyRef(value: unknown): void {
  expect(isRecord(value)).toBe(true);
  expectString(value.id);
  expectString(value.name);
}

export function expectMeResponse(body: unknown): void {
  expect(isRecord(body)).toBe(true);
  expect(isRecord(body.parent)).toBe(true);
  const parent = body.parent;
  expectString(parent.id);
  expectString(parent.email);
  expectString(parent.name);
  expectString(parent.displayName);
  expectStringOrNull(parent.phone);
  expectBoolean(parent.emailVerified);
  expect(isRecord(body.family)).toBe(true);
  const family = body.family;
  expectString(family.id);
  expectString(family.name);
  expectStringOrNull(family.addressText);
  expectString(family.addressVisibility);
  expectString(family.tz);
  expectObjectArray(family.parents);
  expectObjectArray(family.children);
  expectBoolean(body.isAdmin);
}

export function expectConnectionsResponse(body: unknown): void {
  expectArray(body);
  for (const item of body as unknown[]) {
    expect(isRecord(item)).toBe(true);
    expectString(item.id);
    expectFamilyRef(item.family);
    expectObjectArray(item.children);
    expectArray(item.communities);
    expectString(item.since);
    expectString(item.status);
    expectBoolean(item.blockedByMe);
  }
}

export function expectPlaydatesResponse(body: unknown): void {
  expectArray(body);
  for (const item of body as unknown[]) {
    expect(isRecord(item)).toBe(true);
    expectString(item.id);
    expectString(item.status);
    expectString(item.startsAt);
    expectString(item.endsAt);
    expectString(item.locationKind);
    expectStringOrNull(item.locationText);
    expectStringOrNull(item.notes);
    expect(isRecord(item.proposerFamily)).toBe(true);
    expect(isRecord(item.inviteeFamily)).toBe(true);
    expect(isRecord(item.otherFamily)).toBe(true);
    expect(item.hostFamily === null || isRecord(item.hostFamily)).toBe(true);
    expectArray(item.children);
    expect(isRecord(item.proposedBy)).toBe(true);
    expectStringOrNull(item.respondedAt);
    expectStringOrNull(item.cancelledAt);
    expectString(item.googleCalendarUrl);
    expectString(item.icsUrl);
    expectBoolean(item.canRespond);
    expectBoolean(item.canCancel);
  }
}

export function expectCommunitiesListResponse(body: unknown): void {
  expectArray(body);
  for (const item of body as unknown[]) {
    expect(isRecord(item)).toBe(true);
    expectString(item.id);
    expectString(item.name);
    expectString(item.type);
    expectString(item.description);
    expectString(item.myRole);
    expectString(item.myStatus);
    expectNumber(item.familiesCount);
    expectNumber(item.pendingCount);
    expectString(item.createdAt);
  }
}

export function expectCommunityDetailResponse(body: unknown): void {
  expect(isRecord(body)).toBe(true);
  expectString(body.id);
  expectString(body.name);
  expectString(body.type);
  expectString(body.description);
  expectString(body.myRole);
  expectString(body.myStatus);
  expectNumber(body.familiesCount);
  expectNumber(body.pendingCount);
  expectString(body.createdAt);
  expectArray(body.members);
  for (const member of body.members as unknown[]) {
    expect(isRecord(member)).toBe(true);
    expectString(member.id);
    expect(isRecord(member.family)).toBe(true);
    expectString(member.role);
    expectString(member.status);
    expectArray(member.children);
    expect(member.connection === null || isRecord(member.connection)).toBe(true);
    expectString(member.since);
  }
}

export function expectAvailabilityResponse(body: unknown): void {
  expect(isRecord(body)).toBe(true);
  expectArray(body.rules);
  for (const rule of body.rules as unknown[]) {
    expect(isRecord(rule)).toBe(true);
    expectString(rule.id);
    expectStringOrNull(rule.childId);
    expectNumber(rule.weekday);
    expectNumber(rule.startMin);
    expectNumber(rule.endMin);
    expectString(rule.hosting);
    expectNumber(rule.noticeHours);
  }
  expectArray(body.exceptions);
  for (const ex of body.exceptions as unknown[]) {
    expect(isRecord(ex)).toBe(true);
    expectString(ex.id);
    expectString(ex.date);
    expectString(ex.kind);
    expectNumber(ex.startMin);
    expectNumber(ex.endMin);
    expectString(ex.note);
  }
}

export function expectMatchesResponse(body: unknown): void {
  expectArray(body);
  for (const item of body as unknown[]) {
    expect(isRecord(item)).toBe(true);
    expectString(item.date);
    expectNumber(item.startMin);
    expectNumber(item.endMin);
    expectString(item.startsAt);
    expectString(item.endsAt);
    expectFamilyRef(item.family);
    expect(item.suggestedHost === null || isRecord(item.suggestedHost)).toBe(true);
    expectString(item.locationKind);
  }
}

export function expectEventsResponse(body: unknown): void {
  expectArray(body);
  for (const item of body as unknown[]) {
    expect(isRecord(item)).toBe(true);
    expectString(item.id);
    expectString(item.kind);
    expectString(item.title);
    expectStringOrNull(item.childId);
    expectStringOrNull(item.childName);
    expectString(item.startsAt);
    expectStringOrNull(item.endsAt);
    expectStringOrNull(item.venueText);
    expectStringOrNull(item.details);
    expectString(item.cardKey);
    expectString(item.status);
    expectStringOrNull(item.communityId);
    expectStringOrNull(item.communityName);
    expectString(item.rsvpToken);
    expect(isRecord(item.counts)).toBe(true);
    const counts = item.counts;
    expectNumber(counts.yes);
    expectNumber(counts.no);
    expectNumber(counts.maybe);
    expectNumber(counts.guestsComing);
    expectString(item.createdAt);
    expectBoolean(item.canManage);
  }
}

export function expectCreateChildResponse(body: unknown): void {
  expect(isRecord(body)).toBe(true);
  expectString(body.id);
  expectString(body.firstName);
  expectNumber(body.birthYear);
  expectNumber(body.birthMonth);
  expectNumber(body.age);
  expectString(body.gender);
  expectArray(body.interests);
  expect(body.avatarKey === null || typeof body.avatarKey === 'string').toBe(true);
}


