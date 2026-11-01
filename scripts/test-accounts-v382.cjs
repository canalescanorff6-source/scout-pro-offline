'use strict';
const assert=require('node:assert/strict'),A=require('../web/craque-accounts-v382.js');
function memory(){const m=new Map([['scoutpro:legacy-proof','original']]);return {m,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k),key:i=>[...m.keys()][i],get length(){return m.size;}};}
const store=memory();assert.equal(A.read(store).active,'primary');assert.equal(store.m.size,1,'Leitura não migra dados por escrita');
const draft={schema:A.DRAFT,account:{name:'Secundária'},cards:[{id:'video-forlan',name:'Diego Forlán',position:'CA',maxLevel:31,pp:60,
 trainingLevels:[9,0,4,12,8,4,0,1,0,0],offenseStyle:'Artilheiro',defenceStyle:'Básico',positions:['CA'],cardId:'',edition:'Uruguai; data pendente'}],managers:[]};
let r=A.importDraft(store,draft);assert.equal(r.added,1);assert.equal(A.read(store).secondary.cards[0].defenceStyle,'Básico');
assert.equal(A.importDraft(store,draft).added,0,'Reimportar não duplica instâncias');
assert.throws(()=>A.importDraft(store,{...draft,cards:[{...draft.cards[0],name:'Outro'}]}),/conflit/i);
const sources={originals:[{numero:1,name:'Diego Forlán',id:'12345678',posicao:'CA',max_level:32,pp:62,versao:'Outra edição',habilidades_nativas:''}],owned:[],extras:[]};
assert.equal(A.roster('primary',sources,store)[0].pp,62);assert.equal(A.roster('secondary',sources,store)[0].pp,60);
A.select(store,'secondary');assert.equal(A.read(store).active,'secondary');assert.equal(store.getItem('scoutpro:legacy-proof'),'original');
let doc=A.read(store);doc.plans.primary.p={accountId:'primary',id:'p',signature:'one'};doc.plans.secondary.p={accountId:'secondary',id:'p',signature:'two'};A.save(store,doc);
A.afterRestore(store,{legacy:true});doc=A.read(store);assert.equal(doc.active,'primary');assert.equal(doc.plans.primary.p.stale,true);assert.equal(doc.plans.secondary.p.signature,'two');
assert.equal(doc.secondary.cards.length,1);
assert.throws(()=>A.select(store,'missing'),/conta/i);
assert.throws(()=>A.importDraft(store,{...draft,cards:[{...draft.cards[0],id:'bad',pp:62}]}),/PP|orçamento/i);
const before=store.getItem(A.KEY);store.setItem=(k,v)=>{if(k===A.KEY)throw Error('quota');store.m.set(k,v);};
assert.throws(()=>A.select(store,'secondary'),/salvar|quota/i);assert.equal(store.getItem(A.KEY),before,'Falha preserva registro anterior');
const broken=memory();broken.setItem(A.KEY,'broken');assert.throws(()=>A.read(broken),/preservad|inválid|ilegível/i);assert.equal(broken.getItem(A.KEY),'broken');
console.log('V382 ACCOUNTS PASS: contas isoladas, importação privada idempotente, restauração antiga e rollback.');
