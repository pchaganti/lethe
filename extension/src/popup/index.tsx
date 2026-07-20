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
      const { syncBookmark } = await import('../lib/sync');
      const synced = await syncBookmark(bookmark);
      setStatus(synced ? 'saved' : 'error');
      if (!synced) {
        setErrorMsg('Saved locally. Will sync when online.');
      }
      chrome.runtime.sendMessage({ type: 'SYNC_NOW' });
    } catch (err) {
      console.error('Save error:', err);
      setStatus('error');
      setErrorMsg('Failed to save.');
    }
  };

  return (
    <div class="popup">
      <h1>Save to Lethe</h1>
      <div class="field">
        <label>Title</label>
        <input type="text" value={title} onInput={(e) => setTitle((e.target as HTMLInputElement).value)} />
      </div>
      <div class="field">
        <label>URL</label>
        <input type="text" value={url} onInput={(e) => setUrl((e.target as HTMLInputElement).value)} />
      </div>
      <div class="field">
        <label>Tags (comma-separated)</label>
        <input type="text" value={tags} onInput={(e) => setTags((e.target as HTMLInputElement).value)} placeholder="ai, essays, work" />
      </div>
      <div class="field">
        <label>Note</label>
        <textarea rows={2} onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}>{note}</textarea>
      </div>
      <button onClick={handleSave} disabled={status === 'saving' || !url}>
        {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved!' : 'Save Bookmark'}
      </button>
      {status === 'error' && <p class="error">{errorMsg}</p>}
      <a href="options.html" class="settings-link">Settings</a>
    </div>
  );
}
