'use strict';
/* SCOUT PRO V203: controles originais preservados e catálogo realmente priorizado. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mod=require('../web/scout-finish-v203.js');
assert.equal(typeof mod.build,'function');
assert.equal(typeof mod.selectedLabel,'function');
const active={querySelector(selector){
 assert(selector.includes('button'));
 return {textContent:'  CA  ·  44  ',dataset:{value:'CA'}};
}};
const none={querySelector:()=>null};
assert.equal(mod.selectedLabel(active,'Todos'),'CA · 44');
assert.equal(mod.selectedLabel(none,'Todos'),'Todos');
assert.equal(mod.build({body:{dataset:{page:'detail'}}}),false,'Fichas não devem receber filtros');
// V374: a healthy position-order.js also creates this instruction node.
// It belongs with the original role controls, not above the closed filter.
class Node {
 constructor(tag){this.tagName=tag;this.children=[];this.parentNode=null;this.attributes={};
  this.dataset={};this.id='';this.className='';this.textContent='';this.listeners={};
  const classes=new Set();this.classList={add:x=>classes.add(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x)};
 }
 setAttribute(key,value){this.attributes[key]=value}
 addEventListener(type,handler){(this.listeners[type]??=[]).push(handler)}
 append(...nodes){nodes.forEach(n=>this.appendChild(n))}
 appendChild(node){return this.insertBefore(node,null)}
 insertBefore(node,before){
  if(node.parentNode){const old=node.parentNode.children;old.splice(old.indexOf(node),1)}
  const index=before?this.children.indexOf(before):this.children.length;
  this.children.splice(index,0,node);node.parentNode=this;return node;
 }
 querySelector(selector){
  const matches=n=>selector.startsWith('.')?n.className.split(/\s+/).includes(selector.slice(1)):
   selector==='button[aria-pressed="true"]'?n.tagName==='button'&&n.attributes['aria-pressed']==='true':
   selector==='button.active'?n.tagName==='button'&&n.className.split(/\s+/).includes('active'):false;
  for(const child of this.children){if(matches(child))return child;const found=child.querySelector(selector);if(found)return found}return null;
 }
}
const body=new Node('body');body.dataset.page='catalog';
const catalog=new Node('section');catalog.id='catalogo';body.append(catalog);
const tools=new Node('div');tools.className='tools';
const sort=new Node('select');sort.id='sort';sort.value='position';sort.selectedOptions=[{textContent:'Posição • CA até GO'}];tools.append(sort);
const roles=new Node('div');roles.id='roles';
const rarities=new Node('div');rarities.id='rarities';
for(const [group,value] of [[roles,'TODOS'],[rarities,'TODAS']]){
 const button=new Node('button');button.dataset.value=value;button.setAttribute('aria-pressed','true');button.textContent=value;group.append(button);
}
const overview=new Node('div');overview.className='scout-role-overview';overview.textContent='Ordem personalizada por posição original da carta · use os filtros para acessar cada grupo.';
const motion=new Node('div');motion.className='scout-motion-controls';
const meta=new Node('div');meta.className='list-meta';
catalog.append(tools,roles,overview,rarities,motion,meta);
const walk=n=>[n,...n.children.flatMap(walk)];
const document={body,createElement:tag=>new Node(tag),getElementById:id=>walk(body).find(n=>n.id===id)||null};
let originalClicks=0;roles.addEventListener('click',()=>originalClicks++);
assert.equal(mod.build(document),true);
const content=catalog.querySelector('.scout-v203-filter-content');
assert.equal(overview.parentNode===content,true,'Role instructions must move inside the filter with the original controls');
assert.equal(content.children.indexOf(overview),content.children.indexOf(roles)+1);
assert.equal(roles.parentNode,content);assert.equal(sort.value,'position','Original sort and reset semantics preserved');
assert.equal(motion.parentNode.className,'scout-v238-filter-motion-row','Motion controls stay visible outside collapsed filters');
assert.equal(Boolean(document.getElementById('scout-v203-filter-panel').open),false);
for(const handler of roles.listeners.click)handler({target:{closest:()=>null}});
assert.equal(originalClicks,1,'Moving the existing nodes preserves their handlers');
assert.equal(mod.build(document),true);assert.equal(walk(body).filter(n=>n===overview).length,1,'No duplicate instruction or control nodes');
const code=read('web/scout-finish-v203.js');
for(const phrase of [
 'catalog.insertBefore(motionRow,meta)',
 'contents.append(sortTitle,tools)',
 'contents.append(roleTitle,roles,rarityTitle,rarities)',
 "const motion=catalog.querySelector('.scout-motion-controls')",
 "roles.addEventListener('click'",
 "rarities.addEventListener('click'",
 "doc.getElementById('sort')?.addEventListener('change'",
 "new URLSearchParams(host?.location?.search||'')"
])assert(code.includes(phrase),'Preservação dos filtros: '+phrase);
assert(code.includes('if(motion)motionRow.appendChild(motion)'),
 'V238: controle Cartas animadas deve aparecer ao lado do painel fechado');
assert(code.includes("motionRow.className='scout-v238-filter-motion-row'"),
 'V238: controles precisam compartilhar linha, sem deslocar a primeira carta');
assert(!code.includes('contents.appendChild(motion)'),
 'V238: não esconder animação dentro dos filtros recolhidos');
assert(!code.includes('cloneNode(')&&!code.includes('innerHTML='),'Não duplicar botões ou reescrever a lista de filtros');
const css=read('web/scout-finish-v203.css');
assert(css.includes('.scout-v203-filter-panel:not([open])>.scout-v203-filter-content'),'Painel fechado mostra só o resumo');
assert(css.includes('scout-v203-filter-active'),'Resumo visível quando filtro está aplicado');
assert(css.includes('@media(max-width:720px)')&&css.includes('@media(min-width:960px)'),'Android e desktop');
assert(css.includes(':focus-visible'),'Acesso por teclado');
const b=read('web/app-bridge.js'),sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const name of ['scout-finish-v203.js','scout-finish-v203.css']){
 assert(b.includes("v189Root+'"+name+"'"),'Bridge: '+name);
 assert(sw.includes("'./"+name+"'"),'Offline: '+name);
 assert(stamp.includes("'"+name+"'"),'Fingerprint: '+name);
}
assert(sw.includes('v203-filter-panel'));
const html=read('web/index.html'),source=read('web/premium.js');
assert.equal((html.match(/class="player-card"/g)||[]).length,246,'246 jogadores de catálogo');
assert.equal(fs.readdirSync(path.join(root,'web/fichas')).filter(x=>x.endsWith('.html')).length,246);
for(const name of ['id="sort"','id="roles"','id="rarities"','id="cards"','id="search"'])
 assert(html.includes(name),'O HTML mantém o controle real '+name);
for(const name of ['buttonState','search.addEventListener','sort.addEventListener','more.addEventListener'])
 assert(source.includes(name),'Filtros originais continuam intactos: '+name);
console.log('V203 OK: filtros originais acessíveis, resumo do estado, animação preservada e 246 cartas.');
