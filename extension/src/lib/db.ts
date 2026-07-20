import Dexie, { type Table } from 'dexie';
import type { Bookmark } from './github';

interface PendingSync extends Bookmark {
  syncStatus: 'pending' | 'syncing' | 'failed';
  attempts: number;
}

class LetheDB extends Dexie {
  pendingSync!: Table<PendingSync, string>;

  constructor() {
    super('lethe');
    this.version(1).stores({
      pendingSync: 'id, syncStatus',
    });
  }
}

const db = new LetheDB();

export async function addToPending(bookmark: Bookmark): Promise<void> {
  await db.pendingSync.put({
    ...bookmark,
    syncStatus: 'pending',
    attempts: 0,
  });
}

// Get both pending and failed items for retry
export async function getPendingItems(): Promise<PendingSync[]> {
  return db.pendingSync.where('syncStatus').anyOf('pending', 'failed').toArray();
}

export async function markSyncing(id: string): Promise<void> {
  await db.pendingSync.update(id, { syncStatus: 'syncing' });
}

export async function markSynced(id: string): Promise<void> {
  await db.pendingSync.delete(id);
}

export async function markFailed(id: string): Promise<void> {
  const item = await db.pendingSync.get(id);
  const attempts = (item?.attempts || 0) + 1;
  await db.pendingSync.update(id, { syncStatus: 'failed', attempts });
}

export async function getPendingCount(): Promise<number> {
  return db.pendingSync.where('syncStatus').anyOf('pending', 'failed').count();
}

export { db };
