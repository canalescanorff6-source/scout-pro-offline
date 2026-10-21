'use strict';
/* V290: treinamento provisório não deve ancorar a otimização matemática.
 * Não homologa propostas ou altera níveis do catálogo. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(original).cards;
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(c=>c.numero+'@'+c.id+'@'+c.versao)).size,246);
const snapshot=JSON.stringify(cards);
const martin=cards.find(c=>c.numero===191);
assert(martin&&martin.id==='105850811319718'&&martin.pp===50&&martin.max_level===26);
assert.equal(martin.treino_proposto_nao_validado,true);
assert.equal(V.hasValidBuild(martin),true);
const html=read('web/'+martin.arquivo);
const match=html.match(/<script id="scout-v68-data"[^>]*>([\\s\\S]*?)<\\/script>/);
assert(match,'Ficha HTML original do Martinelli precisa manter dados embutidos');
const raw=JSON.parse(match[1]);
const reviews=[];
for(const tactic of T.STYLES){
 const review=V.buildReview(martin,raw,{},cards,tactic.id);
 assert(review.proposal,'Proposta consultiva indisponível: '+tactic.id);
 assert.equal(review.proposal.spent,50);
 assert.equal(review.proposal.baselineUsable,false,
  'Proposta experimental não pode se tornar âncora');
 assert.equal(review.proposal.baselineStatus,'vetor_experimental_ignorado');
 assert.deepEqual(review.proposal.levels,
  V.allocate(review.context.weights,review.context.role,50,null),
  'O motor deve calcular sem penalidade de proximidade ao treino experimental');
 assert(review.differences.some(s=>/experimental/i.test(s)));
 assert.equal(T.total(review.proposal.levels),50);
 assert.deepEqual(review.original,martin.niveis);
 // Fixture apenas para testar o modo de vetor cadastrado não provisório.
 const confirmedFixture={...martin,treino_proposto_nao_validado:false};
 const allowed=V.buildReview(confirmedFixture,raw,{},cards,tactic.id);
 assert(allowed.proposal&&allowed.proposal.baselineUsable);
 assert.equal(allowed.proposal.baselineStatus,'vetor_registrado_nao_provisorio');
 assert.deepEqual(allowed.proposal.levels,
  V.allocate(allowed.context.weights,allowed.context.role,50,martin.niveis));
 reviews.push({tactic:tactic.id,provisional:review.proposal.levels,
  registeredNotProvisional:allowed.proposal.levels,spent:50});
}
const withKnownLevels=cards.filter(c=>Number.isInteger(c.max_level)).length;
const experimental=cards.filter(c=>c.treino_proposto_nao_validado===true).map(c=>c.numero);
assert(experimental.includes(191));
assert.equal(JSON.stringify(cards),snapshot,'Catálogo alterado indevidamente');
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
const source=read('web/craque-ficha-individual-v251.js');
assert(source.includes('baselineUsable?card.niveis:null'));
assert(source.includes('peer.treino_proposto_nao_validado!==true'));
assert(read('package.json').includes('test-training-baseline-v290.cjs'));
assert(read('web/sw.js').includes('v290-experimental-baseline'));
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v290-training-baseline-audit.json'),JSON.stringify({
 schema:'CRAQUE_V290_BASELINE_PROVISORIA',catalogCards:246,
 knownMaxLevels:withKnownLevels,experimentalCaptures:experimental,
 martinelli:{capture:191,cardId:martin.id,pp:martin.pp,level:martin.max_level},
 reviews,warning:'Vetor registrado não provisório não equivale à homologação em gameplay.'
},null,2)+'\\n');
console.log('V290 PASS: 246 cartas preservadas, Martinelli 26/50, cinco estilos sem ancoragem experimental.');
