/* Craque Tático V394 — consenso multiestilo; nenhuma alteração de equipamento ou PP salvo.
 * Seleciona uma única hipótese com orçamento exato a partir de seis propostas individuais.
 * O critério minimiza divergência entre propostas, NÃO prevê sucesso em PvP.
 */
(function(host,factory){'use strict';
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_GLOBAL_V394=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const MODES=Object.freeze(['posse','normal','rapido','fora','longo','overload']);
 const VERSION='global-394-20261106';
 const idOf=x=>x?.tactic||x?.style;
 function choose(plans,tactical){
  if(!Array.isArray(plans)||plans.length!==MODES.length||!tactical?.valid||
     !tactical?.total||!tactical?.ppCost)return null;
  const byId=new Map(plans.map(p=>[idOf(p),p]));
  if(byId.size!==MODES.length||MODES.some(id=>!byId.has(id)))return null;
  const ordered=MODES.map(id=>byId.get(id)),budget=ordered[0].pp;
  if(!Number.isInteger(budget)||budget<0||ordered.some(p=>
   p?.status!=='hipotese'||p.pp!==budget||!tactical.valid(p.levels)||
   tactical.total(p.levels)!==budget))return null;
  const weight=(p,i)=>{
   const priorities=p.focus?.priority||[];
   const hit=priorities.find(x=>x.index===i);
   return hit?1.6:1;
  };
  const distance=(v,p)=>{
   let sum=0;
   for(let i=0;i<v.length;i++)
    sum+=weight(p,i)*Math.abs(tactical.ppCost(v[i])-tactical.ppCost(p.levels[i]));
   return sum/Math.max(1,budget);
  };
  const evaluated=ordered.map(p=>{
   const distances=ordered.map(target=>({style:idOf(target),distance:distance(p.levels,target)}));
   const worst=Math.max(...distances.map(x=>x.distance));
   const mean=distances.reduce((s,x)=>s+x.distance,0)/MODES.length;
   return {plan:p,distances,worst,mean,score:worst+mean*.45};
  }).sort((a,b)=>a.score-b.score||a.worst-b.worst||
   MODES.indexOf(idOf(a.plan))-MODES.indexOf(idOf(b.plan)));
  const best=evaluated[0];
  return Object.freeze({
   version:VERSION,kind:'hipotese_universal',sourceStyle:idOf(best.plan),
   levels:Object.freeze(best.plan.levels.slice()),pp:budget,
   worstDistance:Number(best.worst.toFixed(5)),meanDistance:Number(best.mean.toFixed(5)),
   coverage:Object.freeze(best.distances.map(x=>Object.freeze({
    style:x.style,distance:Number(x.distance.toFixed(5)),
    identical:x.distance===0
   }))),
   statement:'Uma proposta de PP para seis estilos. Consenso matemático entre fichas individuais, sem prova de superioridade em gameplay.'
  });
 }
 const norm=s=>String(s||'').normalize('NFD').split('').filter(ch=>{const code=ch.charCodeAt(0);return code<768||code>879}).join('').trim().toLowerCase();
 function rankSkills(outputs,keyFor,max=5){
  if(!Array.isArray(outputs)||outputs.length!==MODES.length)return [];
  const byKey=new Map();
  for(const row of outputs){
   if(!MODES.includes(row?.tactic))return [];
   const seen=new Set();
   for(const [rank,item] of (row.result?.recommendations||[]).slice(0,12).entries()){
    const key=keyFor?.(item.name)||norm(item.name);if(!key||seen.has(key))continue;
    seen.add(key);
    const prior=byKey.get(key)||{item,score:0,styles:new Set(),bestRank:99};
    prior.score+=Math.max(1,12-rank);prior.styles.add(row.tactic);
    if(rank<prior.bestRank){prior.item=item;prior.bestRank=rank}
    byKey.set(key,prior);
   }
  }
  return [...byKey.values()].sort((a,b)=>b.styles.size-a.styles.size||
   b.score-a.score||a.bestRank-b.bestRank||a.item.name.localeCompare(b.item.name,'pt-BR'))
   .slice(0,max).map(x=>({...x.item,globalCoverage:x.styles.size,
    why:'Seleção multiestilo: aparece em '+x.styles.size+' de 6 análises. '+String(x.item.why||'')}));
 }
 function rankBoosters(outputs){
  if(!Array.isArray(outputs)||outputs.length!==MODES.length)return null;
  if(outputs.some(x=>!MODES.includes(x?.tactic)||x.result?.slotSupported!==true||
   x.result?.able!==true))return null;
  const byName=new Map();
  for(const row of outputs){
   const picks=[row.result.primary,...(row.result.alternatives||[])].filter(Boolean);
   for(const [rank,item] of picks.entries()){
    const name=String(item.nome||item.technicalName||'').trim(),key=norm(name);
    if(!key)continue;
    const prev=byName.get(key)||{item,score:0,styles:new Set(),best:99};
    if(prev.styles.has(row.tactic))continue;
    prev.styles.add(row.tactic);prev.score+=Math.max(1,9-rank);
    if(rank<prev.best){prev.item=item;prev.best=rank}
    byName.set(key,prev);
   }
  }
  const ordered=[...byName.values()].sort((a,b)=>b.styles.size-a.styles.size||
   b.score-a.score||a.best-b.best);
  return ordered.length?{primary:ordered[0].item,alternatives:ordered.slice(1,6).map(x=>x.item)}:null;
 }
 return Object.freeze({MODES,VERSION,choose,rankSkills,rankBoosters});
});