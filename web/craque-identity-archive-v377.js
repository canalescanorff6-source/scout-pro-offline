/* V377: consulta do arquivo anterior à correção de uma identidade.
   Nenhuma revisão é aplicada, renomeada ou certificada. Não grava no armazenamento. */
(function(host,factory){'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_IDENTITY_ARCHIVE_V377=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const PROFILES='scoutpro:v324:manager-profile:',SCENARIOS='scoutpro:v311:position-scenarios';
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
function read(store,correction){
 const items=[],warnings=[];
 const warn=text=>{if(!warnings.includes(text))warnings.push(text)};
 const before=correction?.beforeCanonical,cap=correction?.capture;
 const id=String(before?.id||''),edition=String(before?.versao||'');
 const filename=String(correction?.file||'').split(/[\\/]/).pop();
 const fileCapture=filename?.match(/^(\d+)_.*\.html$/)?.[1];
 if(!Number.isInteger(cap)||cap<1||!/^\d{5,20}$/.test(id)||!edition.trim()||Number(fileCapture)!==cap){
  warn('Identidade anterior ou arquivo da carta inválido; nenhum histórico foi consultado.');return {items,warnings};
 }
 if(!store||typeof store.getItem!=='function'){
  warn('Armazenamento histórico indisponível; registros preservados.');return {items,warnings};
 }
 const cardKey=cap+'@'+id,scope='cap:'+cap,lab='scoutpro:v67:'+id+':'+filename;
 const history='scoutpro:v67:test:'+id+':'+filename,matches='scoutpro:v80:matches:'+cap+':'+id;
 const current='scoutpro:v376:current-training:'+scope,ovr='scoutpro:v376:ovr:'+scope;
 const equipped='scoutpro:v162:equipped:'+cap+':'+id;
 const additional='scoutpro:v254:additional-confirmed:'+cardKey;
 const booster='scoutpro:v103:booster:'+cap,level='scoutpro:v248:level-review:'+cardKey;
 const keys=new Set([SCENARIOS,lab,history,matches,current,current+':'+id,ovr,ovr+':'+id,equipped,additional,booster,level]);
 try{
  const length=store.length;
  if(!Number.isInteger(length)||length<0||length>100000||typeof store.key!=='function')
   throw Error('índice indisponível');
  for(let i=0;i<length;i++){const key=store.key(i);if(typeof key==='string')keys.add(key)}
 }catch(_){warn('Não foi possível enumerar todo o arquivo histórico; registros preservados.');}
 const get=key=>{
  try{return store.getItem(key)}catch(_){warn('Não foi possível ler '+key+'; registro preservado.');return null}
 };
 const parse=(key,raw)=>{
  try{return {ok:true,value:JSON.parse(raw)}}catch(_){
   warn('Registro ilegível em '+key+'; conteúdo original preservado, sem aplicação.');return {ok:false,value:null};
  }
 };
 const add=(key,kind,raw,value)=>items.push({key,kind,raw,value});
 const scopeParts=(key,prefix,count)=>{
  try{
   const p=key.slice(prefix.length).split('|').map(decodeURIComponent);
   return p.length===count&&p[0]==='minhas-246'&&p[1]==='principal'&&p[2]===cardKey&&
    p[3]===id&&p[4]===edition?p:null;
  }catch(_){return null}
 };
 const matchesProof=value=>plain(value)&&String(value.card_id||'')===id&&String(value.edition||'')===edition&&
  (value.capture===undefined||Number(value.capture)===cap)&&
  (value.numero===undefined||Number(value.numero)===cap);
 for(const key of keys){
  let kind=null;
  if(key===SCENARIOS){
   const raw=get(key);if(raw===null||raw===undefined)continue;
   const decoded=parse(key,raw);if(!decoded.ok)continue;
   const container=decoded.value;
   if(!plain(container)||container.schema!=='CRAQUE_POSITION_V311'||!plain(container.entries)){
    warn('Contêiner incompatível em '+key+'; arquivo global preservado sem exportar outras cartas.');continue;
   }
   for(const [entryKey,value] of Object.entries(container.entries)){
    if(!scopeParts(entryKey,'',8))continue;
    const itemKey=key+'#'+entryKey;
    if(!Array.isArray(value))warn('Revisões incompatíveis em '+itemKey+'; somente arquivo, sem aplicação.');
    // O raw global contém outros proprietários: exportar só o fragmento exato desta carta.
    add(itemKey,'positional',JSON.stringify(value),value);
   }
   continue;
  }
  if(key.startsWith(PROFILES)&&scopeParts(key,PROFILES,9))kind='manager-profile';
  else if(key===lab||key.startsWith(lab+':tactic:')&&key.length>lab.length+8)kind='personal-training';
  else if(key===history||key===matches)kind='match-history';
  else if(key===current||key===current+':'+id)kind='current-training';
  else if(key===ovr||key===ovr+':'+id)kind='observed-ovr';
  else if(key===equipped)kind='equipped-skills';
  else if(key===additional)kind='additional-proof';
  else if(key===booster)kind='booster';
  else if(key===level)kind='level-review';
  if(!kind)continue;
  const raw=get(key);if(raw===null||raw===undefined)continue;
  if(kind==='equipped-skills'){add(key,kind,raw,raw);continue}
  const decoded=parse(key,raw),value=decoded.value;
  if(kind==='current-training'){
   if(!decoded.ok||!plain(value)||String(value.cardId||'')!==id||
    value.cardKey!==undefined&&value.cardKey!==scope){
    warn('Treino em '+key+' sem vínculo com a identidade anterior; registro preservado sem exportação.');continue;
   }
  }else if(kind==='additional-proof'||kind==='booster'){
   if(!decoded.ok||!matchesProof(value)){
    warn('Equipamento em '+key+' sem ID/edição anteriores compatíveis; registro preservado sem exportação.');continue;
   }
  }else if(kind==='level-review'){
   const legacy=plain(value)&&value.edition===undefined&&String(value.card_id||'')===id&&
    Number(value.numero)===cap&&typeof before.name==='string'&&value.name===before.name;
   if(!decoded.ok||!matchesProof(value)&&!legacy){
    warn('Nível em '+key+' sem vínculo com a carta anterior; registro preservado sem exportação.');continue;
   }
   if(legacy)warn('V248 sem edição em '+key+': somente arquivo, não é prova de nível da identidade corrigida.');
  }else if(kind==='observed-ovr'){
   warn('OVR histórico em '+key+': somente arquivo; não confirma nem aplica o contexto da identidade corrigida.');
  }
  add(key,kind,raw,value);
 }
 return {items,warnings};
}
return Object.freeze({read});
});
