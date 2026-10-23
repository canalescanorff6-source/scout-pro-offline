'use strict';
// V336: explicações consultivas sem atribuir falsos vídeos, slots ou equipamentos.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const guide=require('../web/craque-ficha-decision-v327.js');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const proposed=guide.equipmentSummary(null,[
 {name:'Passe de primeira',why:'Passes curtos e tabelas.',synergies:['Posse de Bola','MAT']},
 {name:'Passe em profundidade',why:'Opção de infiltração central.'}
],'Técnica');
const explain=guide.explainEquipment(proposed,[
 {name:'PASSE DE PRIMEIRA',why:'Passes curtos e tabelas.',synergies:['Posse de Bola','MAT']},
 {name:'Passe em profundidade',why:'Opção de infiltração central.'}
],{primary:{nome:'Técnica',motivo:'Alternativa calculada para o cenário.'}});
assert.equal(explain.mode,'proposta_contextual');
assert.equal(explain.skills.length,2);
assert.equal(explain.skills[0].name,'Passe de primeira');
assert.equal(explain.skills[0].reason,'Passes curtos e tabelas.');
assert.deepEqual([...explain.skills[0].synergies],['Posse de Bola','MAT']);
assert.equal(explain.skills[0].status,'racional_do_motor');
assert.equal(explain.booster.name,'Técnica');
assert.equal(explain.booster.reason,'Alternativa calculada para o cenário.');
assert(explain.warning.includes('não validação em gameplay'));
const saved=guide.equipmentSummary({
 skills:['Passe de primeira','Skill salva sem fonte'],booster:'Regista'
},[{name:'Outra',why:'Outro cenário'}],'Técnica');
const savedExplain=guide.explainEquipment(saved,[
 {name:'Passe de primeira',why:'Motivo da proposta atual'}
],{primary:{name:'Técnica',reason:'Não corresponde ao ímpeto salvo'},
 alternatives:[{name:'Regista',reason:'Complementaridade calculada no ranking'}]});
assert.equal(savedExplain.mode,'rascunho_independente');
assert.equal(savedExplain.skills[0].reason,'Motivo da proposta atual');
assert.equal(savedExplain.skills[1].status,'motivo_pendente');
assert.match(savedExplain.skills[1].reason,/Sem justificativa individual/);
assert.equal(savedExplain.booster.reason,'Complementaridade calculada no ranking');
assert.equal(savedExplain.booster.status,'racional_do_motor');
const unknownBooster=guide.explainEquipment(
 guide.equipmentSummary({skills:[],booster:'Ímpeto escolhido fora da lista'},[],'Técnica'),
 [],{primary:{nome:'Técnica',motivo:'Não serve de motivo para outro ímpeto'}});
assert.equal(unknownBooster.skills.length,0);
assert.equal(unknownBooster.booster.status,'motivo_pendente');
assert.match(unknownBooster.booster.reason,/Sem justificativa individual/);
const blank=guide.explainEquipment(guide.equipmentSummary({skills:[],booster:''}));
assert.equal(blank.skills.length,0);
assert.equal(blank.booster.status,'sem_selecao');
assert.match(blank.booster.reason,/Nenhum ímpeto/);
assert(Object.isFrozen(blank)&&Object.isFrozen(blank.booster));
assert(Object.isFrozen(explain.skills[0].synergies));
assert.throws(()=>guide.explainEquipment({skills:['item']}),/Resumo contextual/);
const ui=read('web/craque-positional-ui-v311.js');
const css=read('web/craque-positional-v311.css');
assert(ui.includes("el('details','ct336-equipment-evidence')"));
assert(ui.includes("Por que estas habilidades e ímpeto?"));
assert(ui.includes("recorded?.boosterRanking||outcome.booster||null"),
 'Explicação do ímpeto deve vir do cenário atual ou revisão vigente');
assert(ui.includes('guide.explainEquipment(equipment,recommendations,rankingForWhy)'));
assert(!ui.includes("explanation.open=true"),'Justificativas iniciam recolhidas');
assert(css.includes('ct336-equipment-evidence>summary:focus-visible'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
assert.equal(JSON.parse(original).cards.length,246);
console.log('V336 PASS: razões por skill/ímpeto, sem origem inventada; seleções sem evidência ficam pendentes; 246 cartas intactas.');
