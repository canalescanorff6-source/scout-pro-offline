'use strict';
/* V293: as APIs internas não homologam recibos com edição/ID pendentes;
 * divergências entre segundo ímpeto no catálogo e vaga local são explícitas.
 * Inspeção automática ≠ confirmação de gameplay das 246 cartas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const before=JSON.stringify(cards);
const adapt=c=>({capture:c.numero,id:c.id,edition:c.versao,
 shown_position:c.posicao,role_used:c.posicao,native_skills:c.habilidades_nativas,
 boost1:c.impeto_fixo,boost2:c.impeto_extra,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,pp:c.pp,max_level:c.max_level,
 pp_origem:c.pp_origem,training_provisional:c.treino_proposto_nao_validado,
 recommended_levels:c.niveis});
const equipment=(d,manual='')=>({
 schema:'CRAQUE_ADDITIONAL_V254',confirmed:true,capture:d.capture,
 card_id:d.id,edition:d.edition,fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(d.native_skills||'')
});
const boostRecord=(d,status='vazio',equipped='')=>({
 schema:'CRAQUE_BOOST_SLOT_V283',capture:d.capture,
 card_id:d.id,edition:d.edition,status,equipped
});
const totals={cards:cards.length,scenarios:0,identityPending:0,
 nativePending:0,sourceNamedConflicts:0,declaredEmptyAccepted:0,
 equippedOccupiedWithoutName:0,skillsRejectedOnPendingIdentity:0};
const rows=[];
for(const c of cards){
 const d=adapt(c),identity=S.identityEvidenceV293(d);
 if(!identity)totals.identityPending++;
 if(!String(d.native_skills||'').trim())totals.nativePending++;
 const old=JSON.stringify(c);
 const named=B.slotStatus(d.boost2)==='nome_registrado';
 const declared=boostRecord(d,'vazio');
 const boostProof=S.boosterRecordEvidence(d,declared);
 const skillProof=S.checkedEquipment(d,'',equipment(d));
 if(!identity){
  assert.equal(skillProof,false,'Card ID pendente aceito: CAP '+c.numero);
  assert.equal(boostProof.valid,false,'Slot confirmado sem Card ID: CAP '+c.numero);
  totals.skillsRejectedOnPendingIdentity++;
 }
 if(identity&&named){
  assert.equal(boostProof.valid,false,'Segundo ímpeto cadastrado tratado como vaga livre: CAP '+c.numero);
  assert.equal(boostProof.catalogConflict,true);
  assert.match(boostProof.reason,/conflito/i);
  totals.sourceNamedConflicts++;
 }
 if(identity&&B.slotStatus(d.boost2)==='selecionavel'){
  assert.equal(boostProof.valid,true);
  totals.declaredEmptyAccepted++;
 }
 for(const tactic of B.tactics){
  const ctx=S.verifiedRecommendationContextV288(d,{
   boosterRecord:declared,equipmentRecord:equipment(d),manualEquipped:''
  });
  assert.equal(ctx.identity.valid,identity);
  assert.equal(ctx.booster.valid,boostProof.valid&&identity);
  if(!identity)assert.equal(ctx.skills.remaining,null);
  if(identity&&named)assert.equal(ctx.booster.status,null);
  assert.equal(ctx.booster.maySpendTokens,false);
  assert.equal(ctx.noAutomaticApplication,true);
  assert.equal(S.booster(d,tactic,B,'ocupado').able,false);
  totals.scenarios++;
 }
 const occupied=S.boosterRecordEvidence(d,boostRecord(d,'ocupado'));
 if(identity){
  assert.equal(occupied.valid,true,'O usuário pode declarar ocupado sem identificar o ímpeto');
  assert.equal(occupied.equippedNamePending,true);
  assert.match(occupied.reason,/nome.*não informado/i);
  const comparison=S.booster(d,'posse',B,'ocupado');
  assert.equal(comparison.occupiedUnidentified,true);
  assert(comparison.decisionEvidence.warnings.some(s=>/nome do ímpeto equipado/i.test(s)));
  assert.equal(comparison.able,false);
  totals.equippedOccupiedWithoutName++;
 }
 assert.equal(S.boosterRecordEvidence(d,
  boostRecord(d,'vazio',{unauthorized:'object'})).valid,false,
  'Equipamento não textual não deve ser tratado como recibo válido');
 rows.push({cap:c.numero,cardId:c.id,identityValid:identity,
  catalogSlot:B.slotStatus(d.boost2),emptyReceiptValid:boostProof.valid,
  conflict:boostProof.catalogConflict});
 assert.equal(JSON.stringify(c),old);
}
assert.equal(totals.scenarios,1230);
assert(totals.identityPending>0);
assert(totals.sourceNamedConflicts>0);
assert(totals.declaredEmptyAccepted>0);
assert.equal(totals.skillsRejectedOnPendingIdentity,totals.identityPending);
const known=adapt(cards.find(c=>c.numero===191));
assert(S.identityEvidenceV293(known));
for(const change of [
 {...known,id:'PENDENTE - associação anterior invalidada'},
 {...known,id:'ABC-191'},
 {...known,id:''},
 {...known,edition:'PENDENTE'},
 {...known,edition:'edição a confirmar'},
 {...known,capture:0},
 {...known,capture:1.5}
]){
 assert.equal(S.identityEvidenceV293(change),false);
 assert.equal(S.checkedEquipment(change,'',equipment(change)),false);
 assert.equal(S.boosterRecordEvidence(change,boostRecord(change)).valid,false);
}
const id = adapt(cards.find(c=>c.numero===1));
assert.equal(S.identityEvidenceV293(id),true);
assert.equal(S.boosterRecordEvidence(id,
 {...boostRecord(id),edition:'Outra edição'}).valid,false);
assert.equal(S.checkedEquipment(id,'',equipment({...id,edition:'Outra edição'})),false);
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert(read('package.json').includes('test-receipt-integrity-v293.cjs'));
assert(read('web/sw.js').includes('v293-receipt-integrity'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v293-receipt-integrity-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V293_ACCOUNT_RECEIPT_INTEGRITY',
  totals,rows,note:'Recibos de teste são sintéticos; não comprovam conta nem evolução real.'},null,2)+'\n');
console.log('V293 PASS: '+totals.scenarios+' cenários; '+
 totals.identityPending+' identidades pendentes, '+
 totals.sourceNamedConflicts+' conflitos de catálogo/slot, 246 cartas imutáveis.');
