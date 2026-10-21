'use strict';
/* V300 — o mesmo comprovante V254 deve chegar ao motor e ao checklist,
 * sem copiar slots, inventar equipamentos ou alterar qualquer carta. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const catalogText=fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8');
const cards=JSON.parse(catalogText).cards;
const indexText=fs.readFileSync(path.join(root,'web/SCOUT_V221_EVIDENCE_INDEX.json'),'utf8');
const index=new Map(JSON.parse(indexText).cards.map(x=>[Number(x.numero),x]));
const F=require('../web/craque-ficha-individual-v251.js');
const S=require('../web/skills-booster-v162.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const proof=(card,manual='')=>({
 schema:'CRAQUE_ADDITIONAL_V254',capture:card.numero,
 card_id:String(card.id),edition:String(card.versao),confirmed:true,
 fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(String(card.habilidades_nativas||''))
});
const data=c=>({capture:c.numero,id:String(c.id),edition:c.versao,
 shown_position:c.posicao,native_skills:c.habilidades_nativas});
const store=(c,manual,receipt)=>({getItem:k=>
 k===S.confirmationKey(c.numero,c.id)?JSON.stringify(receipt??null):
 k==='scoutpro:v162:equipped:'+c.numero+':'+c.id?manual:null});
let cardsChecked=0,confirmed=0,pending=0,tacticChecks=0,rejected=0;
assert.equal(cards.length,246);
for(const c of cards){
 const original=JSON.stringify(c),d=data(c),receipt=proof(c),valid=S.checkedEquipment(d,'',receipt);
 const panel=F.proofChecklist(c,index.get(Number(c.numero)),null,store(c,'',receipt));
 const state=panel.checks.find(x=>x.id==='additional');
 assert(state,'Checklist sem item additional #'+c.numero);
 assert.equal(state.documented,valid,'Checklist diverge do motor V254 #'+c.numero);
 if(valid)confirmed++;else pending++;
 const negative=[
  null,{...receipt,edition:'Outra edição com mesmo Card ID'},
  {...receipt,nativeFingerprint:'fingerprint-corrompido'},
  {...receipt,fingerprint:'lista-de-adicionais-corrompida'},
  {...receipt,confirmed:false},
  {...receipt,card_id:'outro-id'}
 ];
 for(const bad of negative){
  const stat=F.proofChecklist(c,index.get(Number(c.numero)),null,store(c,'',bad))
   .checks.find(x=>x.id==='additional');
  assert.equal(stat.documented,false,'Comprovante inválido V254 passou #'+c.numero);
  rejected++;
 }
 for(const tactic of T.STYLES){
  const withoutReceipt=S.evaluate(d,tactic.id,'',{equippedConfirmed:true});
  assert.equal(withoutReceipt.equippedConfirmed,false,'Flag isolada confirma slots');
  const withReceipt=S.evaluate(d,tactic.id,'',{
   equippedConfirmed:true,equipmentRecord:receipt
  });
  assert.equal(withReceipt.equippedConfirmed,valid,
   'Motor com recibo V254 não corresponde ao checklist #'+c.numero+'/'+tactic.id);
  if(valid)assert.equal(withReceipt.slotsRemaining,5);
  tacticChecks++;
 }
 assert.equal(JSON.stringify(c),original,'Catálogo mutado #'+c.numero);
 cardsChecked++;
}
assert(confirmed>=200,'Inventário original elegível mudou; revisar antes de aprovar regressão');
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.pp===50&&martin.max_level===26);
const single='Toque duplo',signed=proof(martin,single);
assert(S.checkedEquipment(data(martin),single,signed),
 'Teste com uma habilidade adicional concreta da edição de Martinelli');
const signedCheck=F.proofChecklist(martin,index.get(191),null,store(martin,single,signed))
 .checks.find(x=>x.id==='additional');
assert.equal(signedCheck.documented,true);
const wrong=F.proofChecklist(martin,index.get(191),null,store(martin,single,proof(martin,'')))
 .checks.find(x=>x.id==='additional');
assert.equal(wrong.documented,false);
assert.equal(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'),catalogText);
assert.equal(fs.readFileSync(path.join(root,'web/SCOUT_V221_EVIDENCE_INDEX.json'),'utf8'),indexText);
fs.mkdirSync(path.join(root,'build'),{recursive:true});
const audit={schema:'CRAQUE_V300_ADDITIONAL_RECEIPT_E2E',cardsChecked,
 tacticChecks,documentaryEligible:confirmed,documentaryPending:pending,
 invalidReceiptsRejected:rejected,actualEquipmentWritten:false,
 catalogChanged:false,gameplayValidated:false};
fs.writeFileSync(path.join(root,'build/v300-additional-receipt-246x5.json'),JSON.stringify(audit,null,2)+'\n');
console.log('V300 PASS: '+cardsChecked+' cartas, '+tacticChecks+' motor/tática, '+
 rejected+' provas inválidas rejeitadas, '+confirmed+' edições V254 elegíveis (fixture sintética).');
