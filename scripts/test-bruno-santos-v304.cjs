'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const friends=require('../web/craque-friends-v227.js');
const bruno=require('../web/craque-bruno-v304.js');
const engine=require('../web/craque-friends-training-v228.js');
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
const first=bruno.seed(friends.empty(),friends,storage);
assert.equal(first.changed,true);assert.equal(first.data.owners.length,1);
assert.equal(first.data.owners[0].name,'Bruno Santos CD');
assert.equal(first.data.cards.length,1);
const z=first.data.cards[0];
assert.equal(z.name,'Zico');assert.equal(z.position,'SA');assert.equal(z.style,'Armador criativo');
assert.equal(z.cardId,'');assert.equal(z.level,null);assert.equal(z.pp,null);
assert.equal(z.boosterSlot,'pendente');assert.equal(z.nativeSkills,'');
assert(z.notes.includes('106 SA'));assert(z.notes.includes('108 MAT'));
for(const mode of engine.MODES){
 const x=engine.evaluate(z,mode);
 assert.equal(x.plan.status,'pendente','PP inventado para '+mode);
 assert.equal(x.plan.levels,null);
 assert.equal(x.boosterEligible,false);
}
const stable=bruno.seed(friends.read(storage),friends,storage);
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
console.log('V304 PASS: Zico 106 SA em Bruno Santos CD; foto SHA exato; cinco fichas PP pendentes; preservação de usuários/backup, sem duplicatas e sem ressuscitar exclusões; 246 cartas intactas.');
