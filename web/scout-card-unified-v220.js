/* SCOUT PRO V220 — ficha competitiva premium única por carta, cinco estilos de técnico.
 * Antiga engenharia, recomendações detalhadas e demais painéis permanecem consultáveis.
 * Dados / builds originais NÃO sofrem qualquer alteração automática.
 */
(function(host){
'use strict';
let engine=host?.SCOUT_TACTICS_V220;
const $=(root,id)=>root.querySelector('#'+id);
const mk=(doc,tag,cls,text)=>{const x=doc.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const localGet=k=>{try{return host.localStorage?.getItem(k)||null}catch(_e){return null}};
const localSet=(k,s)=>{try{host.localStorage?.setItem(k,s);return true}catch(_e){return false}};
const parse=s=>{try{return JSON.parse(s||'null')}catch(_e){return null}};
const styles=['posse','normal','rapido','fora','longo'];
function nativeDetails(card,tactic){
 const R=host.SCOUT_RECOMMENDATIONS_V162,B=host.SCOUT_BOOSTERS_V103;
 const budget=Number(card.pp),cap=Number(card.capture),id=String(card.id);
 let results=null,booster=null;
 if(R){
  const manual=localGet('scoutpro:v162:equipped:'+cap+':'+id)||'';
  const manualProof=parse(localGet(R.confirmationKey?.(cap,id)||
   'scoutpro:v254:additional-confirmed:'+cap+'@'+id));
  const complete=R.checkedEquipment?.({...card,capture:cap,id},manual,manualProof)===true;
  try{results=R.evaluate(card,tactic,manual,{equippedConfirmed:complete})}catch(_e){results=null}
  const slot=parse(localGet('scoutpro:v103:booster:'+cap));
  const verified=R.boosterRecordEvidence?.({...card,capture:cap,id},slot);
  try{booster=R.booster(card,tactic,B,verified?.status,verified?.equipped)}catch(_e){booster=null}
 }
 return {skills:results,booster,budget};
}
function evidence(card,source,style){
 const native=String(source.habilidades_nativas||card.native_skills||'').split(';').filter(x=>x.trim()).length;
 const base=source.base_stats_known===true;
 const provisional=card.training_provisional===true||card.treino_proposto_nao_validado===true||source.treino_proposto_nao_validado===true;
 const balanced=engine.confirmSource(card);
 // PP fechados não significam treino aprovado em partidas.
 const approved=balanced&&!provisional&&card.training_gameplay_verified===true;
 const vector=Array.isArray(source.niveis)&&engine.valid(source.niveis);
 return {native,base,approved,provisional,vector,
  trustedName:source.name||card.name||('Carta #'+card.capture),
  label:provisional?(balanced?'Build proposta · PP matematicamente conferidos · validar em partidas':'Build proposta · PP não conferidos'):
   approved?'Treino com teste de partida documentado':balanced?'Build cadastrada · PP exatos, desempenho NÃO comprovado':vector?'Treino experimental · validar edição':'Treinamento pendente de comprovação',
  disclaimer:'Treinos alternativos são hipóteses por estilo/função e habilidades cadastradas. Sem atributos-base finais, vídeos da edição exata e testes controlados, não há prova de que sejam superiores.'};
}
function makeList(doc,list){
 const ul=mk(doc,'ul','scout-v220-skill-list');
 for(const x of list){
  const li=mk(doc,'li','scout-v220-skill');
  const heading=mk(doc,'strong','',x.name);
  const detail=mk(doc,'span','',x.why||'Complemento a conferir no jogo');
  li.append(heading,detail);
  if(Array.isArray(x.synergies)&&x.synergies.length){
   li.append(mk(doc,'small','','Complementaridade: '+x.synergies.join('; ')));
  }
  ul.append(li);
 }
 return ul;
}
function mount(doc){
 engine=host?.SCOUT_TACTICS_V220||engine;
 if(!doc||doc.body?.dataset.page!=='detail')return false;
 if(doc.getElementById('scout-v220-hero'))return true;
 const panel=doc.getElementById('scout-v188-principal'),
       training=doc.querySelector('#scout-v188-principal .scout-v188-progress'),
       controls=doc.getElementById('scout-v218-controls'),
       raw=doc.getElementById('scout-v68-data'),
       labraw=doc.getElementById('lab-data');
 if(!engine||!panel||!training||!controls||!raw||!labraw)return false;
 let card,lab;try{card=JSON.parse(raw.textContent);lab=JSON.parse(labraw.textContent)}catch(_e){return false}
 const originalPosition=String(card.shown_position||card.role_used||card.posicao||'');
 let activeRole=originalPosition,roleEvidence='original';
 const budget=Number(card.pp),id=String(card.id),cap=Number(card.capture);
 if(!id||!Number.isInteger(budget)||budget<0)return false;
 const possession=engine.confirmSource(card)?card.recommended_levels.slice():null;
 const experimental=engine.valid(lab.draftA)&&engine.total(lab.draftA)===budget?lab.draftA.slice():null;
 const baseline=possession||experimental;
 let style=localGet('scoutpro:v220:style:'+cap+':'+id)||'posse';
 if(!styles.includes(style))style='posse';
 // Os níveis originais continuam preservados em todas as cinco táticas.
 const wrap=mk(doc,'div','scout-v220-shell');wrap.id='scout-v220-hero';
 const hero=mk(doc,'section','scout-v220-hero');
 const eyebrow=mk(doc,'div','scout-v220-eyebrow','SCOUT PRO / ANÁLISE COMPETITIVA');
 const head=mk(doc,'div','scout-v220-head');
 const who=mk(doc,'div','scout-v220-headline');
 who.append(mk(doc,'h2','','Minha ficha de treino'),mk(doc,'p','scout-v220-name',card.name||'Carta #'+cap));
 const pp=mk(doc,'div','scout-v220-pp');
 pp.append(mk(doc,'strong','',budget),mk(doc,'span','','PP da carta'));
 head.append(who,pp);
 const chips=mk(doc,'div','scout-v220-chips');
 chips.append(mk(doc,'span','','#'+String(cap).padStart(3,'0')),
  mk(doc,'span','',String(card.shown_position||card.posicao||'Posição pendente')),
  mk(doc,'span','',String(card.attack_style||'Estilo da carta pendente')),
  mk(doc,'span','scout-v220-id','Card ID '+id));
 const intro=mk(doc,'p','scout-v220-sub','Uma ficha principal por edição. Cada estilo é uma hipótese até haver atributos, PP e testes da carta exata; não priorizar Overall.');
 const tabs=mk(doc,'div','scout-v220-tabs');tabs.id='scout-v220-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Estilo de jogo do técnico');
 for(const t of engine.STYLES){
  const b=mk(doc,'button','scout-v220-tab',t.label);b.type='button';b.dataset.tactic=t.id;
  b.setAttribute('aria-pressed',String(style===t.id));b.addEventListener('click',()=>choose(t.id,true));
  tabs.append(b);
 }
 const assist=mk(doc,'div','scout-v220-focus');
 assist.innerHTML='<div class="scout-v220-focus-heading"><span>01 · FUNÇÃO E PRIORIDADE</span><span class="scout-v220-confidence" id="scout-v220-evidence"></span></div><h3 id="scout-v220-focus-title"></h3><p id="scout-v220-focus-note"></p><div class="scout-v220-focus-tags" id="scout-v220-priorities"></div>';
 hero.append(eyebrow,head,chips,intro,tabs,assist);
 wrap.append(hero);
 panel.insertAdjacentElement('afterbegin',wrap);
 const trainingBlock=mk(doc,'section','scout-v220-training');
 trainingBlock.id='scout-v220-training';
 const sectionHeading=mk(doc,'div','scout-v220-section-head');
 sectionHeading.append(mk(doc,'div','', '02 · PROGRESSÃO DE PONTOS'),
  mk(doc,'p','','Ajuste níveis na tabela abaixo. Alterações são rascunhos por estilo, não upgrades aprovados.'));
 trainingBlock.append(sectionHeading);
 trainingBlock.append(training);wrap.append(trainingBlock);
 const skillsSection=mk(doc,'section','scout-v220-recs');skillsSection.id='scout-v220-recs';
 skillsSection.innerHTML='<div class="scout-v220-section-head"><div>04 · HABILIDADES E ÍMPETO</div><p>Recomendações por edição cadastrada, função e tática. Não equipam nada na conta.</p></div>'+
 '<div class="scout-v220-recs-grid"><article class="scout-v220-skill-panel"><div class="scout-v220-card-head"><h3>5 habilidades adicionais</h3><span id="scout-v220-skill-count">—</span></div><div id="scout-v220-skill-list"></div><p class="scout-v220-small" id="scout-v220-skills-caution"></p><button type="button" class="scout-v220-link" id="scout-v220-edit-skills">Informar habilidades já equipadas ↗</button></article>'+
 '<article class="scout-v220-booster-panel"><div class="scout-v220-card-head"><h3>Ímpeto por estilo</h3><span id="scout-v220-booster-badge">PENDENTE</span></div><div class="scout-v220-boost-hero"><small>Recomendação consultiva</small><strong id="scout-v220-booster-name">—</strong></div><p id="scout-v220-booster-why"></p><p id="scout-v220-booster-other" class="scout-v220-small"></p><p id="scout-v220-booster-slot" class="scout-v220-warning"></p><button type="button" class="scout-v220-link" id="scout-v220-edit-booster">Conferir slot e opções ↗</button></article></div>';
 wrap.append(skillsSection);
 const practical=mk(doc,'section','scout-v220-practice');
 practical.innerHTML='<div class="scout-v220-section-head"><div>05 · TESTE NO CAMPO</div><p>Compare partidas semelhantes e registre o que realmente aconteceu.</p></div>'+
 '<div class="scout-v220-practice-grid"><label>Resultado observado<select id="scout-v220-outcome"><option value="pendente">Ainda não testado</option><option value="promissor">Promissor em partidas</option><option value="rever">Precisa de ajustes</option></select></label>'+
 '<label>Observações da carta<textarea id="scout-v220-notes" rows="3" maxlength="1000" placeholder="Ex.: apoios curtos, movimentação, perdas, tabela, interceptações…"></textarea></label></div><button type="button" id="scout-v220-save-notes" class="scout-v220-cta">Salvar observações do estilo</button><p id="scout-v220-notice" aria-live="polite"></p>';
 wrap.append(practical);
 const foot=mk(doc,'p','scout-v220-disclaimer','Não priorizamos Overall. Treino comparativo, habilidades e ímpetos dependem da edição exata e da validação em campo.');
 wrap.append(foot);
 const technical=mk(doc,'details','scout-v220-technical');technical.id='scout-v220-technical';
 technical.append(mk(doc,'summary','','Análises técnicas, engenharia do vídeo e dados complementares'));
 const tech=mk(doc,'div','scout-v220-technical-body');technical.append(tech);wrap.append(technical);
 const engineering=doc.getElementById('engenharia');
 if(engineering)tech.append(engineering);
 const oldFocus=doc.getElementById('scout-v194-focus');
 if(oldFocus)tech.append(oldFocus);
 for(const q of ['.scout-v188-boost','.scout-v188-body','.scout-v188-more']){
  const e=panel.querySelector(q);if(e)tech.append(e);
 }
 const box=mk(doc,'details','scout-v220-advanced-skill');box.id='scout-v220-advanced-skills';
 box.append(mk(doc,'summary','','Cadastro de habilidades, slots e explicações detalhadas'));
 const oldSkill=doc.getElementById('scout-v162');if(oldSkill)box.append(oldSkill);
 tech.append(box);
 const notesKey=()=> 'scoutpro:v220:match:'+cap+':'+id+':'+style;
 const outcome=$(wrap,'scout-v220-outcome'),memo=$(wrap,'scout-v220-notes');
 function loadNotes(){
  const n=parse(localGet(notesKey()))||{};
  outcome.value=['pendente','promissor','rever'].includes(n.outcome)?n.outcome:'pendente';
  memo.value=String(n.notes||'').slice(0,1000);
 }
 $(wrap,'scout-v220-save-notes').addEventListener('click',()=>{
  const ok=localSet(notesKey(),JSON.stringify({outcome:outcome.value,notes:memo.value.trim(),updated:new Date().toISOString(),card_id:id,tactic:style}));
  $(wrap,'scout-v220-notice').textContent=ok?'Observações guardadas neste dispositivo.':'Não foi possível salvar as observações neste dispositivo.';
 });
 function switchTraining(tactic){
  const s=engine.styleFor(tactic);
  // V252: somente o treino registrado e matematicamente confirmado pode
  // fundamentar uma hipótese. Um draft experimental NÃO vira cinco builds
  // supostamente confiáveis ao trocar a tática.
  // PP matematicamente fechados NÃO comprovam nível, edição ou gameplay.
  // Evita replicar a mesma hipótese em cinco estilos para as 161 cartas sem
  // nível documentado e para treinos provisórios como Martinelli #191.
  const levelDocumented=Number.isInteger(card.max_level)&&card.max_level>=1&&
   Number(card.pp)===2*(card.max_level-1)&&card.pp_estimated!==true&&
   /^informado_pelo_usuario_/.test(String(card.pp_origem||''));
  const sourceVerified=Boolean(possession)&&levelDocumented&&
   card.training_provisional!==true&&engine.confirmSource(card);
  const fallback=sourceVerified?engine.hypothetical({...card,niveis:possession},tactic,possession):null;
  const proposed=Array.isArray(fallback?.levels)&&engine.valid(fallback.levels)&&
   engine.total(fallback.levels)===budget?fallback.levels:null;
  host.dispatchEvent(new host.CustomEvent('scoutpro:tactic-selected-v220',{
   detail:{cap,card_id:id,tactic,label:s.label,proposedLevels:proposed,
    evidenceStatus:sourceVerified?'pp_e_nivel_documentados_hipotese':'nivel_ou_build_sem_comprovacao',
    verifiedInGameplay:false}
  }));
  doc.dispatchEvent(new host.CustomEvent('scoutpro:tactic-selected-v220',{detail:{tactic}}));
 }
 function updateRecommendations(){
  const cfg=engine.styleFor(style);
  const focus=engine.focus(card,style),proof=evidence(card,{base_stats_known:card.base_stats_known,niveis:card.recommended_levels,habilidades_nativas:card.native_skills,name:card.name},style);
  // V233: prioridades explicadas por posição real, habilidades e estilo, não apenas
  // por uma lista de pesos genéricos. Fallback V220 se a extensão não carregar.
  const read233=host.CRAQUE_INTERPRETATION_V233?.interpret(card,style,lab)||null;
  $(wrap,'scout-v220-focus-title').textContent=(read233?
   read233.position+' · '+cfg.focus:cfg.focus)+
   ' · função '+activeRole+(roleEvidence==='original'?' (original)':
    roleEvidence==='treinada'?' (treinada)':' (familiaridade confirmada)');
  $(wrap,'scout-v220-focus-note').textContent=read233?
   read233.job+' '+(read233.signals.length?read233.signals.slice(0,2).join(' '):
    'Sem evidência individual suficiente para distinguir esta carta além da sua função.'):
   'Papel: '+focus.role+' · '+(card.attack_style||'estilo não documentado')+'. '+(focus.evidence.length?'Sinais cadastrados: '+focus.evidence.join(', ')+'.':'Sem sinais individuais adicionais suficientes.');
  $(wrap,'scout-v220-evidence').textContent=read233?
   (read233.uncertainty==='parcial_com_atributos_base'?'Base parcial registrada':
    read233.uncertainty==='documental'?'Evidência documental':'Dados pendentes'):
   (focus.baseKnown?'Atributos-base parcialmente documentados':'Status finais pendentes');
  const pills=$(wrap,'scout-v220-priorities');pills.replaceChildren();
  for(const item of (read233?read233.priorities.slice(0,4):focus.priority))
   pills.append(mk(doc,'span','',item.name));
  const {skills,booster}=nativeDetails(card,style);
  const holder=$(wrap,'scout-v220-skill-list');holder.replaceChildren();
  if(skills){
   const remaining=skills.slotsRemaining;
   const picks=skills.recommendations||[];
   if(picks.length)holder.append(makeList(doc,picks));
   else holder.append(mk(doc,'p','scout-v220-small',
    skills.manualOverLimit?'Cadastro de habilidades acima de cinco; corrija antes de planejar slots.':
    remaining===0?'Cinco adicionais conferidas: nenhuma vaga disponível nesta edição.':
    'Habilidades insuficientemente documentadas; confirme as equipadas no Plano de Jogo.'));
   $(wrap,'scout-v220-skill-count').textContent=skills.equippedConfirmed?
    remaining+' vaga(s) conferida(s)':'Slots não conferidos';
   $(wrap,'scout-v220-skills-caution').textContent=(skills.nativeKnown?'Nativas cadastradas: '+skills.knownNative+'. ':'Nativas pendentes. ')+
    (skills.equippedConfirmed?'Lista completa conferida nesta edição. ':
     'NÃO há comprovação de slots livres. Sugestões são opções teóricas. ')+
    'Não duplicar nativas nem adicionais equipadas. '+(skills.missing||[]).join(' ');
  }else{
   holder.append(mk(doc,'p','','Motor de habilidades indisponível; tente atualizar o aplicativo.'));
   $(wrap,'scout-v220-skill-count').textContent='Pendente';
  }
  const boostName=$(wrap,'scout-v220-booster-name'),boostWhy=$(wrap,'scout-v220-booster-why'),
    boostOther=$(wrap,'scout-v220-booster-other'),boostSlot=$(wrap,'scout-v220-booster-slot');
  if(booster?.primary){
   boostName.textContent=(booster.primary.nome_pt||booster.primary.nome)+' +1';
   boostWhy.textContent=booster.primary.motivo||'Complemento hipotético de função.';
   boostOther.textContent='Ímpeto fixo: '+(card.boost1||'não documentado')+
    '. Alternativas: '+(booster.alternatives||[]).slice(0,2).map(b=>b.nome_pt||b.nome).join(' / ')+'.'+
    (booster.primary.traducao_documentada?'':' Nome técnico não traduzido: confirme a grafia PT-BR no jogo.');
   boostSlot.textContent=booster.able?'Slot vazio indicado manualmente: confirme disponibilidade e compatibilidade no jogo.':
    'Slot disponível NÃO confirmado. Sugestão apenas comparativa; não gastar pedras sem conferir a edição.';
   $(wrap,'scout-v220-booster-badge').textContent=booster.confidence==='baixa'?'BAIXA CONFIANÇA':'COMPARAÇÃO';
  }else{
   boostName.textContent='Evidência pendente';
   boostWhy.textContent='Sem recomendação segura desta edição.';
   boostOther.textContent='Ímpeto fixo: '+(card.boost1||'não documentado');
   boostSlot.textContent='Não inferir segundo slot ou ímpetos equipados.';
   $(wrap,'scout-v220-booster-badge').textContent='PENDENTE';
  }
  const data=$(wrap,'scout-v220-evidence');
  data.setAttribute('title',proof.disclaimer);
 }
 function choose(id,save){
  if(!styles.includes(id))return;
  style=id;
  if(save)localSet('scoutpro:v220:style:'+cap+':'+String(card.id),id);
  wrap.querySelectorAll('[data-tactic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tactic===style)));
  switchTraining(id);updateRecommendations();loadNotes();
 }
 $(wrap,'scout-v220-edit-skills').addEventListener('click',()=>{
  technical.open=true;
  const advanced=$(wrap,'scout-v220-advanced-skills');if(advanced)advanced.open=true;
  const el=$(wrap,'v162-equipped');if(el)el.scrollIntoView({block:'center',behavior:'smooth'});
 });
 $(wrap,'scout-v220-edit-booster').addEventListener('click',()=>{
  technical.open=true;
  const advanced=$(wrap,'scout-v220-advanced-skills');if(advanced)advanced.open=true;
  const el=$(wrap,'v162-booster');if(el)el.scrollIntoView({block:'center',behavior:'smooth'});
 });
 // V263: a função alternativa afeta PP, habilidades, ímpetos e os títulos
 // da ficha, sem transformar seleção temporária em treino cadastrado.
 function acceptRole(detail){
  if(Number(detail?.capture)!==cap||String(detail?.card_id)!==id)return false;
  const API=host.SCOUT_POSITION_TRAINING_V246;
  const expected=API?.pos?.(originalPosition)||originalPosition;
  const wanted=API?.pos?.(detail.position)||'';
  const proof=API?.status?.({numero:cap,id,posicao:originalPosition},
   wanted,host.localStorage);
  if(!wanted||wanted!==expected&&!(proof?.eligible===true&&
    ['treinada','familiar'].includes(proof.status)))return false;
  if(activeRole===wanted)return true;
  activeRole=wanted;roleEvidence=wanted===expected?'original':proof.status;
  card.shown_position=wanted;card.role_used=wanted;
  updateRecommendations();switchTraining(style);
  return true;
 }
 host.addEventListener('scoutpro:role-selected-v263',event=>acceptRole(event.detail));
 if(host.SCOUT_ROLE_SELECTION_V263)acceptRole(host.SCOUT_ROLE_SELECTION_V263);
 // V251: usar a ficha canônica somente após confirmar CAP, Card ID e edição.
 // Não toca nos arquivos originais; a cópia antiga pode omitir habilidades.
 host.addEventListener('scoutpro:v251:canonical-data',event=>{
  const v=event.detail||{};
  if(Number(v.capture)!==cap||String(v.id)!==id||
   String(v.name)!==String(card.name)||String(v.edition)!==String(card.edition))return;
  for(const key of ['native_skills','attack_style','defence_style','boost1','boost2',
   'base_stats_known','training_provisional','max_level','pp_origem','pp_estimated']){
   if(Object.hasOwn(v,key))card[key]=v[key];
  }
  updateRecommendations();
  // A conferência canônica pode chegar depois da primeira renderização.
  // Recalcular o estilo para retirar hipóteses sem prova antes de exibi-las.
  switchTraining(style);
 });
 doc.addEventListener('scoutpro:skills-updated',updateRecommendations);
 doc.addEventListener('scoutpro:recommendations-ready',()=>{
  const old=doc.getElementById('scout-v162');
  const bx=doc.getElementById('scout-v220-advanced-skills');
  if(old&&bx&&!bx.contains(old))bx.append(old);
  updateRecommendations();switchTraining(style);
 });
 doc.addEventListener('scoutpro:tactic-ui-selected-v220',event=>{
  if(styles.includes(event.detail?.tactic)&&style!==event.detail.tactic)choose(event.detail.tactic,true);
 });
 const route=doc.querySelector('.side-nav a[href="#engenharia"]');
 if(route){route.textContent='Engenharia e evidências (opcional)';route.href='#scout-v220-technical'}
 choose(style,false);
 return true;
}
const api=Object.freeze({nativeDetails,evidence,mount});
if(typeof module==='object'&&module.exports)module.exports=api;
if(!host?.document)return;
function boot(){
 if(mount(host.document))return;
 if(!host.MutationObserver||!host.document.body)return;
 const observer=new host.MutationObserver(()=>{if(mount(host.document))observer.disconnect()});
 observer.observe(host.document.body,{subtree:true,childList:true});
 host.document.addEventListener('scoutpro:recommendations-ready',()=>{if(mount(host.document))observer.disconnect()},{once:true});
}
if(host.document.readyState==='loading')host.document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})(typeof window!=='undefined'?window:null);
