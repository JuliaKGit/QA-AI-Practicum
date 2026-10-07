import type { Page, Route } from '@playwright/test';

type JsonRecord = Record<string, unknown>;

async function fulfillJsonFromUpstream(
  route: Route,
  transform: (body: JsonRecord) => JsonRecord,
): Promise<void> {
  const upstream = await route.fetch();
  const body = (await upstream.json()) as JsonRecord;
  await route.fulfill({
    status: upstream.status(),
    headers: upstream.headers(),
    json: transform(body),
  });
}

/** GET /api/v1/me — forces an empty children list while preserving other profile fields. */
export async function mockMeEmptyChildren(page: Page): Promise<void> {
  await page.route('**/api/v1/me', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await fulfillJsonFromUpstream(route, (body) => ({ ...body, children: [] }));
  });
}

/** GET /api/v1/me — deterministic 503 for resilience tests. */
export async function mockMeServerError(page: Page): Promise<void> {
  await page.route('**/api/v1/me', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Service unavailable' }),
    });
  });
}

/** GET /api/v1/connections — forces an empty circle list while preserving envelope shape. */
export async function mockConnectionsEmptyList(page: Page): Promise<void> {
  await page.route('**/api/v1/connections', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await fulfillJsonFromUpstream(route, (body) => {
      if (Array.isArray(body)) {
        return [];
      }
      return { ...body, connections: [], items: [] };
    });
  });
}

/** GET /api/v1/connections — deterministic 503 for resilience tests. */
export async function mockConnectionsServerError(page: Page): Promise<void> {
  await page.route('**/api/v1/connections', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Service unavailable' }),
    });
  });
}

/** POST /api/v1/children — stub create with a mock id (ignored by the cleanup fixture). */
export async function mockChildCreateWithMockId(page: Page): Promise<void> {
  await page.route('**/api/v1/children', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const mockId = `mock-child-${Date.now()}`;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: mockId,
        firstName: 'Mock',
        birthYear: 2018,
        birthMonth: 1,
        age: 8,
        gender: 'girl',
        interests: [],
        avatarKey: 'fox',
      }),
    });
  });
}
