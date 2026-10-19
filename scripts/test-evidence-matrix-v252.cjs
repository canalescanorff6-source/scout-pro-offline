'use strict';
/* V252: todos os 246 dossiês e bloqueio de PP divergentes por edição.
   PP/Overall/prints candidatos não são provas de meta ou gameplay. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const audit=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const index=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const unchanged=JSON.stringify(audit);
assert.equal(audit.length,246);
assert.equal(index.length,246);
const map=new Map(index.map(c=>[c.numero,c]));
assert.equal(map.size,246);
const tally={idCataloged:0,levelDocumented:0,nativeCataloged:0,
 baseNumerical:0,bodyDocumented:0,playerIdConfirmed:0,
 editionVisualConfirmed:0,gameplayConfirmed:0,unverified:0};
for(const c of audit){
 const row=map.get(c.numero);
 assert(row&&String(row.card_id)===String(c.id),'Edição exata no índice #'+c.numero);
 const checklist=V.proofChecklist(c,row,{},null);
 assert.equal(checklist.matched,true,'Índice deve pertencer à edição #'+c.numero);
 assert.equal(checklist.checks.length,10);
 assert.equal(checklist.documented+checklist.pending,10);
 const byId=Object.fromEntries(checklist.checks.map(x=>[x.id,x]));
 if(byId.edition.documented)tally.idCataloged++;
 if(byId.budget.documented)tally.levelDocumented++;
 if(byId.native.documented)tally.nativeCataloged++;
 if(byId.base.documented)tally.baseNumerical++;
 if(byId.body.documented)tally.bodyDocumented++;
 if(byId.playerid.documented)tally.playerIdConfirmed++;
 if(byId.video.documented)tally.editionVisualConfirmed++;
 if(byId.gameplay.documented)tally.gameplayConfirmed++;
 if(!checklist.competitivelyVerified)tally.unverified++;
 assert.equal(byId.additional.documented,false,'Sem registro de habilidades equipadas não afirmar slot ocupado');
 assert.equal(byId.booster.documented,false,'Sem confirmação de slot não assumir ímpeto equipável');
 assert.equal(byId.base.documented,false,
   'Flag de base sem números exatos NÃO deve comprovar atributos finais');
 assert.equal(byId.video.documented,false,
   'Print vinculado só por nome não prova versão da carta');
 assert.equal(byId.gameplay.documented,false,
   'Não declarar partidas ou aval competitivo sem fonte');
}
assert.equal(tally.levelDocumented,85);
assert.equal(tally.nativeCataloged,243);
assert.equal(tally.baseNumerical,0);
assert.equal(tally.gameplayConfirmed,0);
assert.equal(tally.unverified,246);
assert.equal(tally.bodyDocumented,15);
const martinelli=audit.find(x=>x.numero===191);
const martinelliDoc=read('web/'+martinelli.arquivo);
const getRaw=(html)=>JSON.parse(html.match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const raw=getRaw(martinelliDoc);
const stored=new Map();
const storage={getItem:k=>stored.has(k)?stored.get(k):null,
 setItem:(k,v)=>stored.set(k,String(v)),removeItem:k=>stored.delete(k)};
const key=c=>'scoutpro:v248:level-review:'+c.numero+'@'+c.id;
const record=(c,level)=>({schema:'CRAQUE_PROGRESS_REVIEW_V248',numero:c.numero,
 card_id:String(c.id),name:c.name,level,pp:2*(level-1),
 confirmed_in_game:true,source:'conferência manual no eFootball',
 confirmed_at:'2026-10-19T06:00:00.000Z'});
const skillsKey='scoutpro:v162:equipped:'+martinelli.numero+':'+martinelli.id;
const boostKey='scoutpro:v103:booster:'+martinelli.numero;
stored.set(skillsKey,'Passe de primeira; Toque duplo');
stored.set(boostKey,JSON.stringify({card_id:martinelli.id,status:'vazio'}));
let selected=V.proofChecklist(martinelli,map.get(191),{},storage);
let selectedChecks=Object.fromEntries(selected.checks.map(x=>[x.id,x.documented]));
assert.equal(selectedChecks.additional,true,'Habilidades informadas nesta edição precisam aparecer');
assert.equal(selectedChecks.booster,true,'Slot confirmado desta edição precisa aparecer');
stored.set(boostKey,JSON.stringify({card_id:'outra-edicao',status:'vazio'}));
selected=V.proofChecklist(martinelli,map.get(191),{},storage);
assert.equal(selected.checks.find(x=>x.id==='booster').documented,false,
 'Slot de outra edição não deve migrar para Martinelli');
stored.delete(skillsKey);stored.delete(boostKey);
const confirmed=V.buildReview(martinelli,raw,{},audit,'posse',{store:storage});
assert.equal(confirmed.status,'complete');
assert.equal(confirmed.pp,50);
assert.equal(confirmed.trainingProof,'sem_teste_independente_de_partida');
// Divergência real no nível confirmado: não propor ficha com PP antigos.
stored.set(key(martinelli),JSON.stringify(record(martinelli,27)));
const mismatch=V.buildReview(martinelli,raw,{},audit,'posse',{store:storage});
assert.equal(mismatch.status,'unsupported');
assert.equal(mismatch.canDraft,false);
assert.equal(mismatch.proposal,null);
assert(mismatch.reason.includes('PP DIVERGENTES'));
assert(mismatch.reason.includes('52 PP')&&mismatch.reason.includes('50 PP'));
// Não misturar a carta com outra edição, nem aceitar local manipulado.
stored.set(key(martinelli),JSON.stringify({...record(martinelli,27),card_id:'versao-inexistente'}));
assert.equal(V.localLevelReview(martinelli,storage),null);
assert.equal(V.buildReview(martinelli,raw,{},audit,'posse',{store:storage}).status,'complete');
stored.clear();
// Nível ainda ausente no catálogo, mas confirmado LOCALMENTE com PP exatos.
const missing=audit.find(x=>!Number.isInteger(x.max_level)&&x.pp>0&&x.pp<=238);
assert(missing);
const html=read('web/'+missing.arquivo),entry=getRaw(html);
const before=V.buildReview(missing,entry,{},audit,'posse',{store:storage});
assert.equal(before.status,'no_level');
assert.equal(before.canDraft,false);
const level=missing.pp/2+1;
assert(Number.isInteger(level));
stored.set(key(missing),JSON.stringify(record(missing,level)));
const after=V.buildReview(missing,entry,{},audit,'posse',{store:storage});
assert.equal(after.evidenceLevel,'conferencia_local_usuario');
assert.equal(after.level,level);
assert.equal(after.canDraft,true,'Conferência local exata pode habilitar simulação, não homologação');
assert.equal(T.total(after.proposal.levels),missing.pp);
assert.equal(after.trainingProof,'sem_teste_independente_de_partida');
assert(after.differences.some(x=>x.includes('conferidos localmente')));
assert.equal(JSON.stringify(audit),unchanged,'Nada no catálogo foi modificado');
const sheet=read('web/craque-ficha-individual-v251.js');
assert(sheet.includes("host.fetch('../SCOUT_V221_EVIDENCE_INDEX.json')"));
assert(sheet.includes('proofChecklist(card,evidenceByCap.get(Number(card.numero))'));
assert(sheet.includes('Simulação de PP por'));
const v220=read('web/scout-card-unified-v220.js');
assert(v220.includes('const levelDocumented=Number.isInteger(card.max_level)'));
assert(v220.includes("card.training_provisional!==true"));
assert(v220.includes("pp_e_nivel_documentados_hipotese"));
assert(v220.includes("switchTraining(style);"));
console.log('V252 EVIDÊNCIAS OK: '+JSON.stringify(tally));
console.log('V252 PP OK: 161 cartas sem nível de origem; divergência bloqueia build; conferência local só habilita simulação.');
