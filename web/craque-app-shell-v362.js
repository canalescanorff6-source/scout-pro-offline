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
 'rarity-audit':'Raridades','batch-8':'Cadastro de cartas','batch-9':'Cadastro de cartas'
};
const at=()=>d.body?.dataset.page||'';
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
 const oldHead=d.querySelector('.topbar,.friends-head,.hub-header,main .head,body>header');
 const proof=create('span','ct362-proof','NOVO DESIGN · V362');
 proof.id='ct362-design-proof';
 proof.setAttribute('aria-label','Novo design Craque Tático V362 ativo');
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
 if(previous)previous.textContent='CENTRAL · V362';
 if(d.body.dataset.ct362Catalog==='true')return;
 const hero=d.querySelector('.hero .hero-text');
 const heading=hero?.querySelector('h1');
 const tiles=hero?.querySelector('.scout-v189-quick');
 if(!heading||!tiles)return;
 heading.innerHTML='<span>O SEU FUTEBOL.</span><em>SEM COMPLICAÇÃO.</em>';
 const indicator=hero.querySelector('.scout-v189-eyebrow');
 if(indicator)indicator.textContent='FICHAS · TREINOS · ESCALAÇÕES · ANÁLISE REAL';
 tiles.querySelectorAll('.scout-v189-tile .scout-v189-mark').forEach((mark,i)=>{mark.textContent=String(i+1).padStart(2,'0')});
 const section=d.querySelector('#catalogo .section-title');
 if(section)section.textContent='Biblioteca de jogadores';
 const existing=d.getElementById('ct361-home-mark');if(existing)existing.textContent='CENTRAL · V362';
 d.body.dataset.ct362Catalog='true';
}
function detail(){
 if(at()!=='detail'||d.body.dataset.ct362Detail==='true')return;
 const glance=d.getElementById('ct361-player-glance');
 const shell=d.getElementById('scout-v220-hero');
 if(!glance||!shell)return;
 glance.querySelector('.ct361-glance-kicker')?.replaceChildren(d.createTextNode('MINHA CARTA · DADOS REAIS'));
 const proof=glance.querySelector('.ct361-release-proof');
 if(proof)proof.textContent='V362';
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
 if(previous)previous.textContent='ACERVOS INDEPENDENTES · V362';
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
 const existing=d.getElementById('ct361-friends-mark');if(existing)existing.textContent='ACERVOS INDEPENDENTES · V362';
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
function boot(){shell();catalog();detail();friends();generic();externalFormacoes();}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
d.addEventListener('scoutpro:profile-ready',boot);
d.addEventListener('scoutpro:ui-ready',boot);
// V361 e ficha V220 são assíncronas; reexaminar sem alterar estado dos inputs.
let retries=0;function retry(){boot();if(++retries<18)host.setTimeout(retry,200)}
host.setTimeout(retry,150);
})(typeof window!=='undefined'?window:null);
