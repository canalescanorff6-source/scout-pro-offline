'use strict';
/* V231: 2 formações x 5 estilos: 10 elencos independentes, sem perder Posse.
 * Nenhuma das 246 cartas é alterada, nem fichas, PP, ou bloqueios.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const profiles=require('../web/craque-lineup-profiles-v231.js');
const data=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json'));
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
const ids=new Map(roster.cards.map(x=>[x.numero,x]));
const original=JSON.stringify(roster.cards),formations=JSON.stringify(data);
assert.equal(roster.cards.length,246);assert.equal(data.formations.length,2);
assert.equal(Object.keys(profiles.MODES).length,5);
const saved=new Map([
 ['scoutpro:v219:black-caps','[12,40,21]'],
 ['scoutpro:training-original','{"approved":true}']
]);
const storage={
 getItem:key=>saved.get(key)??null,
 setItem:(key,val)=>saved.set(key,String(val)),
 removeItem:key=>saved.delete(key)
};
for(const f of data.formations){
 const key=profiles.oldKey(f.id);
 const base=profiles.defaults(f);
 assert.equal(Object.keys(base).length,11);
 assert(profiles.validate(f,base,ids));
 saved.set(key,JSON.stringify({schema:data.schema,slots:base}));
 assert.deepEqual(profiles.read(f,'posse',storage,ids),base);
 for(const mode of Object.keys(profiles.MODES)){
  const initial=profiles.read(f,mode,storage,ids);
  assert.deepEqual(initial,base,'New tactic copies original possession initially');
  if(mode==='posse')continue;
  assert(!profiles.hasSaved(f,mode,storage,ids));
  const used=new Set(Object.values(initial));
  const firstSlot=Object.keys(initial)[0];
  const orig=initial[firstSlot];
  const alternative=roster.cards.find(c=>!used.has(c.numero)&&
   ['GO','GR'].includes(c.posicao.toUpperCase())===['GO','GR'].includes(roster.cards.find(x=>x.numero===orig).posicao.toUpperCase()));
  assert(alternative,'Expected a replacement of same goalkeeper category');
  const next={...initial,[firstSlot]:alternative.numero};
  const result=profiles.save(f,mode,next,storage,ids);
  assert.equal(result.key,profiles.profileKey(f.id,mode));
  assert(profiles.hasSaved(f,mode,storage,ids));
  assert.deepEqual(profiles.read(f,mode,storage,ids),next);
  assert.deepEqual(profiles.read(f,'posse',storage,ids),base,'Possession should stay intact');
  for(const other of Object.keys(profiles.MODES).filter(x=>x!==mode&&x!=='posse')){
   if(!profiles.hasSaved(f,other,storage,ids))
    assert.deepEqual(profiles.read(f,other,storage,ids),base,'Other tactics unchanged');
  }
  const corrupt={...next,[firstSlot]:Object.values(next)[1]};
  assert.equal(profiles.validate(f,corrupt,ids),false,'Duplicate starter not allowed');
  assert.throws(()=>profiles.save(f,mode,corrupt,storage,ids),/inválida/);
  const wrong={...next,[firstSlot]:9999};
  assert.equal(profiles.validate(f,wrong,ids),false);
  const imported={schema:profiles.SCHEMA,formation:f.id,mode,slots:wrong};
  saved.set(profiles.profileKey(f.id,mode),JSON.stringify(imported));
  assert.deepEqual(profiles.read(f,mode,storage,ids),base,'Corrupt profile safely ignored');
  profiles.save(f,mode,next,storage,ids);
 }
 // A Posse continua usando a chave original para compatibilidade e backup.
 const revised=profiles.read(f,'posse',storage,ids);
 profiles.save(f,'posse',revised,storage,ids);
 assert.equal(JSON.parse(saved.get(key)).schema,data.schema);
}
for(const f of data.formations)for(const mode of Object.keys(profiles.MODES)){
 assert.equal(Object.keys(profiles.read(f,mode,storage,ids)).length,11);
 assert(profiles.hasSaved(f,mode,storage,ids));
}
assert.equal(saved.get('scoutpro:v219:black-caps'),'[12,40,21]');
assert.equal(saved.get('scoutpro:training-original'),'{"approved":true}');
assert.equal(JSON.stringify(roster.cards),original);
assert.equal(JSON.stringify(data),formations);
const html=read('web/meu-time-duas-formacoes-v177.html');
assert(html.indexOf('src="craque-lineup-profiles-v231.js"')<html.indexOf('src="meu-time-duas-formacoes-v177.js"'));
const ui=read('web/craque-formation-ui-v230.js');
const editor=read('web/meu-time-duas-formacoes-v177.js');
assert(ui.includes('manager?.setMode?.(mode)'));
assert(editor.includes('profiles.save(active(),activeMode,currentSelections()'));
assert(editor.includes('window.CRAQUE_FORMATION_STATE_V231'));
assert(!editor.includes('allSelections[activeId]'),'No legacy shared formation-only state');
assert(editor.includes("activeMode=profiles.selectedMode(localStorage,id)"));
for(const file of ['web/sw.js','scripts/stamp-bundle-v189.cjs']){
 assert(read(file).includes('craque-lineup-profiles-v231.js'),'V231 not in offline/Windows/Android bundle: '+file);
}
console.log('V231 PASS: 2 formações × 5 estilos, 10 elencos independentes, substituições válidas, recuperação de perfis corrompidos, Posse preservada, bloqueios e 246 cartas intactos.');
