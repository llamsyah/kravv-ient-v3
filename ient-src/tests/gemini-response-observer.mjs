// QA client only. Reuse the same fixed-field sanitizer as the Worker. Loading TS
// here matches the existing offline adapter tests and adds no runtime dependency.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript'), loaded = {exports:{}};
const code = ts.transpileModule(readFileSync(new URL('../lib/gemini-diagnostics.server.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
new Function('require','exports','module',code)(require,loaded.exports,loaded);
export const {createGeminiDiagnostics} = loaded.exports;
const {diagnosticFailure,isDiagnosticAbort} = loaded.exports;
function outcome(error) {
  try {if(error?.name === 'TimeoutError')return 'timeout';} catch { /* Unknown error stays sanitized. */ }
  return isDiagnosticAbort(error) ? 'aborted' : 'failed';
}
export async function observeGeminiResponse(send, requestId, trace = createGeminiDiagnostics(requestId)) {
  const headers = trace.begin('qa_application_headers',{headersReceived:false,bodyComplete:false});
  let response;
  try {
    response = await send();
    headers.end('completed',{applicationHttpStatus:response.status,headersReceived:true,bodyComplete:false});
  } catch(error) {headers.end(outcome(error),diagnosticFailure(error));throw error;}
  const fields = {applicationHttpStatus:response.status,headersReceived:true,bodyComplete:false};
  const bodyPhase = trace.begin('qa_application_body',fields);
  try {
    // Exactly the original single JSON read, without a clone, retry or new timer.
    const body = await response.json();
    bodyPhase.end('completed',{...fields,bodyComplete:true,...(!response.ok ? diagnosticFailure({code:body?.code}) : {})});
    return {response,body};
  } catch(error) {bodyPhase.end(outcome(error),{...fields,...diagnosticFailure(error)});throw error;}
}
