'use strict';
/* V244 — teste de custo de animação e integridade das 246 cartas. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const code=read('web/craque-card-effects-v234.js');
const css=read('web/craque-card-effects-v234.css');
const baseCss=read('web/card-motion-v186.css');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const formations=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const scripts=JSON.parse(read('package.json')).scripts;
assert.equal(cards.length,246);
assert.equal(formations.length,2);
assert(scripts.check.includes('test-motion-budget-v244.cjs'),
 'O orçamento V244 precisa rodar no CI principal');
const API=require('../web/craque-card-effects-v234.js');
assert.deepEqual(API.rarities,['show','epic','big','highlight']);
assert.equal(API.canTilt(false,false,true),true);
assert.equal(API.canTilt(false,true,true),false);
assert.equal(API.canTilt(true,false,true),false);
new vm.Script(code);

const block=css.match(/\/\* V244 — orçamento[\s\S]+?(?=@media\(prefers-reduced-motion:reduce\)\{)/);
assert(block,'Bloqueio de animações redundantes ausente');
assert(block[0].includes('@media(max-width:720px) and (pointer:coarse)'));
for(const r of API.rarities)assert(css.includes('data-scout-motion-rarity="'+r+'"'));
assert(block[0].includes('.scout-motion-layer::before'));
assert(block[0].includes('.ct234-motion-prism::after'));
assert(block[0].includes('.scout-motion-layer::after'));
assert(block[0].includes('animation:none!important'));
assert(block[0].includes('animation-duration:calc(var(--ct234-glint-speed) * 1.5)!important'));
assert(baseCss.includes('animation:scout-v186-sweep'));
assert(css.includes('body.scout-motion-on'));
assert(css.includes('data-scout-motion-active="true"'));
assert(css.includes('@media(prefers-reduced-motion:reduce)'));
assert(css.includes('@media print'));
assert(!/fetch\(|localStorage|sessionStorage|indexedDB/.test(code),
 'Visual FX must not touch application data or network');

let reduced=false;
let on=true;
let reads=0,writes=0;
const props=new Map();
const art={
 dataset:{scoutMotionRarity:'show',scoutMotionActive:'true'},children:[],
 classList:{contains:name=>name==='side-art'},
 style:{setProperty(name,value){writes++;props.set(name,value)},removeProperty(name){props.delete(name)}},
 getBoundingClientRect(){reads++;return{left:0,top:0,width:200,height:200}},
 appendChild(child){this.children.push(child)},
 closest(selector){return selector.startsWith('.scout-motion-art')?art:null},
 contains(node){return node===art}
};
const body={dataset:{page:'detail'},classList:{contains(name){return name==='scout-motion-on'&&on}}};
let changeHandler;
const media={get matches(){return reduced},addEventListener(name,cb){if(name==='change')changeHandler=cb}};
const handlers={},frames=[];
const document={
 body,hidden:false,readyState:'complete',
 createElement(){return{className:'',setAttribute(){}}},
 querySelectorAll(s){return s==='.scout-motion-art[data-scout-motion-rarity]'?[art]:[]},
 addEventListener(name,fn){handlers[name]=fn}
};
const host={
 document,navigator:{connection:{saveData:false}},
 matchMedia(q){return q.includes('prefers-reduced-motion')?media:{matches:true}},
 requestAnimationFrame(fn){frames.push(fn);return frames.length}
};
vm.runInNewContext(code,{window:host,module:{exports:{}},console},{timeout:3000});
assert.equal(art.children.length,1);
assert.equal(art.dataset.ct234Premium,'1');
assert.equal(art.children[0].className,'ct234-motion-prism');
assert.equal(typeof handlers.pointermove,'function');
assert.equal(typeof handlers.pointerout,'function');

const pointer=(x,y=60)=>handlers.pointermove({pointerType:'mouse',target:art,clientX:x,clientY:y});
for(let i=0;i<200;i++)pointer(100+i/2);
assert.equal(frames.length,1,'200 movimentos consecutivos -> no máximo 1 frame');
assert.equal(reads,0,'Sem layout síncrono dentro de pointermove');
assert.equal(writes,0,'Sem escrita de CSS dentro de pointermove');
frames.shift()();
assert.equal(reads,1,'Somente uma leitura do layout por frame');
assert.equal(writes,2,'Somente duas variáveis 3D escritas por frame');
assert.equal(art.dataset.ct234Hover,'1');
assert.equal(props.get('--ct234-rx'),'1.40deg');
assert.equal(props.get('--ct234-ry'),'3.48deg');
// Ao sair antes do frame, o movimento pendente não ressuscita o efeito.
pointer(130);
assert.equal(frames.length,1);
handlers.pointerout({target:art,relatedTarget:null});
assert.equal(art.dataset.ct234Hover,undefined);
frames.shift()();
assert.equal(reads,1,'Frame atrasado após pointerout deve ser ignorado');
// Bloqueio pelo SO enquanto há pointermove pendente.
pointer(190);
reduced=true;
changeHandler();
frames.shift()();
assert.equal(reads,1,'Reduzir movimentos impede cálculo 3D pendente');
assert.equal(props.size,0);
// OFF deve cancelar mesmo com animações do sistema habilitadas.
reduced=false;changeHandler();
pointer(180);
on=false;
handlers.click({target:{closest:selector=>selector==='.scout-motion-toggle'?{}:null}});
frames.shift()();
assert.equal(reads,1,'Efeitos OFF impede aplicação tardia');
// Economia de dados impede tilt; na ausência de arte também não lê layout.
handlers.pointermove({pointerType:'touch',target:art,clientX:120,clientY:60});
assert.equal(frames.length,0);
assert.equal(art.children.length,1);
console.log('V244 OK: 246 cartas intactas, 4 raridades, efeito mobile em uma varredura, 200 movimentos de mouse -> 1 leitura de layout, OFF/reduced-motion preservados.');
