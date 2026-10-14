(()=>{'use strict';
const E=window.SCOUT_BOOSTERS_V103;
if(!E || !Array.isArray(E.CRAFTABLE)){document.body.textContent='Motor de ímpetos V104 indisponível.';return}
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let all=[],visible=[],selected=0,imageByNumber={},report=null;
const storage=c=>'scoutpro:v103:booster:'+c.numero;
function read(c){try{const saved=JSON.parse(localStorage.getItem(storage(c))||'null')||{};return saved.card_id&&String(saved.card_id)!==String(c.card_id)?{}:saved}catch(e){return {}}}
function statusText(c){
return ({selecionavel:'Esta edição tem indicação de slot selecionável, mas NÃO há confirmação se está vazio na sua conta.',
possivel:'Slot possivelmente selecionável: é necessário conferir no eFootball.',
nome_registrado:'Um ímpeto extra tem nome registrado no banco. Ocupação real e possibilidade de troca precisam de conferência.',
indefinido:'Sem evidência suficiente de slot adicional nesta edição. Não aplique Tokens antes de conferir.'})[c.status_slot_fonte]
}
function render(){
const c=visible[selected];$('counter').textContent=c?'Carta '+(selected+1)+' de '+visible.length:'Nenhuma carta para o filtro';
$('prev').disabled=selected===0;$('next').disabled=!c||selected>=visible.length-1;
if(!c){$('player-name').textContent='Nenhum resultado';$('tactics').replaceChildren();return}
$('player').value=String(c.numero);
$('art').src=imageByNumber[c.numero]||'';$('art').alt='Arte original de '+c.nome;
$('player-name').textContent='#'+c.numero+' · '+c.nome;
$('identity').textContent='Card ID: '+c.card_id+' · Posição: '+c.posicao+' · Estilo: '+c.estilo_ataque;
$('fixed').textContent='Ímpeto nativo registrado: '+c.impeto_fixo;
$('extra').textContent='Segundo ímpeto no banco: '+c.impeto_extra;
const reports={
 24:'Relato do usuário: Cristiano Ronaldo Big Time com dois ímpetos embutidos, sem edição.',
 81:'Relato do usuário: Rivaldo Big Time com um ímpeto fixo. O nome está pendente.',
 172:'Relato do usuário: Courtois possui um slot opcional. O cadastro ainda não comprova a disponibilidade.',
 236:"Relato do usuário: Eto'o possui ímpeto fixo + slot selecionável; nomes aguardam identificação."
};
$('evidence').textContent=statusText(c)+(reports[c.numero]?' '+reports[c.numero]:'');
const saved=read(c);
const realStatus=({pendente:'Não conferido',vazio:'CONFIRMADO VAZIO por você',ocupado:'CONFIRMADO OCUPADO por você',ausente:'Confirmado sem slot por você'})[saved.status]||'Não conferido';
$('slot-saved').textContent='Estado registrado nesta conta: '+realStatus+(saved.equipped?' · Atual: '+saved.equipped:'')+'.';
$('ficha').href=c.ficha;
const p=$('tactics');p.replaceChildren();
for(const [key,title] of [['posse','Posse de Bola'],['normal','Contra-Ataque Normal'],['rapido','Contra-Ataque Rápido']]){
const x=c.recomendacoes[key],node=document.createElement('article'),best=x[0];
node.innerHTML='<h3>'+title+'</h3><strong>'+safe(best.nome)+' +1</strong><p>'+safe(best.motivo)+'</p><p>Atributos: '+safe(best.atributos.join(', '))+'.</p><p>Alternativas: '+safe(x.slice(1).map(y=>y.nome).join(' / '))+'.</p>';
p.appendChild(node);
}
$('actual').value=['pendente','vazio','ocupado','ausente'].includes(saved.status)?saved.status:'pendente';
$('equipped').value=saved.equipped&&Object.hasOwn(E.BOOSTERS,saved.equipped)?saved.equipped:'';
$('note').value=saved.note||'';
$('planned').value=E.CRAFTABLE.includes(saved.planned)?saved.planned:'';
const recommendations=c.recomendacoes.posse;
const hasEvidence=saved.status==='vazio'||saved.status==='ocupado';
const equippedName=saved.equipped||'ainda não informado';
$('comparison').textContent=!hasEvidence?
 'Os ímpetos abaixo são hipóteses condicionais. Antes de usar tokens, confirme no jogo que esta edição tem um slot selecionável.' :
 saved.status==='vazio'?
 'Você confirmou um slot vazio. Compare os atributos finais, o técnico e a função antes de escolher '+recommendations[0].nome+'.' :
 'Você confirmou slot ocupado ('+equippedName+'). A recomendação é uma ALTERNATIVA DE TESTE, não autorização para substituir. Compare os quatro atributos e mantenha o atual se já atender melhor à build.';
$('choose-posse').disabled=saved.status==='ausente'||c.status_slot_fonte==='nome_registrado';
$('planned').disabled=c.status_slot_fonte==='nome_registrado';
if(c.status_slot_fonte==='nome_registrado')$('comparison').textContent='Já existe segundo ímpeto nomeado. Não presuma que ele seja selecionável ou substituível. Confira a edição na tela do jogo.';
$('feedback').textContent=saved.updated?'Verificação salva neste dispositivo.':'Ainda sem verificação local deste slot.';
}
function applyFilter(){
const q=$('search').value.trim().toLowerCase().replace('#',''),filter=$('filter').value;
visible=all.filter(c=>(filter==='all'||(filter==='verificado_vazio'&&read(c).status==='vazio')||(filter==='verificado_ocupado'&&read(c).status==='ocupado')||(filter==='verificado_ausente'&&read(c).status==='ausente')||c.status_slot_fonte===filter)&&(!q||(c.nome+' '+c.numero).toLowerCase().includes(q)));
selected=0;render();
}
function csv(){
const rows=[['Numero','Jogador','Card ID','Posicao','Estado da fonte','Estado verificado no aparelho','Impeto nativo','Impeto extra registrado','Impeto equipado informado','Impeto planejado','Posse','CA normal','CA rapido','Aviso']];
for(const c of all){const s=read(c);rows.push([c.numero,c.nome,c.card_id,c.posicao,c.status_slot_fonte,s.status||'pendente',c.impeto_fixo,c.impeto_extra,s.equipped||'',s.planned||'',c.recomendacoes.posse[0].nome,c.recomendacoes.normal[0].nome,c.recomendacoes.rapido[0].nome,'Hipotese nao validada; conferir disponibilidade real do slot']);}
const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});
const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='scout-pro-246-impetos-v103.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
}
$('search').addEventListener('input',applyFilter);$('filter').addEventListener('change',applyFilter);
$('player').addEventListener('change',()=>{const n=visible.findIndex(c=>String(c.numero)===$('player').value);if(n>=0){selected=n;render()}else{const c=all.find(x=>String(x.numero)===$('player').value);if(c){$('filter').value='all';$('search').value='';visible=all;selected=all.indexOf(c);render()}}});
$('prev').onclick=()=>{if(selected>0){selected--;render()}};
$('next').onclick=()=>{if(selected<visible.length-1){selected++;render()}};
$('save').onclick=()=>{const c=visible[selected];if(!c)return;const status=$('actual').value,equipped=status==='ocupado'?$('equipped').value:'',planned=$('planned').value;
if(planned&&!E.CRAFTABLE.includes(planned)){$('feedback').textContent='Escolha um dos ímpetos regulares selecionáveis.';return}
if(status==='ocupado'&&!equipped&&!confirm('O espaço foi marcado como ocupado, mas sem nome do ímpeto. Salvar assim mesmo?'))return;
try{localStorage.setItem(storage(c),JSON.stringify({card_id:c.card_id,status,equipped,planned,note:$('note').value.trim().slice(0,150),updated:new Date().toISOString(),source:'conferencia manual no eFootball'}));$('feedback').textContent='Estado salvo apenas neste dispositivo.';if(['verificado_vazio','verificado_ocupado','verificado_ausente'].includes($('filter').value)){applyFilter()}else if(selected<visible.length-1){selected++;render();}else render();refreshMetrics();}catch(e){$('feedback').textContent='Falha ao salvar: '+e.message}};
$('export').onclick=csv;
$('choose-posse').onclick=()=>{
 const c=visible[selected];if(!c||$('actual').value==='ausente')return;
 $('planned').value=c.recomendacoes.posse[0].nome;
 $('feedback').textContent='Sugestão preenchida como plano. Toque em Salvar e avançar; nada foi equipado no jogo.';
};
function refreshMetrics(){
 const verified=all.filter(c=>['vazio','ocupado','ausente'].includes(read(c).status));
 const empty=verified.filter(c=>read(c).status==='vazio').length;
 const occupied=verified.filter(c=>read(c).status==='ocupado').length;
 $('verification-metrics').textContent='Verificados por você neste dispositivo: '+verified.length+' / 246 · Slots vazios: '+empty+' · Ocupados: '+occupied+' · Sem slot: '+(verified.length-empty-occupied);
}
Promise.all([fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('auditoria V69 indisponível');return r.json()}),fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>{if(!r.ok)throw Error('auditoria V98 indisponível');return r.json()})]).then(([a,v])=>{
report=E.audit(a.cards);if(!Array.isArray(v.cartas)||v.cartas.length!==246)throw Error('Artes V98 incompletas');
for(const c of v.cartas){if(!c.imagem||!c.ficha)throw Error('Carta sem imagem/ficha: '+c.numero);imageByNumber[c.numero]=c.imagem}
all=report.cards;for(const c of all){if(!imageByNumber[c.numero])throw Error('Imagem não encontrada na auditoria: '+c.numero)}
$('metrics').innerHTML='<span><strong>246</strong> cartas auditadas</span><span><strong>'+report.summary.selecionavel+'</strong> slots selecionáveis indicados</span><span><strong>'+report.summary.possivel+'</strong> possíveis</span><span><strong>'+report.summary.nome_registrado+'</strong> ímpetos extra nomeados</span><span><strong>'+report.summary.indefinido+'</strong> pendentes</span>';
$('player').replaceChildren(...all.map(c=>{const o=document.createElement('option');o.value=c.numero;o.textContent='#'+c.numero+' '+c.nome;return o}));
refreshMetrics();applyFilter();
const requested=new URLSearchParams(location.search).get('c');if(requested){const i=all.findIndex(c=>String(c.numero)===requested);if(i>=0){selected=i;render()}}
}).catch(e=>{$('metrics').textContent='Não foi possível carregar a auditoria: '+e.message;});
for(const name of Object.keys(E.BOOSTERS)){const o=document.createElement('option');o.value=name;o.textContent=name;$('equipped').appendChild(o)}
for(const name of E.CRAFTABLE){const o=document.createElement('option');o.value=name;o.textContent=name;$('planned').appendChild(o)}
})();