import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectCommunitiesListResponse,
  expectCommunityDetailResponse,
} from './helpers/catalog-response';

const LIST_PATH = '/api/v1/communities';

function communityIds(listBody: unknown): string[] {
  if (!Array.isArray(listBody)) {
    return [];
  }
  return listBody
    .filter((item): item is { id: string } => typeof item === 'object' && item !== null && typeof (item as { id?: unknown }).id === 'string')
    .map((item) => item.id);
}

test('GET /api/v1/communities returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(LIST_PATH);
  expectCatalogAuthenticatedGet(response);
  expectCommunitiesListResponse(await response.json());
});

test('GET /api/v1/communities without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, LIST_PATH);
});

test('GET /api/v1/communities/{id} returns catalog status, content type, and shape @api', async ({
  mainApi,
}) => {
  const listResponse = await mainApi.get(LIST_PATH);
  expectCatalogAuthenticatedGet(listResponse);
  const listBody: unknown = await listResponse.json();
  expectCommunitiesListResponse(listBody);
  const ids = communityIds(listBody);
  if (ids.length === 0) {
    test.skip(true, 'No communities returned; catalog detail GET needs an id from the list.');
  }
  const detailPath = `/api/v1/communities/${ids[0]}`;
  const detailResponse = await mainApi.get(detailPath);
  expectCatalogAuthenticatedGet(detailResponse);
  expectCommunityDetailResponse(await detailResponse.json());
});

test('GET /api/v1/communities/{id} without token returns catalog status @api', async ({ mainApi, anonApi }) => {
  const listResponse = await mainApi.get(LIST_PATH);
  expectCatalogAuthenticatedGet(listResponse);
  const ids = communityIds(await listResponse.json());
  if (ids.length === 0) {
    test.skip(true, 'No communities returned; catalog detail GET needs an id from the list.');
  }
  const detailPath = `/api/v1/communities/${ids[0]}`;
  await expectCatalogUnauthenticatedGet(anonApi, detailPath);
});

