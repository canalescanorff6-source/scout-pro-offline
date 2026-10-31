/* Craque Tático V361 — mudança real de interface, não apenas pintura.
 * Lê somente identidade/PP/função da ficha já renderizada. Não grava nem recalcula fichas.
 * Originais permanecem intactos, com o mesmo Card ID, arte, edição e treinos.
 */
(function(win){'use strict';
 const d=win&&win.document;if(!d)return;
 const mk=(tag,klass,value)=>{
  const e=d.createElement(tag);
  if(klass)e.className=klass;
  if(value!==undefined)e.textContent=String(value);
  return e;
 };
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 function spotlight(){
  if(d.body?.dataset.page!=='detail'||d.getElementById('ct361-player-glance'))return;
  const content=d.querySelector('.profile-content');
  const current=d.querySelector('.profile-content>.mobile-profile');
  const header=d.querySelector('.profile-content>.detail-header');
  const img=current?.querySelector('img')||d.querySelector('.profile-sidebar .side-art img');
  const name=header?.querySelector('h1');
  const kpis=[...(header?.querySelectorAll('.hero-kpi')||[])];
  if(!content||!img||!name||!kpis.length)return;
  const originalName=clean(name.textContent);
  const chips=[...(header.querySelectorAll('.detail-overline .tiny-chip'))].map(x=>clean(x.textContent)).filter(Boolean);
  const edition=clean(header.querySelector('.detail-sub')?.textContent).split(' • ')[0];
  const card=d.querySelector('.breadcrumbs')?.textContent?.match(/Ficha\s+(\d+)/i)?.[1]||'';
  const frame=mk('section','ct361-player-glance');frame.id='ct361-player-glance';
  frame.setAttribute('aria-label','Resumo competitivo da carta original');
  const kicker=mk('div','ct361-glance-kicker','CRAQUE TÁTICO  /  FICHA EM FOCO');
  const tag=mk('span','ct361-release-proof','VISUAL 361');
  kicker.append(tag);
  const body=mk('div','ct361-glance-body');
  const artwork=mk('div','ct361-glance-art');
  const photo=img.cloneNode(false);photo.loading='eager';photo.decoding='async';
  artwork.appendChild(photo);
  const info=mk('div','ct361-glance-info');
  const meta=mk('div','ct361-glance-meta',chips.slice(0,2).join('  ·  ')||'CARTA ORIGINAL');
  const heading=mk('h2','ct361-glance-name',originalName);
  const caption=mk('p','ct361-glance-edition',edition||'Edição preservada no cadastro');
  info.append(meta,heading,caption);
  const strip=mk('div','ct361-glance-stats');
  for(const kpi of kpis.slice(0,3)){
   const title=clean(kpi.querySelector('small')?.textContent);
   const value=clean(kpi.querySelector('strong')?.textContent);
   if(!title&&!value)continue;
   const cell=mk('div','ct361-glance-stat');
   cell.append(mk('small','',title),mk('strong','',value));
   strip.append(cell);
  }
  const cardId=clean(d.querySelector('.profile-sidebar .side-info-row .mono')?.textContent);
  if(card||cardId)info.append(mk('span','ct361-glance-cardno',
   (card?'Carta '+card:'')+(card&&cardId?' · ':'')+(cardId?'Card ID '+cardId:'')));
  body.append(artwork,info);
  const actions=mk('nav','ct361-glance-actions');
  actions.setAttribute('aria-label','Atalhos principais da carta');
  for(const [id,label] of [['foco','Ver meu foco'],['pontos','Abrir treinamento']]){
   if(!d.getElementById(id))continue;
   const a=mk('a','ct361-glance-link',label);a.href='#'+id;actions.append(a);
  }
  frame.append(kicker,body,strip,actions);
  content.insertBefore(frame,current||header||content.firstChild);
  d.body.classList.add('ct361-detail-ready');
  d.body.dataset.ct361Ui='ready';
 }
 function catalog(){
  if(d.body?.dataset.page!=='catalog'||d.getElementById('ct361-home-mark'))return;
  const hero=d.querySelector('.hero .hero-text');
  if(!hero)return;
  const mark=mk('span','ct361-home-mark','NOVA CENTRAL  ·  V361');
  mark.id='ct361-home-mark';
  hero.insertBefore(mark,hero.firstChild);
  d.body.classList.add('ct361-home-ready');
  d.body.dataset.ct361Ui='ready';
 }
 function friends(){
  if(d.body?.dataset.page!=='friends'||d.getElementById('ct361-friends-mark'))return;
  const header=d.querySelector('.friends-hero h1,.friends-hero');
  if(!header)return;
  const mark=mk('span','ct361-friends-mark','ACERVOS INDEPENDENTES  /  V361');
  mark.id='ct361-friends-mark';
  header.parentElement.insertBefore(mark,header);
  d.body.classList.add('ct361-friends-ready');
  d.body.dataset.ct361Ui='ready';
 }
 function dock(){
  if(!['catalog','detail'].includes(d.body?.dataset.page))return;
  if(typeof win.matchMedia==='function'&&!win.matchMedia('(max-width:720px)').matches)return;
  const more=d.querySelector('#scout-app-bar .scout-v189-dock-more');
  const options=more?.querySelector('.scout-v189-dock-options');
  if(!more||!options||more.dataset.ct361Dock==='1')return;
  // O atualizador original continua com seu handler; apenas sai da barra primária.
  const update=d.getElementById('scout-update');
  if(update){options.insertBefore(update,options.firstChild);update.classList.add('ct361-update-in-more');}
  const bar=d.getElementById('scout-app-bar');
  if(bar&&!bar.querySelector('.ct361-home-dock')){
   const a=mk('a','ct361-home-dock','Início');
   a.href=(d.body.dataset.page==='detail'?'../':'')+'index.html';
   bar.insertBefore(a,more);
  }
  more.dataset.ct361Dock='1';
  d.body.classList.add('ct361-dock-ready');
 }
 function init(){spotlight();catalog();friends();dock();}
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
 d.addEventListener('scoutpro:ui-ready',init);
 d.addEventListener('scoutpro:profile-ready',init);
 let tries=0;
 const retry=()=>{init();if(++tries<8)win.setTimeout(retry,180);};
 win.setTimeout(retry,150);
})(typeof window!=='undefined'?window:null);
