'use strict';
/* V289: prova negativa de inventário nativo, 246 cartas x cinco estilos.
 * Inspeção automatizada não equivale a conferência individual em jogo. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const adapt=c=>({
 capture:c.numero,id:c.id,edition:c.versao,name:c.name,role_used:c.posicao,
 shown_position:c.posicao,posicao:c.posicao,original_position:c.posicao,
 attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
 native_skills:c.habilidades_nativas,pp:c.pp,pp_estimado:c.pp_estimado===true,
 recommended_levels:c.niveis,training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra
});
const receipt=(d,manual='')=>({
 schema:'CRAQUE_ADDITIONAL_V254',capture:d.capture,card_id:d.id,
 edition:d.edition,confirmed:true,fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(d.native_skills||'')
});
assert.equal(cards.length,246,'O catálogo original precisa conter 246 cartas');
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const pristine=JSON.stringify(cards);
const missingNatives=[],unknownId=[],outcomes=[];
let scenarios=0,rejectedUnproven=0,acceptedDocumented=0;
for(const c of cards){
 const before=JSON.stringify(c),d=adapt(c);
 const absent=!String(c.habilidades_nativas||'').trim();
 if(absent)missingNatives.push({capture:c.numero,cardId:c.id,name:c.name});
 if(/pendente|confirmar|desconhecid|invalid/i.test(String(c.id)+' '+String(c.versao)))
  unknownId.push(c.numero);
 const record=receipt(d);
 const locally= S.verifiedRecommendationContextV288(d,{
  manualEquipped:'',equipmentRecord:record
 });
 for(const tactic of B.tactics){
  const noProof=S.verifiedRecommendationContextV288(d,{});
  assert.equal(noProof.skills.confirmed,false);
  assert.equal(noProof.skills.occupied,null);
  assert.equal(noProof.skills.remaining,null);
  assert.equal(noProof.options.equippedConfirmed,false);
  if(absent){
   assert.equal(S.checkedEquipment(d,'',record),false,
    'Habilidades nativas ausentes não podem liberar vagas: CAP '+c.numero);
   assert.equal(locally.skills.confirmed,false);
   assert.equal(locally.skills.remaining,null);
   // O bloqueio de identidade tem precedência sobre o de nativas. Ambos
   // impedem confirmação de vagas; não presumir qual mensagem prevalece.
   assert.match(locally.skills.reason,locally.identity.valid?
    /nativas|inventário/i:/card id|edição/i);
   const proposal=S.evaluate(d,tactic,'',{equippedConfirmed:true});
   assert.equal(proposal.equippedConfirmed,false);
   assert.equal(proposal.slotsRemaining,null);
   assert.equal(proposal.requiresReconciliation,true);
   assert(proposal.missing.some(x=>/nativas/i.test(x)));
   const portfolio=S.strategicPortfolioV286(d,tactic,B,'',{equippedConfirmed:true});
   assert.equal(portfolio.slotsConfirmed,false);
   assert.equal(portfolio.mayEquip,false);
   rejectedUnproven++;
  }else if(locally.identity.valid){
   assert.equal(S.checkedEquipment(d,'',record),true);
   assert.equal(locally.skills.confirmed,true);
   assert.equal(locally.skills.occupied,0);
   assert.equal(locally.skills.remaining,5);
   acceptedDocumented++;
  }else{
   assert.equal(locally.skills.confirmed,false);
  }
  scenarios++;
 }
 assert.equal(JSON.stringify(c),before,'Carta alterada durante análise: '+c.numero);
 outcomes.push({capture:c.numero,cardId:c.id,edition:c.versao,
  nativeInventoryPresent:!absent,identityUsable:locally.identity.valid,
  localEmptySlotsMayBeConfirmed:locally.skills.confirmed});
}
assert.equal(scenarios,246*B.tactics.length);
assert(rejectedUnproven>0,'É necessário exercitar o caminho de nativas ausentes');
assert(acceptedDocumented>0,'É necessário preservar o caminho de prova válida');
const positive=cards.find(c=>String(c.habilidades_nativas||'').trim()&&
 !/pendente|confirmar|desconhecid|invalid/i.test(String(c.id)+' '+String(c.versao)));
assert(positive);
const known=adapt(positive);
const unknown={...known,native_skills:'PENDENTE - confirmar na mesma edição'};
assert.equal(S.checkedEquipment(unknown,'',receipt(unknown)),false);
assert.equal(S.verifiedRecommendationContextV288(unknown,{
 manualEquipped:'',equipmentRecord:receipt(unknown)
}).skills.remaining,null);
assert.equal(S.evaluate(unknown,'posse','',{equippedConfirmed:true}).slotsRemaining,null);
assert.equal(S.checkedEquipment(known,'',receipt(known)),true);
assert.equal(S.checkedEquipment({...known,id:'outra edicao'},'',receipt(known)),false);
assert.equal(S.checkedEquipment({...known,native_skills:'Passe de primeira'},'',receipt(known)),false);
const martinelli=cards.find(c=>c.numero===191);
assert(martinelli&&martinelli.max_level===26&&martinelli.pp===50);
assert.equal(martinelli.treino_proposto_nao_validado,true);
assert.equal(JSON.stringify(cards),pristine);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
assert(read('package.json').includes('test-native-inventory-guard-v289.cjs'));
assert(read('web/sw.js').includes('v289-native-proof-guard'));
assert(read('web/skills-booster-v162.js').includes('nativeInventoryUsable'));
assert(read('web/craque-ficha-individual-v251.js').includes('card.pp===null'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v289-native-inventory-proof-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V289_PROVA_NEGATIVA_NATIVAS',cards:246,scenarios,
  missingNativeCards:missingNatives,identityPendingCaptures:unknownId,
  rejectedUnproven,acceptedDocumented,
  note:'Conferência local de slots só após inventário nativo presente. Nenhuma build validada ou performance em jogo por este teste.',
  outcomes},null,2)+'\n');
console.log('V289 PASS: '+scenarios+' cenários; '+missingNatives.length+
 ' cartas sem nativas documentadas bloqueadas ('+rejectedUnproven+
 ' cenários); '+acceptedDocumented+' provas locais elegíveis preservadas; 246 cartas intactas.');
