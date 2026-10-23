import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../ui.js',import.meta.url),'utf8');
test('saved replay failure is visible, concurrent reads coalesce, retry succeeds',async()=>{
 let rejectRead,calls=0;const adapter={loadAnalysisLogs:()=>{calls++;return new Promise((_,reject)=>{rejectRead=reject;});}};
 const expanded={innerHTML:'',textContent:''},card={dataset:{},querySelector:()=>expanded};
 const context=vm.createContext({getWindowValue:()=>adapter,UILog:{warn(){}},_escapeHtml:s=>String(s)});
 vm.runInContext(source.slice(source.indexOf('async function lazyLoadAnalysisLogs('),source.indexOf('function csGetActivePlayerKey(')),context);
 const one=context.lazyLoadAnalysisLogs('fixture',card),two=context.lazyLoadAnalysisLogs('fixture',card);
 assert.equal(calls,1,'rapid open must not duplicate the pending read');
 rejectRead(new Error('offline fixture'));await Promise.all([one,two]);
 assert.match(expanded.textContent,/could not load|retry/i);assert(!card.dataset.loaded);assert(!card.dataset.loading);
 adapter.loadAnalysisLogs=async()=>{calls++;return [];};await context.lazyLoadAnalysisLogs('fixture',card);
 assert.equal(calls,2);assert.equal(card.dataset.loaded,'true');assert.match(expanded.innerHTML,/No game logs/);
});
