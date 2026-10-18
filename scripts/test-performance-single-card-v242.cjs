'use strict';
/* V242 — regression of laggy card observers + redundant technical cards. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const configs=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
assert.equal(cards.length,246);
assert.equal(configs.length,2);
const source=read('web/craque-card-effects-v234.js');
const curator=read('web/scout-card-curation-v229.js');
const style=read('web/scout-card-curation-v229.css');
const motionCss=read('web/craque-card-effects-v234.css');
const qa=read('scripts/qa-visual-v195.py');
new vm.Script(source);
new vm.Script(curator);
const api=require('../web/scout-card-curation-v229.js');
assert.deepEqual(api.SECTION_IDS,['engenharia','foco','pontos','performance','status','jogar']);
assert.deepEqual(api.OPTIONAL_IDS,['scout-v207-identity','scout-v215-evidence']);
assert(curator.includes('archiveOptional(doc,holder,archive)'));
assert(curator.includes('late.observe(root,{childList:true,subtree:true})'));
assert(curator.includes('archive.contains(node)'));
assert(curator.includes("if(!SECTION_IDS.includes(targetId)&&!OPTIONAL_IDS.includes(targetId))return"));
assert(!/\b(?:localStorage|sessionStorage)\.(?:setItem|removeItem|clear)\s*\(|\bindexedDB\.open\s*\(|\bfetch\s*\(/.test(curator),
 'Archival presentation cannot mutate persistence or load new data.');
assert(style.includes('scout-v229-legacy-archive:not([open])'));
assert(style.includes('linear-gradient(135deg,#1a304e,#0d1d34)'));
assert(qa.includes('V242: comparação individual não pode parecer uma segunda ficha'));
assert(qa.includes('V242 deixou auditoria adicional fora do arquivo recolhido'));
assert(motionCss.includes('@media(max-width:720px) and (pointer:coarse)'));
assert(motionCss.includes('animation:none!important'));
assert(motionCss.includes('animation-duration:calc(var(--ct234-glint-speed) * 1.6)'));
assert(motionCss.includes('body.scout-motion-on'));
assert(motionCss.includes('data-scout-motion-active="true"'));
assert(motionCss.includes('@media(prefers-reduced-motion:reduce)'));
for(const rarity of ['show','epic','big','highlight'])
 assert(motionCss.includes('data-scout-motion-rarity="'+rarity+'"'));

const selector='.scout-motion-art[data-scout-motion-rarity]';
const createElement=tag=>({
 nodeType:1,tagName:tag,children:[],attrs:{},className:'',
 appendChild(child){this.children.push(child)},
 setAttribute(k,v){this.attrs[k]=v}
});
function art(){
 const e=createElement('div');e.dataset={scoutMotionRarity:'show'};
 e.matches=s=>s===selector;e.querySelector=()=>null;
 return e;
}
const arts=[art()];
let mutations=null,frames=0;
const body={dataset:{page:'detail'},classList:{contains:()=>false}};
const doc={
 body,hidden:false,readyState:'complete',
 createElement,
 querySelectorAll:s=>s===selector?arts:s==='.scout-motion-art[data-ct234-premium="1"]'?arts.filter(x=>x.dataset.ct234Premium==='1'):[],
 addEventListener(){}
};
function MutationObserver(callback){mutations=callback;this.observe=()=>{};this.disconnect=()=>{}}
const win={
 document:doc,MutationObserver,
 requestAnimationFrame(callback){frames++;callback()},
 navigator:{connection:{saveData:true}},
 matchMedia(){return {matches:false}}
};
vm.runInNewContext(source,{window:win,module:{exports:{}},console},{timeout:5000});
assert.equal(body.dataset.ct234MotionReady,'1');
assert.equal(arts[0].children.length,1);
assert.equal(arts[0].children[0].className,'ct234-motion-prism');
assert.equal(typeof mutations,'function','Observer must still support cards loaded later');
const other=createElement('section');
other.matches=()=>false;other.querySelector=()=>null;
mutations([{addedNodes:[other]}]);
assert.equal(frames,0,'Updates to PP/notes must not queue expensive full-card scans');
arts.push(art());
mutations([{addedNodes:[arts[1]]}]);
assert.equal(frames,1,'Only newly added card art requires a scan');
assert.equal(arts[1].children.length,1,'Late-arriving card gets its original overlay');
mutations([{addedNodes:[other]}]);
assert.equal(frames,1,'No further rescans from unrelated UI mutations');
console.log('V242 OK: 246 cartas, 2 formações, UI principal única, legacy preserved, safe mobile effects, mutation observer only for added arts.');
