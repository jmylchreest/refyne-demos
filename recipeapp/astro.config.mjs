import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';

// Get git commit hash for footer
function getGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: 'https://recipeapp-demo.refyne.uk',
  vite: {
    plugins: [tailwindcss()],
    define: {
      __GIT_COMMIT__: JSON.stringify(getGitCommit()),
    },
  },
});
