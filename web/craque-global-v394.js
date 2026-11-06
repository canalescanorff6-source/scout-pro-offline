/* Craque Tático V394 — consenso multiestilo; nenhuma alteração de equipamento ou PP salvo.
 * Seleciona uma única hipótese com orçamento exato a partir de seis propostas individuais.
 * O critério minimiza divergência entre propostas, NÃO prevê sucesso em PvP.
 */
(function(host,factory){'use strict';
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_GLOBAL_V394=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const MODES=Object.freeze(['posse','normal','rapido','fora','longo','overload']);
 const VERSION='global-card-395-20261106';
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
  // Ranking consultivo mesmo com slot não confirmado. A elegibilidade
  // continua no resultado original; esta função NUNCA autoriza equipamento.
  if(outputs.some(x=>!MODES.includes(x?.tactic)||!x.result||
   (!x.result.primary&&!(x.result.alternatives||[]).length)))return null;
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
  return ordered.length?{primary:ordered[0].item,alternatives:ordered.slice(1,6).map(x=>x.item),applyAuthorized:false,rankingStatus:'consultivo_sem_prova_de_slot'}:null;
 }
 // V395: otimização individual sobre atributos-base da edição documentada.
 // Diferentemente do consenso V394, não seleciona uma das seis fichas.
 // Os seis contextos servem como restrições da função, NÃO geram seis treinos.
 const STAT_GROUPS=Object.freeze([
  ['finishing','set_piece_taking','curl'],
  ['low_pass','lofted_pass'],
  ['ball_control','dribbling','tight_possession'],
  ['offensive_awareness','acceleration','balance'],
  ['speed','kicking_power','stamina'],
  ['heading','jumping','physical_contact'],
  ['defensive_awareness','tackling','aggression','defensive_engagement'],
  ['gk_awareness','jumping'],
  ['gk_parrying','gk_reach'],
  ['gk_catching','gk_reflexes']
 ]);
 const TARGETS=Object.freeze({
  CA:{finishing:91,offensive_awareness:92,acceleration:89,kicking_power:90,ball_control:86,
   heading:88,physical_contact:86,low_pass:82},
  SA:{finishing:87,offensive_awareness:90,acceleration:90,low_pass:86,ball_control:88,tight_possession:88},
  MAT:{low_pass:91,ball_control:91,tight_possession:89,acceleration:88,offensive_awareness:89},
  MLG:{low_pass:89,ball_control:87,tight_possession:86,stamina:90,acceleration:85},
  VOL:{defensive_awareness:90,tackling:89,defensive_engagement:89,low_pass:87,
   physical_contact:86,stamina:90},
  ZG:{defensive_awareness:92,tackling:91,defensive_engagement:90,physical_contact:89,
   speed:87,jumping:89},
  LE:{defensive_awareness:88,tackling:88,speed:91,stamina:90,low_pass:84},
  LD:{defensive_awareness:88,tackling:88,speed:91,stamina:90,low_pass:84},
  ALA:{speed:92,acceleration:92,dribbling:89,stamina:87,low_pass:83},
  GO:{gk_awareness:91,gk_reflexes:92,gk_reach:91,gk_parrying:88,gk_catching:87}
 });
 const statNumbers=s=>s&&typeof s==='object'&&!Array.isArray(s)?
  Object.fromEntries(Object.entries(s).filter(([k,v])=>typeof k==='string'&&
   Number.isInteger(v)&&v>=0&&v<=120)):{};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const r5=x=>Math.round(x*100000)/100000;
 function evidenceOf({card,reference}){
  const r=reference?.reference,id=String(card?.cardId||''),edition=String(card?.edition||'');
  if(reference?.identityUsable!==true||!r||!/^[0-9]{5,20}$/.test(id)||
   String(r.cardId)!==id||!edition||![reference.edition,r.edition].includes(edition)||
   !/^[a-f0-9]{64}$/i.test(String(r.htmlSha256||''))||
   (Number.isInteger(Number(card.capture))&&Number(card.capture)>0&&
    Number(card.capture)!==Number(reference.capture)))return null;
  // A Vinculação V393 de um candidato diferente do cadastro exige prova de arte.
  if(reference.cardId&&String(reference.cardId)!==id){
   const p=reference.publicIdentityV393;
   if(!p||p.matchStatus!=='exact_artwork_match'||p.capture!==reference.capture||
    p.catalogueId!==String(reference.cardId)||p.catalogueEdition!==reference.edition||
    !/^[a-f0-9]{64}$/i.test(String(p.localImageSha256||''))||
    String(reference.candidateId)!==id)return null;
  }
  const stats=statNumbers(r.baseStats);
  if(Object.keys(stats).length<17)return null;
  return {ref:r,stats};
 }
 function optimizeCard({card,plans,tactical,individual,reference,physical}){
  if(!Array.isArray(plans)||plans.length!==MODES.length||!tactical?.valid||
     !tactical?.total||!tactical?.ppCost||!individual?.allocate)return null;
  const byId=new Map(plans.map(p=>[p.style,p]));
  if(byId.size!==MODES.length||MODES.some(id=>!byId.has(id)))return null;
  const ordered=MODES.map(id=>byId.get(id)),budget=ordered[0].pp,role=ordered[0].role;
  if(!Number.isInteger(budget)||budget<0||
   ordered.some(p=>p.status!=='hipotese'||p.pp!==budget||p.role!==role||
    !Array.isArray(p.optimization?.weights)||p.optimization.weights.length!==10))
   return null;
  const identity=evidenceOf({card,reference});
  if(!identity)return Object.freeze({kind:'pendente_dados_da_edicao',status:'pendente',
   reason:'Não há ligação comprovada de Card ID, edição e atributos-base: não entregar uma ficha genérica como se fosse individual.'});
  const {ref,stats}=identity,target=TARGETS[role]||{},groupWeights=Array(10).fill(0);
  for(const p of ordered)for(let i=0;i<10;i++){
   const w=p.optimization.weights[i];
   if(!Number.isFinite(w)||w<0)return null;
   groupWeights[i]+=w/MODES.length;
  }
  const fixed=Object.create(null);
  for(const booster of ref.fixedBoosters||[]){
   if(!booster?.stats||typeof booster.stats!=='object')continue;
   for(const [name,amount] of Object.entries(booster.stats))
    if(Number.isInteger(amount)&&amount>=1&&amount<=5)fixed[name]=(fixed[name]||0)+amount;
  }
  const native=(ref.nativeSkills||[]).map(normalize);
  const physicalValid=physical&&physical.cardId===String(card.cardId)&&
   Number(physical.capture)===Number(card.capture)&&
   Number.isFinite(physical.legLength)?physical:null;
  const diagnostics=[],curves=Array(10).fill(null);
  // Os valores-alvo e pesos são editoriais: NÃO alegar limiares internos nem
  // precisão medida; os incrementos são por categoria de treino do jogo.
  for(let i=0;i<10;i++){
   const axis=STAT_GROUPS[i],active=axis.filter(k=>Number.isInteger(stats[k]));
   if(groupWeights[i]<=0||active.length===0)continue;
   const weighted=active.map(k=>{
    const v=stats[k]+(fixed[k]||0);
    const expected=target[k]??(i===6?87:i===7||i===8||i===9?88:i===5?85:86);
    const shortage=clamp(expected-v,-22,36);
    const strength=clamp(1+shortage/68,.72,1.45);
    return {name:k,base:stats[k],fixed:fixed[k]||0,expected,strength};
   });
   const meanStrength=weighted.reduce((s,k)=>s+k.strength,0)/weighted.length;
   const skillBonus=i===0&&native.some(s=>/first.time shot|phenomenal finishing|long.range shooting/.test(s))?.045:
    i===1&&native.some(s=>/one.touch pass|through passing|through pass/.test(s))?.055:
    i===5&&native.some(s=>/heading|aerial superiority/.test(s))?.05:
    i===6&&native.some(s=>/interception|blocker/.test(s))?.055:0;
   const longLeg=physicalValid&&(i===6||i===5)&&['ZG','VOL','LE','LD','GO'].includes(role)?
    clamp((physicalValid.legLength-8)*.006,-.018,.018):0;
   const adjusted=groupWeights[i]*clamp(.73+meanStrength*.32+skillBonus+longLeg,.75,1.28);
   groupWeights[i]=r5(adjusted);
   curves[i]=Array(21).fill(0);
   for(let n=1;n<=20;n++){
    let increment=0;
    for(const k of weighted){
     const projected=k.base+k.fixed+n-1;
     const band=projected<65?.72:projected<85?1.13:projected<93?1.02:
      projected<99?.7:.27;
     increment+=band*k.strength;
    }
    increment/=weighted.length;
    curves[i][n]=r5(curves[i][n-1]+increment*groupWeights[i]*.24);
   }
   diagnostics.push({category:tactical.CATEGORIES?.[i]||String(i),index:i,
    groupWeight:groupWeights[i],attributes:weighted.map(x=>({
     stat:x.name,base:x.base,fixed:x.fixed,targetEditorial:x.expected})),
    bodyEvidenceUsed:longLeg!==0});
  }
  if(diagnostics.length===0)return Object.freeze({kind:'pendente_dados_da_edicao',status:'pendente',
   reason:'Atributos-base válidos, mas nenhum atributo útil à posição foi documentado.'});
  // Não alimentar a escolha com nome, raridade ou hash como sorteio.
  // Cartas genuinamente equivalentes podem alcançar a MESMA distribuição.
  const baseline=Array.isArray(card.trainingLevels)?card.trainingLevels:
   null;
  const vec=individual.allocate(groupWeights,role,budget,
   tactical.valid(baseline)?baseline:null,{utility:curves});
  if(!tactical.valid(vec)||tactical.total(vec)!==budget)return null;
  return Object.freeze({kind:'hipotese_por_edicao',version:'global-card-395',status:'hipotese',
   levels:Object.freeze(vec.slice()),pp:budget,role,
   evidence:{cardId:String(ref.cardId),edition:String(ref.edition),
    htmlSha256:ref.htmlSha256,source:ref.url,baseStatsCount:Object.keys(stats).length,
    fixedBoosterCount:(ref.fixedBoosters||[]).length,bodyModel:physicalValid?
     {source:physicalValid.source,legLength:physicalValid.legLength,
      status:'terceiros_sem_prova_mecanica'}:null},
   diagnostics:Object.freeze(diagnostics),statement:
    'Ficha ÚNICA por edição usando atributos-base, habilidades, ímpetos fixos e tarefa da posição. '+
    'Seis contextos considerados em conjunto; não otimiza Overall nem garante desempenho ou animações.'});
 }

 return Object.freeze({MODES,VERSION,choose,rankSkills,rankBoosters,optimizeCard});
});
