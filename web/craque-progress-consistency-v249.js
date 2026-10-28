/* Craque Tático V249 — conferências locais visíveis no catálogo e nas fichas.
 * Nenhuma ficha, build, Card ID ou PP do catálogo é alterado automaticamente.
 * A correção definitiva depende de prova da edição/nível + revisão da build.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_PROGRESS_CONSISTENCY_V249=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const PREFIX='scoutpro:v248:level-review:',SCHEMA='CRAQUE_PROGRESS_REVIEW_V248';
const ppForLevel=n=>Number.isInteger(n)&&n>=1&&n<=120?2*(n-1):null;
const key=c=>PREFIX+Number(c.numero)+'@'+String(c.id);
const points=levels=>{
 if(!Array.isArray(levels)||levels.length!==10||
  !levels.every(x=>Number.isInteger(x)&&x>=0&&x<=20))return null;
 let total=0;
 for(const n of levels)for(let i=0;i<n;i++)total+=1+Math.floor(i/4);
 return total;
};
function validated(card,raw){
 if(!card||!raw||raw.schema!==SCHEMA||raw.confirmed_in_game!==true||
  Number(card.numero)!==Number(raw.numero)||String(card.id)!==String(raw.card_id)||
  String(card.name)!==String(raw.name)||
  typeof raw.edition!=='string'||!raw.edition.trim()||
  raw.edition!==String(card.versao||'')||ppForLevel(raw.level)!==raw.pp)return null;
 return raw;
}
function localReview(card,storage){
 try{return validated(card,JSON.parse(storage?.getItem(key(card))||'null'))}
 catch(_){return null}
}
function reconcile(card,storage,vectors=[]){
 const saved=localReview(card,storage),original=Number(card.pp);
 const mismatch=!!saved&&saved.pp!==original;
 const builds=vectors.map(x=>({
  label:String(x.label||'Build'),spent:points(x.levels)
 })).filter(x=>x.spent!==null);
 const exceeded=saved?builds.filter(x=>x.spent>saved.pp):[];
 return Object.freeze({
  numero:card.numero,card_id:card.id,original_pp:original,
  original_level:Number.isInteger(card.max_level)?card.max_level:null,
  saved,local_level:saved?.level??null,local_pp:saved?.pp??null,mismatch,
  exceeds_budget:exceeded.length>0,
  exceeded,builds,
  status:mismatch?'divergente':saved?'confirmado_localmente':
   Number.isInteger(card.max_level)&&card.pp_origem&&!/^catalogo_publico_/.test(card.pp_origem)?'registrado':'pendente'
 });
}
const api=Object.freeze({SCHEMA,PREFIX,ppForLevel,key,points,validated,localReview,reconcile});
if(!host?.document)return api;
const doc=host.document;
const clean=s=>String(s??'');
const node=(tag,cls,txt)=>{
 const e=doc.createElement(tag);
 if(cls)e.className=cls;
 if(txt!==undefined)e.textContent=clean(txt);
 return e;
};
const relative=()=>doc.body?.dataset.page==='detail'?'../':'';
function addLink(parent,cap){
 const a=node('a','ct249-review-link','Revisar nível e PP desta carta ↗');
 a.href=relative()+'conferir-progresso-v248.html?cap='+Number(cap);
 parent.append(a);
}
function detailVectors(raw,lab,card){
 const vectors=[];
 if(Array.isArray(card.niveis))vectors.push({label:'Treino do catálogo',levels:card.niveis});
 if(Array.isArray(raw?.recommended_levels))vectors.push({label:'Ficha principal',levels:raw.recommended_levels});
 for(const [name,levels] of Object.entries(raw?.alternate_scenarios||{})){
  if(Array.isArray(levels))vectors.push({label:'Cenário '+name,levels});
 }
 for(const name of ['A','B']){
  if(Array.isArray(lab?.[name]))vectors.push({label:'Laboratório '+name,levels:lab[name]});
 }
 return vectors;
}
function paintDetail(card,raw,lab,store){
 const dest=doc.querySelector('.profile-content');
 if(!dest)return;
 let panel=doc.getElementById('ct249-progress-alert');
 if(panel)panel.remove();
 const view=reconcile(card,store,detailVectors(raw,lab,card));
 panel=node('section','ct249-alert');
 panel.id='ct249-progress-alert';panel.setAttribute('aria-label','Conferência do nível e dos PP');
 panel.dataset.status=view.status;
 const title=node('strong','ct249-alert-title');
 const body=node('p','ct249-alert-text');
 if(view.mismatch){
  title.textContent='Atenção: PP da ficha diferente do nível conferido';
  body.textContent='Você confirmou nível '+view.local_level+' ('+view.local_pp+
   ' PP) nesta edição. A ficha original ainda registra '+view.original_pp+
   ' PP. O projeto não substituiu o treino automaticamente.';
 }else if(view.saved){
  title.textContent='Nível e PP conferidos neste dispositivo';
  body.textContent='Nível máximo '+view.local_level+' · '+view.local_pp+
   ' PP, coincidentes com os '+view.original_pp+' PP da ficha.';
 }else if(view.status==='registrado'){
  title.textContent='Nível registrado no catálogo';
  body.textContent='Nível '+view.original_level+' · '+view.original_pp+
   ' PP na fonte documentada da edição. Ainda é possível conferir na sua conta.';
 }else if(/^catalogo_publico_/.test(card.pp_origem||'')){
  title.textContent='Nível máximo de referência pública';
  body.textContent='Referência da edição: nível '+view.original_level+' · '+view.original_pp+
   ' PP. Ainda precisa ser conferido no jogo; não comprova o treino aplicado na sua conta.';
 }else{
  title.textContent='Nível máximo desta edição ainda sem comprovação';
  body.textContent='A ficha usa '+view.original_pp+
   ' PP do catálogo, mas o nível máximo da carta ainda não foi confirmado. '+
   'Consulte a tela de progressão no eFootball para validar o orçamento.';
 }
 panel.append(title,body);
 if(view.exceeds_budget){
  const names=view.exceeded.map(x=>x.label+' ('+x.spent+' PP)');
  const warning=node('p','ct249-build-warning',
   'TREINO ACIMA DO ORÇAMENTO CONFERIDO: '+names.join(' · ')+'. '+
   'Não aplique a distribuição antes de recalculá-la com '+view.local_pp+' PP.');
  panel.append(warning);
 }else if(view.mismatch){
  panel.append(node('p','ct249-build-warning',
   'Mesmo que o treino ainda caiba no novo orçamento, a ficha precisa de revisão individual. '+
   'Os pontos não serão redistribuídos automaticamente.'));
 }
 const footer=node('div','ct249-alert-actions');
 footer.append(node('small','',
  'Conferência local desta edição exata; outras versões não são afetadas.'));
 addLink(footer,card.numero);panel.append(footer);
 // V249: no celular, preservar a primeira dobra V202. O aviso detalhado
 // fica depois da ficha principal, sem empurrar os botões de tática para baixo.
 const compact=typeof host.matchMedia==='function'&&host.matchMedia('(max-width:720px)').matches;
 const mainTraining=dest.querySelector('#scout-v188-principal');
 const heading=dest.querySelector('.detail-header');
 if(compact){
  if(mainTraining)mainTraining.insertAdjacentElement('afterend',panel);
  else dest.append(panel);
 }else if(heading)heading.insertAdjacentElement('afterend',panel);
 else dest.append(panel);
}
function paintCatalog(cards,store){
 for(const element of doc.querySelectorAll('#cards .player-card[data-cap]')){
  const card=cards.get(Number(element.dataset.cap));
  if(!card)continue;
  const view=reconcile(card,store);
  element.querySelector('.ct249-local-tag')?.remove();
  if(!view.saved)continue; // Não criar 246 novos chips; preservar desempenho.
  const target=element.querySelector('.player-main');
  if(!target)continue;
  const chip=node('span','ct249-local-tag',
   view.mismatch?'PP conferidos: '+view.local_pp+' · revisar ficha':
    'Nível '+view.local_level+' / '+view.local_pp+' PP confirmados');
  chip.dataset.status=view.status;chip.title='Dados conferidos localmente na edição exata';
  target.append(chip);
 }
}
async function mount(){
 const page=doc.body?.dataset.page;
 if(page!=='catalog'&&page!=='detail')return;
 const src=doc.getElementById('scout-v68-data');
 let raw=null,lab=null;
 if(page==='detail'){
  try{raw=JSON.parse(src?.textContent||'null');lab=JSON.parse(doc.getElementById('lab-data')?.textContent||'null')}
  catch(_){return}
  if(!raw||!Number.isInteger(Number(raw.capture)))return;
 }
 const path=relative()+'SCOUT_V69_AUDITORIA.json';
 let cards;
 try{
  const response=await host.fetch(path);
  if(!response.ok)throw Error('catálogo indisponível');
  const data=await response.json();
  if(!Array.isArray(data.cards)||data.cards.length!==246)throw Error('acervo incompleto');
  cards=new Map(data.cards.map(c=>[Number(c.numero),c]));
 }catch(_){return} // Consulta não deve impedir abrir a ficha ou o elenco offline.
 const storage=host.localStorage;
 const update=()=>{
  if(page==='catalog')paintCatalog(cards,storage);
  else{
   const card=cards.get(Number(raw.capture));
   if(!card||String(card.id)!==String(raw.id)||String(card.name)!==String(raw.name))return;
   paintDetail(card,raw,lab,storage);
  }
 };
 update();
 host.addEventListener('pageshow',update);
 host.addEventListener('storage',e=>{
  if(e.key?.startsWith(PREFIX)||e.key===null)update();
 });
 host.addEventListener('scoutpro:pp-updated',update);
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
return api;
});
