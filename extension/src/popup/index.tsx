import { useState, useEffect } from 'preact/hooks';
import { type Bookmark } from '../lib/github';
import { generateUlid } from '../lib/ulid';

export default function Popup() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setTitle(tabs[0].title || '');
        setUrl(tabs[0].url || '');
      }
    });

    // Load default tags from config
    chrome.storage.local.get(['defaultTags'], (result) => {
      if (result.defaultTags) {
        setTags(result.defaultTags);
      }
    });
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');

    const bookmark: Bookmark = {
      id: generateUlid(),
      url,
      title,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      note,
      createdAt: new Date().toISOString(),
      contentFetched: false,
      coverImage: null,
    };

    try {
      // Import sync dynamically to avoid issues
      const { syncBookmark } = await import('../lib/sync');
      const synced = await syncBookmark(bookmark);
      setStatus(synced ? 'saved' : 'error');
      if (!synced) {
        setErrorMsg('Saved locally. Will sync when online.');
      }
      // Notify background to attempt sync
      chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
    } catch (err) {
      console.error('Save error:', err);
      setStatus('error');
      setErrorMsg('Failed to save. Check console for details.');
    }
  };

  return (
    <div class="p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 class="text-lg font-bold mb-4">Save to Lethe</h1>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">URL</label>
          <input
            type="text"
            value={url}
            onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onInput={(e) => setTags((e.target as HTMLInputElement).value)}
            placeholder="ai, essays, work"
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label class="block text-xs font-medium mb-1">Note</label>
          <textarea
            value={note}
            onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
            rows={2}
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={status === 'saving' || !url}
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved!' : 'Save Bookmark'}
        </button>

        {status === 'error' && (
          <p class="text-xs text-yellow-600 dark:text-yellow-400">{errorMsg}</p>
        )}

        <a
          href="options.html"
          class="block text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-center"
        >
          Settings
        </a>
      </div>
    </div>
  );
}
