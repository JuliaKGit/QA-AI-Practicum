import { test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectAvailabilityResponse,
} from './helpers/catalog-response';

const PATH = '/api/v1/availability';

test('GET /api/v1/availability returns catalog status, content type, and shape @api', async ({ mainApi }) => {
  const response = await mainApi.get(PATH);
  expectCatalogAuthenticatedGet(response);
  expectAvailabilityResponse(await response.json());
});

test('GET /api/v1/availability without token returns catalog status @api', async ({ anonApi }) => {
  await expectCatalogUnauthenticatedGet(anonApi, PATH);
});
