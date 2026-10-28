'use strict';
/* V305: garante acesso explícito às fichas dos outros elencos e motor real V228. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=s=>fs.readFileSync(path.join(root,s),'utf8');
const old=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
assert.equal(old.cards.length,246);
const m=require('../web/craque-friends-v227.js'),e=require('../web/craque-friends-training-v228.js');
const deps={tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
const zico={
 ownerId:'bruno',id:'zico-v304',name:'Zico',position:'SA',style:'Armador criativo',
 edition:'Edição 106 SA pendente',cardId:'',level:null,pp:null,
 nativeSkills:'',skills:'',booster:'',fixedBooster:'',boosterSlot:'pendente',trainingLevels:''
};
const modes=e.MODES;
assert.equal(modes.length,5);
const pending=e.generate(zico,deps);
assert.equal(Object.keys(pending.profiles).length,5);
for(const mode of modes){
 const result=e.evaluate(zico,mode,deps);
 assert.equal(result.plan.status,'pendente','Não gerar números falsos para '+mode);
 assert.equal(result.plan.levels,null);
 assert.equal(result.boosterEligible,false);
 assert.equal(pending.profiles[mode].levels,null);
}
const verified={...zico,pp:62,cardId:'ID-HIPOTETICO-DE-TESTE',nativeSkills:'Passe de primeira'};
const plans=e.generate(verified,deps);
assert(e.validateSaved(verified,plans,deps));
for(const mode of modes){
 const result=e.evaluate(verified,mode,deps);
 assert.equal(result.plan.status,'hipotese');
 assert.equal(deps.tactical.total(result.plan.levels),62);
 assert(Array.isArray(result.suggestedSkills));
 assert(result.booster);
}
let data=m.addOwner(m.empty(),'Bruno Santos CD');
const owner=data.owners[0];data=m.saveCard(data,{...verified,ownerId:owner.id,analysis:plans});
const ex=m.exportOwner(data,owner.id);
assert.equal(ex.cards.length,1);
assert.equal(ex.cards[0].analysis.profiles.posse.pp,62);
const rem=m.importOwner(m.empty(),ex);
assert.equal(rem.cards.length,1);
assert.equal(rem.cards[0].analysis.profiles.longo.pp,62);
const page=read('web/outros-elencos-v227.html');
const ui=read('web/craque-friends-page-v227.js');
const fichas=read('web/craque-friends-training-ui-v228.js');
const css=read('web/craque-friends-v227.css');
for(const term of ['friend-fichas-count','friend-analysis-player','friend-analysis-cover',
 'friend-analysis-sections','friend-analysis-edit','friend-analysis-save','friend-analysis-modes'])
 assert(page.includes('id="'+term+'"'),'Seção não disponível: '+term);
assert(ui.includes('Ver ficha do app')&&ui.includes('friends-card-fichas'),
 'Cada carta precisa de acesso explícito às cinco fichas');
assert(ui.includes('()=>openCard(card)'),'Edição acessível a partir da ficha');
assert(fichas.includes("Object.fromEntries(engine.MODES.map"),
 'Cinco estilos realmente calculados por carta, não um painel duplicado');
assert(fichas.includes('selectPanel(panel)'),'Alternar treino, habilidades e ímpetos');
assert(fichas.includes('Treino pendente')&&fichas.includes('PP · hipótese'),
 'Status documental diferenciado por estilo');
assert(fichas.includes("modal.close();editCallback()"),
 'Completar dados deve abrir cadastro da carta certa');
assert(fichas.includes('engine.generate(activeCard)')&&
 fichas.includes('saveCallback(activeCard,'),
 'Botão deve persistir ficha real em acervo individual');
assert(css.includes('.friends-card-fichas')&&css.includes('.friend-analysis-identity'),
 'Layout premium completo das cartas e ficha');
assert(read('web/sw.js').includes('v305-premium-fichas'),
 'App offline precisa atualizar cache na versão V305');
assert(read('scripts/stamp-bundle-v189.cjs').includes('craque-friends-training-ui-v228.js'),
 'Paridade de bundle Android/Windows mantida');
assert.equal(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards.length,246);
console.log('V305 PASS: 5 fichas por carta, Zico com PP pendentes, recomputação real após PP, sugestões por estilo, backup isolado, acesso e seções premium.');
