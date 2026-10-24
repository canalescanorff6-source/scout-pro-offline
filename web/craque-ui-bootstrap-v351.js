/* Craque Tático V351 — a interface Premium aparece SOMENTE após
 * tema final e navegação Premium prontos. Nada toca em cartas/PP/backup. */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host?.document)api.init(host);
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const BOOT='ct-v351-boot';
 const REQUIRED=['scout-ui-v189.css','craque-design-v230.css',
  'craque-experience-v232.css','craque-visual-system-v234.css'];
 function ready(doc,loaded){
  if(!loaded||!doc?.body||doc.body.dataset.page!=='catalog'|| 
     doc.body.dataset.scoutV189!=='1'||!doc.querySelector('.scout-v189-home'))
   return false;
  const links=[...doc.querySelectorAll('link[rel="stylesheet"]')];
  return REQUIRED.every(file=>links.some(link=>
   String(link.getAttribute('href')||'').split('?')[0].endsWith(file)&&
   Boolean(link.sheet)));
 }
 function init(host){
  const doc=host.document,html=doc?.documentElement;
  if(!html?.classList?.contains(BOOT))return;
  let loaded=doc.readyState==='complete',finished=false,pending=false;
  const close=(mode)=>{
   if(finished)return;
   finished=true;
   doc.body?.removeAttribute('aria-busy');
   if(doc.body)doc.body.dataset.ctUiBoot=mode;
   html.classList.remove(BOOT);
  };
  function check(){
   if(finished||pending||!ready(doc,loaded))return;
   pending=true;
   // Duas pinturas depois de todos os CSS relevantes e do DOM Premium:
   // jamais mostrar a primeira tela HTML antiga entre duas cascatas.
   host.requestAnimationFrame(()=>host.requestAnimationFrame(()=>{
    pending=false;
    if(ready(doc,loaded))close('premium');
   }));
  }
  const finishLoad=()=>{loaded=true;check()};
  if(loaded)check();
  else host.addEventListener('load',finishLoad,{once:true});
  doc.addEventListener('scoutpro:ui-ready',check);
  // Falha segura: nunca prender o usuário em splash se o CSS/JS falhar.
  // A versão de compatibilidade fica assinalada para diagnóstico.
  host.setTimeout(()=>{if(!finished)close('fallback')},10000);
  if(doc.body)doc.body.setAttribute('aria-busy','true');
  return {check,close};
 }
 return Object.freeze({BOOT,REQUIRED,ready,init});
});
