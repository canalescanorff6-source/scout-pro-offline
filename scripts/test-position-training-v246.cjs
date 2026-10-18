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
assert.equal(originalSuit.kind,'treinamento CA não confirmado');
assert.equal(originalSuit.score,-100,'Ponta nunca entra como CA automaticamente sem evidência');
const proof=P.confirm(martinelli,'CA',true,store);
assert.equal(proof.status,'treinada');
assert.equal(proof.eligible,true);
assert.equal(P.status(martinelli,'CA').status,'treinada');
assert.equal(Tactical.fit(martinelli,'cae').match,true);
assert.equal(Tactical.fit(martinelli,'cad').label,'Treinamento aplicado — confirmado pelo usuário');
assert.equal(Rotation.suitability(martinelli,'cae').kind,'posição treinada confirmada');
assert.equal(Rotation.suitability(martinelli,'cae').score,84);
assert(read('web/scout-rotation-engine-v219.js').includes('positionConfirmed(s.fit)'),
 'Equipe não deve tratar posição treinada comprovada como adaptação provisória');
assert.equal(P.status(martinelli,'MAT').eligible,false,
 'CA confirmado não autoriza automaticamente MAT, SA ou outra função');
// Mesma pessoa ou nome com outro Card ID é OUTRA edição e não herda treino.
assert.equal(P.status({...martinelli,numero:188,id:'9999'},'CA').eligible,false);
assert.equal(P.status({...martinelli,id:'333333'},'CA').eligible,false);
assert.equal(P.status({...martinelli,numero:190},'CA').eligible,false);
const l191=JSON.parse(storageData.get(P.KEY));
assert.deepEqual(l191.entries[P.edition(martinelli)].treinada,['CA']);
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
// Posição NATURAL secundária confirmada não é a mesma coisa que treino.
P.confirm(martinelli,'MAT',true,store,'familiar');
assert.equal(P.status(martinelli,'MAT').status,'familiar');
assert.equal(Rotation.suitability(martinelli,'mat').kind,'familiaridade confirmada');
assert.equal(Tactical.fit(martinelli,'mat').match,true);
assert.equal(P.status({...martinelli,id:'outra-edicao'},'MAT').eligible,false);
P.confirm(martinelli,'MAT',false,store,'familiar');
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
 if(!file.includes('testes'))assert(html.includes('OVR')||html.includes('eFHUB'),
  'Editores devem distinguir Overall de familiaridade.');
}
for(const path of [
 'web/meu-time-duas-formacoes-v177.js',
 'web/meu-time-posse-4312.js'
]){const src=read(path);
 for(const s of ['positionTraining.status(', 'positionTraining.confirm(', 'data-v246-confirm',
  'data-v246-familiar','data-v246-remove','identity.key('])
  assert(src.includes(s),path+' não usa '+s);
}
for(const path of ['web/sw.js','scripts/stamp-bundle-v189.cjs'])
 for(const asset of ['scout-position-training-v246.js','scout-position-training-v246.css'])
  assert(read(path).includes(asset),'Offline Android/Windows incompleto: '+path+' / '+asset);
for(const path of ['web/meu-time-duas-formacoes-v177.html','web/meu-time-posse-4312.html'])
 assert(read(path).includes('scout-position-training-v246.css'),
  'Controle de posições treinadas sem estilo no Android: '+path);
const v246CSS=read('web/scout-position-training-v246.css');
assert(v246CSS.includes('min-height:44px'),'Área de toque premium reduzida');
assert(v246CSS.includes('prefers-reduced-motion'),'Acessibilidade de movimento preservada');
for(const mode of ['posse','normal','rapido','fora','longo']){
 P.confirm(martinelli,'CA',true,store);
 assert(Tactical.score(martinelli,'cae',mode).score>=0,
  'Martinelli CA treinado elegível em '+mode);
 P.confirm(martinelli,'CA',false,store);
}
console.log('V246 OK: 246 cartas intactas; Martinelli PTE→CA SOMENTE após confirmação local de treino; seleção e rodízio usam esse sinal; outras edições, GK, perfis e backup intactos.');


// Regressão real de backup/restauração V226 com os registros V246:
// o backup deve carregar as posições confirmadas e restaurar a edição exata,
// sem misturar familiaridade, treino, cartas ou históricos de outros módulos.
async function testV246BackupRoundTrip(){
 const vm=require('node:vm');
 const {webcrypto}=require('node:crypto');
 const saved=new Map();
 const target={
  getItem:k=>saved.has(k)?saved.get(k):null,
  setItem:(k,v)=>{saved.set(String(k),String(v));},
  removeItem:k=>saved.delete(k)
 };
 const local=new Proxy(target,{
  ownKeys:t=>[...Reflect.ownKeys(t),...saved.keys()],
  getOwnPropertyDescriptor:(t,k)=>saved.has(k)?
   {configurable:true,enumerable:true,writable:true,value:saved.get(k)}:
   Reflect.getOwnPropertyDescriptor(t,k)
 });
 const listeners=new Map();
 const host={
  localStorage:local,
  addEventListener:(event,handler)=>listeners.set(event,handler),
  dispatchEvent:event=>listeners.get(event.type)?.(event),
  setInterval:()=>0,
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}}
 };
 const context={
  window:host,localStorage:local,TextEncoder,crypto:webcrypto,
  CustomEvent:host.CustomEvent,document:{visibilityState:'visible'},
  setTimeout:()=>0,clearTimeout:()=>{}
 };
 vm.runInNewContext(read('web/craque-backup-v226.js'),context,
  {filename:'craque-backup-v226.js'});
 const backup=host.CRAQUE_BACKUP_V226;
 assert(backup,'Módulo real de backup V226 deve inicializar');
 local.setItem('scoutpro:v219:match-logs','{"partidas":1}');
 P.confirm(martinelli,'CA',true,local);
 const exported=await backup.create();
 assert.equal(exported.items[P.KEY],local.getItem(P.KEY),
  'Backup original precisa transportar posições V246 por Card ID');
 assert.equal(exported.items['scoutpro:v219:match-logs'],'{"partidas":1}',
  'Backup não pode descartar o histórico de partidas');
 const preview=await backup.inspect(exported);
 P.confirm(martinelli,'CA',false,local);
 P.confirm(martinelli,'MAT',true,local,'familiar');
 assert.equal(P.status(martinelli,'CA',local).eligible,false);
 assert.equal(P.status(martinelli,'MAT',local).eligible,true);
 const restored=await backup.restore(preview);
 assert.equal(restored.status,'restored');
 assert.equal(P.status(martinelli,'CA',local).status,'treinada',
  'Restauração precisa recuperar CA treinado nesta edição');
 assert.equal(P.status(martinelli,'MAT',local).eligible,false,
  'Backup não deve conservar familiaridade posterior sobreposta ao registro restaurado');
 assert.equal(P.status({...martinelli,id:'outra-edicao'},'CA',local).eligible,false,
  'Outra edição nunca pode herdar treino da carta restaurada');
 assert.equal(local.getItem('scoutpro:v219:match-logs'),'{"partidas":1}');
 await assert.rejects(
  backup.inspect({...exported,items:{...exported.items,[P.KEY]:'{"adulterado":true}'}}),
  /integridade|SHA-256/i,
  'Arquivo adulterado deve falhar antes de qualquer restauração');
 console.log('V246 BACKUP OK: exportação, checksum, prévia, restauração por edição e proteção de histórico.');
}
testV246BackupRoundTrip().catch(error=>{console.error(error);process.exitCode=1;});
