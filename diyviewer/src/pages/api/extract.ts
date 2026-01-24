import type { APIRoute } from 'astro';
import { startExtraction } from '../../lib/refyne';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env;

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const referer = request.headers.get('origin') || 'https://diyviewer-demo.refyne.uk';
    const result = await startExtraction(url, env.REFYNE_API_URL, env.DEMO_API_KEY, referer);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
