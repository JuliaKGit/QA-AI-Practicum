import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectMatchesResponse,
} from './helpers/catalog-response';

const PATH = '/api/v1/matches';

test('GET /api/v1/matches returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(PATH);
  expectCatalogAuthenticatedGet(response);
  expectMatchesResponse(await response.json());
});

test('GET /api/v1/matches without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, PATH);
});
