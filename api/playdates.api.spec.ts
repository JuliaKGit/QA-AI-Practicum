import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectPlaydatesResponse,
} from './helpers/catalog-response';

const PATH = '/api/v1/playdates';

test('GET /api/v1/playdates returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(PATH);
  expectCatalogAuthenticatedGet(response);
  expectPlaydatesResponse(await response.json());
});

test('GET /api/v1/playdates without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, PATH);
});
