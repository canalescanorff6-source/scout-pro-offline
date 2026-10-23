/* Craque Tático V330 — foco Premium de escalação e laboratório.
 * Aprimoramento progressivo: NÃO edita elenco, pontos PP, skills, boosters,
 * restrições, registros de partidas ou seleções homologadas.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host?.document)host.CRAQUE_LINEUP_FOCUS_V330=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
 const FORMATIONS=Object.freeze({'4312':'4-3-1-2','4213':'4-2-1-3'});
 const STYLE_NAMES=Object.freeze({
  posse:'Posse de Bola',normal:'Contra-Ataque Normal',
  rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Bola Longa'
 });
 const number=value=>Number.isInteger(Number(value))&&Number(value)>=0?Number(value):0;
 function lineupSummary({formation='4312',style='posse',players=0,bench=0,experimental=false}={}){
  return Object.freeze({
   heading:experimental?'4-3-1-2 · teste experimental':'Escalação · '+(FORMATIONS[formation]||'formação pendente'),
   line:experimental?'Proposta experimental; nenhuma carta foi homologada pela simulação.':
    'Confira o campo e o plano antes de aplicar qualquer mudança no jogo.',
   formation:FORMATIONS[formation]||'não documentada',
   style:STYLE_NAMES[style]||'estilo a conferir',
   players:number(players),bench:number(bench),
   note:'Prévia local. Alternar painéis não grava jogadores, PP, habilidades ou ímpetos.'
  });
 }
 function laboratorySummary({formation='4312',style='posse',cycle=1,teams=0,restricted=0,reviewed=false}={}){
  return Object.freeze({
   formation:FORMATIONS[formation]||'não documentada',
   style:STYLE_NAMES[style]||'estilo a conferir',
   cycle:Number(cycle)===2?2:1,
   teams:number(teams),restricted:Math.min(23,number(restricted)),
   reviewed:Boolean(reviewed)&&number(restricted)===23,
   warning:Boolean(reviewed)&&number(restricted)===23?
    '23 restrições declaradas pelo usuário; identidade externa não verificada.':
    number(restricted)+' de 23 restrições indicadas. Revise os Card IDs antes dos testes.',
   note:'Elencos experimentais. Nenhuma habilidade, ficha ou Link-Up é homologado.'
  });
 }
 const el=(doc,tag,klass,content)=>{
  const node=doc.createElement(tag);
  if(klass)node.className=klass;
  if(content!==undefined)node.textContent=String(content);
  return node;
 };
 function disclosure(doc,section,title,klass=''){
  if(!section||section.parentElement?.classList.contains('ct330-fold'))return null;
  const wrapper=el(doc,'details','ct330-fold '+klass);
  wrapper.append(el(doc,'summary','',title));
  section.before(wrapper);wrapper.append(section);wrapper.open=false;
  return wrapper;
 }
 function afterPaint(fn){
  if(host?.requestAnimationFrame)host.requestAnimationFrame(fn);
  else fn();
 }
 function focusControl(doc,caption,key){
  const button=el(doc,'button','ct330-quick-action',caption);
  button.type='button';button.dataset.focusTarget=key;return button;
 }
 function compactHero(doc,hero){
  const paragraph=hero.querySelector(':scope > p');
  if(!paragraph||paragraph.closest('.ct330-hero-context'))return;
  const context=el(doc,'details','ct330-hero-context');
  context.append(el(doc,'summary','','Entenda o contexto e os limites deste planejamento'));
  paragraph.before(context);context.append(paragraph);
  context.open=false;
 }
 function focusShell(doc,hero,eyebrow,buttons){
  const shell=el(doc,'section','ct330-focus');
  shell.setAttribute('aria-label','Acesso rápido à escalação e decisões');
  shell.append(el(doc,'div','ct330-eyebrow',eyebrow));
  const heading=el(doc,'h2','ct330-heading','Escalação em foco');
  const summary=el(doc,'p','ct330-summary','Carregando o contexto selecionado…');
  const stats=el(doc,'div','ct330-stats');
  const actions=el(doc,'nav','ct330-quick-actions');
  actions.setAttribute('aria-label','Ir diretamente a uma área');
  for(const [caption,key] of buttons)actions.append(focusControl(doc,caption,key));
  const note=el(doc,'p','ct330-note','A navegação não altera o planejamento nem as fichas salvas.');
  shell.append(heading,summary,stats,actions,note);
  hero.insertAdjacentElement('afterend',shell);
  return {shell,heading,summary,stats,actions,note};
 }
 function observe(node,options,callback){
  if(!node||typeof host.MutationObserver!=='function')return;
  new host.MutationObserver(callback).observe(node,options);
 }
 function updateStats(container,items){
  container.replaceChildren();
  for(const [label,value] of items){
   const block=el(container.ownerDocument,'div','ct330-stat');
   block.append(el(container.ownerDocument,'span','',label),
    el(container.ownerDocument,'strong','',value));container.append(block);
  }
 }
 function openAndScroll(target){
  if(!target)return false;
  let parent=target;
  while(parent){
   if(parent.tagName==='DETAILS')parent.open=true;
   parent=parent.parentElement;
  }
  const dest=target.matches?.('.scout-rotation-team')?target:
   target.closest?.('.ct330-fold')||target.closest?.('.ct330-target')||target;
  afterPaint(()=>dest.scrollIntoView?.({block:'start',behavior:'smooth'}));
  return true;
 }
 function mountLineup(doc,experimental){
  const main=doc.querySelector('main'),hero=main?.querySelector('.hero');
  const pitch=doc.getElementById('pitch'),bench=doc.getElementById('bench');
  const strategy=doc.getElementById('strategy'),analysis=doc.getElementById('analysis');
  if(!main||!hero||!pitch||!bench||!strategy||!analysis)return false;
  const layout=pitch.closest('.layout');
  const benchPanel=bench.closest('section.panel');
  const fieldPanel=pitch.closest('section.panel');
  const choice=doc.getElementById('formation-pick');
  const tactic=doc.getElementById('ct-v230-tactic-profile');
  const linkup=doc.getElementById('linkup');
  // V330: depois da escolha da formação vem o CAMPO. Antes os blocos
  // táticos e Link-Up empurravam o campo muito abaixo da primeira tela.
  if(choice&&layout)choice.insertAdjacentElement('afterend',layout);
  if(layout&&benchPanel)layout.insertAdjacentElement('afterend',benchPanel);
  if(tactic&&benchPanel)benchPanel.insertAdjacentElement('afterend',tactic);
  fieldPanel.classList.add('ct330-target');
  fieldPanel.id=fieldPanel.id||'ct330-field-panel';
  benchPanel.classList.add('ct330-target');
  benchPanel.id=benchPanel.id||'ct330-bench-panel';
  strategy.classList.add('ct330-target');
  const deep=disclosure(doc,analysis,'Ver funções, evidências e análise completa',
   'ct330-analysis-fold');
  const linkDeep=linkup?disclosure(doc,linkup,
   'Conferir Link-Up e requisitos (ativação não comprovada no jogo)',
   'ct330-linkup-fold'):null;
  // Banco: título e propósito continuam visíveis; os 12 cartões passam a
  // ocupar espaço apenas quando a pessoa pede para consultar reservas.
  let benchDeep=bench.parentElement?.classList.contains('ct330-bench-list')?
   bench.parentElement:null;
  if(!benchDeep){
   benchDeep=el(doc,'details','ct330-bench-list');
   benchDeep.append(el(doc,'summary','','Ver as 12 reservas e opções de troca'));
   bench.before(benchDeep);benchDeep.append(bench);
  }
  benchDeep.open=false;
  compactHero(doc,hero);
  const quick=focusShell(doc,hero,experimental?
   'LABORATÓRIO DE FORMAÇÃO · PRÉVIA':'MINHA ESCALAÇÃO · DECISÃO RÁPIDA',
   experimental?[
    ['Ver campo','field'],['12 reservas','bench'],['Plano de jogo','plan'],['Análise','analysis']
   ]:[
    ['Ver campo','field'],['12 reservas','bench'],['Estilo','style'],['Detalhes','analysis']
   ]);
  const map={field:fieldPanel,bench:benchPanel,plan:strategy,
   style:tactic||strategy,analysis:deep||analysis,linkup:linkDeep};
  quick.actions.addEventListener('click',event=>{
   const button=event.target.closest('button[data-focus-target]');
   if(!button)return;
   const key=button.dataset.focusTarget;
   if(key==='bench')benchDeep.open=true;
   openAndScroll(map[key]);
  });
  const refresh=()=>{
   const active=doc.querySelector('[data-formation][aria-pressed="true"]')?.dataset.formation||
    '4312';
   const style=doc.querySelector('[data-mode][aria-pressed="true"]')?.dataset.mode||
    (doc.getElementById('ct-v230-tactic-name')?.textContent?.toLowerCase().includes('rápido')?
     'rapido':'posse');
   const context=lineupSummary({formation:active,style,
    players:pitch.querySelectorAll('button[data-slot]').length,
    bench:bench.querySelectorAll('.bench-card').length,experimental});
   quick.heading.textContent=context.heading;
   quick.summary.textContent=context.line;
   updateStats(quick.stats,[
    ['FORMAÇÃO',context.formation],
    ['ESTILO',context.style],
    ['TITULARES',context.players+'/11'],
    ['RESERVAS',context.bench+'/12']
   ]);
   quick.note.textContent=context.note;
   benchDeep.querySelector('summary').textContent='Ver '+context.bench+
    ' reservas e opções de troca';
  };
  refresh();
  observe(pitch,{childList:true,subtree:false},refresh);
  observe(bench,{childList:true,subtree:false},refresh);
  observe(doc.getElementById('custom-badge'),{childList:true,characterData:true,subtree:true},refresh);
  const buttons=doc.querySelectorAll('[data-formation],[data-mode]');
  buttons.forEach(button=>observe(button,{attributes:true,attributeFilter:['aria-pressed']},refresh));
  // A escolha de tática também emite eventos do motor V230/V231.
  host.addEventListener('craque:formation-profile-v231',refresh);
  host.addEventListener('scoutpro:tactic-selected-v220',refresh);
  doc.body.classList.add('ct330-ready');
  return true;
 }
 function mountLaboratory(doc){
  const main=doc.querySelector('main.scout-rotation-wrap');
  const hero=main?.querySelector('.scout-rotation-hero');
  const series=doc.getElementById('series-heading')?.closest('.scout-rotation-panel');
  const black=doc.getElementById('black-heading')?.closest('.scout-rotation-panel');
  const video=doc.getElementById('video-heading')?.closest('.scout-rotation-panel');
  const backup=doc.getElementById('craque-backup-panel');
  const squads=doc.getElementById('squads');
  if(!main||!hero||!series||!black||!video||!backup||!squads)return false;
  // Primeiro aparece o plano que será jogado; o cadastro de restrições
  // continua acessível e explicitamente sinalizado como pendente.
  hero.insertAdjacentElement('afterend',series);
  series.classList.add('ct330-target');
  series.id=series.id||'ct330-series-panel';
  black.classList.add('ct330-target');
  black.id=black.id||'ct330-restrictions-panel';
  const first=black.querySelector('.scout-rotation-picker');
  const feedback=doc.getElementById('black-feedback');
  let blackDeep=null;
  if(first&&feedback){
   blackDeep=el(doc,'details','ct330-black-options');
   blackDeep.append(el(doc,'summary','','Conferir e escolher as restrições (até 23 cartas)'));
   first.before(blackDeep);
   let item=first;
   while(item&&item!==feedback){
    const next=item.nextElementSibling;
    blackDeep.append(item);item=next;
   }
  }
  const videoDeep=disclosure(doc,video,'Gravar partida e compartilhar vídeo',
   'ct330-video-fold');
  const backupDeep=disclosure(doc,backup,'Exportar ou restaurar backup',
   'ct330-backup-fold');
  const criteria=main.querySelector('.scout-rotation-panel:not([id]):last-of-type');
  const criteriaDeep=criteria&&criteria!==black&&criteria!==series&&criteria!==video?
   disclosure(doc,criteria,'Critérios detalhados para avaliar partidas',
    'ct330-criteria-fold'):null;
  const shortcuts=hero.querySelector('.scout-rotation-page-shortcuts');
  if(shortcuts){
   const more=el(doc,'details','ct330-extra-shortcuts');
   more.append(el(doc,'summary','','Mais atalhos do laboratório'));
   shortcuts.before(more);more.append(shortcuts);
  }
  compactHero(doc,hero);
  const quick=focusShell(doc,hero,'LABORATÓRIO · DECISÕES DE TESTE',[
   ['Formações','formation'],['Abrir elenco','first'],['23 restrições','restrictions'],
   ['Gravar vídeo','video']
  ]);
  const targets={formation:series,restrictions:black,video:videoDeep||video,
   backup:backupDeep||backup,criteria:criteriaDeep||criteria};
  quick.actions.addEventListener('click',event=>{
   const button=event.target.closest('button[data-focus-target]');
   if(!button)return;
   const id=button.dataset.focusTarget;
   if(id==='first'){
    const team=squads.querySelector('details.scout-rotation-team');
    if(team){team.open=true;openAndScroll(team)}
    else openAndScroll(series);
    return;
   }
   if(id==='restrictions'&&blackDeep)blackDeep.open=true;
   openAndScroll(targets[id]);
  });
  // Nas fichas experimentais: mostrar 11 titulares + campo primeiro.
  // Bancos e alertas extensos são exibidos apenas por solicitação.
  const decorateTeams=()=>{
   for(const team of squads.querySelectorAll('details.scout-rotation-team')){
    const players=team.querySelector('.scout-rotation-players');
    const benchSection=players?.querySelector(':scope > section:nth-child(2)');
    if(benchSection&&!players.querySelector('.ct330-team-bench')){
     const fold=el(doc,'details','ct330-team-bench');
     fold.append(el(doc,'summary','','Ver 12 reservas desta equipe'));
     benchSection.before(fold);fold.append(benchSection);
    }
    const audit=team.querySelector('.scout-rotation-audit');
    if(audit&&!audit.parentElement?.classList.contains('ct330-team-audit'))
     disclosure(doc,audit,'Revisão documental e alertas da escalação',
      'ct330-team-audit');
   }
  };
  let scheduled=false;
  const schedule=()=>{
   if(scheduled)return;scheduled=true;
   afterPaint(()=>{scheduled=false;decorateTeams();refresh()});
  };
  const refresh=()=>{
   const formation=doc.querySelector('[data-series][aria-pressed="true"]')?.dataset.series||'4312';
   const style=doc.querySelector('[data-tactic-mode][aria-pressed="true"]')?.dataset.tacticMode||'posse';
   const cycle=doc.querySelector('[data-cycle][aria-pressed="true"]')?.dataset.cycle||'1';
   const countText=doc.getElementById('black-count')?.textContent||'0 / 23';
   const restricted=Number(countText.match(/\d+/)?.[0]||0);
   const reviewed=Boolean(doc.getElementById('black-reviewed')?.checked);
   const context=laboratorySummary({formation,style,cycle,
    teams:squads.querySelectorAll('details.scout-rotation-team').length,
    restricted,reviewed});
   quick.heading.textContent='Série em foco · '+context.formation;
   quick.summary.textContent=context.warning;
   updateStats(quick.stats,[
    ['ESTILO',context.style],['RODADA',String(context.cycle)],
    ['EQUIPES',String(context.teams)],['RESTRIÇÕES',context.restricted+'/23']
   ]);
   quick.note.textContent=context.note;
   if(blackDeep)blackDeep.querySelector('summary').textContent=
    'Conferir restrições · '+context.restricted+' de 23 informadas';
  };
  decorateTeams();refresh();
  observe(squads,{childList:true},schedule);
  observe(doc.getElementById('black-count'),{childList:true,characterData:true,subtree:true},schedule);
  for(const button of doc.querySelectorAll('[data-series],[data-cycle],[data-tactic-mode]'))
   observe(button,{attributes:true,attributeFilter:['aria-pressed']},schedule);
  doc.getElementById('black-reviewed')?.addEventListener('change',schedule);
  doc.body.classList.add('ct330-ready');
  return true;
 }
 function mount(doc=host?.document){
  if(!doc?.body)return false;
  if(doc.body.classList.contains('ct330-ready'))return true;
  if(doc.body.dataset.page==='rotation-lab')return mountLaboratory(doc);
  if(doc.body.dataset.page==='team')return mountLineup(doc,
   Boolean(doc.querySelector('.hero .kicker')?.textContent?.includes('V176')));
  return false;
 }
 if(host?.document){
  if(host.document.readyState==='loading')
   host.document.addEventListener('DOMContentLoaded',()=>mount(host.document),{once:true});
  else mount(host.document);
 }
 return Object.freeze({FORMATIONS,STYLE_NAMES,lineupSummary,laboratorySummary,mount});
});
