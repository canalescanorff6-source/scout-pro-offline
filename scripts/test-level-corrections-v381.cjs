'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const cards=require('../web/SCOUT_V69_AUDITORIA.json').cards;
assert.equal(cards.find(c=>c.numero===196).max_level,34,'Savinho corrigido pelo relato explícito do proprietário');
assert.equal(cards.find(c=>c.numero===196).pp,66);
assert.equal(cards.find(c=>c.numero===41).pp,62,'Havertz deve usar os 62 PP da captura explicitamente confirmada');
assert.equal(cards.find(c=>c.numero===41).max_level,32);
const index=fs.readFileSync('web/index.html','utf8');
assert.match(fs.readFileSync('web/sw.js','utf8').split('\n')[0],/v381-level-pp/,'Novo cache impede reutilizar HTML das fichas com PP antigos');
assert(index.match(/<a\b[^>]*data-cap="41"[^>]*>[\s\S]*?<\/a>/)[0].includes('62 PP'),'Catálogo deve mostrar o orçamento corrigido');
assert.equal(cards.find(c=>c.numero===16).pp,56,'Upamecano deve usar 29 níveis/56 PP da edição exata');
for(const cap of [126,204]){const c=cards.find(c=>c.numero===cap);assert.equal(c.max_level,1);assert.equal(c.pp,0);}
const audit=require('../web/ct381-level-audit.json'),archive=require('../web/ct381-level-corrections.json');
assert.equal(audit.cards.length,261);assert.equal(new Set(audit.cards.map(c=>c.key)).size,261);
for(const row of audit.cards.filter(r=>r.artwork))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('web/'+row.artwork.image)).digest('hex'),row.artwork.sha256,'Nível só vale para a mesma arte confirmada');
const ownCards=require('../web/ct364-owned-cards.json').cards;
for(const c of ownCards){const row=audit.cards.find(r=>r.key===c.key);assert.equal(c.maxLevel,row.decision.maxLevel);assert.equal(c.pp,2*(c.maxLevel-1));assert.equal(c.cardId,null,'Revisão de nível não inventa Card ID no cadastro');}
const T=require('../web/scout-multitactic-engine-v220.js'),P=require('../web/craque-positional-v311.js');
const Main=require('../web/craque-main-sheet-v378.js'),F=require('../web/craque-friends-training-v228.js');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const refs=require('../web/ct376-card-references.json').cards;
const Review=require('../web/craque-card-review-v379.js');
const PriorLevels=require('../web/craque-progresso-v248.js');
const canonicalBefore=JSON.stringify(cards);
for(const c of cards.filter(c=>c.numero>=226)){
 const entry=refs.find(r=>r.capture===c.numero),legacyKey=c.numero+'@'+c.id;
 const priorReceipt={schema:PriorLevels.SCHEMA,numero:c.numero,card_id:String(c.id),name:c.name,edition:c.versao,level:c.max_level,pp:c.pp,confirmed_in_game:true};
 const values=new Map([[PriorLevels.key(c),JSON.stringify(priorReceipt)]]),store={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};
 const priorState=JSON.stringify([...values]);
 const model=P.fromPersonal(c,null,store);
 assert.equal(model.cardKey,legacyKey,'Overlay público preserva a chave dos históricos e treinos: '+c.numero);
 assert.equal(model.cardId,entry.candidateId);assert.equal(model.edition,entry.reference.edition);
 assert.equal(model.pp,c.pp);assert.equal(model.level??model.publicMaxLevel,c.max_level);
 assert.equal(model.trainingLevels,Array.isArray(c.niveis)?c.niveis.join(','):'','Treino original preservado ao vincular a fonte: '+c.numero);
 assert.equal(JSON.stringify([...values]),priorState,'Consulta da fonte pública não grava nem reescreve recibos');
 assert.deepEqual(PriorLevels.readSaved(c,store),priorReceipt,'Recibo original de nível permanece legível pela identidade histórica: '+c.numero);
 assert.equal(PriorLevels.readSaved({...c,id:model.cardId,versao:model.edition},store),null,'Recibo antigo não é transferido automaticamente para uma nova identidade pública');
 const descriptor=Review.catalog([c],[])[0],manualId='999990'+c.numero,manualEdition='Edição informada pelo proprietário '+c.numero;
 Review.save(store,descriptor,{cardId:manualId,edition:manualEdition,maxLevel:c.max_level,pp:c.pp,training:c.niveis||null},true);
 const savedBefore=JSON.stringify([...values]),manual=P.fromPersonal(c,null,store);
 assert.equal(manual.cardId,manualId,'Revisão manual prevalece sobre candidato público: '+c.numero);
 assert.equal(manual.edition,manualEdition);assert.equal(manual.pp,c.pp);
 assert.equal(manual.trainingLevels,Array.isArray(c.niveis)?c.niveis.join(','):'');
 assert.equal(JSON.stringify([...values]),savedBefore,'Leitura não altera revisão ou histórico local');
}
const unknownMessi=cards.find(c=>c.numero===50),unknownModel=P.fromPersonal(unknownMessi);
assert.equal(unknownModel.cardId,unknownMessi.id);assert.equal(unknownModel.edition,unknownMessi.versao);
assert.equal(unknownModel.pp,56);assert.equal(unknownModel.level,29);
assert.equal(unknownModel.evidenceCard.publicIdentityV393,undefined,'Relato 29/56 não resolve identidade do Messi');
assert.equal(JSON.stringify(cards),canonicalBefore,'Vínculo público e revisão manual não alteram nenhuma carta canônica');
for(const c of cards){
 const r=audit.cards.find(r=>r.capture===c.numero);assert(r);
 if(r.decision.status==='reviewed')assert.equal(c.pp,2*(r.decision.maxLevel-1));
 const patch=archive.originals.find(r=>r.capture===c.numero);
 if(patch&&patch.before.pp!==patch.after.pp){
  assert.equal(c.niveis,null,'Treino de orçamento anterior arquivado, sem fingir que nova proposta já foi aplicada');
  const html=fs.readFileSync('web/'+c.arquivo,'utf8'),read=id=>JSON.parse(html.match(new RegExp('<script\\b(?=[^>]*\\bid=["\\\']'+id+'["\\\'])[^>]*>([\\s\\S]*?)<\\/script>'))[1]);
  const raw=read('scout-v68-data'),lab=read('lab-data');
  assert.equal(raw.pp,c.pp);assert.equal(raw.max_level,c.max_level);assert.equal(raw.recommended_levels,null);
  assert.equal(lab.pp,c.pp);assert.equal(T.total(lab.draftA),c.pp);assert.equal(lab.A,null);
 }
 const m=P.fromPersonal(c);
 for(const tactic of F.MODES){const out=P.compute(m,m.position,tactic).outcome;
  const sheet=Main.resolve(Main.cardFromModel(m,m.position),out,{reference:refs.find(r=>r.capture===c.numero)},
   {training:F,tactical:T,skills:S,boosters:B}).review;
  assert.equal(sheet.pp,c.pp);assert.equal(sheet.spent,c.pp);assert(sheet.proposed.every((n,i)=>n===0||(m.position==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6]).includes(i)));
  if(patch&&patch.before.pp!==patch.after.pp){assert.equal(sheet.levelRevision.afterPP,c.pp);assert(Main.text(sheet).includes('PP REVISADOS'));}
  if(r.decision.fixed){assert.equal(sheet.skills.length,0);assert.equal(sheet.boosters.length,0);assert.equal(sheet.fixedProgression,true);}
 }
}
const V=require('../web/craque-level-review-v381.js'),h=cards.find(c=>c.numero===41);
assert(V.verified(h,audit));assert(!V.verified({...h,id:'999999999'},audit));
const Progress=require('../web/craque-progresso-v248.js');
assert.equal(Progress.state(h,null,audit),'revisado_publicamente');
assert.equal(Progress.state(cards.find(c=>c.numero===50),null,audit),'revisado_por_relato');
assert.equal(audit.cards.find(r=>r.capture===50).decision.identityPending,true);
assert.equal(audit.cards.find(r=>r.capture===50).decision.cardId,null);
assert.equal(audit.summary.reviewed,261);assert.equal(audit.summary.pending,0);assert.equal(audit.summary.ownerReports,3);
for(const [cap,level,pp] of [[183,32,62],[196,34,66],[50,29,56]]){
 const c=cards.find(c=>c.numero===cap),row=V.verified(c,audit);assert(row);
 assert.equal(c.max_level,level);assert.equal(c.pp,pp);assert.equal(row.decision.sourceKind,'owner_efhub_report');
 assert.equal(row.decision.url,null);assert.equal(row.accountConfirmed,false);
 assert.equal(c.nivel_referencia.confirmed_in_game,false);
 assert.equal(c.id,JSON.parse(HistoricalBaseline()).cards.find(x=>x.numero===cap).id,'Relato de nível não altera identidade');
}
function HistoricalBaseline(){return require('./historical-level-fixtures-v381.cjs').historicalRead('web/SCOUT_V69_AUDITORIA.json','utf8');}
const roster=JSON.parse(fs.readFileSync('web/SCOUT_V69_AUDITORIA.json','utf8'));
const restored={...roster,summary:archive.beforeSummary,cards:cards.map(c=>{const p=archive.originals.find(p=>p.capture===c.numero);if(!p)return c;const old=structuredClone(c);for(const k of p.fields){if(Object.hasOwn(p.before,k))old[k]=structuredClone(p.before[k]);else delete old[k];}return old;})};
const digest=crypto.createHash('sha256').update(JSON.stringify(restored,null,2)+'\n').digest('hex');
assert.equal(digest,archive.beforeCatalogueSha256,'Restauração integral reproduz o catálogo anterior');
const H=require('./historical-level-fixtures-v381.cjs');
assert.equal(crypto.createHash('sha256').update(H.historicalRead('web/index.html','utf8').replace(/\r\n/g,'\n')).digest('hex'),archive.index.beforeSha256);
assert.equal(crypto.createHash('sha256').update(H.historicalRead('web/ct364-owned-cards.json','utf8')).digest('hex'),archive.beforeOwnedSha256);
const exported=require('./export-level-sheets-v381.cjs').generate();
assert.deepEqual(F.MODES,['posse','normal','rapido','fora','longo','overload']);
assert.equal(exported.sheets.length,1566);assert.equal(exported.sheets.filter(s=>s.levelReviewStatus==='reviewed').length,1566);
assert.equal(exported.sheets.filter(s=>s.key==='cap:196').every(s=>s.pp===66),true);
assert.equal(exported.sheets.filter(s=>s.key==='cap:50').every(s=>s.identityPending===true&&s.text.includes('edição/ID exatos ainda pendentes')),true);
for(const s of exported.sheets)assert.equal(T.total(s.review.proposed),s.pp,'Exportação deve usar o mesmo orçamento efetivo da ficha');
console.log('V381 integration PASS: 261 cartas auditadas, Havertz32/62, edições fixas0PP, 1476 cenários originais, 21 vínculos públicos sem alterar treinos, revisão manual prioritária, Messi pendente, orçamento/arquivo reversível.');
