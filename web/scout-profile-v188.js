/* Scout PRO V188 — ficha primaria uniforme validada pelo video real (Massaro #001).
   Dois valores eFHUB sao observados, nao comprovacao de equipamento nem slot na conta. */
(function(host){
'use strict';
const NO_SLOT_PREFIX='scoutpro:v188:nao-alteravel:';
const SOURCE_PREFIX='scoutpro:v188:print-selecionado:';
const OLD_DETAILS_KEY='scoutpro:v187:full-analysis';
const PT=Object.freeze({"Striker's Instinct":"Instinto artilheiro","Off the Ball":"Off the Ball","Agility":"Agilidade","Technique":"Técnica","Shooting":"Chute","Passing":"Passe","Ball-carrying":"Condução de bola","Ball Protection":"Proteção de Posse","Offence Creator":"Criador ofensivo","Physicality":"Fisicalidade","Aerial":"Disputa aérea","Rebuilding":"Reconstrução","Defending":"Defesa","Duelling":"Duelo","Stealing":"Roubo de bola","Accuracy":"Precisão","Crossing":"Cruzamento","Strength":"Força","Breakthrough":"Rompe-barreira","Goalkeeping":"Goleiro"});
const LABELS=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const shown=(n)=>PT[n]||n;
function sourceCandidates(cap,rows){const matched=(rows||[]).filter(x=>Array.isArray(x.candidate_caps)&&x.candidate_caps.includes(Number(cap)));return [...new Map(matched.map(x=>[x.sha256||x.filename,x])).values()] }
function boosterView(d,engine,rec,slotLocked,verified){const r=rec?.booster?rec.booster(d,'posse',engine,slotLocked?'ausente':verified?.status,verified?.equipped):null;return {recommend:r?.primary||null,alternatives:r?.alternatives||[],confidence:r?.confidence||'sem_evidencia',spread:r?.spread??null,canEquip:r?.able===true&&!slotLocked,slotLocked:!!slotLocked,status:r?.equipStatus||'indisponivel'};}
function progression(d){return LABELS.map((label,i)=>({label,level:Number(d.recommended_levels?.[i]||0)}));}
/* V194 — move as orientações já cadastradas na ficha; não gera fatos nem duplica texto. */
function moveGuideContent(doc,panel,holder){
 const done={focus:false,gameplay:false};
 if(!doc||!panel||!holder)return done;
 const tasks=[
  {source:'#foco .focus-banner',target:'.scout-v188-progress',title:'Foco da build',name:'focus',id:'scout-v194-focus',old:'#foco'},
  {source:'#jogar .gameplay-tip',target:'.scout-v188-more',title:'Como jogar com esta carta',name:'gameplay',id:'scout-v194-gameplay',old:'#jogar'}
 ];
 for(const task of tasks){
  const source=holder.querySelector(task.source),target=panel.querySelector(task.target);
  if(!source||!target||!String(source.textContent||'').trim()||panel.querySelector('#'+task.id))continue;
  const section=doc.createElement('section');section.id=task.id;section.className='scout-v194-guide scout-v194-'+task.name;
  const title=doc.createElement('h3');title.textContent=task.title;
  section.appendChild(title);
  section.appendChild(source); // Reposiciona o nó original, preservando seu texto e identidade.
  if(task.name==='gameplay'){
   const note=doc.createElement('p');note.className='scout-v194-guide-source';
   note.textContent='Orientação já registrada nesta ficha. Teste em partidas antes de considerar comprovado.';
   section.appendChild(note);
  }
  target.insertAdjacentElement('beforebegin',section);
  const navigation=holder.querySelector('.side-nav a[href="'+task.old+'"]');
  if(navigation)navigation.setAttribute('href','#'+task.id);
  done[task.name]=true;
 }
 return done;
}
if(typeof module!=='undefined'&&module.exports)module.exports={PT,norm,shown,sourceCandidates,boosterView,progression,moveGuideContent};
const document=host?.document;if(!document||document.body?.dataset.page!=='detail')return;
function run(){
 const holder=document.querySelector('.profile-content');
 const script=document.getElementById('scout-v68-data');
 if(!holder||!script||document.getElementById('scout-v188-principal'))return;
 let d;try{d=JSON.parse(script.textContent)}catch(e){return}
 const cap=Number(d.capture),key=String(cap)+':'+String(d.id||'unknown');
 let locked=false,chosen='';try{locked=host.localStorage.getItem(NO_SLOT_PREFIX+key)==='1';chosen=host.localStorage.getItem(SOURCE_PREFIX+key)||''}catch(e){}
 const panel=document.createElement('section');panel.id='scout-v188-principal';panel.className='scout-v188-principal';panel.setAttribute('aria-label','Ficha principal de Posse de Bola');
 panel.innerHTML=
 '<div class="scout-v188-head"><div><span class="scout-v188-kicker">SCOUT PRO · SUA CARTA</span><h2>Ficha principal · Posse de Bola</h2></div><span class="scout-v188-pp"></span></div>'+
 '<p class="scout-v188-intro">Foco e treino da carta, ímpetos documentados e habilidades adicionais. Biotipo e orientações de uso vêm em seguida; relatórios completos são opcionais.</p>'+
 '<div class="scout-v188-progress"><h3>Treino registrado no Scout PRO</h3><div id="v188-train" class="scout-v188-train"></div></div>'+
 '<div class="scout-v188-boost"><h3>Ímpetos mostrados na sua captura</h3><p class="scout-v188-evidence">Dados vistos no eFHUB, não confirmação de qual ímpeto está equipado na conta.</p><div id="v188-choice" class="scout-v188-choice" hidden></div><div class="scout-v188-tiles"><div><small>ÍMPETO 1 · PRINT</small><strong id="v188-b1">Consultando print…</strong></div><div><small>ÍMPETO 2 · PRINT</small><strong id="v188-b2">Consultando print…</strong></div></div><p id="v188-source" class="scout-v188-source"></p>'+
 '<div class="scout-v188-best"><small>MELHOR COMPLEMENTO SUGERIDO · POSSE</small><strong id="v188-top-rec">Calculando…</strong><p id="v188-reason">A função, o estilo e o treino registrado entram na avaliação.</p><p id="v200-alternatives" class="v200-alternatives"></p><p id="v200-caution" class="v200-caution"></p><a id="v200-review" class="v200-review-link" href="../revisao-impetos-v103.html">Conferir ímpetos da carta ↗</a></div>'+
 '<label class="scout-v188-lock"><input id="v188-slot-locked" type="checkbox"> Nesta carta não dá para alterar o segundo ímpeto</label><p id="v188-allowed" class="scout-v188-allowed"></p></div>'+
 '<div class="scout-v188-body"><h3>Modelo corporal e pé fraco</h3><p id="v188-model">Consultando as medidas transcritas da captura…</p></div>'+
 '<a class="scout-v188-skills-link" href="#scout-v162">Ver as cinco habilidades adicionais recomendadas ↓</a>'+
 '<button type="button" class="scout-v188-more" aria-expanded="false">Mostrar análises avançadas (opcional)</button>';
 const header=holder.querySelector('.detail-header')||holder.querySelector('.mobile-profile');
 if(header)header.insertAdjacentElement('afterend',panel);else holder.prepend(panel);
 moveGuideContent(document,panel,holder);
 const q=id=>panel.querySelector('#'+id);
 panel.querySelector('.scout-v188-pp').textContent=Number(d.pp)+' PP · '+String(d.shown_position||d.role_used||'Carta');
 const train=q('v188-train');
 for(const {label,level} of progression(d).filter(x=>x.level>0)){const el=document.createElement('div');el.className='scout-v188-train-chip';el.textContent=label+' '+level;train.appendChild(el)}
 if(!train.children.length){train.textContent='Distribuição não cadastrada nesta edição; PP original preservado.'}
 const lockedBox=q('v188-slot-locked');lockedBox.checked=locked;
 const b1=q('v188-b1'),b2=q('v188-b2'),src=q('v188-source'),reason=q('v188-reason'),recLabel=q('v188-top-rec'),allowed=q('v188-allowed');
 q('v200-review').href='../revisao-impetos-v103.html?c='+Number(d.capture);
 let selectedPhoto=null;
 function redrawRank(){
  let verified={};
  try{
   const record=JSON.parse(host.localStorage.getItem('scoutpro:v103:booster:'+Number(d.capture))||'null');
   if(record&&String(record.card_id)===String(d.id))verified=record;
  }catch(e){}
  const r=boosterView(d,host.SCOUT_BOOSTERS_V103,host.SCOUT_RECOMMENDATIONS_V162,locked,verified);
  if(!r.recommend){recLabel.textContent='Cálculo indisponível nesta versão';reason.textContent='Os dados originais da carta estão preservados.';return}
  const name=shown(r.recommend.nome)+' +1';
  recLabel.textContent=name;
  reason.textContent='Complementaridade na Posse: '+r.recommend.motivo;
  q('v200-alternatives').textContent=r.alternatives.length?'Outras opções para comparar: '+r.alternatives.map(x=>shown(x.nome)).join(' / ')+'.':'';
  q('v200-caution').textContent=r.spread!==null&&r.spread<2?'Alternativas muito próximas: conferir antes de gastar pedras.':r.confidence==='baixa'?'Treino ou atributos insuficientes: recomendação provisória, não gastar pedras sem conferir.':'A distribuição de PP não comprova os atributos finais. Verifique o slot e o efeito antes de gastar pedras.';
  const second=selectedPhoto?.booster_2_print;
  if(second&&norm(second)===norm(name)){reason.textContent+=' O print eFHUB mostra esta mesma escolha no segundo campo.'}
  allowed.textContent=locked?'Você marcou esta carta como não alterável: a sugestão é apenas uma comparação.':
  'Esta recomendação NÃO significa slot confirmado ou aplicação automática. Se o ímpeto for fixo ou a carta não aceitar troca, mantenha o original.';
 }
 lockedBox.addEventListener('change',()=>{locked=lockedBox.checked;try{host.localStorage.setItem(NO_SLOT_PREFIX+key,locked?'1':'0')}catch(e){}redrawRank()});
 document.addEventListener('scoutpro:recommendations-ready',redrawRank);
 if(host.SCOUT_RECOMMENDATIONS_V162&&host.SCOUT_BOOSTERS_V103)redrawRank();
 function showImage(row){
  selectedPhoto=row||null;
  b1.textContent=row?.booster_1_print||'Print da edição não vinculado';
  b2.textContent=row?.booster_2_print||'Print da edição não vinculado';
  src.textContent=row?'Fonte: '+row.filename+' · transcrição do eFHUB · Card ID não visível nesta captura.':'Nenhuma captura desta edição vinculada com segurança. Não inventamos o ímpeto mostrado.';
  redrawRank();
 }
 function selectPhoto(rows){
  const control=q('v188-choice');control.replaceChildren();
  if(rows.length===1){showImage(rows[0]);control.hidden=true;return}
  if(!rows.length){showImage(null);control.hidden=true;return}
  control.hidden=false;
  const t=document.createElement('label');t.textContent='Há '+rows.length+' versões deste jogador. Selecione o print da sua carta:';
  const select=document.createElement('select');select.setAttribute('aria-label','Versão da captura eFHUB');
  const empty=document.createElement('option');empty.value='';empty.textContent='Escolher versão para comparar';select.appendChild(empty);
  rows.forEach((row,i)=>{const opt=document.createElement('option');opt.value=String(i);opt.textContent=row.filename;select.appendChild(opt)});
  select.addEventListener('change',()=>{const row=select.value!==''?rows[Number(select.value)]:null;showImage(row);try{host.localStorage.setItem(SOURCE_PREFIX+key,row?.filename||'')}catch(e){}});
  t.appendChild(select);control.appendChild(t);
  const found=rows.findIndex(x=>x.filename===chosen);if(found!==-1){select.value=String(found);showImage(rows[found])}else showImage(null);
 }
 function details(visible){
  document.body.classList.toggle('scout-v188-compact',!visible);
  const button=panel.querySelector('.scout-v188-more');
  button.setAttribute('aria-expanded',String(visible));
  button.textContent=visible?'Ocultar análises avançadas':'Mostrar análises avançadas (opcional)';
  try{host.localStorage.setItem(OLD_DETAILS_KEY,visible?'1':'0')}catch(e){}
 }
 const more=panel.querySelector('.scout-v188-more');
 let expanded=false;try{expanded=host.localStorage.getItem(OLD_DETAILS_KEY)==='1'}catch(e){}
 more.addEventListener('click',()=>details(more.getAttribute('aria-expanded')!=='true'));
 details(expanded);
 // V190: não deixar uma base física indisponível bloquear os DOIS ímpetos.
 fetch('../SCOUT_V188_EFHUB_BOOSTERS_241.json')
  .then(r=>{if(!r.ok)throw Error('boosters unavailable');return r.json()})
  .then(boosts=>{selectPhoto(sourceCandidates(cap,boosts.observations))})
  .catch(()=>{showImage(null);src.textContent='Base de prints indisponível nesta instalação; consulte a versão do aplicativo.'});
 fetch('../SCOUT_V184_EFHUB_241_COMPLETE.json')
  .then(r=>{if(!r.ok)throw Error('physical unavailable');return r.json()})
  .then(archive=>{
    const rows=(archive.visual_observations||[]).filter(x=>Number(x.candidate_cap)===cap);
    const model=q('v188-model');
    if(rows.length===1){
     const m=rows[0],body=m.model_measures||{};
     model.textContent='Altura '+(m.height_cm??'?')+' cm · peso '+(m.weight_kg??'?')+' kg · pé fraco: uso '+(m.weak_foot_usage||'?')+', precisão '+(m.weak_foot_accuracy||'?')+' · forma '+(m.form||'?')+' · lesão '+(m.injury_resistance||'?')+' · alcance de pernas '+(body.leg_coverage_radius??'?')+' cm · braços '+(body.arm_coverage_radius??'?')+' cm · colisão do tronco '+(body.trunk_collision??'?')+' cm. Valores observados, não Player ID oculto.';
    }else model.textContent='As medidas desta edição ainda não foram transcritas com vínculo confiável. Os prints permanecem disponíveis; nenhuma medida foi inventada.';
  }).catch(()=>{q('v188-model').textContent='Medidas físicas não disponíveis nesta instalação. O treinamento e os ímpetos permanecem independentes.'});
 // Informa a qualquer módulo complementar que os elementos desta ficha existem.
 document.dispatchEvent(new CustomEvent('scoutpro:profile-ready',{detail:{capture:cap}}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})(typeof window!=='undefined'?window:null);
