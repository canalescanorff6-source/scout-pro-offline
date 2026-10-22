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
let panel='treino',cache=null;
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
  infoRow('Orçamento',Number.isInteger(activeCard.pp)?activeCard.pp+' PP':'PP pendentes'),
  infoRow('Precisão',result.confidence==='simulacao_documentada_parcial'?'Simulação parcial':'Hipótese pendente de validação'));
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
function training(result){
 const panel=mk('section','friend-analysis-panel');panel.dataset.panel='treino';
 panel.append(mk('h3','','Ficha de treino · '+result.label));
 const p=result.plan;
 if(p.status!=='hipotese'||!p.levels){
  panel.append(mk('p','friend-analysis-warning','Treino ainda não calculável: '+(p.reason||'Dados insuficientes.')));
  panel.append(mk('p','friend-analysis-fineprint','Cadastre posição e PP reais na opção Editar. O aplicativo não inventará níveis nem atributos.'));return panel;
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
 if(p.evidence.length)panel.append(mk('p','friend-analysis-fineprint','Critérios desta carta: '+p.evidence.join(' · ')));
 panel.append(mk('p','friend-analysis-fineprint',p.note));
 return panel;
}
function skills(result){
 const panel=mk('section','friend-analysis-panel');panel.dataset.panel='skills';
 panel.append(mk('h3','','Habilidades adicionais · até 5 espaços'));
 if(!result.skills){
  panel.append(mk('p','friend-analysis-warning','Informe a posição da carta para recomendar habilidades.'));return panel;
 }
 const s=result.skills;
 panel.append(mk('p','friend-analysis-fineprint',
  'Já informadas: '+s.alreadyEquippedProvided+'/5 · Novas vagas: '+result.freeSkillSlots+
  ' · Habilidades nativas registradas: '+s.knownNative));
 if(activeCard.skills)panel.append(mk('p','friend-analysis-existing','Já informadas neste acervo: '+activeCard.skills));
 const list=mk('ol','friend-analysis-skills');
 for(const skill of result.suggestedSkills){
  const li=mk('li');
  li.append(mk('strong','',skill.name),mk('small','',skill.why));
  if(skill.synergies?.length)li.append(mk('small','',skill.synergies.join(' · ')));
  list.append(li);
 }
 for(let i=result.suggestedSkills.length;i<result.freeSkillSlots;i++)
  list.append(mk('li','','Espaço livre — habilidade não identificada nesta base; confira antes de usar tokens.'));
 if(!result.freeSkillSlots)list.append(mk('li','','Os cinco espaços já constam como informados. Não sugerir duplicatas.'));
 panel.append(list);
 const alts=s.alternatives.slice(0,3).map(x=>x.name);
 if(alts.length)panel.append(mk('p','friend-analysis-fineprint','Alternativas: '+alts.join(' · ')));
 panel.append(mk('p','friend-analysis-fineprint','Lista por função, tática, estilo e habilidades nativas informadas. Recomendações não equipadas automaticamente.'));
 return panel;
}
function booster(result){
 const panel=mk('section','friend-analysis-panel');panel.dataset.panel='boost';
 panel.append(mk('h3','','Ímpeto ideal e disponibilidade'));
 const b=result.booster;
 if(!b){
  panel.append(mk('p','friend-analysis-warning','Cadastre a posição para estimar o melhor ímpeto.'));return panel;
 }
 panel.append(infoRow('Ímpeto fixo',activeCard.fixedBooster||'Não informado'));
 panel.append(infoRow('Situação do slot',({
  vazio:'Vazio, confirmado pelo usuário',
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
  result.boosterEligible?'Slot vazio informado: sugestão elegível para conferência no eFootball; não foi aplicada.':
   'Não aplicar ímpeto: slot inexistente, ocupado ou ainda sem confirmação. O ranking é apenas consultivo.'));
 panel.append(mk('p','friend-analysis-fineprint',b.note||'Ranking teórico sem status finais ou partida comprovada.'));
 return panel;
}
function buildCache(){
 cache=Object.fromEntries(engine.MODES.map(mode=>[mode,engine.evaluate(activeCard,mode)]));
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
function identity(){
 $('friend-analysis-title').textContent='Ficha do app · '+activeCard.name;
 $('friend-analysis-owner').textContent='Coleção '+activeOwner.name;
 $('friend-analysis-player').textContent=activeCard.name;
 $('friend-analysis-edition').textContent=activeCard.edition||'Edição ainda não confirmada';
 const badges=$('friend-analysis-badges');badges.replaceChildren(
  mk('span','',activeCard.position||'Posição pendente'),
  mk('span','',activeCard.style||'Estilo pendente'),
  mk('span','',Number.isInteger(activeCard.pp)?activeCard.pp+' PP':'PP pendentes'));
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
 $('friend-analysis-modes').querySelectorAll('button').forEach(b=>{
  const active=b.dataset.style===style;b.setAttribute('aria-pressed',String(active));
  const plan=cache[b.dataset.style]?.plan;
  const pending=plan?.status!=='hipotese';
  b.replaceChildren(mk('strong','',engine.LABEL[b.dataset.style]),
   mk('small','',pending?'Treino pendente':(plan.pp+' PP · hipótese')));
  b.title=pending?'Preencha o PP e a posição para calcular esta ficha.':
   'Ficha calculada pelo app; conferir atributos antes de aplicar no jogo.';
 });
 const container=$('friend-analysis-content');
 container.replaceChildren(summaryCard(result),training(result),skills(result),booster(result));
 selectPanel(panel);
 const valid=engine.validateSaved(activeCard,activeCard.analysis);
 const allCalculated=engine.MODES.every(id=>cache[id].plan.status==='hipotese');
 $('friend-analysis-state').textContent=!allCalculated?
  'As cinco fichas estão disponíveis para consulta, mas o treino permanece PENDENTE onde faltam PP ou dados. Complete o cadastro para liberar o cálculo.':
  valid?'Cinco treinos por estilo gerados e registrados neste acervo. Habilidades e ímpetos são recomendações calculadas ao abrir.':
  'Cinco propostas calculadas pelo app. Use “Gerar e salvar 5 fichas” para registrar os treinos neste acervo.';
}
function openCard(card,owner,onSave,onEdit){
 if(!card||!owner||card.ownerId!==owner.id){status('Erro: carta e pessoa não correspondem.');return}
 activeCard=card;activeOwner=owner;saveCallback=onSave;editCallback=onEdit||null;
 style='posse';panel='treino';cache=null;
 $('friend-analysis-feedback').textContent='';
 try{display();if(!modal.open)modal.showModal()}
 catch(e){status('Não foi possível calcular: '+(e.message||e));if(!modal.open)modal.showModal()}
}
const tabs=$('friend-analysis-modes');
for(const mode of engine.MODES){
 const btn=mk('button','',engine.LABEL[mode]);btn.type='button';btn.dataset.style=mode;
 btn.setAttribute('aria-pressed','false');btn.onclick=()=>{style=mode;try{display()}catch(e){status('Erro ao trocar tática: '+e.message)}};
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
  const next=engine.generate(activeCard);
  const updated=saveCallback(activeCard,{...activeCard,analysis:next});
  if(updated)activeCard=updated;
  cache=null;
  const count=Object.values(next.profiles).filter(x=>x.status==='hipotese').length;
  status(count===5?'Cinco treinamentos experimentais registrados no acervo de '+activeOwner.name+'. Nenhuma carta sua foi alterada.':
   count+' treinos simulados e '+(5-count)+' pendentes por ausência de dados. Nenhum PP foi inventado.');
  display();
 }catch(e){status('Fichas não salvas: '+String(e.message||e))}
 finally{button.disabled=false}
};
$('friend-analysis-export').onclick=async()=>{
 if(!activeCard)return;
 const btn=$('friend-analysis-export');btn.disabled=true;
 try{
  const all={format:'craque-friend-training-v228',createdAt:new Date().toISOString(),
   ownerName:activeOwner.name,card:{name:activeCard.name,edition:activeCard.edition,cardId:activeCard.cardId,position:activeCard.position,pp:activeCard.pp},
   caveat:'Treinos hipotéticos, habilidades e boosters são sugestões condicionais não validadas em gameplay. Não são aplicações no eFootball.',
   styles:Object.fromEntries(engine.MODES.map(tactic=>{
    const x=engine.evaluate(activeCard,tactic);
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