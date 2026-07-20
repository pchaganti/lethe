import { useState, useEffect } from 'preact/hooks';

interface Config {
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
  defaultTags: string;
}

export default function Options() {
  const [config, setConfig] = useState<Config>({
    githubOwner: '',
    githubRepo: '',
    githubToken: '',
    defaultTags: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ['githubOwner', 'githubRepo', 'githubToken', 'defaultTags'],
      (result) => {
        setConfig({
          githubOwner: result.githubOwner || '',
          githubRepo: result.githubRepo || '',
          githubToken: result.githubToken || '',
          defaultTags: result.defaultTags || '',
        });
      }
    );
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({
      githubOwner: config.githubOwner,
      githubRepo: config.githubRepo,
      githubToken: config.githubToken,
      defaultTags: config.defaultTags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div class="w-96 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h1 class="text-xl font-bold mb-6">Lethe Settings</h1>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">GitHub Token</label>
          <input
            type="password"
            value={config.githubToken}
            onInput={(e) =>
              setConfig({ ...config, githubToken: (e.target as HTMLInputElement).value })
            }
            placeholder="ghp_xxxxxxxxxxxx"
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800"
          />
          <p class="text-xs text-gray-500 mt-1">
            Fine-grained PAT with Contents: Read/Write permission
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Repository Owner</label>
          <input
            type="text"
            value={config.githubOwner}
            onInput={(e) =>
              setConfig({ ...config, githubOwner: (e.target as HTMLInputElement).value })
            }
            placeholder="username"
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Repository Name</label>
          <input
            type="text"
            value={config.githubRepo}
            onInput={(e) =>
              setConfig({ ...config, githubRepo: (e.target as HTMLInputElement).value })
            }
            placeholder="lethe"
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Default Tags</label>
          <input
            type="text"
            value={config.defaultTags}
            onInput={(e) =>
              setConfig({ ...config, defaultTags: (e.target as HTMLInputElement).value })
            }
            placeholder="reading, later"
            class="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800"
          />
          <p class="text-xs text-gray-500 mt-1">
            Comma-separated tags applied to every new bookmark
          </p>
        </div>

        <button
          onClick={handleSave}
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
