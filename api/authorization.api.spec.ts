import type { APIRequestContext } from '@playwright/test';
import { test, expect, trackRecord } from './fixtures';
import { buildCreateChildPayload } from '../test-data/factories/child.factory';
import type { RecordOwner } from '../support/record-tracker';
import { CATALOG_GET_AUTH_STATUS } from './helpers/catalog-response';

const ME_PATH = '/api/v1/me';
const CHILDREN_PATH = '/api/v1/children';

/** Observed 2026-10-31 authorization.api.spec.ts run (api/CATALOG.md → Authorization). */
const CATALOG_CROSS_FAMILY_DELETE_STATUS = 400;
const CATALOG_ANON_DELETE_STATUS = 401;
const CATALOG_CREATE_STATUS = 201;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function meListsChildId(body: unknown, childId: string): boolean {
  if (!isRecord(body)) {
    return false;
  }
  const family = body.family;
  if (!isRecord(family) || !Array.isArray(family.children)) {
    return false;
  }
  return family.children.some((child) => isRecord(child) && child.id === childId);
}

async function createTrackedChild(mainApi: APIRequestContext, recordOwner: RecordOwner): Promise<string> {
  const payload = buildCreateChildPayload();
  const createResponse = await mainApi.post(CHILDREN_PATH, { data: payload });
  expect(createResponse.status()).toBe(CATALOG_CREATE_STATUS);
  const created = (await createResponse.json()) as { id: string };
  trackRecord({ type: 'child', id: created.id, owner: recordOwner });
  return created.id;
}

test(
  'DELETE /api/v1/children/{id} by alt family on main child is refused @api',
  { tag: '@api' },
  async ({ mainApi, altApi, recordOwner }) => {
    const childId = await createTrackedChild(mainApi, recordOwner);

    const deleteResponse = await altApi.delete(`${CHILDREN_PATH}/${childId}`);
    expect(deleteResponse.status()).toBe(CATALOG_CROSS_FAMILY_DELETE_STATUS);

    const mainMeResponse = await mainApi.get(ME_PATH);
    expect(mainMeResponse.status()).toBe(CATALOG_GET_AUTH_STATUS);
    expect(meListsChildId(await mainMeResponse.json(), childId)).toBe(true);

    const altMeResponse = await altApi.get(ME_PATH);
    expect(altMeResponse.status()).toBe(CATALOG_GET_AUTH_STATUS);
    expect(meListsChildId(await altMeResponse.json(), childId)).toBe(false);
  },
);

test(
  'DELETE /api/v1/children/{id} without token on main child is refused @api',
  { tag: '@api' },
  async ({ mainApi, anonApi, recordOwner }) => {
    const childId = await createTrackedChild(mainApi, recordOwner);

    const deleteResponse = await anonApi.delete(`${CHILDREN_PATH}/${childId}`);
    expect(deleteResponse.status()).toBe(CATALOG_ANON_DELETE_STATUS);

    const mainMeResponse = await mainApi.get(ME_PATH);
    expect(mainMeResponse.status()).toBe(CATALOG_GET_AUTH_STATUS);
    expect(meListsChildId(await mainMeResponse.json(), childId)).toBe(true);
  },
);
