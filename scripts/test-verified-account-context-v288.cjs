'use strict';
/* V288: engenharia de prova local; jamais equipar skills, consumir tokens ou
   aceitar Card ID de edição diferente. Regressão das 246 × cinco táticas. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const load=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=load('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const adapt=c=>({
 capture:c.numero,id:c.id,name:c.name,edition:c.versao,
 posicao:c.posicao,original_position:c.posicao,role_used:c.posicao,
 shown_position:c.posicao,attack_style:c.estilo_ataque,
 defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,
 pp:c.pp,pp_estimado:c.pp_estimado===true,recommended_levels:c.niveis,
 training_provisional:c.treino_proposto_nao_validado===true,
 boost1:c.impeto_fixo,boost2:c.impeto_extra
});
const confirm=(d,manual)=>({
 schema:'CRAQUE_ADDITIONAL_V254',capture:d.capture,card_id:d.id,
 edition:d.edition,confirmed:true,fingerprint:S.fingerprint(manual),
 nativeFingerprint:S.fingerprint(d.native_skills)
});
const confirmBooster=(d,status='vazio')=>({
 schema:'CRAQUE_BOOST_SLOT_V283',capture:d.capture,card_id:d.id,
 edition:d.edition,status,equipped:''
});
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
let scenarios=0,identityPending=0,unknownSkills=0,declaredEmpty=0,declaredUnavailable=0;
const before=JSON.stringify(cards);
for(const c of cards){
 const source=JSON.stringify(c),d=adapt(c);
 for(const tactic of B.tactics){
  const context=S.verifiedRecommendationContextV288(d,{});
  assert.equal(context.schema,'CRAQUE_V288_CONTEXTO_CONFERENCIA');
  assert.equal(context.identity.capture,c.numero);
  assert.equal(context.identity.cardId,String(c.id));
  assert.equal(context.identity.edition,String(c.versao));
  assert.equal(context.skills.confirmed,false);
  assert.equal(context.skills.occupied,null);
  assert.equal(context.skills.remaining,null);
  assert.equal(context.options.equippedConfirmed,false);
  assert.equal(context.booster.status,null);
  assert.equal(context.options.verifiedSlot,null);
  assert.equal(context.noGameplayConfirmation,true);
  assert.equal(context.noAutomaticApplication,true);
  assert.equal(context.booster.maySpendTokens,false);
  const estimate=S.strategicPortfolioV286(d,tactic,B,
   context.manualEquipped,context.options);
  assert.equal(estimate.slotsConfirmed,false);
  assert(estimate.selected.length<=5);
  assert(estimate.selected.every(x=>!x.equipAuthorized));
  if(!context.identity.valid)identityPending++;
  if(!context.skills.confirmed)unknownSkills++;
  scenarios++;
 }
 assert.equal(JSON.stringify(c),source);
}
assert.equal(scenarios,1230);
assert.equal(JSON.stringify(cards),before);
assert.equal(load('web/SCOUT_V69_AUDITORIA.json'),raw);

const eligible=cards.find(c=>{
 const d=adapt(c),x=S.evaluate(d,'posse');
 return x.rankedCandidates.length>=5&&x.recommendations.length>=5&&
  !/pendente|confirmar|desconhecid/i.test(c.id+' '+c.versao)&&
  String(c.habilidades_nativas||'').trim();
});
assert(eligible,'Exige carta íntegra com nativas e cinco opções');
const d=adapt(eligible);
const five=S.evaluate(d,'posse').recommendations.slice(0,5).map(x=>x.name);
assert.equal(five.length,5);
const scenariosByOccupancy=[];
for(const num of [0,1,2,3,4,5]){
 const manual=five.slice(0,num).join(';');
 const record=confirm(d,manual);
 const context=S.verifiedRecommendationContextV288(d,{
  manualEquipped:manual,equipmentRecord:record
 });
 assert.equal(context.skills.confirmed,true);
 assert.equal(context.skills.occupied,num);
 assert.equal(context.skills.remaining,5-num);
 assert.equal(context.options.equippedConfirmed,true);
 assert.equal(context.identity.valid,true);
 const strategic=S.strategicPortfolioV286(d,'posse',B,manual,context.options);
 assert.equal(strategic.slotsConfirmed,true);
 assert.equal(strategic.maxCandidates,5-num);
 assert.equal(strategic.selected.length,5-num);
 assert(strategic.selected.every(s=>!five.slice(0,num).some(n=>S.keyFor(n)===s.key)));
 const board=S.competitiveDecisionBoardV284(d,'posse',B,manual,context.options);
 assert(board.skills.length<=5-num);
 const opinion=S.competitiveQualityLabV285(d,'posse',B,manual,context.options);
 assert(opinion.skillReasons.length<=5-num);
 const council=S.professionalEvidenceCouncilV287(d,'posse',B,null,{
  manualEquipped:manual,equipmentRecord:record,equippedConfirmed:true
 });
 assert.equal(council.evidence.additionalSlots,'DECLARACAO_LOCAL_USUARIO');
 assert.equal(council.skillCouncil.length,5-num);
 scenariosByOccupancy.push({num,free:context.skills.remaining,
  strategic:strategic.selected.length,board:board.skills.length,
  council:council.skillCouncil.length});
}
const manual=five.slice(0,3).join(';'),good=confirm(d,manual);
for(const fake of [
 null,
 {...good,card_id:'CARD_ID_DIFERENTE'},
 {...good,edition:'EDICAO_DIFERENTE'},
 {...good,nativeFingerprint:'NATIVAS_DE_OUTRO_JOGADOR'},
 {...good,fingerprint:'DIGITAL_FORJADA'},
 {...good,confirmed:false},
 {...good,schema:'LEGACY_CONFIRMATION'}
]){
 const x=S.verifiedRecommendationContextV288(d,{
  manualEquipped:manual,equipmentRecord:fake
 });
 assert.equal(x.skills.confirmed,false,'Comprovante inválido não libera slots');
 assert.equal(x.skills.remaining,null);
}
const stale=S.verifiedRecommendationContextV288(
 {...d,native_skills:'nativa removida sem recadastramento'},
 {manualEquipped:manual,equipmentRecord:good}
);
assert.equal(stale.skills.confirmed,false,'Nativas alteradas revogam confirmação');
const messi=cards.find(c=>c.numero===50);
assert(messi&&/pendente/i.test(String(messi.id)));
const pending=adapt(messi);
const idFake=S.verifiedRecommendationContextV288(pending,{
 manualEquipped:'',equipmentRecord:confirm(pending,''),
 boosterRecord:confirmBooster(pending)
});
assert.equal(idFake.identity.valid,false);
assert.equal(idFake.skills.confirmed,false);
assert.equal(idFake.booster.valid,false);
assert.equal(idFake.booster.status,null);
const selectable=cards.find(c=>B.slotStatus(c.impeto_extra)==='selecionavel'&&
 !/pendente|confirmar|invalid|desconhecid/i.test(String(c.id)+' '+String(c.versao)));
assert(selectable);
const bCard=adapt(selectable);
for(const status of ['vazio','ocupado','ausente']){
 const x=S.verifiedRecommendationContextV288(bCard,{
  boosterRecord:confirmBooster(bCard,status)
 });
 assert.equal(x.booster.valid,true);
 assert.equal(x.booster.status,status);
 assert.equal(x.options.verifiedSlot,status);
 if(status==='vazio')declaredEmpty++;
 else declaredUnavailable++;
}
const cross=S.verifiedRecommendationContextV288(bCard,{
 boosterRecord:{...confirmBooster(bCard),edition:'FORJADA'}
});
assert.equal(cross.booster.valid,false);
assert.equal(cross.options.verifiedSlot,null);

const ui=load('web/craque-ficha-individual-v251.js');
assert(ui.includes('verifiedRecommendationContextV288'));
assert(ui.includes('ct288-proof-status'));
assert(ui.includes('const proofOptions=verifiedContext?.options||{}'));
assert(ui.includes('localManual,proofOptions'));
assert(ui.includes('boosterRecord:localBoosterRecord'));
assert(!ui.includes('S.checkedEquipment(editionIdentity,manual,equipmentRecord)'));
const css=load('web/craque-ficha-individual-v251.css');
assert(css.includes('.ct288-proof-status')&&css.includes('.ct288-slot-note'));
assert(load('package.json').includes('test-verified-account-context-v288.cjs'));
assert(load('web/sw.js').includes('v288-proof-context'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v288-account-proof-246x5.json'),
 JSON.stringify({schema:'CRAQUE_V288_ACCOUNT_PROOF_AUDIT',cards:246,scenarios,
 identityPending,unknownSkills,declaredEmpty,declaredUnavailable,
 testCard:{capture:d.capture,edition:d.edition,scenariosByOccupancy},
 note:'Conferência local do usuário não prova performance em jogo nem concede equipamento automático.'},null,2)+'\n');
console.log('V288 PASS: '+scenarios+' cenários sem slots presumidos, '+
 identityPending+' edições pendentes, 6 provas locais de 0–5 slots ocupados, '+
 'registros adversariais rejeitados e 246 cartas intactas.');
