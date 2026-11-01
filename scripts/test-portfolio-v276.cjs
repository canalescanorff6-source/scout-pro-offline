// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V276: 246 cartas x cinco táticas; portfolios e overlap não autorizam uso de tokens. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>historicalRead(path.join(root,p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(original).cards;
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const initial=JSON.stringify(cards),tactics=B.tactics;
assert.equal(cards.length,246);assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id)).size,246);
let scenarios=0,portfolioDifferences=0,portfolioItems=0,knownFactory=0,lowOverlap=0,closeCalls=0;
const samples=[];
for(const card of cards){
 const initialCard=JSON.stringify(card);
 const d={capture:card.numero,id:card.id,edition:card.versao,
  shown_position:card.posicao,role_used:card.posicao,original_position:card.posicao,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  native_skills:card.habilidades_nativas,pp:card.pp,recommended_levels:card.niveis,
  training_provisional:card.treino_proposto_nao_validado===true,
  boost1:card.impeto_fixo,boost2:card.impeto_extra};
 const audit={cap:card.numero,cardId:card.id,edition:card.versao,styles:{}};
 for(const tactic of tactics){
  const e=S.evaluate(d,tactic),b=S.booster(d,tactic,B),full=B.rank(card,tactic);
  const balanced=e.balancedPortfolio,portfolio=balanced.candidates;
  const keys=portfolio.map(x=>x.key),usedNative=new Set(String(card.habilidades_nativas||'')
   .split(';').map(S.keyFor).filter(Boolean));
  assert.equal(balanced.kind,'ALTERNATIVA_EQUILIBRADA_CONSULTIVA');
  assert.equal(balanced.role,e.role);assert.equal(balanced.tactic,tactic);
  assert.equal(balanced.mayApply,false);assert.equal(balanced.slotCountConfirmed,false);
  assert.equal(balanced.candidates.length,Math.min(5,e.recommendations.length+
   e.alternatives.length));
  assert(keys.length<=5&&new Set(keys).size===keys.length);
  assert(keys.every(x=>!usedNative.has(x)), 'Portfólio repetiu nativa #'+card.numero);
  assert(keys.every(x=>!e.recommendations.some(y=>y.key===x&&usedNative.has(x))));
  assert(portfolio.every(x=>x.equipAuthorized===false));
  assert(portfolio.every(x=>S.SKILL_FAMILY[x.key]===x.family));
  assert.equal(Object.values(balanced.families).reduce((a,v)=>a+v,0),portfolio.length);
  assert.equal(e.equippedConfirmed,false);assert.equal(e.slotsRemaining,null);
  if(keys.join('|')!==e.recommendations.map(x=>x.key).join('|'))portfolioDifferences++;
  portfolioItems+=keys.length;
  const compared=b.complementarity;
  assert.equal(compared.comparisons.length,Math.min(3,full.length));
  const factory=B.boosterName(card.impeto_fixo);
  assert.equal(compared.factoryName,factory||null);
  assert.equal(compared.factoryDocumented,Boolean(factory&&B.BOOSTERS[factory].length===4));
  if(compared.factoryDocumented)knownFactory++;
  for(const item of compared.comparisons){
   const axes=B.BOOSTERS[item.technicalName];
   assert(axes);
   const overlap=axes.filter(x=>compared.factoryAxes.includes(x));
   assert.deepEqual(item.sharedStatKeys,overlap);
   assert.equal(item.shared,overlap.length);
   assert.equal(item.shared+item.uniqueStatKeys.length,4);
   assert.equal(item.applyAuthorized,false);
   assert(item.shared>=0&&item.shared<=4);
  }
  if(compared.lowOverlapAlternative){
   lowOverlap++;
   assert(compared.factoryDocumented);
   assert(compared.lowOverlapAlternative.shared<compared.comparisons[0].shared);
   assert(compared.lowOverlapAlternative.relativeScore>=full[0].score-8);
   assert.equal(compared.lowOverlapAlternative.applyAuthorized,false);
  }
  const dossier=S.evidenceDossier(d,tactic,B);
  assert.equal(dossier.boosterComplementarity.factoryDocumented,
   compared.factoryDocumented);
  assert.equal(dossier.boosterComplementarity.comparisons.length,compared.comparisons.length);
  assert.equal(dossier.competitivelyApproved,false);
  assert.equal(dossier.maySpendTokensAutomatically,false);
  if(full.length>1&&full[0].score-full[1].score<2)closeCalls++;
  audit.styles[tactic]={
   role:e.role,rankedSkills:e.recommendations.map(x=>x.name),
   balancedSkills:portfolio.map(x=>({skill:x.name,family:x.family,score:x.relativeScore})),
   fixedBoosterOverlap:compared.comparisons[0]?.shared??null,
   lessOverlap:compared.lowOverlapAlternative?.documentedName||null,
   slotVerified:false
  };
  scenarios++;
 }
 assert.equal(JSON.stringify(card),initialCard);
 samples.push(audit);
}
assert.equal(scenarios,1230);
assert.equal(JSON.stringify(cards),initial);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
// Balanceamento não troca a ordem oficial das 5 prioridades; é uma alternativa.
const base={capture:976,id:'976000976',edition:'TESTE-V276',shown_position:'CA',attack_style:'Artilheiro',native_skills:'Heading'}; // Fixture V291: inventário conhecido
const r=S.evaluate(base,'posse');
assert.equal(r.recommendations.length,5);
assert(r.balancedPortfolio.candidates.length===5);
assert(r.balancedPortfolio.candidates.every(x=>x.key&&x.family));
assert(S.composePortfolio([], 'CA','posse',5).candidates.length===0);
assert.throws(()=>S.composePortfolio([], 'CA','posse',6),/Limite/);
// Slots conferidos: no máximo as vagas reais, SEM aplicação automática.
const receipt=(manual)=>({schema:'CRAQUE_ADDITIONAL_V254',confirmed:true,
 capture:base.capture,card_id:base.id,edition:base.edition,
 fingerprint:S.fingerprint(manual),nativeFingerprint:S.fingerprint(base.native_skills)});
const with4=S.evaluate(base,'posse',
 'Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola',
 {equippedConfirmed:true,equipmentRecord:receipt('Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola')});
assert.equal(with4.slotsRemaining,1);
assert.equal(with4.balancedPortfolio.candidates.length,1);
assert.equal(with4.balancedPortfolio.mayApply,false);
const with5=S.evaluate(base,'posse',
 'Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Espírito guerreiro',
 {equippedConfirmed:true,equipmentRecord:receipt('Passe de primeira; Passe em profundidade; Toque duplo; Controle com a sola; Espírito guerreiro')});
assert.equal(with5.slotsRemaining,0);
assert.equal(with5.balancedPortfolio.candidates.length,0);
const native=S.evaluate({...base,native_skills:'Passe de primeira; Controle com a sola'},'posse');
assert(!native.balancedPortfolio.candidates.some(x=>x.key==='onepass'||x.key==='sole'));
const unknown=S.evaluate({...base,native_skills:'Phenomenal Pass; Marseille Turn'},'posse');
assert(!unknown.balancedPortfolio.candidates.some(x=>['Phenomenal Pass','Marseille Turn'].includes(x.name)));
const martin=cards.find(c=>c.numero===191);
assert.equal(martin.pp,50);assert.equal(martin.max_level,26);
assert.equal(S.investmentAudit({recommended_levels:martin.niveis,pp:martin.pp,training_provisional:true}).levels,null);
const report={schema:'CRAQUE_V276_PORTFOLIO_E_BOOSTERS',
 cardsCount:246,scenarios,portfolioDifferences,portfolioItems,knownFactory,
 lowOverlap,closeCalls,
 warning:'Listas complementares apenas ilustrativas. Nenhuma ficha, habilidade, ímpeto ou slot foi criado ou equipado.',
 perCard:samples};
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v276-portfolio-boosters-246x5.json'),JSON.stringify(report,null,2)+'\n');
assert(read('web/sw.js').includes('v276-portfolio-complementarity'));
assert(read('package.json').includes('test-portfolio-v276.cjs'));
console.log('V276 PASS: '+scenarios+' cenários, '+portfolioDifferences+
 ' listas complementares distintas do ranking puro, '+knownFactory+
 ' comparações com ímpeto fixo identificado, '+lowOverlap+
 ' alternativas com menor sobreposição. 246 cartas preservadas.');
