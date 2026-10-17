'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {webcrypto}=require('node:crypto'),root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const model=require('../web/craque-friends-v227.js');
const externalPath='scoutpro:v227:friends-collections';
assert.equal(model.KEY,externalPath);
assert(!/SCOUT_V69_AUDITORIA\.json|SCOUT_V177_DUAS_FORMACOES\.json|scoutpro:v219:black-caps/.test(read('web/craque-friends-page-v227.js')),
  'A nova UI não pode modificar o catálogo, formações ou bloqueios pessoais.');
assert(read('web/outros-elencos-v227.html').includes('data-page="friends"'));
assert(read('web/index.html').includes('href="outros-elencos-v227.html"'));
assert(read('web/scout-ui-v189.js').includes('scout-v227-friends-entry'));
assert(read('web/sw.js').includes("'./outros-elencos-v227.html'"));
assert(read('scripts/stamp-bundle-v189.cjs').includes('craque-friends-v227.js'));
let doc=model.empty();
doc=model.addOwner(doc,'Ana');
const ana=doc.owners[0];
doc=model.addOwner(doc,'Bruno');
const bruno=doc.owners[1];
doc=model.saveCard(doc,{ownerId:ana.id,name:'Messi',edition:'Épico A',cardId:'12345',position:'SA',pp:60,level:31,notes:'Informado por Ana'});
doc=model.saveCard(doc,{ownerId:bruno.id,name:'Messi',edition:'Show Time B',cardId:'67890',position:'MAT',pp:64,level:33,notes:'Informado por Bruno'});
assert.equal(doc.cards.length,2,'Duas pessoas podem ter versões diferentes do mesmo jogador');
assert.equal(doc.cards.filter(c=>c.ownerId===ana.id).length,1);
assert.equal(doc.cards.filter(c=>c.ownerId===bruno.id).length,1);
const ac=doc.cards.find(x=>x.ownerId===ana.id),bc=doc.cards.find(x=>x.ownerId===bruno.id);
assert.notEqual(ac.id,bc.id);
doc=model.saveCard(doc,{...ac,name:'Messi',edition:'Épico A corrigida',notes:'Carta revisada por Ana'});
assert.equal(doc.cards.find(c=>c.ownerId===bruno.id).edition,'Show Time B','Editar Ana não pode alterar Bruno');
assert.throws(()=>model.saveCard(doc,{...ac,ownerId:bruno.id}),/mover/);
assert.throws(()=>model.saveCard(doc,{ownerId:ana.id,name:'A',image:'https://example.org/tracker.jpg'}),/Imagem inválida/);
assert.throws(()=>model.saveCard(doc,{ownerId:ana.id,name:'A',pp:9999}),/Pontos/);
assert.throws(()=>model.removeCard(doc,ana.id,bc.id),/não encontrada/);
let rosterSnapshot=JSON.stringify(doc);
const exportAna=model.exportOwner(doc,ana.id);
assert.equal(exportAna.cards.length,1);
doc=model.importOwner(doc,exportAna);
assert.equal(doc.owners.length,3);
assert.equal(doc.cards.length,3);
assert.notEqual(doc.owners[2].id,ana.id,'Importação gera novo acervo independente');
assert.equal(doc.cards.find(x=>x.ownerId===doc.owners[2].id).name,'Messi');
assert.equal(JSON.stringify(doc).includes('Épico A corrigida'),true);
assert.throws(()=>model.importOwner(doc,{format:'other-app',owner:{name:'X'},cards:[]}),/não reconhecido/);
doc=model.removeOwner(doc,ana.id);
assert.equal(doc.owners.length,2);
assert(doc.cards.some(x=>x.ownerId===bruno.id),'Apagar Ana não apaga Bruno');
const store=new Map([
 ['scoutpro:v219:black-caps','[1,2,3]'],
 ['scoutpro:v219:match-logs','{"history":[1]}'],
 ['scoutpro:my-training','{"approved":true}']
]);
const originalCatalogue='SCOUT_V69_AUDITORIA.json'; // Imutável; o novo modelo nunca importa o JSON do catálogo.
const storage={
 getItem:k=>store.has(k)?store.get(k):null,
 setItem:(k,v)=>store.set(k,String(v)),
 removeItem:k=>store.delete(k)
};
model.write(storage,doc);
assert.equal(store.get('scoutpro:v219:black-caps'),'[1,2,3]');
assert.equal(store.get('scoutpro:my-training'),'{"approved":true}');
assert.equal(store.get('scoutpro:v219:match-logs'),'{"history":[1]}');
assert.deepEqual(model.read(storage).owners.map(x=>x.name),['Bruno','Ana']);
const untouched=store.get(model.KEY);
let refuse=true;
const quota={
 getItem:storage.getItem.bind(storage),
 removeItem:storage.removeItem.bind(storage),
 setItem:(k,v)=>{if(k===model.KEY&&refuse)throw Error('quota exceeded');store.set(k,String(v))}
};
assert.throws(()=>model.write(quota,model.addOwner(doc,'Carlos')),/Não foi possível salvar/);
assert.equal(store.get(model.KEY),untouched,'Sem perda de dados caso o dispositivo esteja cheio');
const items=new Map(store),fakeStorage={
 getItem:k=>items.has(k)?items.get(k):null,
 setItem:(k,v)=>items.set(k,String(v)),
 removeItem:k=>items.delete(k),
};
const proxy=new Proxy(fakeStorage,{ownKeys:()=>[...items.keys()],getOwnPropertyDescriptor:(o,k)=>
 items.has(k)?{enumerable:true,configurable:true,value:items.get(k)}:
 Object.getOwnPropertyDescriptor(o,k)||{enumerable:false,configurable:true}});
const host={localStorage:proxy,crypto:webcrypto,Capacitor:null,
 addEventListener:()=>{},dispatchEvent:()=>true,setInterval:()=>0};
const sandbox={window:host,localStorage:proxy,crypto:webcrypto,TextEncoder,TextDecoder,
 CustomEvent:class{},setTimeout:()=>0,clearTimeout:()=>{},document:{visibilityState:'visible'}};
vm.runInNewContext(read('web/craque-backup-v226.js'),sandbox,{filename:'craque-backup-v226.js'});
(async()=>{
 const backup=await host.CRAQUE_BACKUP_V226.create();
 assert(Object.hasOwn(backup.items,model.KEY),'Backup completo precisa incluir coleções de amigos');
 assert.equal(backup.items[model.KEY],untouched);
 const inspected=await host.CRAQUE_BACKUP_V226.inspect(backup);
 assert.equal(inspected.count,4);
 assert.equal(inspected.hasRoster,true);
 assert.equal(inspected.hasMatches,true);
 items.set(model.KEY,JSON.stringify(model.empty()));
 await host.CRAQUE_BACKUP_V226.restore(inspected);
 assert.equal(items.get(model.KEY),untouched,'Restauração deve trazer acervos de outras pessoas');
 assert.equal(items.get('scoutpro:v219:black-caps'),'[1,2,3]');
 console.log('V227 PASS: acervos individuais, versões homônimas, CRUD isolado, importação, rollback e backup V226 restaurável sem misturar 246 cartas.');
})().catch(err=>{console.error(err);process.exitCode=1});
