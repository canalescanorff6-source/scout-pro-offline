/* Craque Tático V226: pacote de dados portátil, validação e recuperação segura. */
(function(root){
'use strict';
const FORMAT='craque-tatico-backup-v2';
const PREFIX='scoutpro:';
const MAX_SIZE=8*1024*1024;
const META_KEY='craque:v226:backup-meta';
const AUTO_KEY='craque:v226:autosnapshot';
const encoder=new TextEncoder();
function keys(storage){
 return Object.keys(storage).filter(k=>k.startsWith(PREFIX)).sort();
}
function collect(storage){
 return Object.fromEntries(keys(storage).map(k=>[k,storage.getItem(k)]));
}
function assertItems(items){
 if(!items||typeof items!=='object'||Array.isArray(items))throw Error('Dados de backup inválidos');
 const entries=Object.entries(items);
 if(entries.length>4000)throw Error('Backup excede 4.000 registros');
 if(entries.some(([k,v])=>!k.startsWith(PREFIX)||typeof v!=='string'||k.length>240))
  throw Error('Backup contém dados fora do aplicativo');
 for(const [k,v] of entries){
  if(k==='scoutpro:v219:black-caps'){
   const caps=JSON.parse(v);
   if(!Array.isArray(caps)||caps.length>23||new Set(caps).size!==caps.length||
       caps.some(n=>!Number.isInteger(n)||n<1||n>246))
    throw Error('Lista de jogadores restritos incorreta no backup');
  }
  if(k==='scoutpro:v219:match-logs'){
   const logs=JSON.parse(v);
   if(!logs||Array.isArray(logs)||typeof logs!=='object')
    throw Error('Histórico de partidas inválido');
  }
 }
 return entries;
}
async function sha256(str){
 if(!root.crypto?.subtle)throw Error('A verificação SHA-256 não está disponível neste dispositivo');
 const hash=await root.crypto.subtle.digest('SHA-256',encoder.encode(str));
 return [...new Uint8Array(hash)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
async function create(storage){
 const items=collect(storage);assertItems(items);
 const data=JSON.stringify(items);
 if(encoder.encode(data).length>MAX_SIZE-1000)throw Error('Backup excede o limite de 8 MB');
 return {format:FORMAT,exported_at:new Date().toISOString(),
  record_count:Object.keys(items).length,catalog_count:246,
  digest:await sha256(data),items};
}
async function inspect(file){
 const data=typeof file==='string'?JSON.parse(file):file;
 if(!data||!['scoutpro-userdata-v1',FORMAT].includes(data.format))throw Error('Arquivo de backup não reconhecido');
 const items=data.items;
 const entries=assertItems(items);
 if(encoder.encode(JSON.stringify(items)).length>MAX_SIZE)throw Error('Backup acima de 8 MB');
 let verified=false;
 if(data.format===FORMAT){
  if(!/^[a-f0-9]{64}$/.test(data.digest||''))throw Error('Assinatura de integridade ausente');
  const digest=await sha256(JSON.stringify(items));
  if(digest!==data.digest)throw Error('Backup alterado ou corrompido: SHA-256 não confere');
  if(data.record_count!==entries.length||data.catalog_count!==246)throw Error('Contagem do backup diverge');
  verified=true;
 }
 return {data,items,format:data.format,verified,count:entries.length,
  date:data.exported_at||'Sem data',hasBlack:Object.hasOwn(items,'scoutpro:v219:black-caps'),
  hasMatches:Object.hasOwn(items,'scoutpro:v219:match-logs')};
}
// Merge somente das chaves que estão no arquivo; rollback tenta preservar TODAS
// as chaves anteriores caso uma escrita falhe (QuotaExceededError, por exemplo).
function apply(storage,inspection){
 const entries=assertItems(inspection.items),before=collect(storage);
 const added=[];
 try{
  for(const [k,v] of entries){if(!Object.hasOwn(before,k))added.push(k);storage.setItem(k,v)}
 }catch(err){
  for(const k of added)try{storage.removeItem(k)}catch(_){}
  for(const [k,v] of Object.entries(before))try{storage.setItem(k,v)}catch(_){}
  throw Error('Restauração interrompida; dados anteriores recuperados quando possível: '+(err.message||err));
 }
 return {written:entries.length};
}
function summary(inspection){return `${inspection.count} registros · ${inspection.date} · ${inspection.verified?'integridade SHA-256 confirmada':'formato antigo sem SHA-256'}`;}
function saveMetadata(storage,result){
 try{storage.setItem(META_KEY,JSON.stringify({date:new Date().toISOString(),count:result.record_count||0}))}catch(_){}
}
async function exportToFile(storage,filename='CraqueTatico-Backup-Completo.json'){
 const payload=await create(storage);
 const save=root.SCOUT_FILE_EXPORT?.saveJson;
 if(typeof save!=='function')throw Error('Salvamento indisponível neste aplicativo');
 const outcome=await save(payload,filename);
 if(outcome?.status==='saved')saveMetadata(storage,payload);
 return outcome;
}
async function restoreFromInput(storage,file,confirmFn){
 if(!file)throw Error('Selecione o arquivo de backup');
 if(file.size>MAX_SIZE)throw Error('O arquivo excede 8 MB');
 const selected=await inspect(await file.text());
 if(!selected.count)throw Error('Backup vazio; não há dados a recuperar');
 if(!confirmFn('Restaurar '+summary(selected)+'? Antes de substituir dados, o aplicativo solicitará salvar uma cópia de segurança dos dados atuais.'))return {status:'cancelled'};
 const current=await create(storage);
 const save=root.SCOUT_FILE_EXPORT?.saveJson;
 if(typeof save!=='function')throw Error('Salvamento preventivo indisponível');
 const safety=await save(current,'CraqueTatico-AntesDaRestauracao.json');
 if(safety?.status!=='saved')throw Error('Restauração cancelada: salve e confirme antes a cópia de segurança');
 const result=apply(storage,selected);
 return {status:'restored',records:result.written,verified:selected.verified};
}
async function autoSnapshot(storage){
 const items=collect(storage);if(!Object.keys(items).length)return {status:'empty'};
 const payload=await create(storage),text=JSON.stringify(payload);
 const cap=root.Capacitor;
 if(cap?.isNativePlatform?.()&&cap?.getPlatform?.()==='android'){
  const p=cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport');
  if(typeof p?.storeSnapshot==='function')return p.storeSnapshot({record:text});
 }
 if(typeof root.scoutDesktop?.storeSnapshot==='function')return root.scoutDesktop.storeSnapshot(text);
 // Navegador: snapshot secundário local com proteção contra falha por quota.
 storage.setItem(AUTO_KEY,text);return {status:'saved'};
}
async function recoverySnapshot(storage){
 const cap=root.Capacitor;
 if(cap?.isNativePlatform?.()&&cap?.getPlatform?.()==='android'){
  const p=cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport');
  return (await p?.loadSnapshot?.())?.record||'';
 }
 if(typeof root.scoutDesktop?.loadSnapshot==='function')return (await root.scoutDesktop.loadSnapshot())?.record||'';
 return storage.getItem(AUTO_KEY)||'';
}
const api={FORMAT,collect,create,inspect,apply,summary,exportToFile,restoreFromInput,
 autoSnapshot,recoverySnapshot,saveMetadata,assertItems};
root.CRAQUE_BACKUP=Object.freeze(api);
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
