/* Craque Tático — integração dos botões de backup seguro V226. */
(()=>{'use strict';
const backup=window.CRAQUE_BACKUP;
const modal=document.getElementById('scout-backup-modal');
if(!modal||!backup)return;
const feedback=modal.querySelector('#scout-backup-status');
const exportBtn=modal.querySelector('#scout-export');
const importBtn=modal.querySelector('#scout-import');
const pick=modal.querySelector('#scout-pick');
modal.querySelector('h3').textContent='Proteção de dados · Craque Tático';
exportBtn.textContent='Salvar backup completo';
importBtn.textContent='Importar e restaurar backup';
const recover=document.createElement('button');
recover.id='craque-backup-recover';recover.textContent='Recuperar cópia automática';
modal.querySelector('#scout-close').before(recover);
const reload=document.createElement('button');
reload.id='craque-backup-reload';reload.textContent='Recarregar dados restaurados';reload.hidden=true;
feedback.after(reload);reload.onclick=()=>location.reload();
exportBtn.onclick=async()=>{
 exportBtn.disabled=true;
 try{
  const result=await backup.exportToFile(localStorage);
  feedback.textContent=result.status==='saved'?'Backup salvo e confirmado. Guarde seu JSON fora do aparelho.':
   result.status==='cancelled'?'Salvamento cancelado; seus dados continuam aqui.':
   'Download solicitado; confira o arquivo no navegador.';
 }catch(e){feedback.textContent='Falha no backup: '+String(e.message||e)}
 finally{exportBtn.disabled=false}
};
importBtn.onclick=()=>pick.click();
pick.onchange=async()=>{
 const file=pick.files?.[0];if(!file)return;
 importBtn.disabled=true;
 try{
  const result=await backup.restoreFromInput(localStorage,file,msg=>confirm(msg));
  feedback.textContent=result.status==='restored'?result.records+' registros restaurados. Recarregue o app.':'Restauração cancelada.';
  reload.hidden=result.status!=='restored';
 }catch(e){feedback.textContent='Restauração não concluída: '+String(e.message||e)}
 finally{pick.value='';importBtn.disabled=false}
};
recover.onclick=async()=>{
 recover.disabled=true;
 try{
  const record=await backup.recoverySnapshot(localStorage);
  if(!record)throw Error('Nenhuma cópia automática encontrada.');
  const info=await backup.inspect(record);
  if(!confirm('Recuperar '+backup.summary(info)+'? Primeiro será salvo um backup externo de segurança.'))return;
  const safety=await backup.exportToFile(localStorage,'CraqueTatico-Copia-Antes-Da-Recuperacao.json');
  if(safety.status!=='saved')throw Error('Cópia preventiva não confirmada. Nada foi alterado.');
  const result=backup.apply(localStorage,info);
  feedback.textContent=result.written+' registros recuperados. Recarregue o aplicativo.';
  reload.hidden=false;
 }catch(e){feedback.textContent='Recuperação interrompida: '+String(e.message||e)}
 finally{recover.disabled=false}
};
let timer=null,busy=false;
function scheduleAutoBackup(){
 clearTimeout(timer);
 timer=setTimeout(async()=>{
  if(busy)return;
  busy=true;
  try{await backup.autoSnapshot(localStorage)}
  catch(e){console.warn('Cópia local indisponível:',e)}
  finally{busy=false}
 },6000);
}
document.addEventListener('craque:data-changed',scheduleAutoBackup);
document.addEventListener('change',scheduleAutoBackup,{passive:true});
document.addEventListener('click',ev=>{if(ev.target?.closest?.('button'))scheduleAutoBackup()},{passive:true});
if(Object.keys(backup.collect(localStorage)).length)scheduleAutoBackup();
})();