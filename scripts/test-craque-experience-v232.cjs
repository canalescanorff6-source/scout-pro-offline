'use strict';
/* V232 regression: UX-only navigation, no changes to 246 cards, training or profiles. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('web/craque-experience-v232.js');
const css=read('web/craque-experience-v232.css');
const bridge=read('web/app-bridge.js');
const sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs');
const all=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
const formations=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json'));
assert.equal(all.cards.length,246);
assert.equal(formations.formations.length,2);
assert(!/localStorage|sessionStorage|indexedDB|fetch\(|\.remove\(|innerHTML\s*=/.test(source),
 'Visual shell must never touch persisted collections or replace application markup');
for(const file of ['craque-experience-v232.css','craque-experience-v232.js']){
 assert(bridge.includes(file),'Shared loader: '+file);
 assert(sw.includes("'./"+file+"'"),'Offline shell: '+file);
 assert(stamp.includes("'"+file+"'"),'Parity manifest: '+file);
}
assert(css.includes('scout-native-android'));
assert(css.includes('scout-rotation-shortcut'));
assert(css.includes('#scout-app-bar #scout-update'));
assert(css.includes('body[data-page="detail"]'));
assert(css.includes('body[data-page="team"]'));
assert(!/display:\s*none[^}]*!important[^}]*#scout-update/.test(css));
new vm.Script(source,{filename:'craque-experience-v232.js'});
function element(tag){
 return {
  tagName:tag,children:[],attrs:{},className:'',textContent:'',href:'',open:false,
  appendChild(v){this.children.push(v);},
  setAttribute(k,v){this.attrs[k]=v;},
  getAttribute(k){return this.attrs[k];},
  before(v){this.beforeNode=v;},
  after(v){this.afterNode=v;},
  focus(){this.focused=true;}
 };
}
function run(page,native){
 const formation=element('section'),header=element('div');
 const targets=new Map([
  ['formation-pick',formation],['ct-v230-tactic-profile',element('section')],
  ['pitch',element('div')],['bench',element('div')]
 ]);
 const summary=element('summary');
 const menu=element('details');menu.open=true;
 menu.querySelector=s=>s==='summary'?summary:null;
 const modal=element('dialog'),actions=element('div');
 targets.set('scout-android-update-modal',modal);
 modal.querySelector=s=>s==='.ct-v232-security-note'?null:s==='.scout-update-actions'?actions:null;
 const events={};
 const doc={
  readyState:'complete',
  body:{dataset:{page},classList:{contains:x=>native&&x==='scout-native-android'}},
  createElement:element,getElementById:id=>targets.get(id)||null,
  querySelector:s=>{
   if(s==='.ct-v232-jumps')return null;
   if(s==='.profile-content > .detail-header')return page==='detail'?header:null;
   if(s==='#scout-app-bar .scout-v189-dock-more')return menu;
   if(s==='#scout-android-update-modal')return native?modal:null;
   return null;
  },
  addEventListener:(type,fn)=>{events[type]=fn}
 };
 const win={document:doc};
 vm.runInNewContext(source,{window:win,document:doc},{filename:'craque-experience-v232.js'});
 return {formation,header,summary,menu,events,actions,modal};
}
const team=run('team',false);
assert.equal(team.formation.beforeNode.tagName,'nav');
assert.equal(team.formation.beforeNode.children.length,4);
assert.deepEqual(Array.from(team.formation.beforeNode.children,x=>x.href),
 ['#formation-pick','#ct-v230-tactic-profile','#pitch','#bench']);
team.events.keydown({key:'Escape'});
assert.equal(team.menu.open,false);
assert.equal(team.summary.focused,true);
const detail=run('detail',false);
assert.equal(detail.header.afterNode.children.length,3);
assert.equal(detail.header.afterNode.children[0].href,'#scout-v188-principal');
assert.equal(detail.header.afterNode.children[2].href,'#scout-v229-legacy-archive');
const android=run('catalog',true);
assert.equal(android.actions.beforeNode.tagName,'p');
assert.match(android.actions.beforeNode.textContent,/Google Play Protect/);
assert.match(android.actions.beforeNode.textContent,/não desative/);
console.log('Craque Tático V232: mobile navigation, keyboard menu, Android safety, 246 cards, 2 formations, offline parity OK');
