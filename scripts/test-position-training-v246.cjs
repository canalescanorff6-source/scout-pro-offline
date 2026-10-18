'use strict';
/* V246 — posição original != familiaridade confirmada != OVR calculado.
 * Integração real com cartas #191 Martinelli e 246 originais, V230/V219.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const original=JSON.stringify(cards);
assert.equal(cards.length,246);
const martinelli=cards.find(c=>c.numero===191);
assert.equal(martinelli.name,'Gabriel Martinelli');
assert.equal(martinelli.posicao,'PTE');
assert.equal(martinelli.id,'105850811319718');
const storageData=new Map();
const store={
 getItem:k=>storageData.has(k)?storageData.get(k):null,
 setItem:(k,v)=>storageData.set(k,String(v)),
 removeItem:k=>storageData.delete(k)
};
global.window={localStorage:store};
const P=require('../web/scout-position-training-v246.js');
const Tactical=require('../web/craque-tactics-v230.js');
const Rotation=require('../web/scout-rotation-engine-v219.js');
assert.equal(P.status(martinelli,'PTE').status,'original');
assert.equal(P.status(martinelli,'CA').eligible,false,
 'Martinelli como CA deve permanecer não confirmado antes de treino');
const originalFit=Tactical.fit(martinelli,'cae');
assert.equal(originalFit.match,false,'OVR ou proximidade tática não são prova de familiaridade');
const originalSuit=Rotation.suitability(martinelli,'cae');
assert.equal(originalSuit.kind,'adaptação não confirmada');
const proof=P.confirm(martinelli,'CA',true,store);
assert.equal(proof.status,'treinada');
assert.equal(proof.eligible,true);
assert.equal(P.status(martinelli,'CA').status,'treinada');
assert.equal(Tactical.fit(martinelli,'cae').match,true);
assert.equal(Tactical.fit(martinelli,'cad').label,'Posição treinada e confirmada nesta carta');
assert.equal(Rotation.suitability(martinelli,'cae').kind,'posição treinada confirmada');
assert.equal(Rotation.suitability(martinelli,'cae').score,84);
assert.equal(P.status(martinelli,'MAT').eligible,false,
 'CA confirmado não autoriza automaticamente MAT, SA ou outra função');
// Mesma pessoa ou nome com outro Card ID é OUTRA edição e não herda treino.
assert.equal(P.status({...martinelli,numero:188,id:'9999'},'CA').eligible,false);
assert.equal(P.status({...martinelli,id:'333333'},'CA').eligible,false);
assert.equal(P.status({...martinelli,numero:190},'CA').eligible,false);
const l191=JSON.parse(storageData.get(P.KEY));
assert.deepEqual(l191.entries[P.edition(martinelli)],['CA']);
assert.equal(Object.keys(l191.entries).length,1);
assert(!storageData.has('scoutpro:v177:minhas-duas-formacoes:4312'),
 'Não alterar perfil de posse');
assert(!storageData.has('scoutpro:v231:formation-lineup:4312:posse'),
 'Não alterar perfil de formação');
assert.throws(()=>P.confirm(martinelli,'GO',true,store),/jogadores de linha/);
assert.throws(()=>P.confirm(martinelli,'PTE',true,store),/jogadores de linha/);
const keeper=cards.find(c=>c.posicao==='GR'||c.posicao==='GO');
assert(keeper);
assert.throws(()=>P.confirm(keeper,'CA',true,store),/jogadores de linha/);
assert.equal(P.status(keeper,'GO').eligible,true);
assert.equal(P.status(keeper,'CA').eligible,false);
const neymar=cards.find(c=>c.numero===186);
assert.equal(P.status(neymar,'MAT').eligible,false,
 'Print do Neymar sem ID não confirma proficiência da edição #186');
const another=cards.find(c=>c.numero===79);
assert.equal(P.status(another,'MAT').eligible,true,
 'A posição original MAT do Neymar #079 deve permanecer natural');
P.confirm(martinelli,'CA',false,store);
assert.equal(P.status(martinelli,'CA').eligible,false);
assert.equal(Tactical.fit(martinelli,'cae').match,false);
assert.equal(Object.keys(JSON.parse(storageData.get(P.KEY)).entries).length,0);
assert.deepEqual(JSON.stringify(cards),original,'Nunca alterar as 246 cartas');
for(const file of [
 'web/meu-time-posse-4312.html','web/meu-time-duas-formacoes-v177.html',
 'web/meu-time-testes-v219.html'
]){const html=read(file);
 assert(html.includes('scout-position-training-v246.js'),'Carregamento offline ausente: '+file);
 const pos=html.indexOf('scout-position-training-v246.js');
 const dependent=html.indexOf(file.includes('testes')?'scout-rotation-engine-v219.js':
  file.includes('posse')?'meu-time-posse-4312.js':'meu-time-duas-formacoes-v177.js');
 assert(pos>=0&&pos<dependent,'Posição treinada precisa carregar ANTES da formação');
 assert(html.includes('OVR')||html.includes('eFHUB'));
}
for(const path of [
 'web/meu-time-duas-formacoes-v177.js',
 'web/meu-time-posse-4312.js'
]){const src=read(path);
 for(const s of ['positionTraining.status(', 'positionTraining.confirm(', 'data-v246-confirm',
  'data-v246-remove','identity.key('])
  assert(src.includes(s),path+' não usa '+s);
}
for(const path of ['web/sw.js','scripts/stamp-bundle-v189.cjs'])
 assert(read(path).includes('scout-position-training-v246.js'),'Offline Android/Windows incompleto: '+path);
console.log('V246 OK: 246 cartas intactas; Martinelli PTE→CA SOMENTE após confirmação local de treino; seleção e rodízio usam esse sinal; outras edições, GK, perfis e backup intactos.');
