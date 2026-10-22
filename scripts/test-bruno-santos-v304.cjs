'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const friends=require('../web/craque-friends-v227.js');
const bruno=require('../web/craque-bruno-v304.js');
const engine=require('../web/craque-friends-training-v228.js');
const engines={tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),
 boosters:require('../web/booster-engine-v103.js')};
const original=read('web/SCOUT_V69_AUDITORIA.json');
assert.equal(JSON.parse(original).cards.length,246);
assert.equal(bruno.NAME,'Bruno Santos CD');
assert.equal(bruno.CARD_ID,'bruno-santos-cd:zico:106-sa:print-20261021');
const bytes=Buffer.from(bruno.PHOTO.split(',')[1],'base64');
assert.equal(bytes.length,1731,'Foto embutida incompleta');
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),
 '0bbd8bcae90283b4646885667764561277027e7c7b8601c91c73584ab90675e9',
 'Miniatura precisa ser derivada sem corrupção do print enviado');
assert.equal(bytes[0],255);assert.equal(bytes[1],216);
assert.equal(bytes.at(-2),255);assert.equal(bytes.at(-1),217);
assert(friends.bytes(bruno.PHOTO)<friends.MAX_IMAGE);
const fake=()=>{
 const saved=new Map();
 return {getItem:k=>saved.has(k)?saved.get(k):null,setItem:(k,v)=>saved.set(k,String(v)),
  removeItem:k=>saved.delete(k)};
};
const storage=fake();
const first=bruno.seed(friends.empty(),friends,storage,engine,engines);
assert.equal(first.changed,true);assert.equal(first.data.owners.length,1);
assert.equal(first.data.owners[0].name,'Bruno Santos CD');
assert.equal(first.data.cards.length,1);
const z=first.data.cards[0];
assert.equal(z.name,'Zico');assert.equal(z.position,'SA');assert.equal(z.style,'Armador criativo');
assert.equal(z.cardId,'');assert.equal(z.level,35);assert.equal(z.pp,68);
assert.equal(z.boosterSlot,'pendente');assert.equal(z.nativeSkills,'');
assert(z.notes.includes('106 SA'));assert(z.notes.includes('108 MAT'));
for(const mode of engine.MODES){
 const x=engine.evaluate(z,mode,engines);
 assert.equal(x.plan.status,'hipotese','PP confirmados devem gerar simulação para '+mode);
 assert.equal(x.plan.pp,68);
 assert.equal(x.plan.remaining,0);
 assert.equal(engines.tactical.total(x.plan.levels),68);
 assert.equal(x.boosterEligible,false);
}
assert(engine.validateSaved(z,z.analysis,engines),'Cinco fichas do Zico persistidas e válidas');
assert(z.notes.includes('Confirmação do proprietário'));
const stable=bruno.seed(friends.read(storage),friends,storage,engine,engines);
assert.equal(stable.changed,false);
assert.equal(stable.data.owners.length,1);assert.equal(stable.data.cards.length,1);
// Respeitar outra pessoa e suas cartas em uma instalação anterior.
const unrelated=friends.addOwner(friends.empty(),'Ana');
const ana=unrelated.owners[0];
const withCard=friends.saveCard(unrelated,{ownerId:ana.id,name:'Messi',edition:'Épico Ana'});
const local=fake(),added=bruno.seed(withCard,friends,local).data;
assert.equal(added.owners.length,2);assert.equal(added.cards.length,2);
assert.deepEqual(added.cards.find(c=>c.ownerId===ana.id),withCard.cards[0]);
// Integrar Bruno existente pelo nome, sem criar cópia ou sobrescrever Zico editado.
const existing=friends.addOwner(friends.empty(),'Bruno Santos CD');
const owner=existing.owners[0];
const legacy=friends.saveCard(existing,{ownerId:owner.id,name:'Zico',position:'SA',
 edition:'Print 106 SA',notes:'106 SA — ficha já preenchida manualmente',pp:60,cardId:'manual-confirmado'});
const local2=fake(),merged=bruno.seed(legacy,friends,local2);
assert.equal(merged.data.owners.length,1);assert.equal(merged.data.cards.length,1);
assert.equal(merged.data.cards[0].pp,60,'Nunca alterar PP existente');
// Migração real: instalação antiga com marca V304 'ok' e Zico 106 SA ainda com PP vazios.
const oldStore=fake();
let oldDoc=friends.addOwner(friends.empty(),'Bruno Santos CD');
let oldOwner=oldDoc.owners[0];
oldDoc=friends.saveCard(oldDoc,{id:bruno.CARD_ID,ownerId:oldOwner.id,name:'Zico',
 edition:'Edição não identificada · print 106 SA',position:'SA',style:'Armador criativo',
 cardId:'',level:null,pp:null,notes:'362 partidas; print 106 SA',image:bruno.PHOTO});
friends.write(oldStore,oldDoc);
oldStore.setItem(bruno.MARK,'ok');
const upgraded=bruno.seed(friends.read(oldStore),friends,oldStore,engine,engines);
assert.equal(upgraded.changed,true);
assert.equal(upgraded.reason,'nivel_pp_confirmados');
assert.equal(upgraded.data.cards.length,1,'Não duplicar Zico existente');
assert.equal(upgraded.data.cards[0].id,bruno.CARD_ID);
assert.equal(upgraded.data.cards[0].level,35);assert.equal(upgraded.data.cards[0].pp,68);
assert.equal(upgraded.data.cards[0].image,bruno.PHOTO,'Não substituir a miniatura');
assert(engine.validateSaved(upgraded.data.cards[0],upgraded.data.cards[0].analysis,engines));
const repeat=bruno.seed(friends.read(oldStore),friends,oldStore,engine,engines);
assert.equal(repeat.changed,false,'Migração idempotente');
assert.equal(repeat.data.cards.length,1);
// Preservar nível, PP e fichas diferentes quando já alterados pelo proprietário.
const manualStore=fake();manualStore.setItem(bruno.MARK,'ok');
const manual=friends.saveCard(oldDoc,{...oldDoc.cards[0],level:31,pp:60,notes:'Ajuste manual da edição, não migrar'});
friends.write(manualStore,manual);
const retained=bruno.seed(friends.read(manualStore),friends,manualStore,engine,engines);
assert.equal(retained.changed,false);assert.equal(retained.data.cards[0].pp,60);
assert.equal(retained.data.cards[0].level,31);
// Uma carta Zico de outra edição na mesma coleção nunca pode ser alterada.
const alternativeStore=fake();alternativeStore.setItem(bruno.MARK,'ok');
const otherEdition=friends.saveCard(oldDoc,{id:'zico-mat-outro',ownerId:oldOwner.id,name:'Zico',
 position:'MAT',edition:'108 MAT',level:null,pp:null});
friends.write(alternativeStore,otherEdition);
const excluded=bruno.seed(friends.read(alternativeStore),friends,alternativeStore,engine,engines);
assert.equal(excluded.data.cards.find(x=>x.id==='zico-mat-outro').level,null);
assert.equal(excluded.data.cards.length,2);
// Uma exclusão explícita não pode provocar ressurgimento no próximo início.
let deleted=friends.removeCard(first.data,first.data.owners[0].id,z.id);
friends.write(storage,deleted);
const afterRemove=bruno.seed(friends.read(storage),friends,storage);
assert.equal(afterRemove.data.cards.length,0,'Não restaurar carta excluída pelo usuário');
assert.equal(afterRemove.changed,false);
const page=read('web/outros-elencos-v227.html'),ui=read('web/craque-friends-page-v227.js');
assert(page.includes('Bruno Santos CD'));
assert(page.indexOf('craque-bruno-v304.js')<page.indexOf('craque-friends-page-v227.js'));
assert(ui.includes('bruno.seed(data,api,localStorage)'));
assert(ui.includes("bruno-open-collection"));
assert(read('web/sw.js').includes("'./craque-bruno-v304.js'"));
assert(read('scripts/stamp-bundle-v189.cjs').includes("'craque-bruno-v304.js'"));
assert.deepEqual(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')),
 JSON.parse(original),'246 cartas oficiais foram modificadas');
console.log('V310 PASS: Zico 106 SA nível 35/68 PP, cinco fichas, migração V304 idempotente, foto SHA, dados manuais/outras edições/exclusões preservados; 246 originais intactas.');
