/* V246 — familiaridade de posição por edição EXATA da carta.
 * eFHUB: Overall calculado por posição NÃO comprova familiaridade,
 * posição treinável, nem treinamento aplicado.
 * Só uma confirmação explícita do usuário habilita a posição treinada.
 * Não altera cartas, fichas, skills, builds ou o plano original offline.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.SCOUT_POSITION_TRAINING_V246=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const KEY='scoutpro:v246:positions-confirmed-v1';
const POS=Object.freeze({AC:'CA',CA:'CA',SA:'SA',PTE:'PTE',PTD:'PTD',MO:'MAT',MAT:'MAT',
 MC:'MLG',ME:'MLG',MLG:'MLG',MLE:'MLE',MLD:'MLD',MDF:'VOL',VOL:'VOL',
 DC:'ZG',ZC:'ZG',ZG:'ZG',DD:'LD',LD:'LD',DE:'LE',LE:'LE',GR:'GO',GO:'GO'});
const ALL=Object.freeze(['GO','ZG','LD','LE','VOL','MLG','MLE','MLD','MAT','SA','PTE','PTD','CA']);
const label=Object.freeze({
 CA:'Centroavante (CA)',SA:'Segundo atacante (SA)',MAT:'Meia-atacante (MAT)',
 PTE:'Ponta esquerda (PTE)',PTD:'Ponta direita (PTD)',
 MLE:'Meia esquerda (MLE)',MLD:'Meia direita (MLD)',
 MLG:'Meio-campista (MLG)',VOL:'Volante (VOL)',LD:'Lateral direito (LD)',
 LE:'Lateral esquerdo (LE)',ZG:'Zagueiro (ZG)',GO:'Goleiro (GO)'
});
const pos=v=>POS[String(v??'').toUpperCase()]||null;
const edition=card=>{
 const n=Number(card?.numero),id=String(card?.id??'').trim();
 if(!Number.isInteger(n)||n<1||n>246||!id)return null;
 return n+'@'+id;
};
function storageOrDefault(store){try{return store||host?.localStorage||null}catch(_){return null}}
function db(store){try{
 const raw=storageOrDefault(store)?.getItem(KEY);
 const obj=raw?JSON.parse(raw):null;
 return obj?.schema==='CRAQUE_POSITION_V246'&&obj.entries&&
  typeof obj.entries==='object'&&!Array.isArray(obj.entries)?obj.entries:{};
}catch(_){return {}}}
function trained(card,store){const saved=db(store)[edition(card)];
 return Array.isArray(saved)?saved.filter(p=>ALL.includes(p)&&p!==pos(card?.posicao)&&p!=='GO'):[]}
function status(card,wanted,store){
 const target=pos(wanted),native=pos(card?.posicao);
 if(!target||!native)return {status:'pendente',eligible:false,label:'Posição ainda não documentada'};
 if(target==='GO'||native==='GO')return target===native?
  {status:'original',eligible:true,label:'Posição original'}:
  {status:'incompatível',eligible:false,label:'GO exige carta original de goleiro'};
 if(target===native)return {status:'original',eligible:true,label:'Posição original'};
 if(trained(card,store).includes(target))return{
  status:'treinada',eligible:true,label:'Treinamento aplicado — confirmado pelo usuário'};
 return{status:'não confirmada',eligible:false,
  label:'Posição não confirmada nesta edição — exigir comprovação do jogo'};
}
function confirm(card,wanted,enabled,store){
 const target=pos(wanted),native=pos(card?.posicao),entry=edition(card),s=storageOrDefault(store);
 if(!target||!native||!entry||!s?.setItem)throw Error('Carta, posição ou armazenamento indisponível');
 if(target==='GO'||native==='GO'||target===native)throw Error('Só posições alternativas de jogadores de linha podem receber confirmação');
 const data=db(s),prior=trained(card,s),next=enabled?
  [...new Set([...prior,target])]:prior.filter(x=>x!==target);
 const updated={...data};
 if(next.length)updated[entry]=next;else delete updated[entry];
 s.setItem(KEY,JSON.stringify({schema:'CRAQUE_POSITION_V246',entries:updated}));
 try{host?.dispatchEvent?.(new host.CustomEvent('craque:data-changed',{detail:{key:KEY}}))}catch(_){}
 return status(card,target,s);
}
return Object.freeze({KEY,POS,ALL,label,pos,edition,trained,status,confirm});
});
