'use strict';
// Smoke test da interação real: executa premium.js num DOM simulado sem dependências.
// Captura regressões em querySelector/querySelectorAll, eventos e filtros combinados.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
class Elem {
 constructor(dataset={}){this.dataset=dataset;this.handlers={};this.hidden=false;this.value='';
  this.attributes={};this.classes=new Set();this.textContent='';
  this.classList={toggle:(name,yes)=>{if(yes)this.classes.add(name);else this.classes.delete(name)}};
 }
 addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)}
 emit(type){for(const fn of this.handlers[type]??[])fn()}
 setAttribute(k,v){this.attributes[k]=v}
 querySelectorAll(){return []}
 appendChild(el){return el}
}
const mk=(cap,role,rarity,style,name)=>new Elem({cap:String(cap),role,position:role,rarity,style,name,search:name+' '+style});
const cards=[
 mk(101,'MLG','ÉPICA','Destruidor','Darren Fletcher'),
 mk(116,'VOL','DISTINGUIDO','Destruidor','Christian Ordóñez'),
 mk(9,'ZG','ÉPICA','Destruidor','Giorgio Chiellini'),
 mk(5,'MLG','ÉPICA','Meia versátil','Steven Gerrard'),
 mk(149,'ZG','DISTINGUIDO','A confirmar no jogo','Jan Paul van Hecke')
];
const roots={};
for(const key of ['#search','#sort','#style-filter','#shown-count','#all-count','#more','#none','#cards','#roles','#rarities'])
 roots[key]=new Elem();
roots['#sort'].value='position';
roots['#style-filter'].value='TODOS';
roots['#roles'].querySelectorAll=sel=>sel==='.filter'?roles:[];
roots['#rarities'].querySelectorAll=sel=>sel==='.filter'?rarities:[];
const btn=value=>{const x=new Elem({value});return x};
const roles=['TODOS','MLG','VOL','ZG'].map(btn);
const rarities=['TODAS','ÉPICA','DISTINGUIDO'].map(btn);
const document={
 body:{dataset:{page:'catalog'}},
 querySelector:selector=>selector==='.player-card'?cards[0]:roots[selector]||null,
 querySelectorAll:selector=>selector==='.player-card'?cards:[] 
};
const window={SCOUT_POSITION_ORDER:{MLG:0,VOL:1,ZG:2}};
const src=fs.readFileSync(path.resolve(__dirname,'../web/premium.js'),'utf8');
vm.runInNewContext(src,{document,window,URLSearchParams,location:{search:''}},{filename:'web/premium.js',timeout:2500});
function shown(){return cards.filter(x=>!x.hidden).map(x=>x.dataset.name)}
assert.equal(roots['#all-count'].textContent,5);
assert.equal(shown().length,5);
roots['#style-filter'].value='Destruidor';roots['#style-filter'].emit('change');
assert.equal(roots['#all-count'].textContent,3);
assert.deepEqual(shown().sort(),['Christian Ordóñez','Darren Fletcher','Giorgio Chiellini'].sort());
rarities[1].emit('click'); // ÉPICA + Destruidor
assert.equal(roots['#all-count'].textContent,2);
roles[1].emit('click'); // MLG + ÉPICA + Destruidor
assert.deepEqual(shown(),['Darren Fletcher']);
roots['#search'].value='chiellini';roots['#search'].emit('input');
assert.equal(roots['#all-count'].textContent,0);
assert.equal(roots['#none'].hidden,false);
roots['#search'].value='';roots['#search'].emit('input');
roles[0].emit('click');rarities[0].emit('click');
roots['#style-filter'].value='A confirmar no jogo';roots['#style-filter'].emit('change');
assert.deepEqual(shown(),['Jan Paul van Hecke']);
roots['#style-filter'].value='TODOS';roots['#style-filter'].emit('change');
assert.equal(roots['#all-count'].textContent,5);
assert.equal(shown().length,5);
console.log('V78 OK: filtro altera visibilidade no DOM; combina raridade, posição, busca, pendências e reset.');
