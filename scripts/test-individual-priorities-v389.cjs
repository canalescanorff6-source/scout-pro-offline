'use strict';
const assert=require('node:assert/strict');
const T=require('../web/scout-multitactic-engine-v220.js');
const I=require('../web/craque-role-intelligence-v233.js');
const {allocate}=require('../web/craque-ficha-individual-v251.js');
const {cards}=require('../web/SCOUT_V69_AUDITORIA.json');
const references=require('../web/ct376-card-references.json').cards;

function sample(capture,tactic='rapido'){
 const c=cards.find(row=>row.numero===capture);
 const reference=references.find(row=>row.capture===capture);
 const card={capture,localKey:reference.cardKey,cardId:c.id,edition:c.versao,
  position:c.posicao,nativeSkills:c.habilidades_nativas,fixedBooster:c.impeto_fixo};
 const {weights,role}=I.interpret(c,tactic,null);
 return {weights,role,tactic,card,reference,pp:c.pp};
}

assert.equal(typeof I.refineIndividual,'function','O motor deve refinar os pesos com a evidência da edição');
for(const [first,second,attribute] of [[37,183,'acceleration'],[104,107,'tackling']]){
 const a=sample(first),b=sample(second);
 assert.equal(a.pp,b.pp);
 assert.deepEqual(a.weights,b.weights,'A interpretação anterior entrega pesos equivalentes');
 const previous=JSON.stringify([a,b]);
 const x=I.refineIndividual(a),y=I.refineIndividual(b);
 assert.equal(x.analysis.status,'documentada');
 assert.equal(y.analysis.status,'documentada');
 assert.notDeepEqual(x.weights,y.weights,'Os fatores documentados devem alcançar os pesos reais');
 assert.notEqual(x.analysis.evidenceSignature,y.analysis.evidenceSignature);
 for(const [proposal,input] of [[x,a],[y,b]]){
  assert(proposal.analysis.factors.some(f=>f.attributes?.some(s=>s.key===attribute)),
   'O cálculo deve identificar um atributo-base da tarefa');
  assert(proposal.analysis.factors.every(f=>f.delta!==0&&proposal.weights[f.index]!==input.weights[f.index]),
   'A justificativa lista apenas fatores aplicados ao cálculo');
  assert.equal(T.total(allocate(proposal.weights,input.role,input.pp,null)),input.pp);
 }
 assert.equal(JSON.stringify([a,b]),previous,'Proposta não altera a carta, referência ou pesos anteriores');
 const mismatched=I.refineIndividual({...a,reference:b.reference});
 assert.deepEqual(mismatched.weights,a.weights);
 assert.deepEqual(mismatched.analysis.factors,[]);
 assert.equal(mismatched.analysis.status,'dados_insuficientes');
}

const a=sample(37);
const wrongEdition=I.refineIndividual({...a,card:{...a.card,edition:sample(183).card.edition}});
assert.deepEqual(wrongEdition.weights,a.weights);
assert.equal(wrongEdition.analysis.status,'dados_insuficientes');
const unverified=I.refineIndividual({...a,reference:{...a.reference,reference:{...a.reference.reference,htmlSha256:''}}});
assert.deepEqual(unverified.weights,a.weights);
assert.equal(unverified.analysis.status,'dados_insuficientes');
const noStats=I.refineIndividual({...a,reference:{...a.reference,reference:{...a.reference.reference,baseStats:null}}});
assert.deepEqual(noStats.weights,a.weights,'Altura, nativas e ímpeto não substituem a base de atributos');
assert.equal(noStats.analysis.status,'dados_insuficientes');
for(const tactic of ['normal','rapido','fora','longo']){
 const input=sample(37,tactic),proposal=I.refineIndividual(input);
 const height=proposal.analysis.factors.flatMap(f=>f.modifiers).find(f=>f.kind==='height');
 if(tactic==='fora'||tactic==='longo')assert.equal(height?.height,input.reference.reference.height);
 else assert.equal(height,undefined);
 assert.equal(T.total(allocate(proposal.weights,input.role,input.pp,null)),input.pp);
}
const possession=sample(37,'posse');
assert.deepEqual(I.refineIndividual(possession).weights,possession.weights);
assert.equal(I.refineIndividual(possession).analysis.status,'preservada');
console.log('V389 PASS: artilheiros, primeiros volantes, evidência da edição, PP exatos e preservação da Posse.');
