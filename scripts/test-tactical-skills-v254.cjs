'use strict';
/* V254 — skills equipadas conferidas por edição, cinco vagas reais e
 * ímpetos por estilo com traduções previamente documentadas.
 * Nenhum número de carta, Card ID, foto ou build é modificado. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(catalog).cards;
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>String(c.numero)+'@'+String(c.id))).size,246);
const snapshot=JSON.stringify(cards);
const goal=['posse','normal','rapido','fora','longo'];
assert.deepEqual(B.tactics,goal);
assert.deepEqual(goal.map(x=>B.TACTIC_LABEL[x]),[
 'Posse de Bola','Contra-Ataque Normal','Contra-Ataque Rápido','Por Fora','Passe Longo'
]);
const fake={capture:991,id:'990000991',edition:'EPIC-TESTE-991',shown_position:'MO',
 native_skills:'Passe de primeira',attack_style:'Armador criativo'};
assert.equal(S.fingerprint('Passe de primeira; One Touch Pass'),'onepass');
assert.equal(S.fingerprint('One Touch Pass; Passe de primeira'),'onepass');
const full=['Toque duplo','Controle com a sola','Passe em profundidade',
 'Espírito guerreiro','Passe na medida'].join('; ');
const proof={
 schema:'CRAQUE_ADDITIONAL_V254',capture:991,card_id:fake.id,edition:fake.edition,
 nativeFingerprint:S.fingerprint(fake.native_skills),
 confirmed:true,fingerprint:S.fingerprint(full)
};
assert(S.checkedEquipment(fake,full,proof));
assert(!S.checkedEquipment({...fake,id:'TESTE_ID_EDICAO_991'},full,proof),
 'Identificador textual de teste não equivale ao Card ID numérico da edição');
assert(!S.checkedEquipment({...fake,id:'OUTRO_CARD_ID'},full,proof),
 'Não transferir confirmação entre versões homônimas');
assert(!S.checkedEquipment({...fake,capture:992},full,proof));
assert(!S.checkedEquipment(fake,full+'; Bloqueador',proof),
 'Editar a lista invalida confirmação antiga');
assert(!S.checkedEquipment(fake,full,{...proof,confirmed:false}));
assert(!S.checkedEquipment(fake,full,{...proof,fingerprint:'fraude'}));
assert(!S.checkedEquipment(fake,full,{...proof,edition:undefined}));
assert(!S.checkedEquipment(fake,full,{...proof,nativeFingerprint:undefined}));
const partial=S.evaluate(fake,'posse',full);
assert.equal(partial.equippedConfirmed,false);
assert.equal(partial.slotsRemaining,null,'Lista não marcada como completa não comprova vagas');
assert(partial.recommendations.length>0);
const complete=S.evaluate(fake,'posse',full,{equippedConfirmed:true});
assert.equal(complete.equippedConfirmed,true);
assert.equal(complete.alreadyEquippedProvided,5);
assert.equal(complete.slotsRemaining,0);
assert.equal(complete.recommendations.length,0,
 'Com cinco adicionais conferidas não pode sugerir sexta habilidade aplicável');
assert(complete.alternatives.length>0,'Comparação ainda disponível, não para equipar');
const withNative=S.evaluate(fake,'posse',
 'One Touch Pass; Passe de primeira; Toque duplo; Interceptação',
 {equippedConfirmed:true});
assert.equal(withNative.alreadyEquippedProvided,2,
 'Habilidade nativa e alias duplicados não ocupam dois slots');
// V272 reforça a segurança: o usuário declarou uma habilidade nativa na
// lista de adicionais. Não deduzir vaga livre até reconciliar essa lista.
assert.equal(withNative.requiresReconciliation,true);
assert.equal(withNative.equippedConfirmed,false);
assert.equal(withNative.slotsRemaining,null);
assert(withNative.recommendations.length<=5);
assert(!withNative.recommendations.some(x=>['onepass','double','intercept'].includes(x.key)));
const excess=S.evaluate(fake,'normal',
 full+'; Interceptação',{equippedConfirmed:true});
assert.equal(excess.manualOverLimit,true);
assert.equal(excess.slotsRemaining,null);
assert.equal(excess.recommendations.length,0,
 'Mais de cinco adicionais não representa espaço liberado para equipar');
for(const mode of goal){
 const optimistic=S.evaluate(fake,mode,'',{equippedConfirmed:true});
 assert.equal(optimistic.slotsRemaining,5);
 assert(optimistic.recommendations.length>0&&optimistic.recommendations.length<=5);
 const unknown=S.evaluate(fake,mode,'');
 assert.equal(unknown.slotsRemaining,null);
}
assert.equal(B.displayName("Striker's Instinct"),'Instinto Artilheiro');
assert.equal(B.displayName('Physicality'),'Fisicalidade');
assert.equal(B.displayName('Technique'),'Técnica');
assert.equal(B.displayName('Passing'),'Passe');
assert.equal(B.translationKnown('Saving'),false,
 'Não inventar traduções Konami quando não documentadas');
assert.equal(B.displayName('Saving'),'Saving');
assert.equal(B.displayName('não-cadastrado'),'não-cadastrado');
let assessed=0;
for(const card of cards){
 const d={capture:card.numero,id:card.id,shown_position:card.posicao,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,pp:card.pp,
  training_provisional:card.treino_proposto_nao_validado===true,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,
  recommended_levels:card.niveis};
 for(const mode of goal){
  const info=S.evaluate(d,mode);
  assert.equal(info.slotsRemaining,null);
  assert.equal(info.equippedConfirmed,false);
  assert(info.recommendations.length<=5);
  const boosters=B.rank(card,mode);
  assert(boosters.length>0);
  assert(boosters[0].motivo.includes('em '+B.TACTIC_LABEL[mode]),
   'Justificativa tática errada para '+card.numero+' '+mode);
  assert(boosters.every(x=>x.nome_pt===B.displayName(x.nome)&&
   x.traducao_documentada===B.translationKnown(x.nome)));
  const ranked=S.booster(d,mode,B);
  assert.equal(ranked.primary?.nome,boosters[0]?.nome);
  assert.equal(ranked.primary?.nome_pt,boosters[0]?.nome_pt);
  assessed++;
 }
}
assert.equal(assessed,1230);
const ui=read('web/skills-booster-v162.js');
const unified=read('web/scout-card-unified-v220.js');
const sw=read('web/sw.js');
assert(ui.includes('id="v254-confirm-equipped"'));
assert(ui.includes("schema:'CRAQUE_ADDITIONAL_V254'"));
assert(ui.includes('confirmed:true,fingerprint:fingerprint(proposedText)'));
assert(ui.includes("host.dispatchEvent(new CustomEvent('craque:data-changed'"));
assert(unified.includes('R.verifiedRecommendationContextV288?.('),
 'A ficha usa a prova unificada que valida lista, nativas e identidade');
assert(unified.includes('equipmentRecord:manualProof,boosterRecord:slot'));
assert(unified.includes('remaining=skills.slotsRemaining'));
assert(unified.includes("'Slots não conferidos'"));
assert(unified.includes('booster.primary.nome_pt||booster.primary.nome'));
assert(sw.includes('v254-skill-slot-tactics'),
 'PWA deve trocar cache para ter paridade Windows/Android');
assert(read('package.json').includes('test-tactical-skills-v254.cjs'));
assert.equal(JSON.stringify(cards),snapshot);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V254 OK: '+assessed+' combinações (246 cartas × 5 estilos), slots com conferência explícita e PP originais preservados.');
console.log('V254 OK: justificativas por estilo correto; ímpetos PT-BR apenas quando tradução documentada.');
