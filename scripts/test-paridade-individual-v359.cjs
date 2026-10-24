'use strict';
// V359: a mesmíssima função de distribuição e interpretação das 246 cartas
// é usada por TODAS as cartas externas, com identidade/PP isolados.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const friends=require('../web/craque-friends-v227.js');
const training=require('../web/craque-friends-training-v228.js');
const interp=require('../web/craque-role-intelligence-v233.js');
const individual=require('../web/craque-ficha-individual-v251.js');
const sete=require('../web/craque-sete-v357.js');
const tactical=require('../web/scout-multitactic-engine-v220.js');
const deps={tactical,interpretation:interp,individual,
 skills:require('../web/skills-booster-v162.js'),
 boosters:require('../web/booster-engine-v103.js')};
const original=read('web/SCOUT_V69_AUDITORIA.json');
const snapshot=JSON.parse(original);
assert.equal(snapshot.cards.length,246);
const store=(()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}})();
const seeded=sete.seed(friends.empty(),friends,store,training,deps);
assert.equal(seeded.inserted,3);
assert.equal(seeded.data.cards.length,3);
for(const card of seeded.data.cards){
 assert(/^\\d{5,20}$/.test(card.cardId),'Card ID original da edição obrigatório');
 for(const style of training.MODES){
  const result=training.evaluate(card,style,deps),proposal=result.plan;
  assert.equal(proposal.status,'hipotese',card.name+' '+style);
  assert.equal(proposal.methodology,training.METHODOLOGY);
  assert.equal(proposal.pp,card.pp);
  assert.equal(tactical.total(proposal.levels),card.pp);
  const aligned={...training.profileOf(card),id:card.cardId,card_id:card.cardId,
   edition:card.edition,versao:card.edition,pp:card.pp,max_level:card.level,
   pp_origem:'nivel_informado_no_cadastro_externo',
   recommended_levels:null,niveis:null,base_stats_known:false,
   pp_estimado:false};
  const mainInterpretation=interp.interpret(aligned,style,null);
  assert(mainInterpretation?.weights?.length===10);
  const expected=individual.allocate(mainInterpretation.weights,mainInterpretation.role,card.pp,null);
  assert.deepEqual(proposal.levels,expected,
   'Outros Elencos e Minhas Cartas devem usar a mesma engenharia V251/V233');
  assert(proposal.tests.length>0,'Critérios de avaliação real em campo por função');
  assert(!result.boosterEligible,'Ímpeto do eFHub não autoriza gasto de tokens');
  const fakeOverall={...card,overall:199,rating:199};
  assert.deepEqual(training.evaluate(fakeOverall,style,deps).plan.levels,proposal.levels,
   'Overall não entra na função objetiva de treinamento');
 }
}
// Alterar MAT → SA deve trocar a função sem alterar a build cadastrada.
const hazard=seeded.data.cards.find(c=>c.name==='Eden Hazard');
const originalPP=hazard.pp,originalPosition=hazard.position;
const useAsSA={...hazard,position:'SA'};
const asSA=training.evaluate(useAsSA,'posse',deps).plan;
const asMAT=training.evaluate(hazard,'posse',deps).plan;
assert.equal(asSA.role,'SA');assert.equal(asMAT.role,'MAT');
assert.notDeepEqual(asSA.levels,asMAT.levels,'Posição de uso exige investimento próprio');
assert.equal(hazard.position,originalPosition);assert.equal(hazard.pp,originalPP);
assert.notEqual(training.sourceSignature(hazard),training.sourceSignature(useAsSA));
const savedLegacy={version:228,source:'v228:antigo',profiles:{}};
assert.equal(training.validateSaved(hazard,savedLegacy,deps),false,'Hipótese antiga não deve ganhar certificação nova');
assert.equal(seeded.data.owners.length,1);
assert.equal(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards.length,246);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
const html=read('web/outros-elencos-v227.html');
for(const name of ['scout-multitactic-engine-v220.js','craque-role-intelligence-v233.js',
 'craque-ficha-individual-v251.js','craque-friends-training-v228.js']){
 assert(html.includes('src="'+name+'"'),'Motor obrigatório para uso offline: '+name);
}
assert(html.indexOf('craque-role-intelligence-v233.js')<
 html.indexOf('craque-friends-training-v228.js'));
assert(html.indexOf('craque-ficha-individual-v251.js')<
 html.indexOf('craque-friends-training-v228.js'));
assert(read('web/craque-friends-training-ui-v228.js').includes('Critérios de gameplay a testar'));
assert(read('web/sw.js').includes('v359-parity'));
console.log('V359 PASS: Outros Elencos = V251/V233 de Minhas Cartas; 3 cartas × 5 estilos, PP exatos, OVR ignorado, MAT/SA independentes, 246 preservadas.');
