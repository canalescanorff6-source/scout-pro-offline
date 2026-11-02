/* Referência independente de OVR estimado. Não é fórmula oficial Konami,
   não usa o número impresso na arte e não altera treinos/equipamentos. */
(function(host,factory){'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_RATING_V376=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const POS=Object.freeze({GO:0,ZG:1,LE:2,LD:3,VOL:4,MLG:5,MLE:6,MLD:7,MAT:8,PTE:9,PTD:10,SA:11,CA:12});
const GROUPS=Object.freeze([
 ['finishing','set_piece_taking','curl'],['low_pass','lofted_pass'],['ball_control','dribbling','tight_possession'],
 ['offensive_awareness','acceleration','balance'],['speed','kicking_power','stamina'],['heading','jumping','physical_contact'],
 ['defensive_awareness','tackling','aggression','defensive_engagement'],['jumping','gk_awareness'],
 ['gk_parrying','gk_reach'],['gk_catching','gk_reflexes']]);
const ALIASES=Object.freeze({'attacking awareness':'offensive_awareness','offensive awareness':'offensive_awareness',
 'ball control':'ball_control','dribbling':'dribbling','tight possession':'tight_possession','low pass':'low_pass',
 'lofted pass':'lofted_pass','finishing':'finishing','heading':'heading','set piece taking':'set_piece_taking',
 'curl':'curl','speed':'speed','acceleration':'acceleration','kicking power':'kicking_power','jumping':'jumping',
 'physical contact':'physical_contact','balance':'balance','stamina':'stamina','defensive awareness':'defensive_awareness',
 'tackling':'tackling','aggression':'aggression','defensive engagement':'defensive_engagement'});
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const cost=n=>n+Math.max(0,n-4)+Math.max(0,n-8)+Math.max(0,n-12)+Math.max(0,n-16);
const vector=v=>Array.isArray(v)&&v.length===10&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
const trainingCost=v=>vector(v)?v.reduce((s,n)=>s+cost(n),0):null;
function baseOverall(stats,position,height,weakFootAccuracy,model){
 const p=typeof position==='number'?position:POS[position],w=model?.weights;
 if(!w||!Number.isInteger(p)||p<0||p>12||!Number.isFinite(height)||height<120||height>230||
  !Number.isInteger(weakFootAccuracy)||weakFootAccuracy<0||weakFootAccuracy>3)return null;
 let total=(height-136)*w.height[p];
 for(const [name,weights] of Object.entries(w)){
  if(name==='height')continue;
  const value=stats?.[name];
  if(!Number.isFinite(value)||value<0||value>125||!Number.isFinite(weights[p]))return null;
  total+=(value-25)*weights[p];
 }
 const foot=Math.floor(40+59*weakFootAccuracy/3);
 return Math.floor((total+4*(foot-25)+500)/1000);
}
function contextKey(card,ctx,model){
 const value=JSON.stringify([card.key,card.cardId,card.edition,card.reference?.htmlSha256||'',
  ctx.cardId,ctx.edition,ctx.position,ctx.training,ctx.budget,ctx.manager||null,ctx.extraBooster||null,model.version]);
 let h=2166136261;for(const c of value)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
 return 'v376:'+h.toString(16)+':'+value.length;
}
function evaluate(card,ctx,model){
 const pending=reason=>({status:'pending',reason,overall:null,stats:null});
 if(!card||!ctx||ctx.cardKey!==card.key)return pending('Contexto da carta divergente.');
 const ref=card.reference;
 if((ctx.position==='GO')!==(card.position==='GO'))return pending('Goleiro e jogador de linha exigem funções compatíveis.');
 const accepted=card.identityUsable===true||ctx.referenceConfirmed===true;
 if(!ref||!accepted)return pending('Edição/ID ainda precisa de conferência individual.');
 const id=card.cardId||card.candidateId;
 if(String(ctx.cardId)!==String(id)||String(ctx.edition)!==String(card.edition))return pending('A edição selecionada não corresponde à referência.');
 if(!Object.hasOwn(POS,ctx.position))return pending('Posição não reconhecida.');
 const spent=trainingCost(ctx.training);
 if(spent===null)return pending('Treino atual não registrado; não presumir que a proposta já foi aplicada.');
 if(!Number.isInteger(ctx.budget)||ctx.budget<0||ctx.budget>238||spent>ctx.budget)return pending('Treino excede os PP disponíveis ou orçamento ausente.');
 const functional=typeof window!=='undefined'?window.CRAQUE_FUNCTIONAL_RULES_V382:require('./craque-functional-rules-v382.js');
 const allowed=functional?.allowed(ctx.position,ctx)||(ctx.position==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6]);
 if(ctx.training.some((n,i)=>n>0&&!allowed.includes(i)))return pending('Categorias do treino incompatíveis com a função.');
 if(ref.levelValid&&spent>ref.maxPP)return pending('Treino excede o orçamento público desta edição; conferir nível/PP.');
 if(baseOverall(ref.baseStats,ref.position,ref.height,ref.weakFootAccuracy,model)===null)return pending('Atributos-base completos indisponíveis.');
 const stats={...ref.baseStats},warnings=[];
 for(const i of allowed)for(const stat of GROUPS[i])stats[stat]=Math.min(99,stats[stat]+ctx.training[i]);
 if(ctx.manager){
  const proficiency=ctx.manager.proficiency,thresholds=model.proficiencyThresholds?.[String(proficiency)];
  if(!Number.isInteger(proficiency)||!Array.isArray(thresholds))return pending('Proficiência do técnico fora do modelo documentado.');
  for(const key of Object.keys(stats))stats[key]=Math.min(99,stats[key]+thresholds.filter(t=>stats[key]>=t).length);
 }
 const addBoost=boost=>{
  if(!boost||typeof boost!=='object'||Array.isArray(boost))return false;
  for(const [stat,n] of Object.entries(boost))if(!Object.hasOwn(stats,stat)||!Number.isInteger(n)||n<0||n>5)return false;
  for(const [stat,n] of Object.entries(boost))stats[stat]+=n;
  return true;
 };
 for(const b of ref.fixedBoosters||[])if(!addBoost(b.stats))return pending('Ímpeto fixo sem efeito numérico completo.');
 if(ctx.extraBooster?.confirmed){
  const boost=model.boosters?.[norm(ctx.extraBooster.name)];
  if(!boost||!addBoost(boost))return pending('Ímpeto adicional confirmado sem efeito numérico reconhecido.');
 }else warnings.push('Cálculo sem ímpeto adicional não confirmado.');
 if(ctx.manager)for(const raw of ctx.manager.boosters||[]){
  const m=String(raw).match(/^(.+?)\s*\+\s*(\d+)$/),stat=m&&ALIASES[norm(m[1])],n=m&&Number(m[2]);
  if(!stat||!Number.isInteger(n)||n<0||n>5)return pending('Bônus do técnico sem correspondência numérica.');
  stats[stat]+=n;
 }
 if(!ref.levelValid)warnings.push('Nível máximo público incompleto; orçamento do cadastro mantido.');
 if(ref.levelValid&&ref.maxPP!==ctx.budget)warnings.push('Orçamento do cadastro difere da referência pública.');
 if(ctx.position!==card.position)warnings.push('OVR condicional nesta função; familiaridade/ativação precisam ser conferidas.');
 if(card.identityStatus==='declared_edition_match'&&card.candidateSkillsMatch===false)
  warnings.push('Edição confirmada por você; lista pública de habilidades difere da transcrição e ainda requer conferência.');
 const overall=baseOverall(stats,ctx.position,ref.height,ref.weakFootAccuracy,model);
 if(overall===null)return pending('Não foi possível calcular o OVR deste contexto.');
 return {status:'estimated',label:'OVR estimado',overall,stats,spent,remaining:ctx.budget-spent,budget:ctx.budget,
  maxLevel:ref.maxLevel,manager:ctx.manager?.name||'Sem técnico',position:ctx.position,
  context:contextKey(card,ctx,model),warnings,source:ref.url,officialKonamiFormula:false,accountConfirmed:false};
}
function observation(card,ctx,model,overall,userConfirmed){
 if(userConfirmed!==true||!Number.isInteger(overall)||overall<40||overall>120||!vector(ctx.training)||
  !Number.isInteger(ctx.budget)||ctx.budget<0||trainingCost(ctx.training)>ctx.budget)
  throw Error('Confirme o OVR observado no jogo e seu treino atual.');
 return {schema:'CRAQUE_OBSERVED_OVR_V376',context:contextKey(card,ctx,model),overall,userConfirmed:true,savedAt:new Date().toISOString()};
}
function readObservation(record,card,ctx,model){
 return record?.schema==='CRAQUE_OBSERVED_OVR_V376'&&record.userConfirmed===true&&
  Number.isInteger(record.overall)&&record.overall>=40&&record.overall<=120&&
  record.context===contextKey(card,ctx,model)?record:null;
}
function ownedMetadata(card,manual,entry){
 const m=manual&&typeof manual==='object'&&!Array.isArray(manual)?manual:{};
 const level=Number.isInteger(m.maxLevel)&&m.maxLevel>=1&&m.maxLevel<=120?m.maxLevel:null;
 const id=/^\d{5,20}$/.test(String(m.cardId||''))?String(m.cardId):'';
 if(level!==null||id)return {level,cardId:id,source:'manual',engineEdition:'',confirmedInGame:false};
 if(entry?.key===card.key&&entry.identityUsable&&entry.reference)
  return {level:entry.reference.levelValid?entry.reference.maxLevel:null,cardId:entry.reference.cardId,source:'public_reference',
   engineEdition:entry.reference.edition,confirmedInGame:false};
 return {level:null,cardId:'',source:'pending',engineEdition:'',confirmedInGame:false};
}
return Object.freeze({POS,GROUPS,trainingCost,baseOverall,contextKey,evaluate,observation,readObservation,ownedMetadata});
});
