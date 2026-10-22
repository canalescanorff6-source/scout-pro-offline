/* Craque Tático V302 — seleção local de versões de técnicos com dados fornecidos.
 * Perfis externos não homologam boosters, skills ou disponibilidade na conta.
 * Nenhum valor do técnico altera PP, builds ou atributos finais das 246 cartas.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_MANAGERS_V302=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const KEY='craque:v302:manager-selection';
const STYLES=Object.freeze([
 Object.freeze({id:'posse',field:'posse',label:'Posse de Bola',supported:true}),
 Object.freeze({id:'rapido',field:'contra_rapido',label:'Contra-Ataque Rápido',supported:true}),
 Object.freeze({id:'normal',field:'contra_normal',label:'Contra-Ataque',supported:true}),
 Object.freeze({id:'fora',field:'pelas_laterais',label:'Por Fora',supported:true}),
 Object.freeze({id:'longo',field:'bola_longa',label:'Bola Longa',supported:true}),
 Object.freeze({id:'overload',field:'overload',label:'Sobreposição (Overload)',supported:false})
]);
// Compactação apenas para preservar integralmente o ZIP sem dependência de rede/file://.
const DATA_GZIP_BASE64='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';
let loading=null,selected=null,ui=null,all=null;
// V306: seleção editorial solicitada pelo proprietário, não ranking estatístico de uso.
const CURATED_IDS=Object.freeze(["CT-MGR-013","CT-MGR-008","CT-MGR-017","CT-MGR-001","CT-MGR-014","CT-MGR-020","CT-MGR-027","CT-MGR-023","CT-MGR-025","CT-MGR-006","CT-MGR-012","CT-MGR-019","CT-MGR-011","CT-MGR-005","CT-MGR-028","CT-MGR-009","CT-MGR-015","CT-MGR-010","CT-MGR-002","CT-MGR-007","CT-MGR-004","CT-MGR-003"]);
function curatedManagers(){
 const order=new Map(CURATED_IDS.map((id,i)=>[id,i]));
 return (all||[]).filter(x=>order.has(x.catalog_id)).sort((a,b)=>
  order.get(a.catalog_id)-order.get(b.catalog_id));
}
function competitiveStyles(manager,minimum=85){
 return STYLES.map(s=>({...s,score:proficiency(manager,s.id)}))
  .filter(s=>s.score!==null&&s.score>=minimum);
}
function validate(data){
 if(!data||!Array.isArray(data.tecnicos)||data.tecnicos.length!==70)
  throw Error('Inventário de técnicos incompleto: esperado 70 versões');
 const seen=new Set();
 for(const c of data.tecnicos){
  if(!/^CT-MGR-[0-9]{3}$/.test(c.catalog_id)||seen.has(c.catalog_id)||
   !String(c.nome||'').trim())throw Error('ID/nome de técnico inválido ou repetido');
  seen.add(c.catalog_id);
  for(const s of STYLES){
   const n=c.prof_cada_estilo?.[s.field];
   if(n!==null&&(!Number.isInteger(n)||n<0||n>100))
    throw Error('Proficiência inválida: '+c.catalog_id+' '+s.field);
   if(s.supported&&n===null)throw Error('Estilo oficial sem dado numérico '+c.catalog_id);
  }
  if(!Array.isArray(c.boosters_EN)||!Array.isArray(c.link_ups_EN)||
   !Array.isArray(c.ativacao_das_combinacoes))
   throw Error('Metadados incompletos '+c.catalog_id);
 }
 return data;
}
async function load(){
 if(loading)return loading;
 loading=(async()=>{
  if(typeof host?.DecompressionStream!=='function'||typeof host.atob!=='function')
   throw Error('Navegador sem suporte à leitura do catálogo offline');
  const bytes=Uint8Array.from(host.atob(DATA_GZIP_BASE64),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new host.DecompressionStream('gzip'));
  const data=validate(JSON.parse(await new Response(stream).text()));
  all=data.tecnicos;
  return data;
 })();
 loading.catch(()=>{loading=null});
 return loading;
}
function find(id){return all?.find(x=>x.catalog_id===id)||null}
function preferred(manager,requested){
 const viable=STYLES.filter(x=>x.supported);
 if(STYLES.some(x=>x.id===requested&&
  Number.isInteger(manager.prof_cada_estilo[x.field])))return requested;
 return viable.slice().sort((a,b)=>manager.prof_cada_estilo[b.field]-
  manager.prof_cada_estilo[a.field])[0]?.id||'posse';
}
function proficiency(manager,tactic){
 const s=STYLES.find(x=>x.id===tactic);
 return s?manager?.prof_cada_estilo?.[s.field]??null:null;
}
function model(manager,tactic){
 const score=proficiency(manager,tactic);
 const s=STYLES.find(x=>x.id===tactic);
 if(!s)return {status:'invalido',score:null,canCalculate:false};
 return {status:score===null?'nao_documentado':
  !s.supported?'motor_tatico_pendente':
  score>=89?'prof_89_mais':score>=85?'prof_85_mais':'prof_abaixo_85',
  score,canCalculate:s.supported&&score!==null,
  note:!s.supported?'Sobreposição é oficial, mas o motor de PP específico ainda não foi homologado.':
   'A proficiência afeta o estilo do time; não equivale a pontos de treino do jogador.'};
}
function make(doc,tag,text,className){
 const element=doc.createElement(tag);
 if(text!==undefined)element.textContent=String(text);
 if(className)element.className=className;
 return element;
}
const PHOTO_PREFIX='scoutpro:v307:manager-portrait:';
function portraitFor(id){
 try{
  const data=host?.localStorage?.getItem(PHOTO_PREFIX+String(id));
  return typeof data==='string'&&data.length<=100000&&
   /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data)?data:null;
 }catch(_){return null}
}
function selectedManager(){return selected}
function mount(doc){
 if(!doc||ui)return Boolean(ui);
 const hero=doc.getElementById('scout-v220-hero');
 if(!hero)return false;
 const wrap=make(doc,'details',undefined,'ct-manager-v302');
 wrap.id='ct-manager-v302';
 // V303: sempre visível na ficha; não esconder a ação principal.
 wrap.open=true;
 const raw=doc.getElementById('scout-v68-data');
 let identity={};try{identity=JSON.parse(raw?.textContent||'{}')}catch(_){}
 const capture=Number(identity.capture),cardId=String(identity.id||'');
 const localKey=Number.isInteger(capture)&&capture>0&&cardId?
  KEY+':'+capture+'@'+cardId:KEY;
 const heading=make(doc,'summary','ESCOLHER TÉCNICO · GERAR FICHA POR ESTILO');
 const title=make(doc,'h3','Técnico da minha equipe');
 const introduction=make(doc,'p','Escolha a versão do técnico. A ficha acompanha o estilo selecionado; bônus, jogadas e proficiências exigem conferência da edição.');
 const selectLabel=make(doc,'label','Versão do técnico');
 const select=make(doc,'select');
 select.id='ct-manager-select';select.setAttribute('aria-label','Selecionar técnico por versão');
 select.append(make(doc,'option','Escolher técnico — nenhum selecionado'));
 select.firstChild.value='';
 const coaches=(all||[]).slice().sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')||
  String(b.versao_lancamento||'').localeCompare(String(a.versao_lancamento||'')));
 const featured=curatedManagers(),curatedSet=new Set(CURATED_IDS);
 const groups=[
  {label:'SELEÇÃO COMPETITIVA · 22 versões',values:featured},
  {label:'OUTRAS VERSÕES · catálogo completo',values:coaches.filter(c=>!curatedSet.has(c.catalog_id))}
 ];
 for(const group of groups){
  const optgroup=make(doc,'optgroup');optgroup.label=group.label;
  for(const c of group.values){
   const strong=competitiveStyles(c,89).map(x=>x.label+' '+x.score).join(' / ');
   const option=make(doc,'option',c.nome+' · '+(c.versao_lancamento||'data pendente')+
    ' · '+(strong||'sem prof. 89+')+' · '+c.catalog_id);
   option.value=c.catalog_id;optgroup.append(option);
  }
  select.append(optgroup);
 }
 selectLabel.append(select);
 const styleLabel=make(doc,'label','Estilo do técnico');
 const style=make(doc,'select');style.id='ct-manager-style';
 styleLabel.append(style);
 const explanation=make(doc,'div',undefined,'ct-manager-details');
 explanation.id='ct-manager-details';explanation.setAttribute('aria-live','polite');
 const actions=make(doc,'div',undefined,'ct-manager-actions');
 const clear=make(doc,'button','Sem técnico selecionado');clear.type='button';
 actions.append(clear);
 const browse=make(doc,'a','Central de Técnicos · pesquisar e comparar ↗');
 browse.href='tecnicos-v307.html';browse.className='ct-manager-hub-link';actions.append(browse);
 wrap.append(heading,title,introduction,selectLabel,styleLabel,actions,explanation);
 const tabs=doc.getElementById('scout-v220-tabs');
 if(tabs)tabs.insertAdjacentElement('afterend',wrap);
 else hero.append(wrap);
 ui={wrap,select,style,explanation};
 function render(){
  explanation.replaceChildren();style.replaceChildren();
  if(!selected){
   explanation.append(make(doc,'p','Selecione seu técnico para consultar todas as proficiências e escolher um estilo. Nenhum bônus é aplicado sem prova.'));
   style.disabled=true;style.append(make(doc,'option','Selecione o técnico'));
   return;
  }
  style.disabled=false;
  const options=STYLES.slice().sort((a,b)=>
   (proficiency(selected,b.id)??-1)-(proficiency(selected,a.id)??-1));
  for(const s of options){
   const n=proficiency(selected,s.id),option=make(doc,'option',s.label+' · '+
    (n===null?'não documentado':n)+(s.supported?'':' · ficha PP pendente'));
   option.value=s.id;style.append(option);
  }
  style.value=selectedTactic;
  const status=model(selected,selectedTactic);
  const photo=portraitFor(selected.catalog_id);
  if(photo){
   const cover=make(doc,'img');cover.src=photo;
   cover.className='ct-manager-portrait';
   cover.alt='Retrato fornecido pelo usuário para '+selected.nome;
   explanation.append(cover);
  }
  const scores=make(doc,'div',undefined,'ct-manager-six-styles');
  for(const entry of STYLES){
   const n=proficiency(selected,entry.id);
   const item=make(doc,'div',(n===null?'—':n)+' · '+entry.label+
    (!entry.supported?' · ficha pendente':''),'ct-manager-score');
   if(n!==null&&n>=89)item.className+=' ct-manager-score-elite';
   else if(n!==null&&n>=85)item.className+=' ct-manager-score-strong';
   scores.append(item);
  }
  explanation.append(scores);
  explanation.append(make(doc,'p',selected.nome+' · '+
   (selected.versao_lancamento||'data da versão pendente')+' · '+selected.catalog_id,
   'ct-manager-identity'));
  explanation.append(make(doc,'p','Proficiência '+STYLES.find(s=>s.id===selectedTactic)?.label+
   ': '+(status.score===null?'não documentada':status.score)+
   (status.score!==null&&status.score<85?' · abaixo de 85':'')+'. '+status.note));
  explanation.append(make(doc,'p','Bônus divulgados: '+
   (selected.boosters_EN.length?selected.boosters_EN.join(' · '):'nenhum documentado')+
   '. Não somar aos PP nem calcular atributos finais sem base confirmada.'));
  const links=make(doc,'div');
  links.append(make(doc,'strong','Jogadas de combinação e condições divulgadas'));
  if(!selected.ativacao_das_combinacoes.length)
   links.append(make(doc,'p','Ativação ainda não documentada nesta versão.'));
  for(const x of selected.ativacao_das_combinacoes){
   links.append(make(doc,'p',x.name_EN+': peça central '+
    (x.centrepiece_playstyle_EN||'?')+' ('+(x.centrepiece_position_EN||'?')+
    ') · parceiro '+(x.keyman_playstyle_EN||'?')+' ('+
    (x.keyman_position_EN||'?')+').'));
  }
  explanation.append(links);
  explanation.append(make(doc,'p','Origem: catálogo enviado, com fontes públicas terceiras. '+
   (selected.linkups_status||'sem comprovação de Link-Up')+
   '. Disponibilidade na sua conta não conferida. Retratos externos não incluídos.'));
 }
 let selectedTactic='posse';
 function notify(){
  if(!selected)return;
  const detail={catalog_id:selected.catalog_id,manager_name:selected.nome,
   version:selected.versao_lancamento,tactic:selectedTactic,
   proficiency:proficiency(selected,selectedTactic),
   boosters:selected.boosters_EN.slice(),linkups:selected.link_ups_EN.slice(),
   tacticalSupport:model(selected,selectedTactic).status,
   confirmation:'catalogo_publico_sem_conferencia_na_conta',
   capture,card_id:cardId};
  host.dispatchEvent(new host.CustomEvent('scoutpro:manager-selected-v302',{detail}));
  if(model(selected,selectedTactic).canCalculate){
   doc.dispatchEvent(new host.CustomEvent('scoutpro:tactic-ui-selected-v220',
    {detail:{tactic:selectedTactic}}));
  }
 }
 select.addEventListener('change',()=>{
  selected=find(select.value);
  selectedTactic=selected?preferred(selected,null):'posse';
  try{
   if(selected)host.localStorage.setItem(localKey,JSON.stringify({
    catalog_id:selected.catalog_id,tactic:selectedTactic}));
   else host.localStorage.removeItem(localKey);
  }catch(_){}
  render();notify();
 });
 style.addEventListener('change',()=>{
  if(!selected)return;
  selectedTactic=style.value;
  try{host.localStorage.setItem(localKey,JSON.stringify({
   catalog_id:selected.catalog_id,tactic:selectedTactic}))}catch(_){}
  render();notify();
 });
 clear.addEventListener('click',()=>{
  select.value='';select.dispatchEvent(new host.Event('change'));
 });
 try{
  const stored=JSON.parse(host.localStorage?.getItem(localKey)||
   host.localStorage?.getItem(KEY)||'null');
  selected=find(stored?.catalog_id);
  if(selected){selectedTactic=preferred(selected,stored.tactic);select.value=selected.catalog_id}
 }catch(_){}
 render();
 if(selected)notify();
 host.addEventListener('scoutpro:tactic-selected-v220',ev=>{
  if(!selected||!ev.detail?.tactic||!STYLES.some(x=>x.id===ev.detail.tactic))return;
  selectedTactic=ev.detail.tactic;
  style.value=selectedTactic;
  try{host.localStorage.setItem(localKey,JSON.stringify({
   catalog_id:selected.catalog_id,tactic:selectedTactic}))}catch(_){}
  render();
 });
 return true;
}
if(host?.document){
 let observing=false;
 function start(){
  load().then(()=>{
   if(mount(host.document)||observing||typeof host.MutationObserver!=='function')return;
   observing=true;
   const observer=new host.MutationObserver(()=>{
    if(mount(host.document))observer.disconnect();
   });
   observer.observe(host.document.documentElement,{childList:true,subtree:true});
  }).catch(e=>{
   const tab=host.document.getElementById('scout-v220-tabs');
   if(tab&&!host.document.getElementById('ct-manager-load-error')){
    const err=make(host.document,'p','Técnicos indisponíveis: '+e.message);
    err.id='ct-manager-load-error';tab.insertAdjacentElement('afterend',err);
   }
  });
 }
 host.addEventListener('scoutpro:card-shell-ready-v302',start);
 if(host.document.readyState==='loading')
  host.document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
}
return Object.freeze({STYLES,KEY,CURATED_IDS,curatedManagers,competitiveStyles,portraitFor,DATA_GZIP_BASE64,validate,load,find,model,preferred,proficiency,mount,selectedManager});
});
