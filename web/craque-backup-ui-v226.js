/* Craque Tático V226 — interface de backup restaurável. Carregado após app-bridge.js. */
(async()=>{'use strict';
 const modal=document.getElementById('scout-backup-modal');
 if(!modal)return;
 const api=window.CRAQUE_BACKUP_V226;
 if(!api)throw Error('Módulo de backup V226 ausente');
 const oldFeedback=modal.querySelector('#scout-backup-status'),file=modal.querySelector('#scout-pick');
 const exp=modal.querySelector('#scout-export'),imp=modal.querySelector('#scout-import');
 const title=modal.querySelector('h3');title.textContent='Craque Tático · Proteção dos seus dados';
 const desc=modal.querySelector('p');desc.textContent='Backup completo das fichas, habilidades, formações, partidas e 23 bloqueios. Confira a prévia antes de restaurar.';
 exp.textContent='Salvar arquivo de backup';imp.textContent='Importar e restaurar';
 const info=document.createElement('p');info.id='craque-backup-info';info.className='scout-backup-summary';info.setAttribute('role','status');desc.after(info);
 const buttons=document.createElement('div');buttons.className='scout-backup-tools';
 const local=document.createElement('button');local.type='button';local.id='craque-local-save';local.textContent='Guardar cópia local';
 const restore=document.createElement('button');restore.type='button';restore.id='craque-restore-confirm';restore.textContent='Confirmar restauração';restore.hidden=true;
 buttons.append(local,restore);imp.after(buttons);
 const preview=document.createElement('p');preview.id='craque-import-preview';preview.className='scout-backup-summary';preview.hidden=true;buttons.after(preview);
 let checked=null;
 const report=t=>{oldFeedback.textContent=t};
 async function refresh(){
  try{
   const v=await api.listLocal();
   const stamp=v.lastModified?new Date(v.lastModified).toLocaleString('pt-BR'):
    v.last?.at?new Date(v.last.at).toLocaleString('pt-BR'):'Ainda não registrada';
   info.textContent='Última cópia local: '+stamp+' · dispositivo '+v.kind+'. Exporte também um arquivo para guardar fora do aparelho.';
  }catch(e){info.textContent='Não foi possível consultar a cópia local: '+String(e.message||e)}
 }
 const show=async()=>{if(!modal.open)modal.showModal();await refresh()};
 window.CRAQUE_OPEN_BACKUP=show;
 const open=document.getElementById('scout-backup');if(open)open.onclick=show;
 exp.onclick=async()=>{
  exp.disabled=true;
  try{
   const data=await api.create(),result=await window.SCOUT_FILE_EXPORT.saveJson(data,'CraqueTatico-Backup-Completo-V226.json');
   report(result.status==='saved'?'Backup salvo com '+data.number_of_records+' registros e assinatura SHA-256.'
    :result.status==='cancelled'?'Exportação cancelada. Nenhum dado foi alterado.'
    :'Download solicitado. Confira sua pasta Downloads.');
  }catch(e){report('Falha ao exportar: '+String(e.message||e))}
  finally{exp.disabled=false}
 };
 local.onclick=async()=>{
  local.disabled=true;
  try{await api.protect('manual');report('Cópia interna salva e confirmada no dispositivo.');await refresh();}
  catch(e){report('Cópia interna falhou: '+String(e.message||e))}
  finally{local.disabled=false}
 };
 async function inspect(payload){
  checked=await api.inspect(payload);
  preview.hidden=false;restore.hidden=false;
  preview.textContent=api.describe(checked)+'. Apenas os registros do arquivo serão substituídos; os outros continuarão preservados.';
  report('Prévia conferida. Toque em Confirmar restauração para prosseguir.');
 }
 imp.onclick=async()=>{
  checked=null;preview.hidden=true;restore.hidden=true;
  try{
   const data=await api.readNative();
   if(data===null){report('Seleção cancelada. Nenhum dado foi alterado.');return;}
   if(data===undefined){file.click();return;}
   await inspect(data);
  }catch(e){report('Backup recusado: '+String(e.message||e))}
 };
 file.onchange=async()=>{
  try{
   const f=file.files?.[0];if(!f)return;
   if(f.size>8*1024*1024)throw Error('Arquivo maior que 8 MB.');
   await inspect(JSON.parse(await f.text()));
  }catch(e){checked=null;restore.hidden=true;report('Backup inválido: '+String(e.message||e))}
  finally{file.value=''}
 };
 restore.onclick=async()=>{
  if(!checked)return;
  if(!confirm('Restaurar '+checked.count+' registros? Os dados atuais terão cópia de segurança antes da substituição.'))return;
  restore.disabled=true;
  try{
   const result=await api.restore(checked);checked=null;restore.hidden=true;preview.hidden=true;
   report('Restauração concluída: '+result.count+' registros verificados. Feche e reabra o aplicativo para atualizar as fichas.');
  }catch(e){report('Restauração interrompida: '+String(e.message||e))}
  finally{restore.disabled=false}
 };
 const inLab=document.getElementById('craque-backup-open');
 if(inLab)inLab.onclick=show;
 await refresh();
})();