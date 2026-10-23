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
 function resolve(scenario,model,tactical,revision=null,profile=null){
  if(!scenario?.outcome?.plan||!model||!MODES.includes(scenario.style))
   throw Error('Cenário de estilo inexistente');
  const plan=scenario.outcome.plan;
  const calculated=validPlan(plan,tactical);
  const compatible=scenario.compatibility?.eligible===true;
  const hasManager=Boolean(scenario.manager&&scenario.manager!=='sem-tecnico'&&
   scenario.managerProfile?.name);
  const history=revision&&!revision.stale&&revision.revision||null;
  const savedProfile=Boolean(profile&&validateLevels(profile.train,plan,tactical));
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
  return Object.freeze({
   kind,title,source,style:scenario.style,styleLabel:LABEL[scenario.style],
   collection:model.collection,owner:model.owner,cardKey:model.cardKey,
   cardId:model.cardId,edition:model.edition,
   position:scenario.position,manager:scenario.manager,
   pp:calculated?plan.pp:null,levels:levels?Object.freeze(levels):null,
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
 function diff(base,alternative,categoryNames=[]){
  if(!base?.levels||!alternative?.levels||base.pp!==alternative.pp)return [];
  return base.levels.flatMap((level,i)=>{
   const difference=alternative.levels[i]-level;
   return difference?[Object.freeze({
    name:str(categoryNames[i])||'Grupo '+(i+1),
    from:level,to:alternative.levels[i],delta:difference
   })]:[];
  });
 }
 function compare(selected,candidates,categories){
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
   const changes=diff(selected,item,categories);
   const major=changes.slice().sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||
    a.name.localeCompare(b.name,'pt-BR')).slice(0,3);
   return Object.freeze({
    style:id,label:LABEL[id],selected:selectedStyle,
    title:item.title,kind:item.kind,source:item.source,pp:item.pp,
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
    'Compare as diferenças e mantenha a que corresponde ao técnico, posição e tática usados.'
  });
 }
 return Object.freeze({MODES,LABEL,validPlan,validateLevels,resolve,equipmentSummary,diff,compare});
});
