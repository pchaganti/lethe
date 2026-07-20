import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://pchaganti.github.io',
  base: '/lethe/',
  output: 'static',
  integrations: [tailwind()],
});
