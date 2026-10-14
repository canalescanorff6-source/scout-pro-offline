(()=>{'use strict';
const $=id=>document.getElementById(id);
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const LABEL={go:'GO',le:'LE',zge:'ZG E',zgd:'ZG D',ld:'LD',vole:'VOL E',vold:'VOL D',mlg:'MLG',mat:'MAT',sa:'SA',cae:'CA E',cad:'CA D'};
const POSITION={GR:'GO',GO:'GO',DD:'LD',LD:'LD',DE:'LE',LE:'LE',DC:'ZG',ZC:'ZG',ZG:'ZG',MDF:'VOL',VOL:'VOL',MC:'MLG',ME:'MLG',MLG:'MLG',MO:'MAT',MAT:'MAT',AC:'CA',CA:'CA',SA:'SA'};
let doc=null,roster=[],byCap=new Map(),imageMap=new Map(),activeId='4312',allSelections={},editingSlot=null,showAll=false;
const active=()=>doc.formations.find(f=>f.id===activeId);
const roles=slot=>slot==='zge'||slot==='zgd'?'ZG':slot==='cae'||slot==='cad'?'CA':slot==='vole'||slot==='vold'?'VOL':LABEL[slot]?.split(' ')[0];
const fits=(card,slot)=>POSITION[card?.posicao]===roles(slot);
const getImage=cap=>imageMap.get(Number(cap))||'';
const esc=escapeHtml;
function setStatus(s){$('status').textContent=s}
function storedKey(id){return 'scoutpro:v177:minhas-duas-formacoes:'+id}
function slotsFor(f){return Object.fromEntries(f.starters.map(s=>[s.slot,s.cap]))}
function readSaved(f){const defaults=slotsFor(f);try{
 const v=JSON.parse(localStorage.getItem(storedKey(f.id))||'null');
 if(!v||v.schema!==doc.schema||!v.slots)return defaults;
 const next={...defaults};
 for(const [slot,n] of Object.entries(v.slots))if(Object.hasOwn(defaults,slot)&&byCap.has(Number(n)))next[slot]=Number(n);
 return new Set(Object.values(next)).size===11?next:defaults;
 }catch(e){return defaults}}
function save(){
 try{localStorage.setItem(storedKey(activeId),JSON.stringify({schema:doc.schema,slots:allSelections[activeId]}));
 setStatus('Troca salva localmente para esta formação. O treino, as cartas e a outra formação continuam inalterados.');
 }catch(e){setStatus('Troca aplicada nesta sessão; não foi possível salvar no dispositivo.')}
}
function switchFormation(id){if(!doc.formations.some(f=>f.id===id))return;
 activeId=id;document.querySelectorAll('[data-formation]').forEach(b=>{
 const on=b.dataset.formation===id;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on))});
 $('formation-label').textContent='Campo · '+active().title;
 $('formation-details').textContent=active().layout_label+' · '+active().description;
 render();
}
function assign(slot,cap){const c=byCap.get(Number(cap));if(!c||!Object.hasOwn(allSelections[activeId],slot)){setStatus('Escolha indisponível.');return false}
 if(Object.entries(allSelections[activeId]).some(([s,n])=>s!==slot&&Number(n)===Number(cap))){
 setStatus('A carta #'+cap+' já está escalada nesta formação; escolha outra ou desocupe a posição.');return false}
 allSelections[activeId][slot]=Number(cap);save();render();return true;
}
function makePlayer(slot){const c=byCap.get(Number(allSelections[activeId][slot]));const original=active().starters.find(s=>s.slot===slot);
 if(!c||!original)return '';
 const changed=c.numero!==original.cap;
 const eligible=fits(c,slot);
 return '<button class="p-slot '+(changed?'swapped ':'')+(!eligible?'offrole':'')+'" type="button" data-slot="'+esc(slot)+'" title="Trocar jogador em '+esc(LABEL[slot])+'">'+
 '<span class="p-role">'+esc(LABEL[slot])+'</span>'+
 (getImage(c.numero)?'<img src="'+esc(getImage(c.numero))+'" alt="Arte original de '+esc(c.name)+'" loading="lazy"/>':'')+
 '<span class="p-name">'+esc(c.name)+'</span>'+
 '<span class="p-cap">#'+c.numero+' · '+esc(c.estilo_ataque)+'</span>'+
 '<span class="p-trust">'+(eligible?'Posição original compatível':'Fora da posição original')+(changed?' · troca manual':'')+'</span></button>';
}
function renderPitch(){
 $('pitch').innerHTML=active().rows.map(row=>'<div class="pitch-row">'+row.map(makePlayer).join('')+'</div>').join('');
 $('pitch').querySelectorAll('button[data-slot]').forEach(b=>b.onclick=()=>openPicker(b.dataset.slot));
 const originals=slotsFor(active()),changed=Object.keys(originals).filter(s=>originals[s]!==allSelections[activeId][s]).length;
 $('custom-badge').textContent=changed?changed+' troca(s) nesta formação':'Formação original restaurada';
}
function checkLink(rule){
 const f=active(),slots=allSelections[activeId];
 const yes=(role,style)=>f.starters.some(s=>s.role===role&&normalized(byCap.get(Number(slots[s.slot]))?.estilo_ataque)===normalized(style));
 return {a:yes(rule.role_a,rule.style_a),b:yes(rule.role_b,rule.style_b)};
}
function renderLink(){
 const rules=doc.link_requirements.map(rule=>{
 const v=checkLink(rule),ok=v.a&&v.b;
 return '<article class="link-row"><span class="link-indicator '+(ok?'filled':'missing')+'">'+(ok?'Requisitos encontrados':'Requisitos incompletos')+'</span><strong>'+esc(rule.label)+'</strong>'+
 '<small>'+esc(rule.role_a)+': '+(v.a?'estilo presente':'estilo ausente')+' · '+esc(rule.role_b)+': '+(v.b?'estilo presente':'estilo ausente')+'</small></article>';
 });
 $('linkup').innerHTML='<h2>R. Rodríguez · Link-Up</h2><p class="hint">Comparação com os dois vínculos registrados no seu planejamento. Estilos e posições são checados no catálogo, mas a ativação real do Link-Up só pode ser confirmada dentro do jogo.</p>'+
 rules.join('')+'<p class="caution">Não interprete “requisitos encontrados” como bônus ativo. Confira o indicador no Plano de Jogo, além da familiaridade posicional e o estilo efetivamente ativado.</p>';
}
function renderInstructions(){
 const f=active(),slots=allSelections[activeId],modified=Object.keys(slots).some(s=>slots[s]!==slotsFor(f)[s]);
 $('analysis').innerHTML='<h2>Funções individuais · '+esc(f.title)+'</h2>'+
 '<p class="caution">'+(modified?'O elenco foi alterado manualmente. Reavalie os jogadores substitutos; instruções antigas não são automaticamente válidas.':'Instruções de movimentação recomendadas para as escolhas registradas; não são comandos instalados no jogo.')+'</p>'+
 f.starters.map(s=>{
 const now=byCap.get(Number(slots[s.slot]));const changed=now.numero!==s.cap;
 return '<article class="note"><b>'+esc(LABEL[s.slot])+' · #'+now.numero+' '+esc(now.name)+'</b>'+
 '<small>Ofensivo: '+esc(now.estilo_ataque)+' · Defensivo: '+esc(now.estilo_defesa)+' · '+(changed?'Escolha manual':'Escolha histórica')+'</small>'+
 '<p>'+esc(changed?'Confirmar encaixe de posição, habilidades, ímpeto e comportamento em jogo antes de manter.':s.role_instruction)+'</p>'+
 (fits(now,s.slot)?'':'<p class="caution">Fora da posição original do catálogo: validar familiaridade no Plano de Jogo.</p>')+'</article>';
 }).join('');
}
function renderBench(){
 $('bench').innerHTML=active().bench.map(c=>{
 const now=byCap.get(c.cap);const selected=Object.values(allSelections[activeId]).includes(c.cap);
 return '<article class="bench-card"><img alt="Arte original '+esc(c.name)+'" src="'+esc(c.art)+'" loading="lazy"/>'+
 '<div class="bench-details"><strong>#'+c.cap+' '+esc(c.name)+'</strong><small>'+esc(c.original_pos)+' · '+esc(c.atk)+'</small>'+
 '<p>Alternativa por função; confira familiaridade, estilo e habilidades.</p><a href="'+esc(c.card_page)+'">Abrir ficha original ↗</a></div>'+
 '<div class="bench-action"><label for="bench-'+c.cap+'">'+(selected?'Em campo':'Colocar reserva em campo')+'</label><select id="bench-'+c.cap+'" data-bench="'+c.cap+'"><option value="">Selecionar posição…</option>'+
 active().starters.map(s=>'<option value="'+esc(s.slot)+'">'+esc(LABEL[s.slot])+'</option>').join('')+'</select></div></article>';
 }).join('');
 $('bench').querySelectorAll('select[data-bench]').forEach(sel=>sel.addEventListener('change',()=>{
 if(sel.value)assign(sel.value,Number(sel.dataset.bench));sel.value='';
 }));
}
function render(){renderPitch();renderLink();renderInstructions();renderBench()}
function choices(){
 const term=normalized($('player-search').value);const candidates=roster.filter(c=>showAll||fits(c,editingSlot));
 return candidates.filter(c=>!term||normalized('#'+c.numero+' '+c.name+' '+c.posicao+' '+c.estilo_ataque+' '+c.id).includes(term)).slice(0,70);
}
function renderPicker(){
 const list=choices();$('player-count').textContent='Mostrando '+list.length+' resultado(s)'+(list.length===70?' — refine a busca':'');
 $('player-options').innerHTML=list.length?list.map(c=>{
 const busy=Object.entries(allSelections[activeId]).find(([s,cap])=>s!==editingSlot&&cap===c.numero);
 return '<button type="button" class="option" data-cap="'+c.numero+'"'+(busy?' disabled':'')+'>'+
 (getImage(c.numero)?'<img src="'+esc(getImage(c.numero))+'" alt="" loading="lazy"/>':'<span class="no-art">#'+c.numero+'</span>')+
 '<span><strong>#'+c.numero+' '+esc(c.name)+'</strong><small>'+esc(c.posicao)+' · '+esc(c.estilo_ataque)+(busy?' · EM CAMPO':'')+'</small></span></button>';
 }).join(''):'<p>Não encontrei cartas para esse filtro.</p>';
 $('player-options').querySelectorAll('button[data-cap]').forEach(b=>b.onclick=()=>{if(assign(editingSlot,Number(b.dataset.cap)))closePicker()});
}
function openPicker(slot){editingSlot=slot;showAll=false;$('show-all').checked=false;$('player-search').value='';
 $('picker-title').textContent='Escolher jogador — '+LABEL[slot];renderPicker();
 if(typeof $('picker').showModal==='function')$('picker').showModal();else $('picker').setAttribute('open','');
 $('player-search').focus();
}
function closePicker(){if(typeof $('picker').close==='function')$('picker').close();else $('picker').removeAttribute('open')}
async function init(){
 const [d,r,a]=await Promise.all([
 fetch('SCOUT_V177_DUAS_FORMACOES.json').then(x=>{if(!x.ok)throw Error('Plano indisponível');return x.json()}),
 fetch('SCOUT_V69_AUDITORIA.json').then(x=>{if(!x.ok)throw Error('Elenco indisponível');return x.json()}),
 fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(x=>{if(!x.ok)throw Error('Artes indisponíveis');return x.json()})
 ]);
 if(d.schema!=='SCOUT_V177_DUAS_FORMACOES_ESCOLHIDAS'||d.formations.length!==2||r.cards.length!==246||a.cartas.length!==246)throw Error('Versão incompleta da escalação');
 doc=d;roster=r.cards;byCap=new Map(roster.map(x=>[x.numero,x]));imageMap=new Map(a.cartas.map(x=>[x.numero,x.imagem]));
 for(const f of doc.formations)allSelections[f.id]=readSaved(f);
 $('catalog-count').textContent='246 cartas · 2 formações personalizadas';
 $('formation-pick').querySelectorAll('[data-formation]').forEach(b=>b.onclick=()=>switchFormation(b.dataset.formation));
 $('reset-team').onclick=()=>{if(!confirm('Restaurar titulares da formação selecionada? Não altera as cartas originais.'))return;allSelections[activeId]=slotsFor(active());save();render()};
 $('player-search').oninput=renderPicker;$('show-all').onchange=e=>{showAll=e.target.checked;renderPicker()};
 $('picker-close').onclick=closePicker;$('picker').addEventListener('click',e=>{if(e.target===$('picker'))closePicker()});
 switchFormation('4312');
}
init().catch(err=>{setStatus('Não foi possível carregar as duas formações: '+err.message);$('catalog-count').textContent='Confira se a atualização foi instalada.'});
})();
