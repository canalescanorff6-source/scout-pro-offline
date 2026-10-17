/* Abertura premium do Craque Tático. Somente ao iniciar aplicativo instalado. */
(()=>{'use strict';
const native=Boolean(window.Capacitor?.isNativePlatform?.()||window.scoutDesktop);
if(!native||document.body?.dataset.page!=='catalog')return;
try{if(sessionStorage.getItem('craque:v226:intro'))return;sessionStorage.setItem('craque:v226:intro','1')}catch(_){}
const intro=document.createElement('div');
intro.className='craque-launch';intro.setAttribute('role','status');intro.setAttribute('aria-label','Abrindo Craque Tático');
intro.innerHTML='<img src="assets/craque-tatico-icon.svg" alt="">'+
 '<strong>CRAQUE TÁTICO</strong><span>LABORATÓRIO DE FUTEBOL</span>';
document.body.appendChild(intro);
setTimeout(()=>{intro.classList.add('craque-launch-exit');setTimeout(()=>intro.remove(),390)},1050);
})();