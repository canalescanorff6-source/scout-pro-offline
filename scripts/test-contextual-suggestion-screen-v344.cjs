'use strict';
// V344: triagem da mesma edição em todos os pontos visuais, sem apagar histórico.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const profiles=require('../web/craque-manager-fichas-v324.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cards=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(cards).cards.length,246);
const candidates=[
 {name:'Passe de primeira',why:'Triangulação curta'},
 {name:'Toque duplo',why:'Drible curto'},
 {name:'Condução firme',why:'Controle da bola'},
 {name:'conducao  FIRME',why:'Motivo duplicado'},
 {name:'Passe em profundidade',why:'Infiltração'},
 {name:'Chute de primeira',why:'Finalização'},
 {name:'Interceptação',why:'Recuperação'},
 {name:'Bloqueador',why:'Fechar passe'}
];
const before=JSON.stringify(candidates);
const screen=profiles.screenContextualSuggestions;
const selected=screen(candidates,
 'Passe de primeira; Passe em profundidade','TOQUE DUPLO',
 'Técnica','ausente');
assert.deepEqual(selected.skills.map(x=>x.name),
 ['Condução firme','Chute de primeira','Interceptação','Bloqueador']);
assert.equal(selected.skills[0].why,'Controle da bola','Motivo do motor preservado');
assert.deepEqual(selected.excluded.map(x=>x.reason),
 ['nativa_cadastrada','adicional_informada','repetida_na_proposta',
  'nativa_cadastrada']);
assert.equal(selected.boosterCandidate,null);
assert.equal(selected.theoreticalBooster,'Técnica');
assert.equal(selected.boosterSlot.status,'slot_ausente');
assert.equal(selected.boosterSlot.blocking,true);
assert.equal(selected.nativeInventory,'lista_cadastrada_sem_recibo');
assert.equal(selected.equippedInventory,'lista_informada_sem_recibo');
assert(Object.isFrozen(selected)&&Object.isFrozen(selected.skills)&&
 Object.isFrozen(selected.excluded)&&Object.isFrozen(selected.skills[0]));
assert.equal(JSON.stringify(candidates),before,'Não alterar a proposta original');
const differentRole=screen([{name:'Interceptação',why:'Recuperação'},
 {name:'Toque duplo',why:'Construção'}],'','',
 'Regista','pendente');
assert.deepEqual(differentRole.skills.map(x=>x.name),['Interceptação','Toque duplo']);
assert.equal(differentRole.nativeInventory,'pendente');
assert.equal(differentRole.boosterCandidate,'Regista');
assert.equal(differentRole.theoreticalBooster,null);
assert.equal(differentRole.boosterSlot.gameplayValidated,false);
for(const slot of ['vazio','ocupado','pendente']){
 const value=screen([],[],[],'Técnica',slot);
 assert.equal(value.boosterCandidate,'Técnica','Slots incertos não proibidos por invenção');
 assert.equal(value.boosterSlot.mayEquip,false);
}
const empty=screen([],[],[],'','ausente');
assert.equal(empty.boosterCandidate,null);
assert.equal(empty.theoreticalBooster,null);
assert.equal(empty.boosterSlot.blocking,false);
const max=screen(Array.from({length:16},(_,i)=>({name:'Candidata '+i,why:'Proposta '+i})));
assert.equal(max.skills.length,5);
assert.deepEqual(max.skills.map(x=>x.name),
 ['Candidata 0','Candidata 1','Candidata 2','Candidata 3','Candidata 4']);
const badNames=screen([null,{},'',{name:'Passe de primeira'}],'Passe de primeira');
assert.equal(badNames.skills.length,0);
assert.equal(badNames.excluded.length,4);
const store=new Map(),writes=[];
const storage={getItem:key=>store.get(key)??null,
 setItem:(key,value)=>{writes.push(key);store.set(key,value)}};
const ctx={collection:'outros-elencos',owner:'bruno',cardKey:'original-01',
 cardId:'105297',edition:'Destaque comprovado no teste',manager:'CT-MGR-071',
 position:'MAT',style:'posse',budget:62,sourceSignature:'V344-test'};
const train=[10,5,5,8,8,6,0,0,0,0];
profiles.save(storage,ctx,{train,skills:['Passe de primeira'],booster:'Técnica'});
const history=store.get(profiles.key(ctx)),count=writes.length;
const saved=profiles.read(storage,ctx);
assert.equal(saved.skills[0],'Passe de primeira');
assert.equal(saved.booster,'Técnica');
assert.equal(selected.skills.some(x=>x.name==='Passe de primeira'),false);
assert.equal(store.get(profiles.key(ctx)),history);
assert.equal(writes.length,count,'Filtro de evidência é somente leitura');
const other={...ctx,collection:'minhas-246',owner:'principal',cardKey:'001@105297'};
assert.equal(profiles.read(storage,other),null);
const ui=read('web/craque-positional-ui-v311.js'),css=read('web/craque-positional-v311.css');
assert(ui.includes('const rawRecommendations=recorded?.recommendations||outcome.suggestedSkills||[];'));
assert(ui.includes('const recommendations=screened?.skills||rawRecommendations;'));
assert(ui.includes('const usableCandidate=screened?screened.boosterCandidate:candidate;'));
assert(ui.includes('const equipment=guide?.equipmentSummary?.(savedProfile,recommendations,usableCandidate);'));
assert(ui.includes('const proposedBooster=equipment?equipment.booster:(savedProfile?null:usableCandidate);'));
assert(ui.includes('const proposed=recorded?.recommendations||outcome.suggestedSkills||[];')===false);
assert(ui.includes('const proposed='));
assert(ui.includes('Não mostrar como novas candidatas'));
assert(ui.includes('Ranking teórico sem slot cadastrado'));
assert(ui.includes('screened?.boosterSlot.slot==='ausente'?[]:['));
assert(ui.includes('savedProfile?.booster||\'\''));
assert(css.includes('.ct344-evidence-screen'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),cards);
console.log('V344 PASS: sugestões filtradas em painéis, motor justificativo preservado, slot ausente teórico, legados e 246 cartas intactos.');
