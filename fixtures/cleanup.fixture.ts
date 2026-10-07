import { test as base, expect, type Response } from '@playwright/test';
import {
  trackRecord,
  type RecordOwner,
  type TrackedRecordType,
} from '../support/record-tracker';

const CHILD_CREATE_PATH = '/api/v1/children';

function isChildCreateResponse(url: string, method: string, status: number): boolean {
  if (method !== 'POST' || status !== 201) {
    return false;
  }
  try {
    return new URL(url).pathname.endsWith(CHILD_CREATE_PATH);
  } catch {
    return false;
  }
}

interface CreateChildResponseBody {
  id?: string;
}

export const test = base.extend<{ recordOwner: RecordOwner }>({
  recordOwner: ['main', { option: true }],

  page: async ({ page, recordOwner }, use) => {
    const onResponse = async (response: Response) => {
      const request = response.request();
      if (
        !isChildCreateResponse(
          response.url(),
          request.method(),
          response.status(),
        )
      ) {
        return;
      }

      let body: CreateChildResponseBody;
      try {
        body = (await response.json()) as CreateChildResponseBody;
      } catch {
        return;
      }

      const id = body.id;
      if (!id || id.startsWith('mock-')) {
        return;
      }

      const type: TrackedRecordType = 'child';
      trackRecord({ type, id, owner: recordOwner });
    };

    page.on('response', onResponse);
    await use(page);
    page.off('response', onResponse);
  },
});

export { expect, trackRecord };
