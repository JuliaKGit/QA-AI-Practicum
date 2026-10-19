import { test, expect, trackRecord } from './fixtures';
import { deleteChild } from '../support/api-client';
import { buildCreateChildPayload } from '../test-data/factories/child.factory';
import {
  CATALOG_GET_AUTH_STATUS,
  CATALOG_JSON_CONTENT_TYPE,
  expectCreateChildResponse,
  expectMeResponse,
} from './helpers/catalog-response';

const ME_PATH = '/api/v1/me';
const CHILDREN_PATH = '/api/v1/children';
const CATALOG_CREATE_STATUS = 201;
const CATALOG_DELETE_STATUS = 204;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

test('POST /api/v1/children create, GET /api/v1/me find, DELETE cleanup @api', async ({
  mainApi,
  recordOwner,
}) => {
  const payload = buildCreateChildPayload();
  const createResponse = await mainApi.post(CHILDREN_PATH, { data: payload });
  expect(createResponse.status()).toBe(CATALOG_CREATE_STATUS);
  expect(createResponse.headers()['content-type'] ?? '').toContain(CATALOG_JSON_CONTENT_TYPE);
  const created: unknown = await createResponse.json();
  expectCreateChildResponse(created);
  const createdRecord = created as { id: string };
  trackRecord({ type: 'child', id: createdRecord.id, owner: recordOwner });

  const meResponse = await mainApi.get(ME_PATH);
  expect(meResponse.status()).toBe(CATALOG_GET_AUTH_STATUS);
  const meBody: unknown = await meResponse.json();
  expectMeResponse(meBody);
  const children = (meBody as { family: { children: unknown[] } }).family.children;
  expect(
    children.some((child) => isRecord(child) && child.id === createdRecord.id),
  ).toBe(true);

  const deleteResult = await deleteChild(mainApi, createdRecord.id);
  expect(deleteResult.ok).toBe(true);
  expect(deleteResult.status).toBe(CATALOG_DELETE_STATUS);
});
