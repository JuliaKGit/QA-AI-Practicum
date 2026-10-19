import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectEventsResponse,
} from './helpers/catalog-response';

const PATH = '/api/v1/events';

test('GET /api/v1/events returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(PATH);
  expectCatalogAuthenticatedGet(response);
  expectEventsResponse(await response.json());
});

test('GET /api/v1/events without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, PATH);
});
