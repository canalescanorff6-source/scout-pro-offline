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
const asset=host?.document?.currentScript?.src?
 new URL('craque-manager-catalog-v302.gz.b64',host.document.currentScript.src).href:
 '../craque-manager-catalog-v302.gz.b64';
let loading=null,selected=null,ui=null,all=null;
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
  if(!host?.fetch||typeof host.DecompressionStream!=='function'||typeof host.atob!=='function')
   throw Error('Navegador sem suporte à leitura segura do catálogo offline');
  const response=await host.fetch(asset);
  if(!response.ok)throw Error('Catálogo offline não encontrado');
  const encoded=(await response.text()).trim();
  const bytes=Uint8Array.from(host.atob(encoded),c=>c.charCodeAt(0));
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
 if(viable.some(x=>x.id===requested&&Number.isInteger(manager.prof_cada_estilo[x.field])))
  return requested;
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
function selectedManager(){return selected}
function mount(doc){
 if(!doc||ui)return Boolean(ui);
 const hero=doc.getElementById('scout-v220-hero');
 if(!hero)return false;
 const wrap=make(doc,'section',undefined,'ct-manager-v302');
 wrap.id='ct-manager-v302';
 const title=make(doc,'h3','Técnico da minha equipe');
 const introduction=make(doc,'p','Escolha a versão do técnico. A ficha acompanha o estilo selecionado; bônus, jogadas e proficiências exigem conferência da edição.');
 const selectLabel=make(doc,'label','Versão do técnico');
 const select=make(doc,'select');
 select.id='ct-manager-select';select.setAttribute('aria-label','Selecionar técnico por versão');
 select.append(make(doc,'option','Escolher técnico — nenhum selecionado'));
 select.firstChild.value='';
 const coaches=(all||[]).slice().sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')||
  String(b.versao_lancamento||'').localeCompare(String(a.versao_lancamento||'')));
 for(const c of coaches){
  const option=make(doc,'option',c.nome+' · '+(c.versao_lancamento||'data pendente')+' · '+c.catalog_id);
  option.value=c.catalog_id;select.append(option);
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
 wrap.append(title,introduction,selectLabel,styleLabel,actions,explanation);
 const tabs=doc.getElementById('scout-v220-tabs');
 if(tabs)tabs.insertAdjacentElement('beforebegin',wrap);
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
   confirmation:'catalogo_publico_sem_conferencia_na_conta'};
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
   if(selected)host.localStorage.setItem(KEY,JSON.stringify({
    catalog_id:selected.catalog_id,tactic:selectedTactic}));
   else host.localStorage.removeItem(KEY);
  }catch(_){}
  render();notify();
 });
 style.addEventListener('change',()=>{
  if(!selected)return;
  selectedTactic=style.value;
  try{host.localStorage.setItem(KEY,JSON.stringify({
   catalog_id:selected.catalog_id,tactic:selectedTactic}))}catch(_){}
  render();notify();
 });
 clear.addEventListener('click',()=>{
  select.value='';select.dispatchEvent(new host.Event('change'));
 });
 try{
  const stored=JSON.parse(host.localStorage?.getItem(KEY)||'null');
  selected=find(stored?.catalog_id);
  if(selected){selectedTactic=preferred(selected,stored.tactic);select.value=selected.catalog_id}
 }catch(_){}
 render();
 if(selected)notify();
 host.addEventListener('scoutpro:tactic-selected-v220',ev=>{
  if(!selected||!ev.detail?.tactic||!STYLES.some(x=>x.id===ev.detail.tactic))return;
  selectedTactic=ev.detail.tactic;
  style.value=selectedTactic;
  render();
 });
 return true;
}
if(host?.document){
 host.addEventListener('scoutpro:card-shell-ready-v302',()=>{
  load().then(()=>mount(host.document)).catch(e=>{
   if(ui)return;
   const tab=host.document.getElementById('scout-v220-tabs');
   if(tab){const err=make(host.document,'p','Catálogo de técnicos indisponível: '+e.message);
    err.id='ct-manager-load-error';tab.insertAdjacentElement('beforebegin',err)}
  });
 });
}
return Object.freeze({STYLES,KEY,asset,validate,load,find,model,preferred,proficiency,mount,selectedManager});
});
