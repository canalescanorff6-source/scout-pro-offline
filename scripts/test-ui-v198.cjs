'use strict';
/* V198: integração do menu desktop e preservação dos botões reais Android/Windows. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {relocate}=require('../web/scout-finish-v198.js');
function make(tag){
 return {tag,id:'',className:'',textContent:'',hidden:false,open:false,parentElement:null,
 children:[],attrs:{},setAttribute(k,v){this.attrs[k]=v},
 appendChild(child){
  if(child.parentElement)child.parentElement.children=child.parentElement.children.filter(n=>n!==child);
  this.children.push(child);child.parentElement=this;return child;
 }};
}
const body=make('body'),right=make('div'),bar=make('aside');bar.id='scout-app-bar';
const clickOriginal=()=>true;bar.onclick=clickOriginal;
body.appendChild(bar);const nodes=new Map([[bar.id,bar]]);
const classes=new Set(),doc={body,
 getElementById:id=>nodes.get(id)||null,
 querySelector:q=>q==='.topbar .nav-right'?right:null,
 createElement:tag=>{
  const n=make(tag);
  const original=Object.getOwnPropertyDescriptor(n,'id');
  Object.defineProperty(n,'id',{get(){return this.__id||''},set(v){this.__id=v;if(v)nodes.set(v,this)},configurable:true});
  return n;
 }};
body.classList={add:s=>classes.add(s),remove:s=>classes.delete(s),contains:s=>classes.has(s)};
assert.equal(relocate(doc,true),true);
const menu=nodes.get('scout-v198-tools');
assert(menu,'Menu responsivo precisa existir');
assert.equal(bar.parentElement,menu,'O mesmo nó original deve ser movido, sem cópia');
assert.equal(bar.onclick,clickOriginal,'Listeners/eventos originais precisam sobreviver');
assert.equal(body.children.includes(bar),false,'Um único dock permanece no DOM');
assert.equal(classes.has('scout-v198-desktop-menu'),true);
assert.equal(menu.hidden,false);
assert.equal(relocate(doc,true),true,'Não falhar na segunda passagem');
assert.equal(right.children.filter(x=>x===menu).length,1,'Idempotência do menu desktop');
assert.equal(menu.children.filter(x=>x===bar).length,1,'Não duplicar barra de ferramentas');
assert.equal(relocate(doc,false),true);
assert.equal(bar.parentElement,body,'No celular, restaurar dock inferior original');
assert.equal(bar.onclick,clickOriginal);
assert.equal(menu.hidden,true);
assert.equal(classes.has('scout-v198-desktop-menu'),false);
assert.equal(relocate(doc,true),true,'Restaurar desktop após redimensionar');
assert.equal(bar.parentElement,menu);
assert.equal(relocate({body:null},true),false,'Sem body, não modificar interface');
const css=read('web/scout-finish-v198.css');
assert(css.includes('min-width:960px'),'Menu somente em telas suficientemente largas');
assert(css.includes('body[data-page="catalog"]:not(.scout-v189-method-open) .lab-intro'),'Metodologia deve ser recolhida por padrão');
assert(css.includes('body[data-page="catalog"]:not(.scout-v189-method-open) .v68-method'),'Método da análise precisa ser preservado e acessível');
assert(css.includes('body.scout-v198-desktop-menu .scout-v198-tools #scout-app-bar'),'Barra precisa estar ancorada ao menu');
assert(css.includes('position:absolute!important')&&css.includes('bottom:auto!important'),'Barra não pode cobrir toda a largura inferior do desktop');
assert(css.includes('#scout-backup')===false,'Não esconder de forma seletiva backup original');
assert(css.includes('@media(max-width:959px)'),'No celular dock anterior precisa continuar');
const bridge=read('web/app-bridge.js'),sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const p of ['scout-finish-v198.css','scout-finish-v198.js']){
 assert(bridge.includes("v189Root+'"+p+"'"),'Mesmo recurso no Windows e Android: '+p);
 assert(sw.includes("'./"+p+"'"),'Cache offline: '+p);
 assert(stamp.includes("'"+p+"'"),'Fingerprint: '+p);
}
assert(sw.includes('v198-desktop'));
const cards=read('web/index.html').match(/class="player-card"/g)||[];
assert.equal(cards.length,246,'Preservar 246 cartas e suas artes');
const names=fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html'));
assert.equal(names.length,246);
console.log('V198 OK: mesmo nó/handlers, 246 cartas, menu desktop sem dock flutuante e metodologia restaurável.');
