/* Scout PRO V101 — interactive evidence workspace, offline and non-destructive. */
(()=>{'use strict';
 const core=window.SCOUT_MODELO_V101,root=document.body;
 if(!core||root?.dataset.page!=='player-model')return;
 const el=id=>document.getElementById(id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=n=>n===null||n===undefined||n===''?'Não conferido':String(n);
 const bodyKey=c=>core.key(c);
 const gameKey=c=>'scoutpro:v101:games:'+String(c.numero)+':'+String(c.card_id||'PENDENTE');
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
 const source=new Map();
 let cards=[],visible=[],current=null;
 const uiFilter=el('filter'),player=el('player'),search=el('search'),bodyForm=el('body-form'),gameForm=el('game-form');
 function cardEntry(c){return source.get(String(c.numero))||null}
 function localEntry(c){return read(bodyKey(c))}
 function currentModel(c){return core.combine(c,cardEntry(c),localEntry(c))}
 function games(c){const x=read(gameKey(c));return Array.isArray(x)?x.filter(a=>core.validObservation(a)).slice(-100):[]}
 function save(k,v){localStorage.setItem(k,JSON.stringify(v))}
 function filtered(){
  const query=search.value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return cards.filter(c=>{
   const state=currentModel(c);
   if(uiFilter.value==='pending'&&state.morphologyComplete)return false;
   if(uiFilter.value==='verified'&&!state.verified)return false;
   const hay=[c.nome,c.numero,'#'+String(c.numero).padStart(3,'0'),c.card_id,c.edicao].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
   return !query||hay.includes(query);
  });
 }
 function summary(){
  const entries={};for(const c of cards){const d=localEntry(c);if(d)entries[bodyKey(c)]=d}
  const s=core.state(cards,[...source.values()],entries);
  el('summary').innerHTML='<div class="stat"><strong>'+s.total+'</strong><small>Cartas avaliáveis</small></div>'+
    '<div class="stat"><strong>'+s.verified+'</strong><small>Edições com dados de fonte</small></div>'+
    '<div class="stat"><strong>'+s.pending+'</strong><small>Ainda sem físico completo</small></div>';
 }
 function updateSelect(keep){
  visible=filtered();
  player.textContent='';
  const frag=document.createDocumentFragment();
  for(const c of visible){const opt=document.createElement('option');opt.value=String(c.numero);opt.textContent='#'+String(c.numero).padStart(3,'0')+' · '+c.nome;frag.appendChild(opt)}
  player.appendChild(frag);
  const chosen=visible.find(c=>c.numero===Number(keep))||visible[0];
  current=chosen||null;
  if(current)player.value=String(current.numero);
  render();
 }
 function renderFacts(d){
  const rows=[
   ['Altura',num(d.altura_cm)+(Number.isFinite(d.altura_cm)?' cm':'')],
   ['Peso',num(d.peso_kg)+(Number.isFinite(d.peso_kg)?' kg':'')],
   ['Pé dominante',num(d.pe_dominante)],
   ['Uso da perna ruim',num(d.uso_perna_ruim)],
   ['Precisão da perna ruim',num(d.precisao_perna_ruim)],
   ['Comprimento da perna (escala)',num(d.modelo_corporal?.comprimento_perna)],
   ['Alcance das pernas (derivado)',num(d.modelo_corporal?.alcance_perna_cm)+(Number.isFinite(d.modelo_corporal?.alcance_perna_cm)?' cm':'')],
   ['Largura de colisão (derivada)',num(d.modelo_corporal?.colisao_tronco_cm)+(Number.isFinite(d.modelo_corporal?.colisao_tronco_cm)?' cm':'')]
  ];
  el('facts').innerHTML=rows.map(([k,v])=>'<div class="metric"><b>'+esc(v)+'</b><small>'+esc(k)+'</small></div>').join('');
 }
 function renderHistory(){
  if(!current){el('history').textContent='';return}
  const arr=games(current),count=arr.length;
  const box=el('history');
  box.innerHTML='<h3>Registros de campo: '+count+'/5 para observação inicial</h3>'+
   '<p class="sub">'+(count>=5?'Há registros suficientes para revisar a hipótese desta carta. Isto NÃO certifica que é meta; compare jogadores sob condições semelhantes.':'Cinco partidas são a amostra inicial de observação. Falta validar também contra outros candidatos, sem misturar contextos.')+'</p>'+
   arr.slice(-5).reverse().map((g,i)=>'<div class="record"><b>'+esc(g.formacao)+' · '+esc(g.tatica)+'</b> · Giro '+g.giro+' · Domínio '+g.primeiro_toque+' · Aceleração '+g.aceleracao+' · Proteção '+g.protecao+' · Cobertura '+g.cobertura+'<div>'+esc(g.nota||'Sem comentário')+'</div></div>').join('');
  el('undo-game').disabled=!count;
 }
 function render(){
  const c=current,formButtons=document.querySelectorAll('#body-form button,#game-form button');
  if(!c){el('name').textContent='Nenhum resultado';el('identity').textContent='';el('edition').textContent='';el('style').textContent='';el('art').removeAttribute('src');el('facts').textContent='';el('evidence').textContent='Ajuste a busca ou o filtro.';el('tags').textContent='';el('source-link').hidden=true;formButtons.forEach(b=>b.disabled=true);el('history').textContent='';return}
  formButtons.forEach(b=>b.disabled=false);
  const m=currentModel(c),d=m.fields,notes=localEntry(c)||{};
  el('name').textContent=c.nome;
  el('edition').textContent=c.edicao;
  el('identity').textContent='CAP #'+String(c.numero).padStart(3,'0')+' · Card ID: '+String(c.card_id||'pendente')+' · Posição: '+c.posicao;
  el('style').textContent='Ataque: '+c.estilo_ataque+' · Defesa: '+c.estilo_defesa;
  el('art').src=c.imagem;el('art').alt='Carta original de '+c.nome;
  el('card-link').href=c.ficha;
  const a=el('source-link');a.hidden=!m.source;if(m.source)a.href=m.source;else a.removeAttribute('href');
  el('tags').innerHTML='<span class="tag">'+(m.verified?'Edição localizada por Card ID':'Fonte externa pendente')+'</span>'+
    '<span class="tag">'+(m.overridden?'Dados pessoais inseridos':'Sem substituição de fonte')+'</span>'+
    '<span class="tag">Player ID / animações: não comprovados</span>';
  el('evidence').textContent=(m.verified?'As medidas foram localizadas no PESDB pela edição exata; base externa não oficial. ':'Ainda não há fonte física confirmada para esta edição. ')+
    (m.overridden?'Há valores pessoais nesta ficha, identificados separadamente. ':'')+
    'A classificação de gameplay não é deduzida automaticamente da altura ou do modelo corporal.';
  renderFacts(d);
  bodyForm.reset();
  const val=(field,v)=>{if(bodyForm.elements[field]&&v!==undefined&&v!==null)bodyForm.elements[field].value=String(v)};
  ['altura_cm','peso_kg','pe_dominante','uso_perna_ruim','precisao_perna_ruim','fonte_usuario','nota'].forEach(k=>val(k,notes[k]));
  ['comprimento_perna','alcance_perna_cm','colisao_tronco_cm'].forEach(k=>val(k,notes.modelo_corporal?.[k]));
  el('body-status').textContent='';el('game-status').textContent='';
  renderHistory();summary();
 }
 function step(delta){
  if(!visible.length)return;
  const index=visible.findIndex(c=>c.numero===current.numero);
  current=visible[(index+delta+visible.length)%visible.length];player.value=String(current.numero);render();
 }
 search.addEventListener('input',()=>updateSelect(current?.numero));
 uiFilter.addEventListener('change',()=>updateSelect(current?.numero));
 player.addEventListener('change',()=>{current=visible.find(c=>c.numero===Number(player.value))||null;render()});
 el('prev').onclick=()=>step(-1);el('next').onclick=()=>step(1);
 bodyForm.addEventListener('submit',e=>{
  e.preventDefault();if(!current)return;
  const fd=new FormData(bodyForm),get=k=>String(fd.get(k)||'').trim();
  const patch={modelo_corporal:{}};let entries=0;
  for(const field of ['altura_cm','peso_kg','pe_dominante','uso_perna_ruim','precisao_perna_ruim']){
   const value=get(field);if(value){patch[field]=value;entries++}
  }
  for(const field of ['comprimento_perna','alcance_perna_cm','colisao_tronco_cm']){
   const value=get(field);if(value){patch.modelo_corporal[field]=value;entries++}
  }
  patch.fonte_usuario=get('fonte_usuario');patch.nota=get('nota');
  if(!entries&&!patch.nota){el('body-status').textContent='Informe um dado ou observação verificada antes de salvar.';return}
  const safe=core.validPatch(patch);
  if(!safe){el('body-status').textContent='Valor fora dos limites ou inválido. Nenhuma alteração foi gravada.';return}
  try{save(bodyKey(current),safe);render();el('body-status').textContent='Dados pessoais salvos apenas nesta edição e neste dispositivo.'}
  catch{el('body-status').textContent='Armazenamento indisponível. Exporte seus registros antes de trocar de dispositivo.'}
 });
 el('clear-body').addEventListener('click',()=>{
  if(!current||!confirm('Apagar apenas os dados pessoais V101 desta carta? Os dados de fonte e treinos serão preservados.'))return;
  try{localStorage.removeItem(bodyKey(current));render();el('body-status').textContent='Valores pessoais revertidos; fonte original preservada.'}catch{el('body-status').textContent='Falha ao atualizar dados locais.'}
 });
 gameForm.addEventListener('submit',e=>{
  e.preventDefault();if(!current)return;
  const fd=new FormData(gameForm),o={};
  for(const k of ['tatica','formacao','nota'])o[k]=String(fd.get(k)||'').trim();
  for(const k of ['giro','primeiro_toque','aceleracao','protecao','cobertura'])o[k]=Number(fd.get(k));
  const safe=core.validObservation(o);
  if(!safe){el('game-status').textContent='Informe a formação, o estilo e cinco notas de 1 a 5.';return}
  try{save(gameKey(current),games(current).concat({...safe,registrado_em:new Date().toISOString()}).slice(-100));renderHistory();el('game-status').textContent='Observação registrada. Não é resultado de partida medido automaticamente.'}
  catch{el('game-status').textContent='Não foi possível salvar o teste nesta instalação.'}
 });
 el('undo-game').onclick=()=>{
  if(!current||!confirm('Excluir a última observação V101 desta carta?'))return;
  try{save(gameKey(current),games(current).slice(0,-1));renderHistory();el('game-status').textContent='Último registro excluído.'}catch{el('game-status').textContent='Erro no armazenamento.'}
 };
 Promise.all([fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>{if(!r.ok)throw Error('auditoria indisponível');return r.json()}),
  fetch('SCOUT_V101_MODELO_CORPORAL.json').then(r=>{if(!r.ok)throw Error('dados físicos indisponíveis');return r.json()})]).then(([audit,physical])=>{
   if(audit.total!==246||!Array.isArray(audit.cartas)||audit.cartas.length!==246||!Array.isArray(physical.cartas))throw Error('Índices de cartas inconsistentes.');
   cards=audit.cartas.slice().sort((a,b)=>a.numero-b.numero);
   for(const e of physical.cartas){const c=cards.find(x=>x.numero===e.numero);if(!core.match(c,e))throw Error('Edição da fonte diferente da carta #'+e.numero);source.set(String(e.numero),e)}
   const requested=Number(new URLSearchParams(location.search).get('cap')||'39');
   updateSelect(requested);
  }).catch(err=>{el('summary').textContent='Não foi possível carregar a auditoria local.';el('evidence').textContent=String(err.message);el('name').textContent='Falha na leitura. Abra a página novamente.'});
})();
