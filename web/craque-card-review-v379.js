/* Conferência declarada pelo proprietário, separada dos arquivos originais. */
(function(w,f){'use strict';const api=f();if(typeof module==='object'&&module.exports)module.exports=api;if(w)w.CRAQUE_CARD_REVIEW_V379=api;})(typeof window!=='undefined'?window:null,function(){'use strict';
const PREFIX='scoutpro:v379:card-review:',SCHEMA='craque-card-review-v379';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const str=v=>typeof v==='string'?v.trim().slice(0,1500):'';
const cost=v=>v.reduce((sum,n)=>sum+Array.from({length:n},(_,i)=>1+Math.floor(i/4)).reduce((a,b)=>a+b,0),0);
const fingerprint=c=>JSON.stringify([c.key,c.name,c.cardId,c.edition]);
function catalog(original,owned,refs=[]){
 const images=new Map(refs.map(r=>[r.key,r.image]));
 return [...original.map(c=>({key:'cap:'+c.numero,name:c.name,cardId:String(c.id||''),edition:c.versao||'',image:images.get('cap:'+c.numero)||'',
  href:c.arquivo,position:c.posicao,rarity:'',attackStyle:c.estilo_ataque||'',defenceStyle:c.estilo_defesa||'',source:c})),
 ...owned.map(c=>({key:c.key,name:c.name,aliases:c.key==='ct364-14'?'Diego Forlán Diego Forlan D. Forlan':'',cardId:String(c.cardId||''),edition:c.edition||'',image:c.image,
  href:'index.html?owned='+encodeURIComponent(c.key),position:c.position,rarity:'',attackStyle:c.style||'',defenceStyle:c.secondaryStyle||'',source:c}))];
}
const matches=(c,q)=>norm([c.name,c.aliases,c.cardId,c.edition,c.position].join(' ')).includes(norm(q));
function validate(card,values,confirmed=false){
 if(!card?.key||!values||typeof values!=='object'||Array.isArray(values))throw Error('Carta ou dados inválidos');
 const number=(key,label,min,max)=>{const v=values[key];if(v===null||v===undefined||v==='')return null;
  if(!Number.isInteger(Number(v))||Number(v)<min||Number(v)>max)throw Error(label+': informe um inteiro entre '+min+' e '+max);return Number(v);};
 const r={schema:SCHEMA,key:card.key,fingerprint:fingerprint(card),status:confirmed?'confirmed':'draft',
  rarity:str(values.rarity),cardId:str(values.cardId),edition:str(values.edition),attackStyle:str(values.attackStyle),defenceStyle:str(values.defenceStyle),
  currentLevel:number('currentLevel','Nível atual',1,120),maxLevel:number('maxLevel','Nível máximo',1,120),
  currentOverall:number('currentOverall','OVR atual',1,150),maxOverall:number('maxOverall','OVR máximo',1,150),pp:number('pp','PP total',0,1000),
  fixedBooster:str(values.fixedBooster),extraSlot:values.extraSlot||'pendente',extraBooster:str(values.extraBooster),nativeSkills:str(values.nativeSkills),
  equipmentReviewed:values.equipmentReviewed===true,skills:Array.from({length:5},(_,i)=>str(values.skills?.[i])),training:null,notes:str(values.notes)};
 if(r.cardId&&!/^\d{5,20}$/.test(r.cardId))throw Error('Card ID: use o identificador numérico exato, ou deixe vazio');
 if(r.currentLevel!==null&&r.maxLevel!==null&&r.currentLevel>r.maxLevel)throw Error('Nível atual não pode superar o máximo');
 if(!['pendente','ausente','vazio','ocupado'].includes(r.extraSlot))throw Error('Estado do slot inválido');
 if(r.extraSlot!=='ocupado'&&r.extraBooster)throw Error('Ímpeto equipado requer slot ocupado');
 if(r.extraSlot==='ocupado'&&!r.extraBooster)throw Error('Informe o ímpeto equipado neste slot');
 if(values.training!==undefined&&values.training!==null){
  if(!Array.isArray(values.training)||values.training.length!==10||values.training.some(n=>!Number.isInteger(n)||n<0||n>20))throw Error('Treino: informe as 10 categorias completas, com zero nas não utilizadas');
  r.training=values.training.slice();if(r.pp!==null&&cost(r.training)>r.pp)throw Error('O treino gasta mais PP que o total informado');
 }
 return r;
}
function read(store,card,confirmed=false){try{
 let r=JSON.parse(store?.getItem(PREFIX+card.key)||'null');
 if(confirmed&&r?.status==='draft')r=r.activeConfirmed;
 if(r?.schema!==SCHEMA||r.fingerprint!==fingerprint(card)||r.key!==card.key||!['draft','confirmed'].includes(r.status)||(confirmed&&r.status!=='confirmed'))return null;
 validate(card,r,r.status==='confirmed');return r;
}catch(_){return null;}}
function save(store,card,values,confirmed=false){
 const record=validate(card,values,confirmed),prev=read(store,card);
 const history=prev?[...(prev.history||[]),Object.fromEntries(Object.entries(prev).filter(([k])=>k!=='history'))].slice(-20):[];
 const activeConfirmed=confirmed?null:prev?.status==='confirmed'?Object.fromEntries(Object.entries(prev).filter(([k])=>!['history','activeConfirmed'].includes(k))):prev?.activeConfirmed||null;
 const result={...record,updatedAt:new Date().toISOString(),history,activeConfirmed};
 store.setItem(PREFIX+card.key,JSON.stringify(result));return result;
}
function apply(card,record,descriptor){
 if(!record||record.status!=='confirmed'||record.fingerprint!==fingerprint(descriptor))return card;
 const r=validate(descriptor,record,true),c={...card},set=(key,val)=>{if(val!==''&&val!==null)c[key]=val;};
 set('id',r.cardId);set('versao',r.edition);
 if(c.id!==card.id||c.versao!==card.versao){Object.assign(c,{pp:null,max_level:null,niveis:null,habilidades_nativas:'',impeto_fixo:'',impeto_extra:'',pp_origem:'pendente_nova_identidade_v379'});}
 set('estilo_ataque',r.attackStyle);set('estilo_defesa',r.defenceStyle);
 set('max_level',r.maxLevel);set('pp',r.pp);set('impeto_fixo',r.fixedBooster);set('habilidades_nativas',r.nativeSkills);
 if(r.training)c.niveis=r.training.slice();
 if(r.maxLevel!==null)c.pp_origem='declaracao_manual_proprietario_v379';
 if(c.id!==card.id||c.versao!==card.versao){c.base_stats_known=false;delete c.nivel_referencia;}
 c.review379={...r,identityChanged:c.id!==card.id||c.versao!==card.versao,history:undefined};return c;
}
function personal(card,store){const d=catalog([card],[])[0],r=read(store,d,true);return apply(card,r,d);}
function owned(card,store){const d=catalog([],[card])[0],r=read(store,d,true);if(!r)return null;return r;}
return Object.freeze({PREFIX,SCHEMA,catalog,matches,fingerprint,validate,read,save,apply,personal,owned,cost});
});
