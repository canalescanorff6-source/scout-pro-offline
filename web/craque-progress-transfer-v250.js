/* Craque Tático V250 — transferir conferências de nível entre Windows e Android.
 * Arquivo V248 é um DECLARATÓRIO do usuário, não prova independente do jogo.
 * Padrão: não substituir registros existentes; importar somente a edição exata.
 * Aplicação atômica e reversível em caso de falha, nenhuma alteração em builds.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_PROGRESS_TRANSFER_V250=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const SCHEMA='CRAQUE_PROGRESS_REVIEW_V248';
const PREFIX='scoutpro:v248:level-review:';
const MAX_RECORDS=246,MAX_BYTES=1024*1024;
const key=card=>PREFIX+Number(card.numero)+'@'+String(card.id);
const budget=n=>Number.isInteger(n)&&n>=1&&n<=120?2*(n-1):null;
function valid(card,item){
 return Boolean(card&&item&&typeof item==='object'&&!Array.isArray(item)&&
  item.schema===SCHEMA&&item.confirmed_in_game===true&&
  Number.isInteger(item.numero)&&item.numero===Number(card.numero)&&
  typeof item.card_id==='string'&&item.card_id===String(card.id)&&
  typeof item.name==='string'&&item.name===String(card.name)&&
  typeof item.edition==='string'&&item.edition.trim().length>0&&
  item.edition===String(card.versao||'')&&
  budget(item.level)!==null&&item.pp===budget(item.level)&&
  typeof item.source==='string'&&item.source.length<=150&&
  typeof item.confirmed_at==='string'&&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(item.confirmed_at)&&
  !Number.isNaN(Date.parse(item.confirmed_at))&&
  item.confirmed_at.length<=40);
}
function equalRecord(a,b){
 return a&&b&&a.numero===b.numero&&a.card_id===b.card_id&&
  a.edition===b.edition&&a.level===b.level&&a.pp===b.pp;
}
function inspect(input,cards,store){
 if(!Array.isArray(cards)||cards.length!==246)
  throw Error('O acervo de 246 cartas está incompleto; importação cancelada.');
 if(!input||typeof input!=='object'||Array.isArray(input)||
  input.schema!==SCHEMA||!Array.isArray(input.records)||
  !Number.isInteger(input.total)||input.total!==input.records.length||
  input.records.length<1||input.records.length>MAX_RECORDS||
  !Array.isArray(cards)||cards.length!==246)
  throw Error('Arquivo não é uma exportação válida de níveis do Craque Tático.');
 const byNo=new Map(cards.map(c=>[Number(c.numero),c]));
 if(byNo.size!==246)throw Error('Acervo de 246 cartas incompleto.');
 const seen=new Set();
 const records=[],conflicts=[],unchanged=[],newOnes=[],errors=[];
 for(const item of input.records){
  const card=byNo.get(item?.numero);
  const slot=card?key(card):null;
  if(!valid(card,item)){
   errors.push('Edição não vinculada ou registro inválido: #'+String(item?.numero??'?')+
    '. Confira versão/Card ID e reconfirme no jogo antes de importar.');
   continue;
  }
  if(seen.has(slot)){
   errors.push('Carta duplicada no arquivo: #'+item.numero);
   continue;
  }
  seen.add(slot);
  const rawLocal=store.getItem(slot);
  const prior=readSaved(card,store);
  // Não apagar silenciosamente um registro corrompido ou de outro esquema:
  // preservar sua cópia até um backup ou reparo manual explícito.
  if(rawLocal!==null&&rawLocal!==undefined&&!prior){
   errors.push('Registro local incompatível ou danificado: #'+item.numero);
   continue;
  }
  const line={card,item,key:slot,prior};
  records.push(line);
  if(prior){
   if(equalRecord(prior,item))unchanged.push(line);
   else conflicts.push(line);
  }else newOnes.push(line);
 }
 // Fail closed: se qualquer linha for inválida, NÃO importar as demais.
 if(errors.length)throw Error('Importação bloqueada: '+errors.slice(0,5).join('; '));
 return Object.freeze({
  total:records.length,records,
  newOnes,conflicts,unchanged,
  countNew:newOnes.length,countConflict:conflicts.length,
  countUnchanged:unchanged.length
 });
}
function readSaved(card,store){
 try{
  const item=JSON.parse(store.getItem(key(card))||'null');
  return valid(card,item)?item:null;
 }catch(_){return null}
}
function apply(input,cards,store,{replaceConflicts=false}={}){
 const plan=inspect(input,cards,store);
 const changing=[
  ...plan.newOnes,
  ...(replaceConflicts?plan.conflicts:[])
 ];
 const snapshot=new Map();
 for(const entry of changing)snapshot.set(entry.key,store.getItem(entry.key));
 let changed=0;
 try{
  for(const entry of changing){
   store.setItem(entry.key,JSON.stringify(entry.item));
   changed++;
  }
 }catch(error){
  let rollbackFailed=false;
  for(const [k,old] of snapshot){
   try{
    if(old===null||old===undefined)store.removeItem(k);
    else store.setItem(k,old);
  }catch(_){rollbackFailed=true}
  }
  throw Error(rollbackFailed?
   'Falha durante a importação. A restauração automática também falhou; não continue sem conferir o backup.':
   'Falha ao salvar conferências; alterações revertidas: '+String(error?.message||error));
 }
 return Object.freeze({
  imported:changed,
  newRecords:plan.countNew,
  replaced:replaceConflicts?plan.countConflict:0,
  preserved:replaceConflicts?0:plan.countConflict,
  alreadyPresent:plan.countUnchanged
 });
}
const api=Object.freeze({SCHEMA,PREFIX,MAX_RECORDS,MAX_BYTES,key,budget,valid,readSaved,inspect,apply});
if(!host?.document)return api;
const doc=host.document,$=id=>doc.getElementById(id);
const fmt=msg=>String(msg??'');
const safe=s=>fmt(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let chosen=null,catalog=null;
function report(message,error=false){
 const area=$('v250-notice');if(!area)return;
 area.textContent=message;area.dataset.error=error?'true':'false';
}
function reset(){
 chosen=null;
 $('v250-preview').hidden=true;
 $('v250-file').value='';
 $('v250-confirm').checked=false;
 $('v250-import').disabled=true;
}
function showPreview(plan,fileName){
 const duplicates=plan.conflicts.slice(0,10).map(x=>{
  const n='#'+String(x.card.numero).padStart(3,'0');
  return '<li><strong>'+n+' '+safe(x.card.name)+'</strong> · Neste dispositivo: nível '+
   x.prior.level+' / '+x.prior.pp+' PP · Arquivo: nível '+x.item.level+
   ' / '+x.item.pp+' PP</li>';
 }).join('');
 $('v250-preview-count').textContent=plan.countNew+' novas conferências · '+
  plan.countUnchanged+' já existentes · '+plan.countConflict+' conflitos.';
 $('v250-conflicts').innerHTML=duplicates||
  '<li>Nenhum conflito com suas conferências já salvas.</li>';
 $('v250-conflict-note').hidden=!plan.countConflict;
 $('v250-confirm').checked=false;
 $('v250-import').disabled=plan.countNew===0&&!plan.countConflict;
 $('v250-preview').hidden=false;
 report('Arquivo '+fileName+' validado por número, Card ID, nome, nível e PP. '+
  'Confira a prévia antes de importar.');
}
async function fileChosen(file){
 reset();
 if(!file)return;
 if(file.size>MAX_BYTES)throw Error('Arquivo maior que 1 MB: importação bloqueada.');
 let data;
 try{data=JSON.parse(await file.text())}
 catch(_){throw Error('Arquivo JSON ilegível ou inválido.')}
 if(JSON.stringify(data).length>MAX_BYTES)throw Error('Arquivo JSON maior que 1 MB.');
 const plan=inspect(data,catalog,host.localStorage);
 chosen={data,fileName:file.name};
 showPreview(plan,file.name);
}
async function mount(){
 if(doc.body?.dataset.page!=='progress-audit')return;
 const open=$('v250-choose'),file=$('v250-file'),applyButton=$('v250-import');
 if(!open||!file||!applyButton)return;
 try{
  const response=await host.fetch('SCOUT_V69_AUDITORIA.json');
  if(!response.ok)throw Error('Catálogo offline indisponível.');
  catalog=(await response.json()).cards;
  if(!Array.isArray(catalog)||catalog.length!==246)throw Error('O acervo de cartas está incompleto.');
 }catch(error){
  open.disabled=true;
  report('Não foi possível ativar importação: '+fmt(error.message),true);
  return;
 }
 open.addEventListener('click',()=>file.click());
 file.addEventListener('change',async()=>{
  try{await fileChosen(file.files?.[0])}
  catch(error){reset();report(fmt(error.message),true)}
 });
 $('v250-cancel').addEventListener('click',()=>{reset();report('Importação cancelada; nenhum dado foi alterado.')});
 applyButton.addEventListener('click',async()=>{
  if(!chosen)return;
  try{
   const current=inspect(chosen.data,catalog,host.localStorage);
   const replace=$('v250-confirm').checked;
   if(replace&&current.countConflict){
    if(typeof host.confirm==='function'&&
     !host.confirm('Substituir '+current.countConflict+' níveis já confirmados neste dispositivo pelos valores do arquivo?'))return;
   }
   if(!replace&&current.countConflict)
    report('Conflitos serão preservados; apenas conferências novas serão importadas.');
   // V226 cria um snapshot ANTES da alteração quando disponível.
   // Se a proteção estiver indisponível por erro, cancelar a operação.
   if(typeof host.CRAQUE_BACKUP_V226?.protect==='function'){
    await host.CRAQUE_BACKUP_V226.protect('pre-progress-import');
   }
   const summary=apply(chosen.data,catalog,host.localStorage,{replaceConflicts:replace});
   reset();
   report('Importação concluída: '+summary.imported+' registros salvos · '+
    summary.preserved+' conflitos preservados · '+summary.alreadyPresent+' já existentes. '+
    'As builds originais e as demais configurações continuam intactas.');
   // A página de conferência original mantém o próprio estado e a contagem.
   // Um evento explícito permite atualizar as 246 cartas sem recarregar.
   host.dispatchEvent(new Event('craque:v250:progress-imported'));
   host.dispatchEvent(new Event('craque:data-changed')); // backup V226 automático
  }catch(error){report('Nada importado: '+fmt(error.message),true)}
 });
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
return api;
});
