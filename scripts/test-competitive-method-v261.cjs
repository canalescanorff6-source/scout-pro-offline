// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V261 — critérios competitivos auditáveis, sem autoria inventada.
 * Nenhum dado das 246 cartas é modificado. Cinco estilos por edição.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(catalog).cards;
const idx=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const snapshots=JSON.stringify(cards);
assert.equal(cards.length,246);assert.equal(idx.length,246);
const rows=new Map(idx.map(x=>[x.numero,x]));
const styles=['posse','normal','rapido','fora','longo'];
let checks=0,slotGaps=0;
for(const card of cards){
 const before=JSON.stringify(card);
 const report=V.proofChecklist(card,rows.get(card.numero),{},null);
 for(const style of styles){
  const result=V.methodologyGate(card,report,style,null,{positionUsed:card.posicao});
  assert.equal(result.capture,card.numero);
  assert.equal(result.card_id,card.id);
  assert.equal(result.style,style);
  assert.equal(result.competitivelyHomologated,false,
   'Sem gameplay comprovado não chamar a carta de homologada');
  assert(['treino_registrado_nao_homologado','sem_treino_validado',
   'evidencia_para_avaliacao_competitiva'].includes(result.training.status));
  assert.equal(result.skills.status,'slots_nao_conferidos');
  assert.equal(result.skills.slots,null);
  assert(result.skills.candidates.length<=5,'V262: parecer permite até cinco habilidades, todas consultivas');
  assert.equal(result.booster.status,'nao_autorizado_para_equipar',
   'Nunca presumir slot ao ler a carta');
  assert(Array.isArray(result.missing));
  assert(!JSON.stringify(result).includes('meta_aprovado'));
  if(result.missing.includes('Slot de ímpeto conferido pelo usuário'))slotGaps++;
  checks++;
 }
 assert.equal(JSON.stringify(card),before,'Não alterar #'+card.numero);
}
assert.equal(checks,1230);
assert(slotGaps>0);
const fixture={
 capture:191,id:'105850811319718',shown_position:'PTE',role_used:'PTE',
 boost1:'NENHUM BOOSTER NATIVO CONFIRMADO',
 boost2:'NENHUM BOOSTER NATIVO CONFIRMADO',
 native_skills:'',attack_style:'Ala produtivo',recommended_levels:[4,4,8,10,8,0,0,0,0,0]
};
const noCatalogSlot=S.booster(fixture,'posse',B,'vazio');
assert.equal(noCatalogSlot.slotSupported,false);
assert.equal(noCatalogSlot.able,false);
assert.equal(noCatalogSlot.equipStatus,'slot_nao_documentado');
assert.match(noCatalogSlot.note,/não comprova/);
const selectable={...fixture,boost2:'SLOT SELECIONÁVEL +1 — escolha da conta não confirmada'};
const provenSlot=S.booster(selectable,'posse',B,'vazio');
assert.equal(provenSlot.slotSupported,true);
assert.equal(provenSlot.able,true);
assert.equal(provenSlot.equipStatus,'condicionado_a_slot');
for(const state of [undefined,'ocupado','ausente','pendente']){
 assert.equal(S.booster(selectable,'posse',B,state).able,false);
}
const preFixed=S.booster({...fixture,boost2:'Shooting +1'},'posse',B,'vazio');
assert.equal(preFixed.able,false);
assert.equal(preFixed.equipStatus,'comparacao_segundo_fixo');
const martinelli=cards.find(x=>x.numero===191);
assert.equal(martinelli.max_level,26);assert.equal(martinelli.pp,50);
const mIndex=rows.get(191);
const saved=new Map();
const store={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v))};
const manual='Passe de primeira; Toque duplo';
const manualKey='scoutpro:v162:equipped:'+martinelli.numero+':'+martinelli.id;
const proofKey=S.confirmationKey(martinelli.numero,martinelli.id);
store.setItem(manualKey,manual);
store.setItem(proofKey,JSON.stringify({schema:'CRAQUE_ADDITIONAL_V254',
 capture:martinelli.numero,card_id:martinelli.id,edition:martinelli.versao,
 nativeFingerprint:S.fingerprint(martinelli.habilidades_nativas),
 confirmed:true,fingerprint:S.fingerprint(manual)}));
let proofs=V.proofChecklist(martinelli,mIndex,{},store);
assert.equal(proofs.checks.find(x=>x.id==='additional').documented,true);
const entry=V.methodologyGate(martinelli,proofs,'posse',store);
assert.equal(entry.skills.status,'lista_conferida_localmente');
assert.equal(entry.skills.slots,3);
store.setItem(manualKey,manual+'; Bloqueador');
proofs=V.proofChecklist(martinelli,mIndex,{},store);
assert.equal(V.methodologyGate(martinelli,proofs,'posse',store).skills.slots,null);
const main=read('web/craque-ficha-individual-v251.js');
assert(main.includes('ct261-methodology'));
assert(main.includes('methodologyGate(card,proof,active,host.localStorage,check)'));
assert(main.includes('NENHUMA recomendação atribuída ou aprovada por eles'));
const stylesFile=read('web/craque-ficha-individual-v251.css');
assert(stylesFile.includes('ct261-methodology'));
assert(read('web/sw.js').includes('v261-competitive-evidence'));
assert(read('package.json').includes('test-competitive-method-v261.cjs'));
assert.equal(JSON.stringify(cards),snapshots);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V261 PASS: '+checks+' triagens (246 cartas x 5 estilos); slots e proveniência protegidos.');
