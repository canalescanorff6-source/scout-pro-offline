/* V376: leitura do treino pessoal. Propostas V311/V324/V374 não são treino aplicado. */
(function(host,factory){'use strict';const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_RATING_CONTEXT_V376=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const PREFIX='scoutpro:v376:current-training:';
const trainingKey=(ref,id=ref.cardId||ref.candidateId||'')=>PREFIX+ref.key+':'+String(id);
const valid=v=>Array.isArray(v)&&v.length===10&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
const cost=v=>v.reduce((sum,n)=>{for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);return sum},0);
const get=(store,key)=>{const raw=store.getItem(key);return raw?JSON.parse(raw):null};
function saveTraining(ref,store,levels,budget,confirmed,resolvedCardId=ref.cardId||ref.candidateId||''){
 if(!confirmed||!valid(levels)||!Number.isInteger(budget)||budget<0||cost(levels)>budget)
  throw Error('Confirme a distribuição atual no jogo, sem exceder os PP.');
 const go=ref.position==='GO',allowed=go?[4,5,7,8,9]:[0,1,2,3,4,5,6];
 if(levels.some((n,i)=>n&&!allowed.includes(i)))throw Error('Categorias incompatíveis com a carta.');
 store.setItem(trainingKey(ref,resolvedCardId),JSON.stringify({schema:'CRAQUE_CURRENT_TRAINING_V376',cardKey:ref.key,
  cardId:String(resolvedCardId),budget,levels:levels.slice(),confirmedByOwner:true,updatedAt:new Date().toISOString()}));
}
function resolve(ref,card,store,options={}){
 const R=options.rating||host?.CRAQUE_RATING_V376||(typeof module==='object'?require('./craque-rating-v376.js'):null);
 const owned=ref.capture===null;
 const Review=host?.CRAQUE_CARD_REVIEW_V379||(typeof module==='object'?require('./craque-card-review-v379.js'):null);
 const descriptor=Review?.catalog(owned?[]:[card],owned?[card]:[])[0];
 const reviewed=descriptor?Review.read(store,descriptor,true):null;
 const identityChanged=Boolean(reviewed&&((reviewed.cardId&&reviewed.cardId!==descriptor.cardId)||(reviewed.edition&&reviewed.edition!==descriptor.edition)));
 const ctx={cardKey:ref.key,cardId:ref.cardId||ref.candidateId||'',edition:ref.edition,
  position:options.position||ref.position,training:null,budget:ref.cataloguePP,manager:null,extraBooster:null};
 let source='Treino atual pendente',warning='',maxLevel=ref.registeredMaxLevel||
  (ref.identityUsable?ref.reference?.maxLevel:null)||null;
 try{
  if(owned){
   const manual=get(store,'scoutpro:v364:owned-confirmed')||{},m=R.ownedMetadata(card,manual[card.key],ref);
   ctx.budget=m.level===null?null:2*(m.level-1);maxLevel=m.level;
   ctx.cardId=m.cardId||ctx.cardId;
   const equipment=(get(store,'scoutpro:v364:owned-equipment')||{})[card.key];
   if(equipment?.confirmedByOwner&&equipment.slot==='ocupado'&&equipment.booster)
    ctx.extraBooster={name:equipment.booster,confirmed:true};
  }else{
   const Progress=options.progress||host?.CRAQUE_PROGRESS_CONSISTENCY_V249||
    (typeof module==='object'?require('./craque-progress-consistency-v249.js'):null);
   const proof=Progress?.localReview(card,store);
   if(proof){ctx.budget=proof.pp;maxLevel=proof.level;}
   if(options.positional?.fromPersonal){
    const m=options.positional.fromPersonal(card,null,store);
    if(m.boosterSlot==='ocupado'&&m.booster)ctx.extraBooster={name:m.booster,confirmed:true};
   }
  }
  if(reviewed){
   if(identityChanged){ctx.cardId=reviewed.cardId||'';ctx.edition=reviewed.edition||'';ctx.budget=null;maxLevel=null;ctx.extraBooster=null;}
   if(reviewed.cardId)ctx.cardId=reviewed.cardId;if(reviewed.edition)ctx.edition=reviewed.edition;
   if(reviewed.pp!==null)ctx.budget=reviewed.pp;if(reviewed.maxLevel!==null)maxLevel=reviewed.maxLevel;
   if(reviewed.equipmentReviewed)ctx.extraBooster=reviewed.extraSlot==='ocupado'?{name:reviewed.extraBooster,confirmed:true}:null;
  }
  const info=descriptor?Review?.infoRead(store,descriptor):null;
  if(info){
   ctx.budget=info.pp;maxLevel=info.maxLevel;
   if(!info.mathOk){ctx.budget=null;throw Error('Nível máximo e PP incompatíveis; corrija as informações da carta. Treino preservado.');}
  }
  const idKey=ref.cardKey,managerKeys=[
   ...(owned?['scoutpro:v378:owned-manager:'+ref.key]:[]),
   'scoutpro:v307:manager-selection:'+idKey,'craque:v302:manager-selection:'+idKey,
   'scoutpro:v307:default-manager','craque:v302:manager-selection'];
  let selected=null;
  for(const key of managerKeys){const value=get(store,key);if(value){selected=value;break}}
  const style=options.style||selected?.tactic||'posse';
  if(selected?.catalog_id){
   const row=options.managers?.find(selected.catalog_id);
   if(!row)throw Error('Técnico selecionado não encontrado; escolha novamente.');
   ctx.manager={id:row.catalog_id,name:row.nome||row.name||row.tecnico||row.catalog_id,
    proficiency:options.managers.proficiency(row,style),boosters:row.boosters_EN||[]};
  }
  let current=get(store,trainingKey(ref,ctx.cardId));
  if(identityChanged&&(!current?.updatedAt||current.updatedAt<=reviewed.updatedAt))current=null;
  if(reviewed?.training&&(!current||reviewed.updatedAt>=current.updatedAt)){
   ctx.training=reviewed.training.slice();source='Treino conferido por você na revisão da carta';current=null;
  }
  if(!current&&!ctx.training&&!identityChanged){
   const legacy=get(store,PREFIX+ref.key);
   if(legacy&&legacy.cardId===ctx.cardId)current=legacy;
   else if(legacy)warning='Treino da identidade anterior preservado no histórico; confira o treino desta edição.';
  }
  if(current){
   if(current.schema!=='CRAQUE_CURRENT_TRAINING_V376'||current.cardKey!==ref.key||
    current.cardId!==ctx.cardId||(!info&&current.budget!==ctx.budget)||!current.confirmedByOwner||
    !valid(current.levels)||cost(current.levels)>ctx.budget)
    throw Error('Treino confirmado incompatível com a edição ou PP atuais; registro preservado.');
   ctx.training=current.levels.slice();source='Treino confirmado por você';
  }else if(ref.labKey&&!ctx.training&&!identityChanged){
   const lab=get(store,ref.labKey);
   if(lab){
    if(!valid(lab.train)||cost(lab.train)>ctx.budget)throw Error('Treino pessoal ilegível ou acima dos PP; registro preservado.');
    if(lab.source){ctx.training=lab.train.slice();source='Treino pessoal salvo';warning='Confira se este treino já foi aplicado no jogo.';}
   }
  }
  if(!ctx.training&&!identityChanged&&Array.isArray(ref.registeredLevels)){
   ctx.training=ref.registeredLevels.slice();source='Treino cadastrado';
   warning='Distribuição do cadastro; confirme se corresponde ao treino atual no jogo.';
  }
  return {ctx,source,warning,maxLevel,error:null};
 }catch(e){ctx.training=null;return {ctx,source,warning,maxLevel,error:String(e.message||e)}}
}
return Object.freeze({PREFIX,trainingKey,valid,cost,saveTraining,resolve});
});
