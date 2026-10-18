/* V245 — identidade da PESSOA no eFootball, não identidade da carta.
 * A base offline não possui Player ID físico confirmado para cada carta.
 * Portanto, agrupar nomes oficiais iguais (normalizados) é determinístico,
 * sem inventar playerId, altura, atributos ou equivalências incertas.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.SCOUT_PLAYER_IDENTITY_V245=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const key=card=>{
  const name=String(card?.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  return name?'p:'+name:'sem-nome:'+String(card?.numero??'');
 };
 const cap=card=>Number(card?.numero);
 function unique(cards){
  const names=new Set();
  for(const c of cards){
   const k=key(c);
   if(names.has(k))return false;
   names.add(k);
  }
  return true;
 }
 function duplicates(cards){
  const groups=new Map();
  for(const c of cards) {
   const k=key(c);
   if(!groups.has(k))groups.set(k,[]);
   groups.get(k).push(cap(c));
  }
  return [...groups.entries()].filter(([,ids])=>ids.length>1).map(([identity,caps])=>({identity,caps}));
 }
 return Object.freeze({key,cap,unique,duplicates});
});
