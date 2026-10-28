'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const U=require('../web/craque-rating-ui-v376.js');
class Node{
 constructor(){this.children=[];this.dataset={};this.attrs={};this.classList={add(){}};this.textContent='';}
 append(...nodes){this.children.push(...nodes)}
 querySelector(){return this.children.find(c=>c.className==='ct376-ovr')||null}
 setAttribute(k,v){this.attrs[k]=v}
}
const doc={createElement:()=>new Node()},parent=new Node();
const entry={name:'Neymar',position:'SA'},context={source:'Treino pessoal salvo',ctx:{position:'SA',budget:62},maxLevel:32};
let result={status:'estimated',overall:103,spent:62,budget:62,remaining:0,manager:'Kovač',position:'SA',warnings:[]};
let b=U.paint(doc,parent,entry,context,result);
assert.equal(b.children[0].textContent,'103');assert.equal(b.children[2].textContent,'estimado');
assert.match(b.attrs['aria-label'],/Kovač/);assert.match(b.title,/62\/62 PP/);
U.paint(doc,parent,entry,context,{status:'pending',reason:'Edição pendente',overall:null});
assert.equal(parent.children.length,1,'Refresh não duplica badges');
assert.equal(b.children[0].textContent,'—');assert.equal(b.children[2].textContent,'conferir');
U.paint(doc,parent,entry,context,{...result,status:'observed',label:'Observado no jogo',overall:104});
assert.equal(b.children[2].textContent,'no jogo');assert.equal(b.children[0].textContent,'104');
assert(fs.readFileSync('web/craque-rating-ui-v376.css','utf8').includes('position:absolute'));
const source=fs.readFileSync('web/craque-rating-ui-v376.js','utf8');
assert(source.indexOf("dispatchEvent(new w.CustomEvent('craque:references-ready'))")>
 source.indexOf("addEventListener('craque:owned-context-changed'"),'O contexto de diálogo já aberto deve ser escutado antes do evento de fontes prontas');
console.log('V376 UI PASS: número/posição, técnico/PP acessíveis, lacuna sem OVR fictício e observação identificada.');
