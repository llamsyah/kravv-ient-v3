import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=readFileSync(new URL('../app/assistant-intents.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};new Function('exports','module',compiled)(module.exports,module);
const {resolveDemoIntent}=module.exports;
for(const [expected,examples] of Object.entries({
  summary:['summarize this case','Summary','ringkas kasus','give an overview'],
  unknowns:['what is unknown?','missing evidence','diligence gap','unresolved issues','belum tahu'],
  challenge:['challenge the thesis','counter argument','risk factors','weakness','bantah tesis','kritik tesis'],
  changes:['what changed?','compare runs','previous run','latest run','perubahan terakhir','bandingkan run'],
}))for(const example of examples)assert.equal(resolveDemoIntent(example),expected,example);
assert.equal(resolveDemoIntent('Hello, can you help?'),null);
assert.equal(resolveDemoIntent('counterparty'),null);
console.log('Passed: local Assistant intent selection and honest unmatched-message boundary.');
