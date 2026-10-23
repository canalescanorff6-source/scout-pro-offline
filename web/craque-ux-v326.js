/* CRAQUE TÁTICO V326 — interface de decisão clara, Android + Windows.
 * Nova navegação progressiva. Somente DOM; não altera build, PP, skills, slots,
 * técnicos salvos nem qualquer registro de carta.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_UX_V326=api;
 if(!host?.document)return;
 const doc=host.document;
 const el=(tag,cl='',label='')=>{
  const n=doc.createElement(tag);if(cl)n.className=cl;
  if(label)n.textContent=label;return n;
 };
 const scrollTo=node=>node?.scrollIntoView?.({behavior:host.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?'auto':'smooth',block:'start'});
 function home(){
  if(doc.body.dataset.page!=='catalog'||doc.getElementById('ct326-home-head'))return false;
  const hero=doc.querySelector('.hero .hero-text'),nav=doc.querySelector('.scout-v189-quick');
  if(!hero||!nav)return false;
  doc.body.classList.add('ct326-premium','ct326-catalog');
  const heading=doc.querySelector('.hero h1');
  if(heading)heading.innerHTML='Seu elenco.<em>Suas decisões.</em>';
  const intro=hero.querySelector('.scout-v189-intro');
  if(intro)intro.textContent='Um caminho claro: abra a carta, confira a ficha principal e compare somente quando precisar.';
  const top=el('div','ct326-home-head');top.id='ct326-home-head';
  top.append(el('span','ct326-overline','LABORATÓRIO DE FUTEBOL · OFFLINE'),
   el('h2','','Tudo no lugar certo.'),
   el('p','','Escolha o que quer fazer. O restante fica disponível em Ferramentas.'));
  const items=[
   ['#catalogo','01','Ver minhas cartas','Abra uma carta e veja a orientação principal.'],
   ['meu-time-duas-formacoes-v177.html','02','Montar meu time','Escalação, técnico e sinergias por função.'],
   ['outros-elencos-v227.html','03','Outros elencos','As mesmas fichas, sem misturar proprietários.']
  ];
  nav.replaceChildren(...items.map(([url,num,title,subtitle])=>{
   const link=el('a','ct326-home-action scout-v189-tile');link.href=url;
   link.append(el('span','ct326-home-number',num));
   const b=el('span','ct326-home-copy');
   b.append(el('strong','',title),el('small','',subtitle));
   link.append(b,el('span','ct326-home-arrow','↗'));return link;
  }));
  const extra=hero.querySelector('.scout-v189-extra');
  if(extra){const sum=extra.querySelector('summary');if(sum)sum.textContent='Mais ferramentas e análises avançadas';}
  nav.before(top);
  const title=doc.querySelector('#catalogo .section-title');
  if(title)title.textContent='Escolha um jogador';
  return true;
 }
 function heroDecision(raw,style,hasDraft,hasRegistered){
  const verified=raw?.training_gameplay_verified===true&&raw?.training_provisional!==true;
  if(hasDraft)return {tag:'RAS CUNHO'.replace(' ',''),tone:'review',
   title:'Rascunho deste técnico',text:'Você salvou uma alternativa para este contexto. Ela não substitui seu treino original nem comprova superioridade em partidas.'};
  if(style!=='posse')return {tag:'ALTERNATIVA',tone:'review',
   title:'Simulação para comparar',text:'Você está vendo outro estilo. Sem validação competitiva documentada, não recomendamos trocar automaticamente o treino registrado.'};
  if(verified&&hasRegistered)return {tag:'TESTE REGISTRADO',tone:'ready',
   title:'Treino com evidência de jogo',text:'Esta edição registra teste de partida. Consulte a origem e compare antes de alterar uma build já aprovada.'};
  if(hasRegistered)return {tag:'REFERÊNCIA SEGURA',tone:'safe',
   title:'Comece pelo treino registrado',text:'É a referência preservada da carta. As demais fichas são alternativas de estudo, não versões automaticamente melhores.'};
  return {tag:'DADOS PENDENTES',tone:'review',
   title:'Ainda não há ficha vencedora comprovada',text:'Confira nível, PP, edição e familiaridade antes de aplicar um treino. Você pode consultar as propostas sem equipá-las.'};
 }
 function choiceCard(raw){
  const card=el('section','ct326-choice');
  card.id='ct326-choice';
  card.setAttribute('aria-label','Orientação principal da carta');
  const main=el('div','ct326-choice-head');
  main.append(el('span','ct326-overline','SUA DECISÃO PRINCIPAL'));
  const row=el('div','ct326-choice-title');
  const h=el('h2','','Como usar esta carta?'),tag=el('span','ct326-choice-pill','REFERÊNCIA');
  tag.id='ct326-choice-pill';row.append(h,tag);main.append(row);
  const selected=el('h3','','Comece pelo treino registrado');
  selected.id='ct326-choice-selected';
  const explain=el('p','ct326-choice-explain','As fichas alternativas ficam separadas da principal.');
  explain.id='ct326-choice-explain';
  const note=el('p','ct326-choice-meta');
  note.id='ct326-choice-meta';
  const buttons=el('div','ct326-choice-actions');
  const createBtn=(label,action,minor)=>{
   const b=el('button','ct326-action'+(minor?' ct326-action-subtle':''),label);
   b.type='button';b.addEventListener('click',action);return b;
  };
  buttons.append(
   createBtn('Ver meu treino',()=>scrollTo(doc.getElementById('scout-v220-training'))),
   createBtn('Habilidades e ímpeto',()=>scrollTo(doc.getElementById('scout-v220-recs')),true),
   createBtn('Comparar outras fichas',()=>{
    const d=doc.getElementById('ct326-comparisons');
    if(d){d.open=true;scrollTo(d)}
   },true)
  );
  const learn=el('details','ct326-guidance');
  learn.append(el('summary','','Por que esta opção aparece primeiro?'),
   el('p','','Uma build só é a melhor quando há evidência da edição exata, PP, posição e testes comparáveis. Sem isso, mostramos o treino registrado como referência e mantemos as outras propostas sem aprovação automática.'));
  card.append(main,selected,explain,note,buttons,learn);
  return card;
 }
 function wrapComparison(holder,kind){
  if(!holder||holder.closest('.ct326-comparison-disclosure'))return null;
  const panel=el('details','ct326-comparison-disclosure');
  panel.id=kind==='detail'?'ct326-comparisons':'ct326-external-comparisons';
  panel.append(el('summary','',kind==='detail'?
   'Comparar técnicos, posições e outros treinos':
   'Comparar funções e alternativas por técnico'));
  const desc=el('p','ct326-disclosure-note',
   'Simulações ficam aqui para não serem confundidas com a ficha principal. Selecione uma posição ou técnico, revise os PP e salve como proposta separada.');
  panel.append(desc);
  holder.before(panel);panel.append(holder);
  return panel;
 }
 let personalReady=false,externalWatching=false;
 let raw=null;
 function detail(){
  if(doc.body.dataset.page!=='detail')return false;
  const shell=doc.getElementById('scout-v220-hero');
  if(!shell)return false;
  if(!doc.getElementById('ct326-choice')){
   const source=doc.getElementById('scout-v68-data');
   try{raw=JSON.parse(source?.textContent||'null')}catch(_){raw=null}
   const advisory=choiceCard(raw||{});
   shell.prepend(advisory);
  }
  doc.body.classList.add('ct326-premium','ct326-detail');
  const slot=shell.querySelector('.ct311-main-slot');
  if(slot&&!doc.getElementById('ct326-comparisons')){
   wrapComparison(slot,'detail');
   const compare=doc.getElementById('ct326-comparisons');
   const skills=doc.getElementById('scout-v220-recs');
   const test=doc.querySelector('.scout-v220-practice');
   // Uma única ficha aberta: treino/skills primeiro; comparação por escolha.
   if(test?.parentNode===shell)test.after(compare);
   else if(skills?.parentNode===shell)skills.after(compare);
  }
  refreshDetail();
  if(!personalReady){
   personalReady=true;
   host.addEventListener('scoutpro:tactic-selected-v220',()=>refreshDetail());
   host.addEventListener('scoutpro:manager-selected-v302',()=>refreshDetail());
   host.addEventListener('scoutpro:v324:profile-saved',()=>refreshDetail());
   doc.addEventListener('change',e=>{
    if(e.target?.matches?.('.ct311-controls select,#ct-manager-select,#ct-manager-tactic'))
     refreshDetail();
   });
  }
  return true;
 }
 function refreshDetail(){
  const root=doc.getElementById('scout-v220-hero');
  if(!root||!doc.getElementById('ct326-choice'))return;
  const selectedTab=root.querySelector('.scout-v220-tab[aria-pressed="true"]');
  const style=selectedTab?.dataset.tactic||'posse';
  let hasDraft=false,position='',name='';
  const source=raw||{};
  const manager=host.CRAQUE_MANAGERS_V302?.selectedManager?.()||null;
  const pos=root.querySelector('.ct311-controls .ct311-select');
  position=pos?.value||source.role_used||source.shown_position||'?';
  name=manager?.nome||'Sem técnico selecionado';
  try{
   const catalog=host.CRAQUE_POSITIONAL_V311;
   const store=host.CRAQUE_MANAGER_FICHAS_V324;
   if(catalog&&store&&manager&&source.capture){
    const keyPrefix=store.PREFIX;
    const saved=Object.keys(host.localStorage).some(k=>
     k.startsWith(keyPrefix)&&
     k.includes(encodeURIComponent(String(manager.catalog_id)))&&
     k.includes('|'+encodeURIComponent(position)+'|'+style+'|')&&
     k.includes(encodeURIComponent(String(source.id))));
    hasDraft=saved;
   }
  }catch(_){}
  const registered=Array.isArray(source.recommended_levels)&&source.recommended_levels.length===10;
  const state=heroDecision(source,style,hasDraft,registered);
  const panel=doc.getElementById('ct326-choice');
  panel.dataset.tone=state.tone;
  doc.getElementById('ct326-choice-pill').textContent=state.tag;
  doc.getElementById('ct326-choice-selected').textContent=state.title;
  doc.getElementById('ct326-choice-explain').textContent=state.text;
  doc.getElementById('ct326-choice-meta').textContent=
   'Técnico: '+name+'  ·  Função: '+position+'  ·  Estilo: '+
   ({posse:'Posse',normal:'Contra-ataque',rapido:'Contra-ataque rápido',fora:'Por fora',longo:'Bola longa'})[style];
 }
 function external(){
  if(doc.body.dataset.page==='detail'||doc.body.dataset.page==='catalog')return;
  const modal=doc.getElementById('friend-analysis-dialog');
  if(!modal)return;
  doc.body.classList.add('ct326-premium');
  function adjust(){
   const slot=modal.querySelector('.friend-position-scenario-slot');
   if(slot&&!slot.closest('.ct326-comparison-disclosure'))wrapComparison(slot,'external');
   const info=modal.querySelector('.ct326-friend-note');
   if(!info){
    const note=el('section','ct326-friend-note');
    note.append(el('strong','','Uma carta, uma orientação principal'),
     el('p','','Treinamento é a análise inicial. Habilidades e ímpetos são recomendações separadas; comparar posição e técnico é opcional e não modifica a carta.'));
    const sections=modal.querySelector('#friend-analysis-modes');
    if(sections)sections.before(note);
   }
  }
  adjust();
  if(!externalWatching&&host.MutationObserver){
   externalWatching=true;
   const watch=new host.MutationObserver(()=>{if(modal.open)adjust()});
   watch.observe(modal,{childList:true,subtree:true,attributes:false});
  }
 }
 function boot(){
  home();detail();external();
  if(doc.body.dataset.page==='detail'&&!doc.getElementById('ct326-choice')&&host.MutationObserver){
   const watch=new host.MutationObserver(()=>{
    if(detail())watch.disconnect();
   });
   watch.observe(doc.body,{childList:true,subtree:true});
  }
  if(doc.body.dataset.page==='catalog'&&!doc.getElementById('ct326-home-head')&&host.MutationObserver){
   const watch=new host.MutationObserver(()=>{if(home())watch.disconnect()});
   watch.observe(doc.body,{childList:true,subtree:true});
  }
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
})(typeof window!=='undefined'?window:null,function(){'use strict';
 function priority(s){
  if(s?.draft)return 'rascunho';
  if(s?.style!=='posse')return 'simulacao';
  if(s?.gameplay===true&&s?.registered)return 'testado';
  return s?.registered?'registrado':'pendente';
 }
 return Object.freeze({priority});
});
