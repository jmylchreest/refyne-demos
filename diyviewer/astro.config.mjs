import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';

// Get git commit hash at build time
const gitCommitHash = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
})();

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  site: 'https://diyviewer-demo.refyne.uk',
  vite: {
    plugins: [tailwindcss()],
    define: {
      __GIT_COMMIT__: JSON.stringify(gitCommitHash),
    },
  },
});
