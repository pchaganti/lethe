import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import TurndownService from 'turndown';
import sharp from 'sharp';

const ROOT_DIR = join(import.meta.dirname, '..');
const DATA_DIR = join(ROOT_DIR, 'data');
const CONTENT_DIR = join(DATA_DIR, 'content');
const COVERS_DIR = join(ROOT_DIR, 'site', 'public', 'assets', 'covers');
const BOOKMARKS_FILE = join(DATA_DIR, 'bookmarks.json');

interface Bookmark {
  id: string;
  url: string;
  title: string;
  tags: string[];
  note: string;
  createdAt: string;
  contentFetched: boolean;
  coverImage: string | null;
}

interface BookmarkData {
  version: number;
  items: Bookmark[];
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LetheBot/1.0; +https://github.com/pchaganti/lethe)',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function extractOgImage(doc: Document): string | null {
  const ogMeta = doc.querySelector('meta[property="og:image"]');
  if (ogMeta) {
    const content = ogMeta.getAttribute('content');
    if (content) return content;
  }
  const twitterMeta = doc.querySelector('meta[name="twitter:image"]');
  if (twitterMeta) {
    const content = twitterMeta.getAttribute('content');
    if (content) return content;
  }
  // Fallback: first large image on page
  const img = doc.querySelector('article img, main img, .content img');
  if (img) {
    const src = img.getAttribute('src');
    if (src && !src.includes('avatar') && !src.includes('logo')) return src;
  }
  return null;
}

function extractFavicon(doc: Document, baseUrl: string): string | null {
  const iconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (iconLink) {
    const href = iconLink.getAttribute('href');
    if (href) {
      if (href.startsWith('//')) return `https:${href}`;
      if (href.startsWith('/')) return new URL(href, baseUrl).href;
      return href;
    }
  }
  return null;
}

async function downloadAndConvertImage(
  imageUrl: string,
  outputPath: string
): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(imageUrl);
    if (!response.ok) return false;

    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .resize({ width: 1200, height: 630, fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch {
    return false;
  }
}

async function processBookmark(bookmark: Bookmark): Promise<void> {
  console.log(`Processing: ${bookmark.title} (${bookmark.url})`);

  try {
    const response = await fetchWithTimeout(bookmark.url);
    if (!response.ok) {
      console.error(`  Failed to fetch: ${response.status}`);
      return;
    }

    const html = await response.text();
    const { document } = parseHTML(html);

    // Extract content with Readability
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      console.error(`  Readability failed to extract content`);
      return;
    }

    // Convert to Markdown
    const markdown = `---
id: ${bookmark.id}
url: ${bookmark.url}
title: ${article.title || bookmark.title}
---

${turndown.turndown(article.content)}
`;

    // Save content file
    const contentPath = join(CONTENT_DIR, `${bookmark.id}.md`);
    writeFileSync(contentPath, markdown, 'utf-8');
    console.log(`  Saved content: ${contentPath}`);

    // Process cover image
    const ogImageUrl = extractOgImage(document);
    let coverPath: string | null = null;

    if (ogImageUrl) {
      let fullUrl = ogImageUrl;
      if (ogImageUrl.startsWith('//')) {
        fullUrl = `https:${ogImageUrl}`;
      } else if (ogImageUrl.startsWith('/')) {
        fullUrl = new URL(ogImageUrl, bookmark.url).href;
      }

      const outputPath = join(COVERS_DIR, `${bookmark.id}.webp`);
      if (await downloadAndConvertImage(fullUrl, outputPath)) {
        coverPath = `/assets/covers/${bookmark.id}.webp`;
        console.log(`  Saved cover image: ${coverPath}`);
      }
    }

    // Extract favicon
    const favicon = extractFavicon(document, bookmark.url);
    if (favicon) {
      console.log(`  Favicon: ${favicon}`);
    }

    // Update bookmark data
    bookmark.contentFetched = true;
    bookmark.coverImage = coverPath;
  } catch (error) {
    console.error(`  Error processing ${bookmark.url}:`, error);
  }
}

async function main() {
  console.log('=== Lethe Bookmark Processor ===\n');

  // Ensure directories exist
  mkdirSync(CONTENT_DIR, { recursive: true });
  mkdirSync(COVERS_DIR, { recursive: true });

  // Read bookmarks
  const raw = readFileSync(BOOKMARKS_FILE, 'utf-8');
  const data: BookmarkData = JSON.parse(raw);

  // Find unfetched bookmarks
  const unfetched = data.items.filter((item) => !item.contentFetched);
  console.log(`Found ${unfetched.length} unfetched bookmark(s)\n`);

  if (unfetched.length === 0) {
    console.log('Nothing to process.');
    return;
  }

  // Process each bookmark
  for (const bookmark of unfetched) {
    await processBookmark(bookmark);
    console.log('');
  }

  // Save updated bookmarks
  writeFileSync(BOOKMARKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Updated ${BOOKMARKS_FILE}`);
  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
