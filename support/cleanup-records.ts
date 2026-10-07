import type { APIRequestContext } from '@playwright/test';
import { createFamilyApiContext, deleteChild } from './api-client';
import {
  getTrackedRecords,
  resetTracker,
  type RecordOwner,
  type TrackedRecord,
} from './record-tracker';

async function deleteTrackedRecord(
  api: APIRequestContext,
  record: TrackedRecord,
): Promise<void> {
  switch (record.type) {
    case 'child': {
      const result = await deleteChild(api, record.id);
      if (result.ok) {
        console.log(`Deleted ${result.type} ${result.id}`);
      } else {
        console.warn(
          `Failed to delete ${result.type} ${result.id}: ${result.status} ${result.message}`,
        );
      }
      return;
    }
    default: {
      const exhaustive: never = record.type;
      console.warn(`Unknown tracked record type: ${exhaustive}`);
    }
  }
}

/** Deletes all tracked records via API, then clears the tracker file. */
export async function cleanupCreatedRecords(): Promise<void> {
  const records = getTrackedRecords();
  if (records.length === 0) {
    resetTracker();
    return;
  }

  const contexts = new Map<RecordOwner, APIRequestContext>();
  try {
    for (const record of records) {
      let api = contexts.get(record.owner);
      if (!api) {
        api = await createFamilyApiContext(record.owner);
        contexts.set(record.owner, api);
      }
      await deleteTrackedRecord(api, record);
    }
  } finally {
    for (const api of contexts.values()) {
      await api.dispose();
    }
    resetTracker();
  }
}
