'use strict';
/* V299 — all nested advisory labs must honor a valid PP conflict.
 * Independently documented additional equipment remains a record, not advice. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const original=fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8');
const cards=JSON.parse(original).cards;
const evidenceRows=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V221_EVIDENCE_INDEX.json'),'utf8')).cards;
const evidenceByCap=new Map(evidenceRows.map(row=>[Number(row.numero),row]));
const F=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const S=require('../web/skills-booster-v162.js');
const proof={checks:['edition','budget','native','additional','booster','base','video','gameplay']
 .map(id=>({id,documented:true}))};
const makeRecord=(c,lv)=>({schema:'CRAQUE_PROGRESS_REVIEW_V248',numero:c.numero,
 card_id:String(c.id),name:c.name,edition:c.versao,level:lv,pp:2*(lv-1),
 confirmed_in_game:true,source:'conferência manual no eFootball',confirmed_at:'2026-10-21T15:00:00.000Z'});
const key=c=>'scoutpro:v248:level-review:'+c.numero+'@'+c.id;
let blocked=0,staleIgnored=0;
assert.equal(cards.length,246);
for(const c of cards){
 const before=JSON.stringify(c);
 const expectedLevel=Number(c.pp)/2+1;
 assert(Number.isInteger(expectedLevel)&&expectedLevel<=120);
 const level=expectedLevel===120?119:expectedLevel+1;
 const record=makeRecord(c,level);
 assert.notEqual(record.pp,c.pp);
 const obsolete={...record};delete obsolete.edition;
 const saved={getItem:k=>k===key(c)?JSON.stringify(record):null};
 const conflictProof=F.proofChecklist(c,evidenceByCap.get(c.numero),{},saved);
 const conflictBudget=conflictProof.checks.find(x=>x.id==='budget');
 assert.equal(conflictBudget.documented,false,'Conflito não pode ser DOCUMENTADO no checklist #'+c.numero);
 assert(conflictBudget.note.includes('PP DIVERGENTES'));
 const agreeLevel=expectedLevel;
 const agreed={getItem:k=>k===key(c)?JSON.stringify(makeRecord(c,agreeLevel)):null};
 const agreedBudget=F.proofChecklist(c,evidenceByCap.get(c.numero),{},agreed)
  .checks.find(x=>x.id==='budget');
 assert.equal(agreedBudget.documented,true,'Confirmar PP equivalentes libera a prova documental #'+c.numero);
 for(const tactic of T.STYLES){
  const conflicted=F.methodologyGate(c,proof,tactic.id,{
   getItem:k=>k===key(c)?JSON.stringify(record):null
  });
  assert.equal(conflicted.skills.trainingConflict,true);
  assert.equal(conflicted.skills.investmentEvidence,'pp_divergentes_nao_utilizar');
  assert.equal(conflicted.progressConflict.localPP,record.pp);
  assert.equal(conflicted.booster.status,'bloqueado_pp_divergentes');
  assert.equal(conflicted.booster.name,null);
  blocked++;
  const ignored=F.methodologyGate(c,proof,tactic.id,{
   getItem:k=>k===key(c)?JSON.stringify(obsolete):null
  });
  assert.equal(ignored.skills.trainingConflict,false);
  assert.equal(ignored.progressConflict,null);
  staleIgnored++;
 }
 assert.equal(JSON.stringify(c),before);
}
// A mesma carta pode ter equipamentos V254 CONFIRMADOS, mesmo quando sua
// confirmação V248 aponta conflito de PP. Nunca apagar confirmação de skills.
const martinelli=cards.find(c=>c.numero===191);
assert(martinelli&&martinelli.max_level===26&&martinelli.pp===50);
const manual='';
const confirm={schema:'CRAQUE_ADDITIONAL_V254',capture:martinelli.numero,
 card_id:martinelli.id,edition:martinelli.versao,confirmed:true,
 fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(martinelli.habilidades_nativas)};
const storage={getItem:k=>{
 if(k===key(martinelli))return JSON.stringify(makeRecord(martinelli,27));
 if(k===S.confirmationKey(martinelli.numero,martinelli.id))return JSON.stringify(confirm);
 if(k==='scoutpro:v162:equipped:'+martinelli.numero+':'+martinelli.id)return manual;
 return null;
}};
const userProof=F.methodologyGate(martinelli,proof,'posse',storage);
assert.equal(userProof.skills.status,'lista_conferida_localmente');
assert.equal(userProof.skills.trainingConflict,true);
assert.equal(userProof.skills.slots,5);
assert.equal(userProof.booster.name,null);
const ui=fs.readFileSync(path.join(root,'web/craque-ficha-individual-v251.js'),'utf8');
assert(ui.includes("if(method.progressConflict){"),'UI must guard secondary advisory labs');
assert(ui.includes("} // V299 — encerra os laboratórios condicionados à reconciliação de PP."));
assert(ui.includes("ct299-pp-gate"),'Visible notice on conflicting budget');
assert(ui.includes("PP DIVERGENTES: o inventário de habilidades previamente conferidas"));
assert.equal(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'),original);
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v299-unified-pp-lab-guard.json'),JSON.stringify({
 schema:'CRAQUE_V299_UNIFIED_PP_LAB_GUARD',cards:246,tactics:5,
 conflicts:blocked,legacyReceiptsIgnored:staleIgnored,budgetsSuppressedOnConflict:246,
 secondaryLabsSuspendedOnConflict:true,
 equipmentEvidencePreserved:true,dataMutated:false,gameplayValidated:false
},null,2)+'\n');
console.log('V299 PASS: '+blocked+' conflitos, '+staleIgnored+
 ' recibos legados ignorados, cinco laboratórios suspensos e habilidades conferidas preservadas.');
