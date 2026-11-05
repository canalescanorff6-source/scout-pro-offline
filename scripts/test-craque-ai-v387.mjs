import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker,{reserveCostMicro,allowedOrigin,limits} from '../cloudflare/craque-ai/src/index.mjs';

const TOKEN='test-only-this-is-a-very-long-worker-bearer-token';
function dbMock(){
 const records=new Map();
 return {records,prepare(sql){
   return {bind(...params){return {async first(){
     if(sql.startsWith('SELECT')){
       const row=records.get(params[0]);
       return row?{...row}:null;
     }
     const [bucket,requested,now,maxMicro,maxCalls]=params;
     const existing=records.get(bucket)||{reserved_micro_usd:0,calls:0};
     if(existing.reserved_micro_usd+requested>maxMicro||existing.calls>=maxCalls)return null;
     const next={reserved_micro_usd:existing.reserved_micro_usd+requested,calls:existing.calls+1,updated_at:now};
     records.set(bucket,next);
     return {calls:next.calls};
   }}}};
 }};
}
function env(extra={}){
 return {DB:dbMock(),GEMINI_API_KEY:'fake-gemini-key-for-unit-test',APP_ACCESS_TOKEN:TOKEN,
   ALLOWED_ORIGINS:'https://localhost,scout://app',...extra};
}
const request=(url,method='GET',body=null,origin='https://localhost',auth=true)=>
 new Request('https://craque-ai.example'+url,{method,headers:{
   ...(origin?{'Origin':origin}:{}),
   ...(auth?{'Authorization':'Bearer '+TOKEN}:{}),
   'Content-Type':'application/json'
 },...(body?{body:JSON.stringify(body)}:{})});
async function response(requested,environment){
 const r=await worker.fetch(requested,environment);
 return {status:r.status,headers:r.headers,body:await r.json()};
}
test('token/segredos ficam protegidos e CORS e restrito',async()=>{
 const e=env();
 const result=await response(request('/usage','GET',null,'https://evil.example'),e);
 assert.equal(result.status,403);
 const noToken=await response(request('/usage','GET',null,'https://localhost',false),e);
 assert.equal(noToken.status,401);
 const valid=await response(request('/usage','GET'),e);
 assert.equal(valid.status,200);
 assert.equal(valid.headers.get('Access-Control-Allow-Origin'),'https://localhost');
 assert.equal(valid.body.usage.reservedUsd,0);
 const health=await response(request('/health','GET',null,'https://localhost',false),e);
 assert.equal(health.body.configured,true);
 assert.equal(health.status,200);
});
test('origens validas, teto mensal e limites fixos',()=>{
 assert.equal(allowedOrigin(request('/usage'),env()),'https://localhost');
 assert.equal(allowedOrigin(request('/usage','GET',null,'https://evil.example'),env()),false);
 assert.equal(limits({MONTHLY_BUDGET_MICRO_USD:'9000000',DAILY_CALL_LIMIT:'900'}).monthlyMicro,3000000);
 assert.equal(limits({DAILY_CALL_LIMIT:'900'}).dailyCalls,60);
 assert(reserveCostMicro('olá')>0);
 assert(reserveCostMicro('x'.repeat(1000))>reserveCostMicro('x'));
});
test('consulta individual e somente leitura: resposta sem modificar dados',async()=>{
 const e=env(),before=e.DB.records.size;
 const prior=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async (uri,opts)=>{
   calls++;
   assert.match(String(uri),/generativelanguage.googleapis.com/);
   assert.equal(opts.headers['x-goog-api-key'],e.GEMINI_API_KEY);
   const sent=JSON.parse(opts.body);
   assert.equal(sent.generationConfig.maxOutputTokens,768);
   assert(sent.contents[0].parts[0].text.includes('Card ID pendente'));
   return Response.json({candidates:[{content:{parts:[{text:'Pendente: conferir Card ID.'}]}}],
     usageMetadata:{promptTokenCount:220,candidatesTokenCount:12}});
 };
 try{
   const payload={mode:'carta',question:'Qual a melhor funcao desse jogador?',context:{name:'Teste',id:'Card ID pendente'}};
   const r=await response(request('/analyze','POST',payload),e);
   assert.equal(r.status,200);
   assert.match(r.body.answer,/Pendente/);
   assert.equal(r.body.model,'gemini-2.5-flash-lite');
   assert.equal(calls,1);
   assert.equal(before,0);
   assert.equal(e.DB.records.size,2);
   assert(r.body.usage.reservedUsd>0);
 }finally{globalThis.fetch=prior;}
});
test('falhas nao liberam limite, bloqueio diario ocorre antes do Gemini',async()=>{
 const e=env({DAILY_CALL_LIMIT:'1'});
 const old=globalThis.fetch;
 let calls=0;
 globalThis.fetch=async()=>{calls++;return Response.json({candidates:[{content:{parts:[{text:'OK'}]}}]});};
 try{
  const p={mode:'formacao',question:'Analise esta formacao.',context:{formation:'4312'}};
  const a=await response(request('/analyze','POST',p),e);
  const b=await response(request('/analyze','POST',p),e);
  assert.equal(a.status,200);
  assert.equal(b.status,429);
  assert.equal(calls,1);
  assert.equal(b.body.usage.dayCalls,1);
 }finally{globalThis.fetch=old;}
});
test('auditoria exige consentimento e nao recebe URLs arbitrarias',async()=>{
 const e=env();
 let p={mode:'codigo',question:'Encontre problemas de seguranca.',context:{},auditPath:'https://evil.example/a.js',confirmCodeShare:false};
 assert.equal((await response(request('/analyze','POST',p),e)).status,400);
 p={...p,confirmCodeShare:true};
 const r=await response(request('/analyze','POST',p),e);
 assert.equal(r.status,400);
 assert.equal(e.DB.records.size,0);
});
test('input invalido, segredo ausente e respostas de falha seguros',async()=>{
 const e=env();
 assert.equal((await response(request('/analyze','POST',{mode:'carta',question:'x',context:{} }),e)).status,400);
 assert.equal((await response(request('/usage'),env({DB:null}))).status,503);
 assert.equal((await response(request('/usage'),env({APP_ACCESS_TOKEN:'curto'}))).status,401);
});
test('interface continua independente do modelo e chaves nao aparecem no cliente',()=>{
 const client=readFileSync(new URL('../web/craque-ai-v387.js',import.meta.url),'utf8');
 const home=readFileSync(new URL('../web/index.html',import.meta.url),'utf8');
 const sw=readFileSync(new URL('../web/sw.js',import.meta.url),'utf8');
 assert(!client.includes('generativelanguage.googleapis.com'));
 assert(!client.includes('x-goog-api-key'));
 assert(client.includes('scoutpro:ai:v387:corrections'));
 assert(client.includes('scoutpro:v219:black-caps'));
 assert(home.includes('craque-ai-v387.html'));
 for(const f of ['craque-ai-v387.html','craque-ai-v387.css','craque-ai-v387.js'])assert(sw.includes(f));
});
