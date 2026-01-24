/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Build-time constants from vite.define
declare const __GIT_COMMIT__: string;

type D1Database = import('@cloudflare/workers-types').D1Database;

interface Env {
  DB: D1Database;
  REFYNE_API_URL: string;
  DEMO_API_KEY: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
