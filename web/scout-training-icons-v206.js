/* Scout PRO V206 — símbolos originais de treino. Apenas a decoração V201 é trocada. */
(function(host){
'use strict';
const SHAPES=Object.freeze({
 chute:'<path d="M10 45q7-11 19-12l8 8 8 7H12z" fill="#214453" stroke="#e6f2e9" stroke-width="2.5" stroke-linejoin="round"/><path d="m17 38 8 5m3-12 9-11M9 52h37" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="46" cy="18" r="8" fill="#ebf5ed" stroke="#85afa9" stroke-width="1.6"/><path d="m43 13 6 2 2 5-6 3-5-5z" fill="#234a5b"/><path d="m8 27 8-2m-9 8 6-1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 passe:'<circle cx="15" cy="43" r="8" fill="none" stroke="#edf5eb" stroke-width="2.5"/><path d="m12 40 6-1 3 5-5 4-5-3z" fill="currentColor"/><path d="M26 39q9-17 23-18m-9-7 10 7-9 8M30 48h18m-3-4 4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="49" cy="21" r="2.5" fill="#e6f4e8"/>',
 drible:'<path d="M13 43q17-5 14-16t14-6l7 5m-6-9 8 10-12 2" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="3 5"/><path d="m25 46 6-11 6 11zm13 0 6-11 6 11z" fill="#244959" stroke="#d9eee5" stroke-width="2"/><circle cx="14" cy="47" r="7" fill="#e8f3ec" stroke="#81aea5" stroke-width="1.4"/><path d="m12 43 6 2-1 6-6-1-2-4z" fill="#265563"/>',
 destreza:'<circle cx="31" cy="31" r="15" fill="none" stroke="#547985" stroke-width="2" stroke-dasharray="2 5"/><path d="m35 12-17 23h12l-3 17 20-27H34z" fill="#e4cb92" stroke="#f0f4e8" stroke-width="1.9" stroke-linejoin="round"/><path d="m12 18 4-4m32 31 4 4M12 49l4-4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><circle cx="48" cy="13" r="2.5" fill="currentColor"/>',
 pernas:'<path d="M24 12h15l-3 17-8 9-4 13H12l3-12 9-15z" fill="#375467" stroke="#e0eee6" stroke-width="2.5" stroke-linejoin="round"/><path d="m35 27 7 8-3 11 11 3v5H32l-7-9" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 22h9m-7-7h9M8 48h7" fill="none" stroke="#e6c891" stroke-width="2.4" stroke-linecap="round"/>',
 aereo:'<circle cx="30" cy="17" r="8" fill="#e7f1eb" stroke="#87b0aa" stroke-width="1.5"/><path d="m27 13 6 1 2 5-5 3-5-4z" fill="#315262"/><path d="M15 50q8-13 18-13l12 8 4 7H15z" fill="#284959" stroke="#d5efe8" stroke-width="2.4" stroke-linejoin="round"/><circle cx="30" cy="30" r="6" fill="#dbc8b2" stroke="#bca58a" stroke-width="1.4"/><path d="M13 32l6-8m28 10-7-9m-10-6v3m-8 17-8-3m23 2 9-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>',
 defesa:'<path d="M32 10 49 18v15q-1 12-17 21Q16 45 15 33V18z" fill="#174b4c" stroke="#d8eee3" stroke-width="2.6" stroke-linejoin="round"/><path d="m24 32 6 6 12-14" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 19H7m45 0h4M32 7V3" stroke="#e1c78b" stroke-width="2.3" stroke-linecap="round" fill="none"/>',
 goleiro1:'<path d="m14 44-4-11 6-3 6 8-2-22 7-1 3 18 2-21 7 1-1 20 7-13 7 4-6 21-11 9H24z" fill="#284e58" stroke="#def2e9" stroke-width="2.5" stroke-linejoin="round"/><path d="m23 42 20 2m-13-7v10M10 20h8m-8 7h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 goleiro2:'<path d="M11 43q13-20 31-23m-8-6 9 6-7 10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="m15 47 14-12 12 8-2 10H15z" fill="#294c5d" stroke="#d3ece6" stroke-width="2.3" stroke-linejoin="round"/><circle cx="13" cy="48" r="5" fill="#d7c8b5" stroke="#e4e8df" stroke-width="1.5"/><circle cx="49" cy="17" r="6" fill="#e6f2ed" stroke="#8cb4ad" stroke-width="1.5"/><path d="m47 13 5 1 1 4-4 3-4-3z" fill="#305563"/>',
 goleiro3:'<path d="M12 43V15h40v28M12 24h40M21 15v28m11-28v28m11-28v28" fill="none" stroke="#64828e" stroke-width="2" stroke-linecap="round"/><path d="m20 37 12-6 12 6v13H20z" fill="#244958" stroke="#e4f0e9" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="21" r="8" fill="#dcefeb" stroke="#83b1ab" stroke-width="1.8"/><path d="m29 17 6 2-1 5-6-1-2-4z" fill="#305664"/><path d="M17 53h30" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'
});
function render(key){
 if(!Object.prototype.hasOwnProperty.call(SHAPES,key))return '';
 return '<svg class="scout-v201-svg scout-v206-svg" data-scout-v206-symbol="'+key+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="2.5" y="2.5" width="59" height="59" rx="16" fill="#0b2532" stroke="currentColor" stroke-opacity=".38" stroke-width="1.5"/><path d="M11 6h26" stroke="#d1f2ea" stroke-opacity=".25" stroke-width="2" stroke-linecap="round"/><circle cx="53" cy="53" r="2" fill="currentColor" opacity=".9"/><g>'+SHAPES[key]+'</g></svg>';
}
function upgrade(icon){
 if(!icon||icon.nodeType!==1||icon.getAttribute('data-scout-v206')==='1')return false;
 const key=icon.parentElement?.getAttribute('data-scout-training-icon');
 if(!Object.prototype.hasOwnProperty.call(SHAPES,key))return false;
 icon.innerHTML=render(key); // Somente SVG de origem local; não recebe HTML dos jogadores.
 icon.classList.add('scout-v206-icon');
 icon.setAttribute('data-scout-v206','1');
 return true;
}
function apply(root){
 if(!root||typeof root.querySelectorAll!=='function')return 0;
 let count=0;
 if(root.matches?.('.scout-v201-icon'))count+=Number(upgrade(root));
 for(const icon of root.querySelectorAll('.scout-v201-icon'))count+=Number(upgrade(icon));
 return count;
}
const api=Object.freeze({SHAPES,render,upgrade,apply});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function boot(){
 const doc=host.document;
 if(doc.body?.dataset.page!=='detail')return;
 apply(doc);
 if(typeof host.MutationObserver!=='function')return;
 const observer=new host.MutationObserver(mutations=>{
  for(const mutation of mutations)for(const node of mutation.addedNodes)if(node.nodeType===1)apply(node);
 });
 observer.observe(doc.body,{childList:true,subtree:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})(typeof window!=='undefined'?window:null);
