'use strict';
// V342: pré-validação imediata, zero escrita, sem perder revisões legadas.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const profiles=require('../web/craque-manager-fichas-v324.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cardsOriginal=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(cardsOriginal).cards.length,246);
const train=[10,5,5,8,8,6,0,0,0,0],draft=[9,6,5,8,8,6,0,0,0,0];
assert.equal(train.reduce((n,x)=>n+profiles.ppCost(x),0),62);
assert.equal(draft.reduce((n,x)=>n+profiles.ppCost(x),0),61);
const ready=profiles.reviewDraftReadiness({train:draft,budget:62,
 skills:['Passe de primeira','Toque duplo'],booster:'Técnica',
 native:'Passe em profundidade',fixedBooster:'Técnica',boosterSlot:'pendente'});
assert.equal(ready.canSave,true);
assert.equal(ready.status,'pronto_para_rascunho');
assert.equal(ready.spent,61);assert.equal(ready.remainingPP,1);
assert.equal(ready.skillCount,2);
assert.equal(ready.audit.fixedBoosterSame,true);
assert(ready.advisories.some(x=>x.includes('coincide')));
assert(ready.advisories.some(x=>x.includes('slot livre')));
assert(Object.isFrozen(ready)&&Object.isFrozen(ready.issues)&&Object.isFrozen(ready.advisories));
const blocked=profiles.reviewDraftReadiness({train,budget:62,
 skills:['passe de primeira','Toque duplo'],booster:'Força',
 native:'PASSE DE PRIMEIRA; Velocidade',equipped:'TOQUE DUPLO',fixedBooster:'Técnica'});
assert.equal(blocked.canSave,false);assert.equal(blocked.status,'revisar_habilidades');
assert(blocked.issues.join(' ').includes('Passe')||blocked.issues.join(' ').includes('passe'));
assert.equal(blocked.audit.conflicts.length,2);
const sameName=profiles.reviewDraftReadiness({train,budget:62,
 skills:['Passe de primeira','passe de  primeira']});
assert.equal(sameName.canSave,false);
assert(sameName.issues.some(x=>x.includes('equivalentes')));
const accent=profiles.reviewDraftReadiness({train,budget:62,
 skills:['Condução firme','Conducao Firme']});
assert.equal(accent.canSave,false);
const partial=profiles.reviewDraftReadiness({train,budget:60,skills:[]});
assert.equal(partial.canSave,false);assert.equal(partial.status,'pp_pendente');
const six=profiles.reviewDraftReadiness({train,budget:62,skills:['a','b','c','d','e','f']});
assert.equal(six.canSave,false);
const invalid=profiles.reviewDraftReadiness({train:[9],budget:62,skills:[]});
assert.equal(invalid.canSave,false);assert.equal(invalid.spent,null);
const empty=profiles.reviewDraftReadiness({train,budget:62,skills:[],booster:''});
assert.equal(empty.canSave,true);assert.equal(empty.skillCount,0);
assert.equal(empty.audit.fixedBoosterSame,false);
const data=new Map(),writes=[];
const store={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>{writes.push(k);data.set(k,v)}};
const context={collection:'minhas-246',owner:'principal',cardKey:'001@123',cardId:'123',
 edition:'Testada',manager:'CT-MGR-001',position:'MAT',style:'posse',
 budget:62,sourceSignature:'same-edition-v342'};
const record=profiles.save(store,context,{train,skills:['Passe de primeira'],
 booster:'',source:'Revisão original'});
const key=profiles.key(context),raw=data.get(key),beforeWrites=writes.length;
assert(record.revision===1);
const parsed=JSON.parse(raw);
// Simula legado válido pelo contrato antigo: apenas nova gravação deve
// exigir deduplicação canônica. Não editar nem invalidar histórico anterior.
parsed.revisions[0].skills=['Condução firme','Conducao Firme'];
data.set(key,JSON.stringify(parsed));
const legacyBefore=data.get(key);
assert.equal(profiles.read(store,context).skills.length,2);
assert.throws(()=>profiles.save(store,context,{train,
 skills:['Condução firme','Conducao Firme']}),/equivalentes/);
assert.equal(data.get(key),legacyBefore);
assert.equal(writes.length,beforeWrites);
const audit=profiles.reviewDraftReadiness({train,budget:62,
 skills:profiles.read(store,context).skills});
assert.equal(audit.canSave,false);
const external={...context,collection:'outros-elencos',owner:'bruno',
 cardKey:'unique-48'};
assert.equal(profiles.read(store,external),null,'Não misturar as coleções');
assert.equal(writes.length,beforeWrites,'A análise não pode gravar rascunhos');
const ui=read('web/craque-positional-ui-v311.js'),css=read('web/craque-positional-v311.css');
assert(ui.includes("readinessNote.setAttribute('aria-live','polite')"));
assert(ui.includes("readinessNote.dataset.status=result.status"));
assert(ui.includes("selectBooster.addEventListener('change',updateReadiness)"));
assert(ui.includes("for(const input of choices)input.addEventListener('change',updateReadiness)"));
assert(ui.includes("action.disabled=!ok||!result.canSave"));
assert(ui.includes("if(!readiness.canSave)throw Error(readiness.issues.join(' '))"));
assert(!ui.includes("profiles.save(storage(),profileContext,{train:currentPlan,skills,\n        booster:selectBooster.value")); // sem caminho antigo sem revalidação
assert(css.includes('.ct342-live-audit'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),cardsOriginal);
console.log('V342 PASS: PP 61/62, 5 skills, colisões ao vivo, booster/slot pendente, legado e 246 cartas intactos.');
