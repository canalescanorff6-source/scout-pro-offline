/* Scout PRO V218 — uma ficha principal interativa.
 * O cadastro da carta e o treino registrado permanecem imutáveis.
 * Ajustes e cenários são SIMULAÇÕES locais de PP, nunca homologação automática.
 */
(function(host){
'use strict';
const CATEGORY=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
function valid(vec){
 return Array.isArray(vec)&&vec.length===10&&vec.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
}
function ppCost(level){
 if(!Number.isInteger(level)||level<0||level>20)throw Error('Nível inválido');
 let sum=0;for(let n=0;n<level;n++)sum+=1+Math.floor(n/4);
 return sum;
}
function total(vec){return valid(vec)?vec.reduce((sum,n)=>sum+ppCost(n),0):null}
function adjust(vec,index,delta,budget){
 if(!valid(vec)||!Number.isInteger(index)||index<0||index>9||![-1,1].includes(delta))return null;
 const n=vec[index]+delta;
 if(n<0||n>20)return null;
 const next=vec.slice();next[index]=n;
 if(!Number.isInteger(budget)||budget<0||total(next)>budget)return null;
 return next;
}
function readSaved(raw,id,card,budget){
 if(!raw||typeof raw!=='object'||raw.id!==String(id)||raw.card!==String(card))return null;
 if(!valid(raw.train)||!Number.isInteger(budget)||budget<0||total(raw.train)>budget)return null;
 return {levels:raw.train.slice(),source:String(raw.source||'simulação pessoal').slice(0,90)};
}
function scenarioPlan(data,key,budget,official){
 const vec=data?.[key];
 if(!valid(vec)||!Number.isInteger(budget)||budget<0||total(vec)!==budget)return null;
 if(valid(official)&&vec.every((n,i)=>n===official[i]))return null;
 return vec.slice();
}
function make(doc,tag,cls,text){
 const e=doc.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;
}
function mount(doc){
 if(!doc||doc.body?.dataset.page!=='detail')return false;
 if(doc.getElementById('scout-v218-controls'))return true;
 const table=doc.getElementById('scout-v208-training'),panel=doc.querySelector('#scout-v188-principal .scout-v188-progress');
 const raw=doc.getElementById('scout-v68-data'),labRaw=doc.getElementById('lab-data');
 if(!table||!panel||!raw||!labRaw)return false;
 let card={},lab={};try{card=JSON.parse(raw.textContent);lab=JSON.parse(labRaw.textContent)}catch(_e){return false}
 const budget=Number(card.pp),id=String(card.id),capture=Number(card.capture),filename=String(lab.card||'');
 if(!Number.isInteger(budget)||budget<0||!id||!filename)return false;
 const official=valid(card.recommended_levels)?card.recommended_levels.slice():null;
 const officialValid=valid(official)&&total(official)===budget;
 const fallback=valid(lab?.draftA)&&total(lab.draftA)===budget?lab.draftA.slice():null;
 const original=officialValid?official:(fallback||null);
 const storageKey='scoutpro:v67:'+id+':'+filename;
 // Bloquear editor se a confirmação local V248 da edição exata divergir
 // do orçamento usado na ficha. Nunca mudar builds originais automaticamente.
 const localPPMismatch=()=>{
  try{
   const value=JSON.parse(host.localStorage?.getItem('scoutpro:v248:level-review:'+
    capture+'@'+id)||'null');
   if(!value||value.schema!=='CRAQUE_PROGRESS_REVIEW_V248'||
    value.confirmed_in_game!==true||Number(value.numero)!==capture||
    String(value.card_id)!==id||String(value.name)!==String(card.name)||
    !Number.isInteger(value.level)||value.level<1||value.level>120||
    value.pp!==2*(value.level-1)||value.pp===budget)return null;
   return {pp:value.pp,level:value.level};
  }catch(_){return null}
 };
 let saved=null;try{saved=readSaved(JSON.parse(host.localStorage?.getItem(storageKey)||'null'),id,filename,budget)}catch(_e){}
 // O laboratório V67 salvava somente train/source. Compatibilizar sem migrar dados.
 if(!saved){
  try{const legacy=JSON.parse(host.localStorage?.getItem(storageKey)||'null');
   if(legacy&&valid(legacy.train)&&total(legacy.train)<=budget)saved={levels:legacy.train.slice(),source:String(legacy.source||'treino pessoal').slice(0,90)};
  }catch(_e){}
 }
 let current=saved?saved.levels:(original?original.slice():null);
 let custom=!!saved,sourceLabel=String(saved?.source||'');
 let editing=false;
 let activeTactic='posse',styleLabel='Posse de Bola',suggested=null;
 let autoPreview=!saved&&!original,referenceOnly=false;
 const keyForTactic=()=>activeTactic==='posse'?storageKey:storageKey+':tactic:'+activeTactic;
 // V324: o editor principal passa a persistir na mesma identidade do
 // painel posicional, incluindo versão EXATA do técnico e posição de uso.
 const profiles=host.CRAQUE_MANAGER_FICHAS_V324;
 let activeProfileContext=null,profileError='';
 const contextForTactic=()=>activeProfileContext&&profiles?
  profiles.withStyle(activeProfileContext,activeTactic):null;
 const readProfile=()=>{
  const context=contextForTactic();
  if(!context)return null;
  const record=profiles.read(host.localStorage,context);
  return record?{levels:record.train.slice(),source:record.source,skills:record.skills,
   booster:record.booster}:null;
 };
 const head=panel.querySelector('#scout-v208-heading');
 if(head){
  const prefix=head.querySelector('.scout-v208-scenario');
  if(prefix)prefix.textContent='SCOUT · ';
  const words=head.querySelector('span:last-child');
  if(words)words.textContent=officialValid?'Treino registrado · Posse':'Treino em revisão · Posse';
 }
 const ui=make(doc,'div','scout-v218-controls');ui.id='scout-v218-controls';
 const tag=make(doc,'div','scout-v218-status');tag.id='scout-v218-status';tag.setAttribute('aria-live','polite');
 const intro=make(doc,'p','scout-v218-intro','Uma única ficha para consultar e ajustar. Os PP editados são um rascunho local; não substituem a build cadastrada nem aplicam treino no jogo.');
 const actions=make(doc,'div','scout-v218-actions');
 const btnEdit=make(doc,'button','scout-v218-button scout-v218-primary','Editar pontos');btnEdit.type='button';btnEdit.id='scout-v218-edit';
 const btnReset=make(doc,'button','scout-v218-button','Restaurar treino registrado');btnReset.type='button';btnReset.id='scout-v218-reset';
 actions.append(btnEdit,btnReset);
 const compare=make(doc,'details','scout-v218-compare');compare.id='scout-v218-compare';
 compare.append(make(doc,'summary','','Comparar outros cenários A/B/P (opcional)'));
 const compareInner=make(doc,'div','scout-v218-choices');
 const available=['A','B','P'].map(key=>({key,vec:scenarioPlan(lab,key,budget,official)})).filter(x=>x.vec);
 for(const entry of available){
  const button=make(doc,'button','scout-v218-button','Testar cenário '+entry.key);
  button.type='button';button.dataset.scenario=entry.key;
  button.addEventListener('click',()=>{
   if(localPPMismatch())return;
   current=entry.vec.slice();custom=true;sourceLabel='Cenário '+entry.key+' (simulação)';
   editing=true;writeLocal();notify('save');refresh();
  });
  compareInner.append(button);
 }
 if(!available.length)compareInner.append(make(doc,'p','scout-v218-muted','Sem cenários alternativos válidos e diferentes do treino registrado nesta carta.'));
 compareInner.append(make(doc,'p','scout-v218-muted','Comparações não comprovam que o cenário é melhor. Use o registro no topo como referência até obter atributos finais e testes.'));
 compare.append(compareInner);
 const note=make(doc,'p','scout-v218-feedback');note.id='scout-v218-feedback';note.setAttribute('aria-live','polite');
 ui.append(tag,intro,actions,compare,note);
 table.insertAdjacentElement('beforebegin',ui);
 const rows=[...table.querySelectorAll('tbody tr')];
 const status=table.querySelector('.scout-v208-total');
 const readNote=doc.getElementById('scout-v208-note');
 function writeLocal(){
  if(localPPMismatch())return false;
  if(!valid(current))return false;
  try{
   const context=contextForTactic();
   if(context){
    const previous=profiles.read(host.localStorage,context);
    profiles.save(host.localStorage,context,{
     train:current.slice(),skills:previous?.skills||[],booster:previous?.booster||'',
     source:'V324 · Rascunho PP de '+activeTactic
    });
    profileError='';
    host.dispatchEvent(new host.CustomEvent('scoutpro:v324:profile-saved',
     {detail:{key:profiles.key(context)}}));
    return true;
   }
   // Sem técnico cadastrado o editor continua legado, sem migrar
   // automaticamente treino histórico para uma edição não comprovada.
   host.localStorage.setItem(keyForTactic(),JSON.stringify({train:current.slice(),source:'V220 · '+sourceLabel,updated:new Date().toISOString(),id,card:filename,tactic:activeTactic}));
   return true;
  }catch(e){profileError=String(e.message||e);return false}
 }
 function notify(mode){
  // Não repassar cenários por técnico ao laboratório legado sem contexto:
  // isso poderia sobrescrever o rascunho de outro treinador.
  const context=contextForTactic();
  if(!context&&activeTactic==='posse')host.dispatchEvent(new host.CustomEvent('scoutpro:training-edit-v218',{detail:{cap:capture,card_id:id,levels:current.slice(),mode}}));
  if(context&&activeTactic==='posse'&&valid(current))
   host.dispatchEvent(new host.CustomEvent('scoutpro:training-preview-v324',
    {detail:{cap:capture,card_id:id,levels:current.slice(),manager:context.manager,position:context.position,mode}}));
  host.dispatchEvent(new host.CustomEvent('scoutpro:training-updated-v220',{detail:{
   cap:capture,card_id:id,tactic:activeTactic,levels:current.slice(),mode,
   manager:context?.manager||null,position:context?.position||null,
   contextual:Boolean(context)}}));
 }
 function setDelta(i,delta){
  if(localPPMismatch())return;
  const next=adjust(current,i,delta,budget);
  if(!next)return;
  current=next;custom=true;autoPreview=false;referenceOnly=false;
  sourceLabel='Rascunho pessoal · '+styleLabel;
  const persisted=writeLocal();
  notify('save');refresh();
  note.textContent=persisted?'Rascunho salvo somente neste dispositivo.':'Prévia alterada, mas o armazenamento local não permitiu salvar.';
 }
 function restore(){
  if(localPPMismatch())return;
  // Reset por técnico não apaga histórico independente; o usuário visualiza
  // a referência, mantendo as revisões V324 consultáveis.
  if(!contextForTactic())try{host.localStorage.removeItem(keyForTactic())}catch(_e){}
  if(activeTactic==='posse'){
   current=original?original.slice():null;
   custom=false;editing=false;autoPreview=false;referenceOnly=false;sourceLabel='';
   notify('restore');refresh();
   note.textContent=officialValid?'Treino registrado restaurado. Nenhum nível da carta original foi modificado.':'Não há distribuição cadastrada e validada em PP; a prévia permanece zerada até escolher um rascunho.';
  }else{
   current=suggested?suggested.slice():original?original.slice():null;
   referenceOnly=!suggested&&!!original;autoPreview=true;
   custom=!!suggested;editing=false;
   sourceLabel=referenceOnly?'Treino cadastrado · não recalculado para esta tática':
    suggested?'Hipótese tática · '+styleLabel:'Aguardando nível e PP comprovados';
   refresh();notify('restore');
   note.textContent='Hipótese inicial de '+styleLabel+' restaurada; não substitui a build cadastrada da carta.';
  }
 }
 function refresh(){
  const clash=localPPMismatch();
  if(clash)editing=false;
  const spent=valid(current)?total(current):null;
  const budgetRemaining=spent===null?null:budget-spent;
  tag.textContent=(referenceOnly?'REFERÊNCIA DO CADASTRO · NÃO RECALCULADA':
   spent===null?'DISTRIBUIÇÃO PENDENTE':
   custom?(activeTactic==='posse'?'SIMULAÇÃO PESSOAL':'HIPÓTESE / RASCUNHO TÁTICO'):
   officialValid?'REGISTRO DA CARTA':'PRÉVIA SEM HOMOLOGAÇÃO')+
   ' · '+(spent===null?'—':spent)+' / '+budget+' PP'+
   (contextForTactic()?' · '+activeProfileContext.manager+' · '+activeProfileContext.position:'')+
   (sourceLabel?' · '+sourceLabel:'');
  tag.dataset.mode=clash?'blocked':referenceOnly?'pending':custom?'draft':officialValid?'registered':'pending';
  if(clash)tag.textContent='PP DIVERGENTES: '+clash.pp+' PP conferidos (nível '+clash.level+
   ') contra '+budget+' PP do catálogo. Não editar antes de corrigir.';
  status.textContent=(spent===null?'—':spent)+' / '+budget;
  btnEdit.textContent=editing?'Concluir edição':'Editar pontos';
  btnReset.disabled=activeTactic==='posse'?!custom:false;
  btnEdit.disabled=Boolean(clash);
  if(!valid(current))btnEdit.disabled=true;
  if(clash)btnReset.disabled=true;
  btnReset.textContent=contextForTactic()?'Ver referência (preserva revisões)':
   activeTactic==='posse'?'Restaurar treino registrado':'Restaurar hipótese inicial';
  const headerText=head?.querySelector('span:last-child');if(headerText)headerText.textContent=activeTactic==='posse'?(officialValid?'Treino registrado · Posse':'Treino em revisão · Posse'):'Prévia experimental · '+styleLabel;
  compare.hidden=activeTactic!=='posse';
  if(readNote&&clash)readNote.textContent='REVISÃO OBRIGATÓRIA: PP divergentes nesta edição. Não use nem edite esta distribuição até corrigi-la.';
  else if(readNote&&spent===null)readNote.textContent='Distribuição indisponível nesta tática. Níveis pendentes NÃO são zero; confira a edição e o nível máximo.';
  else if(readNote&&referenceOnly)readNote.textContent='Mostrando apenas a distribuição já cadastrada, sem recalcular. Nível máximo ainda não comprovado para criar uma hipótese segura neste estilo.';
  else if(readNote)readNote.textContent=custom?
   (budgetRemaining===0?(sourceLabel.startsWith('Hipótese tática')||sourceLabel.includes('Simulação de Posse')?
     'PROPOSTA MATEMÁTICA '+styleLabel+': PP fechados, sem homologação ou atributos finais. Pode editar e comparar sem alterar a carta.':
     'Simulação pessoal com PP fechados. Não substitui o treino registrado no Scout PRO.'):
    'Simulação pessoal incompleta: '+budgetRemaining+' PP ainda não distribuídos. Não considerar homologada.'):
   (officialValid?'Treino cadastrado com custo PP correto, mas desempenho não homologado em partidas. Use Editar pontos para testar mudanças.':'Treino final sem confirmação nesta edição. Preencha apenas como simulação e valide os atributos no jogo.');
  table.classList.toggle('scout-v218-editing',editing);
  table.dataset.scoutV218Mode=custom?'draft':'registered';
  for(let i=0;i<rows.length;i++){
   const cell=rows[i].querySelector('.scout-v208-level'),pp=rows[i].querySelector('.scout-v208-cost');
   if(!cell||!pp)continue;
   cell.replaceChildren();
   if(editing&&valid(current)){
    const ctl=make(doc,'span','scout-v218-stepper');
    const minus=make(doc,'button','scout-v218-step','−');minus.type='button';minus.setAttribute('aria-label','Reduzir '+CATEGORY[i]);
    const value=make(doc,'span','scout-v218-level',current[i]);
    const plus=make(doc,'button','scout-v218-step','+');plus.type='button';plus.setAttribute('aria-label','Aumentar '+CATEGORY[i]);
    minus.disabled=adjust(current,i,-1,budget)===null;
    plus.disabled=adjust(current,i,1,budget)===null;
    minus.addEventListener('click',()=>setDelta(i,-1));
    plus.addEventListener('click',()=>setDelta(i,1));
    ctl.append(minus,value,plus);cell.append(ctl);
   }else cell.textContent=valid(current)?String(current[i]):'—';
   pp.textContent=valid(current)?String(ppCost(current[i])):'—';
  }
 }
 btnEdit.addEventListener('click',()=>{if(localPPMismatch())return;editing=!editing;refresh()});
 host.addEventListener('scoutpro:tactic-selected-v220',event=>{
  const info=event.detail||{};
  if(Number(info.cap)!==capture||String(info.card_id)!==id)return;
  if(!['posse','normal','rapido','fora','longo'].includes(info.tactic))return;
  activeTactic=info.tactic;styleLabel=String(info.label||info.tactic);
  const proposal=info.proposedLevels;
  suggested=valid(proposal)&&total(proposal)===budget?proposal.slice():null;
  let savedForStyle=null;
  if(activeProfileContext&&profiles){
   try{
    activeProfileContext=profiles.withStyle(activeProfileContext,activeTactic);
    savedForStyle=readProfile();
    profileError='';
   }catch(e){profileError=String(e.message||e)}
  }else try{
   const raw=JSON.parse(host.localStorage?.getItem(keyForTactic())||'null');
   savedForStyle=readSaved(raw,id,filename,budget);
  }catch(_e){}
  if(activeTactic==='posse'){
   current=savedForStyle?savedForStyle.levels.slice():
    original?original.slice():suggested?suggested.slice():null;
   custom=Boolean(savedForStyle||!original&&suggested);
   sourceLabel=savedForStyle?.source||
    (!original&&suggested?'Simulação de Posse por PP · não homologada':'');
   autoPreview=!savedForStyle&&!original&&!suggested;referenceOnly=false;
  }else{
   current=savedForStyle?savedForStyle.levels.slice():suggested?suggested.slice():original?original.slice():null;
   autoPreview=!savedForStyle&&!suggested;referenceOnly=!savedForStyle&&!suggested&&!!original;
   custom=Boolean(savedForStyle||suggested);
   sourceLabel=savedForStyle?.source||
    (referenceOnly?'Treino cadastrado · sem recálculo para '+styleLabel:
    suggested?'Hipótese tática · '+styleLabel:'Aguardando comprovação de nível');
  }
  editing=false;refresh();
  notify('switch');
 });
 // V301: uma proposta V251 só preenche a PRÉVIA quando a edição e o
 // nível estão conferidos. Não gravar localmente nem substituir rascunhos.
 host.addEventListener('scoutpro:v301:preview-ready',event=>{
  const info=event.detail||{};
  if(!autoPreview||activeTactic==='posse'&&officialValid||localPPMismatch()||
   Number(info.cap)!==capture||String(info.card_id)!==id||
   String(info.tactic)!==activeTactic||!valid(info.levels)||
   total(info.levels)!==budget)return;
  current=info.levels.slice();suggested=info.levels.slice();
  custom=true;referenceOnly=false;
  sourceLabel='Proposta matemática V251 · '+styleLabel+' · não homologada';
  refresh();
  note.textContent='Prévia calculada com nível e PP conferidos, sem aplicar alterações à carta. Confirme habilidades, ímpetos e atributos finais no jogo.';
 });
 // V251: somente com clique e confirmação do usuário a proposta individual
 // pode substituir o RASCUNHO LOCAL desta tática. Nunca altera o catálogo.
 host.addEventListener('scoutpro:v251:apply-proposal',event=>{
  const info=event.detail||{};
  if(localPPMismatch()||Number(info.cap)!==capture||String(info.card_id)!==id||
    String(info.tactic)!==activeTactic||
    !valid(info.levels)||total(info.levels)!==budget)return;
  current=info.levels.slice();
  custom=true;editing=false;autoPreview=false;referenceOnly=false;
  sourceLabel='Rascunho individual V251 · '+styleLabel;
  const persisted=writeLocal();
  refresh();notify('save');
  note.textContent=persisted?
   'Hipótese individual de '+styleLabel+' carregada como RASCUNHO local ('+budget+
   ' PP). Não homologada e não aplicada no jogo.':
   'Prévia carregada, mas armazenamento indisponível. Nenhum treino da carta foi alterado.';
 });
 // V324: a tela posicional transmite a identidade EXATA (acervo, edição,
 // técnico, posição, tática) ao editor e recupera apenas aquela revisão.
 function applyContext(context){
  if(!profiles||!context||context.collection!=='minhas-246'||
     context.cardId!==id||context.cardKey!==capture+'@'+id)return;
  // O painel V311 redesenha-se após cada rascunho; mesma chave não é
  // troca de técnico/posição e NUNCA deve interromper a edição de PP.
  if(activeProfileContext&&profiles.key(activeProfileContext)===profiles.key(context))return;
  activeProfileContext=context;
  activeTactic=context.style;
  styleLabel=({posse:'Posse de Bola',rapido:'Contra-Ataque Rápido',
   normal:'Contra-Ataque',fora:'Por Fora',longo:'Bola Longa'})[activeTactic]||activeTactic;
  let stored=null;
  try{stored=readProfile();profileError=''}catch(e){profileError=String(e.message||e)}
  const individual=stored?.levels;
  current=individual?individual.slice():suggested&&activeTactic!=='posse'?
   suggested.slice():original?original.slice():null;
  custom=Boolean(stored);
  editing=false;referenceOnly=!stored&&!!original;
  autoPreview=!stored&&!original;
  sourceLabel=stored?.source||(referenceOnly?
   'Referência de cadastro, sem adaptação comprovada ao técnico':
   'Ficha desta edição ainda pendente');
  refresh();
  if(profileError)note.textContent='Registro contextual preservado, mas indisponível: '+profileError;
 }
 host.addEventListener('scoutpro:v324:context-selected',e=>applyContext(e.detail?.context));
 host.addEventListener('scoutpro:manager-selected-v302',e=>{
  if(!activeProfileContext||Number(e.detail?.capture)!==capture||
     String(e.detail?.card_id)!==id)return;
  try{applyContext(profiles.withManager(activeProfileContext,e.detail.catalog_id))}catch(_){}
 });
 btnReset.addEventListener('click',restore);
 // Laboratório continua disponível apenas como ferramenta avançada;
 // suas alterações e as do painel principal usam a mesma conta local por Card ID.
 host.addEventListener('scoutpro:lab-changed-v218',event=>{
  const data=event.detail||{};
  if(contextForTactic())return; // laboratórios antigos não atravessam técnico
  if(localPPMismatch()||Number(data.cap)!==capture||String(data.card_id)!==id||!valid(data.levels))return;
  if(activeTactic!=='posse'||data.levels.every((n,i)=>n===current[i]))return;
  current=data.levels.slice();custom=true;autoPreview=false;referenceOnly=false;
  sourceLabel='Laboratório · '+String(data.scenario||'personalizado');
  refresh();
 });
 function fold(id,title){
  const section=doc.getElementById(id);
  if(!section||section.closest('.scout-v218-advanced'))return;
  const wrapper=make(doc,'details','scout-v218-advanced');
  wrapper.id='scout-v218-advanced-'+id;
  wrapper.append(make(doc,'summary','',title));
  section.insertAdjacentElement('beforebegin',wrapper);
  wrapper.append(section);
 }
 fold('pontos','Treinos A, B e P · comparações antigas');
 fold('performance','Laboratório avançado · testes, cenários e histórico');
 doc.addEventListener('click',event=>{
  const link=event.target?.closest?.('a[href="#pontos"],a[href="#performance"]');
  if(link){const target=doc.querySelector(link.getAttribute('href'));
   const detail=target?.closest('.scout-v218-advanced');if(detail)detail.open=true;
  }
 });
 refresh();
 return true;
}
const api=Object.freeze({CATEGORY,valid,ppCost,total,adjust,readSaved,scenarioPlan,mount});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function start(){
 if(mount(host.document))return;
 if(typeof host.MutationObserver!=='function')return;
 const observer=new host.MutationObserver(()=>{if(mount(host.document))observer.disconnect()});
 observer.observe(host.document.body,{subtree:true,childList:true});
 host.document.addEventListener('scoutpro:profile-ready',()=>{if(mount(host.document))observer.disconnect()},{once:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})(typeof window!=='undefined'?window:null);
