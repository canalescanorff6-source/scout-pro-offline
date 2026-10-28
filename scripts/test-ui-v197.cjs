'use strict';
/* Scout PRO V197: equivalência dos dados e acessibilidade no cabeçalho premium. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {enhance}=require('../web/scout-finish-v197.js');
function node(name){
 return {name,children:[],parent:null,id:'',className:'',textContent:'',
  setAttribute(k,v){this[k]=v},
  appendChild(child){
   if(child.parent)child.parent.children=child.parent.children.filter(v=>v!==child);
   this.children.push(child);child.parent=this;return child;
  },
  insertBefore(child,ref){
   if(child.parent)child.parent.children=child.parent.children.filter(v=>v!==child);
   const i=ref?this.children.indexOf(ref):this.children.length;
   assert(i>=0);
   this.children.splice(i,0,child);child.parent=this;
   return child
  },
  querySelector(q){
   if(q==='.detail-sub')return this.children.find(v=>v.className==='detail-sub')||null;
   if(q==='.detail-lead')return this.children.find(v=>v.className==='detail-lead')||null;
   if(q==='#scout-v197-edition')return this.children.find(v=>v.id==='scout-v197-edition')||null;
   return null;
  }
 };
}
function fixture(){
 const header=node('header'),sub=node('div'),lead=node('div');
 sub.className='detail-sub';sub.textContent='Identidade original e edição registrada, Card ID não alterado';
 lead.className='detail-lead';header.appendChild(sub);header.appendChild(lead);
 const doc={body:{dataset:{page:'detail'}},querySelector:q=>q==='.profile-content > .detail-header'?header:null,createElement:node};
 return {doc,header,sub,lead};
}
{
 const {doc,header,sub,lead}=fixture(),result=enhance(doc,true);
 assert.equal(result.id,'scout-v197-edition');
 assert.equal(result.open,false,'Android: origem da edição inicialmente recolhida');
 assert.equal(result.children[1],sub,'O mesmo elemento original deve ser movido, sem cópia');
 assert.equal(result.children[1].textContent,'Identidade original e edição registrada, Card ID não alterado');
 assert.equal(header.children[0],result);
 assert.equal(header.children[1],lead);
 assert.equal(header.querySelector('.detail-sub'),null,'Remover apenas o nó antigo da posição anterior');
 assert.equal(enhance(doc,true),result,'Render repetido sem duplicação');
 assert.equal(result.children.length,2,'Resumo e metadados sem duplicar');
}
{
 const {doc}=fixture(),result=enhance(doc,false);
 assert.equal(result.open,true,'Windows: metadados permanecem expandidos e visíveis');
}
{
 const fixtureInvalid=fixture();fixtureInvalid.doc.body.dataset.page='catalog';
 assert.equal(enhance(fixtureInvalid.doc,true),null,'Não alterar catálogo');
}
const css=read('web/scout-finish-v197.css'),bridge=read('web/app-bridge.js'),sw=read('web/sw.js');
const stamp=read('scripts/stamp-bundle-v189.cjs');
assert(css.includes('#scout-card-navigator')&&css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'Navegação em três botões');
assert(css.includes('.scout-v197-edition>summary:focus-visible'),'Acessibilidade do detalhamento');
assert(css.includes('min-height:44px'),'Alvos táteis com altura mínima');
assert(css.includes('@media(min-width:721px)')&&css.includes('@media(max-width:720px)'),'Layouts Android e Windows');
assert(css.includes('@media print'),'Impressão mantém metadados');
assert(bridge.includes("v189Root+'scout-finish-v197.css'")&&bridge.includes("v189Root+'scout-finish-v197.js'"),'Mesmos arquivos em ambos instaladores');
assert(sw.includes("'./scout-finish-v197.css'")&&sw.includes("'./scout-finish-v197.js'")&&sw.includes('v197-first-screen'),'Atualização do cache offline');
assert(stamp.includes("'scout-finish-v197.css'")&&stamp.includes("'scout-finish-v197.js'"),'Fingerprint inclui layout');
const html=read('web/index.html');assert.equal((html.match(/class="player-card"/g)||[]).length,246,'Não perder cartas');
const files=fs.readdirSync(path.join(root,'web/fichas')).filter(n=>n.endsWith('.html'));assert.equal(files.length,246);
for(const file of files){const code=read('web/fichas/'+file);assert(code.includes('class="detail-sub"')&&code.includes('app-bridge.js')&&code.includes('id="scout-v68-data"'),'Cabeçalho e motor preservados: '+file);}
console.log('V197 OK: 246 cartas e metadados preservados, disclosure acessível, nav touch, cache e paridade Android/Windows.');
