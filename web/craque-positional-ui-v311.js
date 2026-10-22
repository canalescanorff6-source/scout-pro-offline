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
 const h=el('h2','ct311-heading','EM QUAL POSIÇÃO ESTA CARTA VAI JOGAR?');
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
   status.textContent='Proposta salva · revisão '+r.revision+' · '+active.position+' / '+active.style+' / '+active.manager+'. Equipamentos reais preservados.';
   draw();
  }catch(e){status.textContent='Falha ao salvar cenário: '+(e.message||e)}
 });
 const original=makeBtn('Voltar à posição original',()=>{select.value=model.position;positionChange()});
 actions.append(save,original);
 node.append(h,controls,status,details,actions);
 target.append(node);
 let active=null,style=opts.style||'posse',manager=opts.manager||'',alive=true;
 const initial=engine.preferred(storage(),model);
 select.value=initial; if(select.value!==initial)select.value=model.position;
 function renderPlan(out,displaySaved){
  const t=el('section','ct311-panel');
  t.append(el('h3','','Treinamento · '+out.label));
  const p=out.plan;
  if(p.status!=='hipotese'||!p.levels){t.append(el('p','ct311-alert','PENDENTE · '+(p.reason||'PP e posição não documentados')));return t}
  t.append(el('p','ct311-budget',(p.pp||0)+' PP exatos distribuídos · saldo '+p.remaining+' · proposta não homologada'));
  const table=el('table','ct311-table'),tr=el('tr');
  for(const head of ['Grupo','Níveis','Custo PP']){const th=el('th','',head);tr.append(th)}
  table.append(tr);
  p.levels.forEach((n,i)=>{
   const r=el('tr');r.append(el('td','',p.categories[i]),el('td','',n),
    el('td','',host.SCOUT_TACTICS_V220.ppCost(n)));table.append(r);
  });
  t.append(table);
  if(displaySaved)t.append(el('p','ct311-note','Revisão salva encontrada e restaurada; valores documentais da carta não foram substituídos.'));
  return t;
 }
 function draw(){
  if(!alive)return;
  details.replaceChildren();
  let scenario;
  try{scenario=engine.compute(model,select.value,style,manager)}
  catch(e){status.textContent='Motor indisponível: '+String(e.message||e);active=null;return}
  active=scenario;
  const saved=engine.saved(storage(),scenario);
  const panel=el('div','ct311-scenario');
  panel.append(el('h3','','Cenário '+scenario.position+' · '+scenario.style+' · '+scenario.manager));
  const c=scenario.compatibility;
  const compatible=el('p','ct311-compat',
   'Familiaridade: '+c.text+' · Estilo individual: '+scenario.styleActivation);
  compatible.dataset.confidence=c.eligible?'documentado':'pendente';panel.append(compatible);
  if(saved){
   const s=saved.revision;
   panel.append(el('p',saved.stale?'ct311-alert':'ct311-confirm',
    'Revisão '+s.revision+' salva ('+s.selectedPosition+' / '+s.style+' / '+s.manager+')'+
    (saved.stale?' · DESATUALIZADA: dados da carta mudaram, preservar a anterior.':
    ' · preservada independentemente das outras posições.')));
  }
  const outcome=scenario.outcome;
  const recorded=saved&&!saved.stale?saved.revision:null;
  let output=outcome;
  if(recorded&&Array.isArray(recorded.levels)&&outcome.plan.status==='hipotese'){
   output={...outcome,plan:{...outcome.plan,levels:recorded.levels.slice(),pp:recorded.pp,
    remaining:0}};
  }
  panel.append(renderPlan(output,Boolean(recorded)));
  const skills=el('section','ct311-panel');skills.append(el('h3','','Até 5 habilidades adicionais · somente recomendações'));
  const list=el('ol','ct311-list');
  const recommendations=recorded?.recommendations||outcome.suggestedSkills||[];
  for(const item of recommendations)list.append(el('li','',displaySkill(item)+
   ' — '+(item.why||'prioridade contextual, sem comprovação de equipamento')));
  if(!recommendations.length)list.append(el('li','','Sem candidatos suficientes; conferir habilidades nativas e os slots reais.'));
  skills.append(el('p','ct311-note','Habilidades equipadas informadas: '+(model.skills||'não confirmadas')+
   '. As sugestões não equipam habilidades e não criam vagas.'));
  skills.append(list);panel.append(skills);
  const booster=el('section','ct311-panel');booster.append(el('h3','','Ímpetos · posição '+scenario.position));
  const candidate=recorded?.booster||outcome.booster?.primary?.nome||null;
  booster.append(el('p','',candidate?
   'Primeiro candidato: '+candidate+' (não equipado automaticamente)':'Candidato confiável pendente'));
  const alts=outcome.booster?.alternatives||[];
  if(alts.length)booster.append(el('p','ct311-note','Alternativas: '+alts.map(x=>x.nome).join(' · ')));
  booster.append(el('p','ct311-note','Ímpeto fixo: '+(model.fixedBooster||'não documentado')+
    ' · Slot: '+model.boosterSlot+' · Ímpeto adicional equipado: '+(model.booster||'não informado')));
  panel.append(booster);
  const tactics=el('section','ct311-panel');tactics.append(el('h3','','Função ofensiva/defensiva e atributos prioritários'));
  tactics.append(el('p','',scenario.focus?.headline||'Contexto tático pendente'));
  if(scenario.focus?.priority?.length)tactics.append(el('p','ct311-note','Prioridades do cenário: '+
   scenario.focus.priority.map(x=>x.name).join(' · ')));
  tactics.append(el('p','ct311-note','As prioridades variam com a função. Atributos-base e equipamentos confirmados permanecem intactos.'));
  panel.append(tactics);
  const warnings=el('details','ct311-warnings');warnings.append(el('summary','','Evidências e limitações ('+scenario.warnings.length+')'));
  const ul=el('ul');for(const s of scenario.warnings)ul.append(el('li','',s));warnings.append(ul);
  panel.append(warnings);
  const comparison=el('details','ct311-compare');comparison.append(el('summary','','Comparar '+model.position+' × '+scenario.position+' ('+scenario.style+')'));
  if(scenario.position!==model.position){
   try{
    const base=engine.compute(model,model.position,style,manager),cmp=engine.compare(base,scenario);
    const grid=el('div','ct311-compare-grid');
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
  details.append(panel);
  save.disabled=false;
  status.textContent=scenario.status+' · '+scenario.position+' / '+scenario.style+
   ' · dados-base preservados'+(saved&&!saved.stale?' · revisão salva restaurada':'');
 }
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
function mainBoot(){
 if(host.document.body?.dataset.page!=='detail')return;
 const anchor=$('scout-v220-hero'),rawNode=$('scout-v68-data');
 if(!anchor||!rawNode||anchor.querySelector('.ct311-positional'))return;
 let raw;try{raw=JSON.parse(rawNode.textContent)}catch(_){return}
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
  const panel=create(anchor,model,{style:getStyle(),manager:getManager()});
  if(!panel)return;
  // Não modificar o painel de treino ORIGINAL aprovado. Esta área mostra propostas adicionais.
  host.document.addEventListener('scoutpro:tactic-selected-v220',e=>{
   if(e.detail?.tactic)panel.update({style:e.detail.tactic})});
  host.document.addEventListener('change',e=>{
   if(['ct-manager-select','ct-manager-tactic'].includes(e.target?.id))
    panel.update({manager:getManager(),style:getStyle()})});
 }).catch(_=>{});
}
host.CRAQUE_POSITIONAL_UI_V311=Object.freeze({create,mainBoot});
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',mainBoot,{once:true});
else mainBoot();
})(typeof window!=='undefined'?window:null);
