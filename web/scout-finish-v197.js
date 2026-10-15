/* Scout PRO V197 — metadados completos sob um controle compacto, sem perda de informação. */
(function(host){
'use strict';
function enhance(doc,mobile){
 if(!doc||doc.body?.dataset.page!=='detail')return null;
 const header=doc.querySelector('.profile-content > .detail-header');
 const edition=header?.querySelector('.detail-sub');
 if(!header||!edition)return null;
 let disclosure=header.querySelector('#scout-v197-edition');
 if(disclosure)return disclosure;
 disclosure=doc.createElement('details');
 disclosure.id='scout-v197-edition';
 disclosure.className='scout-v197-edition';
 const summary=doc.createElement('summary');
 summary.textContent='Versão e origem da carta';
 summary.setAttribute('aria-label','Expandir versão, campanha e origem desta carta');
 disclosure.appendChild(summary);
 disclosure.appendChild(edition); // Move o DOM original: nenhum texto, ID ou dado é copiado ou removido.
 header.insertBefore(disclosure,header.querySelector('.detail-lead')||null);
 disclosure.open=!mobile;
 return disclosure;
}
const api=Object.freeze({enhance});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function run(){
 const doc=host.document;
 const media=typeof host.matchMedia==='function'?host.matchMedia('(max-width:720px)'):{matches:false};
 const disclosure=enhance(doc,media.matches);
 if(!disclosure)return;
 if(typeof media.addEventListener==='function')
   media.addEventListener('change',event=>{disclosure.open=!event.matches});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})(typeof window!=='undefined'?window:null);
