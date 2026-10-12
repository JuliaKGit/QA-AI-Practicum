import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import type { APIRequestContext } from '@playwright/test';
import {
  createFamilyApiContext,
  deleteChild,
  type DeleteRecordResult,
} from '../../../../support/api-client';
import { ALT_AUTH_FILE, AUTH_FILE } from '../../../../support/auth.constants';
import {
  getTrackedRecords,
  resetTracker,
  type RecordOwner,
  type TrackedRecord,
  type TrackedRecordType,
} from '../../../../support/record-tracker';

dotenv.config();

function parseArgs(argv: string[]): { dryRun: boolean; typeFilter?: TrackedRecordType } {
  let dryRun = false;
  let typeFilter: TrackedRecordType | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--type') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--type requires a value (e.g. child)');
      }
      if (value !== 'child') {
        throw new Error(`Unknown --type "${value}". Tracked types: child`);
      }
      typeFilter = value;
      i += 1;
    }
  }

  return { dryRun, typeFilter };
}

function authPathForOwner(owner: RecordOwner): string {
  return owner === 'main' ? AUTH_FILE : ALT_AUTH_FILE;
}

function assertAuthFilesExist(owners: Set<RecordOwner>): void {
  for (const owner of owners) {
    const authPath = authPathForOwner(owner);
    if (!fs.existsSync(authPath)) {
      throw new Error(
        `Missing auth file for owner "${owner}": ${authPath}. Run: npx playwright test --project=setup`,
      );
    }
  }
}

async function deleteTrackedRecord(
  api: APIRequestContext,
  record: TrackedRecord,
): Promise<DeleteRecordResult> {
  switch (record.type) {
    case 'child':
      return deleteChild(api, record.id);
    default: {
      const exhaustive: never = record.type;
      return {
        type: exhaustive,
        id: record.id,
        ok: false,
        status: 0,
        message: `Unknown tracked record type: ${exhaustive}`,
      };
    }
  }
}

function printTarget(record: TrackedRecord): void {
  console.log(`  ${record.type} ${record.id} (owner: ${record.owner})`);
}

async function main(): Promise<void> {
  const { dryRun, typeFilter } = parseArgs(process.argv.slice(2));

  let records = getTrackedRecords();
  if (typeFilter) {
    records = records.filter((record) => record.type === typeFilter);
  }

  const scope =
    typeFilter !== undefined
      ? `type=${typeFilter} from ${path.join('.test-artifacts', 'created-records.jsonl')}`
      : path.join('.test-artifacts', 'created-records.jsonl');

  const found = records.length;

  if (found === 0) {
    console.log('Scope:', scope);
    console.log('Found: 0');
    console.log('Deleted: 0');
    console.log('Failed: 0');
    if (!dryRun) {
      resetTracker();
    }
    return;
  }

  const owners = new Set(records.map((record) => record.owner));
  assertAuthFilesExist(owners);

  if (dryRun) {
    console.log('Scope:', scope);
    console.log('Found:', found);
    console.log('Targets (--dry-run, no deletes):');
    for (const record of records) {
      printTarget(record);
    }
    console.log('Deleted: 0');
    console.log('Failed: 0');
    return;
  }

  let deleted = 0;
  let failed = 0;
  const contexts = new Map<RecordOwner, APIRequestContext>();

  try {
    for (const record of records) {
      let api = contexts.get(record.owner);
      if (!api) {
        api = await createFamilyApiContext(record.owner);
        contexts.set(record.owner, api);
      }

      const result = await deleteTrackedRecord(api, record);

      if (result.status === 401) {
        failed += 1;
        console.error(
          `Failed ${result.type} ${result.id}: 401 — storage state expired for owner "${record.owner}". Re-run: npx playwright test --project=setup`,
        );
        continue;
      }

      if (result.ok) {
        deleted += 1;
        if (result.status === 404) {
          console.log(`Already removed ${result.type} ${result.id} (404)`);
        } else {
          console.log(`Deleted ${result.type} ${result.id}`);
        }
        continue;
      }

      failed += 1;
      console.error(
        `Failed ${result.type} ${result.id}: ${result.status} ${result.message}`,
      );
    }
  } finally {
    for (const api of contexts.values()) {
      await api.dispose();
    }
    resetTracker();
  }

  console.log('Scope:', scope);
  console.log('Found:', found);
  console.log('Deleted:', deleted);
  console.log('Failed:', failed);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
