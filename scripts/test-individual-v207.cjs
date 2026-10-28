'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const {suggestPreview,suggestIndividualPreview,previewCost,previewValid,individualWeights}=require('../web/lab.js');
const {inspect,contrast,role}=require('../web/scout-individual-v207.js');
assert.equal(cards.length,246);assert.equal(role('AC'),'CA');assert.equal(role('ZC'),'ZG');
const original=cards.filter(x=>Array.isArray(x.niveis)),provisional=cards.filter(x=>x.niveis===null);
assert.equal(original.length,162);assert.equal(provisional.length,84);
const c=i=>cards.find(x=>x.numero===i);
function inspectCap(i){
 const x=c(i);return inspect(cards,{...x,capture:i,role_used:role(x.posicao),attack_style:x.estilo_ataque,recommended_levels:x.niveis});
}
assert(inspectCap(1).peers.some(x=>x.numero===32),'Massaro/Batistuta registrados iguais');
const normalizedFicha=JSON.parse(read('web/'+c(1).arquivo).match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
assert(inspect(cards,normalizedFicha).peers.some(x=>x.numero===32),'Rótulos PT-BR normalizados precisam manter a comparação com o catálogo histórico');
assert(contrast(c(1),c(32)).boostDifferent,'ímpetos de Massaro e Batistuta diferem');
for(const n of [99,102,216])assert(inspectCap(95).peers.some(x=>x.numero===n),'meias registrados iguais '+n);
assert(inspectCap(144).peers.some(x=>x.numero===154),'zagueiros registrados iguais');
assert.equal(inspectCap(12).signature,false,'sem treino não é duplicação');
let signals=0,changed=0;
for(const x of cards){
 const identity={native_skills:x.habilidades_nativas,boost1:x.impeto_fixo};
 const prev=suggestPreview(x.pp,x.posicao,x.estilo_ataque);
 const alt=suggestIndividualPreview(x.pp,x.posicao,x.estilo_ataque,identity);
 assert(previewValid(alt.vec),'10 níveis válidos '+x.numero);
 assert.equal(previewCost(alt.vec),x.pp,'PP exatos '+x.numero);
 assert.equal(alt.remaining,0,'sem PP sobrando '+x.numero);
 assert(['comparativa_limitada','baixa'].includes(alt.confidence));
 if(alt.signals.length)signals++;
 if(prev.vec.join(',')!==alt.vec.join(','))changed++;
 const isGO=['GO','GR'].includes(x.posicao);
 assert((isGO?alt.vec.slice(0,4).concat(alt.vec[6]):alt.vec.slice(7)).every(n=>n===0),'não misturar atributos de linha incompatíveis e grupos GO '+x.numero);
 if(Array.isArray(x.niveis))assert(Array.isArray(original.find(y=>y.numero===x.numero).niveis),'niveis oficiais permanecem');
}
assert(signals>100,'relevância documental');
assert(changed>10,'motor precisa produzir alternativas quando justificado');
const none=suggestIndividualPreview(60,'CA','Matador',{native_skills:null,boost1:'PENDENTE'});
assert.equal(none.signals.length,0,'sem inventar skills');
assert.equal(none.vec.join(','),suggestPreview(60,'CA','Matador').vec.join(','),'sem diferença artificial');
assert(individualWeights('CA','Matador',{native_skills:'Heading; Aerial Superiority',boost1:'Aerial +3'}).delta[5]>0);
assert(individualWeights('GO','Básico',{native_skills:'GK High Punt',boost1:'Saving +3'}).delta.slice(0,7).every(x=>x===0));
const js=read('web/scout-individual-v207.js'),css=read('web/scout-individual-v207.css'),lab=read('web/lab.js');
for(const name of ['scout-v207-identity','scout-v207-peers','scout-v207-preview','scout-v207-levels','scout-v207-peer'])
 assert(js.includes(name)&&css.includes(name),'painel '+name);
assert(js.includes("fetch('../SCOUT_V69_AUDITORIA.json')"),'index original');
assert(!js.includes('localStorage.setItem')&&!js.includes('sessionStorage'),'não sobrescrever dados');
assert(lab.includes('previewEligible=!hasDocumentedBuild'),'builds oficiais seguem intactas');
for(const f of ['scout-individual-v207.js','scout-individual-v207.css'])
 for(const p of ['web/app-bridge.js','web/sw.js','scripts/stamp-bundle-v189.cjs'])
  assert(read(p).includes(f),'bundle offline '+p+' '+f);
assert(read('web/sw.js').includes('v207-individual-review'));
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(f=>f.endsWith('.html')).length,246);
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
console.log('V207 OK: 246 cards, 162 registrados preservados, 84 provisórios; '+signals+' com evidências, '+changed+' hipóteses distintas da heurística genérica.');
