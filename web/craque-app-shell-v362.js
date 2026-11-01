/* V362 / App Shell — tela e navegação comuns para TODO o Craque Tático.
 * Apresentação somente: NÃO altera Card IDs, PP, builds, backups ou eventos de treino.
 * Evita outra atualização "só de CSS": injeta navegação e hierarquia reais.
 */
(function(host){'use strict';
const d=host?.document;if(!d)return;
const names={
 catalog:'Minhas cartas',detail:'Ficha de jogador',friends:'Outros elencos',
 team:'Minha escalação','rotation-lab':'Laboratório','manager-hub':'Central de técnicos',
 'progress-audit':'Níveis e PP',boosters:'Ímpetos','tactical-review':'Análise tática',
 'video-evidence':'Vídeos e evidências','player-model':'Modelo corporal','review379':'Conferência de cartas',
 'rarity-audit':'Raridades','batch-8':'Cadastro de cartas','batch-9':'Cadastro de cartas'
};
const at=()=>d.body?.dataset.page||'';
const ACTIVE_RELEASE=362;
// O visual aprovado é uma versão ATIVA, não mais uma camada cumulativa.
// A futura UI deve montar seus controles e chamar
// CRAQUE_UI_RELEASES.activate({version:N,ready:true,themeElement,dispose})
// SOMENTE quando estiver pronta. A anterior é aposentada sem apagar dados.
const uiReleases=host.CRAQUE_UI_RELEASES||(host.CRAQUE_UI_RELEASES={
 current:0,dispose:null,
 activate(next){
  if(!next||!Number.isInteger(next.version)||next.version<1||
   next.ready!==true||next.version<this.current)return false;
  if(next.version===this.current)return true;
  const previous=this.dispose;
  // Só retire uma interface depois que a substituta declarar montagem pronta.
  if(typeof previous==='function')previous();
  for(const node of (d.querySelectorAll?.('[data-craque-ui-release]')||[])){
   const version=Number(node.dataset.craqueUiRelease);
   if(Number.isInteger(version)&&version<next.version)node.remove();
  }
  for(const style of (d.querySelectorAll?.('link[data-craque-ui-theme]')||[])){
   const version=Number(style.dataset.craqueUiTheme);
   if(Number.isInteger(version)&&version<next.version){style.disabled=true;style.remove();}
  }
  if(next.themeElement)next.themeElement.dataset.craqueUiTheme=String(next.version);
  this.current=next.version;this.dispose=typeof next.dispose==='function'?next.dispose:null;
  if(d.body)d.body.dataset.craqueUiActive='v'+next.version;
  return true;
 }
});
function activateCurrentRelease(){
 const theme=d.querySelector('link[data-ct362-design="true"],link[href$="craque-app-shell-v362.css"]');
 return uiReleases.activate({
  version:ACTIVE_RELEASE,ready:!!d.body,themeElement:theme,
  dispose:()=>{
   d.getElementById('ct362-design-proof')?.remove();
   d.getElementById('ct362-appnav')?.remove();
   d.body?.classList.remove('ct362-design','ct362-options-open');
   d.body?.removeAttribute('data-ct362-ui');
  }
 });
}
function create(tag,klass,label){
 const node=d.createElement(tag);if(klass)node.className=klass;
 if(label!==undefined)node.textContent=String(label);
 return node;
}
function navItems(page){
 const prefix=page==='detail'?'../':'';
 return [
  {label:'Cartas',url:prefix+'index.html',mark:'▣',page:'catalog'},
  {label:'Outros',url:prefix+'outros-elencos-v227.html',mark:'♙',page:'friends'},
  {label:'Time',url:prefix+'meu-time-duas-formacoes-v177.html',mark:'♜',page:'team'},
  {label:'Técnicos',url:prefix+'tecnicos-v307.html',mark:'◎',page:'manager-hub'}
 ];
}
// A fonte antiga tinha 15 cabeçalhos distintos. A identidade é sempre a
// mesma: atualizamos o HTML real, inclusive nas rotas sem app-bridge.
function unifyHeader(){
 const page=at(),head=d.querySelector('.topbar,.friends-head,.hub-header,.scout-rotation-top,.review-top,main .head,body>header');
 if(!head||typeof head.querySelector!=='function')return;
 head.classList?.add('ct362-unified-head');
 const prefix=page==='detail'?'../':'';
 for(const img of (head.querySelectorAll?.('img')||[])){
  const src=img.getAttribute('src')||'';
  if(/scout-pro-icon/i.test(src)){
   img.setAttribute('src',prefix+'assets/craque-tatico-icon.svg');
   img.setAttribute('alt','Craque Tático');
  }
 }
 const oldLogo=head.querySelector('.brand-logo');
 if(oldLogo&&oldLogo.textContent.trim()==='S'){
  const image=create('img','brand-logo-img');
  image.src=prefix+'assets/craque-tatico-icon.svg';
  image.alt='Craque Tático';oldLogo.replaceWith(image);
 }
 for(const selector of ['.brand-copy b','.friends-brand b','.hub-brand strong','.review-top>span']){
  const label=head.querySelector(selector);
  if(label)label.textContent='CRAQUE TÁTICO';
 }
 for(const selector of ['.brandmark','.scout-rotation-top>a']){
  const link=head.querySelector(selector);
  if(!link)continue;
  for(const node of link.childNodes||[]){
   if(node.nodeType===3 && /SCOUT\s+PRO/i.test(node.textContent||''))node.textContent=node.textContent.replace(/SCOUT\s+PRO/gi,'CRAQUE TÁTICO');
  }
 }
 const small=head.querySelector('.brand-copy small');
 if(small)small.textContent='LABORATÓRIO DE FUTEBOL';
 const edition=head.querySelector('.topbar .edition');
 if(edition&&/\bV\d+\b|SCOUT\s+PRO/i.test(edition.textContent||''))
  edition.textContent=page==='detail'?'eFOOTBALL 2027 · CRAQUE TÁTICO':(names[page]||'CRAQUE TÁTICO').toUpperCase();
 const title=d.title||'';
 if(/SCOUT\s+PRO|\bV\d+\b/i.test(title))
  d.title=title.replace(/SCOUT\s+PRO/gi,'Craque Tático').replace(/\bV\d+\b/gi,'').replace(/\s{2,}/g,' ').trim();
}
let buildVersionRequested=false;
function showInstalledVersion(proof){
 if(buildVersionRequested||typeof host.fetch!=='function')return;
 buildVersionRequested=true;
 const root=at()==='detail'?'../':'';
 // Mesmo JSON empacotado no Electron e no APK: prova do bundle instalado.
 Promise.resolve().then(()=>host.fetch(root+'scout-build-info.json',{cache:'no-store'}))
  .then(r=>r.ok?r.json():null).then(info=>{
   const v=String(info?.version||'');
   if(!/^\d+\.\d+\.\d+$/.test(v))return;
   proof.textContent='v'+v;
   proof.title='Revisão '+String(info.git_revision||'local').slice(0,12);
   d.body.dataset.craqueInstalledVersion=v;
  }).catch(()=>{});
}
function shell(){
 const page=at();
 if(!page)return;
 unifyHeader();
 if(d.getElementById('ct362-design-proof'))return;
 d.body.classList.add('ct362-design');
 d.body.dataset.ct362Ui='true';
 const oldHead=d.querySelector('.topbar,.friends-head,.hub-header,main .head,body>header');
 // Os 246 HTMLs históricos carregam rótulos de versão V72, não a versão
 // executada. Não exibir um número antigo como se fosse o aplicativo atual.
 if(page==='detail'){
  const edition=d.querySelector('.topbar .edition');
  if(edition&&/\bV\d+\b/i.test(edition.textContent||'')){
   edition.textContent='eFOOTBALL 2027 · CRAQUE TÁTICO';
  }
 }
 const proof=create('span','ct362-proof','CRAQUE TÁTICO');
 proof.id='ct362-design-proof';
 proof.dataset.craqueUiRelease=String(ACTIVE_RELEASE);
 proof.setAttribute('aria-label','Craque Tático, versão realmente instalada');
 showInstalledVersion(proof);
 if(oldHead){
  oldHead.classList.add('ct362-existing-head');
  oldHead.appendChild(proof);
 }else{
  proof.classList.add('ct362-standalone-proof');
  d.body.insertAdjacentElement('afterbegin',proof);
 }
 // Nav unificada somente nas páginas que NÃO usam o dock nativo V189.
 // No catálogo/ficha, preservar todos os handlers originais, sobretudo Atualizar.
 if(!['catalog','detail'].includes(page)){
  const nav=create('nav','ct362-appnav');nav.id='ct362-appnav';
  nav.dataset.craqueUiRelease=String(ACTIVE_RELEASE);
  nav.setAttribute('aria-label','Navegação principal do Craque Tático');
  for(const item of navItems(page)){
   const a=create('a','ct362-navitem');
   a.href=item.url;
   a.append(create('span','ct362-navicon',item.mark),create('span','ct362-navlabel',item.label));
   if(page===item.page)a.setAttribute('aria-current','page');
   nav.append(a);
  }
  const more=create('button','ct362-navmore');
  more.type='button';more.setAttribute('aria-expanded','false');
  more.setAttribute('aria-controls','ct362-navtools');
  more.append(create('span','ct362-navicon','☰'),create('span','ct362-navlabel','Mais'));
  const tools=create('div','ct362-tools-popup');tools.id='ct362-navtools';
  tools.hidden=true;
  const prefix=page==='detail'?'../':'';
  for(const [label,href] of [
   ['Conferir níveis e PP','conferir-progresso-v248.html'],
   ['Habilidades e ímpetos','revisao-impetos-v103.html'],
   ['Laboratório','meu-time-testes-v219.html']]){
   const a=create('a','',label);a.href=prefix+href;tools.append(a);
  }
  const toggle=()=>{
   const open=more.getAttribute('aria-expanded')!=='true';
   more.setAttribute('aria-expanded',String(open));
   tools.hidden=!open;
   d.body.classList.toggle('ct362-options-open',open);
  };
  more.addEventListener('click',toggle);
  d.addEventListener('click',event=>{
   if(more.getAttribute('aria-expanded')!=='true')return;
   if(more.contains(event.target)||tools.contains(event.target)||
      d.getElementById('scout-app-bar')?.contains(event.target))return;
   more.setAttribute('aria-expanded','false');tools.hidden=true;
   d.body.classList.remove('ct362-options-open');
  });
  nav.append(more,tools);
  d.body.append(nav);
 }
}
function catalog(){
 if(at()!=='catalog')return;
 const previous=d.getElementById('ct361-home-mark');
 if(previous)previous.textContent='ACERVO PESSOAL';
 if(d.body.dataset.ct362Catalog==='true')return;
 const hero=d.querySelector('.hero .hero-text');
 const heading=hero?.querySelector('h1');
 const tiles=hero?.querySelector('.scout-v189-quick');
 if(!heading||!tiles)return;
 heading.textContent='Meu elenco.';
 const indicator=hero.querySelector('.scout-v189-eyebrow');
 if(indicator)indicator.textContent='SUAS CARTAS. SEU JEITO DE JOGAR.';
 tiles.querySelectorAll('.scout-v189-tile .scout-v189-mark').forEach((mark,i)=>{mark.textContent=String(i+1).padStart(2,'0')});
 const section=d.querySelector('#catalogo .section-title');
 if(section)section.textContent='Cartas do acervo';
 const existing=d.getElementById('ct361-home-mark');if(existing)existing.textContent='ACERVO PESSOAL';
 d.body.dataset.ct362Catalog='true';
}
function detail(){
 if(at()!=='detail'||d.body.dataset.ct362Detail==='true')return;
 const glance=d.getElementById('ct361-player-glance');
 const shell=d.getElementById('scout-v220-hero');
 if(!glance||!shell)return;
 glance.querySelector('.ct361-glance-kicker')?.replaceChildren(d.createTextNode('MINHA CARTA · DADOS REAIS'));
 const proof=glance.querySelector('.ct361-release-proof');
 if(proof)proof.textContent='MINHA CARTA';
 const title=shell.querySelector('.scout-v220-headline h2');
 if(title)title.textContent='Plano de desenvolvimento';
 const training=d.getElementById('scout-v220-training');
 const recs=d.getElementById('scout-v220-recs');
 const practice=shell.querySelector('.scout-v220-practice');
 if(training)training.dataset.ct362Pane='treino';
 if(recs)recs.dataset.ct362Pane='habilidades';
 if(practice)practice.dataset.ct362Pane='campo';
 const eyebrow=shell.querySelector('.scout-v220-eyebrow');
 if(eyebrow)eyebrow.textContent='SUA ESTRATÉGIA COMPETITIVA';
 d.body.dataset.ct362Detail='true';
}
function friends(){
 if(at()!=='friends')return;
 const previous=d.getElementById('ct361-friends-mark');
 if(previous)previous.textContent='ACERVOS INDEPENDENTES';
 if(d.body.dataset.ct362Friends==='true')return;
 const heading=d.querySelector('.friends-hero h1');if(!heading)return;
 heading.textContent='Outros Elencos';
 const paragraph=d.querySelector('.friends-hero h1 + p');
 if(paragraph)paragraph.textContent='Selecione uma pessoa, abra suas cartas e consulte as mesmas fichas competitivas — sem misturar com seu elenco.';
 const jump=d.querySelector('.friends-jump');
 const featured=d.getElementById('bruno-featured');
 if(jump&&featured?.parentNode===jump.parentNode){
   // O seletor tem prioridade visual; a coleção especial continua disponível logo abaixo.
   featured.parentNode.insertBefore(jump,featured);
 }
 const existing=d.getElementById('ct361-friends-mark');if(existing)existing.textContent='ACERVOS INDEPENDENTES';
 d.body.dataset.ct362Friends='true';
}
function generic(){
 const page=at();if(['catalog','detail','friends'].includes(page))return;
 const h=d.querySelector('main h1,.hub-hero h1');
 if(h&&page==='manager-hub')h.innerHTML='Escolha seu <em>técnico</em>';
}
// Caderno separado: o acervo e os planos offline continuam no aplicativo.
function externalFormacoes(){
 if(at()!=='catalog'||d.getElementById('ct-formacoes-premium-link'))return;
 const quick=d.querySelector('.scout-v189-quick');if(!quick)return;
 const url='https://craque-tatico-formacoes-premium.vocalclock33.chatgpt.site/';
 const wrap=create('div','ct-formacoes-premium-access');wrap.id='ct-formacoes-premium-access';
 const link=create('a','ct-formacoes-premium-link');link.id='ct-formacoes-premium-link';
 link.href=url;link.target='_blank';link.rel='noopener noreferrer';
 link.setAttribute('aria-label','Formações Premium, página online que abre no navegador');
 link.append(create('strong','','Formações Premium ↗'),create('span','','200 planos agrupados · abre online'));
 const status=create('span','ct-formacoes-premium-status');status.id='ct-formacoes-premium-status';
 status.hidden=true;status.setAttribute('role','status');
 link.addEventListener('click',async event=>{
  const cap=host.Capacitor;if(!cap?.isNativePlatform?.())return;
  event.preventDefault();status.hidden=true;
  try{
   const browser=cap.Plugins?.Browser||cap.registerPlugin?.('Browser');
   if(!browser?.open)throw new Error('Browser indisponível');
   await browser.open({url,toolbarColor:'#09121b'});
  }catch(_error){status.textContent='Não consegui abrir o navegador. Confira a conexão e tente novamente.';status.hidden=false;}
 });
 const proof=d.getElementById('ct356-boot-proof');
 if(proof?.parentNode){proof.parentNode.insertBefore(wrap,proof);wrap.append(proof,link,status);}
 else{wrap.append(link,status);quick.after(wrap);}
}
function boot(){
 if(!activateCurrentRelease())return; // uma geração mais nova já assumiu a interface
 shell();catalog();detail();friends();generic();externalFormacoes();
}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
d.addEventListener('scoutpro:profile-ready',boot);
d.addEventListener('scoutpro:ui-ready',boot);
// V361 e ficha V220 são assíncronas; reexaminar sem alterar estado dos inputs.
let retries=0;function retry(){boot();if(++retries<18)host.setTimeout(retry,200)}
host.setTimeout(retry,150);
})(typeof window!=='undefined'?window:null);
