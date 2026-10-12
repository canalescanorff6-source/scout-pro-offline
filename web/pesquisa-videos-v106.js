(()=>{'use strict';const $=id=>document.getElementById(id),escape=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let cards=[],shown=[],at=0,arts={};
function filter(){const q=$('search').value.toLocaleLowerCase('pt-BR').trim().replace('#','');const state=$('filter').value;
shown=cards.filter(c=>(state==='all'||c.estado===state)&&(!q||[c.nome,c.numero,c.card_id,c.edicao].join(' ').toLocaleLowerCase('pt-BR').includes(q)));at=0;render()}
function render(){const c=shown[at];$('counter').textContent=c?'Carta '+(at+1)+' de '+shown.length:'Nenhuma carta encontrada';
$('prev').disabled=at<=0;$('next').disabled=at>=shown.length-1;
if(!c){$('name').textContent='Sem resultado';$('videos').textContent='';$('art').removeAttribute('src');return}
$('name').textContent='#'+String(c.numero).padStart(3,'0')+' · '+c.nome;
$('art').src=arts[c.numero]?.imagem||'';$('art').alt='Arte original de '+c.nome;
$('details').textContent='Edição: '+c.edicao+' | Card ID: '+c.card_id;
$('status').textContent=({'encontrado_por_pacote':'Há vídeos do mesmo pacote/campanha; Card ID no vídeo ainda não confirmado','candidato_sem_versao_confirmada':'Há vídeos do jogador, mas edição ainda não comprovada','pendente':'Ainda não há vídeo com correspondência suficiente'})[c.estado];
$('profile').href=arts[c.numero]?.ficha||'index.html';
const area=$('videos');area.replaceChildren();
if(!c.videos.length){const p=document.createElement('p');p.textContent='Nenhum vídeo classificado ainda para esta edição. Não usar outra carta como substituta.';area.appendChild(p)}
for(const v of c.videos){const div=document.createElement('div');div.className='video';const title=document.createElement('strong');title.textContent=v.criador+' · '+v.tipo_conteudo.replaceAll('_',' ');div.appendChild(title);
const why=document.createElement('p');why.textContent=v.descricao_evidencia;div.appendChild(why);
const type=document.createElement('small');type.textContent=v.compatibilidade==='pacote_compativel'?'Pacote correspondente · ID não validado': 'Candidato · edição não confirmada';div.appendChild(type);
const paragraph=document.createElement('p'),a=document.createElement('a');a.href=v.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir vídeo no YouTube ↗';paragraph.appendChild(a);div.appendChild(paragraph);area.appendChild(div)}
if(c.referencias_da_carta.length){const group=document.createElement('p');group.textContent='Referências complementares de identidade: ';area.appendChild(group);for(const url of c.referencias_da_carta){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Consultar fonte externa ↗';a.style.marginRight='12px';group.appendChild(a)}}
}
$('search').addEventListener('input',filter);$('filter').addEventListener('change',filter);
$('prev').onclick=()=>{if(at>0){at--;render()}};$('next').onclick=()=>{if(at<shown.length-1){at++;render()}};
Promise.all([fetch('SCOUT_V106_PESQUISA_VIDEOS.json').then(r=>{if(!r.ok)throw Error('pesquisa indisponível');return r.json()}),fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>r.json())])
.then(([ledger,visual])=>{if(ledger.cards?.length!==246||visual.cartas?.length!==246)throw Error('246 cartas não encontradas');cards=ledger.cards;for(const c of visual.cartas)arts[c.numero]={imagem:c.imagem,ficha:c.ficha};for(const c of cards)if(!arts[c.numero])throw Error('Arte da carta ausente: '+c.numero);
const s=ledger.summary;$('metrics').innerHTML='<div class="metric"><strong>'+s.total+'</strong><small>Cartas preservadas</small></div><div class="metric"><strong>'+s.com_video_pacote_compativel+'</strong><small>Pacote correspondente</small></div><div class="metric"><strong>'+s.com_apenas_candidatos+'</strong><small>Edição duvidosa</small></div><div class="metric"><strong>'+s.sem_video+'</strong><small>Sem vídeos</small></div><div class="metric"><strong>'+s.total_videos+'</strong><small>Links registrados</small></div>';
filter();const selected=Number(new URLSearchParams(location.search).get('c'));if(selected){const i=shown.findIndex(c=>c.numero===selected);if(i>=0){at=i;render()}}})
.catch(e=>{$('metrics').textContent='Falha ao carregar a pesquisa: '+e.message;$('counter').textContent='Confira os arquivos do app.'});
})();