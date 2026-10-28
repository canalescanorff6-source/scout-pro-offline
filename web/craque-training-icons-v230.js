/* V230: dez pictogramas novos e autorais inspirados no ESCUDO do Craque Tático,
 * sem copiar assets da Konami ou substituir controles/treinos da conta.
 * Ícones vetoriais locais para a ficha principal e o laboratório avançado.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_TREINO_ICONS_V230=api;
 if(!host?.document)return;
 const run=()=>api.observe(host.document);
 if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',run,{once:true});
 else run();
})(typeof window!=='undefined'?window:null,function(){'use strict';
const SHAPES=Object.freeze({
 chute:'<circle cx="45" cy="18" r="9" class="ct-ball"/><path d="m41 15 5-2 4 4-1 5-5 1-5-4z" class="ct-detail"/><path d="m13 46 13-15 9 4-4 9-8 4-10 0z" class="ct-fill"/><path d="m11 52h28M12 29l9-7m-5 14 8-4m8 3 7-9" class="ct-stroke"/>',
 passe:'<circle cx="17" cy="42" r="8" class="ct-ball"/><circle cx="49" cy="17" r="6" class="ct-ball"/><path d="M27 42Q38 38 46 26m-10 0 10-2 3 9" class="ct-stroke"/><path d="M9 28q7-10 17-8m-7-4 7 4-7 5" class="ct-secondary"/>',
 drible:'<circle cx="14" cy="49" r="7" class="ct-ball"/><path d="M16 35C33 43 17 15 39 19c8 1 9 7 13 10" class="ct-dash"/><path d="m42 27 10 2-1-11" class="ct-stroke"/><path d="M12 17V9m-4 4h8M42 50V40m-5 5h10" class="ct-secondary"/>',
 destreza:'<path d="M37 8 15 35h14l-5 21 25-32H35z" class="ct-fill"/><path d="M37 8 15 35h14l-5 21 25-32H35z" class="ct-stroke"/><path d="m8 16 7 0m35 30 7 0M47 7v7M14 48v7" class="ct-secondary"/>',
 pernas:'<path d="m25 12 11 2-3 17-8 12-3 10H9l1-12 10-15z" class="ct-fill"/><path d="M33 31 43 37l-3 8 12 5v5H29l-6-10" class="ct-stroke"/><path d="M10 41h20m-21 7h16M41 12h8m-4-4v8" class="ct-secondary"/>',
 aereo:'<circle cx="36" cy="16" r="9" class="ct-ball"/><path d="m30 8 6 4 6-3m-12 7 6 6 7-3" class="ct-detail"/><path d="M16 52C12 36 19 25 28 25m-8 1 8-1-2 10" class="ct-stroke"/><path d="M43 37c5 5 7 9 7 15M13 53h43" class="ct-secondary"/>',
 defesa:'<path d="m32 8 19 8v16c0 11-8 18-19 24-11-6-19-13-19-24V16z" class="ct-fill"/><path d="m32 8 19 8v16c0 11-8 18-19 24-11-6-19-13-19-24V16z" class="ct-stroke"/><path d="m22 32 7 7 13-15" class="ct-check"/><path d="M32 13v8" class="ct-secondary"/>',
 goleiro1:'<path d="m17 44-5-13 6-3 6 8-2-20 7-1 3 19 2-22 7 1v21l6-14 6 4-5 22-11 8H25z" class="ct-fill"/><path d="m17 44-5-13 6-3 6 8-2-20 7-1 3 19 2-22 7 1v21l6-14 6 4-5 22-11 8H25z" class="ct-stroke"/><path d="M23 41h23M32 35v13" class="ct-secondary"/>',
 goleiro2:'<circle cx="48" cy="15" r="7" class="ct-ball"/><path d="M10 45q12-17 27-18m-6-8 8 7-3 10" class="ct-stroke"/><path d="m22 40 10-4 12 5-5 11H15z" class="ct-fill"/><path d="M14 55h34M13 34l-4 4" class="ct-secondary"/>',
 goleiro3:'<path d="M9 53V14h46v39M9 24h46M21 14v39m12-39v39m11-39v39" class="ct-secondary"/><circle cx="40" cy="43" r="9" class="ct-ball"/><path d="m36 37 7 2 1 6-7 3-4-5z" class="ct-detail"/><path d="M8 56h48" class="ct-stroke"/>'
});
function render(key,large=false){
 if(!Object.prototype.hasOwnProperty.call(SHAPES,key))return '';
 const classes=large?'scout-v208-svg scout-v230-svg':'scout-v201-svg scout-v206-svg scout-v230-svg';
 return '<svg class="'+classes+'" data-scout-v230-symbol="'+key+'"'+
  (large?'':' data-scout-v206-symbol="'+key+'"')+
  ' viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+
  '<rect x="2" y="2" width="60" height="60" rx="14" class="ct-frame"/>'+
  '<path d="M10 9h15M39 55h15" class="ct-glint"/>'+SHAPES[key]+'</svg>';
}
function upgrade(icon){
 if(!icon||icon.nodeType!==1||icon.getAttribute('data-craque-v230-icon')==='1')return false;
 const holder=icon.closest?.('[data-scout-training-icon]');
 const key=holder?.getAttribute('data-scout-training-icon');
 if(!Object.prototype.hasOwnProperty.call(SHAPES,key))return false;
 if(!icon.matches?.('.scout-v201-icon,.scout-v208-icon'))return false;
 const large=icon.matches('.scout-v208-icon');
 icon.innerHTML=render(key,large);
 if(!large){icon.classList.add('scout-v206-icon');icon.setAttribute('data-scout-v206','1');}
 icon.classList.add('scout-v230-icon');
 icon.setAttribute('data-craque-v230-icon','1');return true;
}
function apply(root){
 if(!root||root.nodeType!==1&&root.nodeType!==9)return 0;
 let count=0;
 if(root.matches?.('.scout-v201-icon,.scout-v208-icon'))count+=Number(upgrade(root));
 for(const icon of root.querySelectorAll?.('.scout-v201-icon,.scout-v208-icon')||[])count+=Number(upgrade(icon));
 return count;
}
function observe(doc){
 if(!doc?.body)return false;apply(doc);
 const Mutation=doc.defaultView?.MutationObserver;
 if(!Mutation)return true;
 const observer=new Mutation(list=>{
  for(const mutation of list)for(const node of mutation.addedNodes)
   if(node.nodeType===1)apply(node);
 });
 observer.observe(doc.body,{subtree:true,childList:true});return true;
}
return Object.freeze({SHAPES,render,upgrade,apply,observe});
});
