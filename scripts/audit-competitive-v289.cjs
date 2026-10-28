'use strict';
/* Auditoria computacional das 246 edições. Não valida gameplay, não grava
   equipamentos e não chama processamento automático de validação individual. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const V=require('../web/craque-ficha-individual-v251.js'),I=require('../web/craque-role-intelligence-v233.js');
const indexRaw=read('web/SCOUT_V221_EVIDENCE_INDEX.json'),index=JSON.parse(indexRaw).cards;
const images=fs.readdirSync(path.join(root,'web/cartas'),{withFileTypes:true})
 .filter(entry=>entry.isFile()).map(entry=>entry.name).sort(); // Subpastas novas NÃO entram na trava das 246 artes originais.
const imageHash=crypto.createHash('sha256');
for(const file of images){imageHash.update(file+'\0');imageHash.update(fs.readFileSync(path.join(root,'web/cartas',file)))}
const corpusHash=imageHash.digest('hex');
// Baseline oficial bd9c622/V288. Mudanças futuras de dados exigem conciliação
// explícita desta trava, com a aprovação do mantenedor; não atualizar ao acaso.
// V376: approved missing max-level references are reconciled field by field.
// Removing ONLY these verified additions must reproduce the complete old hash.
const preserved=JSON.parse(raw),references=require('../web/ct376-card-references.json').cards;
const corrections=require('../web/ct377-identity-corrections.json').cards;
assert.deepEqual(corrections.map(c=>[c.capture,c.afterCanonical.id]),[[153,'105780749692770'],[196,'105754711432614']]);
for(const correction of corrections){
 const i=preserved.cards.findIndex(c=>c.numero===correction.capture);
 assert.deepEqual(preserved.cards[i],correction.afterCanonical,'Conciliação exata da correção autorizada #'+correction.capture);
 preserved.cards[i]=structuredClone(correction.beforeCanonical);
}
let referencedLevels=0;
for(const c of preserved.cards)if(/^catalogo_publico_/.test(c.pp_origem||'')){
 const ref=references.find(r=>r.capture===c.numero);
 assert(ref?.identityUsable&&ref.reference.levelValid);
 assert.equal(c.max_level,ref.reference.maxLevel);assert.equal(c.pp,ref.reference.maxPP);
 assert.deepEqual(c.nivel_referencia,{kind:'catalogo_publico',url:ref.reference.url,card_id:String(c.id),confirmed_in_game:false});
 delete c.max_level;delete c.pp_origem;delete c.nivel_referencia;referencedLevels++;
}
assert.equal(referencedLevels,156);
assert.equal(preserved.summary.level_public_reference,158);assert.equal(preserved.summary.level_total,243);
delete preserved.summary.level_public_reference;delete preserved.summary.level_total;
assert.equal(hash(JSON.stringify(preserved,null,2)+'\n'),'143a8eb4a53857c8a7a1501b50c1d523aa6bd1475b0fe2b5eb17da7ef9f89d51');
assert.equal(corpusHash,'fd764548717caf9e929a3486a32adb6bcb3714a1c6addbc62a38343f94f6dbcd');
assert.equal(hash(indexRaw),'1b430bf07be8dd332e145018bdf287ca0a4ab4023b3321c3ecc74d14e8210322');
assert.equal(cards.length,246);assert.equal(images.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const summary={automaticallyAudited:246,gameplayIndividuallyValidated:0,canonicalDataChanged:referencedLevels,
 identityPending:0,levelPending:0,nativesPending:0,htmlNativeDifferences:0,
 contextualFrontiers:0,identityBlockedFrontiers:0,levelBlockedFrontiers:0,
 feasibleCandidates:0,scenarios:0,unknownAccountSlots:0};
const rows=[];
for(const c of cards){
 const html=read('web/'+c.arquivo);
 const embedded=id=>JSON.parse(html.match(new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'))[1]);
 const rawCard=embedded('scout-v68-data'),lab=embedded('lab-data');
 assert(V.exact(c,rawCard),'Identidade HTML divergente #'+c.numero);
 assert.equal(Number(rawCard.pp),c.pp,'PP divergente #'+c.numero);
 const profile=V.sourceFor(c,rawCard,lab,index.find(x=>x.numero===c.numero));
 assert(profile);
 const proof=S.verifiedRecommendationContextV288(profile,{});
 const levelKnown=V.confirmedLevel(c),nativeKnown=Boolean(String(c.habilidades_nativas||'').trim());
 const nativeDiff=V.norm(rawCard.native_skills)!==V.norm(c.habilidades_nativas);
 summary.identityPending+=!proof.identity.valid;summary.levelPending+=!levelKnown;
 summary.nativesPending+=!nativeKnown;summary.htmlNativeDifferences+=nativeDiff;
 const audit={capture:c.numero,name:c.name,cardId:String(c.id),edition:c.versao,
  source:c.arquivo,identityStatus:proof.identity.valid?'CADASTRADA_SEM_CONFIRMACAO_DE_GAMEPLAY':'PENDENTE',
  maxLevel:c.max_level??null,pp:c.pp,levelStatus:levelKnown?'DOCUMENTADO_PELO_USUARIO':'PENDENTE',
  savedVector:c.niveis,savedVectorCost:Array.isArray(c.niveis)?B.progressCost(c.niveis):null,
  trainingProvisional:c.treino_proposto_nao_validado===true,
  nativeCount:nativeKnown?String(c.habilidades_nativas).split(';').filter(x=>x.trim()).length:0,
  htmlNativesDiffer:nativeDiff,fixedBooster:c.impeto_fixo,catalogExtra:c.impeto_extra,
  catalogSlotStatus:B.slotStatus(c.impeto_extra),accountSlotStatus:'DESCONHECIDO',
  styles:[],gameplayValidated:false};
 for(const tactic of B.tactics){
  const skills=S.evaluate(profile,tactic,'',proof.options);
  const boosters=S.booster(profile,tactic,B,proof.options.verifiedSlot,null,proof.options);
  assert.equal(skills.slotsRemaining,null);
  assert.equal(boosters.able,false);
  const nativeKeys=new Set(String(profile.native_skills||'').split(';').map(S.keyFor).filter(Boolean));
  assert(new Set(skills.recommendations.map(x=>x.key)).size===skills.recommendations.length);
  assert(skills.recommendations.length<=5);
  assert(skills.recommendations.every(x=>!nativeKeys.has(x.key)&&x.decision.mayApply===false));
  const fixed=B.boosterName(c.impeto_fixo);
  assert(![boosters.primary,...boosters.alternatives].filter(Boolean).some(x=>x.nome===fixed));
  let frontier=null;
  if(!levelKnown)summary.levelBlockedFrontiers++;
  else if(!proof.identity.valid)summary.identityBlockedFrontiers++;
  else{
   const interpretation=I.interpret(profile,tactic,{});
   frontier=V.trainingFrontier(interpretation.weights,interpretation.role,c.pp,c.niveis);
   assert.equal(frontier.status,'ESTIMADO');
   summary.contextualFrontiers++;summary.feasibleCandidates+=frontier.candidates.length;
  }
  audit.styles.push({tactic,status:proof.identity.valid&&nativeKnown?'ESTIMADO':'PENDENTE',
   additionalSkills:skills.recommendations.map(x=>({name:x.name,key:x.key,
    priority:x.decision.priority,confidence:x.decision.confidence,status:x.decision.status,
    reason:x.decision.reason,situation:x.decision.situation})),
   boosters:[boosters.primary,...boosters.alternatives].filter(Boolean).map(x=>({
    name:x.nome_pt,technicalName:x.nome,status:x.status_validacao,
    relativeScore:x.score,axes:x.atributos,trainingStatus:x.evidencias.pp_status})),
   trainingComparison:frontier?{candidateCount:frontier.candidates.length,
    frontierCount:frontier.frontierIds.length,budgetStatus:frontier.budgetStatus,
    exhaustive:false,mayApply:false}:
    {status:'PENDENTE',reason:!levelKnown?'Nível máximo sem prova':'Identidade exata pendente'},
   maySpendTokens:false});
  summary.scenarios++;summary.unknownAccountSlots++;
 }
 rows.push(audit);
}
assert.equal(summary.scenarios,1230);
assert.equal(summary.contextualFrontiers,315);
assert.equal(summary.identityBlockedFrontiers,110);
assert.equal(summary.levelBlockedFrontiers,805);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
const report={schema:'CRAQUE_V289_COMPUTATIONAL_AUDIT',baseline:'bd9c6226bd8475eb0c55b6cc3562ff94450351d8',
 warning:'246 edições processadas automaticamente; zero validações individuais de gameplay. Slots da conta permanecem desconhecidos.',
 preservation:{catalogSHA256:hash(raw),imagesSHA256:corpusHash,evidenceIndexSHA256:hash(indexRaw)},
 summary,cards:rows};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v289-competitive-audit-246.json'),JSON.stringify(report,null,2)+'\n');
const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const csv=[['CAP','Nome','Card ID','Edição','Nível','PP','Identidade','Nível/PP','Nativas','Diferença HTML','Slot catálogo','Slot conta','Gameplay'],
 ...rows.map(c=>[c.capture,c.name,c.cardId,c.edition,c.maxLevel,c.pp,c.identityStatus,c.levelStatus,
 c.nativeCount,c.htmlNativesDiffer,c.catalogSlotStatus,c.accountSlotStatus,'PENDENTE'])];
fs.writeFileSync(path.join(root,'build/v289-evidence-queue-246.csv'),csv.map(row=>row.map(quote).join(',')).join('\n')+'\n');
console.log('V289 AUDITORIA PASS:',JSON.stringify(summary));
