/* SCOUT PRO V222 — proteção visual de jogadores para testes nas duas formações.
 * Entradas reais por número + Card ID. 22 nomes sem foto NÃO viram lista verificada.
 * Exportação/importação explícitas para troca Android <-> Windows (sem sincronização remota).
 */
(function(host){
'use strict';
const SCHEMA='SCOUT_BLACK_RESTRICTIONS_V222',LIMIT=22;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const idOf=c=>Number(c?.numero),cardId=c=>String(c?.id??'').trim();
function catalog(cards){
 if(!Array.isArray(cards)||cards.length!==246)throw Error('Catálogo de 246 cartas necessário');
 const numbers=new Map();
 for(const card of cards){
  const n=idOf(card);
  if(!Number.isInteger(n)||n<1||n>246||numbers.has(n))throw Error('Número de carta repetido/inválido: '+n);
  numbers.set(n,card);
 }
 return numbers;
}
function validateCaps(raw,cards){
 const known=catalog(cards);
 if(!Array.isArray(raw))throw Error('Lista de exclusões precisa ser um conjunto de números');
 if(raw.length>246)throw Error('Lista de exclusões fora do tamanho do catálogo');
 const n=[];
 for(const value of raw){
  if(!/^\d{1,3}$/.test(String(value).trim()))throw Error('Número de carta inválido: '+String(value));
  const number=Number(value);
  if(!known.has(number))throw Error('Carta inexistente no catálogo: #'+String(number));
  if(!n.includes(number))n.push(number);
 }
 if(n.length>LIMIT)throw Error('Máximo de '+LIMIT+' jogadores do Black; recebidos '+n.length);
 return n.sort((a,b)=>a-b);
}
function makeRecord(raw,cards,userReviewed=false){
 const ids=validateCaps(raw,cards),map=catalog(cards);
 return {schema:SCHEMA,rosterCount:246,limit:LIMIT,excludedCount:ids.length,
  userReviewed:ids.length===LIMIT&&userReviewed===true,
  externalPhotoVerified:false,
  scope:'As duas formações de teste, rodadas 1 e 2; não apaga cartas',
  excluded:ids.map(numero=>{
   const c=map.get(numero);
   return {numero,card_id:cardId(c),nome:String(c.name||''),edicao:String(c.versao||''),
    posicao:String(c.posicao||''),estilo:String(c.estilo_ataque||'')};
  }),
  note:'O campo userReviewed representa SOMENTE declaração do usuário. Verificação externa da foto NÃO foi feita.'
 };
}
function readRecord(imported,cards){
 if(!imported||imported.schema!==SCHEMA||imported.rosterCount!==246||imported.limit!==LIMIT||
   !Array.isArray(imported.excluded))throw Error('Arquivo de bloqueios não é do Scout PRO V222');
 if(imported.excluded.length>LIMIT)throw Error('Arquivo excede 22 exclusões');
 const ids=validateCaps(imported.excluded.map(x=>x?.numero),cards);
 if(ids.length!==imported.excluded.length)throw Error('Há cartas repetidas dentro do arquivo importado');
 const current=catalog(cards),byNo=new Map(imported.excluded.map(x=>[Number(x.numero),x]));
 for(const n of ids){
  const c=current.get(n),reported=byNo.get(n);
  if(!reported||String(reported.card_id)!==cardId(c)||String(reported.nome)!==String(c.name))
   throw Error('Edição/identidade divergente na carta #'+String(n).padStart(3,'0')+
    '. Atualize o catálogo e confira a edição original.');
 }
 if(imported.externalPhotoVerified===true)throw Error('Arquivo afirma verificação externa não realizada; revisar manualmente');
 return makeRecord(ids,cards,imported.userReviewed===true);
}
function available(cards,raw){const blocked=new Set(validateCaps(raw,cards));return cards.filter(c=>!blocked.has(idOf(c)))}
function match(card,term,positionFilter=''){
 const text=norm([card.numero,card.name,card.versao,card.id,card.posicao,card.estilo_ataque].join(' '));
 const tokens=norm(term).split(/\s+/).filter(Boolean);
 if(positionFilter&&String(card.posicao||'').toUpperCase()!==String(positionFilter).toUpperCase())return false;
 return tokens.every(part=>text.includes(part));
}
function filter(cards,term,position,limit=48){
 if(!Number.isInteger(limit)||limit<1||limit>246)throw Error('Limite inválido');
 const matching=cards.filter(c=>match(c,term,position));
 return {items:matching.slice(0,limit),total:matching.length,visible:Math.min(limit,matching.length)};
}
const api=Object.freeze({SCHEMA,LIMIT,norm,catalog,validateCaps,makeRecord,readRecord,available,match,filter});
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_RESTRICT_V222=api;
})(typeof window!=='undefined'?window:null);
