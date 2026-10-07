import { cleanupCreatedRecords } from './cleanup-records';

export default async function globalTeardown(): Promise<void> {
  await cleanupCreatedRecords();
}
