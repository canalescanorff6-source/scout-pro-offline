/* V311 · seletor de POSIÇÃO DE USO e ficha compartilhada, sem alterar a carta de origem. */
(function(host){'use strict';
const engine=host.CRAQUE_POSITIONAL_V311;
if(!host.document||!engine)return;
const $=id=>host.document.getElementById(id);
const el=(tag,cl='',value)=>{
 const n=host.document.createElement(tag);if(cl)n.className=cl;
 if(value!==undefined)n.textContent=String(value);return n;
};
const storage=()=>{try{return host.localStorage}catch(_){return null}};
const makeBtn=(value,handler)=>{
 const b=el('button','ct311-button',value);b.type='button';b.addEventListener('click',handler);return b;
};
const displaySkill=x=>x.name||x.nome||'Habilidade não identificada';
function create(target,model,opts={}){
 if(!target||!model)return null;
 const node=el('section','ct311-positional');
 node.setAttribute('aria-label','Inteligência posicional dinâmica · posição de uso');
 const h=el('h2','ct311-heading','Sua ficha, do seu jeito');
 const controls=el('div','ct311-controls');
 const origin=el('div','ct311-origin','Posição original: '+model.position+' · imutável na simulação');
 const label=el('label','ct311-select-label','Usar como: ');
 const select=el('select','ct311-select');select.setAttribute('aria-label','Escolher posição de uso');
 for(const code of engine.POS){const op=el('option','',code);op.value=code;select.append(op)}
 label.append(select);controls.append(origin,label);
 const status=el('p','ct311-status');status.setAttribute('aria-live','polite');
 const details=el('div','ct311-details');
 const actions=el('div','ct311-actions');
 const save=makeBtn('Salvar proposta desta posição / estilo / técnico',()=>{
  try{
   if(!active)throw Error('Nenhuma proposta calculada');
   const r=engine.save(storage(),active);
   viewedRevisions.delete(active.id);
   status.textContent='Proposta salva · revisão '+r.revision+' · '+active.position+' / '+active.style+' / '+active.manager+'. Equipamentos reais preservados.';
   draw();
  }catch(e){status.textContent='Falha ao salvar cenário: '+(e.message||e)}
 });
 const original=makeBtn('Voltar à posição original',()=>{select.value=model.position;positionChange()});
 actions.append(save,original);
 node.append(h,controls,status,details,actions);
 const formationApi=host.CRAQUE_FORMATION_CONTEXT_V314;
 let formationRow=null,formationSelect=null;
 if(formationApi?.ui){
  formationRow=el('div','ct314-formation-row');
  const formationLabel=el('label','ct311-select-label','Simular vaga da formação: ');
  formationSelect=el('select','ct311-select');
  formationSelect.setAttribute('aria-label','Formação para simular, sem alterar titulares');
  for(const [id,label] of [['4312','4-3-1-2'],['4213','4-2-1-3 estreita']]){
   const option=el('option','',label);option.value=id;formationSelect.append(option);
  }
  formationSelect.value=opts.formation||'4312';
  formationLabel.append(formationSelect);
  const slotArea=el('div','ct314-slot-area');let slotControl=null;
  const slotMount=()=>{
   slotControl?.destroy();slotArea.replaceChildren();
   slotControl=formationApi.ui(slotArea,{formation:formationSelect.value,onSelect:position=>{
    select.value=position;positionChange();
   }});
   if(opts.formationSlot&&formationApi.slotPosition(formationSelect.value,opts.formationSlot))
    slotControl.select.value=opts.formationSlot;
  };
  formationSelect.addEventListener('change',()=>{opts.formationSlot=null;slotMount()});
  formationRow.append(formationLabel,slotArea);
  controls.after(formationRow);
  slotMount();
 }
 // V331: posição e formação sob demanda, com o contexto sempre visível.
 // O simples ato de abrir este painel não grava PP, skills nem ímpetos.
 const roleChooser=el('details','ct331-role-chooser');
 const roleHeadline=el('summary','ct331-role-title','Consultar posição e formação');
 const roleDescription=el('p','ct331-role-description',
  'Simule a posição nesta formação; sua carta e a escalação original não mudam.');
 node.insertBefore(roleChooser,controls);
 roleChooser.append(roleHeadline,roleDescription,controls);
 if(formationRow)roleChooser.append(formationRow);
 const roleOverview=el('div','ct331-role-overview');
 const roleCurrent=el('strong','ct331-role-current');
 const roleOriginal=el('span','ct331-role-original','Original: '+model.position+' · preservada');
 const roleButton=el('button','ct331-role-open','Trocar posição ou formação');
 roleButton.type='button';roleButton.setAttribute('aria-expanded','false');
 roleButton.addEventListener('click',()=>{
  roleChooser.open=!roleChooser.open;
  roleButton.setAttribute('aria-expanded',String(roleChooser.open));
  if(roleChooser.open)roleChooser.scrollIntoView?.({block:'nearest'});
 });
 roleChooser.addEventListener('toggle',()=>{
  roleButton.setAttribute('aria-expanded',String(roleChooser.open));
 });
 roleOverview.append(roleCurrent,roleOriginal,roleButton);
 roleChooser.before(roleOverview);
 const updateRoleOverview=()=>{
  const id=formationSelect?.value||'4312';
  roleCurrent.textContent='Em análise: '+select.value+' · '+
   (id==='4213'?'4-2-1-3':'4-3-1-2');
 };
 formationSelect?.addEventListener('change',updateRoleOverview);
 target.append(node);
 let active=null,style=opts.style||'posse',manager=opts.manager||'',alive=true;
 let advancedOpen=false; // Preferência temporária do painel; não altera dados, builds ou armazenamento.
 let alternativesOpen=false; // Cinco estilos consultivos; nenhuma gravação.
 // Uma revisão selecionada é somente leitura e isolada por chave de cenário.
 // Trocar MAT/SA ou estilo não altera qualquer snapshot armazenado.
 const viewedRevisions=new Map();
 function selectedEntry(scenario){
  const all=engine.revisions(storage(),scenario);
  const index=viewedRevisions.get(scenario.id);
  return {all,entry:Number.isInteger(index)&&index>=0&&index<all.length?
   all[index]:all.at(-1)||null};
 }
 const requested=engine.normalize(opts.initialPosition||'');
 const initial=engine.POS.includes(requested)?requested:engine.preferred(storage(),model);
 select.value=initial; if(select.value!==initial)select.value=model.position;
 function renderPlan(out,displaySaved){
  const t=el('section','ct311-panel');
  t.append(el('h3','','Treinamento · '+out.label));
  const p=out.plan;
  if(p.status!=='hipotese'||!p.levels){t.append(el('p','ct311-alert','PENDENTE · '+(p.reason||'PP e posição não documentados')));return t}
  // V336 PP: mostrar consumo real e saldo, inclusive em rascunho subalocado.
  const used=host.SCOUT_TACTICS_V220.total(p.levels);
  const available=Number.isInteger(p.pp)?p.pp:null;
  const rest=Number.isInteger(used)&&available!==null?available-used:null;
  t.append(el('p','ct311-budget',rest===null?
   'Consumo de PP pendente de validação':
   rest>0?(used+' de '+available+' PP distribuídos · saldo '+rest+' · proposta não homologada'):
    (available+' PP exatos distribuídos · saldo 0 · proposta não homologada')));
  const table=el('table','ct311-table'),tr=el('tr');
  for(const head of ['Grupo','Níveis','Custo PP']){const th=el('th','',head);tr.append(th)}
  table.append(tr);
  p.levels.forEach((n,i)=>{
   const r=el('tr');r.append(el('td','',p.categories[i]),el('td','',n),
    el('td','',host.SCOUT_TACTICS_V220.ppCost(n)));table.append(r);
  });
  t.append(table);
  if(displaySaved)t.append(el('p','ct311-note','Distribuição do histórico deste contexto restaurada para consulta; a carta original não foi alterada.'));
  return t;
 }
 function draw(){
  if(!alive)return;
  // V326: o toggle do <details> pode ocorrer após o clique e antes da
  // próxima pintura. Ler o DOM real preserva a abertura ao mudar técnico.
  const before=details.querySelector('.ct326-deep-dive');
  if(before)advancedOpen=before.open;
  details.replaceChildren();
  const health=engine.storageHealth(storage());
  if(!health.ok){
   active=null;save.disabled=true;
   status.textContent='GRAVAÇÃO BLOQUEADA · '+health.reason;
   details.append(el('p','ct311-alert',
    'Histórico local preservado. Não exclua os dados do aplicativo: exporte uma cópia e revise o arquivo antes de corrigir.'));
   return;
  }
  let scenario;
  try{scenario=engine.compute(model,select.value,style,manager)}
  catch(e){status.textContent='Motor indisponível: '+String(e.message||e);active=null;return}
  active=scenario;
  const {all:history,entry:saved}=selectedEntry(scenario);
  const panel=el('div','ct311-scenario');
  if(history.length){
   const historyLabel=el('label','ct311-select-label','Consultar revisão salva (somente leitura):');
   const historySelect=el('select','ct311-select ct318-revision-select');
   historySelect.setAttribute('aria-label','Consultar histórico de revisões independentes desta posição e tática');
   history.forEach((entry,index)=>{
    const rev=entry.revision;
    const label='Revisão '+entry.number+
     (rev?.approved===true?' · aprovação registrada':' · proposta')+
     (entry.stale?' · desatualizada':' · vigente');
    const opt=el('option','',label);opt.value=String(index);historySelect.append(opt);
   });
   const picked=viewedRevisions.get(scenario.id);
   historySelect.value=String(Number.isInteger(picked)&&picked>=0&&picked<history.length?
    picked:history.length-1);
   historySelect.addEventListener('change',()=>{
    viewedRevisions.set(scenario.id,Number(historySelect.value));draw();
   });
   historyLabel.append(historySelect);
   panel.append(historyLabel);
  }
  if(opts.formation&&opts.formationSlot&&engine.normalize(select.value)!==model.position)
   panel.append(el('p','ct311-note','Contexto da vaga '+opts.formationSlot+
    ' na formação '+opts.formation+'. A posição no catálogo não foi modificada.'));
  panel.append(el('h3','','Cenário '+scenario.position+' · '+scenario.style+' · '+scenario.manager));
  const c=scenario.compatibility;
  const compatible=el('p','ct311-compat',
   'Familiaridade: '+c.text+' · Estilo individual: '+scenario.styleActivation);
  compatible.dataset.confidence=c.eligible?'documentado':'pendente';panel.append(compatible);
  const recordedCoach=saved&&!saved.stale?saved.revision.managerProfile:null;
  const coach=recordedCoach||scenario.managerProfile;
  if(coach?.name){
   const summary=el('section','ct311-panel');
   summary.append(el('h3','','Técnico · '+coach.name+' · '+(coach.version||'versão pendente')));
   summary.append(el('p','','Proficiência em '+scenario.style+': '+
    (coach.proficiency===null?'não documentada':coach.proficiency)));
   summary.append(el('p','ct311-note','Bônus catalogados: '+(coach.bonuses.join(' · ')||'não documentados')+
    ' · Jogadas especiais: '+(coach.linkups.join(' · ')||'não documentadas')+
    '. Não são PP e não foram aplicados aos atributos da carta.'));
   panel.append(summary);
  }else if(scenario.manager!=='sem-tecnico'){
   panel.append(el('p','ct311-alert','A versão do técnico '+scenario.manager+
    ' não foi encontrada no catálogo local. Nenhum bônus presumido.'));
  }
  const map=el('details','ct311-positions-map');
  map.append(el('summary','','Mapa de posições · familiaridade documentada'));
  const mapItems=el('ul','ct311-position-list');
  for(const entry of engine.positionMap(model)){
   const row=el('li','',entry.position+' — '+entry.text);
   row.dataset.confidence=entry.eligible?'documentado':'pendente';
   mapItems.append(row);
  }
  map.append(mapItems,el('p','ct311-note','O mapa não usa Overall como prova. Posições alternativas não confirmadas são simulações, não treinamento aplicado.'));
  panel.append(map);
  if(saved){
   const s=saved.revision;
   panel.append(el('p',saved.stale?'ct311-alert':'ct311-confirm',
    'Revisão '+s.revision+' salva ('+s.selectedPosition+' / '+s.style+' / '+s.manager+')'+
    (saved.stale?' · DESATUALIZADA: dados da carta mudaram, preservar a anterior.':
    ' · preservada independentemente das outras posições.')+
    (s.approved===true?' · APROVAÇÃO REGISTRADA (não verificada automaticamente).':'')+
    (s.evidenceImported?' · Histórico importado deste proprietário.':'')+
    (s.provenanceStatus==='revisao_legada_ou_edicao_divergente'?
     ' · IDENTIDADE DOCUMENTAL PENDENTE: proposta histórica preservada, sem revalidação.':'')));
  }
  const outcome=scenario.outcome;
  const recorded=saved&&!saved.stale?saved.revision:null;
  // V336 PP: ler a ficha independente antes de mostrar níveis e saldo.
  const profiles=host.CRAQUE_MANAGER_FICHAS_V324;
  // V345: referenciar o dicionário de aliases V162 já carregado;
  // nunca criar traduções ou equipar automaticamente.
  const skillKeyFor=host.SCOUT_RECOMMENDATIONS_V162?.keyFor||null;
  let profileContext=null,savedProfile=null,readError='';
  if(profiles)try{
   profileContext=profiles.fromScenario(scenario,model);
   savedProfile=profiles.read(storage(),profileContext);
  }catch(e){readError=String(e.message||e)}
  let output=outcome;
  if(recorded&&Array.isArray(recorded.levels)&&outcome.plan.status==='hipotese'){
   output={...outcome,plan:{...outcome.plan,levels:recorded.levels.slice(),pp:recorded.pp,
    remaining:0}};
  }
  if(savedProfile&&profiles?.validTraining(savedProfile.train,outcome.plan.pp)&&
     outcome.plan.status==='hipotese'){
   const used=host.SCOUT_TACTICS_V220.total(savedProfile.train);
   output={...outcome,plan:{...outcome.plan,levels:savedProfile.train.slice(),
    remaining:outcome.plan.pp-used}};
  }
  panel.append(renderPlan(output,Boolean(recorded||savedProfile)));
  const skills=el('section','ct311-panel');skills.append(el('h3','','Até 5 habilidades adicionais · somente recomendações'));
  const list=el('ol','ct311-list');
  // V344: a mesma triagem alimenta painel, resumo Premium e editor.
  const rawRecommendations=recorded?.recommendations||outcome.suggestedSkills||[];
  const ranking=recorded?.boosterRanking||null;
  const candidate=ranking?.primary?.name||recorded?.booster||outcome.booster?.primary?.nome||null;
  const screened=profiles?.screenContextualSuggestions?.(rawRecommendations,
   model.nativeSkills||'',model.skills||'',candidate||'',model.boosterSlot||'pendente',
   skillKeyFor);
  const recommendations=screened?.skills||rawRecommendations;
  const usableCandidate=screened?screened.boosterCandidate:candidate;
  for(const item of recommendations)list.append(el('li','',displaySkill(item)+
   ' — '+(item.why||'prioridade contextual, sem comprovação de equipamento')));
  if(!recommendations.length)list.append(el('li','','Sem candidatos suficientes; conferir habilidades nativas e os slots reais.'));
  if(screened?.excluded.length){
   const dropped=el('details','ct344-evidence-screen');
   dropped.append(el('summary','','Não mostrar como novas candidatas ('+screened.excluded.length+')'));
   const reasons=el('ul','ct311-list');
   for(const item of screened.excluded)reasons.append(el('li','',
    (item.name||'Nome pendente')+' — '+({
     nativa_cadastrada:'consta nas nativas cadastradas desta carta',
     adicional_informada:'consta nas adicionais informadas desta carta',
     repetida_na_proposta:'repetida na lista de propostas',
     nome_pendente:'nome não identificado'
    }[item.reason]||'exige revisão')));
   dropped.append(reasons);skills.append(dropped);
  }
  if(screened?.nativeInventory==='pendente')skills.append(el('p','ct311-note',
   'Nativas desta edição não documentadas: ausência de lista não comprova slot livre.'));
  skills.append(el('p','ct311-note','Habilidades equipadas informadas: '+(model.skills||'não confirmadas')+
   '. Slots livres não são presumidos; até cinco CANDIDATAS são apresentadas para comparação.'+
   ' As sugestões não equipam habilidades nem criam vagas.'));
  skills.append(list);panel.append(skills);
  const booster=el('section','ct311-panel');booster.append(el('h3','','Ímpetos · posição '+scenario.position));
  booster.append(el('p','',screened?.boosterSlot.slot==='ausente'?
   'SEM SLOT ADICIONAL cadastrado nesta edição: '+candidate+
    ' é somente referência teórica, não candidata para esta carta.':
    usableCandidate?'Primeiro candidato: '+usableCandidate+
     ' (não equipado automaticamente)':'Candidato confiável pendente'));
  const alts=ranking?.alternatives||outcome.booster?.alternatives||[];
  if(alts.length)booster.append(el('p','ct311-note',
   (screened?.boosterSlot.slot==='ausente'?'Ranking teórico sem slot cadastrado: ':'Alternativas: ')+
   alts.map(x=>x.name||x.nome).join(' · ')));
  if(ranking?.primary?.reason)booster.append(el('p','ct311-note','Motivo registrado: '+ranking.primary.reason));
  booster.append(el('p','ct311-note','Ímpeto fixo: '+(model.fixedBooster||'não documentado')+
    ' · Slot: '+model.boosterSlot+' · Ímpeto adicional equipado: '+(model.booster||'não informado')+
    '. Ranking consultivo não comprova existência nem liberação de slot.'));
  panel.append(booster);
  // V324: salvar uma ficha consultiva INDEPENDENTE por técnico, edição, posição
  // e estilo. Nenhuma habilidade/ímpeto é marcado como equipado.
  if(profiles){
   const editor=el('section','ct311-panel ct324-profile');
   editor.append(el('h3','','Minha ficha neste técnico · '+scenario.position+' / '+scenario.style));
   if(readError)editor.append(el('p','ct311-alert','Ficha independente indisponível: '+readError+
    '. Nada foi sobrescrito; selecione uma edição comprovada e confira PP.'));
   else{
    const currentPlan=savedProfile?.train||recorded?.levels||outcome.plan.levels;
    const ok=profiles.validTraining(currentPlan,profileContext.budget);
    editor.append(el('p','ct311-note','Contexto isolado: '+scenario.manager+' · '+scenario.position+
     ' · '+scenario.style+' · '+profileContext.budget+' PP. Não copia fichas de outros técnicos.'));
    if(savedProfile)editor.append(el('p','ct311-confirm','Rascunho independente salvo · revisão '+
     savedProfile.revision+' · somente recomendação, não equipamento no eFootball.'));
    if(savedProfile&&ok)editor.append(el('p','ct311-note','PP desta ficha: '+
     savedProfile.train.map((x,i)=>outcome.plan.categories?.[i]+': '+x).join(' · ')));
    // Compartilhar com o painel o filtro documental; não esconder
    // habilidades já SALVAS, que reviewSkillCandidates preservará.
    const proposed=recommendations;
    // V325: os nomes salvos têm prioridade visual mesmo que a recomendação
    // mude. Nunca eliminá-los silenciosamente ao gerar nova revisão.
    const skillRows=profiles.reviewSkillCandidates(savedProfile?.skills||[],proposed,
     model.nativeSkills||'',model.skills||'',skillKeyFor);
    const skillLabel=el('p','ct311-note','Até 5 habilidades adicionais candidatas. '+
     'Itens salvos anteriormente permanecem visíveis e selecionados; desmarque para excluir da nova revisão. '+
     'Slots livres e equipamento real precisam ser confirmados no eFootball.');
    editor.append(skillLabel);
    const candidates=el('div','ct324-skill-options');
    const choices=[];
    for(const entry of skillRows){
     const label=el('label','ct324-skill-option');
     const input=el('input');input.type='checkbox';input.value=entry.name;
     input.checked=entry.saved;
     label.append(input,el('span','',entry.name));
     if(entry.saved)label.append(el('small','ct325-saved-skill','Preservada do histórico'));
     if(entry.conflict)label.append(el('small','ct325-skill-warning',
      'REVISAR: '+entry.conflict+' no cadastro; não remover automaticamente'));
     candidates.append(label);choices.push(input);
    }
    if(!skillRows.length)candidates.append(el('p','ct311-note','Sem candidata documental disponível; preservar campos pendentes.'));
    // Impede seis seleções simultâneas sem ocultar os nomes guardados.
    const enforceFive=()=>{
     const count=choices.filter(x=>x.checked).length;
     for(const input of choices)input.disabled=!input.checked&&count>=5;
    };
    for(const input of choices)input.addEventListener('change',enforceFive);
    enforceFive();
    editor.append(candidates);
    const options=el('label','ct311-select-label','Ímpeto adicional candidato: ');
    const selectBooster=el('select','ct311-select ct324-booster');
    // Sem slot: conservar somente o legado para permitir limpar o candidato.
    const choicesBooster=[...new Set([
     savedProfile?.booster||'',
     ...(screened?.boosterSlot.slot==='ausente'?[]:[
      recorded?.boosterRanking?.primary?.name||'',
      outcome.booster?.primary?.nome||'',
      ...(outcome.booster?.alternatives||[]).map(x=>x.nome)
     ])
    ].filter(Boolean))].slice(0,6);
    const empty=el('option','','Sem sugestão selecionada');empty.value='';
    selectBooster.append(empty);
    for(const name of choicesBooster){const o=el('option','',name);o.value=name;selectBooster.append(o)}
    selectBooster.value=savedProfile?.booster||'';
    options.append(selectBooster);editor.append(options);
    // V343: avisar no próprio seletor quando o cadastro afirma ausência de slot.
    // Rascunhos antigos não são descartados ou alterados automaticamente.
    if(String(model.boosterSlot||'').toLocaleLowerCase('pt-BR').trim()==='ausente')
     editor.append(el('p','ct343-slot-evidence',
      'SLOT ADICIONAL AUSENTE no cadastro desta edição. Não é possível salvar '+
      'um novo ímpeto candidato até revisar o cadastro ou remover a seleção. '+
      'Nenhuma ficha histórica será apagada.'));
    const action=makeBtn('Salvar ficha independente deste técnico',()=>{
     try{
      if(!ok)throw Error('PP da edição não conferidos. Ficha permanece pendente.');
      const skills=choices.filter(x=>x.checked).map(x=>x.value);
      const audit=profiles.auditEquipmentSelection(skills,selectBooster.value,
       model.nativeSkills||'',model.skills||'',model.fixedBooster||'',model.boosterSlot||'pendente',
       skillKeyFor);
      // Revisões antigas nunca são alteradas por uma colisão nova.
      if(audit.hasSkillConflict)throw Error('Revisar antes de salvar: '+
       audit.conflicts.map(x=>x.name+' ('+x.sources.join(' e ')+')').join(' · ')+
       '. Desmarque a candidata coincidente; o histórico foi preservado.');
      const readiness=profiles.reviewDraftReadiness({
       train:currentPlan,budget:profileContext.budget,skills,
       booster:selectBooster.value,native:model.nativeSkills||'',
       equipped:model.skills||'',fixedBooster:model.fixedBooster||'',
       boosterSlot:model.boosterSlot||'pendente',skillKeyFor
      });
      if(!readiness.canSave)throw Error(readiness.issues.join(' '));
      profiles.save(storage(),profileContext,{train:currentPlan,skills,
       booster:selectBooster.value,source:'Revisão manual da ficha contextual V324',
       skillKeyFor,native:model.nativeSkills||'',equipped:model.skills||'',
       fixedBooster:model.fixedBooster||'',
       boosterSlot:model.boosterSlot||'pendente'});
      status.textContent='Ficha consultiva salva em '+scenario.manager+'/'+scenario.position+'/'+scenario.style+
       '. Nenhum ímpeto ou habilidade foi equipado automaticamente.';
      draw();
     }catch(e){status.textContent='Ficha NÃO salva: '+String(e.message||e)}
    });
    // V342: feedback ao vivo é SOMENTE LEITURA; nenhuma alteração no
    // armazenamento até o clique explícito em Salvar e validação novamente.
    const readinessNote=el('p','ct342-live-audit');
    readinessNote.setAttribute('role','status');
    readinessNote.setAttribute('aria-live','polite');
    const updateReadiness=()=>{
     const result=profiles.reviewDraftReadiness({
      train:currentPlan,budget:profileContext.budget,
      skills:choices.filter(x=>x.checked).map(x=>x.value),
      booster:selectBooster.value,native:model.nativeSkills||'',
      equipped:model.skills||'',fixedBooster:model.fixedBooster||'',
      boosterSlot:model.boosterSlot||'pendente',skillKeyFor
     });
     action.disabled=!ok||!result.canSave;
     readinessNote.dataset.status=result.status;
     readinessNote.dataset.slotStatus=result.slotReview.status;
     readinessNote.textContent=result.canSave?
      'RASCUNHO PRONTO · '+result.skillCount+' candidatas · '+
       result.spent+' / '+result.budget+' PP usados · '+
       result.remainingPP+' PP livres. '+result.advisories.join(' '):
      'NÃO SALVAR · '+result.issues.join(' ')+' '+result.advisories.join(' ');
    };
    for(const input of choices)input.addEventListener('change',updateReadiness);
    selectBooster.addEventListener('change',updateReadiness);
    updateReadiness();
    editor.append(readinessNote,action,el('p','ct311-note',
     'A ficha usa a hipótese de PP exibida neste cenário ou o último rascunho independente salvo. '+
     'Para editar níveis em Minhas Cartas, use o editor principal; não sobrescreverá outras edições. '+
     'Ímpetos fixos, cinco slots e habilidades equipadas continuam preservados.'));
   }
   panel.append(editor);
  }
  const tactics=el('section','ct311-panel');tactics.append(el('h3','','Função ofensiva/defensiva e atributos prioritários'));
  const context=recorded?.focus||scenario.focus;
  tactics.append(el('p','',context?.headline||'Contexto tático pendente'));
  if(context?.priority?.length)tactics.append(el('p','ct311-note','Prioridades do cenário: '+
   context.priority.map(x=>typeof x==='string'?x:x.name).join(' · ')));
  const responsibilities=recorded?.responsibilities||scenario.responsibilities;
  if(responsibilities){
   tactics.append(el('p','','Ataque: '+responsibilities.offense));
   tactics.append(el('p','','Defesa: '+responsibilities.defense));
   tactics.append(el('p','ct311-note',responsibilities.confidence));
  }
  tactics.append(el('p','ct311-note','As prioridades variam com a função. Atributos-base e equipamentos confirmados permanecem intactos.'));
  panel.append(tactics);
  const warnings=el('details','ct311-warnings');warnings.append(el('summary','','Evidências e limitações ('+scenario.warnings.length+')'));
  const ul=el('ul');for(const s of scenario.warnings)ul.append(el('li','',s));warnings.append(ul);
  panel.append(warnings);
  const comparison=el('details','ct311-compare');comparison.append(el('summary','','Comparar '+model.position+' × '+scenario.position+' ('+scenario.style+')'));
  if(scenario.position!==model.position){
   try{
    const base=engine.compute(model,model.position,style,manager);
    const baseSaved=selectedEntry(base).entry;
    // Comparar com a revisão MAT efetivamente salva, não com um recálculo
    // que pode divergir da build aprovada. Nunca aplicar revisão desatualizada.
    const effectiveBase=baseSaved&&!baseSaved.stale?
     engine.withSaved(base,baseSaved.revision):base;
    const effectiveCurrent=recorded?
     engine.withSaved(scenario,recorded):scenario;
    const cmp=engine.compare(effectiveBase,effectiveCurrent);

    const grid=el('div','ct311-compare-grid');
    grid.append(el('p','ct311-note',baseSaved&&!baseSaved.stale?'Comparação com a revisão original MAT salva.':'Comparação com a proposta original recalculada (sem revisão vigente).'));
    grid.append(el('p','','Função original '+base.position+': '+(cmp.focusA.join(' · ')||'pendente')));
    grid.append(el('p','','Função escolhida '+scenario.position+': '+(cmp.focusB.join(' · ')||'pendente')));
    if(cmp.differences.length){
     const table=el('table','ct311-table');
     table.append(el('tr','',''));const row=table.firstChild;
     for(const col of ['Grupo',base.position,scenario.position])row.append(el('th','',col));
     for(const diff of cmp.differences){const tr=el('tr');
      tr.append(el('td','',diff.category),el('td','',diff.a),el('td','',diff.b));table.append(tr)}
     grid.append(table);
    }else grid.append(el('p','', 'Sem diferença matemática documentável para este orçamento e contexto. A posição continua independente.'));
    grid.append(el('p','','Habilidades '+base.position+': '+(cmp.skillsA.join(' · ')||'pendentes')));
    grid.append(el('p','','Habilidades '+scenario.position+': '+(cmp.skillsB.join(' · ')||'pendentes')));
    grid.append(el('p','','Ímpetos: '+(cmp.boosterA||'pendente')+' × '+(cmp.boosterB||'pendente')));
    comparison.append(grid);
   }catch(e){comparison.append(el('p','','Comparação indisponível: '+e.message))}
  }else comparison.append(el('p','','A posição atual já é a original. Selecione outra para comparar.'));
  panel.append(comparison);
  // V339: comparar a mesma ficha V324 através do motor V251, sob demanda.
  const ppFrontier=el('details','ct339-frontier');
  ppFrontier.append(el('summary','','Comparar investimentos de PP desta ficha'));
  const frontierContent=el('div','ct339-frontier-content');
  ppFrontier.append(frontierContent);
  ppFrontier.addEventListener('toggle',()=>{
   if(!ppFrontier.open||ppFrontier.dataset.ready==='true')return;
   // V251 pode carregar depois da UI. Se faltar motor, permitir nova tentativa
   // ao reabrir em vez de marcar uma comparação incompleta como pronta.
   frontierContent.replaceChildren();
   let analysis;
   try{analysis=host.CRAQUE_FRONTIER_CONTEXT_V339?.compare(storage(),model,scenario)}
   catch(e){analysis={status:'PENDENTE',reason:String(e.message||e)}}
   if(analysis?.status!=='CONSULTIVO'){
    frontierContent.append(el('p','ct311-alert',
     analysis?.reason||'Comparador ainda indisponível; ficha salva preservada.'));
    return;
   }
   ppFrontier.dataset.ready='true';
   const frontier=analysis.comparison;
   frontierContent.append(el('p','ct311-note',analysis.saved?
    'Referência: rascunho independente salvo · revisão '+analysis.revision+
    ' · '+analysis.referenceSpent+' / '+analysis.budget+' PP.':
    'Referência: proposta matemática temporária, sem rascunho salvo nesta identidade.'));
   frontierContent.append(el('p','ct311-note',analysis.warning+' '+frontier.warning));
   const label=el('label','ct311-select-label','Distribuição consultiva: ');
   const choice=el('select','ct311-select ct339-candidate');
   choice.setAttribute('aria-label','Comparar investimentos sem alterar treino');
   for(const c of frontier.candidates){
    const option=el('option','',c.origins.join(' / ')+
     (c.registered?' · SALVO':c.onFrontier?' · fronteira amostral':' · troca hipotética')+
     ' · '+c.spent+' PP');
    option.value=c.id;choice.append(option);
   }
   label.append(choice);frontierContent.append(label);
   const summary=el('p','ct311-budget');summary.setAttribute('aria-live','polite');
   const table=el('table','ct311-table ct339-cost-table');
   const head=el('tr');
   for(const name of ['Grupo','Referência','Alternativa','Variação PP'])
    head.append(el('th','',name));
   table.append(head);
   const rows=el('tbody');table.append(rows);
   const axes=el('p','ct311-note');
   const render=()=>{
    const selected=frontier.candidates.find(c=>c.id===choice.value);
    if(!selected)return;
    summary.textContent=selected.spent+' / '+analysis.budget+' PP utilizados · '+
     selected.remainingPP+' PP livres · '+selected.redistributedPP+
     ' PP redistribuídos · '+selected.freePPInvested+' PP investidos do saldo.'+
     (selected.registered?' Rascunho salvo preservado.':
      ' Apenas simulação; nenhuma distribuição será gravada.');
    rows.replaceChildren();
    selected.levels.forEach((level,i)=>{
     if(analysis.role==='GO'?i<7:i>6)return;
     const previous=frontier.reference[i];
     const delta=host.SCOUT_TACTICS_V220.ppCost(level)-
      host.SCOUT_TACTICS_V220.ppCost(previous);
     const row=el('tr');
     row.append(el('td','',host.SCOUT_TACTICS_V220.CATEGORIES[i]),
      el('td','',previous+' nv.'),el('td','',level+' nv.'),
      el('td','',(delta>0?'+':'')+delta+' PP'));
     rows.append(row);
    });
    axes.textContent=frontier.axes.map(a=>a.label+': '+
     selected.objectives[a.key].toFixed(2)).join(' · ')+
     ' · índices relativos, não atributos finais.';
   };
   choice.value=analysis.initial;choice.addEventListener('change',render);
   frontierContent.append(summary,table,axes);render();
  });
  panel.append(ppFrontier);
  // V326: primeiro uma decisão legível; toda a engenharia fica acessível
  // sob demanda, inclusive revisões e comparador. Nenhum dado é descartado.
  const profilesSummary=profiles;
  let profileError=readError;
  const coaching=coach?.name||'Técnico não selecionado';
  const planned=savedProfile?.train||recorded?.levels||outcome.plan.levels;
  const ppReady=outcome.plan.status==='hipotese'&&Array.isArray(planned)&&
   !profileError&&(!profilesSummary||profilesSummary.validTraining(planned,outcome.plan.pp));
  const familiarityConfirmed=scenario.compatibility.eligible===true;
  const selectedManager=Boolean(coach?.name&&scenario.manager!=='sem-tecnico');
  const guide=host.CRAQUE_FICHA_DECISION_V327;
  let decision=null;
  if(guide&&(!readError||!profileContext))try{decision=guide.resolve(scenario,model,host.SCOUT_TACTICS_V220,saved,savedProfile)}
  catch(e){profileError=profileError||String(e?.message||e)}
  // V335: aprovação antiga não homologa PP alterados no rascunho independente.
  const verified=decision?.approved===true;
  const equipment=guide?.equipmentSummary?.(savedProfile,recommendations,usableCandidate);
  const equipmentAudit=profiles?.auditEquipmentSelection?.(equipment?.skills||[],
   equipment?.booster||'',model.nativeSkills||'',model.skills||'',
   model.fixedBooster||'',model.boosterSlot||'pendente',skillKeyFor);
  const hero=el('section','ct326-focus');
  hero.setAttribute('aria-label','Ficha em foco para a posição e o técnico');
  hero.append(el('div','ct326-kicker','FICHA EM FOCO · '+scenario.position+' · '+scenario.style.toUpperCase()));
  hero.append(el('h3','ct326-title',decision?.title||(verified?'Existe uma aprovação registrada':
   ppReady?'Proposta para avaliar':'Dados insuficientes para recomendar')));
  const contextLine=el('p','ct326-subtitle',
   coaching+' · '+(selectedManager?'técnico catalogado':'escolha um técnico para personalizar')+
   ' · '+(familiarityConfirmed?'posição documentada':'familiaridade da posição pendente'));
  hero.append(contextLine);
  const cards=el('div','ct326-metrics');
  const metric=(icon,title,value,foot)=>{
   const item=el('div','ct326-metric');
   const name=el('span','ct326-metric-title',icon+'  '+title);
   item.append(name,el('strong','ct326-metric-value',value),el('small','ct326-metric-help',foot));
   return item;
  };
  const candidateNames=equipment?.skills||
    (savedProfile?[]:recommendations.map(displaySkill).filter(Boolean).slice(0,5));
  const proposedBooster=equipment?equipment.booster:(savedProfile?null:usableCandidate);
  cards.append(
   metric('◈','Treinamento',ppReady&&Number.isInteger(decision?.usedPP)?
     (decision.usedPP===decision.pp?decision.pp+' PP':decision.usedPP+' / '+decision.pp+' PP'):
     ppReady?outcome.plan.pp+' PP':'Pendente',
    savedProfile?(decision?.remainingPP>0?
     decision.remainingPP+' PP livres · rascunho independente salvo':'Rascunho independente salvo'):
     ppReady?'Distribuição calculada, não homologada':'Confira nível máximo e evidências'),
   metric('✦','Habilidades',equipment?.skillsLabel||
     (candidateNames.length?candidateNames.length+' candidatas':'A conferir'),
    equipment?.hasDraft?'Selecionadas neste contexto; não equipadas automaticamente':'Candidatas não equipadas'),
   metric('◇','Ímpeto',equipment?.boosterLabel||
     (proposedBooster?'Sugestão disponível':'Pendente'),
    'Slot e ativação exigem comprovação')
  );
  hero.append(cards);
  if(equipmentAudit?.hasSkillConflict)hero.append(el('p','ct340-evidence-conflict',
   'REVISAR HABILIDADES: '+equipmentAudit.conflicts.map(c=>
    c.name+' ('+c.sources.map(x=>x==='nativa_cadastrada'?
     'consta nas nativas cadastradas':'consta nas adicionais informadas').join(', ')+')').join(' · ')+
   '. A seleção anterior continua preservada.'));
  if(screened?.boosterSlot.slot==='ausente')hero.append(el('p','ct343-slot-evidence',
   savedProfile?.booster?
    'Rascunho histórico com ímpeto preservado, mas slot adicional cadastrado como AUSENTE. Revise antes de nova gravação.':
    'Sem slot adicional cadastrado: ranking de ímpetos somente teórico nesta edição.'));
  if(equipmentAudit?.fixedBoosterSame)hero.append(el('p','ct340-evidence-conflict',
   'REVISAR ÍMPETO: o nome do candidato coincide com o ímpeto fixo cadastrado. '+
   'Confira slots e compatibilidade no jogo; nenhuma ativação foi inferida.'));
  if(candidateNames.length)hero.append(el('p','ct326-priority',
   (equipment?.hasDraft?'Habilidades selecionadas no rascunho: ':'Habilidades em análise: ')+
    candidateNames.join(' · ')));
  else if(equipment?.hasDraft)hero.append(el('p','ct326-priority',
   'Nenhuma habilidade adicional selecionada neste rascunho.'));
  if(proposedBooster)hero.append(el('p','ct326-priority',
   (equipment?.hasDraft?'Ímpeto selecionado no rascunho: ':'Ímpeto candidato: ')+
    proposedBooster+' · não equipado automaticamente'));
  else if(equipment?.hasDraft)hero.append(el('p','ct326-priority',
   'Nenhum ímpeto adicional selecionado neste rascunho.'));
  if(equipment?.hasDraft)hero.append(el('p','ct326-clarification',equipment.note));
  // V336: a pessoa consulta o motivo por habilidade e ímpeto sem abrir toda
  // a engenharia. Se o motor não tem motivo para a seleção, declarar pendência.
  if(equipment && guide?.explainEquipment){
   const rankingForWhy=recorded?.boosterRanking||outcome.booster||null;
   const why=guide.explainEquipment(equipment,recommendations,rankingForWhy);
   const explanation=el('details','ct336-equipment-evidence');
   explanation.append(el('summary','','Por que estas habilidades e ímpeto?'));
   const body=el('div','ct336-equipment-body');
   body.append(el('p','ct336-source-note',equipment.hasDraft?
    'Seleções recuperadas do rascunho independente desta posição, técnico e estilo.':
    'Candidatas calculadas para esta posição, técnico e estilo. Nenhuma foi selecionada no jogo.'));
   const names=el('ul','ct336-equipment-list');
   for(const item of why.skills){
    const li=el('li','ct336-equipment-item');
    li.append(el('strong','',item.name));
    li.append(el('p','',item.reason));
    if(item.synergies.length)li.append(el('p','ct336-synergy',
     'Sinergias apontadas pela proposta: '+item.synergies.join(' · ')));
    li.append(el('small','ct336-source-note',item.source));
    names.append(li);
   }
   if(why.skills.length)body.append(el('h4','','Habilidades adicionais'),names);
   else body.append(el('p','ct336-pending',equipment.hasDraft?
    'Nenhuma habilidade foi selecionada no rascunho: não foram inventadas justificativas.':
    'Sem habilidades candidatas nesta posição: confira nativas e provas dos slots.'));
   body.append(el('h4','','Ímpeto adicional'));
   body.append(el('p','ct336-booster-reason',
    (why.booster.name?why.booster.name+' — ':'')+why.booster.reason));
   body.append(el('p','ct336-source-note',why.booster.source));
   body.append(el('p','ct336-warning',why.warning));
   explanation.append(body);hero.append(explanation);
  }
  if(profileError)hero.append(el('p','ct311-alert','Perfil indisponível: '+profileError+
   '. O histórico original permanece preservado.'));
  if(decision){
   const reasons=el('details','ct327-why');
   reasons.append(el('summary','','Por que esta ficha está em foco?'));
   const list=el('ul','ct327-why-list');
   for(const text of decision.what)list.append(el('li','',text));
   reasons.append(list);hero.append(reasons);
   if(decision.isSaved)hero.append(el('p','ct327-saved-info',
    'Existe uma revisão deste contexto. Ela não é automaticamente o treino equipado.'));
  }
  if(!familiarityConfirmed)hero.append(el('p','ct326-caution',
   'A posição escolhida não possui familiaridade confirmada. Esta ficha é uma simulação.'));
  else if(!selectedManager)hero.append(el('p','ct326-caution',
   'Escolha o técnico e sua edição para obter uma ficha realmente contextual.'));
  else hero.append(el('p','ct326-clarification',verified?
   'Aprovação registrada para os PP exibidos; ainda não comprova equipamento no jogo.':
   'É uma proposta consultiva. Nenhum treinamento, habilidade ou ímpeto é aplicado automaticamente.'));
  const deep=el('details','ct326-deep-dive');
  deep.open=advancedOpen;
  deep.append(el('summary','','Ver análise completa · PP, habilidades, ímpetos e histórico'),panel);
  deep.addEventListener('toggle',()=>{
   // Eventos de toggle são assíncronos; somente a instância mais recente conta.
   if(!deep.isConnected)return;
   advancedOpen=deep.open;
   node.classList.toggle('ct326-expanded',advancedOpen);
  });
  const view=el('button','ct326-primary-action','Ver ficha completa →');
  view.type='button';
  view.addEventListener('click',()=>{
   deep.open=true;advancedOpen=true;node.classList.add('ct326-expanded');
   deep.scrollIntoView?.({block:'nearest',behavior:'smooth'});
  });
  // V327: comparação informativa e interativa das cinco táticas. A seleção
  // muda a PRÉVIA da ficha, nunca equipamento/PP aprovado.
  const alternatives=el('section','ct327-style-panel');
  alternatives.setAttribute('aria-label','Comparar cinco estilos coletivos nesta posição');
  const altTitle=el('h4','','Cinco estilos · a mesma carta e posição');
  const altNote=el('p','ct327-style-note','O estilo em uso não é prova de superioridade.');
  const altList=el('div','ct327-style-list');
  alternatives.append(altTitle,altNote,altList);
  const renderAlternatives=()=>{
   altList.replaceChildren();
   if(!guide){
    altList.append(el('p','ct311-alert','Comparador indisponível. A ficha original continua acessível.'));
    return;
   }
   try{
    const modes=guide.MODES.map(id=>{
     const hypothetical=id===scenario.style?scenario:engine.compute(model,scenario.position,id,manager);
     const historical=selectedEntry(hypothetical).entry;
     let profile=null;
     if(profilesSummary){
      try{profile=profilesSummary.read(storage(),profilesSummary.fromScenario(hypothetical,model))}
      catch(_){/* Ficha contextual incompleta: preservar, sem presumir homologação. */ }
     }
     return guide.resolve(hypothetical,model,host.SCOUT_TACTICS_V220,historical,profile);
    });
    const compared=guide.compare(decision||modes.find(item=>item.style===scenario.style),
     modes,outcome.plan.categories||host.SCOUT_TACTICS_V220?.CATEGORIES||[],host.SCOUT_TACTICS_V220);
    altNote.textContent=compared.statement;
    for(const item of compared.rows){
     const row=el('article','ct327-style-row');
     row.dataset.style=item.style;
     if(item.selected)row.dataset.current='true';
     row.append(el('div','ct327-style-name',item.label+
      (item.selected?' · SELECIONADO':'')));
     row.append(el('p','ct327-style-status',item.title+
      (item.pp===null?' · PP pendentes':item.costBasis==='custo_progressivo_exato'?
       ' · '+item.usedPP+' / '+item.pp+' PP utilizados':' · '+item.pp+' PP')));
     row.append(el('p','ct327-style-desc',item.description));
     if(item.major.length)row.append(el('p','ct327-style-delta',
      'Diferença de investimento versus '+guide.LABEL[scenario.style]+': '+
      item.major.map(d=>d.name+' '+(d.delta>0?'+':'')+d.delta+' nv.'+
       (Number.isInteger(d.deltaPP)?' · '+(d.deltaPP>0?'+':'')+d.deltaPP+' PP':'')).join(' · ')));
     if(item.costBasis==='custo_progressivo_exato'&&item.major.length)
      row.append(el('p','ct327-style-desc',
       item.redistributedPP+' PP redistribuídos'+
       (item.netDeltaPP?' · gasto varia '+(item.netDeltaPP>0?'+':'')+
        item.netDeltaPP+' PP':' · gasto total mantido')+
       ' · '+item.remainingPP+' PP livres nesta comparação.'));
     if(!item.selected){
      const activate=el('button','ct327-style-activate','Visualizar este estilo');
      activate.type='button';activate.dataset.style=item.style;
      activate.addEventListener('click',()=>{
       if(typeof opts.onStyleSelect==='function')opts.onStyleSelect(item.style);
       else{style=item.style;draw()}
      });
      row.append(activate);
     }
     altList.append(row);
    }
   }catch(e){altList.append(el('p','ct311-alert',
    'Não foi possível comparar estas propostas: '+String(e.message||e)+
    '. Nenhum treino foi alterado.'))}
  };
  const alternative=el('button','ct326-secondary-action','Comparar 5 estilos de jogo');
  alternative.type='button';
  alternative.setAttribute('aria-expanded',String(alternativesOpen));
  alternative.addEventListener('click',()=>{
   alternativesOpen=!alternativesOpen;
   alternatives.hidden=!alternativesOpen;
   alternative.setAttribute('aria-expanded',String(alternativesOpen));
   if(alternativesOpen){renderAlternatives();
    alternatives.scrollIntoView?.({block:'nearest',behavior:'smooth'});}
  });
  const controlRow=el('div','ct326-action-row');
  controlRow.append(view,alternative);
  hero.append(controlRow);
  alternatives.hidden=!alternativesOpen;
  if(alternativesOpen)renderAlternatives();
  hero.append(alternatives);
  details.append(hero,deep);
  node.classList.toggle('ct326-expanded',advancedOpen);
  save.disabled=false;
  status.textContent=scenario.status+' · '+scenario.position+' / '+scenario.style+
   ' · dados-base preservados'+(saved&&!saved.stale?' · revisão salva restaurada':'');
  updateRoleOverview();
  // Compartilhar a MESMA identidade V311 com o editor principal de PP.
  if(model.collection==='minhas-246'&&profiles){
   try{const context=profiles.fromScenario(scenario,model);
    host.dispatchEvent(new host.CustomEvent('scoutpro:v324:context-selected',{detail:{context}}))
   }catch(_){/* Técnico não selecionado: modo legado permanece consultável. */}
  }
 }
 host.addEventListener('scoutpro:v324:profile-saved',event=>{
  if(!alive||!active||!host.CRAQUE_MANAGER_FICHAS_V324)return;
  try{
   const api=host.CRAQUE_MANAGER_FICHAS_V324;
   if(event.detail?.key===api.key(api.fromScenario(active,model)))draw();
  }catch(_){}
 });
 function positionChange(){
  try{engine.choose(storage(),model,select.value)}
  catch(e){status.textContent=e.message;return}
  draw();
  if(typeof opts.onPositionChange==='function')opts.onPositionChange(select.value);
 }
 select.addEventListener('change',positionChange);
 draw();
 return {
  root:node,get selectedPosition(){return select.value},
  get current(){return active},
  update(next={}){if(next.style)style=next.style;
    if(next.manager!==undefined)manager=next.manager;
    draw()},
  destroy(){alive=false;node.remove()}
 };
}
let mainBootPending=false;
function mainBoot(){
 if(host.document.body?.dataset.page!=='detail'||mainBootPending)return;
 const anchor=$('scout-v220-hero'),rawNode=$('scout-v68-data');
 if(!anchor||!rawNode||anchor.querySelector('.ct311-positional'))return;
 let raw;try{raw=JSON.parse(rawNode.textContent)}catch(_){return}
 mainBootPending=true;
 host.fetch('../SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('Sem catálogo');return r.json()})
 .then(data=>{
  const card=data.cards?.find(x=>Number(x.numero)===Number(raw.capture));
  if(!card)return;
  const model=engine.fromPersonal(card,raw),managerApi=host.CRAQUE_MANAGERS_V302;
  const getStyle=()=>{
   const active=anchor.querySelector('.scout-v220-tab[aria-pressed="true"]');
   return active?.dataset.tactic||'posse';
  };
  const getManager=()=>managerApi?.selectedManager?.()?.catalog_id||'';
  const slot=el('div','ct311-main-slot');
  const before=anchor.querySelector('#scout-v220-training');
  if(before?.parentNode)before.parentNode.insertBefore(slot,before);else anchor.prepend(slot);
  const panel=create(slot,model,{style:getStyle(),manager:getManager(),
   onStyleSelect:tactic=>{
    const button=anchor.querySelector('.scout-v220-tab[data-tactic="'+tactic+'"]');
    if(button)button.click();
    else panel?.update({style:tactic});
   }});
  if(!panel)return;
  // Não modificar o painel de treino ORIGINAL aprovado. Esta área mostra propostas adicionais.
  host.document.addEventListener('scoutpro:tactic-selected-v220',e=>{
   if(e.detail?.tactic)panel.update({style:e.detail.tactic})});
  host.document.addEventListener('change',e=>{
   if(['ct-manager-select','ct-manager-tactic'].includes(e.target?.id))
    panel.update({manager:getManager(),style:getStyle()})});
  host.addEventListener('scoutpro:manager-selected-v302',e=>{
   const info=e.detail||{};
   if(Number(info.capture)===Number(raw.capture)&&
      String(info.card_id)===String(raw.id))
    panel.update({manager:info.catalog_id||getManager(),style:getStyle()});
  });
  // V313: mudança documental de familiaridade na própria carta reavalia
  // instantaneamente o mapa e os avisos sem sobrescrever PP/builds.
  host.addEventListener('craque:data-changed',e=>{
   if(e.detail?.key===host.SCOUT_POSITION_TRAINING_V246?.KEY)panel.update();
  });
 }).catch(err=>{host.console?.warn?.('V311: ficha contextual indisponível',err)})
 .finally(()=>{mainBootPending=false});
}
function startMain(){
 mainBoot();
 if(host.document.body?.dataset.page!=='detail'||!host.MutationObserver)return;
 const observer=new host.MutationObserver(()=>{
  if(host.document.querySelector('.ct311-main-slot .ct311-positional')){observer.disconnect();return}
  if($('scout-v220-hero'))mainBoot();
 });
 observer.observe(host.document.body,{childList:true,subtree:true});
}
host.CRAQUE_POSITIONAL_UI_V311=Object.freeze({create,mainBoot});
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',startMain,{once:true});
else startMain();
})(typeof window!=='undefined'?window:null);
