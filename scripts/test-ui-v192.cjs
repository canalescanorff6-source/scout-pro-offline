'use strict';
/* V192: regras comportamentais de layout, não apenas snapshots de strings. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ui=read('web/scout-ui-v189.js'),skills=read('web/skills-booster-v162.js'),
      css=read('web/scout-visual-v192.css'),bridge=read('web/app-bridge.js'),
      sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
function el(tag='',cls='',text=''){
 return {tag,children:[],id:'',className:cls,textContent:text,style:{},attributes:{},
  append(...children){this.children.push(...children);for(const ch of children)ch.parent=this},
  appendChild(child){this.append(child);return child},
  setAttribute(k,v){this.attributes[k]=v},
  addEventListener(){},
  querySelector(){return null},
  getAttribute(k){return this.attributes[k]||null}
 };
}
function descend(node){return [node,...(node.children||[]).flatMap(descend)]}
function home(){
 const hero=el('div'),old=el('div'),search=el('input'),brand=el('a');
 search.id='search';
 const link=el('a','Abrir auditoria');link.attributes.href='revisao-tatica-v98.html';
 old.querySelectorAll=()=>[link];
 hero.querySelector=q=>q==='.hero-actions'?old:null;
 const doc={body:{dataset:{page:'catalog'}},
  readyState:'complete',createElement:el,
  getElementById:q=>q==='search'?search:null,
  querySelector:q=>q==='.hero .hero-text'?hero:q==='.topbar .nav-cta'?brand:null};
 const window={document:doc};
 vm.runInNewContext(ui,{window,fetch:()=>Promise.reject(new Error('offline'))},{timeout:2000});
 const nodes=descend(hero);
 assert.equal(nodes.filter(n=>n===search).length,1,'Busca original deve ser movida, sem clonar ou duplicar listeners');
 assert.equal(search.parent.className,'scout-v192-search-shell','Busca precisa ficar no topo');
 const links=nodes.filter(n=>n.tag==='a'&&n.className==='scout-v189-tile');
 assert.equal(links.length,4,'Manter quatro atalhos essenciais');
 const other=nodes.find(n=>n.className==='scout-v189-extra-links');
 assert(other.children.some(n=>n.attributes.href==='revisao-tatica-v98.html'),'Não perder ferramentas avançadas');
 assert.equal(brand.textContent,'Meu elenco');
}
function mobileDetail(){
 const before=el('div'),section=el('section');section.querySelector=q=>q==='.scout-v188-body'?before:null;
 const doc={body:{dataset:{page:'detail'}},readyState:'complete',createElement:el,
  addEventListener(){},
  querySelector(){return null},
  getElementById:id=>id==='scout-v68-data'?{textContent:JSON.stringify({capture:1,id:'88040387251729',name:'Daniele Massaro'})}
       :id==='scout-v188-principal'?section:null
 };
 vm.runInNewContext(ui,{window:{document:doc,matchMedia:()=>({matches:true})},fetch:()=>Promise.reject(new Error('offline'))},{timeout:2000});
 const bio=before.children.find(n=>n.id==='scout-v189-biotype');
 assert(bio,'Painel de biotipo deve existir');
 assert.equal(bio.tag,'details','Biotipo mobile deve ser recolhível, sem excluir suas medidas');
 assert.equal(bio.open,undefined,'No mobile começa fechado para evitar rolagem excessiva');
 assert(bio.children.some(n=>n.tag==='summary'),'Resumo nativo acessível obrigatório');
}
function skillsInsertion(){
 const start=skills.indexOf("const principal=container.querySelector('#scout-v188-principal');");
 const end=skills.indexOf("const side=document.querySelector('.side-nav');",start);
 assert(start!==-1&&end>start,'Motor V162 deve preservar inserção original com novo layout');
 const fragment=skills.slice(start,end);
 const section=el('section');section.id='scout-v162';
 const anatomical=el('div');
 let target=null,placement=null;
 anatomical.insertAdjacentElement=(where,node)=>{target=node;placement=where};
 const principal={querySelector:q=>q==='.scout-v188-body'?anatomical:null};
 const container={querySelector:q=>q==='#scout-v188-principal'?principal:null,prepend:()=>{}};
 vm.runInNewContext(fragment,{container,section},{timeout:2000});
 assert.equal(target,section,'Painel de skills original deve integrar ficha, sem segundo painel');
 assert.equal(placement,'beforebegin','Habilidades precisam vir antes do biotipo');
}
home();mobileDetail();skillsInsertion();
assert(bridge.includes("v189Root+'scout-visual-v192.css'"),'Mesmo CSS precisa ser carregado nas 246 fichas e na home');
assert(sw.includes("'./scout-visual-v192.css'")&&sw.includes('v192-layout'),'Tema precisa funcionar offline');
assert(stamp.includes("'scout-visual-v192.css'"),'Fingerprint comum deve cobrir tema');
for(const feature of ['scout-v192-search-shell','scout-v189-tile','scout-v188-progress','#scout-v162','#scout-v189-biotype','prefers-reduced-motion','@media(max-width:720px)','@media(min-width:1050px)']){
 assert(css.includes(feature),'Falta estilo premium: '+feature);
}
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
assert.equal(fs.readdirSync(path.join(web,'fichas')).filter(x=>x.endsWith('.html')).length,246);
assert(!css.includes('@import'),'Sem fonte remota ou CSS externo no modo offline');
console.log('V192 OK: busca real no topo, atalhos, habilidades únicas na ficha, biotipo mobile recolhível, 246 cartas, offline e paridade.');
