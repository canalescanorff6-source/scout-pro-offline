// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
/* V253 — uma ficha por edição, rastreio de recomendações repetidas,
 * sem fabricar Player ID, atributos, pontuação meta ou builds. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const source=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(source).cards;
const baseline=JSON.stringify(cards);
assert.equal(cards.length,246);
const idSet=new Set(cards.map(c=>String(c.numero)+'@'+String(c.id)));
assert.equal(idSet.size,246);
assert.deepEqual(T.STYLES.map(x=>x.id),['posse','normal','rapido','fora','longo']);
const martinelli=cards.find(c=>c.numero===191);
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
const m=read('web/'+martinelli.arquivo);
const raw=JSON.parse(m.match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const proven=V.buildReview(martinelli,raw,{},cards,'posse');
assert.equal(proven.status,'complete');
assert.equal(proven.level,26);
assert.equal(proven.pp,50);
assert(proven.proposal);
assert.equal(T.total(proven.proposal.levels),50);
assert(proven.specificity);
assert(Array.isArray(proven.specificity.matches));
assert(['repeticao_exige_validacao','proposta_repetida_sem_prova',
 'sem_repeticao_detectada'].includes(proven.specificity.status));
assert.equal(proven.trainingProof,'sem_teste_independente_de_partida');
// Fixture artificial APENAS para provar que o motor não esconde a
// repetição quando duas edições têm sinais nativos diferentes.
const peer={...martinelli,numero:991,id:'CARD_ID_TESTE_991',
 name:'Somente fixture do teste V253',
 habilidades_nativas:martinelli.habilidades_nativas+'; Habilidade fictícia não reconhecida'};
const computed=V.compareProposals(martinelli,[...cards,peer],
 'posse','ALA',proven.proposal.levels);
assert(computed.compared>=1,'Comparação da mesma função e PP foi executada');
const matched=computed.matches.find(x=>x.numero===991);
assert(matched,'Não detectou uma proposta idêntica na edição de teste');
assert(matched.inputsDifferent.includes('habilidades nativas'));
assert.equal(computed.status,'repeticao_exige_validacao');
assert(computed.note.includes('atributos finais'));
assert.equal(computed.distinctSources>=1,true);
// Grupos com PP diferente ou função diferente não são misturados.
const altered={...peer,numero:992,id:'TESTE_992',pp:52,max_level:27};
const ineligible=V.compareProposals(martinelli,[altered], 'posse','ALA',proven.proposal.levels);
assert.equal(ineligible.compared,0);
assert.equal(ineligible.matches.length,0);
// Sem dados válidos, o analisador não inventa comparações.
assert.equal(V.compareProposals(martinelli,[], 'posse','ALA',null).status,'pendente');
// Cinco táticas são simuladas sem modificar treinamento do acervo.
for(const tactic of T.STYLES){
 const review=V.buildReview(martinelli,raw,{},cards,tactic.id);
 assert(review.proposal,'Estilo '+tactic.id);
 assert.equal(T.total(review.proposal.levels),50);
 assert(review.specificity);
 assert(review.context?.priorities?.length>0);
 assert(Array.isArray(review.context?.signals));
 assert.equal(review.trainingProof,'sem_teste_independente_de_partida');
}
const gui=read('web/craque-ficha-individual-v251.js');
const stylesheet=read('web/craque-ficha-individual-v251.css');
const sw=read('web/sw.js');
const packageJson=JSON.parse(read('package.json'));
assert(gui.includes("review.id='ct253-integrated-review'"));
assert(gui.includes('training.append(review)'),'Auditoria dentro da ficha principal V220');
assert(!gui.includes("training.insertAdjacentElement('afterend',block)"),
 'Não criar uma segunda ficha concorrente');
assert(gui.includes("block.id='ct251-individual-ficha'"));
assert(gui.includes("compareProposals(card,all,style,context.role,levels,opts)"));
assert(gui.includes("const explanations=mk('details','ct253-reasons')"));
assert(gui.includes("check.specificity?.matches?.length"));
assert(stylesheet.includes('.ct253-integrated-review>summary'));
assert(stylesheet.includes('.ct253-repetition[data-status="repeticao_exige_validacao"]'));
assert(stylesheet.includes('@media(max-width:720px)'));
assert(sw.includes('v253-one-sheet-audit'),'Novo cache offline para Android/Windows');
assert(packageJson.scripts.check.includes('test-one-sheet-specificity-v253.cjs'));
assert.equal(JSON.stringify(cards),baseline,'Não alterar nenhum dado de carta');
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),source);
console.log('V253 OK: 246 edições preservadas, cinco estilos e PP exatos.');
console.log('V253 OK: fichas repetidas são sinalizadas por função/PP e diferenças nativas.');
console.log('V253 OK: auditoria V251 dentro da ficha V220, recolhível e responsiva.');
