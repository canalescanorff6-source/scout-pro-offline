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
 const proposedOnly=card.training_status==='proposta_nao_validada';
 const officialValid=!proposedOnly&&valid(official)&&total(official)===budget;
 const fallback=valid(lab?.draftA)&&total(lab.draftA)===budget?lab.draftA.slice():null;
 const original=officialValid?official:(fallback||null);
 const storageKey='scoutpro:v67:'+id+':'+filename;
 let saved=null;try{saved=readSaved(JSON.parse(host.localStorage?.getItem(storageKey)||'null'),id,filename,budget)}catch(_e){}
 // O laboratório V67 salvava somente train/source. Compatibilizar sem migrar dados.
 if(!saved){
  try{const legacy=JSON.parse(host.localStorage?.getItem(storageKey)||'null');
   if(legacy&&valid(legacy.train)&&total(legacy.train)<=budget)saved={levels:legacy.train.slice(),source:String(legacy.source||'treino pessoal').slice(0,90)};
  }catch(_e){}
 }
 let current=saved?saved.levels:(original?original.slice():Array(10).fill(0));
 let custom=!!saved,sourceLabel=String(saved?.source||'');
 let editing=false;
 let activeTactic='posse',styleLabel='Posse de Bola',suggested=null;
 const keyForTactic=()=>activeTactic==='posse'?storageKey:storageKey+':tactic:'+activeTactic;
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
  try{
   host.localStorage.setItem(keyForTactic(),JSON.stringify({train:current.slice(),source:'V220 · '+sourceLabel,updated:new Date().toISOString(),id,card:filename,tactic:activeTactic}));
   return true;
  }catch(_e){return false}
 }
 function notify(mode){
  if(activeTactic==='posse')host.dispatchEvent(new host.CustomEvent('scoutpro:training-edit-v218',{detail:{cap:capture,card_id:id,levels:current.slice(),mode}}));
  host.dispatchEvent(new host.CustomEvent('scoutpro:training-updated-v220',{detail:{cap:capture,card_id:id,tactic:activeTactic,levels:current.slice(),mode}}));
 }
 function setDelta(i,delta){
  const next=adjust(current,i,delta,budget);
  if(!next)return;
  current=next;custom=true;
  sourceLabel='Rascunho pessoal · '+styleLabel;
  const persisted=writeLocal();
  notify('save');refresh();
  note.textContent=persisted?'Rascunho salvo somente neste dispositivo.':'Prévia alterada, mas o armazenamento local não permitiu salvar.';
 }
 function restore(){
  try{host.localStorage.removeItem(keyForTactic())}catch(_e){}
  if(activeTactic==='posse'){
   current=original?original.slice():Array(10).fill(0);
   custom=false;editing=false;sourceLabel='';
   notify('restore');refresh();
   note.textContent=officialValid?'Treino registrado restaurado. Nenhum nível da carta original foi modificado.':'Não há treino homologado no cadastro; os pontos permanecem como prévia zerada.';
  }else{
   current=suggested?suggested.slice():Array(10).fill(0);
   custom=true;editing=false;sourceLabel='Hipótese tática · '+styleLabel;
   refresh();notify('restore');
   note.textContent='Hipótese inicial de '+styleLabel+' restaurada; não substitui a build homologada da carta.';
  }
 }
 function refresh(){
  const spent=total(current);
  const budgetRemaining=budget-spent;
  tag.textContent=(custom?(activeTactic==='posse'?'SIMULAÇÃO PESSOAL':'HIPÓTESE / RASCUNHO TÁTICO'):officialValid?'REGISTRO DA CARTA':'PRÉVIA SEM HOMOLOGAÇÃO')+' · '+spent+' / '+budget+' PP'+(custom&&sourceLabel?' · '+sourceLabel:'');
  tag.dataset.mode=custom?'draft':officialValid?'registered':'pending';
  status.textContent=spent+' / '+budget;
  btnEdit.textContent=editing?'Concluir edição':'Editar pontos';
  btnReset.disabled=activeTactic==='posse'?!custom:false;
  btnReset.textContent=activeTactic==='posse'?(officialValid?'Restaurar treino registrado':'Restaurar proposta para revisão'):'Restaurar hipótese inicial';
  const headerText=head?.querySelector('span:last-child');if(headerText)headerText.textContent=activeTactic==='posse'?(officialValid?'Treino registrado · Posse':'Treino em revisão · Posse'):'Prévia experimental · '+styleLabel;
  compare.hidden=activeTactic!=='posse';
  if(readNote)readNote.textContent=custom?
   (budgetRemaining===0?'Simulação pessoal com PP fechados. Não substitui o treino registrado no Scout PRO.':
    'Simulação pessoal incompleta: '+budgetRemaining+' PP ainda não distribuídos. Não considerar homologada.'):
   (officialValid?'Treino registrado no catálogo. Para comparar ou testar mudanças, use Editar pontos.':'Treino final sem confirmação nesta edição. Preencha apenas como simulação e valide os atributos no jogo.');
  table.classList.toggle('scout-v218-editing',editing);
  table.dataset.scoutV218Mode=custom?'draft':officialValid?'registered':'pending';
  for(let i=0;i<rows.length;i++){
   const cell=rows[i].querySelector('.scout-v208-level'),pp=rows[i].querySelector('.scout-v208-cost');
   if(!cell||!pp)continue;
   cell.replaceChildren();
   if(editing){
    const ctl=make(doc,'span','scout-v218-stepper');
    const minus=make(doc,'button','scout-v218-step','−');minus.type='button';minus.setAttribute('aria-label','Reduzir '+CATEGORY[i]);
    const value=make(doc,'span','scout-v218-level',current[i]);
    const plus=make(doc,'button','scout-v218-step','+');plus.type='button';plus.setAttribute('aria-label','Aumentar '+CATEGORY[i]);
    minus.disabled=adjust(current,i,-1,budget)===null;
    plus.disabled=adjust(current,i,1,budget)===null;
    minus.addEventListener('click',()=>setDelta(i,-1));
    plus.addEventListener('click',()=>setDelta(i,1));
    ctl.append(minus,value,plus);cell.append(ctl);
   }else cell.textContent=String(current[i]);
   pp.textContent=String(ppCost(current[i]));
  }
 }
 btnEdit.addEventListener('click',()=>{editing=!editing;refresh()});
 host.addEventListener('scoutpro:tactic-selected-v220',event=>{
  const info=event.detail||{};
  if(Number(info.cap)!==capture||String(info.card_id)!==id)return;
  if(!['posse','normal','rapido','fora','longo'].includes(info.tactic))return;
  activeTactic=info.tactic;styleLabel=String(info.label||info.tactic);
  const proposal=info.proposedLevels;
  suggested=valid(proposal)&&total(proposal)===budget?proposal.slice():null;
  let savedForStyle=null;
  try{
   const raw=JSON.parse(host.localStorage?.getItem(keyForTactic())||'null');
   savedForStyle=readSaved(raw,id,filename,budget);
  }catch(_e){}
  if(activeTactic==='posse'){
   current=savedForStyle?savedForStyle.levels.slice():original?original.slice():Array(10).fill(0);
   custom=Boolean(savedForStyle);sourceLabel=savedForStyle?.source||'';
  }else{
   current=savedForStyle?savedForStyle.levels.slice():suggested?suggested.slice():Array(10).fill(0);
   custom=true;sourceLabel=savedForStyle?.source||'Hipótese tática · '+styleLabel;
  }
  editing=false;refresh();
  notify('switch');
 });
 btnReset.addEventListener('click',restore);
 // Laboratório continua disponível apenas como ferramenta avançada;
 // suas alterações e as do painel principal usam a mesma conta local por Card ID.
 host.addEventListener('scoutpro:lab-changed-v218',event=>{
  const data=event.detail||{};
  if(Number(data.cap)!==capture||String(data.card_id)!==id||!valid(data.levels))return;
  if(activeTactic!=='posse'||data.levels.every((n,i)=>n===current[i]))return;
  current=data.levels.slice();custom=true;sourceLabel='Laboratório · '+String(data.scenario||'personalizado');
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
