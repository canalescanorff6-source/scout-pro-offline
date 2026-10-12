(()=>{'use strict';
const E=window.SCOUT_BOOSTERS_V103;
const $=id=>document.getElementById(id);
const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let all=[],visible=[],selected=0,imageByNumber={},report=null;
const storage=c=>'scoutpro:v103:booster:'+c.numero;
function read(c){try{return JSON.parse(localStorage.getItem(storage(c))||'null')||{}}catch(e){return {}}}
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
$('evidence').textContent=statusText(c);
$('ficha').href=c.ficha;
const p=$('tactics');p.replaceChildren();
for(const [key,title] of [['posse','Posse de Bola'],['normal','Contra-Ataque Normal'],['rapido','Contra-Ataque Rápido']]){
const x=c.recomendacoes[key],node=document.createElement('article'),best=x[0];
node.innerHTML='<h3>'+title+'</h3><strong>'+safe(best.nome)+' +1</strong><p>'+safe(best.motivo)+'</p><p>Atributos: '+safe(best.atributos.join(', '))+'.</p><p>Alternativas: '+safe(x.slice(1).map(y=>y.nome).join(' / '))+'.</p>';
p.appendChild(node);
}
const saved=read(c);$('actual').value=['pendente','vazio','ocupado','ausente'].includes(saved.status)?saved.status:'pendente';
$('equipped').value=saved.equipped&&Object.hasOwn(E.BOOSTERS,saved.equipped)?saved.equipped:'';
$('note').value=saved.note||'';
$('feedback').textContent=saved.updated?'Verificação salva neste dispositivo.':'Ainda sem verificação local deste slot.';
}
function applyFilter(){
const q=$('search').value.trim().toLowerCase().replace('#',''),filter=$('filter').value;
visible=all.filter(c=>(filter==='all'||c.status_slot_fonte===filter)&&(!q||(c.nome+' '+c.numero).toLowerCase().includes(q)));
selected=0;render();
}
function csv(){
const rows=[['Numero','Jogador','Card ID','Posicao','Estado da fonte','Estado verificado no aparelho','Impeto nativo','Impeto extra registrado','Impeto equipado informado','Posse','CA normal','CA rapido','Aviso']];
for(const c of all){const s=read(c);rows.push([c.numero,c.nome,c.card_id,c.posicao,c.status_slot_fonte,s.status||'pendente',c.impeto_fixo,c.impeto_extra,s.equipped||'',c.recomendacoes.posse[0].nome,c.recomendacoes.normal[0].nome,c.recomendacoes.rapido[0].nome,'Hipotese nao validada; conferir disponibilidade real do slot']);}
const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const blob=new Blob(['\uFEFF'+rows.map(r=>r.map(quote).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});
const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='scout-pro-246-impetos-v103.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
}
$('search').addEventListener('input',applyFilter);$('filter').addEventListener('change',applyFilter);
$('player').addEventListener('change',()=>{const n=visible.findIndex(c=>String(c.numero)===$('player').value);if(n>=0){selected=n;render()}else{const c=all.find(x=>String(x.numero)===$('player').value);if(c){$('filter').value='all';$('search').value='';visible=all;selected=all.indexOf(c);render()}}});
$('prev').onclick=()=>{if(selected>0){selected--;render()}};
$('next').onclick=()=>{if(selected<visible.length-1){selected++;render()}};
$('save').onclick=()=>{const c=visible[selected];if(!c)return;const status=$('actual').value,equipped=status==='ocupado'?$('equipped').value:'';
if(status==='ocupado'&&!equipped&&!confirm('O espaço foi marcado como ocupado, mas sem nome do ímpeto. Salvar assim mesmo?'))return;
try{localStorage.setItem(storage(c),JSON.stringify({status,equipped,note:$('note').value.trim().slice(0,150),updated:new Date().toISOString(),source:'conferencia manual no eFootball'}));$('feedback').textContent='Estado salvo apenas neste dispositivo.';if(selected<visible.length-1){selected++;render();}}catch(e){$('feedback').textContent='Falha ao salvar: '+e.message}};
$('export').onclick=csv;
Promise.all([fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('auditoria V69 indisponível');return r.json()}),fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>{if(!r.ok)throw Error('auditoria V98 indisponível');return r.json()})]).then(([a,v])=>{
report=E.audit(a.cards);if(!Array.isArray(v.cartas)||v.cartas.length!==246)throw Error('Artes V98 incompletas');
for(const c of v.cartas){if(!c.imagem||!c.ficha)throw Error('Carta sem imagem/ficha: '+c.numero);imageByNumber[c.numero]=c.imagem}
all=report.cards;for(const c of all){if(!imageByNumber[c.numero])throw Error('Imagem não encontrada na auditoria: '+c.numero)}
$('metrics').innerHTML='<span><strong>246</strong> cartas auditadas</span><span><strong>'+report.summary.selecionavel+'</strong> slots selecionáveis indicados</span><span><strong>'+report.summary.possivel+'</strong> possíveis</span><span><strong>'+report.summary.nome_registrado+'</strong> ímpetos extra nomeados</span><span><strong>'+report.summary.indefinido+'</strong> pendentes</span>';
$('player').replaceChildren(...all.map(c=>{const o=document.createElement('option');o.value=c.numero;o.textContent='#'+c.numero+' '+c.nome;return o}));
applyFilter();
const requested=new URLSearchParams(location.search).get('c');if(requested){const i=all.findIndex(c=>String(c.numero)===requested);if(i>=0){selected=i;render()}}
}).catch(e=>{$('metrics').textContent='Não foi possível carregar a auditoria: '+e.message;});
for(const name of Object.keys(E.BOOSTERS)){const o=document.createElement('option');o.value=name;o.textContent=name;$('equipped').appendChild(o)}
})();