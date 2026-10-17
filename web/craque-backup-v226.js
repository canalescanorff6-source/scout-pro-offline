/* Craque Tático V226: backup restaurável e snapshots redundantes.
 * Mantém as chaves scoutpro: para evitar perda de dados após o rebrand.
 * A importação nunca altera nada antes da validação e confirmação explícita.
 */
(function(host){'use strict';
const FORMAT='craque-tatico-backup-v226',LEGACY='scoutpro-userdata-v1';
const MAX_BYTES=8*1024*1024,MAX_KEYS=4000,SNAPSHOT_LIMIT=3;
const AUTO_DEBOUNCE=1400;
const KEY_PREFIX='scoutpro:',LAST_KEY='craque:v226:backup-last';
let lastTimer=null,lastError='',pending=Promise.resolve(),lastDigest=null;
const bytes=s=>new TextEncoder().encode(s).length;
const keys=()=>Object.keys(localStorage).filter(k=>k.startsWith(KEY_PREFIX)).sort();
function collect(){
 const result={};
 for(const k of keys())result[k]=localStorage.getItem(k);
 return result;
}
const digest=async text=>{
 const data=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
 return [...new Uint8Array(data)].map(x=>x.toString(16).padStart(2,'0')).join('');
};
function canonical(items){
 const sorted={};for(const k of Object.keys(items).sort())sorted[k]=items[k];
 return JSON.stringify(sorted);
}
async function create(){
 const items=collect(),serialized=canonical(items);
 if(bytes(serialized)>MAX_BYTES)throw Error('Os dados excedem 8 MB. Faça backup dividido antes de prosseguir.');
 return {format:FORMAT,schema_version:226,created_at:new Date().toISOString(),
  source:'Craque Tático — Laboratório de Futebol',number_of_records:Object.keys(items).length,
  checksum_algorithm:'SHA-256',checksum:await digest(serialized),items};
}
function shape(items){
 if(!items||typeof items!=='object'||Array.isArray(items))throw Error('O backup não possui registros válidos.');
 const records=Object.entries(items);
 if(records.length>MAX_KEYS)throw Error('O backup excede o limite seguro de registros.');
 for(const [k,v] of records){
  if(!k.startsWith(KEY_PREFIX)||k.length>200||typeof v!=='string')throw Error('Backup contém chave ou valor incompatível: '+k.slice(0,80));
  if(bytes(v)>MAX_BYTES)throw Error('Há um registro maior que 8 MB.');
 }
 if(bytes(canonical(items))>MAX_BYTES)throw Error('Arquivo de backup excede 8 MB.');
 return records;
}
async function validate(input){
 if(!input||typeof input!=='object')throw Error('Arquivo JSON inválido.');
 if(input.format!==FORMAT&&input.format!==LEGACY)throw Error('Backup de outro aplicativo ou formato desconhecido.');
 const entries=shape(input.items);
 if(input.format===FORMAT){
  if(input.schema_version!==226||input.checksum_algorithm!=='SHA-256'||!(/^[a-f0-9]{64}$/.test(String(input.checksum||''))))
   throw Error('Formato ou assinatura de integridade inválidos.');
  if(await digest(canonical(input.items))!==input.checksum)throw Error('Integridade do backup comprometida: SHA-256 não coincide.');
 }
 const names=entries.map(([k])=>k);
 return {format:input.format,items:input.items,entries,createdAt:String(input.created_at||input.exported_at||'sem data'),
  count:entries.length,legacy:input.format===LEGACY,
  hasRoster:names.includes('scoutpro:v219:black-caps'),
  hasMatches:names.includes('scoutpro:v219:match-logs'),
  training:entries.filter(([k])=>/train|ficha|progress|skill|booster|pp|build/i.test(k)).length};
}
function describe(check){
 return check.count+' registros • Restrições: '+(check.hasRoster?'sim':'não')+
  ' • Partidas: '+(check.hasMatches?'sim':'não')+
  ' • Treinos/configurações: '+check.training+
  ' • Origem: '+check.createdAt+(check.legacy?' • Formato anterior sem SHA-256':' • SHA-256 verificado');
}
function device(){
 const cap=host.Capacitor;
 if(cap?.isNativePlatform?.()&&cap?.getPlatform?.()==='android')
  return {kind:'android',api:cap.Plugins?.ScoutFileExport||cap.registerPlugin?.('ScoutFileExport')};
 if(host.scoutDesktop?.storeBackup)return {kind:'windows',api:host.scoutDesktop};
 return {kind:'browser'};
}
async function nativeSnapshot(data,kind='automatic'){
 const target=device(),content=JSON.stringify(data);
 if(bytes(content)>MAX_BYTES)throw Error('Snapshot excede 8 MB.');
 if(target.kind==='android'){
  if(typeof target.api?.storeBackup!=='function')throw Error('APK precisa suportar o backup nativo V226');
  const result=await target.api.storeBackup({content,reason:kind});
  if(result?.status!=='saved')throw Error('Android não confirmou o backup local');
 }else if(target.kind==='windows'){
  const result=await target.api.storeBackup(content,kind);
  if(result?.status!=='saved')throw Error('Windows não confirmou o backup local');
 }else{
  // Browser: snapshot de proteção em armazenamento independente das chaves antigas.
  localStorage.setItem('craque:v226:backup-snapshot',content);
 }
 host.localStorage.setItem(LAST_KEY,JSON.stringify({at:new Date().toISOString(),records:Object.keys(data.items||{}).length,kind}));
 return {status:'saved',kind:target.kind};
}
async function protect(reason='automatic'){
 const data=await create();
 if(data.checksum===lastDigest&&reason==='automatic')return {status:'unchanged'};
 const ret=await nativeSnapshot(data,reason);
 lastDigest=data.checksum;
 host.dispatchEvent(new CustomEvent('craque:backup-saved',{detail:{reason,records:data.number_of_records}}));
 return ret;
}
function queue(reason='automatic'){
 clearTimeout(lastTimer);
 lastTimer=setTimeout(()=>{
  pending=pending.catch(()=>{}).then(()=>protect(reason)).catch(e=>{
   lastError=String(e.message||e);
   host.dispatchEvent(new CustomEvent('craque:backup-error',{detail:{message:lastError}}));
  });
 },AUTO_DEBOUNCE);
}
async function restore(checked){
 if(!checked?.entries||!checked?.items)throw Error('Prévia obrigatória antes de restaurar.');
 // Verificar novamente imediatamente antes de gravar; não aceitar dados mutados após prévia.
 const input={format:checked.format,items:checked.items,
  schema_version:226,checksum_algorithm:'SHA-256',
  checksum:checked.checksum,created_at:checked.createdAt};
 if(checked.format===FORMAT&& !checked.checksum)throw Error('Assinatura SHA-256 não preservada na prévia.');
 await validate(input);
 const before=await create();
 await nativeSnapshot(before,'pre-restore'); // Falha de proteção interrompe restauração.
 const original=new Map();
 for(const [k] of checked.entries)original.set(k,localStorage.getItem(k));
 try{
  for(const [k,v] of checked.entries){
   localStorage.setItem(k,v);
   if(localStorage.getItem(k)!==v)throw Error('Verificação de gravação falhou para '+k);
  }
 }catch(error){
  try{
   for(const [k,v] of original){
    if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);
   }
  }catch(rollbackError){throw Error('Restauração interrompida e rollback falhou: '+rollbackError.message);}
  throw Error('Restauração desfeita sem apagar dados anteriores: '+String(error.message||error));
 }
 queue('after-restore');
 return {status:'restored',count:checked.entries.length};
}
async function inspect(payload){
 const check=await validate(payload);
 check.checksum=payload.checksum||null;
 return check;
}
async function readNative(){
 const target=device();
 if(target.kind==='android'&&target.api?.openJson){
  const ret=await target.api.openJson();
  if(ret?.status==='cancelled')return null;
  if(typeof ret?.content!=='string')throw Error('Android não forneceu conteúdo JSON');
  return JSON.parse(ret.content);
 }
 if(target.kind==='windows'&&target.api?.openJson){
  const ret=await target.api.openJson();
  if(ret?.status==='cancelled')return null;
  if(typeof ret?.content!=='string')throw Error('Windows não forneceu conteúdo JSON');
  return JSON.parse(ret.content);
 }
 return undefined; // Fallback browser: <input type=file>.
}
async function listLocal(){
 const target=device();
 if(target.kind==='android'&&target.api?.backupInfo)return target.api.backupInfo();
 if(target.kind==='windows'&&target.api?.backupInfo)return target.api.backupInfo();
 const last=JSON.parse(localStorage.getItem(LAST_KEY)||'null');
 return {last,kind:target.kind,error:lastError,limit:SNAPSHOT_LIMIT};
}
host.addEventListener('craque:data-changed',()=>queue('automatic'));
host.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')queue('automatic')});
host.setInterval(()=>queue('automatic'),180000);
host.CRAQUE_BACKUP_V226=Object.freeze({FORMAT,LEGACY,create,inspect,restore,protect,queue,readNative,listLocal,describe,collect});
})(window);
