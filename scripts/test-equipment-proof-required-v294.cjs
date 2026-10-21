'use strict';
/* V294: uma flag booleana não cria vagas de habilidades adicionais.
 * O motor exige recibo V254 compatível com CAP/Card ID/edição/nativas/lista.
 * 246×5 cenários de prova sintética não homologam 246 cartas no jogo. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const snapshot=JSON.stringify(cards);
const adapt=c=>({capture:c.numero,id:c.id,edition:c.versao,
 shown_position:c.posicao,role_used:c.posicao,posicao:c.posicao,
 native_skills:c.habilidades_nativas,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,pp:c.pp});
const receipt=(d,list='')=>({schema:'CRAQUE_ADDITIONAL_V254',
 confirmed:true,capture:d.capture,card_id:d.id,edition:d.edition,
 nativeFingerprint:S.fingerprint(d.native_skills||''),
 fingerprint:S.fingerprint(list)});
const count={scenarios:0,booleanOnlyBlocked:0,fullReceiptsAccepted:0,
 pendingByNative:0,pendingByIdentity:0,recordMismatchesBlocked:0};
const report=[];
for(const c of cards){
 const d=adapt(c),proof=receipt(d);
 const validIdentity=S.identityEvidenceV293(d);
 for(const tactic of B.tactics){
  const fake=S.evaluate(d,tactic,'',{equippedConfirmed:true});
  assert.equal(fake.equippedConfirmed,false);
  assert.equal(fake.slotsRemaining,null);
  assert.equal(fake.requiresReconciliation,true);
  assert(fake.missing.some(x=>/recibo válido/i.test(x)));
  assert.equal(fake.equippedSynergyApplied,false);
  const strategic=S.strategicPortfolioV286(d,tactic,B,'',{equippedConfirmed:true});
  assert.equal(strategic.slotsConfirmed,false);
  assert.equal(strategic.mayEquip,false);
  count.booleanOnlyBlocked++;
  const validated=S.evaluate(d,tactic,'',{
   equippedConfirmed:true,equipmentRecord:proof});
  const eligibility=S.checkedEquipment(d,'',proof);
  assert.equal(validated.equippedConfirmed,eligibility);
  assert.equal(validated.slotsRemaining,eligibility?5:null);
  if(eligibility)count.fullReceiptsAccepted++;
  if(!validIdentity){
   count.pendingByIdentity++;
   assert.equal(validated.equippedConfirmed,false);
  }else if(!d.native_skills){
   count.pendingByNative++;
   assert.equal(validated.equippedConfirmed,false);
  }
  const invalid=S.evaluate(d,tactic,'',{
   equippedConfirmed:true,equipmentRecord:{...proof,card_id:'outra-edicao'}});
  assert.equal(invalid.equippedConfirmed,false);
  assert.equal(invalid.slotsRemaining,null);
  count.recordMismatchesBlocked++;
  count.scenarios++;
 }
 report.push({cap:c.numero,id:c.id,identityValid:validIdentity,
  localReceiptEligible:S.checkedEquipment(d,'',proof)});
}
assert.equal(count.scenarios,1230);
assert.equal(count.booleanOnlyBlocked,1230);
assert(count.fullReceiptsAccepted>0);
assert.equal(count.recordMismatchesBlocked,1230);
const primary=adapt(cards.find(c=>c.numero===1));
assert(S.identityEvidenceV293(primary));
const manual='Chute de primeira';
const receiptSingle=receipt(primary,manual);
const accepted=S.evaluate(primary,'posse',manual,{
 equippedConfirmed:true,equipmentRecord:receiptSingle});
assert.equal(accepted.equippedConfirmed,true);
assert.equal(accepted.slotsRemaining,4);
assert.equal(S.evaluate(primary,'posse',manual,{
 equippedConfirmed:false,equipmentRecord:receiptSingle}).slotsRemaining,null,
 'Recibo salvo sem declaração atual não concede vaga por si');
assert.equal(S.evaluate(primary,'posse',manual,{
 equippedConfirmed:true,equipmentRecord:receipt(primary,'Passe de primeira')}).slotsRemaining,null);
assert.equal(S.evaluate({...primary,native_skills:'PENDENTE - confirmar'},'posse','',{
 equippedConfirmed:true,equipmentRecord:receipt({...primary,native_skills:'PENDENTE - confirmar'})}).slotsRemaining,null);
assert.equal(JSON.stringify(cards),snapshot);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert(read('package.json').includes('test-equipment-proof-required-v294.cjs'));
assert(read('web/sw.js').includes('v294-five-slot-proof'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v294-five-slot-proof-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V294_SLOTS_SOMENTE_COM_RECIBO',count,report,
 note:'Provas são fixtures sintéticas e não validam elegibilidade no menu real.'},null,2)+'\n');
console.log('V294 PASS: '+count.scenarios+' cenários; '+
 count.booleanOnlyBlocked+' flags isoladas bloqueadas, '+
 count.fullReceiptsAccepted+' recibos locais aceitos; 246 cartas preservadas.');
