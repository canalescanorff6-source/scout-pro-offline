/* V233 — painel de leitura individual na ficha principal.
 * O menu abre por escolha do usuário; nenhum PP é gravado/equipado.
 * Respeita a única ficha V220 e as 246 identidades cadastradas.
 */
(function(host){
 'use strict';
 if(!host?.document)return;
 const doc=host.document;
 const make=(tag,cls,content)=>{
  const el=doc.createElement(tag);
  if(cls)el.className=cls;
  if(content!==undefined)el.textContent=String(content);
  return el;
 };
 const byId=id=>doc.getElementById(id);
 const parse=id=>{try{return JSON.parse(byId(id)?.textContent||'null')}catch(_e){return null}};
 function addLine(parent,tag,cls,content){const el=make(tag,cls,content);parent.appendChild(el);return el}
 let card=null,lab=null,active='posse',api=null,panel=null;
 function fill(){
  if(!panel||!card||!api)return;
  const out=api.compare(card,active,lab);
  const x=out.analysis;
  if(!x)return;
  const content=panel.querySelector('.ct-v233-body');
  if(!content)return;
  content.replaceChildren();
  const headline=make('div','ct-v233-top');
  const description=make('div','');
  addLine(description,'span','ct-v233-kicker','INTERPRETAÇÃO INDIVIDUAL · '+x.position.toUpperCase());
  addLine(description,'h3','','O que esta carta precisa fazer em campo?');
  addLine(description,'p','',x.job+' '+x.mode);
  headline.appendChild(description);
  addLine(headline,'span','ct-v233-confidence',x.uncertainty==='parcial_com_atributos_base'?
   'EVIDÊNCIA PARCIAL':x.uncertainty==='documental'?'ANÁLISE DOCUMENTAL':'VERIFICAÇÃO PENDENTE');
  content.append(headline);
  const who=make('p','ct-v233-identity',
   '#'+String(x.capture??'—').padStart(3,'0')+' · Card ID '+(x.id||'pendente')+' · '+(x.edition||'edição pendente'));
  content.append(who);
  addLine(content,'h4','','Categorias prioritárias para a função');
  addLine(content,'p','ct-v233-help',
   'Um nível melhora um GRUPO de atributos, não apenas uma estatística. Ordem heurística para '+x.position.toLowerCase()+'; não é nota de Overall.');
  const grid=make('div','ct-v233-priority-grid');
  for(const p of x.priorities.slice(0,5)){
   const cardEl=make('div','ct-v233-priority');
   const head=make('div','ct-v233-priority-head');
   addLine(head,'strong','',p.name);
   addLine(head,'span','',p.registered===null?'PP por confirmar':p.registered+' níveis registrados');
   cardEl.append(head);
   addLine(cardEl,'p','',p.stats);
   if(p.nextCost!==null)addLine(cardEl,'small','',
    'Próximo nível: '+p.nextCost+' PP de custo marginal');
   grid.append(cardEl);
  }
  content.append(grid);
  if(x.signals.length){
   addLine(content,'h4','','Por que esta carta foi interpretada assim?');
   const ul=make('ul','ct-v233-signals');
   for(const signal of x.signals)addLine(ul,'li','',signal);
   content.append(ul);
  }else addLine(content,'p','ct-v233-help',
   'Sem indícios suficientes de habilidades e comportamento únicos; priorização por função e estilo do técnico.');
  if(x.knownBase.length){
   const known=make('details','ct-v233-base-evidence');
   addLine(known,'summary','','Atributos-base numéricos documentados ('+x.knownBase.length+')');
   addLine(known,'p','ct-v233-help',
    'Somente números-base disponíveis nesta ficha. Não são status finais; ímpetos, técnico e progressão não foram somados.');
   const statList=make('div','ct-v233-stats');
   for(const v of x.knownBase.slice(0,15))addLine(statList,'span','',v.name+': '+v.base);
   known.append(statList);content.append(known);
  }
  addLine(content,'h4','','Conferências antes de redistribuir pontos');
  const cautions=make('ul','ct-v233-tradeoffs');
  for(const t of x.tradeoffs)addLine(cautions,'li','',t);
  content.append(cautions);
  const comparison=make('section','ct-v233-comparison');
  addLine(comparison,'h4','','Comparação matemática — opcional');
  const provenPP=Number.isInteger(card.max_level)&&
   Number(card.pp)===2*(card.max_level-1)&&
   /^informado_pelo_usuario_/.test(String(card.pp_origem||''));
  if(out.proposal&&provenPP){
   addLine(comparison,'p','',
    'Treino registrado: '+x.budget+' PP. Hipótese alternativa: '+out.proposal.spent+
    ' PP. A distribuição registrada NÃO será alterada.');
   const table=make('div','ct-v233-deltas');
   for(const change of out.proposal.changes){
    addLine(table,'span','',
     change.name+': '+change.from+' → '+change.to+' ('+(change.delta>0?'+':'')+change.delta+')');
   }
   comparison.append(table);
  }else addLine(comparison,'p','',!provenPP?
   'PP ainda sem nível máximo documentado na edição exata. A V251 suspendeu nova redistribuição até essa confirmação.':
   out.reason);
  addLine(comparison,'small','ct-v233-disclaimer',
   'Não aplicar automaticamente. Conferir nível máximo, edição/Card ID, status no jogo e desempenho antes de aprovar qualquer troca.');
  content.append(comparison);
  addLine(content,'h4','','Testes de partida para esta função');
  const tests=make('ul','ct-v233-tests');
  for(const test of x.tests)addLine(tests,'li','',test);
  content.append(tests);
  addLine(content,'p','ct-v233-disclaimer',x.warning);
  const summary=panel.querySelector('summary');
  if(summary)summary.setAttribute('aria-label',
   'Abrir interpretação da função '+x.position+' no estilo '+active+
   ' com análise de treino não homologada');
 }
 function mount(){
  if(doc.body?.dataset.page!=='detail')return false;
  if(byId('ct-v233-interpret-panel'))return true;
  api=host.CRAQUE_INTERPRETATION_V233;
  const anchor=byId('scout-v220-training'),target=byId('scout-v220-hero');
  card=parse('scout-v68-data');lab=parse('lab-data')||{};
  if(!api||!anchor||!target||!card)return false;
  const tabs=byId('scout-v220-tabs');
  active=tabs?.querySelector('[data-tactic][aria-pressed="true"]')?.dataset.tactic||'posse';
  panel=make('details','ct-v233-panel');panel.id='ct-v233-interpret-panel';
  const summary=make('summary','','Inteligência por posição · entender a ficha e comparar PP');
  summary.title='Análise interpretativa individual, sem substituir os treinos existentes';
  panel.append(summary,make('div','ct-v233-body'));
  anchor.insertAdjacentElement('afterend',panel);
  fill();
  // A leitura V233 é histórica/consultiva: após a V251 reconciliar a edição,
  // não apresentar alternativas se o nível máximo ainda não foi confirmado.
  host.addEventListener('scoutpro:v251:canonical-data',event=>{
   const v=event.detail||{};
   if(Number(v.capture)!==Number(card.capture)||String(v.id)!==String(card.id)||
    String(v.name)!==String(card.name)||String(v.edition)!==String(card.edition))return;
   for(const field of ['native_skills','attack_style','defence_style','boost1','boost2',
    'pp_origem','max_level','recommended_levels','base_stats_known']){
    if(Object.hasOwn(v,field))card[field]=v[field];
   }
   fill();
  });
  doc.addEventListener('scoutpro:tactic-selected-v220',event=>{
   const next=event.detail?.tactic;
   if(api.MODES[next]){
    active=next;
    fill();
   }
  });
  return true;
 }
 function boot(){
  if(mount())return;
  if(!host.MutationObserver||!doc.body)return;
  const observer=new host.MutationObserver(()=>{
   if(mount())observer.disconnect();
  });
  observer.observe(doc.body,{childList:true,subtree:true});
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})(typeof window!=='undefined'?window:null);
