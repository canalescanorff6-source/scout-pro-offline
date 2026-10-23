/* V328 · Seletor de técnicos offline. IDs e proficiências do catálogo V302, nunca inventados. */
(function(host,factory){'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_MANAGER_SELECTOR_V328=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const FAVORITES='scoutpro:v307:manager-favorites';
 const OWNED='scoutpro:v307:manager-owned';
 const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 function readIds(storage,key){
  try{const parsed=JSON.parse(storage?.getItem(key)||'[]');
   return new Set(Array.isArray(parsed)?parsed.filter(x=>/^CT-MGR-\d{3}$/.test(x)):[])}
  catch(_){return new Set()}
 }
 function filter(items,api,{query='',scope='all',style='posse',selected='',storage=null}={}){
  if(!Array.isArray(items)||!api?.STYLES||typeof api.proficiency!=='function')
   throw Error('Catálogo de técnicos indisponível');
  const needle=normalize(query),favorites=readIds(storage,FAVORITES),owned=readIds(storage,OWNED);
  const validStyles=new Set(api.STYLES.map(s=>s.id));
  const selectedStyle=validStyles.has(style)?style:'posse';
  const curated=new Set(api.CURATED_IDS||[]);
  const matched=items.filter(c=>{
   if(!c||typeof c.catalog_id!=='string')return false;
   if(scope==='favorites'&&!favorites.has(c.catalog_id))return false;
   if(scope==='owned'&&!owned.has(c.catalog_id))return false;
   if(scope==='featured'&&!curated.has(c.catalog_id)&&c.catalog_id!=='CT-MGR-071')return false;
   if(!needle)return true;
   return normalize([c.nome,c.versao_lancamento,c.catalog_id].join(' ')).includes(needle);
  });
  // Escolhido não desaparece: mesmo que não atenda aos filtros, fica
  // explicitamente visível para evitar reset silencioso de fichas.
  const chosen=items.find(c=>c.catalog_id===selected);
  if(chosen&&!matched.some(c=>c.catalog_id===selected))matched.unshift(chosen);
  const score=c=>api.proficiency(c,selectedStyle);
  matched.sort((a,b)=>{
   if(a.catalog_id===selected)return -1;
   if(b.catalog_id===selected)return 1;
   const aFav=Number(favorites.has(a.catalog_id)),bFav=Number(favorites.has(b.catalog_id));
   if(aFav!==bFav)return bFav-aFav;
   const aOwn=Number(owned.has(a.catalog_id)),bOwn=Number(owned.has(b.catalog_id));
   if(aOwn!==bOwn)return bOwn-aOwn;
   const av=score(a),bv=score(b);
   if((bv??-1)!==(av??-1))return (bv??-1)-(av??-1);
   const names=a.nome.localeCompare(b.nome,'pt-BR');
   return names||a.catalog_id.localeCompare(b.catalog_id);
  });
  return matched.map(c=>Object.freeze({
   id:c.catalog_id,name:c.nome,edition:c.versao_lancamento||'versão pendente',
   score:score(c),favorite:favorites.has(c.catalog_id),
   owned:owned.has(c.catalog_id),selected:c.catalog_id===selected,
   curated:curated.has(c.catalog_id)||c.catalog_id==='CT-MGR-071',
   boosters:Array.isArray(c.boosters_PTBR)?c.boosters_PTBR.slice():
    Array.isArray(c.boosters_EN)?c.boosters_EN.slice():[],
   label:c.nome+' · '+(c.versao_lancamento||'versão pendente')+
    ' · '+(score(c)===null?'proficiência pendente':selectedStyle+' '+score(c))+
    (favorites.has(c.catalog_id)?' · ★ Favorito':'')+
    (owned.has(c.catalog_id)?' · Meu técnico':'')
  }));
 }
 function toggleFavorite(storage,id){
  if(!/^CT-MGR-\d{3}$/.test(id))throw Error('ID inválido');
  const ids=readIds(storage,FAVORITES);
  if(ids.has(id))ids.delete(id);else ids.add(id);
  storage.setItem(FAVORITES,JSON.stringify([...ids].sort()));
  return ids.has(id);
 }
 return Object.freeze({FAVORITES,OWNED,normalize,readIds,filter,toggleFavorite});
});
