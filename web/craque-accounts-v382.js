/* Contas locais independentes; fontes públicas compartilhadas, estado privado separado. */
(function(w,f){'use strict';const a=f();if(typeof module==='object'&&module.exports)module.exports=a;if(w)w.CRAQUE_ACCOUNTS_V382=a;})(typeof window!=='undefined'?window:null,function(){'use strict';
const KEY='scoutpro:v382:accounts',SCHEMA='CRAQUE_ACCOUNTS_V382',DRAFT='CRAQUE_SECONDARY_ACCOUNT_DRAFT_V382',MAX_BYTES=3*1024*1024;
const copy=x=>JSON.parse(JSON.stringify(x)),str=(x,n=180)=>String(x??'').trim().slice(0,n),isObj=x=>x&&typeof x==='object'&&!Array.isArray(x);
const number=x=>x===null||x===undefined||x===''?null:Number(x),id=x=>/^[a-zA-Z0-9:_-]{1,100}$/.test(String(x))&&!['__proto__','prototype','constructor'].includes(x);
const POS=['GO','ZG','LE','LD','VOL','MLG','MLE','MLD','MAT','PTE','PTD','SA','CA'];
const position=x=>({ZC:'ZG',MC:'MLG',CMF:'MLG',DMF:'VOL',AMF:'MAT',CB:'ZG',GK:'GO',CF:'CA',SS:'SA',RB:'LD',LB:'LE',LWF:'PTE',RWF:'PTD',LMF:'MLE',RMF:'MLD'}[str(x).toUpperCase()]||str(x).toUpperCase());
const cost=v=>v.reduce((sum,n)=>sum+n+Math.max(0,n-4)+Math.max(0,n-8)+Math.max(0,n-12)+Math.max(0,n-16),0);
const list=x=>Array.isArray(x)?x.map(s=>str(s,100)).filter(Boolean).slice(0,60):str(x,1600).split(/[;\n]/).map(s=>s.trim()).filter(Boolean);
const bytes=x=>new TextEncoder().encode(typeof x==='string'?x:JSON.stringify(x)).length;
const empty=()=>({schema:SCHEMA,active:'primary',secondary:{name:'Secundária',cards:[],managers:[],evidence:null},plans:{primary:{},secondary:{}},primaryRestoreEpoch:0});
const evidenceIdentity=c=>JSON.stringify([str(c.id,100),str(c.cardId,90),str(c.edition)]);
function normalCard(raw){
 if(!isObj(raw)||!id(raw.id)||!str(raw.name)||!POS.includes(position(raw.position)))throw Error('Carta inválida: identificação, nome ou posição ausentes.');
 const maxLevel=number(raw.maxLevel??raw.level),pp=number(raw.pp);
 if(maxLevel!==null&&(!Number.isInteger(maxLevel)||maxLevel<1||maxLevel>120))throw Error('Nível máximo inválido.');
 if(pp!==null&&(!Number.isInteger(pp)||pp<0||pp>300))throw Error('Orçamento de PP inválido.');
 if(maxLevel!==null&&pp!==null&&pp!==2*(maxLevel-1))throw Error('Nível e PP divergentes; confira a edição.');
 const v=raw.trainingLevels===undefined||raw.trainingLevels===null?null:raw.trainingLevels;
 if(v&&(!Array.isArray(v)||v.length!==10||v.some(n=>!Number.isInteger(n)||n<0||n>20)||pp===null||cost(v)!==pp))throw Error('Treino não fecha o orçamento de PP.');
 const image=str(raw.image,85001);if(image&&(image.length>85000||!/^data:image\/(?:png|jpeg|webp);base64,[a-zA-Z0-9+/]+=*$/.test(image)))throw Error('Imagem inválida; use miniatura local de até85KB.');
 const cardId=str(raw.cardId,90);if(cardId&&!/^\d{5,20}$/.test(cardId))throw Error('Card ID inválido; deixe pendente se não foi identificado.');
 const booster=x=>{if(!x)return null;const value=number(x.value);if(!isObj(x)||!str(x.name)||
  (value===null?x.verified===true:!Number.isInteger(value)||value<1||value>5))throw Error('Ímpeto inválido; confirme o valor ou deixe pendente.');
  return {name:str(x.name,100),value,verified:x.verified===true,source:str(x.source,300)};};
 const additional=list(raw.skills);if(additional.length>5||(Number.isInteger(raw.skillCapacity)&&additional.length>raw.skillCapacity))throw Error('Adicionais acima da capacidade cadastrada.');
 const binding=evidenceIdentity(raw),identityChanged=!!raw.evidenceIdentity&&raw.evidenceIdentity!==binding;
 const checkedBoost=x=>{const b=booster(x);return b&&identityChanged?{...b,verified:false}:b;};
 return {id:str(raw.id,100),name:str(raw.name,80),cardId,edition:str(raw.edition),position:position(raw.position),
  positions:[...new Set([position(raw.position),...(raw.positions||[]).map(position).filter(p=>POS.includes(p))])],maxLevel,pp,
  offenseStyle:str(raw.offenseStyle||raw.style,110),defenceStyle:str(raw.defenceStyle,110),nativeSkills:list(raw.nativeSkills),skills:additional,
  nativeVerified:!identityChanged&&raw.nativeVerified===true,skillsVerified:!identityChanged&&raw.skillsVerified===true,evidenceIdentity:binding,
  skillCapacity:Number.isInteger(raw.skillCapacity)&&raw.skillCapacity>=0&&raw.skillCapacity<=5?raw.skillCapacity:null,
  fixedBoosters:(raw.fixedBoosters||[]).slice(0,2).map(checkedBoost),extraBooster:checkedBoost(raw.extraBooster),
  boosterSlot:['vazio','ocupado','ausente','pendente'].includes(raw.boosterSlot)?raw.boosterSlot:'pendente',
  boosterSlotSupported:!identityChanged&&raw.boosterSlotSupported===true,identityVerified:!identityChanged&&raw.identityVerified===true,
  trainingLevels:v?Array.from(v):null,image,notes:str(raw.notes,1500),
  evidence:isObj(raw.evidence)?copy(raw.evidence):null};
}
function normalManager(m){
 if(!isObj(m)||!id(m.id)||!str(m.name))throw Error('Técnico inválido.');
 const proficiency={};for(const s of ['posse','rapido','normal','fora','longo','overload']){const n=number(m.proficiency?.[s]);
  if(n!==null&&(!Number.isInteger(n)||n<0||n>100))throw Error('Proficiência inválida.');proficiency[s]=n;}
 return {id:str(m.id,100),name:str(m.name,100),edition:str(m.edition),proficiency,
  bonuses:Array.isArray(m.bonuses)?copy(m.bonuses):[],bonusesVerified:m.bonusesVerified===true,source:str(m.source,300),confirmedOwned:m.confirmedOwned===true};
}
function validate(data){
 if(!isObj(data)||data.schema!==SCHEMA||!['primary','secondary'].includes(data.active)||!isObj(data.secondary)||!isObj(data.plans))throw Error('Formato de contas inválido; registros preservados.');
 if(!Array.isArray(data.secondary.cards)||data.secondary.cards.length>1200||!Array.isArray(data.secondary.managers)||data.secondary.managers.length>100)throw Error('Acervo de conta inválido.');
 const cards=data.secondary.cards.map(normalCard),managers=data.secondary.managers.map(normalManager);
 if(new Set(cards.map(c=>c.id)).size!==cards.length||new Set(managers.map(c=>c.id)).size!==managers.length)throw Error('Identificadores duplicados.');
 const plans={primary:{},secondary:{}};for(const account of ['primary','secondary']){
  if(!isObj(data.plans[account]))throw Error('Histórico de planos inválido.');
  for(const [key,p] of Object.entries(data.plans[account])){
   if(!id(key)||!isObj(p)||p.accountId!==account||p.id!==key)throw Error('Plano pertence a outra conta ou identificação inválida.');
   plans[account][key]=copy(p);
  }
 }
 const out={schema:SCHEMA,active:data.active,secondary:{name:str(data.secondary.name,80)||'Secundária',cards,managers,evidence:copy(data.secondary.evidence??null)},plans,
  primaryRestoreEpoch:Number.isSafeInteger(data.primaryRestoreEpoch)&&data.primaryRestoreEpoch>=0?data.primaryRestoreEpoch:0};
 if(bytes(out)>MAX_BYTES)throw Error('Dados das contas excedem3MB; exporte um backup antes de acrescentar conteúdo.');return out;
}
function read(store){const raw=store?.getItem(KEY);if(raw===null||raw===undefined||raw==='')return empty();
 try{return validate(JSON.parse(raw));}catch(e){throw Error('Dados de contas ilegíveis; conteúdo preservado: '+e.message);}}
function save(store,data){const safe=validate(data),serial=JSON.stringify(safe),before=store.getItem(KEY);
 // Mesmo limite do backup V226; não aceitar um estado novo que não possa ser exportado.
 if(Number.isInteger(store.length)&&typeof store.key==='function'){
  let total=bytes(serial);for(let i=0;i<store.length;i++){const k=store.key(i);if(k!==KEY&&k?.startsWith('scoutpro:'))total+=bytes(k)+bytes(store.getItem(k)||'');}
  if(total>8*1024*1024-4096)throw Error('Conteúdo excederia o limite do backup de8MB.');
 }
 try{store.setItem(KEY,serial);if(store.getItem(KEY)!==serial)throw Error('Gravação não confirmada');}
 catch(e){try{if(before===null)store.removeItem(KEY);else if(store.getItem(KEY)!==before)store.setItem(KEY,before);}catch(_){}throw Error('Não foi possível salvar as contas: '+e.message);}
 return safe;
}
function select(store,account){if(!['primary','secondary'].includes(account))throw Error('Conta desconhecida.');const doc=read(store);doc.active=account;return save(store,doc);}
function importDraft(store,file){
 if(file?.schema!==DRAFT||!Array.isArray(file.cards)||!Array.isArray(file.managers)||file.cards.length>1200)throw Error('Arquivo de conta secundária inválido.');
 const doc=read(store),incoming=file.cards.map(normalCard),managers=file.managers.map(normalManager);let added=0;
 if(new Set(incoming.map(c=>c.id)).size!==incoming.length)throw Error('Cartas repetidas no arquivo.');
 for(const card of incoming){const previous=doc.secondary.cards.find(c=>c.id===card.id);
  if(previous&&JSON.stringify(previous)!==JSON.stringify(card))throw Error('Conflito de carta: '+card.name+'. Estado anterior preservado.');
  if(!previous){doc.secondary.cards.push(card);added++;}}
 for(const manager of managers){const previous=doc.secondary.managers.find(m=>m.id===manager.id);
  if(previous&&JSON.stringify(previous)!==JSON.stringify(manager))throw Error('Conflito de técnico; dados preservados.');
  if(!previous)doc.secondary.managers.push(manager);}
 doc.secondary.name=str(file.account?.name,80)||doc.secondary.name;doc.secondary.evidence=copy(file.evidence??doc.secondary.evidence);save(store,doc);return {added,total:doc.secondary.cards.length};
}
function afterRestore(store,{legacy=false}={}){
 if(!legacy||store.getItem(KEY)===null)return;
 const doc=read(store);doc.active='primary';doc.primaryRestoreEpoch++;
 for(const p of Object.values(doc.plans.primary))p.stale=true;return save(store,doc);
}
function roster(account,sources,store){
 if(account==='secondary')return read(store).secondary.cards.map(c=>({...c,instanceId:c.id,accountId:account,source:'secondary'}));
 if(account!=='primary')throw Error('Conta desconhecida.');
 const original=(sources.originals||[]).map(c=>{const m=sources.positional?.fromPersonal(c,null,store);return {
  id:'cap:'+c.numero,instanceId:'cap:'+c.numero,accountId:account,source:'original',capture:c.numero,name:c.name,cardId:m?.cardId||c.id,edition:m?.edition||c.versao,
  position:position(m?.position||c.posicao),positions:[position(m?.position||c.posicao)],maxLevel:m?.level??c.max_level??null,pp:m?.pp??c.pp,
  offenseStyle:m?.style||c.estilo_ataque||'',defenceStyle:m?.defenceStyle||c.estilo_defesa||'',nativeSkills:list(m?.nativeSkills||c.habilidades_nativas),skills:list(m?.skills||''),
  nativeVerified:!!(m?.nativeSkills||c.habilidades_nativas),skillsVerified:!!m?.equipmentRecord,
  fixedBoosters:(m?.fixedBooster||c.impeto_fixo)?[{name:m?.fixedBooster||c.impeto_fixo,value:null,verified:false}]:[],extraBooster:m?.booster?{name:m.booster,value:null,verified:false}:null,
  boosterSlot:m?.boosterSlot||'pendente',boosterSlotSupported:false,identityVerified:false,
  trainingLevels:m?.trainingLevels?str(m.trainingLevels,300).split(/[,;\s]+/).filter(Boolean).map(Number):c.niveis||null,image:c.imagem||'',
  reference:(sources.references||[]).find(r=>r.capture===c.numero)||null,legacy:c};});
 const owned=(sources.owned||[]).map(c=>({id:c.key,instanceId:c.key,accountId:account,source:'owned',name:c.name,cardId:c.cardId||'',edition:c.edition||'',
  position:position(c.position),positions:[position(c.position)],maxLevel:c.maxLevel??null,pp:c.pp??null,offenseStyle:c.style||'',defenceStyle:'',
  nativeSkills:list(c.observed?.nativeSkills),skills:[],fixedBoosters:[],extraBooster:null,boosterSlot:'pendente',trainingLevels:null,image:c.image||'',legacy:c}));
 const extras=(sources.extras||[]).map(c=>({...c,id:'extra:'+c.id,instanceId:'extra:'+c.id,accountId:account,source:'extra'}));
 return [...original,...owned,...extras];
}
return Object.freeze({KEY,SCHEMA,DRAFT,MAX_BYTES,POS,position,cost,empty,validate,normalCard,normalManager,read,save,select,importDraft,afterRestore,roster,evidenceIdentity});
});
