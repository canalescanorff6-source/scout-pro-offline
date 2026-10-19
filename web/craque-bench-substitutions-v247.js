/* V247 — sugestão documental para cada reserva e vaga da escalação.
 * Não inventa posição adquirida, Player ID nem resultado de partida.
 * Cada substituição é calculada do elenco ATUAL (inclusive trocas manuais).
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_BENCH_V247=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const SLOT=Object.freeze({
 go:'GO',le:'LE',ld:'LD',zge:'ZG',zgd:'ZG',
 vol:'VOL',vole:'VOL',vold:'VOL',
 mlg:'MLG',mlge:'MLG',mlgd:'MLG',
 mat:'MAT',sa:'SA',ca:'CA',cae:'CA',cad:'CA'
});
const position=()=>host?.SCOUT_POSITION_TRAINING_V246||
 (typeof module==='object'&&module.exports?require('./scout-position-training-v246.js'):null);
const tactics=()=>host?.CRAQUE_TACTICS_V230||
 (typeof module==='object'&&module.exports?require('./craque-tactics-v230.js'):null);
const identity=()=>host?.SCOUT_PLAYER_IDENTITY_V245||
 (typeof module==='object'&&module.exports?require('./scout-player-identity-v245.js'):null);
const resolveRole=row=>SLOT[String(row?.slot||'').toLowerCase()]||position()?.pos(row?.role)||null;
const nativeRole=card=>position()?.pos(card?.posicao)||null;
const active=card=>card&&Number.isInteger(Number(card.numero))?Number(card.numero):null;
/**
 * @param {object} reserve  Carta original do catálogo (# / Card ID).
 * @param {Array<{slot:string,cap:number,role?:string}>} starters XI atual.
 * @param {Array<object>} cards Catálogo dos 246 jogadores.
 * @param {string} tactic Chave dentre os cinco estilos do técnico.
 */
function recommend(reserve,starters,cards,tactic='posse'){
 const P=position(),T=tactics(),I=identity();
 if(!P||!reserve||!Array.isArray(starters)||!Array.isArray(cards))return{
  eligible:false,reason:'Dados insuficientes para indicar substituição',position:null,replaces:null};
 const n=Number(reserve.numero);
 const byCap=new Map(cards.map(c=>[Number(c.numero),c]));
 const current=starters.map(row=>({
  slot:String(row.slot||''),role:resolveRole(row),card:byCap.get(Number(row.cap))
 })).filter(row=>row.role&&row.card);
 if(current.length!==starters.length||!Number.isInteger(n)||!P.edition(reserve))return{
  eligible:false,reason:'Elenco ou Card ID ainda não validado',position:null,replaces:null};
 if(current.some(row=>row.card.numero===n||I&&I.key(row.card)===I.key(reserve)))return{
  eligible:false,reason:'Esta pessoa já está entre os titulares',position:null,replaces:null};
 const possibilities=[];
 for(const item of current){
  const approval=P.status(reserve,item.role);
  if(!approval.eligible)continue;
  const score=typeof T?.score==='function'?T.score(reserve,item.slot,tactic).score:0;
  const incumbent=typeof T?.score==='function'?T.score(item.card,item.slot,tactic).score:0;
  const native=approval.status==='original'?2:approval.status==='familiar'?1:0;
  possibilities.push({...item,approval,score,incumbent,native});
 }
 possibilities.sort((a,b)=>b.native-a.native||b.score-a.score||
   a.incumbent-b.incumbent||a.slot.localeCompare(b.slot));
 const top=possibilities[0];
 if(!top)return{
  eligible:false,position:null,replaces:null,
  reason:'Sem posição confirmada para as vagas desta formação. Treino ou familiaridade deve ser comprovado no eFootball.',
  nativePosition:nativeRole(reserve)
 };
 return{
  eligible:true,position:top.role,slot:top.slot,status:top.approval.status,
  evidence:top.approval.label,
  replaces:{cap:Number(top.card.numero),name:String(top.card.name),slot:top.slot},
  reason:'Sugestão por posição e encaixe documental; confirme desempenho e instruções no jogo.',
  nativePosition:nativeRole(reserve)
 };
}
return Object.freeze({SLOT,resolveRole,recommend});
});
