/* Scout PRO V201 | Pictogramas originais inspirados na linguagem visual de jogos de futebol.
 * Não contém artes/arquivos proprietários da Konami. Não altera PP, níveis, build ou lógica.
 * Compatível com os 246 HTML de fichas e a mesma interface Android/Windows. */
(function(host){
'use strict';
const CATEGORIES=Object.freeze([
 ['chute','Chute','#f2be6b'],['passe','Passe','#7bdfd3'],
 ['drible','Drible','#83c7ef'],['destreza','Destreza','#dba8f3'],
 ['pernas','Força das pernas','#edae9a'],['aereo','Jogo aéreo','#95b4fd'],
 ['defesa','Defesa','#9bdbaf'],['goleiro1','Goleiro 1','#a4e1e7'],
 ['goleiro2','Goleiro 2','#a4e1e7'],['goleiro3','Goleiro 3','#a4e1e7']
]);
const BALL='<circle cx="47" cy="18" r="8.2" fill="#f4f8f7" stroke="#19374b" stroke-width="1.8"/><path d="m43.5 14.2 7 1 .9 5.2-5.3 3.3-5-3.2z" fill="#284d5e"/>';
const LINE='stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const ICON_SHAPES=Object.freeze({
 chute:'<path d="M11 40 26 37l6-12 7 2-2 13 11 6-1 5H12q-5-5-1-11z" fill="#f0bf80" stroke="#24465a" stroke-width="2.2"/><path d="m16 37 8-3m3 16h17M7 22h14M9 28h10" '+LINE+'/>'+BALL,
 passe:'<circle cx="16" cy="45" r="7.5" fill="#eef7f7" stroke="#274958" stroke-width="2"/><path d="M25 42q13-23 26-14M40 20l11 8-13 6M14 24h13m-5-6 6 6-6 6" '+LINE+'/><path d="m12 40 6 1 2 6-6 3-5-5z" fill="#294e5b"/>',
 drible:'<path d="M11 39q13-19 24-8t17-7" '+LINE+' stroke-dasharray="4 6"/><circle cx="15" cy="43" r="8" fill="#f4f9fa" stroke="#204353" stroke-width="2"/><path d="m13 37 7 2-1 6-6 1-3-5z" fill="#244d58"/><path d="m30 48 5-9 5 9zm15 0 5-9 5 9z" fill="#dcb17a" stroke="#204353" stroke-width="2"/>',
 destreza:'<path d="m33 8-5 17h12l-8 18 2-14H22z" fill="#eac98b" stroke="#74506f" stroke-width="1.6"/><path d="m12 30 6-7m-6 17 8-2m21 8 9 4m-14-2 7 8" '+LINE+'/><path d="M13 51q3-8 10-10l11-3 9 8-3 6H13z" fill="#b7c3e8" stroke="#3e5571" stroke-width="2"/>',
 pernas:'<path d="M24 13h15l-3 17-9 8-3 12H11l3-9 8-13z" fill="#e4af94" stroke="#694a55" stroke-width="2.4"/><path d="m35 28 7 7-5 11 11 4-2 5H30l-4-9m-15 3h14" '+LINE+'/><path d="M9 24h7m-5-7h10m-12 26h7" '+LINE+'/>',
 aereo:'<path d="M22 42q6-6 16-4l10 9-2 8H20l-4-7z" fill="#b3c3e6" stroke="#3e5571" stroke-width="2.2"/><circle cx="29" cy="26" r="8" fill="#e9b399" stroke="#805b57" stroke-width="2"/><path d="M29 8v9M18 16l5 5m19-5-5 5" '+LINE+'/>'+BALL,
 defesa:'<path d="M30 7 49 15v15q-1 15-19 25Q12 45 11 30V15z" fill="#1a685e" stroke="#b3e5c8" stroke-width="2.2"/><path d="m19 29 8 8 15-18" stroke="#ecf4e9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M16 12h28" stroke="#e2c78f" stroke-width="2" stroke-linecap="round"/>',
 goleiro1:'<path d="M17 47q-7-8-7-14l6-4 5 7-2-20 7-1 3 16 3-20 7 1-1 20 7-13 7 4-7 23-11 9H24z" fill="#b5e0d9" stroke="#25576d" stroke-width="2.3"/><path d="m20 41 24 1m-13-5v8" '+LINE+'/>',
 goleiro2:'<path d="M10 44q14-21 33-25m-10-6 11 6-6 11" '+LINE+'/><path d="m19 43 12-8 11 10-4 9-25-1z" fill="#a9c6e9" stroke="#36536f" stroke-width="2"/><circle cx="15" cy="47" r="5" fill="#e7b9a1"/>'+BALL,
 goleiro3:'<path d="M16 18q-7 5-6 13l11 9m27-22q7 5 6 13L43 40" '+LINE+'/><path d="m20 26-6 8 11 19h14l11-19-6-8-8 9h-8z" fill="#a5e2d9" stroke="#28516c" stroke-width="2"/><circle cx="32" cy="20" r="10" fill="#edf7f8" stroke="#28516c" stroke-width="2.4"/><path d="m28 16 8 2-2 8-8-1z" fill="#295164"/>'
});
const normalize=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function keyFor(value){
 const str=normalize(value);
 if(!str)return null;
 for(const [key,label] of CATEGORIES){
  const n=normalize(label);
  if(str===n||str.startsWith(n+' ')||str.startsWith(n+' ·'))return key;
 }
 return null;
}
function pictogram(key){
 const category=CATEGORIES.find(a=>a[0]===key);
 if(!category)return '';
 return '<svg class="scout-v201-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false">'+
  '<circle cx="32" cy="32" r="30" fill="#0e2a37" stroke="'+category[2]+'" stroke-width="2.3"/>'+
  '<circle cx="32" cy="32" r="25.4" fill="#173d4b" stroke="#ffffff" stroke-opacity=".10"/>'+
  '<g style="color:'+category[2]+'">'+ICON_SHAPES[key]+'</g></svg>';
}
function decorateElement(el){
 if(!el||el.nodeType!==1||el.hasAttribute('data-scout-training-icon'))return false;
 const key=keyFor(el.textContent);
 if(!key)return false;
 const icon=el.ownerDocument.createElement('span');
 icon.className='scout-v201-icon';
 icon.setAttribute('aria-hidden','true');
 icon.innerHTML=pictogram(key); // Trusted local SVG templates; never HTML from cards.
 el.insertBefore(icon,el.firstChild);
 el.setAttribute('data-scout-training-icon',key);
 el.classList.add('scout-v201-enriched');
 return true;
}
const SELECTORS=[
 '#v188-train .scout-v188-train-chip',
 '#lab-controls .lab-group > label',
 '.v68-progress-row > span:first-child',
 '#scout-training-v160 .v160-overflow tbody td:first-child'
];
function decorate(root){
 if(!root||typeof root.querySelectorAll!=='function')return 0;
 let count=0;
 for(const selector of SELECTORS){
  if(typeof root.matches==='function'&&root.matches(selector))count+=Number(decorateElement(root));
  for(const node of root.querySelectorAll(selector))count+=Number(decorateElement(node));
 }
 return count;
}
const api=Object.freeze({CATEGORIES,ICON_SHAPES,keyFor,pictogram,decorateElement,decorate});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function boot(){
 const doc=host.document;
 if(doc.body?.dataset.page!=='detail')return;
 decorate(doc);
 if(typeof host.MutationObserver!=='function')return;
 // Somente nós novos; renderizações do Laboratório recriam labels após cada ajuste.
 const observer=new host.MutationObserver(mutations=>{
  for(const mutation of mutations){
   for(const node of mutation.addedNodes){
    if(node.nodeType===1&&!node.classList?.contains('scout-v201-icon'))
      decorate(node);
   }
  }
 });
 observer.observe(doc.body,{childList:true,subtree:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})(typeof window!=='undefined'?window:null);
