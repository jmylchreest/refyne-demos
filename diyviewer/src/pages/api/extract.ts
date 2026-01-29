import type { APIRoute } from 'astro';
import { startExtraction } from '../../lib/refyne';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env;

  try {
    const body = await request.json() as { url?: string };
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate environment variables
    if (!env.REFYNE_API_URL || !env.DEMO_API_KEY) {
      console.error('Missing environment variables:', {
        hasApiUrl: !!env.REFYNE_API_URL,
        hasApiKey: !!env.DEMO_API_KEY,
      });
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Use the demo domain as the referer (must match API key configuration)
    const referer = 'https://diyviewer-demo.refyne.uk';
    console.log('[extract] Starting extraction with:', {
      targetUrl: url,
      apiUrl: env.REFYNE_API_URL,
      referer,
      hasApiKey: !!env.DEMO_API_KEY,
      apiKeyPrefix: env.DEMO_API_KEY?.substring(0, 8) + '...',
    });

    const result = await startExtraction(url, env.REFYNE_API_URL, env.DEMO_API_KEY, referer);

    console.log('[extract] Result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[extract] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Internal server error',
      errorName: error?.name,
      errorStatus: error?.status,
      errorDetail: error?.detail,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
