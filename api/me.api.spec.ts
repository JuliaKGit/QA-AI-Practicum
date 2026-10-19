import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectMeResponse,
} from './helpers/catalog-response';

const PATH = '/api/v1/me';

test('GET /api/v1/me returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(PATH);
  expectCatalogAuthenticatedGet(response);
  expectMeResponse(await response.json());
});

test('GET /api/v1/me without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, PATH);
});
