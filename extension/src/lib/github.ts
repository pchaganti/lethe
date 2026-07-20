const API_BASE = 'https://api.github.com';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  note: string;
  createdAt: string;
  contentFetched: boolean;
  coverImage: string | null;
}

export interface BookmarkData {
  version: number;
  items: Bookmark[];
}

interface GitHubContent {
  sha: string;
  content: string;
}

// UTF-8 safe base64 encoding/decoding
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function getConfig(): Promise<{ owner: string; repo: string; token: string }> {
  const result = await chrome.storage.local.get(['githubOwner', 'githubRepo', 'githubToken']);
  return {
    owner: result.githubOwner || '',
    repo: result.githubRepo || '',
    token: result.githubToken || '',
  };
}

export async function fetchBookmarks(): Promise<{ data: BookmarkData; sha: string }> {
  const { owner, repo, token } = await getConfig();
  const path = 'data/bookmarks.json';

  const response = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status}`);
  }

  const content: GitHubContent = await response.json() as GitHubContent;
  const decoded = base64ToUtf8(content.content.replace(/\n/g, ''));
  const data: BookmarkData = JSON.parse(decoded);

  return { data, sha: content.sha };
}

export async function pushBookmarks(data: BookmarkData, sha: string): Promise<void> {
  const { owner, repo, token } = await getConfig();
  const path = 'data/bookmarks.json';
  const content = utf8ToBase64(JSON.stringify(data, null, 2));

  const response = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `chore: add bookmark "${data.items[data.items.length - 1].title}"`,
      content,
      sha,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to push bookmarks: ${response.status} - ${error}`);
  }
}
