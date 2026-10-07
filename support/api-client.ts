import fs from 'fs';
import { request, type APIRequestContext } from '@playwright/test';
import { ALT_AUTH_FILE, AUTH_FILE } from './auth.constants';
import type { RecordOwner, TrackedRecordType } from './record-tracker';

export interface DeleteRecordResult {
  type: TrackedRecordType;
  id: string;
  ok: boolean;
  status: number;
  message: string;
}

interface StorageStateFile {
  origins?: Array<{
    localStorage?: Array<{ name: string; value: string }>;
  }>;
}

function storageStatePathForOwner(owner: RecordOwner): string {
  return owner === 'main' ? AUTH_FILE : ALT_AUTH_FILE;
}

function bearerTokenFromStorageState(storageStatePath: string): string | undefined {
  const raw = fs.readFileSync(storageStatePath, 'utf8');
  const state = JSON.parse(raw) as StorageStateFile;
  for (const origin of state.origins ?? []) {
    for (const item of origin.localStorage ?? []) {
      if (item.name === 'bt_token') {
        return item.value;
      }
    }
  }
  return undefined;
}

/**
 * Playwright API context for one family (main or alt), using auth storage state.
 * Adds `Authorization: Bearer` when `bt_token` is present in storage state localStorage.
 */
export async function createFamilyApiContext(
  owner: RecordOwner,
): Promise<APIRequestContext> {
  const baseURL = process.env.APP_URL;
  if (!baseURL) {
    throw new Error('APP_URL must be set in the environment');
  }

  const storageState = storageStatePathForOwner(owner);
  const extraHTTPHeaders: Record<string, string> = {};
  const token = bearerTokenFromStorageState(storageState);
  if (token) {
    extraHTTPHeaders.Authorization = `Bearer ${token}`;
  }

  return request.newContext({
    baseURL,
    storageState,
    extraHTTPHeaders,
  });
}

/** DELETE /api/v1/children/:id — matches dashboard remove-child API. */
export async function deleteChild(
  api: APIRequestContext,
  id: string,
): Promise<DeleteRecordResult> {
  const type = 'child';
  const response = await api.delete(`/api/v1/children/${id}`);
  const status = response.status();
  const ok = status === 204 || status === 404;
  let message = '';
  if (!ok) {
    message = (await response.text().catch(() => '')) || response.statusText();
  }
  return { type, id, ok, status, message };
}
