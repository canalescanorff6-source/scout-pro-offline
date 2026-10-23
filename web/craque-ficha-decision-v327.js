/* Craque Tático V327 — decisão explicável e comparação segura de cinco estilos.
 * Contrato: leitura pura. NUNCA aplica treino, escolhe tática pelo usuário,
 * inventa validade competitiva ou altera builds/histórico.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_FICHA_DECISION_V327=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const MODES=Object.freeze(['posse','normal','rapido','fora','longo']);
 const LABEL=Object.freeze({
  posse:'Posse de Bola',normal:'Contra-Ataque Normal',
  rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Bola Longa'
 });
 const str=v=>typeof v==='string'?v.trim():'';
 function validPlan(plan,tactical){
  if(!plan||plan.status!=='hipotese'||!Number.isInteger(plan.pp)||
    plan.pp<0||plan.pp>300||!Array.isArray(plan.levels)||!tactical?.valid?.(plan.levels))return false;
  return tactical.total(plan.levels)===plan.pp;
 }
 function validateLevels(levels,plan,tactical){
  return validPlan(plan,tactical)&&Array.isArray(levels)&&
   tactical.valid(levels)&&tactical.total(levels)===plan.pp;
 }
 // Rascunhos V324 podem economizar PP. Custo menor que o orçamento NÃO
 // significa erro nem autoriza substituir a distribuição salva pela proposta.
 function validDraft(levels,plan,tactical){
  if(!validPlan(plan,tactical)||!Array.isArray(levels)||!tactical.valid(levels))return false;
  const used=tactical.total(levels);
  return Number.isInteger(used)&&used>=0&&used<=plan.pp;
 }
 function resolve(scenario,model,tactical,revision=null,profile=null){
  if(!scenario?.outcome?.plan||!model||!MODES.includes(scenario.style))
   throw Error('Cenário de estilo inexistente');
  const plan=scenario.outcome.plan;
  const calculated=validPlan(plan,tactical);
  const compatible=scenario.compatibility?.eligible===true;
  const hasManager=Boolean(scenario.manager&&scenario.manager!=='sem-tecnico'&&
   scenario.managerProfile?.name);
  const history=revision&&!revision.stale&&revision.revision||null;
  const savedProfile=Boolean(profile&&validDraft(profile.train,plan,tactical));
  const savedScenario=Boolean(history&&validateLevels(history.levels,plan,tactical));
  // Uma revisão V311 aprovada NÃO homologa outro vetor de PP que foi
  // salvo depois na ficha independente V324. Só expor aprovação quando
  // o vetor efetivamente exibido for idêntico ao aprovado.
  const sameApproved= !savedProfile||(
   savedScenario&&profile.train.every((level,i)=>level===history.levels[i]));
  const approved=Boolean(history?.approved===true&&savedScenario&&sameApproved);
  // A ficha independente é o rascunho mais específico; é também consultiva.
  const levels=savedProfile?profile.train.slice():
   savedScenario?history.levels.slice():
   calculated?plan.levels.slice():null;
  const usedPP=levels?tactical.total(levels):null;
  const remainingPP=usedPP===null?null:plan.pp-usedPP;
  const source=savedProfile?'rascunho_independente':
   savedScenario?'revisao_posicional':calculated?'simulacao':'pendente';
  const kind=!calculated?'pendente':
   approved?'aprovacao_registrada':
   savedProfile?'rascunho_salvo':
   savedScenario?'revisao_salva':'proposta_calculada';
  const title={
   pendente:'Ficha pendente: confira os dados',
   aprovacao_registrada:'Aprovação registrada no histórico',
   rascunho_salvo:'Sua ficha salva para este técnico',
   revisao_salva:'Revisão desta posição e estilo',
   proposta_calculada:'Proposta contextual para avaliar'
  }[kind];
  const what=[];
  what.push('Estilo '+LABEL[scenario.style]+' escolhido para esta análise; nenhum estilo é declarado superior automaticamente.');
  what.push('Posição '+scenario.position+(compatible?' documentada nesta ficha.':
    ' com familiaridade ainda não comprovada.'));
  what.push(hasManager?'Técnico catalogado: '+scenario.managerProfile.name+
   '; bônus não são PP.':'Técnico ou edição ainda não confirmados para esta ficha.');
  if(calculated)what.push(plan.pp+' PP conferidos matematicamente; desempenho e atributos finais não comprovados.');
  else what.push('Distribuição sem PP matematicamente válidos: nenhum treino deve ser recomendado.');
  if(approved)what.push('Aprovação é um registro anterior do usuário, não prova automática de equipamento no jogo.');
  if(savedProfile)what.push('Rascunho do técnico preservado, sem substituir a build original.');
  if(savedProfile&&remainingPP>0)what.push(usedPP+' de '+plan.pp+
   ' PP utilizados; '+remainingPP+' PP continuam livres neste rascunho.');
  return Object.freeze({
   kind,title,source,style:scenario.style,styleLabel:LABEL[scenario.style],
   collection:model.collection,owner:model.owner,cardKey:model.cardKey,
   cardId:model.cardId,edition:model.edition,
   position:scenario.position,manager:scenario.manager,
   pp:calculated?plan.pp:null,usedPP,remainingPP,
   levels:levels?Object.freeze(levels):null,
   calculated,compatible,hasManager,approved,
   isSaved:savedProfile||savedScenario,what:Object.freeze(what),
   confidence:!calculated?'pendente':!compatible||!hasManager?
    'simulacao_com_pendencias':'proposta_contextual_sem_gameplay',
   note:'As cinco alternativas representam estilos diferentes, não um ranking de força. Mudá-las não equipa nem homologa builds.'
  });
 }
 // V335: o rascunho independente define a SELEÇÃO exibida, inclusive
 // quando o usuário deliberadamente deixou habilidades/ímpeto vazios.
 // Sugestões calculadas nunca substituem silenciosamente uma seleção vazia.
 function equipmentSummary(profile,suggestedSkills=[],suggestedBooster=null){
  const hasDraft=Boolean(profile && typeof profile==='object');
  const names=hasDraft?(Array.isArray(profile.skills)?profile.skills:[]):suggestedSkills;
  const skills=Array.isArray(names)?names.map(item=>
   str(typeof item==='string'?item:item?.name||item?.nome)).filter(Boolean).slice(0,5):[];
  const booster=hasDraft?str(profile.booster):str(suggestedBooster);
  const origin=hasDraft?'rascunho_independente':'proposta_contextual';
  return Object.freeze({
   origin,hasDraft,skills:Object.freeze(skills),booster:booster||null,
   skillsLabel:hasDraft?skills.length+' selecionadas no rascunho':
    skills.length?skills.length+' candidatas a avaliar':'Nenhuma candidata documentada',
   boosterLabel:hasDraft?(booster?'Selecionado no rascunho':'Nenhum selecionado'):
    (booster?'Sugestão disponível':'Pendente'),
   note:hasDraft?'Seleção salva neste contexto; não comprova equipamento no eFootball.':
    'Sugestões calculadas para avaliar; nada foi salvo nem equipado.'
  });
 }
 // V336: explicações só reutilizam os motivos devolvidos pelo motor para
 // ESTA posição, estilo, técnico e Card ID. Não são provas de gameplay.
 const canonicalName=v=>str(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLocaleLowerCase('pt-BR').replace(/\s+/g,' ');
 function explainEquipment(summary,recommendations=[],boosterRanking=null){
  if(!summary||!Array.isArray(summary.skills)||typeof summary.hasDraft!=='boolean')
   throw Error('Resumo contextual de habilidades indisponível');
  const candidates=Array.isArray(recommendations)?recommendations:[];
  const skillRows=summary.skills.map(name=>{
   const candidate=candidates.find(item=>
    canonicalName(typeof item==='string'?item:item?.name||item?.nome)===canonicalName(name));
   const reason=str(candidate?.why||candidate?.motivo);
   const synergies=Array.isArray(candidate?.synergies)?
    candidate.synergies.filter(x=>typeof x==='string'&&x.trim()).slice(0,5):[];
   return Object.freeze({
    name,reason:reason||'Sem justificativa individual registrada nesta análise.',
    synergies:Object.freeze(synergies.slice()),
    status:reason?'racional_do_motor':'motivo_pendente',
    source:reason?'Proposta contextual calculada, não prova de partida':
      'Seleção mantida sem motivo calculado para este contexto'
   });
  });
  const boosterName=summary.booster;
  const pool=[];
  if(boosterRanking?.primary)pool.push(boosterRanking.primary);
  if(Array.isArray(boosterRanking?.alternatives))pool.push(...boosterRanking.alternatives);
  const candidate=boosterName?pool.find(item=>
   canonicalName(item?.name||item?.nome)===canonicalName(boosterName)):null;
  const boosterReason=str(candidate?.reason||candidate?.motivo);
  const booster=Object.freeze({
   name:boosterName||null,
   reason:boosterName?(boosterReason||'Sem justificativa individual registrada para este ímpeto.') :
    (summary.hasDraft?'Nenhum ímpeto adicional selecionado no rascunho.':'Ímpeto candidato pendente.'),
   status:!boosterName?'sem_selecao':boosterReason?'racional_do_motor':'motivo_pendente',
   source:boosterReason?'Ranking consultivo deste cenário, não prova de slot liberado':
     'Nenhuma comprovação de ímpeto ou slot foi inferida'
  });
  return Object.freeze({
   mode:summary.origin,
   skills:Object.freeze(skillRows),
   booster,
   warning:'São justificativas consultivas do cenário em análise, não validação em gameplay. '+
    'A edição exata, as habilidades nativas, os slots reais e o equipamento no jogo '+
    'precisam de confirmação independente.'
  });
 }
 // V337: custo marginal de PP, sem inferir aumento de atributos reais.
 function diff(base,alternative,categoryNames=[],tactical=null){
  if(!base?.levels||!alternative?.levels||base.pp!==alternative.pp)return [];
  const canCost=typeof tactical?.ppCost==='function'&&
   typeof tactical?.valid==='function'&&
   tactical.valid(base.levels)&&tactical.valid(alternative.levels);
  return base.levels.flatMap((level,i)=>{
   const after=alternative.levels[i],delta=after-level;
   if(!delta)return [];
   const beforePP=canCost?tactical.ppCost(level):null;
   const afterPP=canCost?tactical.ppCost(after):null;
   return [Object.freeze({
    name:str(categoryNames[i])||'Grupo '+(i+1),
    from:level,to:after,delta,
    beforePP,afterPP,deltaPP:canCost?afterPP-beforePP:null
   })];
  });
 }
 function compare(selected,candidates,categories,tactical=null){
  if(!selected||!MODES.includes(selected.style)||!Array.isArray(candidates))
   throw Error('Comparação sem ficha selecionada');
  const byStyle=new Map();
  for(const c of candidates){
   if(!c||!MODES.includes(c.style)||byStyle.has(c.style))
    throw Error('Alternativas repetidas ou inválidas');
   if(c.position!==selected.position||c.manager!==selected.manager||
     c.collection!==selected.collection||c.owner!==selected.owner||
     c.cardKey!==selected.cardKey||c.cardId!==selected.cardId||
     c.edition!==selected.edition)
    throw Error('Comparação exige a mesma carta, proprietário, edição, posição e técnico');
   byStyle.set(c.style,c);
  }
  if(byStyle.size!==5||MODES.some(id=>!byStyle.has(id)))
   throw Error('São necessárias as cinco hipóteses do mesmo contexto');
  // A posição do estilo atual é explícita; não produzir "campeão" genérico.
  const rows=MODES.map(id=>{
   const item=byStyle.get(id),selectedStyle=id===selected.style;
   const changes=diff(selected,item,categories,tactical);
   const costReady=Boolean(typeof tactical?.total==='function'&&
    typeof tactical?.valid==='function'&&
    tactical.valid(selected.levels)&&tactical.valid(item.levels)&&
    selected.pp===item.pp&&Number.isInteger(item.pp));
   const usedPP=costReady?tactical.total(item.levels):null;
   const referenceUsedPP=costReady?tactical.total(selected.levels):null;
   const addedPP=costReady?changes.reduce((n,c)=>n+Math.max(0,c.deltaPP),0):null;
   const removedPP=costReady?changes.reduce((n,c)=>n+Math.max(0,-c.deltaPP),0):null;
   const major=changes.slice().sort((a,b)=>
    Math.abs(b.deltaPP??b.delta)-Math.abs(a.deltaPP??a.delta)||
    a.name.localeCompare(b.name,'pt-BR')).slice(0,3);
   return Object.freeze({
    style:id,label:LABEL[id],selected:selectedStyle,
    title:item.title,kind:item.kind,source:item.source,pp:item.pp,
    usedPP,remainingPP:costReady?item.pp-usedPP:null,
    referenceUsedPP,addedPP,removedPP,
    redistributedPP:costReady?Math.min(addedPP,removedPP):null,
    netDeltaPP:costReady?usedPP-referenceUsedPP:null,
    costBasis:costReady?'custo_progressivo_exato':'indisponivel',
    sameTraining:Boolean(selected.levels&&item.levels&&changes.length===0&&
     selected.pp===item.pp),
    changes:Object.freeze(changes),major:Object.freeze(major),
    hasPlan:Boolean(item.levels),
    approved:item.approved,
    // A qualidade de uma distribuição não é inferível só de PP totais.
    description:!item.levels?'PP/edição pendentes':
     selectedStyle?'Estilo atualmente selecionado':
     !selected.levels?'Sem referência numérica para comparar':
     changes.length?'Distribuição diferente, sem superioridade comprovada':
     'Mesma distribuição matemática no contexto'
   });
  });
  return Object.freeze({
   selectedStyle:selected.style,
   rows:Object.freeze(rows),
   statement:'Não existe evidência suficiente para eleger uma melhor ficha universal. '+
    'Os custos de PP seguem a curva progressiva de treinamento e NÃO indicam '+
    'ganhos em atributos finais nem superioridade em gameplay. Compare as diferenças '+
    'da mesma edição, posição e técnico, sem trocar builds aprovadas automaticamente.'
  });
 }
 return Object.freeze({MODES,LABEL,validPlan,validateLevels,validDraft,resolve,equipmentSummary,explainEquipment,diff,compare});
});
