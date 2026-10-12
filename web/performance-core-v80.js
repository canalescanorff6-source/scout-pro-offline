(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.SCOUT_PERFORMANCE_V80=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const categories=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
 const cost=v=>v.reduce((total,n)=>{for(let i=0;i<n;i++)total+=1+Math.floor(i/4);return total},0);
 const valid=v=>Array.isArray(v)&&v.length===10&&v.every(x=>Number.isInteger(x)&&x>=0&&x<=20);
 const verified=d=>Number.isInteger(d.pp)&&d.pp>=0&&!d.pp_estimated;
// PP confirmados e build completa são evidências independentes.
const hasPlan=d=>verified(d)&&valid(d.recommended_levels)&&cost(d.recommended_levels)===d.pp;
 const vectorKey=v=>v.join(',');
 function variants(d,l,custom){
  if(!verified(d))return [];
  const result=[],seen=new Map();
  const catalog={...(d.alternate_scenarios||{})};
  for(const k of ['A','B','C','P'])if(valid(l[k]))catalog[k]=l[k];
  if(valid(d.recommended_levels))catalog[d.recommended_scenario||'Recomendada']=d.recommended_levels;
  if(valid(custom))catalog['Personalizada']=custom;
  for(const [name,levels] of Object.entries(catalog)){
   if(!valid(levels)||cost(levels)!==d.pp)continue;
   const hash=vectorKey(levels);
   if(seen.has(hash)){seen.get(hash).aliases.push(name);continue}
   const b={name,aliases:[name],levels:levels.slice(),hash,pp:cost(levels)};
   result.push(b);seen.set(hash,b);
  }
  return result;
 }
 const rolePosition=d=>({DC:'ZG',ZC:'ZG',ZG:'ZG',MC:'MLG',ME:'MLG',MDF:'VOL',GR:'GO',MO:'MAT',AC:'CA',DD:'LD',DE:'LE'})[d.role_used]||d.role_used||d.shown_position||'MLG';
 function metrics(d){
  const pos=rolePosition(d);
  if(['CA','SA'].includes(pos))return ['Finalizações no alvo','Chances criadas'];
  if(['MAT','MLG','MLD','MLE','PTD','PTE'].includes(pos))return ['Passes certos sob pressão','Chances criadas'];
  if(['VOL','ZG'].includes(pos))return ['Interceptações','Duelos defensivos ganhos'];
  if(['LD','LE'].includes(pos))return ['Desarmes','Passes certos'];
  if(pos==='GO')return ['Defesas','Saídas seguras'];
  return ['Ações úteis','Passes certos'];
 }
 const clean=s=>String(s??'').trim().replace(/\s+/g,' ').slice(0,100);
 const contextKey=r=>[clean(r.manager),clean(r.formation),clean(r.tactic),clean(r.opponent)].map(x=>x.toLocaleLowerCase('pt-BR')).join('|');
 const results=new Set(['Vitória','Empate','Derrota']);
 function safeMatches(raw,opts){
  if(!Array.isArray(raw))return [];
  return raw.filter(r=>{
   if(!r||typeof r!=='object'||!opts.some(v=>v.hash===r.hash))return false;
   if(!results.has(r.result)||!['Posse de Bola','Contra-ataque normal','Contra-ataque rápido'].includes(r.tactic))return false;
   if(!clean(r.manager)||!clean(r.formation)||!clean(r.opponent))return false;
   return Number.isInteger(r.metricA)&&r.metricA>=0&&r.metricA<=100
    &&Number.isInteger(r.metricB)&&r.metricB>=0&&r.metricB<=100;
  }).slice(-100);
 }
 function comparisons(records,opts){
  const byContext=new Map();
  for(const r of safeMatches(records,opts)){
   const key=contextKey(r);
   if(!byContext.has(key))byContext.set(key,new Map());
   const byBuild=byContext.get(key);
   if(!byBuild.has(r.hash))byBuild.set(r.hash,[]);
   byBuild.get(r.hash).push(r);
  }
  const found=[];
  for(const [key,byBuild] of byContext){
   const eligible=[...byBuild.entries()].filter(([,list])=>list.length>=5);
   if(eligible.length<2)continue;
   found.push({key,builds:eligible.map(([hash,list])=>{
    const plan=opts.find(o=>o.hash===hash);
    const n=list.length,avg=(field)=>Number((list.reduce((s,m)=>s+m[field],0)/n).toFixed(2));
    return {name:plan.name,hash,count:n,metricA:avg('metricA'),metricB:avg('metricB'),wins:list.filter(x=>x.result==='Vitória').length};
   })});
  }
  return found;
 }
 function review(d,l,records,custom){
  const hasPP=verified(d),opts=variants(d,l,custom);
  const baseStats=Object.keys(l.stats||{}).filter(name=>{
   const v=l.stats[name];return v&&Number.isFinite(v.base)&&Number.isFinite(v.boost)&&Number.isFinite(v.mgr);
  }).length;
  const full=d.has_native_skills===true&&!!String(d.native_skills||'').trim();
  const candidate=hasPP&&baseStats>0&&full&&opts.length>=2;
  const observed=comparisons(records,opts);
  let status='Dados pendentes';
  if(hasPP)status=opts.length?'Build calculada':'PP confirmados · treino pendente';
  if(candidate)status='Build competitiva candidata';
  if(observed.length)status='Build validada em campo';
  const missing=[];
  if(!hasPP)missing.push('PP e progressão da carta devem ser confirmados');
  else if(!opts.length)missing.push('PP registrados, mas a distribuição por atributo ainda não foi informada');
  if(!baseStats)missing.push('Atributos-base da edição ainda não registrados');
  if(!full)missing.push('Habilidades nativas incompletas');
  if(opts.length<2&&hasPP)missing.push('Precisamos de uma segunda distribuição diferente e com PP corretos');
  if(/pendente|n[aã]o confirmad|slot selecion[aá]vel/i.test(String(d.boost2||'')))missing.push('Segundo ímpeto não confirmado: não presumir bônus');
  return {status,hasPP,hasPlan:hasPlan(d),opts,baseStats,nativeSkills:full,candidate,observed,missing,recorded:safeMatches(records,opts).length};
 }
 return {categories,cost,valid,verified,hasPlan,variants,metrics,contextKey,safeMatches,comparisons,review,vectorKey};
});