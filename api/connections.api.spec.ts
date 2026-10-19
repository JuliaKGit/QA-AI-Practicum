import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectConnectionsResponse,
} from './helpers/catalog-response';

const PATH = '/api/v1/connections';

test('GET /api/v1/connections returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(PATH);
  expectCatalogAuthenticatedGet(response);
  expectConnectionsResponse(await response.json());
});

test('GET /api/v1/connections without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, PATH);
});
