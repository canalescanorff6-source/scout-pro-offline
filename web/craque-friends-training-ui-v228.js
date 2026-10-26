/* Craque Tático V228 — painel individual de treino, habilidades e ímpetos em Outros Elencos.
 * Tudo é exibido com textContent; nenhum dado de usuário vira HTML executável.
 */
(()=>{'use strict';
const engine=window.CRAQUE_FRIEND_TRAINING_V228,def=window.CRAQUE_FRIENDS_V227;
const modal=document.getElementById('friend-analysis-dialog');
if(!engine||!modal)return;
const $=id=>document.getElementById(id);
const mk=(tag,cl='',txt)=>{
 const node=document.createElement(tag);
 if(cl)node.className=cl;
 if(txt!==undefined)node.textContent=String(txt);
 return node;
};
let activeCard=null,activeOwner=null,saveCallback=null,editCallback=null,style='posse';
let panel='treino',cache=null,usedPosition='',positional=null;
const managers=window.CRAQUE_MANAGERS_V302;
let managerData=null,managerPanel=null,managerSelectedId='',managerTactic='',managerError='';
const managerKey=()=>activeOwner&&activeCard?'scoutpro:v306:manager:'+encodeURIComponent(activeOwner.id)+':'+encodeURIComponent(activeCard.id):null;
function saveManager(){const key=managerKey();if(!key)return;try{
 if(managerSelectedId)localStorage.setItem(key,JSON.stringify({catalog_id:managerSelectedId,tactic:managerTactic}));
 else localStorage.removeItem(key);
}catch(_e){status('Não foi possível salvar a seleção local do técnico; confira o espaço disponível.')}}
function restoreManager(){managerSelectedId='';managerTactic='';const key=managerKey();if(!key)return;
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved.catalog_id==='string'){
 managerSelectedId=saved.catalog_id;managerTactic=typeof saved.tactic==='string'?saved.tactic:'';
 if(engine.MODES.includes(managerTactic))style=managerTactic;
 }}catch(_e){managerError='Seleção anterior ilegível; nenhum dado da carta foi modificado.'}
}
const labels={treino:'Treinamento',skills:'5 habilidades',boost:'Ímpetos'};
const feedback=$('friend-analysis-feedback');
function infoRow(name,value,className=''){
 const row=mk('div','friend-analysis-meta-item '+className);
 row.append(mk('span','',name),mk('strong','',value));
 return row;
}
function status(text){feedback.textContent=text;}
function summaryCard(result){
 const plan=result.plan,el=mk('section','friend-analysis-summary');
 const meta=mk('div','friend-analysis-meta');
 meta.append(infoRow('Edição / Card ID',activeCard.edition&&activeCard.cardId?
  activeCard.edition+' · '+activeCard.cardId:'PENDENTE · versão exata não confirmada'),
  infoRow('Função tática',plan.role||'Não informada'),
  infoRow('Orçamento',result.progress.pp===null?'PP pendentes / em conflito':
   result.progress.pp+' PP · '+(result.progress.source==='nivel_maximo'?'calculados do nível máximo':'informados manualmente')),
  infoRow('Precisão',result.confidence==='simulacao_documentada_parcial'?'Simulação parcial':'Hipótese pendente de validação'),
  infoRow('Motor da ficha',plan.methodology||'Engenharia individual ainda indisponível'));
 el.append(meta);
 const focus=mk('p','friend-analysis-focus',plan.focus?.headline||'Informe posição e PP para uma distribuição simulada.');
 el.append(focus);
 if(result.warnings.length){
  const details=mk('details','friend-analysis-warnings');
  details.open=true;
  details.append(mk('summary','','Conferências necessárias ('+result.warnings.length+')'));
  const ul=mk('ul');for(const w of result.warnings)ul.append(mk('li','',w));
  details.append(ul);el.append(details);
 }
 return el;
}
/* V373: mesmo parecer das cartas principais; exibição consultiva e segura. */
function professionalView(result,kind){
 const pro=result.professional,box=mk('section','ct373-pro');
 box.dataset.proKind=kind;box.append(mk('h3','','Revisão competitiva individual · PRO'));
 if(!pro){box.append(mk('p','','Motor ainda não retornou um parecer.'));return box}
 box.append(mk('p','ct373-pro-disclaimer','Critérios metodológicos inspirados em Rentão/Blackjhon, sem autoria atribuída a vídeo não comprovado da edição. '+(pro.role||'Função pendente')+' · '+result.label));
 const row=(k,v)=>{const r=mk('div','ct373-pro-row');r.append(mk('strong','',k),mk('span','',v));box.append(r)};
 if(kind==='treino'){
  row('Treino atual',pro.baselineValid?'Manual cadastrado':'PENDENTE · não presume build anterior');
  row('Proposta',pro.trainingStatus==='hipotese'?'HIPÓTESE, NÃO APLICADA':'PENDENTE');
  for(const change of pro.trainingDifferences)row(change.name,change.was+' → '+change.proposed+' · só hipótese');
  const ul=mk('ul','ct373-pro-list');
  for(const item of [...pro.roleTests,...pro.tradeoffs])ul.append(mk('li','',item));
  if(ul.children.length)box.append(ul);
 }else if(kind==='skills'){
  row('Vagas verificadas',pro.freeSkillSlots===null?'NÃO COMPROVADAS — cinco sugestões ≠ cinco vagas':String(pro.freeSkillSlots));
  const ol=mk('ol','ct373-pro-list');
  for(const item of pro.skillPortfolio){
   const li=mk('li');
   li.append(mk('strong','',item.priority+'. '+item.name),
    mk('p','',item.functionReason),
    mk('small','',item.explanation));
   if(item.nativeRelation)li.append(mk('small','','Nativas: '+item.nativeRelation));
   ol.append(li);
  }
  if(ol.children.length)box.append(ol);
  else box.append(mk('p','','Carteira pendente: confira nativas e edição.'));
 }else{
  row('Ímpeto fixo',pro.factoryBooster||'PENDENTE');
  row('Segundo slot',pro.slotSupported?'Catálogo indica: confirmar na conta':'NÃO COMPROVADO');
  const ol=mk('ol','ct373-pro-list');
  for(const item of pro.boosterAlternatives){
   const li=mk('li');li.append(mk('strong','',item.priority+'. '+item.name));
   if(item.axes?.length)li.append(mk('p','','Atributos relacionados: '+item.axes.join(' · ')));
   li.append(mk('small','','Sobreposição com fixo: '+(item.overlapWithFixed===null?'pendente':item.overlapWithFixed+' de 4')));
   ol.append(li);
  }
  if(ol.children.length)box.append(ol);row('Tokens','NÃO AUTORIZADOS');
 }
 const detail=mk('details','ct373-pro-limits');
 detail.append(mk('summary','','Pendências ('+pro.issues.length+')'));
 const ul=mk('ul');for(const item of pro.issues.slice(0,12))ul.append(mk('li','',item));
 detail.append(ul);box.append(detail);return box;
}
function training(result){
 const panel=mk('section','friend-analysis-panel');panel.dataset.panel='treino';
 panel.append(mk('h3','','Ficha de treino · '+result.label));
 const p=result.plan;
 if(p.status!=='hipotese'||!p.levels){
  panel.append(mk('p','friend-analysis-warning','Treino ainda não calculável: '+(p.reason||'Dados insuficientes.')));
  panel.append(mk('p','friend-analysis-fineprint','Informe o nível máximo no cadastro para calcular PP = 2 × (nível máximo − 1). Edição e Card ID continuam sob conferência.'));panel.append(professionalView(result,'treino'));return panel;
 }
 const header=mk('div','friend-analysis-pp');
 header.append(mk('strong','',p.pp+' / '+result.plan.pp+' PP distribuídos'),mk('span','','Restante: '+p.remaining+' PP · 10 categorias'));
 panel.append(header);
 const table=mk('table','friend-analysis-table');table.setAttribute('aria-label','Distribuição proposta de treino');
 const head=mk('thead'),tr=mk('tr');
 for(const value of ['Grupo de treino','Níveis','Custo em PP']){const th=mk('th','',value);th.scope='col';tr.append(th)}
 head.append(tr);table.append(head);
 const body=mk('tbody'),cost=window.SCOUT_TACTICS_V220.ppCost;
 p.categories.forEach((cat,i)=>{
  const r=mk('tr');if(p.levels[i]>0)r.className='friend-analysis-active';
  const cell=mk('th','',cat);cell.scope='row';r.append(cell);
  r.append(mk('td','',p.levels[i]),mk('td','',cost(p.levels[i])));
  body.append(r);
 });
 table.append(body);panel.append(table);
 if(p.baselineError)panel.append(mk('p','friend-analysis-warning',p.baselineError));
 if(p.baselineValid){
  const compare=mk('details','friend-analysis-compare');
  compare.append(mk('summary','','Comparar com o treino manual cadastrado'));
  if(p.differences.length){
   const ul=mk('ul');
   for(const d of p.differences)ul.append(mk('li','',d.name+': '+d.was+' → '+d.proposed));
   compare.append(ul);
  }else compare.append(mk('p','','A proposta ficou idêntica ao treino manual cadastrado.'));
  panel.append(compare);
 }
 if(p.evidence.length)panel.append(mk('p','friend-analysis-fineprint','Sinais individuais desta carta: '+p.evidence.join(' · ')));
 if(p.tests?.length||p.tradeoffs?.length){
  const details=mk('details','friend-analysis-compare');
  details.append(mk('summary','','Como avaliar em campo · mesma engenharia individual das principais'));
  const section=mk('div','friend-analysis-review');
  if(p.tests?.length){
   section.append(mk('strong','','Critérios de gameplay a testar'));
   const checklist=mk('ul');
   for(const item of p.tests)checklist.append(mk('li','',item));
   section.append(checklist);
  }
  if(p.tradeoffs?.length){
   section.append(mk('strong','','Compensações e evidências pendentes'));
   const tradeoffs=mk('ul');
   for(const item of p.tradeoffs)tradeoffs.append(mk('li','',item));
   section.append(tradeoffs);
  }
  details.append(section);panel.append(details);
 }
 panel.append(mk('p','friend-analysis-fineprint',p.note));
 panel.append(professionalView(result,'treino'));
 return panel;
}
function skills(result){
 const panel=mk('section','friend-analysis-panel');panel.dataset.panel='skills';
 panel.append(mk('h3','','Habilidades adicionais · candidatas por função'));
 if(!result.skills){
  panel.append(mk('p','friend-analysis-warning','Informe a posição da carta para recomendar habilidades.'));panel.append(professionalView(result,'skills'));return panel;
 }
 const s=result.skills;
 const slotsVerified=Number.isInteger(result.freeSkillSlots);
 panel.append(mk('p','friend-analysis-fineprint',
  'Adicionais informadas: '+s.alreadyEquippedProvided+'/5 · Até '+
  result.candidateCapacity+' candidatas para comparar · Vagas livres: '+
  (slotsVerified?result.freeSkillSlots+' (conferidas nesta edição)':'não comprovadas nesta edição')+
  ' · Habilidades nativas registradas: '+s.knownNative));
 if(activeCard.skills)panel.append(mk('p','friend-analysis-existing','Já informadas neste acervo: '+activeCard.skills));
 const list=mk('ol','friend-analysis-skills');
 for(const skill of result.suggestedSkills){
  const li=mk('li');
  li.append(mk('strong','',skill.name),mk('small','',skill.why));
  if(skill.synergies?.length)li.append(mk('small','',skill.synergies.join(' · ')));
  list.append(li);
 }
 for(let i=result.suggestedSkills.length;i<result.candidateCapacity;i++)
  list.append(mk('li','','Candidata adicional não identificada nesta base; disponibilidade de slot ainda precisa de confirmação.'));
 if(result.candidateCapacity===0)
  list.append(mk('li','','Nenhuma candidata adicional nesta análise: confira habilidades informadas, identidade e slots reais no jogo.'));
 if(slotsVerified&&result.freeSkillSlots===0)
  panel.append(mk('p','friend-analysis-warning',
   'Nenhuma vaga livre comprovada nesta edição. As alternativas são apenas comparativas.'));
 panel.append(list);
 const alts=s.alternatives.slice(0,3).map(x=>x.name);
 if(alts.length)panel.append(mk('p','friend-analysis-fineprint','Alternativas: '+alts.join(' · ')));
 panel.append(mk('p','friend-analysis-fineprint','Lista por função, tática, estilo e habilidades nativas informadas. Recomendações não equipadas automaticamente.'));
 panel.append(professionalView(result,'skills'));
 return panel;
}
function booster(result){
 const panel=mk('section','friend-analysis-panel');panel.dataset.panel='boost';
 panel.append(mk('h3','','Ímpeto ideal e disponibilidade'));
 const b=result.booster;
 if(!b){
  panel.append(mk('p','friend-analysis-warning','Cadastre a posição para estimar o melhor ímpeto.'));panel.append(professionalView(result,'boost'));return panel;
 }
 panel.append(infoRow('Ímpeto fixo',activeCard.fixedBooster||'Não informado'));
 panel.append(infoRow('Situação do slot',({
  vazio:'Relatado vazio pelo proprietário (elegibilidade da edição pendente)',
  ocupado:'Ocupado',
  ausente:'Inexistente nesta edição',
  pendente:'Pendente de conferência'
 })[activeCard.boosterSlot]||'Pendente'));
 if(activeCard.booster)panel.append(infoRow('Ímpeto adicional informado',activeCard.booster));
 if(b.primary){
  const pri=mk('div','friend-analysis-best');
  pri.append(mk('span','','Primeiro no ranking teórico'),mk('strong','',b.primary.nome));
  pri.append(mk('p','',b.primary.motivo));
  panel.append(pri);
  if(b.alternatives?.length)panel.append(mk('p','friend-analysis-fineprint','Alternativas: '+b.alternatives.map(x=>x.nome).join(' · ')));
 }else panel.append(mk('p','friend-analysis-warning','Sem recomendação calculável com os dados atuais.'));
 panel.append(mk('p',result.boosterEligible?'friend-analysis-confirmed':'friend-analysis-warning',
  result.boosterEligible?'Slot selecionável da edição documentado e relatado vazio: conferir no eFootball antes de qualquer aplicação.':
   activeCard.boosterSlot==='vazio'?
    'Slot relatado vazio, mas a edição não possui prova independente de elegibilidade. Ranking consultivo; NÃO gastar tokens.':
    'Não aplicar ímpeto: slot inexistente, ocupado ou ainda sem confirmação. O ranking é apenas consultivo.'));
 panel.append(mk('p','friend-analysis-fineprint',b.note||'Ranking teórico sem status finais ou partida comprovada.'));
 panel.append(professionalView(result,'boost'));
 return panel;
}
function buildCache(){
 const effective={...activeCard,position:usedPosition||activeCard.position};
 cache=Object.fromEntries(engine.MODES.map(mode=>[mode,engine.evaluate(effective,mode)]));
}
function selectPanel(value){
 if(!labels[value])return;
 panel=value;
 const nav=$('friend-analysis-sections');
 nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.panel===panel)));
 $('friend-analysis-content').querySelectorAll('[data-panel]').forEach(node=>{
  node.hidden=node.dataset.panel!==panel;
 });
}
// V306: seleção da MESMA fonte V302 também em Outros Elencos, isolada por proprietário e carta.
function ensureManagerPanel(){
 if(managerPanel)return;
 const target=$('friend-analysis-modes');
 const root=mk('section','friend-manager-v306');
 const heading=mk('h3','','Técnico e estilo desta carta');
 const subtitle=mk('p','','Escolha um destaque ou pesquise a edição exata. Favoritos ficam acessíveis rapidamente; proficiências e bônus documentados não são PP.');
 const selectorEngine=window.CRAQUE_MANAGER_SELECTOR_V328;
 const quick=mk('div','friend-manager-v328-tools');
 const searchLabel=mk('label','','Buscar técnico, edição ou ID');
 const search=mk('input');search.type='search';search.id='friend-manager-search';
 search.placeholder='Ex.: Kovač, Klopp, 2026…';
 search.autocomplete='off';search.setAttribute('aria-label','Buscar versão de técnico');
 searchLabel.append(search);
 const scopeLabel=mk('label','','Exibir técnicos');
 const scope=mk('select');scope.id='friend-manager-scope';
 // Primeiro os destaques documentados; o catálogo de 71 edições continua
 // disponível em "Todas as versões", reduzindo a carga de decisão inicial.
 for(const [id,label] of [['featured','Destaques'],['favorites','★ Favoritos'],['owned','Meus técnicos'],['all','Todas as versões']]){
  const option=mk('option','',label);option.value=id;scope.append(option);
 }
 scopeLabel.append(scope);
 const fav=mk('button','friend-manager-v328-fav','☆ Favoritar versão');
 fav.type='button';fav.setAttribute('aria-label','Favoritar ou desfavoritar esta edição');
 const count=mk('p','friend-manager-v328-count');count.setAttribute('aria-live','polite');
 quick.append(searchLabel,scopeLabel,count,fav);
 const chooser=mk('label','','Versão do técnico');
 const selection=mk('select');selection.id='friend-manager-version';selection.setAttribute('aria-label','Versão do técnico de Outros Elencos');chooser.append(selection);
 const tacticLabel=mk('label','','Estilo coletivo do técnico');
 const tactic=mk('select');tactic.id='friend-manager-tactic';tacticLabel.append(tactic);
 const statusBox=mk('div','friend-manager-status');statusBox.id='friend-manager-status';statusBox.setAttribute('aria-live','polite');
 root.append(heading,subtitle,quick,chooser,tacticLabel,statusBox);
 target.parentNode.insertBefore(root,target);
 managerPanel={root,selection,tactic,statusBox,search,scope,fav,count,selectorEngine};
 search.addEventListener('input',renderManager);
 scope.addEventListener('change',renderManager);
 fav.addEventListener('click',()=>{
  if(!managerSelectedId||!selectorEngine)return;
  try{selectorEngine.toggleFavorite(localStorage,managerSelectedId);renderManager()}
  catch(_){status('Não foi possível salvar favorito. Verifique o armazenamento.')}
 });
 selection.addEventListener('change',()=>{
  managerSelectedId=selection.value;
  const selected=managerData?.find(c=>c.catalog_id===managerSelectedId);
  managerTactic=selected?managers.preferred(selected,null):'';
  if(engine.MODES.includes(managerTactic))style=managerTactic;
  saveManager();try{display()}catch(e){status('Erro ao escolher técnico: '+e.message)}
 });
 tactic.addEventListener('change',()=>{
  if(!managerSelectedId)return;
  managerTactic=tactic.value;
  if(engine.MODES.includes(managerTactic))style=managerTactic;
  saveManager();try{display()}catch(e){status('Erro ao escolher estilo: '+e.message)}
 });
}
function renderManager(){
 ensureManagerPanel();
 const {selection,tactic,statusBox}=managerPanel;
 selection.replaceChildren();tactic.replaceChildren();statusBox.replaceChildren();
 const empty=mk('option','','Nenhum técnico selecionado');empty.value='';selection.append(empty);
 if(!managers||!managerData){
  empty.textContent=managerError||'Carregando versões dos técnicos…';
  tactic.disabled=true;return;
 }
 const v328=managerPanel.selectorEngine;
 const rows=v328?v328.filter(managerData,managers,{
  query:managerPanel.search.value,scope:managerPanel.scope.value,
  style:managerTactic||style||'posse',selected:managerSelectedId,storage:localStorage
 }):managerData.map(c=>({id:c.catalog_id,label:c.nome+' · '+(c.versao_lancamento||'data pendente'),selected:c.catalog_id===managerSelectedId}));
 const g=mk('optgroup');g.label='VERSÕES ENCONTRADAS';
 for(const row of rows){
  const opt=mk('option','',row.label);opt.value=row.id;g.append(opt);
 }
 selection.append(g);
 if(v328){
  managerPanel.count.textContent=rows.length+' de '+managerData.length+
   ' versões · seleção atual preservada mesmo com filtros';
  const favorite=v328.readIds(localStorage,v328.FAVORITES).has(managerSelectedId);
  managerPanel.fav.textContent=favorite?'★ Remover favorito':'☆ Favoritar versão';
  managerPanel.fav.disabled=!managerSelectedId;
  managerPanel.fav.setAttribute('aria-pressed',String(favorite));
 }
 const selected=managerData.find(c=>c.catalog_id===managerSelectedId);
 if(!selected){managerSelectedId='';tactic.disabled=true;
  const o=mk('option','','Escolha uma versão primeiro');tactic.append(o);
  statusBox.append(mk('p','','Sem técnico vinculado a esta carta. As cinco simulações continuam disponíveis.'));
  return;
 }
 selection.value=selected.catalog_id;tactic.disabled=false;
 for(const st of managers.STYLES){
  const score=managers.proficiency(selected,st.id);
  const opt=mk('option','',st.label+' · '+(score===null?'não documentada':score)+
   (!st.supported?' · motor PP pendente':score<85?' · uso com ressalvas':''));
  opt.value=st.id;tactic.append(opt);
 }
 if(!managers.STYLES.some(s=>s.id===managerTactic))managerTactic=managers.preferred(selected,null);
 tactic.value=managerTactic;
 const statusModel=managers.model(selected,managerTactic);
 statusBox.append(mk('p','','Versão: '+selected.nome+' · '+(selected.versao_lancamento||'data pendente')+
  ' · '+selected.catalog_id+' (ID interno, não Konami).'));
 const portrait=managers.portraitFor?.(selected.catalog_id);
 if(portrait){
  const photo=mk('img','friend-manager-portrait');photo.src=portrait;
  photo.alt='Imagem fornecida pelo usuário para '+selected.nome;statusBox.append(photo);
 }
 const allScores=mk('div','friend-manager-scores');
 for(const entry of managers.STYLES){
  const value=managers.proficiency(selected,entry.id);
  const item=mk('div',value!==null&&value>=89?'friend-manager-score-elite':
   value!==null&&value>=85?'friend-manager-score-strong':'',
   entry.label+': '+(value===null?'pendente':value)+(!entry.supported?' · PP pendente':''));
  allScores.append(item);
 }
 statusBox.append(allScores);
 statusBox.append(mk('p',statusModel.score!==null&&statusModel.score<85?'friend-manager-warning':'',
  'Proficiência: '+(statusModel.score??'não confirmada')+' · '+(
   !statusModel.canCalculate?'Sem motor específico de PP para este estilo.':
   statusModel.score>=89?'Alta proficiência competitiva.':
   statusModel.score>=85?'Alternativa com ressalvas.':'Proficiência baixa: não equivale ao estilo principal.'
  )));
 if(selected.afinidade_PTBR)statusBox.append(mk('p','','Afinidade para comandar: '+selected.afinidade_PTBR));
 statusBox.append(mk('p','','Bônus informados: '+((selected.boosters_PTBR||selected.boosters_EN)?.join(' · ')||'não documentados')+
  '. Não converter em PP nem em atributo final sem dados-base.'));
 if(selected.ativacao_das_combinacoes?.length){
  for(const link of selected.ativacao_das_combinacoes){
   statusBox.append(mk('p','','Combinação '+link.name_EN+': '+(selected.catalog_id==='CT-MGR-071'?(link.name_EN==='Shadow Link B'?'Atacante pivô':'Lateral ofensivo'):(link.centrepiece_playstyle_EN||'?'))+
    ' ('+(selected.catalog_id==='CT-MGR-071'?(link.name_EN==='Shadow Link B'?'SA':'LE/LD'):(link.centrepiece_position_EN||'?'))+') + '+(selected.catalog_id==='CT-MGR-071'?'Homem de área':(link.keyman_playstyle_EN||'?'))+
    ' ('+(selected.catalog_id==='CT-MGR-071'?'CA':(link.keyman_position_EN||'?'))+'). Ativação não comprovada na escalação.'));
  }
 }
 if(managerTactic==='overload')statusBox.append(mk('p','friend-manager-warning',
  'Sobreposição: sem ficha PP própria homologada. O painel abaixo conserva a última simulação de um dos cinco estilos suportados.'));
 statusBox.append(mk('p','',managerError||
  'Perfil documental V302; retratos externos não incorporados. Treino, habilidades e ímpetos continuam hipóteses específicas da carta e da tática.'));
}
function identity(){
 $('friend-analysis-title').textContent='Ficha do app · '+activeCard.name;
 $('friend-analysis-owner').textContent='Coleção '+activeOwner.name;
 $('friend-analysis-player').textContent=activeCard.name;
 $('friend-analysis-edition').textContent=activeCard.edition||'Edição ainda não confirmada';
 const badges=$('friend-analysis-badges');badges.replaceChildren(
  mk('span','',(activeCard.position||'posição pendente')+' → '+(usedPosition||activeCard.position||'?')+' (uso)'),
  mk('span','',activeCard.style||'Estilo pendente'),
  mk('span','',(()=>{const budget=engine.resolveBudget(activeCard);
   return budget.pp===null?'PP pendentes':budget.pp+' PP'+(budget.source==='nivel_maximo'?' (nível)':'');})()));
 const img=$('friend-analysis-cover'),empty=$('friend-analysis-cover-empty');
 img.hidden=!activeCard.image;empty.hidden=!!activeCard.image;
 if(activeCard.image){img.src=activeCard.image;img.alt='Imagem cadastrada de '+activeCard.name;}
 else img.removeAttribute('src');
}
function display(){
 if(!activeCard)return;
 if(!cache)buildCache();
 const result=cache[style];
 identity();
 renderManager();
 if(positional)positional.update({style,manager:managerSelectedId});
 $('friend-analysis-modes').querySelectorAll('button').forEach(b=>{
  const active=b.dataset.style===style;b.setAttribute('aria-pressed',String(active));
  const plan=cache[b.dataset.style]?.plan;
  const pending=plan?.status!=='hipotese';
  b.replaceChildren(mk('strong','',engine.LABEL[b.dataset.style]),
   mk('small','',pending?'Treino pendente':(plan.pp+' PP · hipótese')));
  b.title=pending?'Preencha o nível máximo e a posição para calcular os PP; confira divergências manuais.':
   'Ficha calculada pelo app; conferir atributos antes de aplicar no jogo.';
 });
 const container=$('friend-analysis-content');
 container.replaceChildren(summaryCard(result),training(result),skills(result),booster(result));
 selectPanel(panel);
 const valid=(usedPosition===activeCard.position)&&engine.validateSaved(activeCard,activeCard.analysis);
 const allCalculated=engine.MODES.every(id=>cache[id].plan.status==='hipotese');
 $('friend-analysis-state').textContent=usedPosition!==activeCard.position?
  'Posição de uso '+usedPosition+' · proposta independente. Utilize “Salvar proposta” no seletor posicional, sem substituir a build original.':
  !allCalculated?
  'As fichas permanecem pendentes quando falta o nível máximo/PP ou existe divergência manual. Confira o cadastro.':
  valid?'Cinco treinos por estilo gerados e registrados neste acervo. Habilidades e ímpetos são recomendações calculadas ao abrir.':
  'Cinco propostas calculadas pelo app. Use “Gerar e salvar 5 fichas” para registrar os treinos neste acervo.';
}
function openCard(card,owner,onSave,onEdit){
 if(!card||!owner||card.ownerId!==owner.id){status('Erro: carta e pessoa não correspondem.');return}
 activeCard=card;activeOwner=owner;saveCallback=onSave;editCallback=onEdit||null;
 style='posse';panel='treino';cache=null;managerError='';restoreManager();
 positional?.destroy();positional=null;usedPosition=activeCard.position;
 const shared=window.CRAQUE_POSITIONAL_V311,ui=window.CRAQUE_POSITIONAL_UI_V311;
 if(shared&&ui){
  const modes=$('friend-analysis-modes'),slot=mk('div','friend-position-scenario-slot');
  modes.parentNode.insertBefore(slot,modes);
  const model=shared.fromExternal(activeCard,activeOwner);
  positional=ui.create(slot,model,{style,manager:managerSelectedId,
   onPositionChange:pos=>{
    usedPosition=pos;cache=null;display();
   },
   onStyleSelect:chosen=>{
    // Prévia explícita de outro estilo, não salva/aplica treino.
    if(!engine.MODES.includes(chosen))return;
    style=chosen;
    if(managerSelectedId){managerTactic=chosen;saveManager()}
    display();
   }});
  usedPosition=positional?.selectedPosition||activeCard.position;
 }
 $('friend-analysis-feedback').textContent='';
 if(managers?.load){
  const openedCardId=card.id,openedOwnerId=owner.id;
  managers.load().then(data=>{
   if(activeCard?.id!==openedCardId||activeOwner?.id!==openedOwnerId)return;
   managerData=data.tecnicos;if(managerSelectedId&&!managerData.some(c=>c.catalog_id===managerSelectedId)){
    managerError='Versão salva não localizada neste catálogo; seleção preservada para revisão.';
   }
   renderManager();
  }).catch(err=>{managerError='Catálogo indisponível: '+String(err.message||err);renderManager();});
 }else managerError='Catálogo de técnicos não carregou.';
 try{display();if(!modal.open)modal.showModal()}
 catch(e){status('Não foi possível calcular: '+(e.message||e));if(!modal.open)modal.showModal()}
}
const tabs=$('friend-analysis-modes');
for(const mode of engine.MODES){
 const btn=mk('button','',engine.LABEL[mode]);btn.type='button';btn.dataset.style=mode;
 btn.setAttribute('aria-pressed','false');btn.onclick=()=>{style=mode;if(managerSelectedId){managerTactic=mode;saveManager()}try{display()}catch(e){status('Erro ao trocar tática: '+e.message)}};
 tabs.append(btn);
}
$('friend-analysis-sections').querySelectorAll('button').forEach(b=>{
 b.onclick=()=>selectPanel(b.dataset.panel);
});
$('friend-analysis-edit').onclick=()=>{
 if(typeof editCallback!=='function')return;
 modal.close();editCallback();
};
$('friend-analysis-close').onclick=()=>modal.close();
$('friend-analysis-save').onclick=()=>{
 if(!activeCard||typeof saveCallback!=='function')return;
 const button=$('friend-analysis-save');button.disabled=true;
 try{
  if(usedPosition!==activeCard.position||managerSelectedId){
   const scenario=positional?.current;
   if(!scenario)throw Error('Cenário posicional não disponível');
   const rev=window.CRAQUE_POSITIONAL_V311.save(localStorage,scenario);
   cache=null;status('Proposta '+usedPosition+' salva na revisão '+rev.revision+
    ' somente para este proprietário, técnico e estilo. Build original preservada.');
   display();return;
  }
  const next=engine.generate(activeCard);
  const updated=saveCallback(activeCard,{...activeCard,analysis:next});
  if(updated)activeCard=updated;
  cache=null;
  const count=Object.values(next.profiles).filter(x=>x.status==='hipotese').length;
  status(count===5?'Cinco treinamentos experimentais registrados no acervo de '+activeOwner.name+'. Nenhuma carta sua foi alterada.':
   count+' treinos simulados e '+(5-count)+' pendentes por falta de nível/posição ou conflito de PP. Nenhum PP foi inventado.');
  display();
 }catch(e){status('Fichas não salvas: '+String(e.message||e))}
 finally{button.disabled=false}
};
$('friend-analysis-export').onclick=async()=>{
 if(!activeCard)return;
 const btn=$('friend-analysis-export');btn.disabled=true;
 try{
  const all={format:'craque-friend-training-v228',createdAt:new Date().toISOString(),
   ownerName:activeOwner.name,card:{name:activeCard.name,edition:activeCard.edition,cardId:activeCard.cardId,position:activeCard.position,level:activeCard.level,pp:engine.resolveBudget(activeCard).pp,pp_source:engine.resolveBudget(activeCard).source},
   caveat:'Treinos hipotéticos, habilidades e boosters são sugestões condicionais não validadas em gameplay. Não são aplicações no eFootball.',
   position_used:usedPosition||activeCard.position,manager_edition:managerSelectedId||null,
   styles:Object.fromEntries(engine.MODES.map(tactic=>{
    const x=engine.evaluate({...activeCard,position:usedPosition||activeCard.position},tactic);
    return [tactic,{tactic:x.label,confidence:x.confidence,training:x.plan,extraSkills:x.suggestedSkills,
     booster:x.booster?.primary||null,boosterEligible:x.boosterEligible,warnings:x.warnings}];
   }))};
  const clean=activeCard.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]/gi,'_').slice(0,35);
  const result=await window.SCOUT_FILE_EXPORT.saveJson(all,'CraqueTatico-Ficha-'+clean+'.json');
  status(result.status==='saved'?'Ficha individual exportada para conferência.':
   result.status==='cancelled'?'Exportação cancelada. Nada foi alterado.':
   'Download solicitado. Confira a pasta Downloads.');
 }catch(e){status('Falha na exportação: '+e.message)}
 finally{btn.disabled=false}
};
window.CRAQUE_FRIEND_TRAINING_UI_V228=Object.freeze({openCard});
})();