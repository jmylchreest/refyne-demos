import type { APIRoute } from 'astro';
import { getJobStatus } from '../../../lib/refyne';

export const GET: APIRoute = async ({ params, request, locals }) => {
  const env = (locals as any).runtime.env;
  const { jobId } = params;

  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Job ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const referer = request.headers.get('origin') || 'https://diyviewer-demo.refyne.uk';
    const result = await getJobStatus(jobId, env.REFYNE_API_URL, env.DEMO_API_KEY, referer);

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
