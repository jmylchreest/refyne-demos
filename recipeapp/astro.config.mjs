import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: 'https://recipeapp.demo.refyne.uk',
  vite: {
    plugins: [tailwindcss()],
  },
});
