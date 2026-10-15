/* Scout PRO V189 — navegação premium responsiva, build auditável e morfologia com procedência.
   O Android e o Windows usam exatamente os mesmos arquivos web. */
(function(root){
'use strict';
const doc=root?.document;
const TITLE='Scout PRO';
function normal(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()}
function matchingExternal(card,source){return !!source&&Number(source.numero)===Number(card.capture)&&String(source.card_id)===String(card.id)&&/^\d{8,}$/.test(String(card.id))}
function physicalInfo(card,base,visual){
 const verified=(base?.cartas||[]).find(x=>matchingExternal(card,x));
 const screens=(visual?.visual_observations||[]).filter(x=>Number(x.candidate_cap)===Number(card.capture));
 const screenshot=screens.length===1?screens[0]:null;
 return {verified:verified||null,observed:screenshot,ambiguous:screens.length>1,playerID:false};
}
if(typeof module==='object'&&module.exports)module.exports={normal,matchingExternal,physicalInfo};
if(!doc)return;
function render(){
 if(doc.body.dataset.scoutV189==='1')return;doc.body.dataset.scoutV189='1';
 const inDetail=doc.body.dataset.page==='detail';
 const inCatalog=doc.body.dataset.page==='catalog';
 const prefix=inDetail?'../':'';
 const desktop=!!root.scoutDesktop;
 const android=!!(root.Capacitor?.isNativePlatform?.()&&root.Capacitor?.getPlatform?.()==='android');
 const platform=android?'Android':desktop?'Windows':'Web';
 function el(tag,cls,text){const e=doc.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
 function getJson(path){return fetch(prefix+path).then(r=>{if(!r.ok)throw Error('Dados indisponíveis');return r.json()})}
 function showVersion(){
  const target=doc.querySelector('.brand-copy small');
  if(target){target.textContent='POSSE DE BOLA · ELITE';}
  const bar=doc.getElementById('scout-app-bar');if(!bar)return;
  const status=el('span','scout-v189-version');
  status.id='scout-v189-version';
  status.textContent='Versão '+String(root.SCOUT_VERSION||'instalada')+' · '+platform;
  status.title='Código comum em Android e Windows; atualizações precisam ser instaladas em cada dispositivo.';
  const first=bar.querySelector('div:first-child');
  if(first)first.appendChild(status);
  getJson('scout-build-info.json').then(info=>{
   status.textContent='v'+info.version+' · '+platform+' · '+String(info.git_revision||'?').slice(0,7);
   status.title='Revisão '+String(info.git_revision)+' | Interface '+info.bundle_fingerprint+' | Android e Windows devem indicar a mesma revisão na mesma release.';
   const chip=doc.querySelector('.scout-v189-build');
   if(chip)chip.textContent=status.textContent;
   if(desktop&&typeof root.scoutDesktop.version==='function'){
    root.scoutDesktop.version().then(actual=>{
     if(String(actual)!==String(info.version)){status.title+=' | AVISO: pacote Windows '+actual+' não corresponde à interface '+info.version;status.dataset.mismatch='true'}
    }).catch(()=>{});
   }
  }).catch(()=>{});
 }
 function catalog(){
  const hero=doc.querySelector('.hero .hero-text');if(!hero)return;
  const old=hero.querySelector('.hero-actions');
  if(!old)return;
  const panel=el('div','scout-v189-home');
  const indicator=el('div','scout-v189-eyebrow','246 CARTAS · POSSE CENTRAL · ANÁLISE INDIVIDUAL');
  const caption=el('p','scout-v189-intro','Seu elenco, seu estilo de jogo. Encontre cartas, confira a ficha ideal e monte o time.');
  const actions=el('nav','scout-v189-quick');
  actions.setAttribute('aria-label','Acesso rápido Scout PRO');
  const createLink=(href,title,description,icon)=>{
   const a=el('a','scout-v189-tile');
   a.href=href;
   const mark=el('span','scout-v189-mark',icon),body=el('span','scout-v189-tile-content');
   body.append(el('strong','',title),el('small','',description));a.append(mark,body);return a
  };
  actions.append(
   createLink('#catalogo','Meu elenco','246 cartas e filtros','◈'),
   createLink('meu-time-duas-formacoes-v177.html','Minhas formações','Posse de Bola · 2 planos','▦'),
   createLink('revisao-impetos-v103.html','Ímpetos e habilidades','Melhor escolha por função','✧'),
   createLink('player-model-v101.html','Biotipo','Medidas e fontes verificadas','◎')
  );
  const details=el('details','scout-v189-extra');
  const summary=el('summary','','Mais ferramentas e análises');
  const links=el('div','scout-v189-extra-links');
  const originals=[...old.querySelectorAll('a')];
  const skip=new Set(['#catalogo','meu-time-duas-formacoes-v177.html','revisao-impetos-v103.html','player-model-v101.html']);
  for(const a of originals){
   if(skip.has(a.getAttribute('href')))continue;
   const copy=el('a','',a.textContent.replace(/\s*↗\s*/g,'').trim());
   copy.href=a.getAttribute('href');links.appendChild(copy)
  }
  details.append(summary,links);
  const about=el('button','scout-v189-about','Como funciona a análise');
  about.type='button';about.setAttribute('aria-expanded','false');
  about.addEventListener('click',()=>{
   const opened=doc.body.classList.toggle('scout-v189-method-open');
   about.setAttribute('aria-expanded',String(opened));
   about.textContent=opened?'Ocultar metodologia':'Como funciona a análise';
  });
  panel.append(indicator,caption,actions,details,about);
  hero.appendChild(panel);
  const brand=doc.querySelector('.topbar .nav-cta');
  if(brand)brand.textContent='Meu elenco';
 }
 function details(){
  const script=doc.getElementById('scout-v68-data');
  const section=doc.getElementById('scout-v188-principal');
  if(!script||!section)return;
  let c;try{c=JSON.parse(script.textContent)}catch(e){return}
  const before=section.querySelector('.scout-v188-body');
  if(!before)return;
  let area=doc.getElementById('scout-v189-biotype');
  if(area)return;
  area=el('div','scout-v189-biotipo');area.id='scout-v189-biotype';
  const h=el('h4','','Modelo corporal · dados com fonte');
  const body=el('div','scout-v189-measures','Carregando registros disponíveis…');
  const legend=el('p','scout-v189-legend','Medidas físicas não confirmam um Player ID oculto ou movimentos exclusivos.');
  area.append(h,body,legend);before.appendChild(area);
  Promise.all([getJson('SCOUT_V101_MODELO_CORPORAL.json'),getJson('SCOUT_V184_EFHUB_241_COMPLETE.json'),getJson('SCOUT_V189_CORPO_EXTRAS.json')])
  .then(([base,archive,extra])=>{
    const data=physicalInfo(c,base,archive);
    body.replaceChildren();
    const renderGroup=(title,items,source)=>{
      const panel=el('section','scout-v189-measure-group');
      panel.appendChild(el('strong','',title));
      const list=el('div','scout-v189-measure-grid');
      for(const [key,value] of items){
       if(value===null||value===undefined||value==='')continue;
       const cell=el('div','scout-v189-measure-item');
       cell.append(el('small','',key),el('b','',String(value)));
       list.appendChild(cell);
      }
      panel.append(list,el('p','',source));body.appendChild(panel)
    };
    if(data.verified){
     const e=data.verified,m=e.modelo_corporal||{};
     renderGroup('Medidas associadas ao Card ID',[
      ['Altura',e.altura_cm+' cm'],['Peso',e.peso_kg+' kg'],['Pé principal',e.pe_dominante],
      ['Perna',m.comprimento_perna],['Alcance da perna',m.alcance_perna_cm==null?null:m.alcance_perna_cm+' cm'],
      ['Colisão tronco',m.colisao_tronco_cm==null?null:m.colisao_tronco_cm+' cm'],
      ['Uso pé fraco',e.uso_perna_ruim],['Precisão pé fraco',e.precisao_perna_ruim]
     ],'Fonte externa vinculada ao ID: '+(e.fonte||'PESDB')+' · comprovação de animação: não.');
    }
    if(data.observed){
     const o=data.observed,m=o.model_measures||{};
     renderGroup('Dados observados no print eFHUB',[
      ['Altura',o.height_cm==null?null:o.height_cm+' cm'],['Peso',o.weight_kg==null?null:o.weight_kg+' kg'],
      ['Uso pé fraco',o.weak_foot_usage],['Precisão pé fraco',o.weak_foot_accuracy],
      ['Forma',o.form],['Lesões',o.injury_resistance],
      ['Raio da perna',m.leg_coverage_radius==null?null:m.leg_coverage_radius+' cm'],
      ['Raio do braço',m.arm_coverage_radius==null?null:m.arm_coverage_radius+' cm'],
      ['Salto',m.jump_height==null?null:m.jump_height+' cm'],
      ['Colisão tronco',m.trunk_collision==null?null:m.trunk_collision+' cm']
     ],'Fonte: '+o.filename+' · a edição não é confirmada apenas pelo nome.');
    }
    const extended=(extra.entries||[]).find(x=>Number(x.cap)===Number(c.capture));
    if(extended){
      const dims=extended.dimensions||{},derived=extended.derived_measurements||{};
      renderGroup('Anatomia detalhada observada no eFHUB',[
       ['Comprimento do braço',dims.arm_length],['Largura dos ombros',dims.shoulder_width],
       ['Comprimento do pescoço',dims.neck_length],['Tórax (Chest)',dims.chest],
       ['Tamanho do pescoço',dims.neck_size],['Altura do ombro',dims.shoulder_height],
       ['Comprimento da perna',dims.leg_length],['Tamanho da coxa',dims.thigh_size],
       ['Tamanho da cintura',dims.waist_size],['Tamanho do braço',dims.arm_size],
       ['Tamanho da panturrilha',dims.calf_size],
       ['Raio perna',derived.leg_coverage_cm==null?null:derived.leg_coverage_cm+' cm'],
       ['Raio braço',derived.arm_coverage_cm==null?null:derived.arm_coverage_cm+' cm'],
       ['Altura do salto',derived.jump_height_cm==null?null:derived.jump_height_cm+' cm'],
       ['Colisão do tronco',derived.torso_collision_cm==null?null:derived.torso_collision_cm+' cm'],
       ['Base em pé',derived.standing_base_cm==null?null:derived.standing_base_cm+' cm']
      ],'Fonte: '+extended.screenshot+' · valores da tela eFHUB, não Player ID oculto; edição a conferir.');
    }
    if(!data.verified&&!data.observed&&!extended){body.appendChild(el('p','scout-v189-notrans','Ainda não há medidas completas verificadas nesta edição. A captura permanece arquivada; não vamos inventar pescoço, ombros ou antebraço.'));}
    if(data.ambiguous)body.appendChild(el('p','scout-v189-notrans','Existem vários prints do jogador: nenhuma geometria ambígua foi atribuída automaticamente.'));
    body.appendChild(el('p','scout-v189-notrans','Pescoço, largura de ombros, braço e antebraço só serão detalhados quando esses campos forem transcritos e identificados para esta edição.'));
  }).catch(()=>{body.textContent='Registros locais indisponíveis. A ficha original não foi alterada.'});
  const outdated=before.querySelector('#v188-model');
  if(outdated)outdated.hidden=true;
  const h3=before.querySelector('h3');
  if(h3)h3.textContent='Biotipo do jogador';
  const spoiler=doc.querySelector('#scout-v184-evidence');
  if(spoiler)spoiler.classList.add('scout-v189-evidence');
 }
 function cleanDock(){
  const bar=doc.getElementById('scout-app-bar');
  if(!bar)return;
  const top=bar.querySelector('#scout-top'),backup=bar.querySelector('#scout-backup');
  if(!top||!backup)return;
  const overflow=el('details','scout-v189-dock-more');
  const summary=el('summary','','Mais');
  const body=el('div','scout-v189-dock-options');
  bar.appendChild(overflow);overflow.append(summary,body);
  body.append(top,backup);
  body.appendChild(el('span','scout-v189-build','Versão '+String(root.SCOUT_VERSION||'local')+' · '+(root.scoutDesktop?'Windows':root.Capacitor?.isNativePlatform?.()?'Android':'Web')));
  summary.setAttribute('aria-label','Mais opções de navegação e backup');
  const label=doc.getElementById('scout-update-label');
  if(label)label.title='Verifique a versão instalada no Android e no Windows. Dados pessoais editados localmente não são sincronizados automaticamente.';
  doc.addEventListener('click',event=>{
   if(overflow.open&&!overflow.contains(event.target))overflow.open=false;
  });
 }
 if(inCatalog)catalog();
 // V190: a ficha V188 é carregada dinamicamente. Na primeira passagem ela pode
 // ainda não existir; ouvir o evento evita perder o painel de biotipo no Android.
 if(inDetail){
  doc.addEventListener('scoutpro:profile-ready',details);
  details();
 }
 cleanDock();
 showVersion();
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',render,{once:true});
else render();
})(typeof window!=='undefined'?window:null);
