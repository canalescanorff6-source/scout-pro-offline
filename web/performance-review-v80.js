(function(){
 'use strict';
 const core=window.SCOUT_PERFORMANCE_V80;
 const parent=document.querySelector('.profile-content');
 const src=document.getElementById('scout-v68-data'),lab=document.getElementById('lab-data');
 if(!core||!parent||!src||!lab||document.getElementById('scout-performance-v80'))return;
 let d,l;try{d=JSON.parse(src.textContent);l=JSON.parse(lab.textContent)}catch(e){return}
 const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const storageKey='scoutpro:v80:matches:'+d.capture+':'+d.id;
 function restorePersonalPP(){
  if(d.pp!==null)return;
  try{
   const p=JSON.parse(localStorage.getItem('scoutpro:v81:pp:'+d.capture)||'null');
   if(!p||p.cap!==d.capture||p.name!==d.name||!Number.isInteger(p.level)||p.pp!==2*(p.level-1))return;
   d.pp=p.pp;
   const customTrain=JSON.parse(localStorage.getItem('scoutpro:v67:'+l.id+':'+l.card)||'null')?.train;
   if(core.valid(customTrain)&&core.cost(customTrain)===p.pp){
    d.recommended_levels=customTrain;d.recommended_scenario='Personalizada';
   }
  }catch(e){}
 }
 restorePersonalPP();
 const customKey='scoutpro:v67:'+l.id+':'+l.card;
 const custom=()=>{try{const saved=JSON.parse(localStorage.getItem(customKey)||'null');return core.valid(saved?.train)?saved.train:null}catch(e){return null}};
 const load=()=>{try{const raw=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(raw)?raw:[]}catch(e){return []}};
 let history=load(),lastMessage='';
 // V380: relatórios de partidas não constituem uma segunda tela independente.
 // O DOM funcional e os listeners de salvamento permanecem no mesmo nó.
 const area=document.createElement('section');area.className='v80-review';area.id='scout-performance-v80';
 const disclosure=document.createElement('details');
 disclosure.id='ct380-performance-disclosure';disclosure.className='ct380-performance-disclosure';
 const summary=document.createElement('summary');summary.textContent='Histórico de partidas e desempenho';
 disclosure.append(summary,area);
 function mountInsidePremium(){
  const technical=document.querySelector('#scout-v220-technical .scout-v220-technical-body');
  if(!technical)return false;
  if(disclosure.parentElement!==technical)technical.appendChild(disclosure);
  return true;
 }
 if(!mountInsidePremium()){
  const observer=typeof MutationObserver==='function'?new MutationObserver(()=>{
   if(mountInsidePremium())observer.disconnect();
  }):null;
  observer?.observe(document.body,{childList:true,subtree:true});
  window.setTimeout(()=>{observer?.disconnect();if(!disclosure.isConnected)parent.appendChild(disclosure)},10000);
 }
 const [metricA,metricB]=core.metrics(d);
 const opts=()=>core.variants(d,l,custom());
 function render(){
  const state=core.review(d,l,history,custom()),builds=opts();
  const metricLabels=[metricA,metricB];
  const complete=state.observed.length>0;
  area.innerHTML='<header><span class="v80-overline">CRAQUE TÁTICO · REGISTROS DE PARTIDAS</span><h2>Rendimento em campo · '+esc(d.name)+'</h2>'+
   '<div class="v80-status">'+esc(state.status)+'</div><p>Não confundir PP conferidos com melhor build. A classificação depende dos dados desta edição e dos registros de partidas feitos por você.</p></header>'+
   '<div class="v80-facts"><div><small>Progressão</small><strong>'+(state.hasPP?d.pp+' PP conferidos no cadastro':'PP pendente')+'</strong></div>'+
   '<div><small>Atributos-base disponíveis</small><strong>'+state.baseStats+' registrados</strong></div>'+
   '<div><small>Builds distintas</small><strong>'+builds.length+'</strong></div>'+
   '<div><small>Partidas registradas</small><strong>'+state.recorded+'</strong></div></div>'+
   '<div class="v80-split"><article><h3>Critérios de evolução</h3><p><b>Build calculada:</b> PP corretos, sem promessa de melhor desempenho.</p>'+
   '<p><b>Build competitiva candidata:</b> PP, dados parciais de atributos e habilidades documentados, com dois treinos realmente diferentes.</p>'+
   '<p><b>Build validada em campo:</b> pelo menos cinco partidas registradas em cada uma de duas distribuições diferentes, sob o mesmo técnico, formação, estilo e faixa de adversário. Isso confirma a comparação observacional, não superioridade causal.</p>'+
   '</article><article><h3>Dados que ainda faltam</h3>'+
   (state.missing.length?'<ul>'+state.missing.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>Critérios de cadastro atendidos. Confira bônus, posição ativada e comportamento real antes de gastar recursos.</p>')+
   '<p>A proposta mantém seu jogo central de Posse de Bola, mas permite registrar contra-ataque em testes separados.</p></article></div>'+
   '<details class="v80-record"><summary>Registrar partida real para comparar builds</summary>'+
   (state.hasPP&&builds.length?'<form id="v80-form"><div class="v80-fields"><label>Treino usado<select name="build" required>'+
      builds.map(b=>'<option value="'+esc(b.hash)+'">'+esc(b.name+(b.aliases.length>1?' (mesma distribuição: '+b.aliases.join(', ')+')':''))+'</option>').join('')+'</select></label>'+
      '<label>Técnico<input name="manager" required maxlength="100" placeholder="Ex.: técnico utilizado"></label>'+
      '<label>Formação<input name="formation" required maxlength="30" placeholder="Ex.: 4-3-1-2"></label>'+
      '<label>Estilo de equipe<select name="tactic"><option>Posse de Bola</option><option>Contra-ataque normal</option><option>Contra-ataque rápido</option></select></label>'+
      '<label>Nível dos adversários<select name="opponent"><option>Semelhante</option><option>Acima</option><option>Abaixo</option></select></label>'+
      '<label>Resultado<select name="result"><option>Vitória</option><option>Empate</option><option>Derrota</option></select></label>'+
      '<label>'+esc(metricA)+'<input type="number" name="metricA" min="0" max="100" step="1" required placeholder="Valor observado"></label>'+
      '<label>'+esc(metricB)+'<input type="number" name="metricB" min="0" max="100" step="1" required placeholder="Valor observado"></label>'+
      '</div><label class="v80-note">Observações da movimentação, skills e coberturas<textarea name="note" rows="2" maxlength="350" placeholder="Anote o que percebeu em campo; não confundir hipótese com fato."></textarea></label>'+
      '<button type="submit">Salvar partida observada</button></form>':
      '<p>'+esc(state.hasPP?'PP confirmados. Defina um treino válido no Laboratório PRO antes de registrar partidas para comparação.':'Sem PP confirmados, não é seguro comparar uma progressão numérica. Confira o nível e os pontos da carta no jogo antes.')+'</p>')+
   '</details><div class="v80-observations"><h3>Comparação de desempenho</h3><p>'+
   (complete?'Você registrou pelo menos 5 partidas em duas builds distintas com contexto equivalente. Analise as médias e decida qual manter.':'Para comparar, registre no mínimo 5 partidas por distribuição, mantendo técnico, formação, estilo e faixa de adversário. Builds com níveis idênticos contam como uma só.')+
   '</p>'+
   state.observed.map(c=>'<div class="v80-table-wrap"><table><thead><tr><th>Treino</th><th>Partidas</th><th>'+esc(metricLabels[0])+' / partida</th><th>'+esc(metricLabels[1])+' / partida</th><th>Vitórias</th></tr></thead><tbody>'+
    c.builds.map(b=>'<tr><td>'+esc(b.name)+'</td><td>'+b.count+'</td><td>'+b.metricA+'</td><td>'+b.metricB+'</td><td>'+b.wins+'/'+b.count+'</td></tr>').join('')+'</tbody></table><small>Contexto: '+esc(c.key.replace(/\|/g,' · '))+'. Médias autorregistradas, não medições automáticas.</small></div>').join('')+
   '<p class="v80-helper">Registros ficam somente neste dispositivo e entram no backup “Meus dados”. Seus treinos e partidas anteriores permanecem intactos.</p>'+
   (state.recorded?'<button type="button" id="v80-undo" class="v80-secondary">Excluir o último registro V80</button>':'')+
   '</div><p class="v80-feedback" id="v80-feedback" role="status">'+esc(lastMessage)+'</p>';
  const form=area.querySelector('#v80-form');
  if(form)form.addEventListener('submit',e=>{
   e.preventDefault();
   const data=new FormData(form),hash=String(data.get('build')||''),variant=opts().find(x=>x.hash===hash);
   const integer=name=>{const val=String(data.get(name)??'').trim();return val!==''&&/^\d+$/.test(val)?Number(val):NaN};
   const a=integer('metricA'),b=integer('metricB');
   const manager=String(data.get('manager')||'').trim(),formation=String(data.get('formation')||'').trim();
   const opponent=String(data.get('opponent')||''),tactic=String(data.get('tactic')||'');
   const result=String(data.get('result')||'');
   if(!variant||!manager||!formation||!Number.isInteger(a)||!Number.isInteger(b)||a>100||b>100||a<0||b<0){
    lastMessage='Confira a build, o técnico, a formação e as duas métricas numéricas.';area.querySelector('#v80-feedback').textContent=lastMessage;return;
   }
   const record={hash:variant.hash,build:variant.name,manager:manager.slice(0,100),formation:formation.slice(0,30),
     opponent,tactic,result,metricA:a,metricB:b,note:String(data.get('note')||'').slice(0,350),date:new Date().toISOString()};
   if(core.safeMatches([record],opts()).length!==1){lastMessage='Registro inválido, nada foi salvo.';area.querySelector('#v80-feedback').textContent=lastMessage;return}
   try{const next=history.concat(record).slice(-100);localStorage.setItem(storageKey,JSON.stringify(next));history=next;lastMessage='Partida registrada. Compare ao menos cinco por distribuição no mesmo contexto.';render()}
   catch(e){lastMessage='O armazenamento local não está disponível; não foi possível salvar.';area.querySelector('#v80-feedback').textContent=lastMessage}
  });
  const undo=area.querySelector('#v80-undo');
  if(undo)undo.addEventListener('click',()=>{
   if(!confirm('Excluir o último registro V80 desta carta?'))return;
   try{const next=history.slice(0,-1);localStorage.setItem(storageKey,JSON.stringify(next));history=next;lastMessage='Último registro V80 excluído.';render()}
   catch(e){area.querySelector('#v80-feedback').textContent='Não foi possível atualizar o armazenamento.'}
  });
 }
 window.addEventListener('scoutpro:pp-updated',e=>{
  if(e.detail?.cap!==d.capture)return;
  d.pp=e.detail.pp;
  if(core.valid(e.detail.train)&&core.cost(e.detail.train)===e.detail.pp){
   d.recommended_levels=e.detail.train;d.recommended_scenario='Personalizada';
  }
  render();
 });
 render();
})();