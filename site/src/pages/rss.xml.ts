import rss from '@astrojs/rss';
import { getBookmarks } from '../lib/bookmarks';
import type { APIContext } from 'astro';

export function GET(context: APIContext) {
  const data = getBookmarks();
  const sorted = [...data.items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return rss({
    title: 'Lethe Bookmarks',
    description: 'A feed of bookmarked articles',
    site: context.site!,
    items: sorted.map((item) => ({
      title: item.title,
      pubDate: new Date(item.createdAt),
      description: item.note,
      link: `/reader/${item.id}`,
    })),
  });
}
