import { initTracker } from './record-tracker';

export default async function globalSetup(): Promise<void> {
  initTracker();
}
