'use strict';
// V339: integração de leitura V324 -> V251 -> V311 em ambos os acervos.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const V339=require('../web/craque-frontier-context-v339.js');
const profiles=require('../web/craque-manager-fichas-v324.js');
const tactical=require('../web/scout-multitactic-engine-v220.js');
const frontier=require('../web/craque-ficha-individual-v251.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cardsRaw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(cardsRaw).cards;
assert.equal(cards.length,246);
const base=cards[0],original=[10,5,5,8,8,6,0,0,0,0];
const draft=[9,6,5,8,8,6,0,0,0,0];
assert.equal(tactical.total(original),62);
assert.equal(tactical.total(draft),61);
const storeData=new Map(),writes=[];
const store={
 getItem:key=>storeData.has(key)?storeData.get(key):null,
 setItem:(key,value)=>{writes.push(key);storeData.set(key,value)}
};
const model={
 collection:'minhas-246',owner:'principal',cardKey:String(base.numero)+'@'+base.id,
 cardId:String(base.id),edition:String(base.versao),name:base.name,
 position:'CA',style:base.estilo_ataque||'',pp:62,
 nativeSkills:base.habilidades_nativas||'',fixedBooster:base.impeto_fixo||''
};
const scenario=(opts={})=>({
 position:opts.position||'CA',style:opts.style||'posse',
 manager:opts.manager||'CT-MGR-001',
 compatibility:{eligible:opts.eligible!==false},
 contentSignature:opts.signature||'exact-signature-v339',
 outcome:{plan:{status:opts.status||'hipotese',
  pp:opts.budget??62,levels:(opts.levels||original).slice()}}
});
const one=scenario();
const ctx=profiles.fromScenario(one,model);
profiles.save(store,ctx,{train:draft,skills:['Passe de primeira'],booster:'Técnica',source:'Manual de teste'});
const previousWrites=writes.length,previousState=JSON.stringify([...storeData]);
const result=V339.compare(store,model,one);
assert.equal(result.status,'CONSULTIVO');
assert.equal(result.saved,true);
assert.equal(result.source,'rascunho_independente');
assert.equal(result.revision,1);
assert.equal(result.role,'CA');
assert.equal(result.budget,62);
assert.equal(result.referenceSpent,61);
assert.equal(result.referenceRemainingPP,1);
assert.equal(result.comparison.baselineStatus,'rascunho_com_saldo');
assert.deepEqual([...result.comparison.reference],draft);
assert.equal(result.comparison.candidates.find(x=>x.id===result.initial).registered,true,
 'A seleção inicial deve mostrar a build SALVA, não uma sugestão substituta.');
assert(result.comparison.candidates.some(x=>x.spent===62),
 'Mostrar alternativas de PP exatos para comparar o uso do saldo.');
assert.equal(result.mayApply,false);
assert.equal(result.gameplayValidated,false);
assert(Object.isFrozen(result)&&Object.isFrozen(result.identity));
assert.equal(JSON.stringify([...storeData]),previousState,'Leitura NUNCA altera histórico');
assert.equal(writes.length,previousWrites,'Comparador não pode gravar nem coalescer versões');
const alternatives=[
 scenario({position:'SA',signature:'exact-signature-v339'}),
 scenario({style:'rapido'}),
 scenario({manager:'CT-MGR-002'}),
 scenario({signature:'nova-identidade-de-edicao'})
];
for(const x of alternatives){
 const res=V339.compare(store,model,x);
 assert.equal(res.status,'CONSULTIVO');
 assert.equal(res.saved,false,'MAT/SA, técnica, estilo e assinatura precisam ser isolados');
 assert(!res.comparison.candidates.some(c=>c.registered));
 assert.equal(res.source,'proposta_contextual');
}
assert.equal(V339.compare(store,model,one).saved,true,'Retorno à posição original recupera a mesma revisão');
const others={...model,collection:'outros-elencos',owner:'bruno-santos',cardKey:'externa-49'};
const external=V339.compare(store,others,one);
assert.equal(external.status,'CONSULTIVO');
assert.equal(external.saved,false,'Outros Elencos nunca pode ler rascunho de Minhas Cartas');
const externalCtx=profiles.fromScenario(one,others);
profiles.save(store,externalCtx,{train:draft,skills:[],booster:'',source:'Manual externo'});
const externalSaved=V339.compare(store,others,one);
assert.equal(externalSaved.status,'CONSULTIVO');
assert.equal(externalSaved.saved,true);
assert.equal(V339.compare(store,model,one).saved,true,'Duas fichas salvas permanecem independentes');
for(const bad of [
 [{...model,cardId:'PENDENTE'},one,/Card ID/],
 [{...model,edition:'PENDENTE — não inventar'},one,/edição/],
 [model,scenario({eligible:false}),/Familiaridade/],
 [model,scenario({manager:'sem-tecnico'}),/contexto|Ficha exige|técnico/],
 [model,scenario({budget:60}),/Divergência/],
 [model,scenario({status:'pendente'}),/pendentes/],
 [model,scenario({levels:[20,5,5,8,8,6,0,0,0,0]}),/divergente/]
 ]){
  const got=V339.compare(store,bad[0],bad[1]);
  assert.equal(got.status,'PENDENTE');
  assert.match(got.reason,bad[2]);
 }
const broken=profiles.key(ctx);
storeData.set(broken,'{INVALID_JSON');
const beforeBad=storeData.get(broken);
const corrupted=V339.compare(store,model,one);
assert.equal(corrupted.status,'PENDENTE');
assert.match(corrupted.reason,/ilegível|preservado/);
assert.equal(storeData.get(broken),beforeBad,'Nunca reescrever histórico corrompido');
const unavailable=V339.compare(store,model,one,{frontier:{}});
assert.equal(unavailable.status,'PENDENTE');
assert.equal(storeData.get(broken),beforeBad);
const externalHTML=read('web/outros-elencos-v227.html');
assert(externalHTML.indexOf('craque-ficha-individual-v251.js')<
 externalHTML.indexOf('craque-frontier-context-v339.js'));
assert(externalHTML.indexOf('craque-frontier-context-v339.js')<
 externalHTML.indexOf('craque-positional-ui-v311.js'));
const bridge=read('web/app-bridge.js'),ui=read('web/craque-positional-ui-v311.js');
assert(bridge.includes("load('craque-frontier-context-v339.js'"));
assert(ui.includes('host.CRAQUE_FRONTIER_CONTEXT_V339?.compare(storage(),model,scenario)'));
assert(ui.includes('Comparar investimentos de PP desta ficha'));
assert(ui.includes("ppFrontier.addEventListener('toggle'"));
assert(ui.includes("if(!ppFrontier.open||ppFrontier.dataset.ready==='true')return;"));
const stamp=read('scripts/stamp-bundle-v189.cjs'),sw=read('web/sw.js');
assert(stamp.includes("'craque-frontier-context-v339.js'"));
assert(sw.includes("'./craque-frontier-context-v339.js'"));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),cardsRaw);
console.log('V339 PASS: PP 61/62, 2 acervos, cinco dimensões de isolamento, corrupção sem gravação, offline e 246 cartas originais.');
