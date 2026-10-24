/* Craque Tático V339 — ponte SOMENTE LEITURA V324 ↔ V251 ↔ V311.
 * Mesma carta, proprietário, Card ID, edição, técnico, posição e estilo.
 * Não grava PP, não homologa builds e não infere atributos de gameplay.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_FRONTIER_CONTEXT_V339=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const get=(name,path)=>host?.[name]||
 (typeof module==='object'&&module.exports?require(path):null);
const result=(status,reason,extra={})=>Object.freeze({status,reason,...extra});
function compare(store,model,scenario,dependencies={}){
 const profiles=dependencies.profiles||get('CRAQUE_MANAGER_FICHAS_V324','./craque-manager-fichas-v324.js');
 const tactical=dependencies.tactical||get('SCOUT_TACTICS_V220','./scout-multitactic-engine-v220.js');
 const frontier=dependencies.frontier||get('CRAQUE_FICHA_INDIVIDUAL_V251','./craque-ficha-individual-v251.js');
 if(!profiles?.fromScenario||!profiles?.read||!tactical?.strategy||!frontier?.trainingFrontier)
  return result('PENDENTE','Motores de análise ainda indisponíveis; a ficha existente permanece preservada.');
 if(!model||!scenario||!['minhas-246','outros-elencos'].includes(model.collection)||
   !model.owner||!model.cardKey||!model.cardId||!model.edition)
  return result('PENDENTE','Identidade da carta e do proprietário incompleta.');
 if(!/^\d+$/.test(String(model.cardId))||/pendente/i.test(String(model.edition)))
  return result('PENDENTE','Card ID ou edição pendentes: confirme a versão exata antes de comparar.');
 if(scenario.compatibility?.eligible!==true)
  return result('PENDENTE','Familiaridade nesta posição não comprovada: não comparar distribuições de uso.');
 if(scenario.outcome?.plan?.status!=='hipotese')
  return result('PENDENTE','PP da edição ou hipótese contextual ainda pendentes.');
 let context,profile;
 try{
  context=profiles.fromScenario(scenario,model);
  // Leitura falha em caso de revisão corrompida, sem substituí-la.
  profile=profiles.read(store,context);
 }catch(e){return result('PENDENTE','Rascunho ou contexto indisponível: '+String(e.message||e)+
  '. Nenhum dado foi sobrescrito.')}
 const plan=scenario.outcome.plan;
 if(!Number.isInteger(plan.pp)||plan.pp!==context.budget||
    !tactical.valid(plan.levels)||tactical.total(plan.levels)!==plan.pp)
  return result('PENDENTE','Distribuição matemática do cenário divergente dos PP da edição.');
 if(profile&&!profiles.validTraining(profile.train,context.budget))
  return result('PENDENTE','Rascunho independente incompatível com o orçamento; histórico preservado.');
 const source=profile?'rascunho_independente':'proposta_contextual';
 const baseline=profile?profile.train.slice():plan.levels.slice();
 const role=tactical.roleOf({shown_position:context.position});
 if(!role||!Object.hasOwn(tactical.BASE,role))
  return result('PENDENTE','Função sem categorias de treinamento compatíveis.');
 const allowed=role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
 if(baseline.some((n,i)=>n>0&&!allowed.includes(i)))
  return result('PENDENTE','PP registrados em categorias incompatíveis com a posição de uso.');
 const card={
  shown_position:context.position,
  estilo_ataque:model.style,
  habilidades_nativas:model.nativeSkills,
  impeto_fixo:model.fixedBooster
 };
 const strategy=tactical.strategy(card,context.style);
 const comparison=frontier.trainingFrontier(strategy.weights,role,context.budget,baseline,
  profile?{baselineSource:'rascunho_independente'}:{baselineProvisional:true});
 if(comparison.status!=='ESTIMADO')return result('PENDENTE',comparison.reason||
  'Sem dados suficientes para calcular alternativas.');
 const initial=profile?
  comparison.candidates.find(x=>x.registered)?.id||comparison.primaryId:comparison.primaryId;
 return result('CONSULTIVO',null,{
  identity:Object.freeze({collection:context.collection,owner:context.owner,
   cardKey:context.cardKey,cardId:context.cardId,edition:context.edition,
   manager:context.manager,position:context.position,style:context.style}),
  source,revision:profile?.revision??null,
  saved:Boolean(profile),budget:context.budget,role,
  referenceSpent:comparison.referenceSpent,
  referenceRemainingPP:comparison.referenceRemainingPP,
  comparison,initial,mayApply:false,gameplayValidated:false,
  warning:'Índices relativos de INVESTIMENTO, não atributos finais ou gameplay. '+
   'Nenhuma alternativa modifica rascunhos, habilidades ou ímpetos equipados.'
 });
}
return Object.freeze({compare});
});
