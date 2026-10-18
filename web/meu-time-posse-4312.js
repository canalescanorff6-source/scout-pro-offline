(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SLOT_LABEL={go:'GO',ld:'LD',le:'LE',zge:'ZG E',zgd:'ZG D',vol:'VOL',mlge:'MLG E',mlgd:'MLG D',mat:'MAT',sa:'SA',ca:'CA'};
const ROLE_MAP={GR:'GO',GO:'GO',DD:'LD',LD:'LD',DE:'LE',LE:'LE',DC:'ZG',ZC:'ZG',ZG:'ZG',MDF:'VOL',VOL:'VOL',MC:'MLG',ME:'MLG',MLG:'MLG',MO:'MAT',MAT:'MAT',AC:'CA',CA:'CA',SA:'SA'};
const ROWS=[['sa','ca'],['mat'],['mlge','mlgd'],['vol'],['le','zge','zgd','ld'],['go']];
const STORAGE_KEY='scoutpro:v176:posse4312:my-lineup';
const identity=window.SCOUT_PLAYER_IDENTITY_V245;
const positionTraining=window.SCOUT_POSITION_TRAINING_V246;
if(!positionTraining)throw Error('Posições treinadas V246 não carregaram');
if(!identity)throw Error('Identidade dos jogadores V245 indisponível');
let plan=null, roster=[], byCap=new Map(), base={}, current={},activeSlot=null,showAll=false;
const roleFor=c=>ROLE_MAP[String(c.posicao||'')]||c.posicao;
const wanted=slot=>('zge'===slot||'zgd'===slot?'ZG':SLOT_LABEL[slot]?.split(' ')[0]);
const originallyFits=(c,slot)=>positionTraining.status(c,wanted(slot)).eligible;
function setStatus(message){$('status').textContent=message}
function persist(){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify({schema:plan.schema,slots:current}));setStatus('Personalização salva neste dispositivo; fichas e PP não foram alterados.')}
 catch(e){setStatus('Não foi possível guardar neste dispositivo; as alterações atuais continuam nesta sessão.')}
}
function canPick(slot,cap){
 const n=Number(cap);
 if(!Number.isSafeInteger(n)||!byCap.has(n)){setStatus('Carta inexistente no catálogo.');return false}
 const existing=Object.entries(current).find(([k,v])=>k!==slot&&
  identity.key(byCap.get(Number(v)))===identity.key(byCap.get(n)));
 if(existing){setStatus('O jogador '+byCap.get(n).name+' já está em '+SLOT_LABEL[existing[0]]+
  ', mesmo usando outra carta. Uma versão por pessoa em cada equipe.');return false}
 current[slot]=n;persist();render();return true;
}
function playerCard(slot){
 const selected=byCap.get(Number(current[slot]));const original=plan.starter_slots.find(x=>x.slot===slot);
 if(!selected)return '';
 const changed=selected.numero!==original.cap;const fits=originallyFits(selected,slot);
 const confidence=changed?'Não avaliada':original.confidence==='alta'?'Alta':'Média';
 const src=changed?getImage(selected.numero):original.art;
 return '<button type="button" class="p-slot '+(changed?'swapped ':'')+(!fits?'offrole':'')+'" data-slot="'+esc(slot)+'" title="Trocar jogador desta posição">'+
 '<span class="p-role">'+esc(SLOT_LABEL[slot])+'</span>'+
 '<img src="'+esc(src)+'" alt="Arte original de '+esc(selected.name)+'" loading="lazy"/>'+
 '<span class="p-name">'+esc(selected.name)+'</span>'+
 '<span class="p-cap">#'+selected.numero+' · '+esc(positionTraining.status(selected,wanted(slot)).label)+'</span>'+
 '<span class="p-trust">'+esc(confidence)+(changed?' · escolha manual':'')+'</span></button>';
}
function getImage(n){const p=plan.starter_slots.find(x=>x.cap===n)||plan.bench.find(x=>x.cap===n);return p?.art||images.get(n)||''}
let images=new Map();
function renderPitch(){
 $('pitch').innerHTML=ROWS.map((row)=>'<div class="pitch-row">'+row.map(playerCard).join('')+'</div>').join('');
 $('pitch').querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>openPicker(b.dataset.slot)));
 const altered=Object.keys(base).filter(k=>current[k]!==base[k]);
 $('custom-badge').textContent=altered.length?altered.length+' posição(ões) modificada(s)':'11 titulares recomendados';
}
function effectiveBench(){
 const rows=plan.bench.map(p=>({...p,original_pos:byCap.get(p.cap)?.posicao}));
 return identity.benchFor(Object.values(current),rows,roster).map((row,index)=>{
  const original=plan.bench[index],player=byCap.get(row.cap);
  return {...original,cap:row.cap,nome:player.name,art:getImage(row.cap),
   card_page:player.arquivo,role:row.original_pos,estilo_ataque:player.estilo_ataque,
   confidence:row.autoReplacement?'revisão':original.confidence,
   use:row.autoReplacement?'Reserva substituída para evitar outra versão do mesmo jogador; avalie a função antes de usar.':original.use};
 });
}
function renderBench(){
 const roleoptions=Object.keys(SLOT_LABEL).map(s=>'<option value="'+s+'">'+esc(SLOT_LABEL[s])+'</option>').join('');
 $('bench').innerHTML=effectiveBench().map(p=>{
 const inField=Object.values(current).includes(p.cap);
 const selected=byCap.get(p.cap);
 return '<article class="bench-card">'+
 '<img src="'+esc(p.art)+'" alt="Arte original de '+esc(p.nome)+'" loading="lazy"/>'+
 '<div class="bench-details"><strong>#'+p.cap+' '+esc(p.nome)+'</strong><small>'+esc(p.role)+' · '+esc(p.estilo_ataque)+' · Confiança '+esc(p.confidence)+'</small><p>'+esc(p.use)+'</p>'+
 '<a href="'+esc(p.card_page)+'">Abrir ficha original ↗</a></div>'+
 '<div class="bench-action"><label for="bench-'+p.cap+'">'+(inField?'Em campo · trocar posição':'Colocar em campo')+'</label>'+
 '<select id="bench-'+p.cap+'" data-bench="'+p.cap+'"><option value="">Selecionar posição…</option>'+roleoptions+'</select></div></article>';
 }).join('');
 $('bench').querySelectorAll('select[data-bench]').forEach(s=>s.addEventListener('change',()=>{
  if(s.value)canPick(s.value,Number(s.dataset.bench));s.value='';
 }));
}
function renderNotes(){
 const same=Object.keys(base).every(s=>base[s]===current[s]);
 $('analysis').innerHTML='<h2>Leitura tática dos titulares</h2>'+
 '<p class="caution">'+(same?'As observações abaixo correspondem exatamente aos titulares recomendados.':'Você fez trocas manuais. Confira o novo encaixe; notas originais NÃO foram validadas para os substitutos.')+'</p>'+
 plan.starter_slots.map(p=>{
 const actual=byCap.get(current[p.slot]);const custom=actual?.numero!==p.cap;
 return '<article class="note"><b>'+esc(SLOT_LABEL[p.slot])+' · '+esc(actual?.name||p.nome)+'</b><small>'+(custom?'Escolha manual — avaliação por confirmar':'Confiança '+esc(p.confidence)+' · #'+p.cap+' · '+esc(p.estilo_ataque))+'</small>'+
 '<p>'+esc(custom?'Consulte a ficha original e teste o estilo ativo, posicionamento, passe e defesa antes de adotar como titular.':p.reason)+'</p>'+
 '<p><strong>Instrução:</strong> '+esc(custom?'Reavaliar após troca; não copiar cegamente a instrução do titular anterior.':p.individual_instruction)+'</p></article>';
 }).join('');
}
function render(){renderPitch();renderBench();renderNotes()}
function candidates(){
 const q=$('player-search').value.trim().toLocaleLowerCase('pt-BR');
 const allowed=roster.filter(c=>showAll||originallyFits(c,activeSlot));
 return allowed.filter(c=>!q||('#'+c.numero+' '+c.name+' '+c.estilo_ataque+' '+c.id+' '+c.posicao).toLocaleLowerCase('pt-BR').includes(q)).slice(0,70);
}
function refreshPicker(){
 const cards=candidates();$('player-count').textContent=cards.length>=70?'Até 70 resultados (refine a busca)':'Encontrados: '+cards.length;
 $('player-options').innerHTML=cards.length?cards.map(c=>{
 const used=Object.entries(current).find(([s,n])=>s!==activeSlot&&
 identity.key(byCap.get(Number(n)))===identity.key(c));
 const src=getImage(c.numero);
 const proof=positionTraining.status(c,wanted(activeSlot));
 return '<div class="ct-v246-choice"><button class="option" data-cap="'+c.numero+'" type="button" '+(used?'disabled':'')+'>'+
 (src?'<img src="'+esc(src)+'" alt="" loading="lazy"/>':'<span class="no-art">#'+c.numero+'</span>')+
 '<span><strong>#'+c.numero+' '+esc(c.name)+'</strong><small>'+esc(c.posicao)+' · '+esc(c.estilo_ataque)+' · '+esc(proof.label)+(used?' · JOGADOR JÁ EM CAMPO':'')+'</small></span></button>'+
 (proof.status==='não confirmada'?'<button type="button" class="ct-v246-training" data-v246-confirm="'+c.numero+'">Confirmar treino aplicado: '+esc(wanted(activeSlot))+'</button>':
  proof.status==='treinada'?'<button type="button" class="ct-v246-training" data-v246-remove="'+c.numero+'">Desfazer confirmação de '+esc(wanted(activeSlot))+'</button>':'')+'</div>';
 }).join(''):'<p>Nenhuma carta encontrada neste filtro.</p>';
 $('player-options').querySelectorAll('button[data-cap]').forEach(b=>b.onclick=()=>{
 if(canPick(activeSlot,Number(b.dataset.cap)))$('picker').close();
 });
 $('player-options').querySelectorAll('[data-v246-confirm],[data-v246-remove]').forEach(b=>b.onclick=()=>{
  const card=byCap.get(Number(b.dataset.v246Confirm||b.dataset.v246Remove));
  const enabled=!!b.dataset.v246Confirm;
  if(enabled&&!window.confirm('Você JÁ aplicou no eFootball o treino '+wanted(activeSlot)+
   ' na edição #'+card.numero+' de '+card.name+'? OVR alto NÃO confirma treino aplicado.'))return;
  try{
   positionTraining.confirm(card,wanted(activeSlot),enabled,localStorage);
   setStatus((enabled?'Treino confirmado: ':'Confirmação desfeita: ')+card.name+' · '+wanted(activeSlot));
   refreshPicker();render();
  }catch(error){setStatus('Não foi possível confirmar posição: '+error.message)}
 });
}
function openPicker(slot){activeSlot=slot;showAll=false;$('show-all').checked=false;$('player-search').value='';
 $('picker-title').textContent='Escolher jogador · '+SLOT_LABEL[slot];refreshPicker();
 if(typeof $('picker').showModal==='function')$('picker').showModal();else $('picker').setAttribute('open','');
 $('player-search').focus();
}
function renderStrategy(){
 $('strategy').innerHTML='<h2>Como jogar</h2><p>'+esc(plan.gameplan.possession)+'</p>'+
 '<div class="strategy-duo"><div><h3>Com a bola</h3><p>'+esc(plan.gameplan.attack)+'</p></div><div><h3>Sem a bola</h3><p>'+esc(plan.gameplan.defense)+'</p></div></div>'+
 '<h3>Instruções individuais sugeridas</h3><ul>'+plan.gameplan.individual_options.map(o=>'<li><b>'+esc(o.role)+':</b> '+esc(o.instruction)+'</li>').join('')+'</ul>'+
 '<p class="caution">'+esc(plan.gameplan.fluid_formation)+'</p>';
}
async function init(){
 const [rp,rc,rt]=await Promise.all([
 fetch('SCOUT_V176_POSSE_4312.json').then(r=>{if(!r.ok)throw Error('Plano indisponível');return r.json()}),
 fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('Catálogo offline indisponível');return r.json()}),
 fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>{if(!r.ok)throw Error('Artes indisponíveis');return r.json()})
 ]);
 if(rp.schema!=='SCOUT_V176_POSSE_4312'||rp.starter_slots.length!==11||rp.bench.length!==12||rc.cards.length!==246||rt.cartas.length!==246)throw Error('Catálogo ou plano incompleto');
 plan=rp;roster=rc.cards;byCap=new Map(roster.map(c=>[c.numero,c]));images=new Map(rt.cartas.map(c=>[c.numero,c.imagem]));
 base=Object.fromEntries(plan.starter_slots.map(x=>[x.slot,x.cap]));current={...base};
 try{const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(stored?.schema===plan.schema&&stored.slots&&typeof stored.slots==='object'){
  const vals={...base};for(const s of Object.keys(base))if(byCap.has(Number(stored.slots[s])))vals[s]=Number(stored.slots[s]);
  if(new Set(Object.values(vals)).size===11&&identity.unique(Object.values(vals).map(n=>byCap.get(n))))current=vals;
  else setStatus('Personalização com versões duplicadas de um jogador ignorada; formação original carregada.');
 }}catch(e){setStatus('Não foi possível carregar personalização anterior.')}
 $('catalog-count').textContent=roster.length+' cartas verificadas no índice • 11 titulares + 12 reservas';
 $('confidence-note').textContent=plan.confidence_explanation;
 renderStrategy();render();$('player-search').addEventListener('input',refreshPicker);
 $('show-all').addEventListener('change',e=>{showAll=e.target.checked;refreshPicker()});
 $('reset-team').addEventListener('click',()=>{if(!confirm('Restaurar os 11 titulares recomendados? Suas cartas e PP não serão alterados.'))return;current={...base};persist();render()});
 $('picker-close').addEventListener('click',()=>{$('picker').close?.()||$('picker').removeAttribute('open')});
 $('picker').addEventListener('click',e=>{if(e.target===$('picker'))$('picker').close?.()});
}
init().catch(e=>{setStatus('Não foi possível abrir a formação: '+e.message);$('catalog-count').textContent='Verifique os arquivos da versão instalada.'});
})();
