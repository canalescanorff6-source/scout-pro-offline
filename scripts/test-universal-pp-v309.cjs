'use strict';
/* V309: cada carta nova, própria ou de outra pessoa, recebe PP exatos do nível máximo. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const pp=require('../web/craque-pp-universal-v309.js');
const lib=require('../web/craque-friends-v227.js');
const training=require('../web/craque-friends-training-v228.js');
const deps={
 tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),
 boosters:require('../web/booster-engine-v103.js')
};
for(const [level,points] of [[1,0],[26,50],[31,60],[35,68],[39,76],[120,238]]){
 assert.equal(pp.budget(level),points);
 assert.equal(training.levelBudget(level),points,'Todos os motores devem compartilhar a fórmula');
}
for(const bad of ['35',null,undefined,0,-1,121,4.2,NaN])
 assert.equal(pp.budget(bad),null,'Não inventar nível não documentado');
assert.equal(pp.resolve({level:35,pp:null}).pp,68);
assert.equal(pp.resolve({max_level:35,pp:null}).pp,68);
assert.equal(pp.resolve({level:35,pp:62}).source,'manual_divergente');
assert.equal(pp.resolve({level:35,pp:62}).pp,62,'PP manuais antigos não serão sobrescritos');
assert.equal(pp.resolve({level:null,pp:62}).pp,62,'Fichas antigas continuam calculáveis');
assert.equal(pp.resolve({level:35,pp:68}).source,'manual');

const source=lib.empty();
const first=lib.ensurePersonalCollection(source);
assert(first.changed);
assert.equal(first.data.owners.length,1);
assert.equal(first.data.owners[0].id,lib.PERSONAL_OWNER_ID);
const second=lib.ensurePersonalCollection(first.data);
assert.equal(second.changed,false);
assert.equal(second.data.owners.length,1,'Não criar dono duplicado');
const others=lib.addOwner(first.data,'Bruno Santos CD');
assert.equal(others.owners.length,2);
const own=lib.saveCard(others,{
 id:'ct-added-card-1',ownerId:lib.PERSONAL_OWNER_ID,name:'Zico (nova carta)',
 edition:'Edição sob conferência',cardId:'',position:'SA',style:'Armador criativo',
 level:35,pp:null,nativeSkills:'',skills:'',booster:'',
 fixedBooster:'',boosterSlot:'pendente',trainingLevels:''
});
const card=own.cards[0];
assert.equal(card.pp,null,'PP derivado não altera entrada manual do cadastro');
assert.equal(pp.resolve(card).pp,68);
const out=training.generate(card,deps);
for(const mode of training.MODES){
 assert.equal(out.profiles[mode].status,'hipotese','Cinco fichas por carta '+mode);
 assert.equal(out.profiles[mode].pp,68);
 assert.equal(deps.tactical.total(out.profiles[mode].levels),68);
 assert.equal(out.profiles[mode].remaining,0);
}
const saved=lib.saveCard(own,{...card,analysis:out});
assert(training.validateSaved(saved.cards[0],saved.cards[0].analysis,deps));
const another=lib.saveCard(saved,{...card,id:'ct-another',ownerId:others.owners[1].id});
assert.equal(another.cards.length,2);
assert.equal(another.cards[1].ownerId,others.owners[1].id);
assert.equal(pp.resolve(another.cards[1]).pp,68);
const manualConflict=pp.resolve({level:35,pp:62});
assert.match(manualConflict.reason,/DIVERGÊNCIA/);
assert.equal(training.evaluate({...card,pp:62},'posse',deps).plan.pp,62);
const exportDoc=lib.exportOwner(saved,lib.PERSONAL_OWNER_ID);
const imported=lib.importOwner(lib.empty(),exportDoc);
assert.equal(pp.resolve(imported.cards[0]).pp,68,'Backup de coleção recalcula orçamento');
assert.equal(imported.cards[0].pp,null,'PP manual vazio continua vazio no backup');
assert.equal(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards.length,246);
const page=read('web/craque-friends-page-v227.js');
assert(page.includes('ensurePersonalCollection'));
assert(page.includes("target==='minhas-cartas-adicionadas'"));
assert(page.includes("isInitialZico"));
assert(page.includes("budgets.resolveBudget(card)"));
assert(read('web/pwa.js').includes('outros-elencos-v227.html?colecao=minhas-cartas-adicionadas'));
assert(read('web/outros-elencos-v227.html').includes('craque-pp-universal-v309.js'));
assert(read('web/app-bridge.js').includes('craque-pp-universal-v309.js'));
assert(read('web/progress-v81.js').includes('CRAQUE_PP_UNIVERSAL_V309'));
assert(read('scripts/stamp-bundle-v189.cjs').includes("'craque-pp-universal-v309.js'"));
assert(read('web/sw.js').includes("'./craque-pp-universal-v309.js'"));
console.log('V309 PASS: 246 originais intocados; todas as novas cartas em acervos separados; nível máximo -> PP exatos -> cinco propostas, com backup e paridade offline.');
