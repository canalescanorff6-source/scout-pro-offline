'use strict';
// V347: cinco adicionais são limite do jogo, não prova de vagas reais.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const profiles=require('../web/craque-manager-fichas-v324.js');
const v162=require('../web/skills-booster-v162.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const catalog=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(catalog).cards.length,246);
const k=v162.keyFor;
const unreported=profiles.reviewAdditionalCapacity('',[
 'Passe de primeira','Toque duplo'],k);
assert.equal(unreported.status,'pendente');
assert.equal(unreported.informedCount,null);
assert.equal(unreported.maxUnverifiedAdditional,null,
 'Sem inventário, jamais mostrar cinco vagas disponíveis');
assert.equal(unreported.minReplacementsIfAllProposed,null);
const full=profiles.reviewAdditionalCapacity(
 'One-touch Pass; Double Touch; Through Passing; Interceptação; Bloqueador',
 ['Passe de primeira','Chute de primeira','Toque duplo','Condução firme'],k);
assert.equal(full.status,'informado_sem_recibo');
assert.equal(full.informedCount,5);
assert.equal(full.maxUnverifiedAdditional,0);
assert.equal(full.proposedNewCount,2);
assert.equal(full.minReplacementsIfAllProposed,2,
 'Novas sugestões seriam alternativas de substituição');
const partial=profiles.reviewAdditionalCapacity(
 'One-touch Pass\nDouble Touch\nInterceptação',
 [{name:'Passe de primeira'}, {name:'Bloqueador'}, {name:'Chute de primeira'}, {name:'Passe em profundidade'}],k);
assert.equal(partial.informedCount,3);
assert.equal(partial.maxUnverifiedAdditional,2);
assert.equal(partial.proposedNewCount,3);
assert.equal(partial.minReplacementsIfAllProposed,1);
const duplicate=profiles.reviewAdditionalCapacity(
 'One-touch Pass;Passe de primeira;Toque duplo',[],k);
assert.equal(duplicate.status,'revisar_cadastro');
assert.equal(duplicate.duplicateEntries,1);
assert.equal(duplicate.informedCount,2);
const over=profiles.reviewAdditionalCapacity(
 'Um;Dois;Três;Quatro;Cinco;Seis',['Sete'],k);
assert.equal(over.status,'revisar_cadastro');
assert.equal(over.maxUnverifiedAdditional,0);
const suggested=profiles.screenContextualSuggestions([
 {name:'Passe de primeira',why:'Nativa ou adicional conhecida'},
 {name:'Chute de primeira',why:'Finalização contextual'},
 {name:'Passe em profundidade',why:'Distribuição'}],
 '', 'One-touch Pass;Double Touch;Through Passing;Interceptação;Bloqueador',
 '', 'pendente', k);
assert.deepEqual(suggested.skills.map(x=>x.name),['Chute de primeira']);
assert.equal(suggested.additionalCapacity.informedCount,5);
assert.equal(suggested.additionalCapacity.minReplacementsIfAllProposed,1);
const plan=[10,5,5,8,8,6,0,0,0,0];
const ready=profiles.reviewDraftReadiness({
 train:plan,budget:62,skills:['Chute de primeira'],
 equipped:'One-touch Pass;Double Touch;Through Passing;Interceptação;Bloqueador',
 boosterSlot:'pendente',skillKeyFor:k
});
assert.equal(ready.canSave,true,'Ficha alternativa pode continuar como proposta consultiva');
assert.equal(ready.capacity.minReplacementsIfAllProposed,1);
assert(ready.advisories.some(x=>x.includes('substituir ao menos 1')));
const db=new Map(),writes=[];
const store={getItem:x=>db.get(x)??null,setItem:(x,v)=>{writes.push(x);db.set(x,v)}};
const base={owner:'user',cardKey:'id-105297',cardId:'105297',edition:'versão teste',
 position:'MAT',style:'posse',manager:'CT-MGR-071',budget:62,
 sourceSignature:'v347-evidence'};
const a={...base,collection:'minhas-246'},b={...base,collection:'outros-elencos'};
const save1=profiles.save(store,a,{train:plan,skills:['Chute de primeira'],
 equipped:'One-touch Pass;Double Touch;Through Passing;Interceptação;Bloqueador',
 boosterSlot:'pendente',skillKeyFor:k});
assert.equal(save1.status,'proposta_consultiva');
assert.equal(profiles.read(store,b),null,'Acervos não compartilham revisões');
const save2=profiles.save(store,b,{train:plan,skills:['Condução firme'],booster:''});
assert.equal(save2.status,'proposta_consultiva');
assert.equal(profiles.read(store,a).skills[0],'Chute de primeira');
const before=JSON.stringify([...db]),count=writes.length;
profiles.reviewAdditionalCapacity('','',k);
assert.equal(JSON.stringify([...db]),before);
assert.equal(writes.length,count,'Auditoria de capacidade não grava registros');
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('screened?.additionalCapacity'));
assert(ui.includes('ALTERNATIVAS DE SUBSTITUIÇÃO'));
assert(ui.includes('ct347-capacity-note'));
assert(read('web/craque-positional-v311.css').includes('.ct347-capacity-note'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),catalog);
console.log('V347 PASS: cinco adicionais por inventário, aliases V162, limites não comprovados, propostas de substituição, 246 cartas e acervos isolados.');
