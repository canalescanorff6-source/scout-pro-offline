'use strict';
// V345: o dicionário de aliases V162 é a única fonte para equivalências.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const profiles=require('../web/craque-manager-fichas-v324.js');
const skills=require('../web/skills-booster-v162.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cards=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(cards).cards.length,246);
const key=skills.keyFor;
assert.equal(typeof key,'function');
assert.equal(key('Passe de primeira'),'onepass');
assert.equal(key('One-touch Pass'),'onepass');
assert.equal(key('Double Touch'),'double');
assert.equal(key('Toque duplo'),'double');
assert.equal(key('Through Passing'),'through');
assert.equal(key('Passe em profundidade'),'through');
assert.equal(profiles.skillEvidenceKey('One-touch Pass',key),
 profiles.skillEvidenceKey('Passe de primeira',key));
assert.notEqual(profiles.skillEvidenceKey('Habilidade desconhecida X',key),
 profiles.skillEvidenceKey('Habilidade desconhecida Y',key),
 'Nomes desconhecidos devem continuar distintos sem tradução inventada.');
assert.equal(profiles.skillEvidenceKey('Condução Firme',null),
 profiles.skillEvidenceKey('conducao firme',null));
const list=[
 {name:'Passe de primeira',why:'Passe curto'},
 {name:'Toque duplo',why:'Giro controlado'},
 {name:'Passe em profundidade',why:'Infiltração'},
 {name:'Interceptação',why:'Recuperação'},
 {name:'Chute de primeira',why:'Finalização'}];
const untouched=JSON.stringify(list);
const ranked=profiles.screenContextualSuggestions(list,
 'One-touch Pass\nThrough Passing','Double Touch','Técnica','ausente',key);
assert.deepEqual(ranked.skills.map(x=>x.name),['Interceptação','Chute de primeira']);
assert.deepEqual(ranked.excluded.map(x=>x.reason),
 ['nativa_cadastrada','adicional_informada','nativa_cadastrada']);
assert.equal(ranked.skills[0].why,'Recuperação');
assert.equal(ranked.boosterCandidate,null);
assert.equal(JSON.stringify(list),untouched);
const defaultLiteral=profiles.screenContextualSuggestions(list,'One-touch Pass',
 'Double Touch','','pendente');
assert(defaultLiteral.skills.some(x=>x.name==='Passe de primeira'),
 'Sem dicionário, equivalência não documentada nunca deve ser presumida.');
const suggestions=profiles.reviewSkillCandidates(
 ['One-touch Pass'],['Passe de primeira','Chute de primeira','Toque duplo'],
 '','Double Touch',key);
assert.deepEqual(suggestions.map(x=>x.name),['One-touch Pass','Chute de primeira']);
assert.equal(suggestions[0].saved,true,'Histórico não deve desaparecer na triagem');
const audit=profiles.auditEquipmentSelection(
 ['Passe de primeira','Toque duplo'],'','One-touch Pass\nThrough Passing',
 'Double Touch','','pendente',key);
assert.deepEqual(audit.conflicts.map(x=>x.name),['Passe de primeira','Toque duplo']);
assert.equal(audit.conflicts[0].sources[0],'nativa_cadastrada');
assert.equal(audit.conflicts[1].sources[0],'adicional_informada');
const train=[10,5,5,8,8,6,0,0,0,0];
const ready=profiles.reviewDraftReadiness({train,budget:62,
 skills:['One-touch Pass','Passe de primeira'],booster:'',skillKeyFor:key});
assert.equal(ready.canSave,false);
assert(ready.issues.some(x=>x.includes('equivalentes')));
const conflict=profiles.reviewDraftReadiness({train,budget:62,
 skills:['Passe de primeira'],native:'One-touch Pass',skillKeyFor:key});
assert.equal(conflict.canSave,false);
assert(conflict.audit.hasSkillConflict);
const independent=profiles.reviewDraftReadiness({train,budget:62,
 skills:['Passe de primeira'],native:'One-touch Pass'});
assert.equal(independent.canSave,true,
 'Fallback textual sem prova de alias deve permanecer conservador.');
const data=new Map(),writes=[];
const store={getItem:k=>data.has(k)?data.get(k):null,
 setItem:(k,v)=>{writes.push(k);data.set(k,v)}};
const ctx={collection:'outros-elencos',owner:'bruno',cardKey:'external-v345',
 cardId:'105297',edition:'Edição de teste',manager:'CT-MGR-071',
 position:'MAT',style:'posse',budget:62,sourceSignature:'v345-current'};
profiles.save(store,ctx,{train,skills:['One-touch Pass','Passe de primeira'],
 booster:'',source:'Registro anterior antes do dicionário'});
const previous=data.get(profiles.key(ctx)),count=writes.length;
assert.deepEqual(profiles.read(store,ctx).skills,
 ['One-touch Pass','Passe de primeira'],'Legado com aliases não deve ficar ilegível');
assert.throws(()=>profiles.save(store,ctx,{train,
 skills:['One-touch Pass','Passe de primeira'],skillKeyFor:key}),/equivalentes/);
assert.equal(data.get(profiles.key(ctx)),previous,'Não reescrever histórico após bloqueio');
assert.equal(writes.length,count);
const personal={...ctx,collection:'minhas-246',owner:'principal',
 cardKey:'001@105297'};
assert.equal(profiles.read(store,personal),null);
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes("const skillKeyFor=host.SCOUT_RECOMMENDATIONS_V162?.keyFor||null;"));
assert(ui.includes('model.boosterSlot||\'pendente\',\n   skillKeyFor);'));
assert(ui.includes('model.nativeSkills||\'\',model.skills||\'\',skillKeyFor);'));
assert(ui.includes('boosterSlot:model.boosterSlot||\'pendente\',skillKeyFor'));
assert(ui.includes('booster:selectBooster.value,source:\'Revisão manual da ficha contextual V324\',\n       skillKeyFor}'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),cards);
console.log('V345 PASS: aliases V162 PT-BR/EN, listas multilinha, mesmo Card ID e posição, bloqueios em novas revisões, histórico e 246 cartas intactos.');
