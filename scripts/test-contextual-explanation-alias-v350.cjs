'use strict';
// V350: explicar a habilidade legada somente via alias documentado V162,
// no cenário selecionado, sem emprestar motivo ao booster excluído por prova.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const guide=require('../web/craque-ficha-decision-v327.js');
const profiles=require('../web/craque-manager-fichas-v324.js');
const v162=require('../web/skills-booster-v162.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(catalog).cards.length,246);
const proposed=[{name:'Passe de primeira',why:'Tabelas e apoio no MAT em posse.',
 synergies:['MAT','Posse de Bola']},
 {name:'Toque duplo',why:'Condução curta em SA.',
  synergies:['SA']},
 {name:'Skill desconhecida',why:'Nome exato'}];
const original=JSON.stringify(proposed);
const saved={skills:['One-touch Pass','Double Touch','Skill desconhecida'],
 booster:'Técnica'};
const summary=guide.equipmentSummary(saved,[],'Força');
const rank=profiles.reviewBoosterRanking(
 {name:'Técnica',reason:'Motivo teórico do ímpeto fixo'},[
  {name:'Força',reason:'Hipótese após triagem por edição'},
  {name:'Regista',reason:'Outro cenário'}],
 'Técnica','Regista','ocupado');
assert.equal(rank.primary,'Força');
const current={primary:rank.primaryInfo,alternatives:rank.alternatives};
const explanation=guide.explainEquipment(summary,proposed,current,v162.keyFor);
assert.equal(explanation.mode,'rascunho_independente');
assert.deepEqual(explanation.skills.map(x=>x.name),saved.skills);
assert.equal(explanation.skills[0].reason,'Tabelas e apoio no MAT em posse.');
assert.equal(explanation.skills[0].matchedBy,'alias_v162_documentado');
assert.match(explanation.skills[0].source,/não prova da build salva/);
assert.equal(explanation.skills[1].reason,'Condução curta em SA.');
assert.equal(explanation.skills[1].matchedBy,'alias_v162_documentado');
assert.equal(explanation.skills[2].reason,'Nome exato');
assert.equal(explanation.skills[2].matchedBy,'grafia_normalizada');
assert.equal(explanation.booster.status,'motivo_pendente');
assert.match(explanation.booster.reason,/Sem justificativa individual/);
const literalFirst=guide.explainEquipment(
 guide.equipmentSummary({skills:['One-touch Pass'],booster:'Força'}),
 [{name:'Passe de primeira',why:'Alias do mesmo cenário'},
  {name:'One-touch Pass',why:'Motivo literal tem prioridade'}],
 current,v162.keyFor);
assert.equal(literalFirst.skills[0].reason,'Motivo literal tem prioridade');
assert.equal(literalFirst.skills[0].matchedBy,'grafia_normalizada');
assert.equal(literalFirst.booster.reason,'Hipótese após triagem por edição');
const withoutAlias=guide.explainEquipment(summary,proposed,current);
assert.equal(withoutAlias.skills[0].status,'motivo_pendente',
 'Sem dicionário, nunca inventar equivalência PT-BR/EN');
assert.equal(withoutAlias.skills[1].status,'motivo_pendente');
const unknown=guide.explainEquipment(
 guide.equipmentSummary({skills:['Unknown Variant X'],booster:''}),
 [{name:'Unknown Variant Y',why:'Não herdar esta explicação'}],null,v162.keyFor);
assert.equal(unknown.skills[0].status,'motivo_pendente');
assert.equal(unknown.skills[0].matchedBy,'pendente');
const roleMAT=guide.explainEquipment(
 guide.equipmentSummary({skills:['One-touch Pass'],booster:''}),
 [{name:'Passe de primeira',why:'Motivo MAT'}],null,v162.keyFor);
const roleSA=guide.explainEquipment(
 guide.equipmentSummary({skills:['One-touch Pass'],booster:''}),
 [{name:'Passe de primeira',why:'Motivo SA'}],null,v162.keyFor);
assert.equal(roleMAT.skills[0].reason,'Motivo MAT');
assert.equal(roleSA.skills[0].reason,'Motivo SA',
 'Cada chamada precisa conservar o contexto ativo, sem reutilizar motivos de outra posição');
assert(Object.isFrozen(explanation)&&Object.isFrozen(explanation.skills)&&
 Object.isFrozen(explanation.skills[0]));
assert.equal(JSON.stringify(proposed),original,'Explicação não pode mutar o motor');
const data=new Map(),writes=[];
const store={getItem:k=>data.get(k)??null,setItem:(k,v)=>{writes.push(k);data.set(k,v)}};
const base={owner:'usuário',cardKey:'v350',cardId:'105297',edition:'edição comprovada',
 position:'MAT',style:'posse',manager:'CT-MGR-071',budget:62,sourceSignature:'v350-proof'};
const a={...base,collection:'minhas-246'},b={...base,collection:'outros-elencos'};
const train=[10,5,5,8,8,6,0,0,0,0];
profiles.save(store,a,{train,skills:['One-touch Pass'],booster:'Técnica',source:'Histórico V350'});
const before=store.getItem(profiles.key(a)),count=writes.length;
const historical=profiles.read(store,a);
const e=guide.explainEquipment(guide.equipmentSummary(historical),proposed,current,v162.keyFor);
assert.equal(e.skills[0].reason,'Tabelas e apoio no MAT em posse.');
assert.equal(e.booster.status,'motivo_pendente');
assert.equal(profiles.read(store,b),null);
assert.equal(writes.length,count);
assert.equal(store.getItem(profiles.key(a)),before);
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('primary:boosterReview.primaryInfo'));
assert(ui.includes('alternatives:boosterReview.alternatives'));
assert(ui.includes('guide.explainEquipment(equipment,recommendations,rankingForWhy,skillKeyFor)'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V350 PASS: alias V162 documentado nas explicações, motivos por posição, ímpetos excluídos sem justificativa fictícia, histórico e 246 cartas intactos.');
