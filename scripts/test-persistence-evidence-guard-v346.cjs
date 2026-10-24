'use strict';
// V346: a validação de nativas, adicionais e slots vale também ao GRAVAR,
// inclusive se outro chamador contornar a interface. Nenhum legado é alterado.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const profiles=require('../web/craque-manager-fichas-v324.js');
const v162=require('../web/skills-booster-v162.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(raw).cards.length,246);
const train=[10,5,5,8,8,6,0,0,0,0];
const db=new Map(),writes=[];
const store={getItem:k=>db.get(k)??null,
 setItem:(k,v)=>{writes.push(k);db.set(k,v);}};
const external={collection:'outros-elencos',owner:'exemplo',
 cardKey:'externo-v346',cardId:'105297',edition:'Edição de teste',
 manager:'CT-MGR-071',position:'MAT',style:'posse',
 budget:62,sourceSignature:'v346-documental'};
const own={...external,collection:'minhas-246',owner:'principal',
 cardKey:'001@105297'};
const legacy=profiles.save(store,external,{train,
 skills:['One-touch Pass'],booster:'Técnica',
 source:'Histórico anterior sem recibo'});
assert.equal(legacy.revision,1);
const prior=db.get(profiles.key(external)),originalWrites=writes.length;
function blocked(args,reason){
 assert.throws(()=>profiles.save(store,external,{train,...args}),
  reason);
 assert.equal(db.get(profiles.key(external)),prior,
  'A rejeição não pode reescrever o histórico');
 assert.equal(writes.length,originalWrites,
  'Validação é anterior a qualquer escrita');
}
blocked({skills:['Passe de primeira'],booster:'',
 native:'One-touch Pass',skillKeyFor:v162.keyFor},
 /Gravação bloqueada.*Habilidade já consta/);
blocked({skills:['Toque duplo'],booster:'',
 equipped:'Double Touch',skillKeyFor:v162.keyFor},
 /Gravação bloqueada.*Habilidade já consta/);
blocked({skills:[],booster:'Técnica',boosterSlot:'ausente',
 skillKeyFor:v162.keyFor},
 /Gravação bloqueada.*SEM slot adicional/);
assert.equal(profiles.read(store,external).booster,'Técnica',
 'Ímpeto antigo continua visível, sem reaprovação implícita');
assert.equal(profiles.read(store,own),null,
 'Outra coleção com mesmo Card ID deve permanecer isolada');
const valid=profiles.save(store,external,{train,skills:['Interceptação'],
 booster:'',native:'One-touch Pass',equipped:'Double Touch',
 boosterSlot:'ausente',skillKeyFor:v162.keyFor});
assert.equal(valid.revision,2,
 'Com ímpeto removido e skill não conflitante, permitir nova revisão');
assert.equal(profiles.readAll(store,external).length,2);
assert.equal(profiles.readAll(store,external)[0].booster,'Técnica',
 'A nova revisão não remove dados do histórico');
const ownRow=profiles.save(store,own,{train,skills:['Passe de primeira'],
 native:'',equipped:'',boosterSlot:'pendente',
 skillKeyFor:v162.keyFor});
assert.equal(ownRow.revision,1);
assert.equal(profiles.read(store,external).skills[0],'Interceptação');
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes("skillKeyFor,native:model.nativeSkills||'',equipped:model.skills||''"));
assert(ui.includes("fixedBooster:model.fixedBooster||''"));
assert(ui.includes("boosterSlot:model.boosterSlot||'pendente'});"));
const core=read('web/craque-manager-fichas-v324.js');
assert(core.includes('if(native!==undefined||equipped!==undefined||boosterSlot!==undefined)'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
console.log('V346 PASS: escrita com evidências, bloqueios por alias/slot, histórico imutável, duas coleções isoladas e 246 cartas preservadas.');
