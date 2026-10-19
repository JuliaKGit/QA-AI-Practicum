import type { APIRequestContext } from '@playwright/test';
import {
  createApiContextForOwner,
  createUnauthenticatedApiContext,
} from '../support/api-client';
import { test as base, expect, trackRecord } from '../fixtures/cleanup.fixture';

export const test = base.extend<{
  mainApi: APIRequestContext;
  altApi: APIRequestContext;
  anonApi: APIRequestContext;
}>({
  mainApi: async ({}, use) => {
    const ctx = await createApiContextForOwner('main');
    await use(ctx);
    await ctx.dispose();
  },
  altApi: async ({}, use) => {
    const ctx = await createApiContextForOwner('alt');
    await use(ctx);
    await ctx.dispose();
  },
  anonApi: async ({}, use) => {
    const ctx = await createUnauthenticatedApiContext();
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect, trackRecord };
