import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { marked } from 'marked';
import { loadBookmarks, type Bookmark } from '../content.config';

export type { Bookmark };

export interface BookmarkData {
  version: number;
  items: Bookmark[];
}

function getDataDir(): string {
  return join(process.cwd(), '..', 'data');
}

// Cache loaded bookmarks to avoid redundant file reads
let _cachedBookmarks: Bookmark[] | null = null;
let _cachedVersion: number | null = null;

function loadFromDisk(): BookmarkData {
  const dataDir = getDataDir();
  const raw = readFileSync(join(dataDir, 'bookmarks.json'), 'utf-8');
  const data = JSON.parse(raw);
  return { version: data.version, items: loadBookmarks() };
}

export function getBookmarks(): BookmarkData {
  if (!_cachedBookmarks) {
    const data = loadFromDisk();
    _cachedBookmarks = data.items;
    _cachedVersion = data.version;
  }
  return { version: _cachedVersion!, items: _cachedBookmarks };
}

export function getBookmarkById(id: string): Bookmark | undefined {
  return getBookmarks().items.find((item) => item.id === id);
}

export function getBookmarkContent(id: string): string | null {
  const dataDir = getDataDir();
  const contentPath = join(dataDir, 'content', `${id}.md`);
  if (!existsSync(contentPath)) return null;
  const raw = readFileSync(contentPath, 'utf-8');
  // Strip YAML frontmatter
  const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\n*/, '');
  return marked.parse(withoutFrontmatter) as string;
}

export function getAllTags(): string[] {
  const bookmarks = getBookmarks().items;
  const tags = new Set<string>();
  for (const item of bookmarks) {
    for (const tag of item.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

export function getAllDomains(): string[] {
  const bookmarks = getBookmarks().items;
  const domains = new Set<string>();
  for (const item of bookmarks) {
    const url = new URL(item.url);
    domains.add(url.hostname);
  }
  return Array.from(domains).sort();
}

export function getBookmarksByTag(tag: string): Bookmark[] {
  return getBookmarks().items.filter((item) => item.tags.includes(tag));
}

export function getBookmarksByDomain(domain: string): Bookmark[] {
  return getBookmarks().items.filter((item) => {
    const url = new URL(item.url);
    return url.hostname === domain;
  });
}

export function getDomain(urlString: string): string {
  try {
    return new URL(urlString).hostname;
  } catch {
    return urlString;
  }
}
