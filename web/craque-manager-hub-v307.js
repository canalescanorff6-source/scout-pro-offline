/* Craque Tático V307 · Central de Técnicos. Catálogo V302, sem dados fabricados. */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host?.document)host.CRAQUE_MANAGER_HUB_V307=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const A=host?.CRAQUE_MANAGERS_V302||(typeof module==='object'?require('./craque-managers-v302.js'):null);
const FAVORITES='scoutpro:v307:manager-favorites',OWNED='scoutpro:v307:manager-owned';
const DEFAULT='scoutpro:v307:default-manager';
const PORTRAIT='scoutpro:v307:manager-portrait:';
const KOVAC_ID='CT-MGR-071';
const CATEGORIES=Object.freeze({elite90:'90 · excelência',elite89:'89 · elite',strong:'85–88 · alternativa',low:'abaixo de 85 · atenção'});
function grade(n){return n===90?'elite90':n>=89?'elite89':n>=60&&n<85?'low':n>=85?'strong':'low'}
function initials(name){return String(name||'?').trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
function safePortrait(value){return typeof value==='string'&&value.length<=100000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(value)?value:null}
function portraitKey(id){return PORTRAIT+String(id)}
function portraitFor(id,storage=host?.localStorage){try{return safePortrait(storage?.getItem(portraitKey(id)))}catch(_){return null}}
function fromStore(key,storage=host?.localStorage){
 try{const array=JSON.parse(storage?.getItem(key)||'[]');return new Set(Array.isArray(array)?array.filter(x=>/^CT-MGR-\d{3}$/.test(x)):[])}
 catch(_){return new Set()}
}
function toggleStored(key,id,storage=host?.localStorage){
 const current=fromStore(key,storage);
 if(current.has(id))current.delete(id);else current.add(id);
 storage.setItem(key,JSON.stringify([...current].sort()));return current.has(id);
}
function isStrong(c,id){return (A?.proficiency(c,id)??-1)>=85}
function pick(items,{scope='featured',query='',style='',min=0,dual=false,owned=new Set(),favorites=new Set()}={}){
 const curated=new Set(A?.CURATED_IDS||[]);
 const needle=String(query).trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return items.filter(c=>{
  if(scope==='featured'&&!curated.has(c.catalog_id)&&c.catalog_id!==KOVAC_ID)return false;
  if(scope==='owned'&&!owned.has(c.catalog_id))return false;
  if(scope==='favorites'&&!favorites.has(c.catalog_id))return false;
  const text=[c.nome,c.versao_lancamento,c.catalog_id].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(needle&&!text.includes(needle))return false;
  const values=A.STYLES.map(s=>A.proficiency(c,s.id)).filter(x=>Number.isInteger(x));
  if(dual&&values.filter(x=>x>=85).length<2)return false;
  if(style){const n=A.proficiency(c,style);if(n===null||n<Number(min))return false}
  else if(!values.some(n=>n>=Number(min)))return false;
  return true;
 }).sort((a,b)=>{
  // O novo técnico principal deve ficar visível antes da seleção histórica.
  // Não altera a composição dos 22 históricos; somente ordenação visual.
  if(scope==='featured'){
   const primaryA=Number(a.catalog_id===KOVAC_ID),primaryB=Number(b.catalog_id===KOVAC_ID);
   if(primaryA!==primaryB)return primaryB-primaryA;
  }
  const x=Number(curated.has(a.catalog_id)),y=Number(curated.has(b.catalog_id));
  if(x!==y)return y-x;
  const max=c=>Math.max(...A.STYLES.map(s=>A.proficiency(c,s.id)??0));
  if(max(a)!==max(b))return max(b)-max(a);
  return a.nome.localeCompare(b.nome,'pt-BR');
 });
}
const $=id=>host?.document?.getElementById(id);
const el=(tag,cls,content)=>{
 const node=host.document.createElement(tag);
 if(cls)node.className=cls;
 if(content!==undefined)node.textContent=String(content);
 return node;
};
let full=[],compared=new Set(),feedback='',lastFilters={};
function feedbackMessage(s){feedback=s;const p=$('hub-feedback');if(p)p.textContent=feedback}
function persistDefault(c){
 const viable=A.STYLES.filter(s=>s.supported).sort((a,b)=>
  (A.proficiency(c,b.id)??-1)-(A.proficiency(c,a.id)??-1));
 const tactic=viable[0]?.id||'posse';
 const data=JSON.stringify({catalog_id:c.catalog_id,tactic});
 try{
  host.localStorage.setItem(DEFAULT,data);
  host.localStorage.setItem(A.KEY,data);
  feedbackMessage(c.nome+' · '+(c.versao_lancamento||'versão pendente')+
   ' definido como técnico padrão de Minhas Cartas. Seleções individuais já salvas continuam prioritárias.');
 }catch(_){feedbackMessage('Não foi possível salvar o técnico padrão. Confira o armazenamento do aparelho.')}
}
function renderCompare(){
 const box=$('hub-compare');if(!box)return;
 box.replaceChildren();
 const chosen=full.filter(x=>compared.has(x.catalog_id));
 box.hidden=!chosen.length;
 if(!chosen.length)return;
 box.append(el('h2','','Comparar versões ('+chosen.length+'/2)'));
 const panel=el('div','hub-compare-grid');
 for(const c of chosen){
  const block=el('div');
  block.append(el('h3','',c.nome+' · '+(c.versao_lancamento||'versão pendente')));
  const scores=A.STYLES.slice().sort((a,b)=>(A.proficiency(c,b.id)??-1)-(A.proficiency(c,a.id)??-1));
  for(const s of scores){block.append(el('p','',s.label+': '+(A.proficiency(c,s.id)??'pendente')))}
  block.append(el('p','','Bônus: '+(c.boosters_EN?.join(' · ')||'não documentados')));
  panel.append(block);
 }
 box.append(panel);
 if(chosen.length<2)box.append(el('p','','Escolha mais uma versão para comparar todas as proficiências.'));
}
function scoreRow(c,s){
 const score=A.proficiency(c,s.id),className=score===null?'low':grade(score);
 const row=el('div','hub-score');row.dataset.grade=className;
 const num=el('span','hub-score-num',score===null?'—':score);
 const info=el('div','hub-score-body');
 info.append(el('div','hub-score-name',s.label));
 const bar=el('div','hub-bar'),fill=el('span','hub-bar-fill');
 fill.style.width=(score===null?0:Math.max(0,Math.min(100,score)))+'%';bar.append(fill);info.append(bar);
 row.append(num,info);return row;
}
function button(title,fn,extra=''){
 const b=el('button','hub-btn '+extra,title);b.type='button';b.addEventListener('click',fn);return b;
}
function uploadPortrait(c){
 const input=el('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';input.hidden=true;
 input.addEventListener('change',()=>{
  const file=input.files?.[0];if(!file){input.remove();return}
  if(!/^image\/(jpeg|png|webp)$/.test(file.type)||file.size>8*1024*1024){
   feedbackMessage('Use JPEG, PNG ou WEBP com até 8 MB.');input.remove();return;
  }
  const reader=new host.FileReader();
  reader.onerror=()=>{feedbackMessage('Não foi possível ler a imagem escolhida.');input.remove()};
  reader.onload=()=>{
   const img=new host.Image();
   img.onerror=()=>{feedbackMessage('Arquivo de imagem inválido.');input.remove()};
   img.onload=()=>{
    const canvas=host.document.createElement('canvas');
    const size=220;canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext('2d');if(!ctx){feedbackMessage('Imagem não suportada.');input.remove();return}
    const side=Math.min(img.naturalHeight,img.naturalWidth),x=(img.naturalWidth-side)/2,y=(img.naturalHeight-side)/2;
    ctx.drawImage(img,x,y,side,side,0,0,size,size);
    let encoded=canvas.toDataURL('image/jpeg',0.74);
    if(encoded.length>99000)encoded=canvas.toDataURL('image/jpeg',0.5);
    if(!safePortrait(encoded)){feedbackMessage('Foto muito grande após reduzir. Use um recorte menor.');input.remove();return}
    try{host.localStorage.setItem(portraitKey(c.catalog_id),encoded);
     feedbackMessage('Retrato local de '+c.nome+' salvo. Entra no backup do aplicativo; não substitui artes oficiais.');
     render();
    }catch(_){feedbackMessage('Armazenamento cheio: não foi possível salvar a imagem.')}
    input.remove();
   };
   img.src=String(reader.result);
  };
  reader.readAsDataURL(file);
 });
 host.document.body.append(input);input.click();
}
function makeCard(c,owned,favs){
 const node=el('article','hub-card');node.dataset.curated=String(A.CURATED_IDS.includes(c.catalog_id)||c.catalog_id===KOVAC_ID);
 const top=el('div','hub-top'),picture=el('div','hub-photo');
 const imgData=portraitFor(c.catalog_id);
 if(imgData){const img=el('img');img.src=imgData;img.alt='Imagem fornecida pelo usuário para '+c.nome;picture.append(img)}
 else picture.append(el('strong','',initials(c.nome)));
 const desc=el('div');desc.append(el('h2','',c.nome),
  el('span','hub-sub',(c.versao_lancamento||'data pendente')+' · '+c.catalog_id));
 const pills=el('div','hub-chips');
 if(c.catalog_id===KOVAC_ID)pills.append(el('span','hub-chip','TÉCNICO PRINCIPAL · POSSE 90'));
 if(A.CURATED_IDS.includes(c.catalog_id))pills.append(el('span','hub-chip','SELEÇÃO COMPETITIVA'));
 const strong=A.competitiveStyles(c,89);
 if(strong.length>=2)pills.append(el('span','hub-chip',strong.length+' ESTILOS 89+'));
 if(owned.has(c.catalog_id))pills.append(el('span','hub-chip','MEU TÉCNICO'));
 desc.append(pills);top.append(picture,desc);node.append(top);
 // V329: exibir primeiro somente a proficiência do estilo em foco.
 // Sem filtro de estilo, usar Posse como referência de VISUALIZAÇÃO, sem
 // alterar filtros, níveis PP ou versão catalogada do técnico.
 const requested=$('hub-style')?.value||'posse';
 const focus=A.STYLES.find(s=>s.id===requested)||A.STYLES.find(s=>s.id==='posse')||A.STYLES[0];
 const primary=el('section','hub-v329-primary-score');
 primary.setAttribute('aria-label','Proficiência em foco');
 primary.append(el('p','hub-v329-kicker','ESTILO EM FOCO · '+focus.label));
 primary.append(scoreRow(c,focus));
 primary.append(el('small','hub-v329-disclaimer','Proficiência documentada. Não somar como PP.'));
 node.append(primary);
 const more=el('details','hub-v329-other-scores');
 more.append(el('summary','','Ver outras 5 proficiências'));
 const scores=el('div','hub-score-grid');
 for(const s of A.STYLES.filter(s=>s.id!==focus.id))scores.append(scoreRow(c,s));
 more.append(scores);
 more.open=expandedScores.has(c.catalog_id);
 more.addEventListener('toggle',()=>{
  if(!more.isConnected)return;
  if(more.open)expandedScores.add(c.catalog_id);
  else expandedScores.delete(c.catalog_id);
 });
 node.append(more);
 const actions=el('div','hub-actions');
 const own=button(owned.has(c.catalog_id)?'✓ Meu técnico':'Marcar como meu',()=>{
  try{toggleStored(OWNED,c.catalog_id);render()}catch(_){feedbackMessage('Sem espaço para salvar a seleção.')}
 });
 own.setAttribute('aria-pressed',String(owned.has(c.catalog_id)));
 const fav=button(favs.has(c.catalog_id)?'★ Favorito':'☆ Favoritar',()=>{
  try{toggleStored(FAVORITES,c.catalog_id);render()}catch(_){feedbackMessage('Sem espaço para favoritos.')}
 });
 fav.setAttribute('aria-pressed',String(favs.has(c.catalog_id)));
 const compare=button(compared.has(c.catalog_id)?'✓ Comparando':'Comparar',()=>{
  if(compared.has(c.catalog_id))compared.delete(c.catalog_id);
  else if(compared.size<2)compared.add(c.catalog_id);
  else{feedbackMessage('Compare até duas versões por vez: desmarque uma primeiro.');return}
  render();
 });
 compare.setAttribute('aria-pressed',String(compared.has(c.catalog_id)));
 actions.append(own,fav,compare,button('Usar como padrão',()=>persistDefault(c),'primary'));
 actions.append(button(imgData?'Trocar retrato':'Adicionar retrato',()=>uploadPortrait(c)));
 if(imgData)actions.append(button('Remover retrato',()=>{
  try{host.localStorage.removeItem(portraitKey(c.catalog_id));render();feedbackMessage('Retrato removido somente desta edição.')}catch(_){}
 }));
 node.append(actions);
 const detail=el('details','hub-details');detail.append(el('summary','','Bônus · combinações · origem'));
 if(c.afinidade_PTBR)detail.append(el('p','','Afinidade para comandar: '+c.afinidade_PTBR));
  detail.append(el('h3','','Bônus de técnico divulgados'));
 detail.append(el('p','',(c.boosters_PTBR||c.boosters_EN)?.length?(c.boosters_PTBR||c.boosters_EN).join(' · '):'Não documentados nesta edição.'));
 detail.append(el('h3','','Link-Up Play e ativação'));
 if(!c.ativacao_das_combinacoes?.length)
  detail.append(el('p','','Combinações não documentadas para esta edição.'));
 else for(const link of c.ativacao_das_combinacoes){
  detail.append(el('p','',String(link.name_EN||'Link-Up')+' · Peça central: '+
   (link.centrepiece_playstyle_EN||'?')+' ('+(link.centrepiece_position_EN||'?')+
   ') · Parceiro: '+(link.keyman_playstyle_EN||'?')+' ('+(link.keyman_position_EN||'?')+')'));
 }
 detail.append(el('p','','Validação: '+(c.linkups_status||'pendente')+
  '. Não inferir ativação real na equipe nem aplicar bônus como PP.'));
 const url=c.source_profile;
 if(typeof url==='string'&&/^https:\/\//.test(url)){
  const a=el('a','','Fonte consultável da versão ↗');a.href=url;a.rel='noopener noreferrer';a.target='_blank';detail.append(a);
 }
 detail.append(el('p','','Retrato: '+(imgData?'adicionado pelo usuário':'pendente; adicione uma foto autorizada')+'. Sobreposição: motor de PP pendente.'));
 node.append(detail);return node;
}
function render(){
 if(!host?.document||!full.length)return;
 const scope=$('hub-scope')?.value||'featured',query=$('hub-search')?.value||'';
 const style=$('hub-style')?.value||'',min=Number($('hub-min')?.value||0),dual=Boolean($('hub-dual')?.checked);
 const owned=fromStore(OWNED),favorites=fromStore(FAVORITES);
 lastFilters={scope,query,style,min,dual};
 const results=pick(full,{scope,query,style,min,dual,owned,favorites});
 const container=$('hub-cards');container.replaceChildren();
 for(const c of results)container.append(makeCard(c,owned,favorites));
 $('hub-results').textContent=results.length+' versões exibidas · '+full.length+' no catálogo';
 $('hub-empty').hidden=results.length!==0;
 renderCompare();
}
async function start(){
 if(!A||!$('hub-cards'))return;
 for(const s of A.STYLES){const option=el('option','',s.label);option.value=s.id;$('hub-style').append(option)}
 for(const id of ['hub-search','hub-scope','hub-style','hub-min','hub-dual']){
  $(id).addEventListener(id==='hub-search'?'input':'change',render);
 }
 try{
  const data=await A.load();full=data.tecnicos;
  $('hub-count-total').textContent=String(full.length);
  $('hub-count-featured').textContent=String(pick(full,{scope:'featured'}).length);
  render();
 }catch(e){feedbackMessage('Erro de carregamento do catálogo offline: '+String(e.message||e))}
}
if(host?.document){
 if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',start,{once:true});
 else start();
}
return Object.freeze({grade,initials,safePortrait,portraitKey,portraitFor,fromStore,toggleStored,pick,CATEGORIES,DEFAULT,OWNED,FAVORITES,PORTRAIT});
});
