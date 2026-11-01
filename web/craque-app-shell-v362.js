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
 'video-evidence':'Vídeos e evidências','player-model':'Modelo corporal',
 'rarity-audit':'Raridades',review379:'Conferir cartas',
 'batch-8':'Cadastro de cartas','batch-9':'Cadastro de cartas'
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
function shell(){
 const page=at();
 if(!page||d.getElementById('ct362-design-proof'))return;
 d.body.classList.add('ct362-design');
 d.body.dataset.ct362Ui='true';
 // Android, PWA e Electron não devem exibir barra do sistema azul da UI antiga.
 const themeMeta=d.querySelector('meta[name="theme-color"]');
 if(themeMeta)themeMeta.setAttribute('content','#28282c');
 const oldHead=d.querySelector('.topbar,.friends-head,.hub-header,main .head,body>header');
 // Os 246 HTMLs históricos carregam rótulos de versão V72, não a versão
 // executada. Não exibir um número antigo como se fosse o aplicativo atual.
 if(page==='detail'){
  const edition=d.querySelector('.topbar .edition');
  if(edition&&/\bV\d+\b/i.test(edition.textContent||'')){
   edition.textContent='eFOOTBALL 2027 · CRAQUE TÁTICO';
  }
 }
 const proof=create('span','ct362-proof','EDITORIAL');
 proof.id='ct362-design-proof';
 proof.dataset.craqueUiRelease=String(ACTIVE_RELEASE);
 proof.setAttribute('aria-label','Craque Tático, visual editorial');
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
   ['Conferir cartas','conferir-cartas.html'],
   ['Habilidades e ímpetos','revisao-impetos-v103.html'],
   ['Análise tática','revisao-tatica-v98.html'],
   ['Laboratório','meu-time-testes-v219.html'],
   ['Vídeos e evidências','pesquisa-videos-v106.html'],
   ['Modelo corporal','player-model-v101.html'],
   ['Raridades','raridade-cadastro-v91.html']]){
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
/* V380: uma abertura única para as ferramentas históricas.
 * A estrutura antiga continua operante, mas NÃO é mais a tela de entrada.
 * Não clona formulários, não move listeners e não altera estado das cartas.
 */
const workspaces={
 team:['Minha escalação','Organize titulares, reservas e técnico em um só espaço.'],
 'rotation-lab':['Laboratório','Teste alternativas táticas e preserve as configurações aprovadas.'],
 'manager-hub':['Central de técnicos','Encontre o técnico adequado para suas fichas e formações.'],
 'progress-audit':['Níveis e PP','Revise o nível real e o progresso de cada carta.'],
 boosters:['Habilidades e ímpetos','Consulte evidências e recomendações sem equipar automaticamente.'],
 'tactical-review':['Análise tática','Compare suas cartas e os estilos disponíveis.'],
 'video-evidence':['Vídeos e evidências','Consulte os registros de gameplay e suas fontes.'],
 'player-model':['Modelo corporal','Confira medidas e dados documentados das cartas.'],
 'rarity-audit':['Revisão de raridades','Corrija os rótulos mediante conferência visual.'],
 review379:['Conferir cartas','Revise imagens, edições e dados registrados.'],
 'batch-8':['Conferência de cartas','Revise cada cadastro sem alterar suas fichas originais.'],
 'batch-9':['Cadastro de cartas','Registre edições e informações verificadas.']
};
function generic(){
 const page=at();
 if(['catalog','detail','friends'].includes(page)||d.getElementById('ct362-workspace-head'))return;
 const main=d.querySelector('main');
 const info=workspaces[page];if(!main||!info)return;
 const original=main.querySelector('h1');
 const header=create('section','ct362-workspace-head');header.id='ct362-workspace-head';
 header.setAttribute('aria-label','Área atual do Craque Tático');
 const identity=create('div','ct362-workspace-copy');
 identity.append(create('span','ct362-workspace-eyebrow','CRAQUE TÁTICO  /  MINHAS FERRAMENTAS'),
  create('h1','ct362-workspace-title',info[0]),
  create('p','ct362-workspace-description',info[1]));
 const link=create('a','ct362-workspace-home','Minhas cartas');
 link.href='index.html';
 header.append(identity,link);
 main.insertBefore(header,main.firstChild);
 // A antiga manchete repetida perde apenas sua função visual; seus botões,
 // contadores, filtros e event listeners ficam nos mesmos nós do DOM.
 if(original&&original!==header.querySelector('h1')){
  original.classList.add('ct362-redundant-heading');
  original.setAttribute('data-ct362-replaced','true');
 }
 d.body.dataset.ct362Workspace='ready';
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
