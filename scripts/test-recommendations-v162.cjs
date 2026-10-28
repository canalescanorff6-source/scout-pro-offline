'use strict';
/* V162: 246 fichas x 3 táticas, sem duplicar habilidades ou inventar ímpetos. */
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const base=path.resolve(__dirname,'../web');
const E=require(path.join(base,'skills-booster-v162.js'));
const B=require(path.join(base,'booster-engine-v103.js'));
const data=JSON.parse(fs.readFileSync(path.join(base,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
assert.strictEqual(data.length,246,'Preservar todas as 246 cartas');
assert.strictEqual(new Set(data.map(x=>x.numero)).size,246,'Nenhum número de carta duplicado');
let inspected=0, boostEligible=0, unknownNative=0, haveRecommendations=0, fewerThanFive=0;
for(const c of data){
 const d={capture:c.numero,id:c.id,shown_position:c.posicao,attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,
  native_skills:c.habilidades_nativas,additional_candidates:c.adicionais_candidatas,boost1:c.impeto_fixo,boost2:c.impeto_extra};
 for(const tactic of ['posse','normal','rapido']){
  const rec=E.evaluate(d,tactic);
  assert(rec.role,'Posição mapeada na carta '+c.numero);
  assert(rec.recommendations.length>0&&rec.recommendations.length<=5,'Até 5 habilidades '+c.numero);
  const ids=rec.recommendations.map(s=>s.key);
  assert.strictEqual(new Set(ids).size,ids.length,'Sem duplicações na carta '+c.numero);
  const native=new Set(String(c.habilidades_nativas||'').split(';').map(E.keyFor).filter(Boolean));
  for(const k of ids)assert(!native.has(k),'Habilidade nativa repetida '+c.numero+': '+k);
  for(const skill of rec.recommendations)assert(E.SKILLS[skill.key],'Habilidade fora da lista de treino regular');
  const booster=E.booster(d,tactic,B);
  if(booster.able){
   assert(booster.primary&&B.CRAFTABLE.includes(booster.primary.nome),'Ímpeto selecionável '+c.numero);
   assert.notStrictEqual(booster.primary.nome.toLowerCase(),String(c.impeto_fixo||'').replace(/\s*\+\d+.*/,'').trim().toLowerCase(),'Não repetir o ímpeto nativo');
   if(tactic==='posse')boostEligible++;
  }else {assert(booster.primary&&B.CRAFTABLE.includes(booster.primary.nome),'O ranking consultivo deve existir mesmo quando o slot não foi confirmado: '+c.numero);assert.notEqual(booster.equipStatus,'condicionado_a_slot');}
  inspected++;if(tactic==='posse'){haveRecommendations++;if(!rec.nativeKnown)unknownNative++;if(rec.recommendations.length<5)fewerThanFive++;}
 }
}
assert.strictEqual(inspected,738);
assert.strictEqual(haveRecommendations,246);
assert.strictEqual(boostEligible,0,'Sem confirmação manual, nenhuma das 246 cartas deve ser marcada como equipável');
const confirmed={shown_position:'CA',boost2:'SLOT SELECIONÁVEL +1',boost1:'Physicality +3'};
assert.strictEqual(E.booster(confirmed,'posse',B,'vazio').able,true,'Slot confirmado vazio é elegível');
assert.strictEqual(E.booster(confirmed,'posse',B,'ocupado').able,false,'Slot ocupado não é elegível');
const check=E.evaluate({shown_position:'CA',native_skills:'One Touch Pass; First Time Shot; Double Touch'},'posse','Passe em profundidade; Controle com a sola');
for(const name of ['onepass','firstshot','double','through','sole'])assert(!check.recommendations.some(x=>x.key===name),'Não repetir habilidade já equipada: '+name);
const baseSkills=E.evaluate({shown_position:'CA',native_skills:'Heading'},'posse');
const withFinishing=E.evaluate({shown_position:'CA',native_skills:'Heading; First-time Shot'},'posse');
const points=(row,key)=>row.recommendations.concat(row.alternatives).find(x=>x.key===key)?.score??null;
assert(points(withFinishing,'through')>points(baseSkills,'through'),'Finalização de primeira registrada altera critério consultivo de passe');
assert(withFinishing.synergyDetected,'Informar que há complementaridade documental');
assert(withFinishing.recommendations.every(x=>Array.isArray(x.synergies)),'Mostrar origem das heurísticas');
const duplicateManual=E.evaluate({shown_position:'CA',native_skills:'Heading'},'posse',
 'Passe de primeira; One-touch Pass; Cabeceio');
assert.equal(duplicateManual.alreadyEquippedProvided,1,'Aliases repetidos contam uma única adicional');
assert.equal(duplicateManual.nativeManualConflicts.length,1,'Cabeceio não pode contar como adicional quando Heading é nativa');
assert(duplicateManual.missing.some(x=>x.includes('nativas')),'Conflito precisa gerar aviso');
const overFilled=E.evaluate({shown_position:'CA',native_skills:'Heading'},'posse',
 'Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Toque de calcanhar; Interceptação');
assert.equal(overFilled.alreadyEquippedProvided,5);
assert.equal(overFilled.manualReportedCount,6);
assert.equal(overFilled.manualOverLimit,true,'Alertar cadastro com mais de 5 adicionais');
assert.strictEqual(E.keyFor('Passe de primeira'),E.keyFor('One-touch Pass'),'Aliases PT-BR/EN');
assert.strictEqual(E.keyFor('Finalização de primeira'),E.keyFor('First-time Shot'),'Aliases variantes');
const unknownSlot=E.booster({shown_position:'CA',boost2:'PENDENTE',boost1:'Physicality +3'},'posse',B);
assert(unknownSlot.primary,'Ranking de posse deve sempre informar a primeira escolha');
assert.equal(unknownSlot.able,false,'Recomendação consultiva não confere slot');
assert.equal(unknownSlot.equipStatus,'slot_nao_documentado',
 'V261: slot pendente no catálogo deve ficar sem autorização, mesmo quando alguém o declarar vazio');
assert.equal(E.booster({shown_position:'CA',boost2:'PENDENTE',boost1:'Physicality +3'},'posse',B,'vazio').able,false,
 'Conferência local não cria segundo slot em edição sem comprovação no catálogo');
const bridge=fs.readFileSync(path.join(base,'app-bridge.js'),'utf8');
assert(bridge.includes('skills-booster-v162.js')&&bridge.includes('booster-engine-v103.js'),'Recomendador precisa aparecer em todas as fichas');
console.log('PASSOU V162: '+inspected+' avaliações, '+haveRecommendations+' cartas, '+boostEligible+' slots aptos sem confirmação (ranking consultivo preservado), '+unknownNative+' cartas com habilidades nativas pendentes, '+fewerThanFive+' com menos de 5 novas habilidades elegíveis.');
