'use strict';
/* V247: PP e treino da edição #191 + indicação de substituição em TODAS as formações. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const audit=JSON.parse(read('web/SCOUT_V98_AUDITORIA_TATICA.json')).cartas;
const forms=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const legacy=JSON.parse(read('web/SCOUT_V176_POSSE_4312.json'));
const storage=new Map();
const local={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
global.window={localStorage:local};
const P=require('../web/scout-position-training-v246.js');
const I=require('../web/scout-player-identity-v245.js');
const T=require('../web/craque-tactics-v230.js');
const B=require('../web/craque-bench-substitutions-v247.js');
const E=require('../web/scout-multitactic-engine-v220.js');
const U=require('../web/scout-training-unified-v218.js');
const R=require('../web/scout-training-reference-v208.js');
const original=JSON.stringify(cards);
const byCap=new Map(cards.map(c=>[Number(c.numero),c]));
assert.equal(cards.length,246);assert.equal(new Set(cards.map(c=>c.numero)).size,246);
assert(cards.every(c=>String(c.id).trim().length>0),'Cada carta precisa ter Card ID');
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246,'Identidade número+Card ID deve ser única');
assert.equal(audit.length,246);
let known=0;
for(const c of cards){
 const other=audit.find(d=>d.numero===c.numero);
 assert(other,'A edição da V98 está ausente: '+c.numero);
 assert.equal(String(other.card_id),String(c.id));
 assert.equal(other.pp,c.pp,'Orçamentos V69/V98 divergem: '+c.numero);
 assert.deepEqual(other.treino_anterior,c.niveis,'Níveis V69/V98 divergem: '+c.numero);
 if(Number.isInteger(c.max_level)){
  known++;
  assert.equal(c.pp,2*(c.max_level-1),'Nível máximo e PP divergem: '+c.numero);
 }
 if(Array.isArray(c.niveis)&&c.niveis.length===10){
  assert.equal(U.total(c.niveis),c.pp,'Distribuição acima/abaixo do orçamento: '+c.numero);
 }
}
assert.equal(known,85,'84 níveis máximos anteriores + Martinelli nível 26');
const martinelli=byCap.get(191);
assert.equal(martinelli.name,'Gabriel Martinelli');
assert.equal(martinelli.id,'105850811319718');
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
assert.equal(martinelli.treino_status,'proposta_nao_validada');
assert.deepEqual(martinelli.niveis,[4,4,8,10,8,0,0,0,0,0]);
assert.equal(E.confirmSource({...martinelli,recommended_levels:martinelli.niveis}),false,
 '50 PP matemáticos NÃO aprovam a build proposta');
const ficha=read('web/fichas/191_Gabriel_Martinelli.html');
const embedded=id=>{
 const m=ficha.match(new RegExp('<script id="'+id+'" type="application/json">([\\s\\S]*?)<\\/script>'));
 assert(m,'JSON ausente na ficha: '+id);return JSON.parse(m[1]);
};
const v68=embedded('scout-v68-data'),lab=embedded('lab-data');
assert.equal(v68.pp,50);assert.equal(lab.pp,50);
assert.equal(v68.max_level,26);assert.equal(v68.training_status,'proposta_nao_validada');
assert.deepEqual(v68.recommended_levels,martinelli.niveis);
assert.equal(U.total(lab.A),50);assert.equal(U.total(lab.B),50);
assert.equal(U.total(lab.draftA),50);
assert.equal(R.resolveTraining(v68,lab).kind,'prévia experimental');
assert(!ficha.includes('66 PP')&&!ficha.includes('66/66'));
assert.equal(P.status(martinelli,'CA').eligible,false,'Não habilitar CA por PP/OVR');
const scenarios=[
 ...forms.map(f=>({name:f.id,starters:f.starters,bench:f.bench})),
 {name:'V176',starters:legacy.starter_slots,bench:legacy.bench}
];
for(const form of scenarios){
 assert.equal(form.starters.length,11,form.name);
 assert.equal(form.bench.length,12,form.name);
 for(const row of form.starters)assert(byCap.has(Number(row.cap)));
 const all= form.starters.map(row=>byCap.get(Number(row.cap)));
 assert(I.unique(all),form.name+' titulares devem ser pessoas distintas');
 for(const row of form.bench){
  const reserve=byCap.get(Number(row.cap));
  assert(reserve,form.name+' reserva ausente');
  const advice=B.recommend(reserve,form.starters,cards,'posse');
  assert.equal(typeof advice.eligible,'boolean');
  if(advice.eligible){
   assert(form.starters.some(s=>s.slot===advice.slot&&Number(s.cap)===advice.replaces.cap));
   assert.equal(P.status(reserve,advice.position).eligible,true,
    'Reserva não pode receber posição alternativa sem confirmação V246');
  }else assert(advice.reason&&advice.position===null);
 }
 const keeper=byCap.get(169);
 const k=B.recommend(keeper,form.starters,cards,'posse');
 assert.equal(k.eligible,true,form.name+' goleiro deve conseguir substituir o GO');
 assert.equal(k.position,'GO');
 assert(form.starters.some(s=>Number(s.cap)===k.replaces.cap&&s.slot==='go'));
 assert.equal(B.recommend(martinelli,form.starters,cards,'posse').eligible,false,
  'PTE Martinelli NÃO pode entrar automaticamente em CA');
}
P.confirm(martinelli,'CA',true,local);
for(const form of scenarios){
 const suggestion=B.recommend(martinelli,form.starters,cards,'posse');
 assert.equal(suggestion.eligible,true,form.name+' deve aceitar CA após confirmação expressa');
 assert.equal(suggestion.position,'CA');
 assert(form.starters.some(s=>s.slot===suggestion.slot&&Number(s.cap)===suggestion.replaces.cap));
}
P.confirm(martinelli,'CA',false,local);
assert.equal(B.recommend(martinelli,forms[0].starters,cards).eligible,false);
assert.equal(P.status({...martinelli,id:'outra-edicao'},'CA').eligible,false);
for(const file of [
 'web/meu-time-duas-formacoes-v177.html','web/meu-time-posse-4312.html','web/meu-time-testes-v219.html'
]){
 const h=read(file);
 assert(h.includes('craque-bench-substitutions-v247.js'),file);
 assert(h.includes('craque-bench-substitutions-v247.css'),file);
 assert(h.indexOf('scout-position-training-v246.js')<h.indexOf('craque-bench-substitutions-v247.js'),
  'Módulo de posições deve carregar antes de substituições');
}
for(const file of ['web/meu-time-duas-formacoes-v177.js','web/meu-time-posse-4312.js','web/scout-rotation-lab-v219.js']){
 const s=read(file);
 assert(s.includes('benchGuide.recommend('),file+' não descreve quem entra');
 assert(s.includes('Substituir #'),file+' não mostra qual titular sair');
}
for(const file of ['web/sw.js','scripts/stamp-bundle-v189.cjs']){
 const s=read(file);
 for(const asset of ['craque-bench-substitutions-v247.js','craque-bench-substitutions-v247.css'])
  assert(s.includes(asset),'Offline incompleto: '+file+'/'+asset);
}
assert.deepEqual(JSON.stringify(cards),original,'Nenhuma outra carta pode ser alterada pelo motor');
console.log('V247 OK: 246 cartas/85 níveis comprovados; Martinelli #191 26/50 PP com proposta não homologada; 2 formações + experimental, bancos de 12 e troca de titular por posição confirmada.');
