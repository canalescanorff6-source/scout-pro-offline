'use strict';
/* V308 - confirmar PP calculado do nivel maximo sem alterar fichas ou dados originais. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const engine=require('../web/craque-friends-training-v228.js');
const friends=require('../web/craque-friends-v227.js');
const deps={
 tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),
 boosters:require('../web/booster-engine-v103.js')
};
assert.equal(engine.levelBudget(35),68,'Zico nível máximo 35 precisa render 68 PP');
assert.equal(engine.levelBudget(26),50,'Martinelli nível máximo 26 precisa render 50 PP');
assert.equal(engine.levelBudget(1),0);
assert.equal(engine.levelBudget(120),238);
for(const bad of [null,undefined,0,121,-1,35.5,'35',NaN])assert.equal(engine.levelBudget(bad),null);
const zico={
 ownerId:'bruno',id:'zico-106',name:'Zico',position:'SA',style:'Armador criativo',
 edition:'Edição da carta a confirmar',cardId:'',level:35,pp:null,
 nativeSkills:'',skills:'',booster:'',fixedBooster:'',
 boosterSlot:'pendente',trainingLevels:''
};
const progress=engine.resolveBudget(zico);
assert.equal(progress.pp,68);
assert.equal(progress.source,'nivel_maximo');
assert.equal(engine.profileOf(zico).pp,68);
const plans=engine.generate(zico,deps);
assert.equal(Object.keys(plans.profiles).length,5);
for(const mode of engine.MODES){
 const result=engine.evaluate(zico,mode,deps);
 assert.equal(result.plan.status,'hipotese','Ficha não pode continuar bloqueada apenas por Card ID: '+mode);
 assert.equal(result.progress.pp,68);
 assert.equal(result.plan.pp,68);
 assert.equal(deps.tactical.total(result.plan.levels),68,'Fechar exatos 68 PP em '+mode);
 assert.equal(result.plan.remaining,0);
 assert(result.warnings.some(x=>x.includes('Card ID')||x.includes('Identidade')));
 assert.equal(plans.profiles[mode].pp,68);
}
assert(engine.validateSaved(zico,plans,deps),'Ficha por nivel precisa validar no backup');
assert.equal(engine.validateSaved({...zico,level:34},plans,deps),false,'Mudar nível deve invalidar ficha antiga');
const approved={...zico,level:35,pp:68};
assert.equal(engine.resolveBudget(approved).pp,68);
assert.equal(engine.resolveBudget(approved).source,'manual');
const manualOnly={...zico,level:null,pp:62};
assert.equal(engine.resolveBudget(manualOnly).pp,62,'Não apagar PP manuais');
const conflict={...zico,level:35,pp:62};
const resolved=engine.resolveBudget(conflict);
assert.equal(resolved.pp,62,'Preservar os 62 PP manuais sem homologá-los como os 68 pelo nível');
assert.equal(resolved.expected,68);
assert.equal(resolved.manual,62);
assert.equal(resolved.source,'manual_divergente');
assert.equal(engine.evaluate(conflict,'posse',deps).plan.status,'hipotese');
assert.equal(deps.tactical.total(engine.evaluate(conflict,'posse',deps).plan.levels),62);
assert(engine.evaluate(conflict,'posse',deps).warnings.some(x=>x.includes('DIVERGÊNCIA')));
assert.equal(engine.generate(conflict,deps).profiles.posse.pp,62);
const none={...zico,level:null,pp:null};
assert.equal(engine.resolveBudget(none).source,'pendente');
assert.equal(engine.evaluate(none,'posse',deps).plan.status,'pendente');
let acervo=friends.addOwner(friends.empty(),'Bruno Santos CD');
const owner=acervo.owners[0];
acervo=friends.saveCard(acervo,{...zico,ownerId:owner.id});
const saved=acervo.cards[0];
assert.equal(saved.level,35);assert.equal(saved.pp,null,'Derivado não vira PP manual no armazenamento');
assert.equal(engine.resolveBudget(saved).pp,68);
const exported=friends.exportOwner(acervo,owner.id);
const imported=friends.importOwner(friends.empty(),exported);
assert.equal(imported.cards[0].level,35);
assert.equal(imported.cards[0].pp,null);
assert.equal(engine.resolveBudget(imported.cards[0]).pp,68,'Exportação/importação precisa recalcular o PP');
const orig=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
assert.equal(orig.cards.length,246,'Proteger as 246 cartas originais');
const page=read('web/craque-friends-page-v227.js');
const ui=read('web/craque-friends-training-ui-v228.js');
const html=read('web/outros-elencos-v227.html');
assert(html.includes('id="friend-budget-preview"'));
assert(html.includes('Nível MÁXIMO'));
assert(page.includes('budgets.resolveBudget(card)'));
assert(page.includes("isInitialZico"));
assert(page.includes("previewBudget();"));
assert(ui.includes("engine.resolveBudget(activeCard)"));
assert(read('web/sw.js').includes('v308-max-level-pp'));
console.log('V308 PASS: nível 35 => 68 PP, 5 fichas com custo exato, PP manual preservado, conflitos protegidos, backup compatível, 246 cartas intactas.');
