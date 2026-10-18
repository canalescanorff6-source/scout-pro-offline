'use strict';
/* Craque Tático V234 — sistema visual e movimento fiel às 246 artes.
 * Testes não alteram cartas, PP, treinamentos nem estruturas locais.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const audit=JSON.parse(read('web/SCOUT_V213_AUDITORIA_INDIVIDUAL.json')).cards;
assert.equal(roster.length,246);assert.equal(audit.length,246);
const cardsBefore=JSON.stringify(roster),auditBefore=JSON.stringify(audit);
const theme=read('web/craque-visual-system-v234.css');
const fx=read('web/craque-card-effects-v234.css');
const js=read('web/craque-card-effects-v234.js');
const bridge=read('web/app-bridge.js'),sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs'),script=read('package.json');
const files=['craque-visual-system-v234.css','craque-card-effects-v234.css','craque-card-effects-v234.js'];
for(const file of files){
 assert(bridge.includes("v189Root+'"+file+"'"),'All pages load '+file);
 assert(sw.includes("'./"+file+"'"),'Offline precache '+file);
 assert(stamp.includes("'"+file+"'"),'Same Android/Windows bundle '+file);
}
assert(bridge.indexOf("v189Root+'craque-role-panel-v233.css'")<
 bridge.indexOf("v189Root+'craque-visual-system-v234.css'"),'V234 must be final overriding sheet');
assert(bridge.indexOf("v189Root+'craque-design-v230.css'")<
 bridge.indexOf("v189Root+'craque-visual-system-v234.css'"),'Legacy green is overridden');
assert(sw.includes('v234-visual-motion'),'SW cache version updated');
for(const selection of [
 'body[data-page="catalog"]','body[data-page="detail"]','body[data-page="team"]',
 'body[data-page="rotation-lab"]','body[data-page="friends"]','#scout-app-bar',
 '.scout-v208-table','.ct-v233-', '#cards .player-card','.scout-v220-',
 '.scout-rotation-field','.friends-panel']){
 assert(theme.includes(selection),'Visual coverage: '+selection);
}
for(const color of ['#060d18','#0a1527','#f3cd77','#ffc629','#175c9f']){
 assert(theme.includes(color),'Original shield palette expected: '+color);
}
assert(!/#(?:00c853|00bd68|53e5b8|10d98b)\b/i.test(theme),'No neon greens reintroduced in app');
assert(theme.includes('Manter gramado reconhecível'),'Functional pitch is green');
assert(theme.includes('prefers-reduced-motion:reduce'),'CSS respects reduced motion');
for(const rarity of ['show','epic','big','highlight']){
 assert(fx.includes('data-scout-motion-rarity="'+rarity+'"'),'Unique rarity style: '+rarity);
}
assert(fx.includes('prefers-reduced-motion:reduce'));
assert(fx.includes('data-scout-motion-active="true"'));
assert(fx.includes('body.scout-motion-on'));
assert(fx.includes('hover:hover')&&fx.includes('pointer:fine'));
assert(fx.includes('.ct234-motion-prism'));
assert(fx.includes('animation-play-state:paused'));
assert(!/https?:\/\//.test(fx+js),'Motion remains offline and copyright clean');
assert(!/fetch\(|localStorage|setItem\(|innerHTML|sessionStorage|indexedDB/.test(js),
 'Motion addon never reads or writes roster, images, training, or settings');
const api=require('../web/craque-card-effects-v234.js');
assert.deepEqual(api.rarities,['show','epic','big','highlight']);
assert.equal(api.eligible('catalog'),true);
assert.equal(api.eligible('detail'),true);
assert.equal(api.eligible('team'),false);
assert.equal(api.canTilt(false,false,true),true);
assert.equal(api.canTilt(true,false,true),false);
assert.equal(api.canTilt(false,true,true),false);
assert.equal(api.canTilt(false,false,false),false);
function el(tag){
 const a={tagName:tag,children:[],dataset:{},attrs:{},style:{setProperty(){},removeProperty(){}},
  classList:{contains:()=>false},appendChild(child){this.children.push(child);child.parent=this},
  setAttribute(name,val){this.attrs[name]=val}};
 return a;
}
function testPage(page,initial){
 const arts=Array.from({length:initial},(_,i)=>{
  const a=el('div');a.dataset.scoutMotionRarity=api.rarities[i%4];return a;
 });
 const b=el('body');b.dataset.page=page;
 const listeners={};
 const d={body:b,readyState:'complete',hidden:false,
  querySelectorAll(selector){
   if(selector==='.scout-motion-art[data-scout-motion-rarity]')return arts;
   if(selector==='.scout-motion-art[data-ct234-premium="1"]')return arts.filter(a=>a.dataset.ct234Premium==='1');
   return [];
  },
  createElement:el,addEventListener:(event,callback)=>{listeners[event]=callback}};
 const w={document:d,requestAnimationFrame:fn=>fn(),matchMedia:()=>({matches:false}),
  navigator:{connection:{saveData:false}}};
 vm.runInNewContext(js,{window:w,module:{exports:{}},console},{timeout:2000});
 assert.equal(b.dataset.ct234MotionReady,'1');
 for(const a of arts){
  assert.equal(a.dataset.ct234Premium,'1');
  assert.equal(a.children.length,1,'Exactly one new decorative overlay per original art');
  assert.equal(a.children[0].attrs['aria-hidden'],'true');
  assert.equal(a.children[0].className,'ct234-motion-prism');
 }
 assert.equal(Object.keys(listeners).length,0,'No pointer listeners on touch-only browser');
 return arts;
}
testPage('catalog',246);
testPage('detail',2);
// V235: a preferência de movimento pode mudar sem recarregar o app.
// Testa também acionamento do controle por teclado, sem trocar uma carta.
function testLiveMotionPreferences(){
 let reduced=true,changeHandler=null;
 const handlers={},css=new Map();
 const media={
  get matches(){return reduced},
  addEventListener:(type,handler)=>{if(type==='change')changeHandler=handler}
 };
 const art=el('div');art.dataset.scoutMotionRarity='show';art.dataset.scoutMotionActive='true';
 art.classList={contains:name=>name==='side-art'};
 art.closest=selector=>selector.startsWith('.scout-motion-art')?art:null;
 art.getBoundingClientRect=()=>({left:0,top:0,width:200,height:200});
 art.contains=node=>node===art;
 art.style={setProperty:(name,value)=>css.set(name,value),removeProperty:name=>css.delete(name)};
 const body=el('body');body.dataset.page='detail';
 body.classList={contains:name=>name==='scout-motion-on'};
 const doc={body,hidden:false,readyState:'complete',
  createElement:el,
  querySelectorAll:selector=>
   selector==='.scout-motion-art[data-scout-motion-rarity]'?[art]:
   selector==='.scout-motion-art[data-ct234-premium="1"]'&&art.dataset.ct234Premium==='1'?[art]:[],
  addEventListener:(name,handler)=>{handlers[name]=handler}
 };
 const host={document:doc,navigator:{connection:{saveData:false}},
  matchMedia:query=>query.includes('prefers-reduced-motion')?media:{matches:true},
  requestAnimationFrame:fn=>fn()
 };
 vm.runInNewContext(js,{window:host,module:{exports:{}},console},{timeout:2000});
 assert.equal(art.dataset.ct234Premium,'1','Original art receives overlay only once');
 assert.equal(typeof handlers.pointermove,'function',
  'Mouse handler exists even when device boots in reduced motion');
 assert.equal(typeof changeHandler,'function',
  'System preference changes must be handled without reloading');
 const pointer=()=>handlers.pointermove({
  pointerType:'mouse',target:art,clientX:140,clientY:60
 });
 pointer();
 assert.equal(css.size,0,'Reduced-motion preference prevents tilt');
 reduced=false;changeHandler();pointer();
 assert.equal(art.dataset.ct234Hover,'1','Tilt resumes if user disables reduced motion');
 assert.equal(css.has('--ct234-rx'),true,'3D motion updates CSS only');
 reduced=true;changeHandler();
 assert.equal(art.dataset.ct234Hover,undefined,'Reduced-motion change clears stale hover');
 assert.equal(css.size,0,'Reduced-motion change clears inline transform values');
 reduced=false;pointer();
 handlers.click({target:{closest:selector=>selector==='.scout-motion-toggle'?{}:null}});
 assert.equal(art.dataset.ct234Hover,undefined,'Toggle click clears tilt without mouse movement');
 assert.equal(css.size,0,'Keyboard-accessible toggle clears inline transform values');
 assert.equal(art.children.length,1,'Decorative layer remains idempotent');
}
testLiveMotionPreferences();
assert.equal(JSON.stringify(roster),cardsBefore);
assert.equal(JSON.stringify(audit),auditBefore);
assert.equal(read('web/fichas/002_Raul.html').includes('app-bridge.js'),true);
assert(script.includes('test-craque-design-v234.cjs'),'Visual check required by CI');
console.log('V234 PASS: navy/gold design on 5 app contexts, 246 original art FX, four rarities, opt-in paused/offscreen/reduced-motion, offline parity, zero changed roster/builds.');

