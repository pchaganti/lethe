import { defineCollection, z } from 'astro:content';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const bookmarkSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  tags: z.array(z.string()),
  note: z.string(),
  createdAt: z.string().datetime(),
  contentFetched: z.boolean(),
  coverImage: z.string().nullable(),
});

const bookmarksCollection = defineCollection({
  type: 'data',
  schema: bookmarkSchema,
});

export type Bookmark = z.infer<typeof bookmarkSchema>;

export const collections = {
  bookmarks: bookmarksCollection,
};

// Helper to load bookmarks with Zod validation
export function loadBookmarks(): Bookmark[] {
  const dataDir = join(process.cwd(), '..', 'data');
  const raw = readFileSync(join(dataDir, 'bookmarks.json'), 'utf-8');
  const data = JSON.parse(raw);
  return data.items.map((item: unknown) => bookmarkSchema.parse(item));
}
