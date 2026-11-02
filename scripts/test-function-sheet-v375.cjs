'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../web');
const cards=JSON.parse(fs.readFileSync(path.join(root,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
const P=require('../web/craque-positional-v311.js'),F=require('../web/craque-friends-training-v228.js');
const S=require('../web/skills-booster-v162.js'),T=require('../web/scout-multitactic-engine-v220.js');
const before=JSON.stringify(cards);
assert.equal(typeof F.functionSheetText,'function','A complete usable sheet must be exportable, not only a generic analysis');
const massaro=P.compute(P.fromPersonal(cards[0]),P.normalize(cards[0].posicao),'posse').outcome.functionReview;
const massaroText=F.functionSheetText(massaro);
assert(massaroText.includes(S.SKILLS.heading.name)&&massaroText.includes('Fisicalidade +3'),
 'The actual clipboard/Markdown must use documented PT-BR names, not depend on a later DOM translator');
assert(!massaroText.includes('Heading')&&!massaroText.includes('Physicality'));
assert(massaroText.includes('Folha seca')&&massaroText.includes('Chute ascendente'),
 'The full existing native-skill vocabulary must also be used, beyond the trainable candidate subset');
let count=0;
for(const c of cards)for(const style of F.MODES){
 const result=P.compute(P.fromPersonal(c),P.normalize(c.posicao),style).outcome;
 assert.equal(result.skills.investmentApplied,true,
  'Skill analysis must receive the new role-specific training, not a null vector');
 const expectedSkills=S.evaluate({...F.profileOf({...P.fromPersonal(c),
  cardId:String(c.id),edition:c.versao,position:P.normalize(c.posicao),nativeSkills:c.habilidades_nativas,
  style:c.estilo_ataque,pp:c.pp}),niveis:result.plan.levels},style,'');
 assert.deepEqual(result.suggestedSkills.map(x=>x.key),expectedSkills.recommendations.map(x=>x.key));
 const r=result.functionReview,txt=F.functionSheetText(r);
 assert.equal(r.identity.name,c.name);assert.equal(r.identity.cardId,String(c.id));
 assert.equal(r.identity.edition,c.versao);assert.equal(r.identity.capture,c.numero);
 assert.equal(r.trainingGroups.reduce((n,x)=>n+x.cost,0),c.pp);
 assert(r.trainingGroups.every(x=>x.cost===T.ppCost(x.proposed)));
 assert(txt.includes(c.name)&&txt.includes(c.versao)&&txt.includes('#'+String(c.numero).padStart(3,'0')));
 assert(txt.includes('HABILIDADES ADICIONAIS')&&txt.includes('ÍMPETO PRINCIPAL'));
 assert(txt.includes(r.tacticLabel)&&txt.includes('sem validação em partidas online'));
 assert.equal(r.skills.length,result.suggestedSkills.length);
 for(const skill of r.skills){
  assert(skill.reason&&skill.situation&&skill.nativeRelation);
  assert(!r.nativeSkills.some(n=>S.keyFor(n)&&S.keyFor(n)===S.keyFor(skill.name)));
  assert(txt.includes(skill.name));
 }
 for(const b of r.boosters){assert(b.reason&&b.attributes.length);assert(txt.includes(b.name)&&txt.includes(b.reason));}
 count++;
}
const ney=cards.find(c=>c.numero===90),sa=P.compute(P.fromPersonal(ney),'SA','posse').outcome.functionReview;
assert.equal(sa.skills.length,5);assert.equal(sa.position,'SA');
assert(F.functionSheetText(sa).includes('Familiaridade'));
const mal=cards.find(c=>c.numero===10),zg=P.compute(P.fromPersonal(mal),'ZG','rapido').outcome.functionReview;
assert.equal(zg.position,'ZG');assert.equal(zg.sourcePosition,'LD');
const deps={tactical:T,skills:S,boosters:require('../web/booster-engine-v103.js')};
for(const c of JSON.parse(fs.readFileSync(path.join(root,'ct364-owned-cards.json'),'utf8')).cards)for(const style of F.MODES){
 const r=F.evaluate({localKey:c.key,name:c.name,position:c.position,originalPosition:c.position,
  style:c.style,nativeSkills:c.observed.nativeSkills.join('; '),pp:null,level:null,cardId:'',edition:'',
  skills:'',fixedBooster:'',booster:'',boosterSlot:'pendente',trainingLevels:''},style,deps).functionReview;
 assert.equal(r.proposed,null);assert.equal(r.trainingGroups.length,0);
 const txt=F.functionSheetText(r);assert(txt.includes('PP pendentes')&&!txt.includes('undefined'));
 count++;
}
assert.equal(count,1305);assert.equal(JSON.stringify(cards),before);
const ui=fs.readFileSync(path.join(root,'craque-positional-ui-v311.js'),'utf8');
assert(!ui.includes('review.skills.slice(0,3)'),'All five available candidates must appear in the usable sheet');
assert(ui.includes('Copiar ficha completa'));
const bundle=require('./export-function-sheets-v375.cjs').generate();
assert.equal(bundle.cards,261);assert.equal(bundle.sheetCount,1305);assert.equal(bundle.adaptationCount,10);
assert.equal(bundle.sheets.filter(r=>!r.proposed).length,0,'V381 documentou os orçamentos das 15 próprias, mantendo propostas consultivas');
assert.equal(new Set(bundle.sheets.map(r=>r.identity.localKey)).size,261);
// Execute the real shared renderer without browser automation or user-session access.
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.textContent='';this.hidden=false;this.attributes={};}
 append(...nodes){this.children.push(...nodes)}
 setAttribute(k,v){this.attributes[k]=v}
 addEventListener(k,fn){this.listeners[k]=fn}
 focus(){this.focused=true}select(){this.selected=true}
}
const vm=require('node:vm');let copied='';
const host={CRAQUE_POSITIONAL_V311:P,CRAQUE_FRIEND_TRAINING_V228:F,SCOUT_TACTICS_V220:T,
 navigator:{clipboard:{writeText:async text=>{copied=text}}},
 document:{readyState:'loading',createElement:tag=>new Element(tag),addEventListener(){}}};
vm.runInNewContext(ui,{window:host});
const panel=host.CRAQUE_POSITIONAL_UI_V311.reviewPanel(sa);
const nodes=[];function walk(n){nodes.push(n);n.children.forEach(walk)}walk(panel);
const list=nodes.find(n=>n.className==='ct311-list ct374-skill-reasons');
assert.equal(list.children.length,5,'All five recommendations must be rendered, with their contextual reasons');
const copy=nodes.find(n=>n.tagName==='button'&&n.textContent==='Copiar ficha completa');
const fallback=nodes.find(n=>n.className==='ct375-copy-fallback');
(async()=>{
 await copy.listeners.click();assert.equal(copied,F.functionSheetText(sa));assert(fallback.hidden);
 host.navigator.clipboard.writeText=async()=>{throw Error('not allowed')};
 await copy.listeners.click();assert(!fallback.hidden&&fallback.readOnly&&fallback.selected);
 assert.equal(fallback.value,copied);assert.equal(JSON.stringify(cards),before);
 console.log('V375 PASS: 1.305 fichas + 10 adaptações, 5 habilidades visíveis, custos PP, ímpetos com motivos e cópia com contingência sem alterar dados.');
})().catch(error=>{console.error(error);process.exitCode=1});
