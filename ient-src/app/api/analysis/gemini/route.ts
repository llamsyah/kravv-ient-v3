import {runGeminiAnalysis} from '@/lib/gemini-run.server';
import {GeminiError} from '@/lib/gemini-analysis';
import {PdfInputError} from '@/lib/document-input.server';
export const dynamic = 'force-dynamic';
const headers = {'Cache-Control': 'private, no-store'};
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return Response.json({code: 'INVALID_ORIGIN', error: 'Invalid request origin.'}, {status: 403, headers});
    let input: unknown;
    try {input = await request.json();} catch {return Response.json({code: 'INVALID_REQUEST', error: 'Send a valid analysis request.'}, {status: 400, headers});}
    return Response.json(await runGeminiAnalysis(input), {headers});
  } catch (error) {
    if (error instanceof GeminiError || error instanceof PdfInputError) return Response.json({code: error.code, error: error.message}, {status: error.status, headers});
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return Response.json({code: 'AUTH_REQUIRED', error: 'Sign in to run analysis.'}, {status: 401, headers});
    return Response.json({code: 'SAVE_UNCERTAIN', error: 'The analysis request could not be confirmed. Retry the same request; it will not automatically repeat a provider call.'}, {status: 503, headers});
  }
}
