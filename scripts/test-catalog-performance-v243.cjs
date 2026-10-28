'use strict';
/* V243: 246 cartas reais, DOM estável na busca, sort correto e overlays sem rescans. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const index=read('web/index.html'),pkg=JSON.parse(read('package.json'));
assert.equal(roster.length,246);
assert.equal((index.match(/class="player-card"/g)||[]).length,246);
assert(pkg.scripts.check.includes('node scripts/test-catalog-performance-v243.cjs'));
let writes=0,domMoves=0;
class Elem {
 constructor(dataset={}){
  this.dataset=dataset;this.handlers={};this.value='';this.children=[];this.parentNode=null;
  this._hidden=false;this.attributes={};
  this.classList={toggle(){}};
 }
 get hidden(){return this._hidden}
 set hidden(value){const v=Boolean(value);if(v!==this._hidden){if(this.dataset.cap)writes++;this._hidden=v}}
 addEventListener(event,callback){(this.handlers[event]??=[]).push(callback)}
 emit(event){for(const callback of this.handlers[event]||[])callback()}
 setAttribute(key,value){this.attributes[key]=value}
 querySelectorAll(){return []}
 appendChild(child){
  domMoves++;
  if(child.isFragment){
   for(const c of [...child.children])this.move(c);
   child.children.length=0;
  }else this.move(child);
  return child;
 }
 move(child){
  if(child.parentNode){
   const siblings=child.parentNode.children;
   const i=siblings.indexOf(child);
   if(i>=0)siblings.splice(i,1);
  }
  this.children.push(child);child.parentNode=this;
 }
}
const mk=(n)=>new Elem({
 cap:String(n),role:n%2?'MLG':'ZG',position:n%2?'MLG':'ZG',
 rarity:n%3?'ÉPICA':'SHOW TIME',style:n%2?'Orquestrador':'Destruidor',
 styleDefense:'',name:'Jogador '+String(n).padStart(3,'0'),
 search:'Jogador '+String(n).padStart(3,'0')+' Orquestrador Defesa'
});
const cards=Array.from({length:246},(_,i)=>mk(i+1));
const selectors=['#search','#sort','#style-filter','#shown-count','#all-count','#more','#none','#cards','#roles','#rarities'];
const root=Object.fromEntries(selectors.map(s=>[s,new Elem()]));
const grid=root['#cards'];
for(const el of cards){grid.children.push(el);el.parentNode=grid}
root['#sort'].value='original';root['#style-filter'].value='TODOS';
const mkButton=value=>new Elem({value});
const roles=['TODOS','MLG','ZG'].map(mkButton),rarities=['TODAS','ÉPICA','SHOW TIME'].map(mkButton);
root['#roles'].querySelectorAll=s=>s==='.filter'?roles:[];
root['#rarities'].querySelectorAll=s=>s==='.filter'?rarities:[];
const document={
 body:{dataset:{page:'catalog'}},
 querySelector:s=>root[s]||null,
 querySelectorAll:s=>s==='.player-card'?cards:[],
 createDocumentFragment(){const fragment=new Elem();fragment.isFragment=true;return fragment}
};
const window={SCOUT_POSITION_ORDER:{MLG:0,ZG:1}};
const originalIds=cards.map(c=>c.dataset.cap).join(',');
const source=read('web/premium.js');
new vm.Script(source);
vm.runInNewContext(source,{document,window,URLSearchParams,location:{search:''}}, {filename:'premium.js',timeout:5000});
const visible=()=>grid.children.filter(el=>!el.hidden);
const visibleIds=()=>visible().map(x=>Number(x.dataset.cap));
const applySearch=(v)=>{root['#search'].value=v;root['#search'].emit('input')};
const applySort=(v)=>{root['#sort'].value=v;root['#sort'].emit('change')};
assert.equal(visible().length,30);
assert.deepEqual(visibleIds(),Array.from({length:30},(_,i)=>i+1));
assert.equal(root['#all-count'].textContent,246);
assert.equal(domMoves,0,'Inicialização não deve mover cards já ordenados');
assert.equal(writes,216,'Inicialização só oculta cards fora da primeira página');
for(let i=0;i<10;i++)applySearch('Jogador');
assert.equal(domMoves,0,'Busca idêntica não deve mover cartas');
assert.equal(writes,216,'Busca idêntica não deve reescrever visibilidade');
assert.deepEqual(visibleIds(),Array.from({length:30},(_,i)=>i+1));
applySort('reverse');
assert.deepEqual(visibleIds(),Array.from({length:30},(_,i)=>246-i));
assert.equal(root['#all-count'].textContent,246);
const firstMove=domMoves;
assert(firstMove>0);
for(let i=0;i<10;i++)applySort('reverse');
assert.equal(domMoves,firstMove,'Ordenação estável não deve mover cards');
applySearch('Jogador 246');
assert.deepEqual(visibleIds(),[246]);
const afterSearch=domMoves;
applySearch('Jogador 246');
assert.equal(domMoves,afterSearch,'Mesmo termo não deve repetir operações no DOM');
applySearch('');
assert.deepEqual(visibleIds(),Array.from({length:30},(_,i)=>246-i));
const first30=visibleIds();
root['#more'].emit('click');
assert.deepEqual(visibleIds().slice(0,30),first30);
assert.equal(visible().length,60);
roles[1].emit('click');
assert.equal(root['#all-count'].textContent,123);
assert(visible().every(card=>card.dataset.role==='MLG'));
roles[0].emit('click');
rarities[2].emit('click');
assert.equal(root['#all-count'].textContent,82);
rarities[0].emit('click');
assert.equal(root['#all-count'].textContent,246);
assert.equal(new Set(grid.children).size,246,'Não duplicar cartas ao reordenar');
assert.equal(cards.map(c=>c.dataset.cap).join(','),originalIds,'Nunca alterar IDs/dados originais');

const fx=read('web/craque-card-effects-v234.js');
new vm.Script(fx);
const selector='.scout-motion-art[data-scout-motion-rarity]';
const arts=Array.from({length:246},()=>({
 nodeType:1,dataset:{scoutMotionRarity:'show'},children:[],
 matches(q){return q===selector},
 querySelectorAll(){return []},
 appendChild(node){this.children.push(node)}
}));
let queryAllCalls=0,frames=0,observerCallback=null;
const body={dataset:{page:'catalog'}};
const mock={
 body,hidden:false,readyState:'complete',createElement(){return{setAttribute(){},className:''}},
 querySelectorAll(q){queryAllCalls++;return q===selector?arts:[]},
 addEventListener(){}
};
const win={
 document:mock,
 MutationObserver:class{constructor(fn){observerCallback=fn}observe(){}disconnect(){}},
 requestAnimationFrame(fn){frames++;fn()},
 navigator:{connection:{saveData:true}},
 matchMedia(){return{matches:false}}
};
vm.runInNewContext(fx,{window:win,module:{exports:{}},console},{timeout:5000});
assert(arts.every(a=>a.dataset.ct234Premium==='1'&&a.children.length===1));
const initialQueries=queryAllCalls;
const wrapped={nodeType:1,matches(){return false},querySelectorAll(){return [arts[0],arts[1]]}};
observerCallback([{addedNodes:[wrapped]}]);
assert.equal(frames,0,'Mover artes já decoradas não deve iniciar nova animação');
assert.equal(queryAllCalls,initialQueries,'Reordenação não deve revarrer 246 cartas');
const late={nodeType:1,dataset:{scoutMotionRarity:'big'},children:[],
 matches(q){return q===selector},querySelectorAll(){return[]},
 appendChild(node){this.children.push(node)}};
observerCallback([{addedNodes:[late]}]);
assert.equal(frames,1,'Nova arte deve gerar uma atualização');
assert.equal(late.dataset.ct234Premium,'1');
assert.equal(late.children.length,1);
assert.equal(queryAllCalls,initialQueries,'Nova arte deve ser decorada sem varrer todas');
console.log('V243 OK: 246 cartas, filtros/sort/mais sem DOM redundante, reordenação sem rescan, artes dinâmicas preservadas.');
