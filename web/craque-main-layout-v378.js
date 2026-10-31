/* Organiza ferramentas existentes sob a ficha principal; não toca em dados salvos. */
(function(w){'use strict';const d=w?.document;if(!d)return;
let bucket=null,queued=false;
function revealHash(hash){
 let id;try{id=decodeURIComponent(String(hash||'').replace(/^#/,''))}catch(_){return}
 const target=id?d.getElementById(id):null;
 for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
}
function arrange(){
 queued=false;if(d.body?.dataset.page!=='detail')return;
 const sheet=d.querySelector('.ct311-main-slot .ct378-main-sheet');
 const more=d.querySelector('.ct311-main-slot .ct378-sheet-options');
 if(!sheet||!more)return;
 if(!bucket){bucket=d.createElement('div');bucket.id='ct378-legacy-tools';
  const title=d.createElement('h3');title.textContent='Análises complementares';bucket.append(title);}
 if(bucket.parentElement!==more)more.append(bucket);
 // O HTML histórico V68/V72 ainda fornece evidências e âncoras às 246 cartas.
 // Retirá-lo do fluxo principal evita quatro fichas antigas repetindo a ficha
 // nova; nenhum nó, ID, dado ou handler é apagado.
 let archive=d.getElementById('ct378-source-archive');
 if(!archive){
  archive=d.createElement('details');archive.id='ct378-source-archive';
  archive.className='ct378-source-archive';
  const label=d.createElement('summary');
  label.textContent='Documentação original da carta · consulta';
  archive.append(label);bucket.append(archive);
 }
 for(const id of ['engenharia','foco','pontos','jogar']){
  const node=d.getElementById(id);
  if(node&&!archive.contains(node))archive.append(node);
 }
 const shell=d.getElementById('scout-v220-hero'),slot=d.querySelector('.ct311-main-slot');
 let context=d.getElementById('ct378-context');
 if(!context){context=d.createElement('div');context.id='ct378-context';shell.insertBefore(context,slot);
  const label=d.createElement('label');label.className='ct378-style-label';label.textContent='Estilo de jogo';
  const select=d.createElement('select');select.id='ct378-style';select.setAttribute('aria-label','Estilo da ficha principal');
  for(const button of d.querySelectorAll('.scout-v220-tab')){const op=d.createElement('option');op.value=button.dataset.tactic;op.textContent=button.textContent;select.append(op);}
  select.onchange=()=>shell.querySelector('.scout-v220-tab[data-tactic="'+select.value+'"]')?.click();
  label.append(select);context.append(label);
 }
 const selected=shell.querySelector('.scout-v220-tab[aria-pressed="true"]');
 const style=d.getElementById('ct378-style');if(style&&selected)style.value=selected.dataset.tactic;
 const manager=d.getElementById('ct-manager-v302');
 if(manager){
  if(manager.parentElement!==context)context.prepend(manager);
  const choice=manager.querySelector('#ct-manager-select');
  if(manager.dataset.ct378Compact!=='true'){
   manager.dataset.ct378Compact='true';if(choice?.value)manager.open=false;
  }
  const heading=manager.querySelector(':scope > summary');
  const row=w.CRAQUE_MANAGERS_V302?.find(choice?.value||'');
  const name=row?row.nome+' · '+(row.versao_lancamento||row.catalog_id):choice?.selectedOptions?.[0]?.textContent;
  if(heading&&choice?.value)heading.textContent='Técnico · '+name+' · alterar';
 }
 for(const selector of ['#scout-v220-training','#scout-v220-recs','.scout-v220-practice',
  '#scout-v220-technical','.scout-v220-disclaimer','#scout-v303-style-summary','#scout-v220-tabs',
  '.scout-v220-focus','#ct360-card-quick','.profile-content > .detail-header','.profile-sidebar > .side-nav',
  '.profile-content > .ct360-card-extra','.profile-content > .ct376-panel']){
  for(const node of d.querySelectorAll(selector))if(!bucket.contains(node)&&!node.contains(bucket))bucket.append(node);
 }
 const intro=d.querySelector('.scout-v220-sub');
 if(intro&&intro.dataset.ct378!=='true'){
  intro.textContent='Escolha técnico, posição e estilo. Treino, habilidades e ímpeto estão reunidos na ficha abaixo.';intro.dataset.ct378='true';}
 const title=d.querySelector('.scout-v220-headline h2');if(title&&title.textContent!=='Minha ficha')title.textContent='Minha ficha';
 d.body.dataset.ct378Stage='ready';revealHash(w.location.hash);
}
function schedule(){if(!queued){queued=true;w.requestAnimationFrame(arrange)}}
function start(){
 if(d.body?.dataset.page!=='detail')return;
 d.body.dataset.ct378Stage='loading';arrange();
 new w.MutationObserver(records=>{
  if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&
   (n.matches?.('.ct378-sheet-options,.ct376-panel,.ct360-card-extra')||
    n.querySelector?.('.ct378-sheet-options,.ct376-panel')))))schedule();
 }).observe(d.body,{childList:true,subtree:true});
 // Restabelecer os controles antes de os listeners legados continuarem a troca.
 w.addEventListener('craque:main-sheet-ready-v378',arrange);
 // Qualquer atalho antigo abre seus ancestrais: ferramentas continuam alcançáveis.
 d.addEventListener('click',e=>{
  const a=e.target?.closest?.('a[href*="#"]');if(!a)return;
  let url;try{url=new URL(a.href,w.location.href)}catch(_){return}
  if(url.pathname!==w.location.pathname)return;
  revealHash(url.hash);
 });
 w.addEventListener('hashchange',()=>revealHash(w.location.hash));
 w.setTimeout(()=>{if(d.body.dataset.ct378Stage==='loading')d.body.dataset.ct378Stage='fallback'},15000);
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:null);
