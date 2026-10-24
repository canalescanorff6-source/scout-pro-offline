'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'web/craque-sete-v357.js'),'utf8');
const friends=require('../web/craque-friends-v227.js');
const seven=require('../web/craque-sete-v357.js');
const engine=require('../web/craque-friends-training-v228.js');
const engines={tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
const fake=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,
 setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
const store=fake(),base=friends.empty(),first=seven.seed(base,friends,store,engine,engines);
assert(first.changed&&first.inserted===3);
assert.equal(first.data.owners.length,1);assert.equal(first.data.owners[0].name,'7$');
assert.equal(first.data.cards.length,3);
const expected=[['Eden Hazard','89137214427270','MAT',33,64],
 ['Pavel Nedvěd','88041460993477','MLG',33,64],
 ['Jude Bellingham','89138556700485','MAT',32,62]];
for(const [name,id,position,level,pp] of expected){
 const c=first.data.cards.find(x=>x.cardId===id);
 assert.equal(c.name,name);assert.equal(c.position,position);
 assert.equal(c.level,level);assert.equal(c.pp,pp);
 assert.equal(c.boosterSlot,'pendente');assert.equal(c.skills,'');assert.equal(c.booster,'');
 assert(/simulador/i.test(c.notes));assert(c.image.startsWith('data:image/webp;base64,'));
 assert(friends.bytes(c.image)<=friends.MAX_IMAGE);
 const image=Buffer.from(c.image.split(',')[1],'base64');
 assert(image.length>12000,'Recorte da carta não pode ser um ícone borrado');
 assert.equal(image.subarray(0,4).toString(),'RIFF');
 for(const mode of engine.MODES){
  const result=engine.evaluate(c,mode,engines);
  assert.equal(result.plan.status,'hipotese');
  assert.equal(result.plan.pp,pp);
  assert.equal(result.plan.remaining,0);
  assert.equal(engines.tactical.total(result.plan.levels),pp);
  assert.equal(result.boosterEligible,false,'eFHub não comprova slot equipado na conta');
 }
 assert(engine.validateSaved(c,c.analysis,engines),'Fichas guardadas devem ser válidas');
}
const ned=first.data.cards.find(x=>x.name==='Pavel Nedvěd');
assert(ned.nativeSkills.includes('Foguete Rasante'));
const hazard=first.data.cards.find(x=>x.name==='Eden Hazard');
assert(hazard.nativeSkills.includes('Cola nos Pés'));
const jude=first.data.cards.find(x=>x.name==='Jude Bellingham');
assert(jude.nativeSkills.includes('Ímpeto de Ataque'));
const stable=seven.seed(friends.read(store),friends,store,engine,engines);
assert.equal(stable.changed,false);assert.equal(stable.data.cards.length,3);
// Se o proprietário excluir uma carta, não reintroduzir na próxima abertura.
let edited=friends.removeCard(friends.read(store),first.ownerId,hazard.id);
friends.write(store,edited);
const afterRemove=seven.seed(friends.read(store),friends,store,engine,engines);
assert.equal(afterRemove.data.cards.length,2);
assert.equal(afterRemove.changed,false);
// Pessoa cadastrada manualmente antes da atualização não deve ser substituída.
let pre=friends.addOwner(friends.empty(),'7$');const own=pre.owners[0];
pre=friends.saveCard(pre,{ownerId:own.id,name:'Eden Hazard',cardId:'89137214427270',level:40,pp:78,position:'SA',notes:'build pessoal, preservar'});
const old=fake();const migrated=seven.seed(pre,friends,old,engine,engines);
assert.equal(migrated.data.owners.length,1);
assert.equal(migrated.data.cards.length,3);
assert.equal(migrated.data.cards.find(x=>x.cardId==='89137214427270').pp,78);
assert.equal(migrated.data.cards.find(x=>x.cardId==='89137214427270').position,'SA');
assert(source.includes('recortes dos prints'));
const html=fs.readFileSync(path.join(root,'web/outros-elencos-v227.html'),'utf8');
assert(html.includes('craque-sete-v357.js'));
assert(html.indexOf('craque-sete-v357.js')<html.indexOf('craque-friends-page-v227.js'));
const page=fs.readFileSync(path.join(root,'web/craque-friends-page-v227.js'),'utf8');
assert(page.includes('sete.seed'));
assert(page.includes('sete.renderEvidence'));
assert(page.includes('sete.renderShortcut'));
assert.equal(JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'))).cards.length,246);
console.log('V357 OK: 7$ automático, 3 IDs/edições, 15 fichas, fotos WEBP, migração segura, 246 cartas intocadas.');