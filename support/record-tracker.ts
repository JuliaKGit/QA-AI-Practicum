import fs from 'fs';
import path from 'path';

export const TRACKER_PATH = path.join('.test-artifacts', 'created-records.jsonl');

export type RecordOwner = 'main' | 'alt';

export type TrackedRecordType = 'child';

export interface TrackedRecord {
  type: TrackedRecordType;
  id: string;
  owner: RecordOwner;
}

/** Ensures the tracker file exists and is empty for a new test run. */
export function initTracker(): void {
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
  fs.writeFileSync(TRACKER_PATH, '', 'utf8');
}

/** Appends one created record for later API cleanup. */
export function trackRecord(record: TrackedRecord): void {
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
  fs.appendFileSync(TRACKER_PATH, `${JSON.stringify(record)}\n`, 'utf8');
}

/** Returns tracked records, deduplicated by `type` + `id` (last line wins). */
export function getTrackedRecords(): TrackedRecord[] {
  if (!fs.existsSync(TRACKER_PATH)) {
    return [];
  }
  const raw = fs.readFileSync(TRACKER_PATH, 'utf8');
  const byKey = new Map<string, TrackedRecord>();
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = JSON.parse(trimmed) as TrackedRecord;
    byKey.set(`${parsed.type}:${parsed.id}`, parsed);
  }
  return [...byKey.values()];
}

/** Clears the tracker after cleanup (idempotent re-runs). */
export function resetTracker(): void {
  fs.mkdirSync(path.dirname(TRACKER_PATH), { recursive: true });
  fs.writeFileSync(TRACKER_PATH, '', 'utf8');
}
