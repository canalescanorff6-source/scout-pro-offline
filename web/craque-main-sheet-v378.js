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
 equipmentRecord:m.equipmentRecord||null,trainingLevels:m.trainingLevels,progressReview:m.evidenceCard?.nivel_referencia||null,
 baseReference:m.evidenceCard?.base_stats_known===true};}
function repetitionAudit(card,result,selection){
 const audit=selection.audit??host?.CRAQUE_TRAINING_REPETITIONS_V389;
 const plan=result.plan;
 if(audit?.schema!=='CRAQUE_TRAINING_REPETITIONS_V389'||audit.managerId!==(selection.managerId||card.managerId)||
    !plan.analysis||!plan.levels||own(selection,'levels'))return null;
 const match=audit.entries?.[card.localKey+'|'+result.tactic];
 if(!match||match.cardId!==String(card.cardId??'')||match.edition!==card.edition||
    match.position!==card.position||match.pp!==plan.pp||match.evidenceSignature!==plan.analysis.evidenceSignature||
    JSON.stringify(match.levels)!==JSON.stringify(plan.levels))return null;
 return {documentedPairs:match.documentedPairs,pendingPairs:match.pendingPairs};
}
// Comparações editoriais com orçamento igual e ações observáveis em PvP.
// Cada par pertence à edição, posição e proposta que foram analisadas.
const matchTrials={
 '183@105812156521859|rapido':{
  position:'CA',sha:'b21eaea0bd3ec58990b465ed460b5843851ec4e4f8325643e8f8a3d4205283d0',
  current:[8,5,6,8,8,8,0,0,0,0],alternative:[8,5,6,10,8,5,0,0,0,0],
  task:'Atacar o espaço nas costas da defesa',
  measure:'Conte quantos passes em profundidade ele alcança com vantagem e quantas disputas de corpo perde.',
  attributes:{acceleration:'Aceleração',offensive_awareness:'Talento ofensivo',balance:'Equilíbrio',physical_contact:'Contato físico'},
  source:'https://efhub.com/articles/261017_4-acceleration-thresholds-decoded'
 },
 '109@105858864355084|normal':{
  position:'VOL',sha:'79c042dd85b369632a34394d8828258daeab3fb44f4f5e72a62cee058ca09473',
  current:[2,8,5,6,8,8,8,0,0,0],alternative:[2,8,5,8,8,6,8,0,0,0],
  task:'Girar e soltar o primeiro passe após recuperar',
  measure:'Conte as saídas com passe completado sob pressão e as perdas no contato antes de tocar.',
  attributes:{low_pass:'Passe rasteiro',acceleration:'Aceleração',balance:'Equilíbrio',physical_contact:'Contato físico'},
  source:'https://efhub.com/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed'
 },
 '191@105850811319718|fora':{
  position:'PTE',sha:'fdc69410cf15c0a9fe244e80da4eaafc4554bef34689427dc5c4c18616781f56',
  current:[7,8,8,8,8,4,4,0,0,0],alternative:[4,8,10,8,8,4,4,0,0,0],
  task:'Avançar pelo corredor e servir a área',
  measure:'Conte quantas vezes supera o lateral e cria um passe útil. Compare também as finalizações quando corta para dentro.',
  attributes:{ball_control:'Controle de bola',dribbling:'Drible',tight_possession:'Condução firme',finishing:'Finalização'},
  source:'https://efhub.com/articles/260909_2-major-changes-to-how-dribbling-feels'
 },
 '178@105727599353018|longo':{
  position:'CA',sha:'5fb7ee24798842d463447aae006bef3d3aaca11c2cb209de7be92b0874323433',
  current:[8,7,4,7,7,8,2,0,0,0],alternative:[8,5,6,7,7,8,2,0,0,0],
  task:'Dominar a ligação direta e entregar a segunda bola',
  measure:'Conte quantas bolas longas ele domina e quantas consegue devolver a um companheiro sem perder a posse.',
  attributes:{ball_control:'Controle de bola',tight_possession:'Condução firme',physical_contact:'Contato físico',lofted_pass:'Passe alto'},
  source:'https://efhub.com/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed'
 }
};
function matchTrial(card,result,reference,valid,T){
 const trial=matchTrials[card.localKey+'|'+result.tactic],plan=result.plan;
 if(!trial||trial.position!==card.position||trial.sha!==reference?.htmlSha256||
    plan.analysis?.status!=='documentada'||plan.analysis.reference?.htmlSha256!==trial.sha||
    !plan.levels||T.total(trial.current)!==plan.pp)return null;
 const alternative=plan.levels.every((level,index)=>level===trial.alternative[index])?trial.current:trial.alternative;
 if(!valid(alternative)||T.total(alternative)!==plan.pp)return null;
 const rating=host?.CRAQUE_RATING_V376||(typeof module==='object'?require('./craque-rating-v376.js'):null);
 if(!rating)return null;
 const attributes=[];
 for(const [key,label] of Object.entries(trial.attributes)){
  const index=rating.GROUPS.findIndex(group=>group.includes(key)),base=reference.baseStats?.[key];
  if(index<0||!Number.isInteger(base))return null;
  attributes.push({label,current:base+plan.levels[index],alternative:base+alternative[index]});
 }
 return {task:trial.task,measure:trial.measure,source:trial.source,alternative:alternative.slice(),attributes};
}
// Referências literais da publicação, separadas do treino que o app pode aplicar.
const publishedTraining={
 '11@106788187832737':{
  position:'GO',levels:[0,0,0,0,0,0,0,11,10,9],
  stats:{gk_awareness:'Talento de GO',gk_reflexes:'Reflexos do GO',gk_reach:'Alcance do GO',gk_parrying:'Defesa do GO',gk_catching:'Firmeza do GO'},
  booster:'Goleiro +3 (fixo)',
  source:'https://efhub.com/articles/261013_1-this-move-beats-neuer'
 },
 '24@89138556572074':{
  position:'CA',levels:[4,0,9,10,8,8,0,1,0,0],
  stats:{finishing:'Finalização',ball_control:'Controle de bola',acceleration:'Aceleração',heading:'Cabeceio',jumping:'Salto'},
  booster:'Instinto artilheiro +4 (fixo)',
  source:'https://efhub.com/articles/261003_1-top-10-cfs-updated-progression-builds-for-90-proficiency-managers'
 },
 '93@105873896755947':{
  position:'MLE',levels:[7,4,10,9,9,0,0,0,0,0],
  stats:{low_pass:'Passe rasteiro',dribbling:'Drible',offensive_awareness:'Talento ofensivo',acceleration:'Aceleração',speed:'Velocidade'},
  booster:'Movimentação sem bola +1 (adicional)',
  source:'https://efhub.com/articles/261028_2-five-new-sss-tier-cards-featured-ss-rankings-10-28'
 }
};
function publishedComparison(card,vector,budget,reference,T){
 const key=card.localKey;
 const published=Object.hasOwn(publishedTraining,key)&&publishedTraining[key];
 if(!published||!key.endsWith('@'+card.cardId)||card.position!==published.position||
    !vector||T.total(published.levels)!==budget)return null;
 const groups=T.CATEGORIES.flatMap((label,i)=>vector[i]||published.levels[i]?
  [{label,app:vector[i],published:published.levels[i]}]:[]);
 const rating=host?.CRAQUE_RATING_V376||(typeof module==='object'?require('./craque-rating-v376.js'):null);
 const attributes=rating?Object.entries(published.stats).flatMap(([stat,label])=>{
  const base=reference.baseStats?.[stat];
  if(!Number.isInteger(base)||base<0||base>120)return [];
  const projected=levels=>Math.min(99,rating.GROUPS.reduce((sum,group,i)=>sum+(group.includes(stat)?levels[i]:0),base));
  return [{label,app:projected(vector),published:projected(published.levels)}];
 }):[];
 return {position:published.position,levels:published.levels.slice(),booster:published.booster,
  source:published.source,pp:budget,groups,attributes};
}
function resolve(input,outcome,selection={},provided){
 const d=dependencies(provided),F=d.training,S=d.skills,B=d.boosters,T=d.tactical;
 if(!F||!S||!B||!T||!outcome?.plan)throw Error('Motor da ficha indisponível');
 const card={...input},reference=selection.reference??card.reference??F.catalogueReference?.(card);
 const exactReference=reference?.identityUsable===true&&reference.reference&&
  String(card.cardId)===String(reference.reference.cardId)&&
  [reference.edition,reference.reference.edition].includes(card.edition);
 // Some older entry points only load the reference when opening the sheet.
 // Rebuild their proposal for this context before presenting equipment or PP.
 let proposal=outcome.plan,progress=outcome.progress;
 const manual=own(selection,'levels');
 if(!manual&&outcome.tactic!=='posse'&&F.allocate){
  progress=F.resolveBudget(card);
  const budget=progress.pp;
  const context=[card.localKey,card.cardId,card.edition,card.position,outcome.tactic,budget].map(value=>String(value??''));
  const sameContext=JSON.stringify(proposal.analysis?.context)===JSON.stringify(context);
  const sameEvidence=proposal.analysis?.reference?.htmlSha256===(exactReference?reference.reference.htmlSha256:undefined);
  if(!sameContext||!sameEvidence)proposal=F.allocate({...card,reference:exactReference?reference:null},outcome.tactic,d);
 }
 let nativeSource=outcome.nativeDocumented||outcome.skills?.nativeKnown?'catalogue':'pending';
 if(nativeSource==='pending'&&exactReference&&reference.reference.nativeSkills?.length){
  card.nativeSkills=reference.reference.nativeSkills.join('; ');nativeSource='public';
 }
 const batch=host?.CRAQUE_COMPETITIVE_BATCH_V380||
  (typeof module==='object'?require('./craque-competitive-batch-v380.js'):null);
 const editorial=exactReference?batch?.find(card,outcome,selection,S,T):null;
 const rules=host?.CRAQUE_FUNCTIONAL_RULES_V382||(typeof module==='object'?require('./craque-functional-rules-v382.js'):null);
 const role=proposal.role,allowed=rules?.allowed(role,card)||(role==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6]);
 const budget=proposal.pp??progress.pp;
 const levels=manual?selection.levels:proposal.global?proposal.levels:editorial?.levels||proposal.levels;
 const valid=v=>Number.isInteger(budget)&&T.valid(v)&&T.total(v)<=budget&&
  v.every((n,i)=>n===0||allowed.includes(i));
 if(own(selection,'levels')&&!valid(levels))throw Error('PP ou categorias da ficha salva incompatíveis com esta função');
 const usable=proposal.status==='hipotese'&&valid(levels),vector=usable?levels.slice():null;
 const raw={...F.profileOf(card),niveis:vector},existing=String(card.skills||'');
 const confirmed=Boolean(S.checkedEquipment?.(raw,existing,card.equipmentRecord));
 const task=vector&&(manual?selection.analysis?.task:proposal.analysis?.task);
 // A recomendação V394 vale para todos os estilos; manter a avaliação de
 // equipamento calculada sobre o MESMO vetor que aparece na ficha principal.
 const shared=proposal.global&&!manual?F.evaluate({...card,reference:exactReference?reference:null},outcome.tactic,d):null;
 const skills=shared?.skills||S.evaluate(raw,outcome.tactic,existing,{equippedConfirmed:confirmed,equipmentRecord:card.equipmentRecord||null,task});
 const booster=shared?.booster||F.boosterFor(card,raw,outcome.tactic,d,task,exactReference?reference.reference:null);
 const result={...outcome,progress,plan:{...proposal,analysis:manual?selection.analysis||null:editorial?null:proposal.analysis||null,levels:vector,remaining:vector?budget-T.total(vector):null},
  skills,booster,suggestedSkills:skills.recommendations.slice(0,Math.max(0,5-skills.alreadyEquippedProvided)),
  freeSkillSlots:Number.isInteger(skills.slotsRemaining)?skills.slotsRemaining:null};
 const review=F.functionReview(card,result,undefined,{...d});
 if(exactReference&&reference.publicIdentityV393)
  review.publicIdentityReference={capture:reference.capture,kind:'Arte vinculada à edição pública'};
 review.repetitionAudit=repetitionAudit(card,result,selection);
 const trial=!manual&&exactReference&&matchTrial(card,result,reference.reference,valid,T);
 if(trial)review.matchTrial=trial;
 const published=exactReference&&publishedComparison(card,vector,budget,reference.reference,T);
 if(published)review.publishedTraining=published;
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
 if(proposal.global&&!manual)review.globalTraining={
  ...proposal.global,note:'Mudar o estilo não muda os pontos desta ficha proposta. Movimentos coletivos, estilo individual ativo e proficiência do técnico continuam específicos.'
 };
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
 const stackAllowed=name=>rules?.stackingAllowed(card,name,boostKey)===true;
 review.boosters=review.boosters.filter(b=>(boostKey(b.technicalName)!==fixed||stackAllowed(b.technicalName))&&boostKey(b.technicalName)!==equipped);
 if(own(selection,'booster')){
  const name=selection.booster,key=boostKey(name);
  if(!name)review.boosters=[];
  else if(card.boosterSlot==='ausente'||(key===fixed&&!stackAllowed(name))||key===equipped){
   issues.push({kind:'booster',name,reason:card.boosterSlot==='ausente'?'sem slot adicional':key===fixed?'mesmo ímpeto fixo':'já informado como equipado'});review.boosters=[];
  }else{
   const detail=review.boosters.find(b=>boostKey(b.technicalName)===key);
   review.boosters=detail?[detail]:[{name:B.displayName?.(name)||name,technicalName:name,attributes:[],
    reason:'Escolhido por você nesta ficha salva; compatibilidade e benefício ainda precisam ser conferidos.',applyAuthorized:false}];
  }
 }
 if(card.boosterSlot==='ausente')review.boosters=[];
 if(editorial&&!proposal.global)batch.decorate(review,editorial,card,S,B);
 const fixedProgression=exactReference&&reference.reference.type==='Trending'&&
  reference.reference.maxLevel===1&&reference.reference.maxPP===0;
 if(fixedProgression){
  review.fixedProgression=true;review.canSave=false;
  review.note='Edição Trending com progressão fixa: sem distribuição de PP, novas habilidades ou ímpeto selecionável. Histórico preservado.';
  if((selection.skills?.length||selection.booster)||budget!==0)
   issues.push({kind:'eligibility',name:'Progressão fixa',reason:'As escolhas salvas ou PP informados não são aplicáveis a esta edição Trending'});
  if(!own(selection,'skills'))review.skills=[];
  if(!own(selection,'booster'))review.boosters=[];
 }
 // O contrato de gravação recebe exatamente as escolhas mostradas, inclusive vazias.
 result.suggestedSkills=review.skills.map(s=>({name:s.name,why:s.reason}));
 const [primary,...alternatives]=review.boosters.map(item=>({nome:item.technicalName,motivo:item.reason}));
 result.booster={...result.booster,primary:primary||null,alternatives};
 if(exactReference&&reference.reference.baseStats)review.baseReference='Base da edição disponível em referência pública; treino e atributos finais da conta a conferir';
 if(!editorial||proposal.global)review.sourceLabel=proposal.global&&!manual?'Ficha global proposta · todos os seis estilos':
  {profile:'Treino salvo neste técnico',revision:'Revisão salva deste contexto',proposal:'Treino recomendado para esta função'}[review.sourceKind];
 if(issues.length)review.canSave=false;
 review.pending=[...(!outcome.identityFormatValid?['edição']:[]),
  ...(nativeSource==='pending'?['habilidades nativas']:[]),
  ...(!Number.isInteger(budget)?['nível e PP']:[]),
  ...(!review.eligibleForLineup?['familiaridade da posição']:[]),
  ...(issues.length?['escolhas salvas']:[])];
 review.nativeSource=nativeSource;review.issues=issues;review.managerLabel=selection.managerLabel||'';
 const p=card.progressReview;
 if(p?.kind==='revisao_nivel_v381'&&Number.isInteger(p.previous_pp)&&p.previous_pp!==budget)
  review.levelRevision={beforePP:p.previous_pp,afterPP:budget,url:p.url,sourceKind:p.source_kind,confirmedInGame:false};
 return {review,source:review.sourceKind,nativeSource,issues,result};
}
function text(review){
 const F=host?.CRAQUE_FRIEND_TRAINING_V228||(typeof module==='object'?require('./craque-friends-training-v228.js'):null);
 let sheet=F.functionSheetText(review).replace('TREINO PROPOSTO',review.sourceLabel||'TREINO DA FICHA');
 if(review.matchTrial){
  const trial=review.matchTrial;
  sheet+=[ '', '', 'COMPARAR EM PARTIDA · SIMULAÇÃO',trial.task,
   'Variante B · '+review.pp+' PP · '+review.trainingGroups.map(g=>g.category+' '+trial.alternative[g.index]).join(' · '),
   'Projeção antes de bônus · '+trial.attributes.map(a=>a.label+' '+a.current+' → '+a.alternative).join(' · '),
   'Use a mesma posição, técnico, instruções, habilidades e ímpeto com as duas fichas.',trial.measure,trial.source].join('\n');
 }
 if(review.publishedTraining){
  const p=review.publishedTraining;
  sheet+=['','','FICHA PUBLICADA POR AMADEUSZ · '+p.pp+' PP',
   'José Mourinho na publicação · '+p.booster,
   ...p.groups.map(g=>g.label+' · app '+g.app+' / publicação '+g.published),
   ...(p.attributes.length?['Atributos antes dos bônus · '+p.attributes.map(a=>a.label+' '+a.app+' → '+a.published).join(' · ')]:[]),
   p.source].join('\n');
 }
 const analysis=review.individualAnalysis;
 const repeats=review.repetitionAudit;
 return analysis?[sheet,'','MOTIVOS DA FICHA',analysis.reason,
  ...(analysis.task?['Ação · '+analysis.task.label,analysis.task.source,
   ...(analysis.task.defensiveAction?['Sem a bola · '+analysis.task.defensiveAction.label,analysis.task.defensiveAction.source]:[]),
   ...new Set(analysis.task.stats.map(stat=>stat.study).filter(Boolean))]:[]),...analysis.factors.map(f=>f.category+' · '+f.reason),
  ...(repeats?['Coincidências auditadas · '+repeats.documentedPairs+' com análise documentada · '+repeats.pendingPairs+' com dados pendentes']:[]),analysis.reference?.url].filter(x=>x!==undefined).join('\n'):sheet;
}
return Object.freeze({resolve,cardFromModel,text});
});
