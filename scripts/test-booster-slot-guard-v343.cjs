'use strict';
// V343 — evidência do slot cadastrado rege NOVOS candidatos; histórico intacto.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const api=require('../web/craque-manager-fichas-v324.js');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cards=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(cards).cards.length,246);
const train=[10,5,5,8,8,6,0,0,0,0];
const review=api.reviewBoosterSlot;
for(const slot of ['ausente','AUSENTE',' ausente ']){
 const state=review('Técnica',slot);
 assert.equal(state.blocking,true);
 assert.equal(state.status,'slot_ausente');
 assert.equal(state.gameplayValidated,false);
 assert.equal(state.mayEquip,false);
 assert(Object.isFrozen(state));
}
assert.equal(review('', 'ausente').blocking,false,
 'Sem slot declarado também deve ser possível salvar uma ficha SEM ímpeto');
assert.equal(review('', 'ausente').status,'sem_candidato');
for(const slot of ['pendente','vazio','ocupado','indefinido']){
 const state=review('Regista',slot);
 assert.equal(state.blocking,false,'Não inventar proibição quando há incerteza ou slot ocupado');
 assert.notEqual(state.status,'slot_ausente');
 assert.equal(state.mayEquip,false);
 assert(state.reason.length>10);
}
assert.equal(review('','ocupado').blocking,false);
assert.equal(review('Técnica','pendente').status,'slot_nao_comprovado');
assert.equal(review('Técnica','ocupado').status,'slot_ocupado');
assert.equal(review('Técnica','vazio').status,'slot_vazio_declarado');
const base={train,budget:62,skills:[],booster:'Técnica',
 native:'Passe de primeira',equipped:'',fixedBooster:'Força',boosterSlot:'ausente'};
const blocked=api.reviewDraftReadiness(base);
assert.equal(blocked.canSave,false);
assert.equal(blocked.status,'revisar_impeto_slot');
assert.equal(blocked.slotReview.blocking,true);
assert(blocked.issues.some(x=>x.includes('SEM slot adicional')));
assert(!blocked.advisories.some(x=>x.includes('slot livre')));
assert(Object.isFrozen(blocked.issues)&&Object.isFrozen(blocked.slotReview));
const cleared=api.reviewDraftReadiness({...base,booster:''});
assert.equal(cleared.canSave,true);
assert.equal(cleared.status,'pronto_para_rascunho');
assert.equal(cleared.slotReview.status,'sem_candidato');
const occupied=api.reviewDraftReadiness({...base,boosterSlot:'ocupado'});
assert.equal(occupied.canSave,true);
assert(occupied.advisories.some(x=>x.includes('ocupado')));
assert.equal(occupied.slotReview.gameplayValidated,false);
const emptyReported=api.reviewDraftReadiness({...base,boosterSlot:'vazio'});
assert.equal(emptyReported.canSave,true);
assert(emptyReported.advisories.some(x=>x.includes('existência na edição')));
const pending=api.reviewDraftReadiness({...base,boosterSlot:'pendente'});
assert.equal(pending.canSave,true);
assert(pending.advisories.some(x=>x.includes('slot livre')));
const invalidPP=api.reviewDraftReadiness({...base,budget:61});
assert.equal(invalidPP.canSave,false);
assert.equal(invalidPP.status,'pp_pendente');
const conflicted=api.reviewDraftReadiness({...base,skills:['Passe de primeira']});
assert.equal(conflicted.canSave,false);
assert.equal(conflicted.slotReview.blocking,true);
const storeData=new Map(),writes=[];
const storage={getItem:k=>storeData.get(k)??null,setItem:(k,v)=>{writes.push(k);storeData.set(k,v)}};
const ctx={collection:'outros-elencos',owner:'bruno-santos',cardKey:'original-5',
 cardId:'105297',edition:'Destaque teste',manager:'CT-MGR-071',
 position:'MAT',style:'posse',budget:62,sourceSignature:'V343-test'};
api.save(storage,ctx,{train,skills:[],booster:'Técnica',
 source:'Rascunho legado com slot posteriormente informado ausente'});
const before=storeData.get(api.key(ctx)),writeCount=writes.length;
const saved=api.read(storage,ctx);
assert.equal(saved.booster,'Técnica','Legado deve continuar legível');
assert.equal(api.reviewDraftReadiness({...base,booster:saved.booster}).canSave,false);
assert.equal(storeData.get(api.key(ctx)),before);
assert.equal(writes.length,writeCount,'Auditoria nunca grava');
const other={...ctx,collection:'minhas-246',owner:'principal',cardKey:'123@105297'};
assert.equal(api.read(storage,other),null,'Coleções continuam isoladas');
const ui=read('web/craque-positional-ui-v311.js');
assert(ui.includes('ct343-slot-evidence'));
assert(ui.includes('readinessNote.dataset.slotStatus=result.slotReview.status'));
assert(ui.includes('action.disabled=!ok||!result.canSave'));
assert(ui.includes('selectBooster.addEventListener(\'change\',updateReadiness)'));
const registration=read('web/outros-elencos-v227.html');
assert(registration.includes('<option value="ausente">Esta carta não possui slot</option>'));
assert(read('web/craque-positional-v311.css').includes('[data-status="revisar_impeto_slot"]'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),cards);
console.log('V343 PASS: slot ausente bloqueia só novo ímpeto; vazio/ocupado/pendente consultivos; legado, 246 cartas e acervos intactos.');
