'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Executa o listener real isolado: a abertura/troca automática não é uma edição.
const source=fs.readFileSync('web/lab.js','utf8');
const start=source.indexOf("window.addEventListener('scoutpro:training-edit-v218'");
const end=source.indexOf("window.addEventListener('scoutpro:training-load-v160'",start);
assert(start>0&&end>start);
let handler,writes=0,renders=0,removes=0;
const ctx={window:{addEventListener:(_name,fn)=>handler=fn},cardCap:153,d:{id:'105780749692770',pp:48,A:null,recommended:null},
 previewValid:v=>Array.isArray(v)&&v.length===10,total:v=>v.reduce((s,n)=>s+n,0),
 persist:()=>writes++,render:()=>renders++,current:null,active:null,storageKey:'new-edition',
 localStorage:{removeItem:()=>removes++}};
vm.runInNewContext(source.slice(start,end),ctx);
const detail={cap:153,card_id:ctx.d.id,levels:[0,4,1,0,4,9,12,0,0,0]};
handler({detail:{...detail,mode:'switch'}});
assert.equal(writes,0,'Troca de estilo não pode salvar uma proposta como treino pessoal');
assert.deepEqual(Array.from(ctx.current),detail.levels);assert.equal(renders,1);
handler({detail:{...detail,mode:'save'}});assert.equal(writes,1,'Edição explícita continua salvando no laboratório');
handler({detail:{...detail,mode:'unknown'}});assert.equal(writes,1,'Eventos de prévia desconhecidos não gravam');
handler({detail:{...detail,card_id:'106766981558114',mode:'save'}});assert.equal(writes,1,'Outra edição não altera a ficha');
handler({detail:{...detail,mode:'restore'}});assert.equal(removes,1);assert.equal(writes,1);
console.log('V377 laboratório PASS: troca automática só visualiza; salvar explícito e restaurar preservam identidade.');
