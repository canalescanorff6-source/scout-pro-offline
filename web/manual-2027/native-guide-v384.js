/* V384: exports use native dialogs; the guide itself is always bundled offline. */
(()=>{'use strict';
const cap=window.Capacitor;
const android=Boolean(cap?.isNativePlatform?.()&&cap?.getPlatform?.()==='android');
const desktop=typeof window.scoutDesktop?.saveGuidePdf==='function';
if(!android&&!desktop)return;
const status=t=>{document.getElementById('feedback').textContent=t;};
async function save(){
 try{
  const plugin=android?(cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport')):null;
  const result=desktop?await window.scoutDesktop.saveGuidePdf():await plugin.saveGuidePdf();
  if(!['saved','cancelled'].includes(result?.status))throw Error('O sistema não confirmou o arquivo.');
  status(result.status==='saved'?'E-book salvo no destino escolhido.':'Salvamento do e-book cancelado.');
 }catch(e){status('Não foi possível salvar o e-book: '+e.message);}
}
document.addEventListener('click',e=>{
 const a=e.target.closest?.('a[download]');
 if(a?.getAttribute('href')==='manual-2027.pdf'){e.preventDefault();save();}
});
document.getElementById('reader-pdf').onclick=save;
})();
