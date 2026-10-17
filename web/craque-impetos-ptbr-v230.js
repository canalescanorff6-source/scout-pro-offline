/* Craque Tático V230 — PT-BR de ímpetos: camada visual, sem alterar os IDs internos.
 * Fonte oficial 17 nomes: https://www.konami.com/efootball/pt-br/page/v4/versioninfo_v4-00
 * 28 tipos confirmados: https://www.konami.com/efootball/pt-br/page/v5/versioninfo_v5-20
 * Os outros 9 nomes não publicados nesta lista são traduções descritivas, não oficiais.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_IMPETOS_PTBR_V230=api;
 if(!host?.document)return;
 const boot=()=>api.observe(host.document);
 if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})(typeof window!=='undefined'?window:null,function(){'use strict';
const NAMES=Object.freeze({
 'Shooting':['Chute',true], 'Free-kick Taking':['Cobrança de falta',true],
 'Aerial':['Disputa aérea',true], 'Passing':['Passe',true],
 'Ball-carrying':['Condução de bola',true], 'Technique':['Técnica',true],
 'Defending':['Defesa',true], 'Duelling':['Duelo',true],
 'Agility':['Agilidade',true], 'Physicality':['Fisicalidade',true],
 'Goalkeeping':['Goleiro',true], "Striker's Instinct":['Instinto artilheiro',true],
 'Shutdown':['Guardião',true], 'Hard Worker':['Motor do time',true],
 'Saving':['Defesaça',true], 'Crossing':['Cruzamento',true],
 'Fantasista':['Fantasista',true], 'Accuracy':['Precisão',true],
 'Strength':['Força',true], 'Ball Protection':['Proteção de bola',false],
 'Off the Ball':['Movimentação sem bola',false], 'Offence Creator':['Criador ofensivo',false],
 'Regista':['Regista',false], 'Rebuilding':['Reconstrução defensiva',false],
 'Stealing':['Roubo de bola',false], 'Balancer':['Equilíbrio',false],
 'Breakthrough':['Ruptura',false], 'Counter':['Contra-ataque',false]
});
const ALIASES=Object.freeze({
 'Dueling':'Duelling','Ball Carrying':'Ball-carrying',
 'Offense Creator':'Offence Creator','Strikers Instinct':"Striker's Instinct",
 'Protect the Ball':'Ball Protection','Protect Ball':'Ball Protection'
});
const keys=Object.keys(NAMES);
const all=[...keys,...Object.keys(ALIASES)].sort((a,b)=>b.length-a.length);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z0-9]+/g,' ');
const index=new Map;
for(const k of keys){index.set(norm(k),k);index.set(norm(NAMES[k][0]),k);}
for(const [alias,k] of Object.entries(ALIASES))index.set(norm(alias),k);
for(const [alias,k] of Object.entries({
 'Proteção de posse':'Ball Protection','Proteção da bola':'Ball Protection',
 'Instinto de artilheiro':"Striker's Instinct",'Desligamento':'Shutdown',
 'Físico':'Physicality','Finalização':'Shooting','Contra ataque':'Counter'
}))index.set(norm(alias),k);
function keyFor(value){
 const stripped=String(value??'').replace(/\s*\+\s*\d+\b.*$/,'').trim();
 return index.get(norm(stripped))||null;
}
function label(name){const key=keyFor(name);return key?NAMES[key][0]:String(name??'');}
function isOfficial(name){const key=keyFor(name);return Boolean(key&&NAMES[key][1]);}
const escape=s=>s.split('').map(c=>'.*+?^$()[]{}|\\'.includes(c)?'\\'+c:c).join('');
const pattern=new RegExp('(^|[^A-Za-zÀ-ÿ0-9])('+all.map(escape).join('|')+')(?=$|[^A-Za-zÀ-ÿ0-9])','gi');
function translate(value){return String(value??'').replace(pattern,(_match,prefix,middle)=>prefix+label(middle));}
const SKIP='script,style,noscript,textarea,input,pre,code,svg,math,[contenteditable="true"]';
function excluded(node){
 const parent=node?.parentElement;
 return !parent||Boolean(parent.closest(SKIP))||
  Boolean(parent.closest('option')&&!parent.closest('option[value]'));
}
function translateTextNode(node){
 if(!node||node.nodeType!==3||excluded(node))return false;
 const old=node.nodeValue||'';
 if(!/[A-Za-z]/.test(old))return false;
 const updated=translate(old);
 if(updated===old)return false;
 node.nodeValue=updated;return true;
}
function apply(root){
 if(!root)return 0;
 if(root.nodeType===3)return Number(translateTextNode(root));
 if(![1,9,11].includes(root.nodeType))return 0;
 if(root.nodeType===1&&root.matches?.(SKIP))return 0;
 const doc=root.ownerDocument||root,walker=doc.createTreeWalker(root,4),nodes=[];
 while(walker.nextNode())nodes.push(walker.currentNode);
 let count=0;for(const n of nodes)count+=Number(translateTextNode(n));
 if(root.nodeType===1){
  const nodesWithAttrs=[root,...(root.querySelectorAll?.('[title],[aria-label]')||[])];
  for(const element of nodesWithAttrs)for(const attr of ['title','aria-label']){
   if(!element.hasAttribute?.(attr)||element.matches(SKIP))continue;
   const before=element.getAttribute(attr),after=translate(before);
   if(before!==after){element.setAttribute(attr,after);count++;}
  }
 }
 return count;
}
function observe(doc){
 if(!doc?.body)return false;apply(doc.body);
 const Mutation=doc.defaultView?.MutationObserver;if(!Mutation)return true;
 const observer=new Mutation(list=>{
  for(const mutation of list){
   if(mutation.type==='characterData')translateTextNode(mutation.target);
   for(const node of mutation.addedNodes||[])apply(node);
  }
 });
 observer.observe(doc.body,{subtree:true,childList:true,characterData:true});
 return true;
}
return Object.freeze({NAMES,ALIASES,keyFor,label,isOfficial,translate,apply,observe});
});
