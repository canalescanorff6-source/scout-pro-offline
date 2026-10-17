'use strict';
/* V230 — PT-BR verificado, identidade da logo, cinco táticas, ícones novos.
 * 246 originais, 23 bloqueios, histórico antigo e treino aprovado não podem mudar.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const boost=require('../web/booster-engine-v103.js');
const pt=require('../web/craque-impetos-ptbr-v230.js');
const icons=require('../web/craque-training-icons-v230.js');
const tactics=require('../web/craque-tactics-v230.js');
const lab=require('../web/scout-rotation-engine-v219.js');
const master=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
const formations=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
assert.equal(master.cards.length,246);assert.equal(formations.length,2);
assert.equal(Object.keys(pt.NAMES).length,28);
assert.deepEqual(new Set(Object.keys(pt.NAMES)),new Set(boost.CRAFTABLE));
assert.equal(pt.label('Shutdown'),'Guardião');
assert.equal(pt.label('Saving'),'Defesaça');
assert.equal(pt.label('Hard Worker'),'Motor do time');
assert.equal(pt.label('Striker\'s Instinct'),'Instinto artilheiro');
assert.equal(pt.label('Protect the Ball'),'Proteção de bola');
assert.equal(pt.label('Ball Protection'),'Proteção de bola');
assert.equal(pt.keyFor('Guardião'),'Shutdown');
assert.equal(pt.isOfficial('Guardião'),true);
assert.equal(pt.isOfficial('Proteção de bola'),false);
assert.equal(pt.isOfficial('Precisão'),true);
assert.equal(pt.isOfficial('Força'),true);
assert.equal(pt.translate('Protect the Ball +3, Shutdown +1, Saving +2'),'Proteção de bola +3, Guardião +1, Defesaça +2');
assert.equal(boost.boosterName('Shutdown'),'Shutdown','Canonical engine remains English');
assert.equal(boost.boosterName('Ball Protection'),'Ball Protection');
assert.equal(pt.translate('Heading; Through Passing; Chute +1'),'Heading; Through Passing; Chute +1');
const table=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
const pristine=JSON.stringify(table.cards);
assert.equal(Object.keys(icons.SHAPES).length,10);
assert.equal(new Set(Object.values(icons.SHAPES)).size,10);
for(const key of ['chute','passe','drible','destreza','pernas','aereo','defesa','goleiro1','goleiro2','goleiro3']){
 const svg=icons.render(key);assert(svg.includes('data-scout-v206-symbol="'+key+'"'));assert(svg.includes('scout-v230-svg'));assert(svg.includes('<path'));assert(!/<(?:image|foreignObject|script|iframe|use)\b/i.test(svg));
 const big=icons.render(key,true);assert(big.includes('scout-v208-svg'));assert(big.includes('data-scout-v230-symbol="'+key+'"'));
}
assert.equal(icons.render('unknown'),''),assert.equal(icons.upgrade(null),false);
assert.equal(Object.keys(tactics.MODES).length,5);
assert.deepEqual(Object.keys(tactics.MODES),boost.tactics);
for(const f of formations){
 for(const slot of f.starters){
  const player=master.cards.find(c=>c.numero===slot.cap);
  assert(player,'Official card exists for '+slot.slot);
  for(const mode of Object.keys(tactics.MODES)){
   const r=tactics.score(player,slot.slot,mode);
   assert(Number.isFinite(r.score)&&r.score>=-100&&r.score<=100);
   assert(r.confidence);assert(r.why.includes('sem Overall'));
  }
 }
}
let exclusions=master.cards.slice(0,23).map(c=>c.numero);
for(const f of formations){
 const original=lab.build(master.cards,f,exclusions,1);
 const explicit=lab.build(master.cards,f,exclusions,1,'posse');
 assert.deepEqual(original,explicit,'Possession legacy build unchanged');
 for(const tactic of Object.keys(tactics.MODES)){
  const result=lab.build(master.cards,f,exclusions,1,tactic);
  assert.equal(result.tactic,tactic);
  assert(result.teams.length>0);
  assert(result.teams.every(team=>team.tactic===tactic));
  const inSheet=result.teams.flatMap(x=>[...x.starters.map(p=>p.cap),...x.bench.map(p=>p.cap)]);
  assert.equal(inSheet.length,new Set(inSheet).size,'No duplicate within mode '+tactic);
  assert(inSheet.every(n=>!exclusions.includes(n)),'Never field blocked cards');
  assert.equal(result.leftovers.length+inSheet.length,223);
 }
}
assert.equal(JSON.stringify(table.cards),pristine);
const manual=read('web/meu-time-duas-formacoes-v177.html');
const rotation=read('web/meu-time-testes-v219.html');
for(const marker of ['id="ct-v230-tactic-profile"','id="ct-v230-tactic-tabs"','id="ct-v230-tactic-details"','craque-tactics-v230.js','craque-formation-ui-v230.js'])
 assert(manual.includes(marker),'Manual tactic UI missing '+marker);
for(const mode of Object.keys(tactics.MODES))assert(rotation.includes('data-tactic-mode="'+mode+'"'));
assert(rotation.indexOf('src="craque-tactics-v230.js"')<rotation.indexOf('src="scout-rotation-engine-v219.js"'));
assert(read('web/scout-rotation-lab-v219.js').includes('recompute();'));
const design=read('web/craque-design-v230.css');
assert(design.includes('#scout-v188-principal .scout-v188-progress.scout-v208-reference'));
assert(design.includes('ct-v230-tactic-tabs'));
assert(design.includes('.ct-frame'));
assert(design.includes('#eac36c'));
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const f of ['craque-design-v230.css','craque-impetos-ptbr-v230.js','craque-training-icons-v230.js','craque-tactics-v230.js','craque-formation-ui-v230.js']){
 assert(sw.includes("'./"+f+"'"),'Offline missing '+f);
 assert(stamp.includes("'"+f+"'"),'Android/Windows bundle missing '+f);
}
assert(bridge.includes("v189Root+'craque-design-v230.css'"));
assert(bridge.includes("v189Root+'craque-impetos-ptbr-v230.js'"));
assert(bridge.includes("v189Root+'craque-training-icons-v230.js'"));
assert(!read('web/scout-card-curation-v229.js').includes('CRAQUE_TACTICS_V230'),'Preserve V229 card principal');
console.log('V230 PASS: 28 PT-BR names (official/descriptive), 10 crest icons, 5 tactics x 2 formations x 246, no blocked cards, no catalog changes.');
