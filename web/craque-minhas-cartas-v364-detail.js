/* V364 · Minhas Cartas (novas edições). MESMOS motores V251/V233/V220/V162/V103,
 * sem salvar builds homologadas nem atribuir Card IDs ou atributos-base falsos.
 */
(function(win){'use strict';
 const d=win.document,root=d.getElementById('ct364-app');if(!root)return;
 const $=id=>d.getElementById(id);
 const mk=(tag,klass,content)=>{const e=d.createElement(tag);if(klass)e.className=klass;if(content!==undefined)e.textContent=String(content);return e};
 const PP=win.CRAQUE_PP_UNIVERSAL_V309,engine=win.CRAQUE_FRIEND_TRAINING_V228;
 const PROOF_KEY='scoutpro:v364:main-level:';
 let all=[],current=null,tactic='posse',tab='treino',position='';
 const roles=new Set(['CA','SA','MAT','MLG','VOL','ZC','LE','LD','GO']);
 const levelOf=c=>{
  let review=null;
  try{const raw=JSON.parse(win.localStorage.getItem(PROOF_KEY+c.numero)||'null');
   if(raw?.confirmed_in_game===true&&raw.numero===c.numero&&raw.name===c.name&&
    Number.isInteger(raw.level)&&raw.level>=1&&raw.level<=120&&
    raw.pp===PP.budget(raw.level))review=raw;
  }catch(_e){}
  return {level:review?review.level:c.levelShownEFHub,proof:review};
 };
 const tags=(values)=>{
  const wrap=mk('div','ct364-tags');for(const item of values||[])wrap.append(mk('span','',String(item)));
  return wrap;
 };
 const sentence=v=>{
  if(typeof v==='string')return v;
  if(v&&typeof v==='object')return String(v.name||v.label||v.title||v.value||v.primary||v.id||'Candidato pendente');
  return String(v||'Indisponível');
 };
 function tile(c){
  const a=mk('a','ct364-tile');a.href='minhas-cartas-v364.html?c='+c.numero;
  a.dataset.name=[c.name,c.position,c.attackStyle,c.numero].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const img=mk('img');img.src=c.image;img.alt='Carta original '+c.name;img.loading='lazy';
  const body=mk('div');
  body.append(mk('strong','',c.numero+' · '+c.name));
  body.append(mk('small','',c.position+' · '+c.attackStyle));
  const rev=levelOf(c);body.append(mk('b','',rev.level+' níveis · '+PP.budget(rev.level)+' PP'+(rev.proof?' confirmados':'* condicionais')));
  a.append(img,body);return a;
 }
 function drawList(query=''){
  const key=String(query).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const matches=all.filter(c=>[c.name,c.position,c.attackStyle,c.numero].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(key));
  const target=$('ct364-roster');target.replaceChildren(...matches.map(tile));
  $('ct364-count').textContent=matches.length+' de 15 cartas';
  if(matches.length===0)target.append(mk('p','','Nenhuma carta encontrada neste filtro.'));
 }
 function drawProof(){
  if(!current)return;
  const info=levelOf(current),pp=PP.budget(info.level);
  $('ct364-number').textContent='MINHAS CARTAS · #'+current.numero+' · EDIÇÃO ADICIONAL';
  $('ct364-name').textContent=current.name;
  $('ct364-style').textContent=current.position+' · '+current.attackStyle+' · '+current.secondaryStyle;
  $('ct364-photo').src=current.image;$('ct364-photo').alt='Carta original enviada de '+current.name;
  $('ct364-level').textContent=info.level;
  $('ct364-pp').textContent=pp+' PP'+(info.proof?'':'*');
  $('ct364-proof').textContent=info.proof?'Nível e PP confirmados por você neste aparelho':'Nível do eFHub · máxima a conferir';
  $('ct364-identity').textContent='Card ID pendente';
  $('ct364-confirm-level').value=info.level;
  $('ct364-confirmed').checked=false;
 }
 function showWarnings(out,items){
  if(!items?.length)return;
  const block=mk('details','');block.append(mk('summary','','Conferências necessárias ('+items.length+')'));
  const ul=mk('ul','ct364-warning-list');for(const x of items.slice(0,15))ul.append(mk('li','',sentence(x)));
  block.append(ul);out.append(block);
 }
 function dataForEngine(){
  const progress=levelOf(current);
  return {
   name:current.name,edition:current.edition,cardId:'',
   position,style:current.attackStyle,level:progress.level,pp:null,
   // A tela do eFHub mostra o conjunto de habilidades, mas NÃO distingue
   // habilidade nativa de adicional equipada. Nunca falsear nativeKnown.
   nativeSkills:'',skills:'',booster:'',fixedBooster:'',
   boosterSlot:'pendente',trainingLevels:''
  };
 }
 function renderPlan(){
  const dest=$('ct364-plan');dest.replaceChildren();
  if(!current)return;
  for(const btn of d.querySelectorAll('#ct364-app button[data-mode]'))
   btn.setAttribute('aria-pressed',String(btn.dataset.mode===tactic));
  for(const btn of d.querySelectorAll('#ct364-app button[data-tab]'))
   btn.setAttribute('aria-pressed',String(btn.dataset.tab===tab));
  if(!engine||!PP){dest.append(mk('p','','Engenharia V251/V233 não carregada. Não há treinamento substituto.'));return}
  let x;try{x=engine.evaluate(dataForEngine(),tactic)}
  catch(e){dest.append(mk('p','','Não foi possível analisar esta edição: '+String(e.message||e)));return}
  const p=x.plan,progress=levelOf(current),budget=PP.budget(progress.level);
  dest.append(mk('h4','',x.label+' · '+position+' · '+budget+' PP'+(progress.proof?'':' (condicionais)')));
  dest.append(mk('p','','Fonte: '+(progress.proof?'nível máximo conferido por você no dispositivo':'nível mostrado no eFHub; ainda não comprovado como máximo')+'. Identidade da edição e equipamentos continuam pendentes.'));
  if(tab==='treino'){
   if(p.status!=='hipotese'||!Array.isArray(p.levels)){
    dest.append(mk('p','',p.reason||'Sem treino válido para esta posição e orçamento.'));
   }else{
    dest.append(mk('p','',p.focus?.headline||'Distribuição consultiva por estilo e posição; teste em gameplay.'));
    const grid=mk('div','ct364-pp-grid');
    p.categories.forEach((name,i)=>{const cell=mk('div','ct364-pp-item');
      cell.append(mk('span','',name),mk('strong','',p.levels[i]+' níveis'));
      grid.append(cell)});
    dest.append(grid);
    dest.append(mk('p','','Total distribuído: '+p.pp+' PP · Restante '+p.remaining+'. Mesma distribuição V251 e interpretação V233 das principais; build HIPOTÉTICA, não homologada.'));
    if(p.tests?.length){const details=mk('details');
      details.append(mk('summary','','Como testar esta build em campo'));
      const ul=mk('ul','ct364-warning-list');for(const item of p.tests)ul.append(mk('li','',item));details.append(ul);dest.append(details)}
   }
  }else if(tab==='skills'){
   dest.append(mk('p','','As habilidades mostradas pelo eFHub estão na seção de evidências. Sem separação entre nativas e adicionadas, não confirmar slots livres nem aplicar recomendações automaticamente.'));
   if(x.suggestedSkills?.length){
    dest.append(mk('h4','','Candidatas consultivas por função'));
    dest.append(tags(x.suggestedSkills.map(sentence)));
   }else dest.append(mk('p','','Nenhuma habilidade adicional aprovada; identifique as habilidades nativas e os cinco slots antes de decidir.'));
   dest.append(mk('p','','Vagas livres comprovadas: '+(Number.isInteger(x.freeSkillSlots)?x.freeSkillSlots:'PENDENTE')+'.'));
  }else{
   dest.append(mk('p','','Ímpeto(s) que a tela de simulação mostrou, SEM prova de equipamento na conta:'));
   dest.append(tags(current.boostersShown?.length?current.boostersShown:['Não identificado no print']));
   const b=x.booster;
   if(b?.primary)dest.append(mk('p','','Possibilidade consultiva: '+sentence(b.primary)+'. Não equipar sem comprovação de slot da edição.'));
   dest.append(mk('p','','Slot selecionável validado para esta edição: '+(x.boosterEligible?'sim':'NÃO CONFIRMADO')+'.'));
  }
  showWarnings(dest,x.warnings);
 }
 function showEvidence(){
  const dest=$('ct364-evidence');dest.replaceChildren();
  if(!current)return;
  dest.append(mk('p','','Origem: print do jogo '+current.sourceGame+'; simulação '+current.sourceSimulation+'. A arte é um recorte desses prints, não imagem substituta. Atributos de eFHub com técnico NÃO são atributos-base.'));
  dest.append(mk('h4','','Habilidades visíveis · nativas/adicionais a distinguir'));
  dest.append(tags(current.shownSkills));
  if(current.physical?.heightCm)dest.append(mk('p','','Altura observada: '+current.physical.heightCm+' cm · Peso: '+current.physical.weightKg+' kg.'));
  if(current.physical?.bodyModel){
   const m=current.physical.bodyModel;
   dest.append(mk('h4','','Modelo corporal observado na simulação'));
   const n={comprimento_braco:'Comprimento do braço',largura_ombros:'Largura dos ombros',comprimento_pescoco:'Comprimento do pescoço',chest:'Peito',tamanho_pescoco:'Tamanho do pescoço',altura_ombro:'Altura dos ombros',comprimento_perna:'Comprimento da perna',tamanho_coxa:'Tamanho da coxa',tamanho_cintura:'Tamanho da cintura',tamanho_braco:'Tamanho do braço',tamanho_panturrilha:'Tamanho da panturrilha'};
   dest.append(tags(Object.entries(m).filter(([,v])=>v!==null&&v!==undefined).map(([k,v])=>(n[k]||k)+': '+v)));
  }
 }
 function open(c,scroll=true){
  current=c;position=roles.has(c.position)?c.position:'MLG';tactic='posse';tab='treino';
  $('ct364-position').value=position;
  $('ct364-profile').hidden=false;$('ct364-roster').hidden=true;
  drawProof();renderPlan();showEvidence();
  if(scroll)$('ct364-profile').scrollIntoView({behavior:'smooth',block:'start'});
  try{history.replaceState(null,'','?c='+c.numero)}catch(_){}
 }
 function close(){
  current=null;$('ct364-profile').hidden=true;$('ct364-roster').hidden=false;
  try{history.replaceState(null,'',location.pathname)}catch(_){}
  $('ct364-roster').scrollIntoView({block:'start',behavior:'smooth'});
 }
 async function start(){
  if(!PP||!engine)return root.append(mk('p','','O motor oficial de PP não carregou. Reinstale um APK completo.'));
  try{
   const response=await fetch('craque-minhas-cartas-v364.json');if(!response.ok)throw Error('arquivo indisponível');
   const doc=await response.json();
   if(doc.schema!=='CRAQUE_MINHAS_CARTAS_ADICIONAIS_V364'||doc.cards?.length!==15||
    doc.baseOriginalCount!==246||new Set(doc.cards.map(c=>c.numero)).size!==15)
    throw Error('Identidade do acervo adicional inconsistente');
   for(const c of doc.cards)if(c.ppIfLevelIsMaximum!==PP.budget(c.levelShownEFHub)||c.levelConfirmedMaximum!==false||c.cardId!==null)throw Error('PP / evidência inválidos na carta '+c.numero);
   all=doc.cards;drawList();
   const requested=Number(new URLSearchParams(location.search).get('c'));
   const selected=all.find(c=>c.numero===requested);if(selected)open(selected,false);
   $('ct364-roster').addEventListener('click',event=>{
    const a=event.target.closest('a.ct364-tile');if(!a)return;
    const m=a.href.match(/[?&]c=(\d+)/),found=all.find(c=>c.numero===Number(m?.[1]));
    if(found){event.preventDefault();open(found)}
   });
   $('ct364-search').addEventListener('input',e=>drawList(e.target.value));
   $('ct364-close').addEventListener('click',close);
   $('ct364-position').addEventListener('change',e=>{position=e.target.value;renderPlan()});
   d.querySelectorAll('#ct364-app button[data-mode]').forEach(b=>b.addEventListener('click',()=>{tactic=b.dataset.mode;renderPlan()}));
   d.querySelectorAll('#ct364-app button[data-tab]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.tab;renderPlan()}));
   $('ct364-proof-form').addEventListener('submit',e=>{
    e.preventDefault();if(!current)return;
    const n=Number($('ct364-confirm-level').value),pp=PP.budget(n);
    if(pp===null||!$('ct364-confirmed').checked){$('ct364-proof-feedback').textContent='Confirme o nível máximo desta edição no jogo.';return}
    const record={schema:'CRAQUE_V364_LEVEL_PROOF',numero:current.numero,name:current.name,level:n,pp,confirmed_in_game:true,at:new Date().toISOString()};
    try{win.localStorage.setItem(PROOF_KEY+current.numero,JSON.stringify(record))}
    catch(err){$('ct364-proof-feedback').textContent='Falha ao salvar: '+err.message;return}
    $('ct364-proof-feedback').textContent='Nível máximo '+n+' e '+pp+' PP confirmados neste aparelho. Build original não alterada.';
    drawProof();renderPlan();drawList($('ct364-search').value);
   });
   $('ct364-proof-reset').addEventListener('click',()=>{
    if(!current)return;try{win.localStorage.removeItem(PROOF_KEY+current.numero)}catch(_){}
    drawProof();renderPlan();drawList($('ct364-search').value);
    $('ct364-proof-feedback').textContent='Removida apenas a confirmação local. Print original preservado.';
   });
   d.head.append(d.querySelector('link[data-ct364-final="true"]'));
  }catch(err){root.append(mk('p','','Não foi possível carregar as 15 cartas originais: '+String(err.message||err)))}
 }
 if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',start,{once:true});else start();
})(typeof window!=='undefined'?window:null);
