/* Scout PRO V208 — tabela de PP inspirada na REFERÊNCIA VISUAL entregue pelo usuário.
 * Mantém exatamente os dez grupos, níveis e orçamento oficiais de cada carta.
 * Renderiza uma visão sem controles: a edição continua sendo feita no Laboratório.
 */
(function(host){
'use strict';
const CATEGORIES=Object.freeze([
 ['chute','Chute'],['passe','Passe'],['drible','Drible'],
 ['destreza','Destreza'],['pernas','Força das pernas'],
 ['aereo','Jogo aéreo'],['defesa','Defesa'],
 ['goleiro1','Goleiro 1'],['goleiro2','Goleiro 2'],['goleiro3','Goleiro 3']
]);
const SHAPES=Object.freeze({
 chute:'<path d="M7 40h11l7-6 5-9 8 2-1 12 8 6h-3l-5 2H10z" fill="#d9f7fc" stroke="#67a9c6" stroke-width="2" stroke-linejoin="round"/><path d="m14 40 8-4m8-5 6 7M11 49h27" stroke="#76dff8" stroke-width="2.3" fill="none" stroke-linecap="round"/><circle cx="49" cy="20" r="8.5" fill="#eafafd" stroke="#5c8da7" stroke-width="1.6"/><path d="m46 15 6 1 2 6-5 3-5-5z" fill="#16364b"/><path d="M11 30h7m-9 5h9" stroke="#9be8f8" stroke-width="2" stroke-linecap="round"/>',
 passe:'<circle cx="18" cy="39" r="11" fill="#e6faff" stroke="#6cb1c7" stroke-width="1.8"/><path d="m15 32 8 3 1 8-8 3-5-6z" fill="#183c50"/><path d="M13 28 9 34m19 4 3 4m-13 8 1-4" stroke="#163c52" stroke-width="1.7" stroke-linecap="round"/><path d="M30 35Q39 23 50 19m-7-5 9 5-3 10" stroke="#53d5f6" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 drible:'<circle cx="31" cy="12" r="5.5" fill="#d6f8ff"/><path d="m27 20-7 12 9 5-7 14m10-27 12 9 7 1m-23 0-12 8-6 9m24-19-4 8 12 4" stroke="#abedfc" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 20 37 24 34 35l-10 2-5-8z" fill="#a9ecfa"/><circle cx="47" cy="47" r="5.2" fill="#f2fcff" stroke="#77c3dd" stroke-width="1.7"/><path d="m45 44 4 1 1 3-4 2-3-3z" fill="#224256"/>',
 destreza:'<circle cx="34" cy="11" r="5.8" fill="#d9f7ff"/><path d="m30 20-9 9 7 8-14 14m17-26 11 1 7 9M27 36l11 4 4 12" stroke="#b2eeff" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="m30 19 9 5-6 13-11-5z" fill="#9be5f9"/><path d="M9 23h10M6 30h8M8 38h11M3 45h8" stroke="#5dbedb" stroke-width="2" stroke-linecap="round"/>',
 pernas:'<path d="m25 12 11 3-8 18-9 13-8-2 6-16z" fill="#e7f9fc" stroke="#87c7dc" stroke-width="2" stroke-linejoin="round"/><path d="m39 16 10 3-11 20-7 14-9-2 10-21z" fill="#d4f3fb" stroke="#7dc0d8" stroke-width="2" stroke-linejoin="round"/><path d="M7 25h11M6 34h9M5 42h8" stroke="#62c8e7" stroke-width="2" stroke-linecap="round"/>',
 aereo:'<circle cx="42" cy="12" r="5.6" fill="#eefbff" stroke="#5a9eb7" stroke-width="1.4"/><path d="m40 9 4 1 1 4-4 2-3-4z" fill="#285168"/><circle cx="24" cy="27" r="5.5" fill="#e5f8fc"/><path d="m22 34-10 9m12-8 12 4 7-8m-19 3 6 10-4 9m5-11 14 8" stroke="#b4edfd" stroke-width="4.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="m21 34 11 5-6 8-10-6z" fill="#86d9f0"/><path d="m30 17 6-4" stroke="#5ad6f4" stroke-width="2.5" stroke-linecap="round"/>',
 defesa:'<path d="M32 8 50 16v17q-1 13-18 22Q15 47 14 33V16z" fill="#d8f2f9" stroke="#73cee9" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 14 44 19v14Q43 43 32 49 21 43 20 33V19z" fill="#214b61"/><path d="m24 33 6 6 11-14" stroke="#e9fcff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
 goleiro1:'<path d="m16 46-4-13 6-3 6 8-2-22 6-1 4 19 1-23 7 1v22l7-13 7 4-5 22-10 9H24z" fill="#e0f6fb" stroke="#83b7cc" stroke-width="2.2" stroke-linejoin="round"/><path d="m23 41 22 2m-14-7v12" stroke="#6ca6c2" stroke-width="2" fill="none" stroke-linecap="round"/>',
 goleiro2:'<circle cx="47" cy="15" r="6.5" fill="#f2fbff" stroke="#7bb8ce" stroke-width="1.5"/><path d="m45 11 5 1 1 5-5 3-4-4z" fill="#2c5267"/><circle cx="26" cy="26" r="5" fill="#eaf9fe"/><path d="m24 32 13-7 11-9m-14 22-10 9-14 5m24-14 10 9 9-2" stroke="#b5ecfa" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="m24 31 11-1 3 10-13 4-7-4z" fill="#91dcef"/>',
 goleiro3:'<path d="M10 49V13h44v36M10 22h44M21 13v36M32 13v36M43 13v36M10 33h44M10 44h44" stroke="#85bbd4" stroke-width="1.5" fill="none"/><path d="M8 53h48M8 13h48" stroke="#e8f9fe" stroke-width="2.3"/><circle cx="39" cy="42" r="9.5" fill="#eefbff" stroke="#5a99b6" stroke-width="1.8"/><path d="m36 36 7 2 2 6-6 4-6-6z" fill="#234b60"/>'
});
function ppCost(n){
 if(!Number.isInteger(n)||n<0||n>20)throw Error('Nível inválido');
 let cost=0;for(let k=0;k<n;k++)cost+=1+Math.floor(k/4);return cost;
}
const validLevels=x=>Array.isArray(x)&&x.length===10&&x.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
function resolveTraining(data,lab){
 const recommended=data?.recommended_levels;
 const pp=Number.isInteger(data?.pp)&&data.pp>=0?data.pp:null;
 const scenario=/^[ABC P]$/.test(String(data?.recommended_scenario||''))?String(data.recommended_scenario).trim():'A';
 let levels=null,kind='pendente';
 if(validLevels(recommended)){levels=recommended.slice();kind='registrado'}
 else if(validLevels(lab?.draftA)&&pp!==null&&lab.draftA.reduce((s,n)=>s+ppCost(n),0)===pp){
  levels=lab.draftA.slice();kind='prévia experimental';
 }else if(validLevels(lab?.[scenario])&&pp!==null&&lab[scenario].reduce((s,n)=>s+ppCost(n),0)===pp){
  levels=lab[scenario].slice();kind='prévia experimental';
 }
 const spent=levels?levels.reduce((s,n)=>s+ppCost(n),0):null;
 return {levels,kind,scenario,pp,spent,
  matchesBudget:spent!==null&&pp!==null&&spent===pp};
}
function svg(key){
 if(!Object.prototype.hasOwnProperty.call(SHAPES,key))return '';
 return '<svg class="scout-v208-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><g>'+SHAPES[key]+'</g></svg>';
}
function render(doc){
 if(!doc?.body||doc.body.dataset.page!=='detail')return false;
 if(doc.getElementById('scout-v208-training'))return true;
 const panel=doc.querySelector('#scout-v188-principal .scout-v188-progress');
 const old=doc.getElementById('v188-train');
 const source=doc.getElementById('scout-v68-data');
 if(!panel||!old||!source)return false;
 let data={},lab={};
 try{data=JSON.parse(source.textContent);lab=JSON.parse(doc.getElementById('lab-data')?.textContent||'{}')}catch(e){return false}
 const state=resolveTraining(data,lab);
 const header=panel.querySelector('h3');
 if(!header)return false;
 header.id='scout-v208-heading';header.classList.add('scout-v208-heading');
 header.replaceChildren();
 const prefix=doc.createElement('span');prefix.className='scout-v208-scenario';
 prefix.textContent=state.scenario+' - ';
 const title=doc.createElement('span');title.textContent='Posse central';
 header.append(prefix,title);
 const table=doc.createElement('table');
 table.id='scout-v208-training';table.className='scout-v208-table';
 table.setAttribute('aria-labelledby','scout-v208-heading');
 table.setAttribute('data-scout-v208-evidence',state.kind);
 table.innerHTML='<colgroup><col class="scout-v208-category-col"><col class="scout-v208-level-col"><col class="scout-v208-pp-col"></colgroup>'+
  '<thead><tr><th scope="col">Categoria</th><th scope="col">Nível</th><th scope="col">PP</th></tr></thead><tbody></tbody><tfoot><tr><th scope="row">Total</th><td aria-label="Não aplicável">—</td><td class="scout-v208-total"></td></tr></tfoot>';
 const tbody=table.querySelector('tbody');
 for(let i=0;i<10;i++){
  const [key,label]=CATEGORIES[i],level=state.levels?.[i]??null;
  const row=doc.createElement('tr');row.setAttribute('data-scout-training-icon',key);
  const category=doc.createElement('th');category.scope='row';
  const pict=doc.createElement('span');pict.className='scout-v208-icon';pict.setAttribute('aria-hidden','true');pict.innerHTML=svg(key);
  const text=doc.createElement('span');text.className='scout-v208-label';text.textContent=label;
  category.append(pict,text);
  const levelCell=doc.createElement('td');levelCell.className='scout-v208-num scout-v208-level';
  levelCell.textContent=level===null?'—':String(level);
  const pp=doc.createElement('td');pp.className='scout-v208-num scout-v208-cost';
  pp.textContent=level===null?'—':String(ppCost(level));
  row.append(category,levelCell,pp);tbody.appendChild(row);
 }
 const total=table.querySelector('.scout-v208-total');
 total.textContent=(state.spent===null?'—':state.spent)+' / '+(state.pp===null?'—':state.pp);
 if(!state.matchesBudget)table.classList.add('scout-v208-review');
 const note=doc.createElement('p');note.id='scout-v208-note';note.className='scout-v208-note';
 if(state.kind==='registrado'){
  note.textContent=state.matchesBudget?
   'Distribuição registrada nesta edição · PP conferidos pelo cálculo progressivo.':
   'Revisar orçamento: os níveis registrados não correspondem aos PP cadastrados nesta edição.';
 }else if(state.kind==='prévia experimental'){
  note.textContent='Prévia experimental desta carta · ainda não validada. Não altera a build oficial.';
 }else{
  note.textContent='Treino desta edição ainda não documentado. Níveis preservados como pendentes — não inventamos valores.';
 }
 panel.classList.add('scout-v208-reference');
 // O resumo antigo permanece somente como fallback DOM para módulos V201/V206 e auditorias.
 old.hidden=true;old.setAttribute('aria-hidden','true');
 old.insertAdjacentElement('afterend',table);
 table.insertAdjacentElement('afterend',note);
 return true;
}
const api=Object.freeze({CATEGORIES,SHAPES,ppCost,validLevels,resolveTraining,svg,render});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function boot(){
 if(render(host.document))return;
 if(typeof host.MutationObserver!=='function')return;
 const observer=new host.MutationObserver(()=>{if(render(host.document))observer.disconnect()});
 observer.observe(host.document.body,{subtree:true,childList:true});
 host.document.addEventListener('scoutpro:profile-ready',()=>{if(render(host.document))observer.disconnect()},{once:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})(typeof window!=='undefined'?window:null);
