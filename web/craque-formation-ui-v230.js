/* V230 · duas formações históricas reavaliadas por SEIS estilos de técnico.
 * O usuário escolhe os jogadores manualmente, com um ranking consultivo para cada posição.
 * Não escreve na ficha, PP, habilidades, instruções aprovadas ou 23 restrições.
 */
(()=>{'use strict';
const tactical=window.CRAQUE_TACTICS_V230,bar=document.getElementById('ct-v230-tactic-profile');
if(!tactical||!bar)return;
const $=id=>document.getElementById(id);
let cards=[],knownForms=[],activeMode='posse',currentId='4312',ready=false,positionPanel=null,contextSlot=null;
const KEY=id=>'scoutpro:v230:formation-mode:'+id;
const escString=s=>String(s??'');
const v=id=>{try{return localStorage.getItem(KEY(id))||'posse'}catch(_e){return 'posse'}};
const store=(id,mode)=>{try{localStorage.setItem(KEY(id),mode);window.dispatchEvent(
 new CustomEvent('craque:data-changed',{detail:{key:KEY(id)}}));return true}catch(_e){return false}};
const node=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
function formation(){
 return document.querySelector('#formation-pick [data-formation][aria-pressed="true"]')?.dataset.formation||currentId;
}
function slots(){
 const out=[];
 for(const el of document.querySelectorAll('#pitch button[data-slot]')){
  const slot=el.dataset.slot,match=el.querySelector('.p-cap')?.textContent?.match(/#(\d{1,3})\b/);
  if(!match)continue;
  out.push({slot,cap:Number(match[1])});
 }
 return out;
}
function openPositionScenario(player,slot,{automatic=false}={}){
 if(!player)return false;
 // A posição da vaga controla os mesmos motores dos dois acervos. NÃO editar elenco.
 const advanced=document.querySelector('.ct-v230-tactic-advanced');
 if(advanced&&automatic)advanced.open=true;
 const container=$('ct-v230-tactic-details');
 if(!container)return false;
 contextSlot=slot;
    const core=window.CRAQUE_POSITIONAL_V311,ui=window.CRAQUE_POSITIONAL_UI_V311,
    formationCore=window.CRAQUE_FORMATION_CONTEXT_V314;
   const panelHost=$('ct-v314-slot-panel')||node('div','ct-v314-slot-panel');
   panelHost.id='ct-v314-slot-panel';
   container.after(panelHost);
   positionPanel?.destroy();positionPanel=null;panelHost.replaceChildren();
   try{
    if(!core||!ui||!formationCore)throw Error('Motor comum indisponível nesta instalação');
    const source=formationCore.context({collection:'minhas-cartas',card:player,
     formation:currentId,slot,style:activeMode,manager:''},core);
    const note=node('p','ct314-formation-note',
      '#'+player.numero+' '+player.name+' · '+source.originalPosition+' → '+source.position+
      ' · '+source.disclaimer);
    panelHost.append(note);
    positionPanel=ui.create(panelHost,source.model,{style:activeMode,
     initialPosition:source.position,formation:currentId,formationSlot:slot});
    panelHost.scrollIntoView({block:'nearest',behavior:'auto'});
   }catch(e){panelHost.append(node('p','ct314-error','Não foi possível abrir a ficha desta vaga: '+e.message))}
 return Boolean(positionPanel);
}
function render(){
 if(!ready)return;
 const chosen=slots(),used=chosen.map(x=>x.cap);
 const container=$('ct-v230-tactic-details');
 positionPanel?.destroy();positionPanel=null;container.replaceChildren();
 const guideHost=$('ct-v392-guide-outside');
 guideHost?.replaceChildren();
 $('ct-v314-slot-panel')?.remove();
 // V392: guia prático ligado ao estilo e à formação EXISTENTE, sem alterar a escalação.
 const counter=tactical.counterGuide?.(activeMode,currentId);
 if(counter){
  const guide=node('details','ct-v392-counter-guide');
  guide.open=true;
  guide.append(node('summary','',counter.label+' · Como atacar e defender com esta formação'));
  for(const [label,description] of [
   ['Ataque',counter.attack],['Defesa',counter.defence],
   ['Ataque na formação',counter.formationAttack],
   ['Defesa na formação',counter.formationDefence],['Risco e correção',counter.risk]]){
   const p=node('p','ct-v392-guide-step');
   p.append(node('strong','',label+': '),document.createTextNode(description));
   guide.append(p);
  }
  const decisions=node('details','ct-v392-slot-duties');
  decisions.dataset.counterDecisions='true';
  decisions.append(node('summary','','Se acontecer → faça → evite · 6 decisões de jogo'),
   node('p','ct-v392-guide-step',counter.controls));
  for(const decision of counter.decisions||[]){
   const step=node('section','ct-v392-guide-step');
   step.dataset.counterDecision=decision.id;
   step.append(node('h4','',decision.title));
   for(const [label,value] of [['Quando',decision.when],['Faça',decision.action],['Evite',decision.avoid]]){
    const line=node('p','');line.append(node('strong','',label+': '),document.createTextNode(value));step.append(line);
   }
   decisions.append(step);
  }
  const instructions=node('details','ct-v392-slot-duties');
  instructions.dataset.counterInstructions='true';
  instructions.append(node('summary','','Instruções individuais · opções condicionais por vaga'),
   node('p','ct-v392-guide-step',counter.instructions.rule),
   node('p','ct-v392-guide-step',counter.slotMap));
  const targetLabel=node('label','ct-v392-guide-step','Alvo rival observado (opcional, só para esta consulta): ');
  const target=node('input','');target.type='text';target.maxLength=80;
  target.placeholder='Ex.: MAT rival · camisa 10';target.autocomplete='off';
  target.setAttribute('aria-label','Alvo adversário para avaliar marcação individual');
  target.style.cssText='display:block;box-sizing:border-box;width:100%;min-width:0;max-width:100%;margin-top:6px';
  targetLabel.append(target);instructions.append(targetLabel);
  const instructionRows=node('div','');
  const showInstructions=()=>{
   const plan=tactical.counterGuide(activeMode,currentId,null,{opponentTarget:target.value}).instructions;
   instructionRows.replaceChildren();
   for(const [phase,items] of [['Ataque',plan.attack],['Defesa',plan.defence]]){
    items.forEach((item,index)=>{
     const row=node('section','ct-v392-guide-step');
     row.dataset.instructionSlot=item.slot||'';
     row.dataset.instructionPhase=phase;
     row.append(node('h4','',phase+' '+(index+1)+' · '+(item.type?
      item.type+' em '+item.slot.toUpperCase():'Sem instrução')));
     for(const [label,value] of [['Quando considerar',item.when],['Custo',item.cost],['Deixe livre',item.leaveUnused]]){
      const line=node('p','');line.append(node('strong','',label+': '),document.createTextNode(value));row.append(line);
     }
     if(item.target)row.append(node('p','','Alvo a confirmar no jogo: '+item.target));
     instructionRows.append(row);
    });
   }
  };
  target.addEventListener('input',showInstructions);showInstructions();
  instructions.append(instructionRows,node('p','ct-v392-guide-step',counter.instructions.removed),
   node('small','','Consulta por função, sem atribuir instrução à carta nem copiar o plano de Posse. Configure no jogo apenas se a condição aparecer.'));
  guide.append(decisions,instructions,node('p','ct-v392-guide-step',counter.validation));
  const sources=node('p','ct-v392-guide-step');
  for(const [label,url] of [['Konami · regras v6.0.0',counter.officialSource],['eFHUB · análise de terceiros',counter.source],['Manual offline · botões e configuração','manual-2027/index.html#comandos']]){
   const link=node('a','',label);link.href=url;
   link.style.cssText='display:block;overflow-wrap:anywhere;margin:5px 0';
   if(url.startsWith('https:')){link.target='_blank';link.rel='noopener noreferrer'}
   sources.append(link);
  }
  guide.style.overflowWrap='anywhere';
  guide.append(sources);
  guide.append(node('small','',counter.evidence+
   ' Para PP, habilidades adicionais e ímpetos, abra a ficha individual da carta na vaga.'));
  (guideHost||container).append(guide);
 }
 const name=tactical.MODES[activeMode];
 $('ct-v230-tactic-name').textContent=name.label+' · '+(currentId==='4312'?'4-3-1-2':'4-2-1-3 estreita');
 $('ct-v230-tactic-explain').textContent=name.hint+
  ' Este estilo possui 11 titulares próprios: trocas manuais ficam isoladas das demais táticas.';
 bar.querySelectorAll('button[data-mode]').forEach(b=>{
  b.setAttribute('aria-pressed',String(b.dataset.mode===activeMode));
  b.classList.toggle('selected',b.dataset.mode===activeMode);
 });
 const blocked=(()=>{try{const a=JSON.parse(localStorage.getItem('scoutpro:v219:black-caps')||'[]');return Array.isArray(a)?a:[]}catch(_e){return[]}})();

 // V392: classificação consultiva por vaga com onze titulares e doze reservas
 // sem duplicidade de pessoa. APLICAÇÃO somente após confirmação manual.
 const form=knownForms.find(f=>f.id===currentId);
 const suggested=tactical.recommendSquad?.(cards,form,activeMode,blocked);
 if(suggested){
  const panel=node('details','ct-v392-squad');
  const head=node('summary','', 'Sugestão para '+tactical.MODES[activeMode].label+
   ' · '+suggested.starters.length+'/11 titulares e '+suggested.bench.length+'/12 reservas');
  panel.append(head);
  const intro=node('p','', 'Comparação documental, não ranking de desempenho real. '+
   'Posição e identidade confirmadas; cada carta conserva sua ficha individual.');
  panel.append(intro);
  const addGroup=(label,players)=>{
   panel.append(node('h4','',label));
   const list=node('ol','ct-v392-roster-list');
   for(const item of players){
    const li=node('li','');
    li.append(node('strong','',item.role+' · #'+String(item.cap).padStart(3,'0')+' '+item.name),
      node('small','', ' · '+item.slot.toUpperCase()+' · '+item.fit+
       ' · encaixe '+item.score+'/100 (heurístico)'));
    const rationale=node('p','',item.signals.join(' · ')||
     'Função/estilo individual pendente de documentação.');
    li.append(rationale);list.append(li);
   }
   panel.append(list);
  };
  addGroup('11 titulares indicados',suggested.starters);
  addGroup('12 opções de banco por função',suggested.bench);
  for(const warning of suggested.warnings)panel.append(node('p','ct-v230-tactic-caution',warning));
  if(suggested.ready){
   const apply=node('button','ct-v230-fit-change','Aplicar 11 titulares e 12 reservas nesta tática');
   apply.type='button';
   apply.addEventListener('click',()=>{
    const state=window.CRAQUE_FORMATION_STATE_V231;
    if(!state?.applySuggested||state.formation()!==currentId||state.mode()!==activeMode){
     $('ct-v230-persist').textContent='Plano ainda não carregado, nenhuma alteração feita.';
     return;
    }
    if(!window.confirm('Aplicar estes 11 titulares e 12 reservas SOMENTE em '+
      tactical.MODES[activeMode].label+' · '+form.title+
      '? O elenco Posse e os outros estilos permanecem intactos.'))return;
    const applied=state.applySuggested(suggested.slots,suggested.bench.map(x=>x.cap));
    $('ct-v230-persist').textContent=applied?
      'Escalação e banco desta tática salvos; demais estilos preservados.':
      'Não foi possível salvar a sugestão; nenhum elenco foi alterado.';
    if(applied)render();
   });
   panel.append(apply);
  }
  container.append(panel);
 }
 let strong=0,pending=0;
 for(const {slot,cap} of chosen){
  const player=cards.find(c=>Number(c.numero)===cap);
  if(!player)continue;
  const info=tactical.score(player,slot,activeMode);
  if(info.confidence==='comparativo_documental'&&info.score>=65)strong++;
  else pending++;
  const block=node('article','ct-v230-fit-row');
  const title=node('div','ct-v230-fit-heading');
  title.append(node('strong','',('#'+String(cap).padStart(3,'0')+' '+player.name)),
   node('small','',slot.toUpperCase()+' · '+info.placement+' · '+(info.score<0?'Não elegível':'Encaixe '+info.score+'/100 (heurístico)')));
  const note=node('p','',info.signals.slice(0,2).join(' · '));block.append(title,note);
  const duty=tactical.counterGuide?.(activeMode,currentId,slot);
  if(duty?.role){
   const tasks=node('details','ct-v392-slot-duties');
   tasks.append(node('summary','','Plano manual da vaga · '+duty.role),
    node('p','', 'Com a bola: '+(duty.slotAttack||duty.roleAttack)),
    node('p','', 'Sem a bola: '+(duty.slotDefence||duty.roleDefence)));
   block.append(tasks);
  }
  const rivals=tactical.rank(cards,slot,activeMode,blocked,used).slice(0,2);
  if(rivals.length){
   block.append(node('small','ct-v230-fit-alts','Opções por função (não equipadas): '+
    rivals.map(x=>'#'+String(x.card.numero).padStart(3,'0')+' '+x.card.name).join(' · ')));
  }
  const change=node('button','ct-v230-fit-change','Trocar nesta posição');
  change.type='button';change.onclick=()=>{
   document.querySelector('#pitch button[data-slot="'+slot+'"]')?.click();
  };
  block.append(change);
  const positionAction=node('button','ct-v314-formation-action','Abrir ficha na vaga '+slot.toUpperCase());
  positionAction.type='button';
  positionAction.title='Analisar posição de USO, PP, habilidades e ímpetos sem editar a carta/escalação';
  positionAction.addEventListener('click',()=>openPositionScenario(player,slot));
  block.append(positionAction);container.append(block);
 }
 $('ct-v230-tactic-count').textContent=chosen.length+
  ' titulares · '+strong+' com sinais fortes · '+pending+' para conferir';
 $('ct-v230-tactic-warning').textContent='Comparação documental, não rendimento garantido. As cartas da lista de restrições são excluídas das sugestões, não necessariamente do planejamento manual já salvo. Link-Up e instruções originais foram planejados para Posse e dependem do técnico escolhido no jogo.';
 // Se o usuário trocar estilo ou formação com a ficha contextual aberta, o
 // contexto deve acompanhar a vaga e a carta NOVAS, sem mostrar dados antigos.
 if(contextSlot){
  const selection=chosen.find(c=>c.slot===contextSlot);
  const assigned=selection&&cards.find(c=>Number(c.numero)===selection.cap);
  if(assigned)openPositionScenario(assigned,contextSlot);
  else contextSlot=null;
 }
}
// V315: uma troca REAL e validada de titular atualiza a ficha imediatamente.
// Eventos de seleções obsoletas são ignorados caso o usuário altere o elenco rápido.
window.addEventListener('craque:lineup-assigned-v315',e=>{
 const d=e.detail||{};
 if(!ready||d.formation!==currentId||d.mode!==activeMode||
  !window.CRAQUE_FORMATION_CONTEXT_V314?.slotPosition(d.formation,d.slot))return;
 queueMicrotask(()=>{
  const state=window.CRAQUE_FORMATION_STATE_V231;
  if(!state||state.formation()!==d.formation||state.mode()!==d.mode||
    Number(state.snapshot()[d.slot])!==Number(d.cap))return;
  const card=cards.find(x=>Number(x.numero)===Number(d.cap));
  if(card)openPositionScenario(card,d.slot,{automatic:true});
 });
});
function select(mode){
 if(!Object.hasOwn(tactical.MODES,mode))return;
 activeMode=mode;
 const persisted=store(currentId,mode);
 const manager=window.CRAQUE_FORMATION_STATE_V231;
 const applied=manager?.setMode?.(mode);
 $('ct-v230-persist').textContent=!applied?
  'Aguarde a escalação carregar. Seu estilo foi selecionado para esta formação.':
  !persisted?
  'Estilo alterado nesta sessão; seu dispositivo não confirmou o salvamento.':
  'Plano independente de '+tactical.MODES[mode].label+' · escolha seus 11 titulares e salve sem alterar as outras táticas.';
 render();
}
function sync(){
 const id=formation();
 if(id!==currentId){
  currentId=id;
  const saved=v(id);activeMode=Object.hasOwn(tactical.MODES,saved)?saved:'posse';
 }
 render();
}
for(const [mode,cfg] of Object.entries(tactical.MODES)){
 const button=node('button','ct-v230-tactic-option',cfg.label);button.type='button';
 button.dataset.mode=mode;button.setAttribute('aria-pressed','false');
 button.onclick=()=>select(mode);
 $('ct-v230-tactic-tabs').append(button);
}
const observer=new MutationObserver(()=>sync());
const pitch=$('pitch');if(pitch)observer.observe(pitch,{childList:true,subtree:false});
const holder=$('formation-pick');
if(holder)holder.addEventListener('click',event=>{
 if(event.target.closest?.('[data-formation]'))queueMicrotask(sync);
});
Promise.all([
 fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('Catálogo offline indisponível');return r.json()}),
 fetch('SCOUT_V177_DUAS_FORMACOES.json').then(r=>{if(!r.ok)throw Error('Duas formações indisponíveis');return r.json()})
]).then(([roster,forms])=>{
 if(roster.cards?.length!==246||forms.formations?.length!==2)throw Error('Catálogo e formações incompletos');
 cards=roster.cards;knownForms=forms.formations;ready=true;sync();
}).catch(e=>{$('ct-v230-tactic-explain').textContent='Não foi possível analisar as formações: '+e.message});
window.CRAQUE_FORMATION_UI_V230={render,sync};
})();
