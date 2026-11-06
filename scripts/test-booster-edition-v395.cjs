'use strict';
// Edição pública comprova existência de slot, nunca vaga livre na conta.
const assert=require('node:assert/strict');
const T=require('../web/scout-multitactic-engine-v220.js');
const S=require('../web/skills-booster-v162.js');
const B=require('../web/booster-engine-v103.js');
const I=require('../web/craque-ficha-individual-v251.js');
const D=require('../web/craque-role-intelligence-v233.js');
const G=require('../web/craque-global-v394.js');
const F=require('../web/craque-friends-training-v228.js');
const refs=require('../web/ct376-card-references.json').cards;
const catalogue=require('../web/SCOUT_V69_AUDITORIA.json').cards;
const source=catalogue.find(c=>c.numero===77);
const reference=refs.find(r=>r.capture===77);
assert(source&&reference&&reference.identityUsable===true);
assert.equal(reference.reference.cardId,String(source.id));
assert.equal(reference.edition,source.versao);
assert.equal(reference.reference.extraSlotInPublicEdition,true);
const card={
 capture:77,localKey:'77@'+source.id,name:source.name,cardId:String(source.id),
 edition:source.versao,position:'MAT',originalPosition:'MAT',
 style:source.estilo_ataque||'',defenceStyle:source.estilo_defesa||'',
 nativeSkills:source.habilidades_nativas||'',skills:'',
 fixedBooster:source.impeto_fixo||'',booster:'',boosterSlot:'vazio',
 level:source.max_level,pp:source.pp,reference
};
assert.equal(card.pp,68);
const deps={tactical:T,skills:S,boosters:B,individual:I,interpretation:D,universal:G,reference};
let baseline=null;
for(const tactic of F.MODES){
 const result=F.evaluate(card,tactic,deps);
 assert.equal(result.plan.status,'hipotese',tactic);
 assert.equal(T.total(result.plan.levels),card.pp,tactic);
 if(baseline)assert.deepEqual(result.plan.levels,baseline,'Ficha global variou entre estilos');
 else baseline=result.plan.levels;
 assert.equal(result.boosterSlotEvidence.editionDocumented,true,
  'A existência do slot nesta edição independe da tática: '+tactic);
 assert.equal(result.boosterSlotEvidence.ownerReported,'vazio',tactic);
 assert(result.warnings.some(w=>w.includes('referência pública')&&w.includes('conferida na conta')),
  'A conta não pode ser declarada verificada pelo catálogo');
 assert(result.suggestedSkills.every(s=>s.applyAuthorized!==true),
  'Nenhuma habilidade deve ser equipada automaticamente');
}
const mismatched=F.evaluate({...card,cardId:'88035555413455'},'posse',deps);
assert.equal(mismatched.boosterSlotEvidence.editionDocumented,false,
 'Referência de outro Card ID não autoriza slot');
const missing=F.evaluate({...card,reference:null},'posse',deps);
assert.equal(missing.boosterSlotEvidence.editionDocumented,false,
 'Ausência de referência não autoriza slot');
const absent=F.evaluate({...card,boosterSlot:'ausente'},'rapido',deps);
assert.equal(absent.boosterEligible,false,'Slot explicitamente ausente deve ser respeitado');
console.log('V395: ímpeto por edição igual nos 6 estilos, sem slot falso, sem gasto automático PASS');
