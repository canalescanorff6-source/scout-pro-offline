/* Craque Tático V227 — acervos privados de outras pessoas.
 * Exclusivamente 'scoutpro:v227:friends-collections': nunca editar SCOUT_V69_AUDITORIA.json,
 * o acervo original de 246 cartas, formações ou chave de bloqueios.
 * Fotos são miniaturas compactadas locais e entram no backup V226 (prefixo scoutpro:).
 */
(function(global,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(global)global.CRAQUE_FRIENDS_V227=api;})(typeof window!=='undefined'?window:null,function(){'use strict';
const KEY='scoutpro:v227:friends-collections',SCHEMA='craque-friends-v227',EXPORT='craque-friend-profile-v227';
const MAX_STORAGE=3*1024*1024,MAX_OWNERS=150,MAX_CARDS=1200,MAX_IMAGE=85000;
const LIMITS=Object.freeze({name:80,edition:180,style:110,position:24,rarity:50,cardId:90,notes:1500,skills:600,booster:200,nativeSkills:1200,fixedBooster:180,trainingLevels:150});
const readStr=(value,max=100)=>String(value??'').trim().slice(0,max);
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():
  'ct-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,12);
const bytes=s=>new TextEncoder().encode(s).length;
const empty=()=>({schema:SCHEMA,owners:[],cards:[],updatedAt:null});
function normalOwner(raw){
 const name=readStr(raw?.name,LIMITS.name);
 const id=readStr(raw?.id,95);
 if(!name||!id)throw Error('Pessoa sem identificação ou nome.');
 return {id,name,createdAt:readStr(raw?.createdAt,45)||new Date().toISOString()};
}
function normalAnalysis(value){
 if(value===null||value===undefined)return null;
 if(typeof value!=='object'||Array.isArray(value)||value.version!==228||
    typeof value.source!=='string'||value.source.length>140||
    typeof value.createdAt!=='string'||value.createdAt.length>45||
    !value.profiles||typeof value.profiles!=='object')
   throw Error('Ficha automática inválida no arquivo. Não é seguro importá-la.');
 const profiles={};
 for(const id of ['posse','normal','rapido','fora','longo']){
  const p=value.profiles[id];
  if(!p||!['hipotese','pendente'].includes(p.status))throw Error('Ficha tática inválida: '+id);
  const levels=p.levels===null?null:Array.isArray(p.levels)?p.levels.slice():null;
  if(p.status==='hipotese'&&(!levels||levels.length!==10||!levels.every(x=>Number.isInteger(x)&&x>=0&&x<=20)))throw Error('PP inválidos na ficha '+id);
  if(p.status==='pendente'&&levels!==null)throw Error('Ficha pendente com níveis não confirmados.');
  const pp=p.pp===null?null:Number(p.pp),remaining=p.remaining===null?null:Number(p.remaining);
  if(p.status==='hipotese'&&(!Number.isInteger(pp)||pp<0||pp>300||remaining!==0))throw Error('Orçamento de treino inválido.');
  if(p.status==='pendente'&&(pp!==null||remaining!==null))throw Error('Ficha pendente com PP inconsistentes.');
  profiles[id]={status:p.status,levels,pp,remaining,confidence:readStr(p.confidence,60)};
 }
 return {version:228,source:value.source,createdAt:value.createdAt.slice(0,45),profiles};
}
function normalCard(raw){
 const ownerId=readStr(raw?.ownerId,95),id=readStr(raw?.id,95),name=readStr(raw?.name,LIMITS.name);
 if(!ownerId||!id||!name)throw Error('Carta sem pessoa, identificação ou nome.');
 const num=x=>x===''||x===null||x===undefined?null:Number(x);
 const level=num(raw?.level),pp=num(raw?.pp);
 if(level!==null&&(!Number.isInteger(level)||level<1||level>120))throw Error('Nível fora do intervalo permitido (1 a 120).');
 if(pp!==null&&(!Number.isInteger(pp)||pp<0||pp>300))throw Error('Pontos de progresso fora do intervalo permitido (0 a 300).');
 const image=readStr(raw?.image,MAX_IMAGE+32);
 if(image&&!/^data:image\/(?:webp|jpeg|png);base64,[a-zA-Z0-9+/]+={0,2}$/.test(image))throw Error('Imagem inválida: somente miniaturas locais.');
 if(image&&bytes(image)>MAX_IMAGE)throw Error('Miniatura acima do limite de 85 KB.');
 return {
  id,ownerId,name,cardId:readStr(raw?.cardId,LIMITS.cardId),
  edition:readStr(raw?.edition,LIMITS.edition),position:readStr(raw?.position,LIMITS.position),
  rarity:readStr(raw?.rarity,LIMITS.rarity),style:readStr(raw?.style,LIMITS.style),
  level,pp,skills:readStr(raw?.skills,LIMITS.skills),booster:readStr(raw?.booster,LIMITS.booster),
  nativeSkills:readStr(raw?.nativeSkills,LIMITS.nativeSkills),
  fixedBooster:readStr(raw?.fixedBooster,LIMITS.fixedBooster),
  boosterSlot:['vazio','ocupado','ausente','pendente'].includes(raw?.boosterSlot)?raw.boosterSlot:'pendente',
  trainingLevels:readStr(raw?.trainingLevels,LIMITS.trainingLevels),
  analysis:normalAnalysis(raw?.analysis),
  notes:readStr(raw?.notes,LIMITS.notes),image,
  createdAt:readStr(raw?.createdAt,45)||new Date().toISOString(),
  updatedAt:readStr(raw?.updatedAt,45)||new Date().toISOString()
 };
}
function validate(raw){
 if(!raw||raw.schema!==SCHEMA||!Array.isArray(raw.owners)||!Array.isArray(raw.cards))
  throw Error('Acervo de outras pessoas com formato inválido. Seus 246 jogadores não foram alterados.');
 if(raw.owners.length>MAX_OWNERS||raw.cards.length>MAX_CARDS)throw Error('Acervo excede o limite de segurança.');
 const owners=raw.owners.map(normalOwner),cards=raw.cards.map(normalCard);
 const uniqueOwners=new Set(owners.map(x=>x.id)),uniqueCards=new Set(cards.map(x=>x.id));
 if(uniqueOwners.size!==owners.length||uniqueCards.size!==cards.length)throw Error('Há identificadores duplicados no acervo.');
 for(const card of cards)if(!uniqueOwners.has(card.ownerId))throw Error('Uma carta pertence a uma pessoa que não existe neste acervo.');
 const doc={schema:SCHEMA,owners,cards,updatedAt:readStr(raw.updatedAt,45)};
 if(bytes(JSON.stringify(doc))>MAX_STORAGE)throw Error('Acervo excede 3 MB. Reduza o tamanho das fotos para preservar o backup.');
 return doc;
}
function read(storage){
 const data=storage.getItem(KEY);
 if(data===null||data==='')return empty();
 try{return validate(JSON.parse(data));}
 catch(e){throw Error('Não foi possível abrir o acervo. Os dados armazenados foram preservados: '+e.message);}
}
function write(storage,data){
 const safe=validate({...data,updatedAt:new Date().toISOString()});
 const serial=JSON.stringify(safe),previous=storage.getItem(KEY);
 try{
  storage.setItem(KEY,serial);
  if(storage.getItem(KEY)!==serial)throw Error('A gravação não foi confirmada.');
 }catch(e){
  // Não apagar o valor antigo: uma falha de quota não pode destruir o acervo.
  try{if(previous===null)storage.removeItem(KEY);else if(storage.getItem(KEY)!==previous)storage.setItem(KEY,previous);}catch(_e){}
  throw Error('Não foi possível salvar o acervo. Confira o espaço disponível e exporte um backup. '+e.message);
 }
 return safe;
}
function addOwner(data,name){
 const doc=validate(data),clean=readStr(name,LIMITS.name);
 if(!clean)throw Error('Informe o nome da pessoa.');
 return {...doc,owners:[...doc.owners,{id:uid(),name:clean,createdAt:new Date().toISOString()}]};
}
function renameOwner(data,id,name){
 const doc=validate(data),clean=readStr(name,LIMITS.name);
 if(!clean)throw Error('Informe o novo nome da pessoa.');
 if(!doc.owners.some(x=>x.id===id))throw Error('Pessoa não encontrada.');
 return {...doc,owners:doc.owners.map(x=>x.id===id?{...x,name:clean}:x)};
}
function removeOwner(data,id){
 const doc=validate(data);
 if(!doc.owners.some(x=>x.id===id))throw Error('Pessoa não encontrada.');
 return {...doc,owners:doc.owners.filter(x=>x.id!==id),cards:doc.cards.filter(x=>x.ownerId!==id)};
}
function saveCard(data,raw){
 const doc=validate(data),ownerId=readStr(raw?.ownerId,95);
 if(!doc.owners.some(x=>x.id===ownerId))throw Error('Escolha uma pessoa cadastrada antes de salvar a carta.');
 const id=raw?.id?readStr(raw.id,95):uid(),previous=doc.cards.find(x=>x.id===id);
 if(previous&&previous.ownerId!==ownerId)throw Error('Não é permitido mover uma carta de uma pessoa para outra nesta edição.');
 const card=normalCard({...previous,...raw,id,ownerId,createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});
 return {...doc,cards:previous?doc.cards.map(x=>x.id===id?card:x):[...doc.cards,card]};
}
function removeCard(data,ownerId,id){
 const doc=validate(data);
 if(!doc.cards.some(x=>x.id===id&&x.ownerId===ownerId))throw Error('Carta não encontrada no acervo da pessoa escolhida.');
 return {...doc,cards:doc.cards.filter(x=>x.id!==id)};
}
function exportOwner(data,id){
 const doc=validate(data),owner=doc.owners.find(o=>o.id===id);
 if(!owner)throw Error('Pessoa não encontrada.');
 return {format:EXPORT,exportedAt:new Date().toISOString(),
  owner:{name:owner.name},cards:doc.cards.filter(c=>c.ownerId===id).map(({ownerId,id,...rest})=>rest),
  notice:'Cartas particulares inseridas pelo usuário, sem validação externa de atributos.'};
}
function importOwner(data,file){
 const doc=validate(data);
 if(!file||file.format!==EXPORT||!file.owner||!Array.isArray(file.cards)||file.cards.length>MAX_CARDS)
  throw Error('Arquivo não reconhecido como acervo de outra pessoa.');
 const name=readStr(file.owner.name,LIMITS.name);
 if(!name)throw Error('Falta o nome da pessoa no arquivo.');
 const owner={id:uid(),name,createdAt:new Date().toISOString()};
 const cards=file.cards.map(raw=>normalCard({...raw,id:uid(),ownerId:owner.id}));
 return validate({...doc,owners:[...doc.owners,owner],cards:[...doc.cards,...cards]});
}
return Object.freeze({KEY,SCHEMA,EXPORT,MAX_STORAGE,MAX_IMAGE,empty,validate,read,write,addOwner,renameOwner,removeOwner,saveCard,removeCard,exportOwner,importOwner,normalCard,bytes});
});
