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
    <div class="options">
      <h1>Lethe Settings</h1>
      <div class="field">
        <label>GitHub Token</label>
        <input
          type="password"
          value={config.githubToken}
          onInput={(e) => setConfig({ ...config, githubToken: (e.target as HTMLInputElement).value })}
          placeholder="ghp_xxxxxxxxxxxx"
        />
        <p class="hint">Fine-grained PAT with Contents: Read/Write permission</p>
      </div>
      <div class="field">
        <label>Repository Owner</label>
        <input
          type="text"
          value={config.githubOwner}
          onInput={(e) => setConfig({ ...config, githubOwner: (e.target as HTMLInputElement).value })}
          placeholder="username"
        />
      </div>
      <div class="field">
        <label>Repository Name</label>
        <input
          type="text"
          value={config.githubRepo}
          onInput={(e) => setConfig({ ...config, githubRepo: (e.target as HTMLInputElement).value })}
          placeholder="lethe"
        />
      </div>
      <div class="field">
        <label>Default Tags</label>
        <input
          type="text"
          value={config.defaultTags}
          onInput={(e) => setConfig({ ...config, defaultTags: (e.target as HTMLInputElement).value })}
          placeholder="reading, later"
        />
        <p class="hint">Comma-separated tags applied to every new bookmark</p>
      </div>
      <button onClick={handleSave}>{saved ? 'Saved!' : 'Save Settings'}</button>
    </div>
  );
}
