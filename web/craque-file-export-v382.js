/* Exportação nativa compartilhando o contrato V225. */
(()=>{'use strict';
async function scoutSaveJson(data,fileName){
 const clean=String(fileName||'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,110);
 if(!clean.endsWith('.json')||clean==='.json')throw Error('Nome de exportação inválido');
 const content=JSON.stringify(data,null,2);
 if(!content)throw Error('Não há dados para exportar');
 const size=new Blob([content]).size;
 if(size>8*1024*1024)throw Error('Exportação ultrapassou 8 MB');
 const cap=window.Capacitor;
 const onAndroid=Boolean(cap?.isNativePlatform?.()&&cap?.getPlatform?.()==='android');
 if(onAndroid){
  const plugin=cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport');
  if(typeof plugin?.saveJson!=='function')
   throw Error('O salvamento de JSON exige a versão V225 ou posterior do APK Android.');
  const result=await plugin.saveJson({fileName:clean,content});
  if(!['saved','cancelled'].includes(result?.status))throw Error('O Android não confirmou o salvamento');
  return result;
 }
 if(typeof window.scoutDesktop?.saveJson==='function'){
  const result=await window.scoutDesktop.saveJson(clean,content);
  if(!['saved','cancelled'].includes(result?.status))throw Error('O Windows não confirmou o arquivo');
  return result;
 }
 const blob=new Blob([content],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 try{
  const anchor=document.createElement('a');anchor.href=url;anchor.download=clean;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
 }finally{setTimeout(()=>URL.revokeObjectURL(url),10000)}
 return {status:'requested'}; // Navegador: o usuário deve conferir o download.
}
window.SCOUT_FILE_EXPORT=Object.freeze({saveJson:scoutSaveJson});
})();
