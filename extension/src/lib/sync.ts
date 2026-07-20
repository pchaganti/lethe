import { fetchBookmarks, pushBookmarks, type Bookmark } from './github';
import { addToPending, getPendingItems, markSyncing, markSynced, markFailed } from './db';

export async function syncBookmark(bookmark: Bookmark): Promise<boolean> {
  try {
    const { data, sha } = await fetchBookmarks();
    data.items.push(bookmark);
    await pushBookmarks(data, sha);
    return true;
  } catch (error) {
    console.error('Immediate sync failed, queuing:', error);
    await addToPending(bookmark);
    return false;
  }
}

export async function processPendingQueue(): Promise<boolean> {
  const pending = await getPendingItems();
  if (pending.length === 0) return false;

  console.log(`Processing ${pending.length} pending bookmark(s)...`);

  try {
    const { data, sha } = await fetchBookmarks();

    for (const item of pending) {
      await markSyncing(item.id);

      const bookmark: Bookmark = {
        id: item.id,
        url: item.url,
        title: item.title,
        tags: item.tags,
        note: item.note,
        createdAt: item.createdAt,
        contentFetched: item.contentFetched,
        coverImage: item.coverImage,
      };

      if (data.items.some((b) => b.id === bookmark.id)) {
        await markSynced(item.id);
        continue;
      }

      data.items.push(bookmark);
    }

    await pushBookmarks(data, sha);

    for (const item of pending) {
      await markSynced(item.id);
    }

    console.log('Pending queue processed successfully');
    return true;
  } catch (error) {
    console.error('Failed to process pending queue:', error);
    for (const item of pending) {
      await markFailed(item.id);
    }
    return false;
  }
}

// Process both pending and failed items (retry failed ones)
export async function processAllPending(): Promise<void> {
  await processPendingQueue();
}

export function startSyncTimer(): void {
  chrome.alarms.create('syncPending', { periodInMinutes: 5 });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncPending') {
    processAllPending();
  }
});
