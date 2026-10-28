import {PdfInputError, prepareCasePdfInput, summarizeCasePdfInput} from '@/lib/document-input.server';

export const dynamic = 'force-dynamic';
const headers = {'Cache-Control': 'private, no-store'};

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return Response.json({code: 'INVALID_ORIGIN', error: 'Invalid request origin.'}, {status: 403, headers});
    let selection: unknown;
    try { selection = await request.json(); }
    catch { return Response.json({code: 'INVALID_REQUEST', error: 'Send a JSON case ID and document selection.'}, {status: 400, headers}); }
    const input = await prepareCasePdfInput(selection);
    return Response.json(summarizeCasePdfInput(input), {headers});
  } catch (error) {
    if (error instanceof PdfInputError) return Response.json({code: error.code, error: error.message}, {status: error.status, headers});
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') return Response.json({code: 'AUTH_REQUIRED', error: 'Sign in to prepare case documents.'}, {status: 401, headers});
    return Response.json({code: 'STORAGE_UNAVAILABLE', error: 'Unable to prepare the selected PDFs. Document storage may be unavailable; please retry.'}, {status: 503, headers});
  }
}
