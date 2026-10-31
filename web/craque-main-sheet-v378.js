/* Uma ficha por contexto: treino exibido, habilidades e ímpeto têm a mesma origem.
   Consulta pura; não grava treino, recibos ou equipamento. */
(function(host,factory){'use strict';const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_MAIN_SHEET_V378=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const dependencies=provided=>provided||{
 training:host?.CRAQUE_FRIEND_TRAINING_V228,skills:host?.SCOUT_RECOMMENDATIONS_V162,
 boosters:host?.SCOUT_BOOSTERS_V103,tactical:host?.SCOUT_TACTICS_V220};
function cardFromModel(m,position){return {
 localKey:m.cardKey,capture:m.evidenceCard?.numero??null,name:m.name,cardId:m.cardId,edition:m.edition,
 position,originalPosition:m.position,style:m.style,defenceStyle:m.defenceStyle,level:m.level,pp:m.pp,nativeSkills:m.nativeSkills,
 skills:m.skills||'',fixedBooster:m.fixedBooster,booster:m.booster,boosterSlot:m.boosterSlot,
 equipmentRecord:m.equipmentRecord||null,trainingLevels:m.trainingLevels,
 baseReference:m.evidenceCard?.base_stats_known===true};}
function resolve(input,outcome,selection={},provided){
 const d=dependencies(provided),F=d.training,S=d.skills,B=d.boosters,T=d.tactical;
 if(!F||!S||!B||!T||!outcome?.plan)throw Error('Motor da ficha indisponível');
 const card={...input},reference=selection.reference;
 const exactReference=reference?.identityUsable===true&&reference.reference&&
  String(card.cardId)===String(reference.reference.cardId)&&
  [reference.edition,reference.reference.edition].includes(card.edition);
 let nativeSource=outcome.nativeDocumented||outcome.skills?.nativeKnown?'catalogue':'pending';
 if(nativeSource==='pending'&&exactReference&&reference.reference.nativeSkills?.length){
  card.nativeSkills=reference.reference.nativeSkills.join('; ');nativeSource='public';
 }
 const batch=host?.CRAQUE_COMPETITIVE_BATCH_V380||
  (typeof module==='object'?require('./craque-competitive-batch-v380.js'):null);
 const editorial=exactReference?batch?.find(card,outcome,selection,S,T):null;
 const role=outcome.plan.role,allowed=role==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6];
 const budget=outcome.plan.pp??outcome.progress.pp;
 const levels=own(selection,'levels')?selection.levels:editorial?.levels||outcome.plan.levels;
 const valid=v=>Number.isInteger(budget)&&T.valid(v)&&T.total(v)<=budget&&
  v.every((n,i)=>n===0||allowed.includes(i));
 if(own(selection,'levels')&&!valid(levels))throw Error('PP ou categorias da ficha salva incompatíveis com esta função');
 const usable=outcome.plan.status==='hipotese'&&valid(levels),vector=usable?levels.slice():null;
 const raw={...F.profileOf(card),niveis:vector},existing=String(card.skills||'');
 const confirmed=Boolean(S.checkedEquipment?.(raw,existing,card.equipmentRecord));
 const skills=S.evaluate(raw,outcome.tactic,existing,{equippedConfirmed:confirmed,equipmentRecord:card.equipmentRecord||null});
 const booster=S.booster(raw,outcome.tactic,B,card.boosterSlot||'pendente',card.booster||'');
 const result={...outcome,plan:{...outcome.plan,levels:vector,remaining:vector?budget-T.total(vector):null},
  skills,booster,suggestedSkills:skills.recommendations.slice(0,Math.max(0,5-skills.alreadyEquippedProvided)),
  freeSkillSlots:Number.isInteger(skills.slotsRemaining)?skills.slotsRemaining:null};
 const review=F.functionReview(card,result,undefined,{...d});
 const current=F.parseBaseline(card,T).levels,baseline=valid(current)?current.slice():null;
 const changes=baseline&&vector?vector.flatMap((to,i)=>to===baseline[i]?[]:[{
  index:i,category:T.CATEGORIES[i],from:baseline[i],to,deltaPP:T.ppCost(to)-T.ppCost(baseline[i])}]):[];
 Object.assign(review,{current:baseline,currentSpent:baseline?T.total(baseline):null,proposed:vector,
  spent:vector?T.total(vector):null,remaining:vector?budget-T.total(vector):null,changes,
  redistributedPP:Math.min(changes.reduce((s,x)=>s+Math.max(0,x.deltaPP),0),changes.reduce((s,x)=>s+Math.max(0,-x.deltaPP),0)),
  investedFromBalance:baseline&&vector?Math.max(0,T.total(vector)-T.total(baseline)):0,
  trainingGroups:vector?T.CATEGORIES.flatMap((category,i)=>allowed.includes(i)?[{
   index:i,category,proposed:vector[i],cost:T.ppCost(vector[i]),current:baseline?.[i]??null}]:[]):[],
  canSave:Boolean(vector&&String(card.localKey||'').trim()),
  sourceKind:['profile','revision'].includes(selection.source)?selection.source:'proposal'});
 const issues=[],nativeKeys=new Set(review.nativeSkills.map(S.keyFor).filter(Boolean));
 const equippedKeys=new Set(existing.split(/[;,\n]/).map(S.keyFor).filter(Boolean));
 if(own(selection,'skills')){
  const kept=[],seen=new Set();
  for(const name of selection.skills||[]){const key=S.keyFor(name);
   if(!key||nativeKeys.has(key)||equippedKeys.has(key)||seen.has(key)||kept.length>=5){
    issues.push({kind:'skill',name,reason:!key?'nome a conferir':nativeKeys.has(key)?'já é nativa':equippedKeys.has(key)?'já informada como equipada':'repetida ou acima do limite'});continue;
   }
   seen.add(key);const detail=review.skills.find(s=>S.keyFor(s.name)===key);
   kept.push(detail||{name:S.SKILLS[key].name,reason:'Escolhida por você nesta ficha salva; não é equipamento confirmado.',
    situation:'Confira sua execução nesta função.',trainingRelation:'Benefício numérico não medido.',
    nativeRelation:'Não consta nas nativas nem nas adicionais informadas.',applyAuthorized:false});
  }
  review.skills=kept;
 }
 const boostKey=value=>B.boosterName(value)||String(value||'').toLowerCase().trim();
 const fixed=boostKey(card.fixedBooster),equipped=boostKey(card.booster);
 review.boosters=review.boosters.filter(b=>boostKey(b.technicalName)!==fixed&&boostKey(b.technicalName)!==equipped);
 if(own(selection,'booster')){
  const name=selection.booster,key=boostKey(name);
  if(!name)review.boosters=[];
  else if(card.boosterSlot==='ausente'||key===fixed||key===equipped){
   issues.push({kind:'booster',name,reason:card.boosterSlot==='ausente'?'sem slot adicional':key===fixed?'mesmo ímpeto fixo':'já informado como equipado'});review.boosters=[];
  }else{
   const detail=review.boosters.find(b=>boostKey(b.technicalName)===key);
   review.boosters=detail?[detail]:[{name:B.displayName?.(name)||name,technicalName:name,attributes:[],
    reason:'Escolhido por você nesta ficha salva; compatibilidade e benefício ainda precisam ser conferidos.',applyAuthorized:false}];
  }
 }
 if(card.boosterSlot==='ausente')review.boosters=[];
 if(editorial)batch.decorate(review,editorial,card,S,B);
 // O contrato de gravação recebe exatamente as escolhas mostradas, inclusive vazias.
 result.suggestedSkills=review.skills.map(s=>({name:s.name}));
 result.booster={...result.booster,primary:review.boosters[0]?{nome:review.boosters[0].technicalName}:null};
 if(exactReference&&reference.reference.baseStats)review.baseReference='Base da edição disponível em referência pública; treino e atributos finais da conta a conferir';
 if(!editorial)review.sourceLabel={profile:'Treino salvo neste técnico',revision:'Revisão salva deste contexto',proposal:'Treino recomendado para esta função'}[review.sourceKind];
 if(issues.length)review.canSave=false;
 review.pending=[...(!outcome.identityFormatValid?['edição']:[]),
  ...(nativeSource==='pending'?['habilidades nativas']:[]),
  ...(!Number.isInteger(budget)?['nível e PP']:[]),
  ...(!review.eligibleForLineup?['familiaridade da posição']:[]),
  ...(issues.length?['escolhas salvas']:[])];
 review.nativeSource=nativeSource;review.issues=issues;review.managerLabel=selection.managerLabel||'';
 return {review,source:review.sourceKind,nativeSource,issues,result};
}
function text(review){
 const F=host?.CRAQUE_FRIEND_TRAINING_V228||(typeof module==='object'?require('./craque-friends-training-v228.js'):null);
 return F.functionSheetText(review).replace('TREINO PROPOSTO',review.sourceLabel||'TREINO DA FICHA');
}
return Object.freeze({resolve,cardFromModel,text});
});
