'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const Main=require('../web/craque-main-sheet-v378.js'),P=require('../web/craque-positional-v311.js');
const F=require('../web/craque-friends-training-v228.js'),T=require('../web/scout-multitactic-engine-v220.js');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const cards=require('../web/SCOUT_V69_AUDITORIA.json').cards,refs=require('../web/ct376-card-references.json').cards;
const deps={training:F,tactical:T,skills:S,boosters:B},snapshot=JSON.stringify(cards);
const expected=new Map([[1,[10,6,6,8,8,4,0,0,0,0]],[2,[8,8,8,10,6,2,0,0,0,0]],
 [4,[0,8,8,8,8,4,8,0,0,0]],[5,[4,8,8,8,8,0,7,0,0,0]],[6,[0,6,6,6,8,6,12,0,0,0]],
 [8,[0,4,0,4,8,8,12,0,0,0]],[9,[0,6,2,4,8,8,10,0,0,0]],[10,[0,5,4,8,8,8,10,0,0,0]],
 [11,[0,0,0,0,0,0,0,8,10,12]],[14,[8,8,8,8,8,2,0,0,0,0]],
 [24,[8,6,8,10,6,4,0,0,0,0]],[47,[8,8,10,8,8,4,0,0,0,0]],[208,[8,8,8,10,6,0,0,0,0,0]]]);
const setup=cap=>{const c=cards.find(c=>c.numero===cap),m=P.fromPersonal(c);return {c,m,card:Main.cardFromModel(m,m.position),out:P.compute(m,m.position,'posse').outcome,ref:refs.find(r=>r.capture===cap)};};
for(const [cap,levels] of expected){
 const {c,card,out,ref,m}=setup(cap),before=JSON.stringify({card,out,ref});
 const sheet=Main.resolve(card,out,{reference:ref},deps),r=sheet.review;
 assert.deepEqual(r.proposed,levels,'Proposta individual CAP '+cap);
 assert.equal(r.competitiveReview.batch,'2026-10-31-01');assert.equal(r.competitiveReview.status,'ESTIMADO');
 assert.equal(r.spent,c.pp);assert.equal(r.competitiveReview.gameplayValidated,false);
 assert(r.competitiveReview.sources.some(s=>s.url===ref.reference.url));
 assert(Main.text(r).includes('REVISÃO CENTRAL · LOTE 01'));
 assert(Main.text(r).includes(ref.reference.url));
 const native=new Set(r.nativeSkills.map(S.keyFor).filter(Boolean));
 assert(!r.skills.some(s=>native.has(S.keyFor(s.name))));assert(r.skills.length<=5);
 assert(r.skills.every(s=>s.applyAuthorized===false));
 assert(!r.boosters.some(b=>B.boosterName(b.technicalName)===B.boosterName(card.fixedBooster)));
 assert(r.boosters.every(b=>b.applyAuthorized===false&&B.CRAFTABLE.includes(b.technicalName)));
 assert.equal(r.boosterSlotSupported,ref.reference.extraSlotInPublicEdition,'Suporte público não é confirmação de vaga na conta');
 if(!ref.reference.extraSlotInPublicEdition)assert.equal(r.boosters.length,0,'Não propor novo ímpeto sem suporte documentado');
 assert.equal(JSON.stringify({card,out,ref}),before,'Consulta pura');
 const saved=Main.resolve(card,out,{reference:ref,source:'profile',levels:Array(10).fill(0),skills:[],booster:''},deps).review;
 assert.deepEqual(saved.proposed,Array(10).fill(0));assert.deepEqual(saved.skills,[]);assert.deepEqual(saved.boosters,[]);
 assert(!saved.competitiveReview,'Não rotular escolha salva como proposta editorial');
 const invalid=[{...ref,identityUsable:false},{...ref,edition:'Outra edição'},
  {...ref,reference:{...ref.reference,htmlSha256:'alterada'}}];
 for(const reference of invalid)assert(!Main.resolve(card,out,{reference},deps).review.competitiveReview);
 assert(!Main.resolve({...card,pp:card.pp+2},out,{reference:ref},deps).review.competitiveReview);
 assert(!Main.resolve({...card,nativeSkills:'One-touch Pass'},out,{reference:ref},deps).review.competitiveReview);
 const equipped=Main.resolve({...card,skills:'Passe de primeira; Controle com a sola'},out,{reference:ref},deps).review;
 assert(!equipped.skills.some(s=>['onepass','sole'].includes(S.keyFor(s.name))));
 assert.equal(Main.resolve({...card,boosterSlot:'ausente'},out,{reference:ref},deps).review.boosters.length,0);
 for(const style of F.MODES.filter(x=>x!=='posse')){
  const o=P.compute(m,m.position,style).outcome,r=Main.resolve(card,o,{reference:ref},deps).review;
  assert.deepEqual(r.proposed,o.plan.levels);assert(!r.competitiveReview);
 }
}
const ney=setup(47),n=Main.resolve(ney.card,ney.out,{reference:ney.ref},deps).review;
assert(!n.skills.some(s=>S.keyFor(s.name)==='heading'),'Sem candidata de cruzamento como enchimento');
assert(n.skills.some(s=>S.keyFor(s.name)==='firstshot'));
const full=setup(1),equipped='Passe de primeira; Passe em profundidade; Controle com a sola; Toque de calcanhar; Toque duplo';
const receipt={schema:'CRAQUE_ADDITIONAL_V254',confirmed:true,capture:1,card_id:full.card.cardId,edition:full.card.edition,
 fingerprint:S.fingerprint(equipped),nativeFingerprint:S.fingerprint(full.card.nativeSkills.split(';').map(s=>s.trim()).join(';'))};
const occupied=Main.resolve({...full.card,skills:equipped,equipmentRecord:receipt},full.out,{reference:full.ref},deps).review;
assert.equal(occupied.freeSkillSlots,0);assert.equal(occupied.skills.length,0,'Respeitar as cinco vagas confirmadas como ocupadas');
const changedRole=P.compute(ney.m,'SA','posse').outcome;
assert(!Main.resolve({...ney.card,position:'SA'},changedRole,{reference:ney.ref},deps).review.competitiveReview,'Não presumir adaptação para outra posição');
const other=setup(3);assert(!Main.resolve(other.card,other.out,{reference:other.ref},deps).review.competitiveReview);
assert.equal(JSON.stringify(cards),snapshot);
for(const file of ['web/sw.js','scripts/stamp-bundle-v189.cjs','web/app-bridge.js'])
 assert(fs.readFileSync(path.join(__dirname,'..',file),'utf8').includes('craque-competitive-batch-v380.js'),file+' deve incluir a revisão offline');
console.log('V380 PASS: 13 edições, PP, inventários, histórico salvo, fontes e isolamento dos cinco estilos.');
