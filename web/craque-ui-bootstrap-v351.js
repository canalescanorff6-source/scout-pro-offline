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
  // V356: DOMContentLoaded encerra a espera por imagens de 246 cartas.
  // window.load pode demorar em aparelhos lentos e causar falso fallback.
  let loaded=doc.readyState!=='loading',finished=false,pending=false;
  const badge=typeof doc.getElementById==='function'
   ?doc.getElementById('ct356-boot-proof'):null;
  let installed='versão não identificada';
  const writeProof=(mode)=>{
   if(!badge)return;
   badge.dataset.status=mode;
   badge.textContent=(mode==='premium'?'Premium ativo':mode==='fallback'
    ?'Premium em recuperação':'Verificando interface')+' · '+installed;
  };
  writeProof('loading');
  if(badge&&typeof host.fetch==='function'){
   host.fetch('scout-build-info.json',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('missing build');return r.json()})
    .then(info=>{
     const version=String(info.version||'');
     const revision=String(info.git_revision||'');
     installed=/^\\d+\\.\\d+\\.\\d+$/.test(version)
      ?'v'+version+(revision&&revision!=='source-unbuilt'?' · '+revision.slice(0,7):'')
      :'pacote sem versão verificada';
     writeProof(doc.body?.dataset.ctUiBoot||'loading');
    }).catch(()=>{installed='pacote não identificado';writeProof(doc.body?.dataset.ctUiBoot||'loading')});
  }
  const close=(mode)=>{
   if(finished)return;
   finished=true;
   doc.body?.removeAttribute('aria-busy');
   if(doc.body)doc.body.dataset.ctUiBoot=mode;
   html.classList.remove(BOOT);
   writeProof(mode);
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
  else{
   // DOM pronto e CSS carregado já são suficientes; não aguardar
   // 246 imagens e recursos remotos para liberar a interface Premium.
   doc.addEventListener('DOMContentLoaded',finishLoad,{once:true});
   host.addEventListener('load',finishLoad,{once:true});
  }
  doc.addEventListener('scoutpro:ui-ready',check);
  // Falha segura: nunca prender o usuário em splash se o CSS/JS falhar.
  // A versão de compatibilidade fica assinalada para diagnóstico.
  host.setTimeout(()=>{if(!finished)close('fallback')},10000);
  if(doc.body)doc.body.setAttribute('aria-busy','true');
  return {check,close};
 }
 return Object.freeze({BOOT,REQUIRED,ready,init});
});
