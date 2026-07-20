import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT_DIR = join(import.meta.dirname, '..');
const OUTPUT_FILE = join(ROOT_DIR, 'data', 'bookmarks.json');

interface OsmosMemoEntry {
  url: string;
  title: string;
  tags?: string[];
  note?: string;
  created?: string;
  timestamp?: number;
}

interface OsmosMemoData {
  version?: number;
  bookmarks?: OsmosMemoEntry[];
  items?: OsmosMemoEntry[];
}

interface LetheBookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  note: string;
  createdAt: string;
  contentFetched: boolean;
  coverImage: string | null;
}

function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 26; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function convertTimestamp(entry: OsmosMemoEntry): string {
  if (entry.created) {
    const date = new Date(entry.created);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  if (entry.timestamp) {
    const date = new Date(entry.timestamp);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: tsx migrate-osmosmemo.ts <input.json>');
    console.error('');
    console.error('Converts osmosmemo JSON format to Lethe format.');
    console.error('Input can be the osmosmemo bookmarks.json file.');
    process.exit(1);
  }

  console.log(`Reading: ${inputPath}`);
  const raw = readFileSync(inputPath, 'utf-8');
  const data: OsmosMemoData = JSON.parse(raw);

  const entries = data.bookmarks || data.items || [];
  console.log(`Found ${entries.length} entries to convert`);

  const bookmarks: LetheBookmark[] = entries.map((entry) => ({
    id: generateId(),
    url: entry.url,
    title: entry.title,
    tags: entry.tags || [],
    note: entry.note || '',
    createdAt: convertTimestamp(entry),
    contentFetched: false,
    coverImage: null,
  }));

  const output = {
    version: 2,
    items: bookmarks,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Converted ${bookmarks.length} bookmarks to ${OUTPUT_FILE}`);
  console.log('Done!');
}

main();
