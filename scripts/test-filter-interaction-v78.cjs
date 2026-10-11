'use strict';
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
const mk=(cap,role,rarity,style,name,styleDefense='')=>new Elem({
 cap:String(cap),role,position:role,rarity,style,styleDefense,name,search:name+' '+style+' '+styleDefense
});
const cards=[
 mk(101,'MLG','ÉPICA','Destruidor','Darren Fletcher'),
 mk(116,'VOL','DISTINGUIDO','Destruidor','Christian Ordóñez'),
 mk(9,'ZG','ÉPICA','Destruidor','Giorgio Chiellini'),
 mk(5,'MLG','ÉPICA','Meia versátil','Steven Gerrard'),
 mk(149,'ZG','DISTINGUIDO','Defensor criativo','Jan Paul van Hecke','Destruidor'),
 mk(150,'ZG','DISTINGUIDO','Defensor criativo','Ibrahima Konaté','Destruidor'),
 mk(237,'LE','DISTINGUIDO','Lateral defensivo','Piero Hincapié','Destruidor')
];
const roots={};
for(const key of ['#search','#sort','#style-filter','#shown-count','#all-count','#more','#none','#cards','#roles','#rarities'])
 roots[key]=new Elem();
roots['#sort'].value='position';roots['#style-filter'].value='TODOS';
const btn=value=>new Elem({value});
const roles=['TODOS','MLG','VOL','ZG','LE'].map(btn);
const rarities=['TODAS','ÉPICA','DISTINGUIDO'].map(btn);
roots['#roles'].querySelectorAll=sel=>sel==='.filter'?roles:[];
roots['#rarities'].querySelectorAll=sel=>sel==='.filter'?rarities:[];
const document={
 body:{dataset:{page:'catalog'}},
 querySelector:selector=>roots[selector]||null,
 querySelectorAll:selector=>selector==='.player-card'?cards:[]
};
const window={SCOUT_POSITION_ORDER:{MLG:0,VOL:1,ZG:2,LE:3}};
const src=fs.readFileSync(path.resolve(__dirname,'../web/premium.js'),'utf8');
vm.runInNewContext(src,{document,window,URLSearchParams,location:{search:''}},{filename:'web/premium.js',timeout:2500});
const shown=()=>cards.filter(x=>!x.hidden).map(x=>x.dataset.name);
const style=v=>{roots['#style-filter'].value=v;roots['#style-filter'].emit('change')};
assert.equal(roots['#all-count'].textContent,7);
style('Destruidor');assert.equal(roots['#all-count'].textContent,6);
assert(shown().includes('Jan Paul van Hecke')&&shown().includes('Ibrahima Konaté')&&shown().includes('Piero Hincapié'));
style('Defensor criativo');assert.deepEqual(shown().sort(),['Jan Paul van Hecke','Ibrahima Konaté'].sort());
style('Lateral defensivo');assert.deepEqual(shown(),['Piero Hincapié']);
style('Destruidor');rarities[1].emit('click');assert.equal(roots['#all-count'].textContent,2);
roles[1].emit('click');assert.deepEqual(shown(),['Darren Fletcher']);
roots['#search'].value='chiellini';roots['#search'].emit('input');
assert.equal(roots['#all-count'].textContent,0);assert.equal(roots['#none'].hidden,false);
roots['#search'].value='';roots['#search'].emit('input');
roles[0].emit('click');rarities[0].emit('click');
style('TODOS');assert.equal(roots['#all-count'].textContent,7);assert.equal(shown().length,7);
console.log('V79 OK: filtro interativo identifica estilos duplos em ambas as fases, além de raridade, posição e pesquisa.');
