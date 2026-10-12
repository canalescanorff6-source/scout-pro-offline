(()=>{
'use strict';
const E=window.SCOUT_TACTICS_V98;
if(!E){document.getElementById('counter').textContent='Motor tático indisponível.';return}
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let all=[],visible=[],selected=0,confirmed={};
const choicesKey='scoutpro:v98:tactical-reviews';
try{confirmed=JSON.parse(localStorage.getItem(choicesKey)||'{}')||{}}catch(e){confirmed={}}
const cost=E.cost;
const chart=levels=>E.names.map((name,i)=>levels[i]>0?esc(name)+': <b>'+levels[i]+'</b>':'').filter(Boolean).join(' · ');
function choose(card,key,plan){
 if(!plan.ok)return;
 if(!confirm('Guardar apenas neste dispositivo a hipótese para '+card.nome+' em '+E.tactics.find(t=>t.key===key).title+'? A build aprovada no GitHub não será alterada.'))return;
 confirmed[card.numero]=confirmed[card.numero]||{};
 confirmed[card.numero][key]={levels:plan.levels.slice(),source:'hipótese V98 não validada'};
 try{localStorage.setItem(choicesKey,JSON.stringify(confirmed));$('saved-status').textContent='Hipótese guardada apenas neste dispositivo. Faça backup em Meus dados.'}
 catch(e){$('saved-status').textContent='Não foi possível salvar neste dispositivo.'}
 render();
}
function render(){
 const card=visible[selected];
 $('counter').textContent=card?'Carta '+(selected+1)+' de '+visible.length+' · #'+card.numero:'Nenhuma carta encontrada';
 $('prev').disabled=!card||selected===0;$('next').disabled=!card||selected>=visible.length-1;
 if(!card){$('player-name').textContent='Sem resultados';$('tactics').replaceChildren();return}
 $('art').src=card.imagem;$('art').alt='Arte original de '+card.nome;
 $('art-caption').textContent='#'+card.numero+' · '+card.nome;
 $('player-name').textContent='#'+card.numero+' — '+card.nome;
 $('edition').textContent='Edição: '+card.edicao;
 $('identity').textContent='Card ID: '+card.card_id+' · Posição: '+card.posicao+' · PP: '+card.pp;
 $('style').textContent='Estilo de ataque: '+card.estilo_ataque+' · Defesa: '+card.estilo_defesa;
 const checks=$('checks');checks.replaceChildren();
 const status=document.createElement('p');
 status.textContent=card.referencia==='anterior'?'Treino anterior preservado (ainda sujeito a revisão).':'Treino proposto V95 preservado (não aprovado).';
 checks.appendChild(status);
 const bullet=document.createElement('ul');
 card.pendencias.forEach(p=>{const li=document.createElement('li');li.textContent=p;bullet.appendChild(li)});
 checks.appendChild(bullet);
 $('profile').href=card.ficha;
 const overview=E.comparison(card);
 $('previous').textContent=overview.previous?'Distribuição anteriormente registrada: '+E.names.map((n,i)=>overview.previous.levels[i]?n+' '+overview.previous.levels[i]:'').filter(Boolean).join(' · ')+' (PP '+overview.previous.used+'/'+card.pp+').':'Não há distribuição anterior aprovada. A proposta V95 permanece apenas experimental na ficha original.';
 const holder=$('tactics');holder.replaceChildren();
 overview.proposals.forEach(x=>{
  const panel=document.createElement('article');panel.className='tactic';
  const title=document.createElement('h3');title.textContent=x.title;panel.appendChild(title);
  const describe=document.createElement('p');describe.textContent=x.description;panel.appendChild(describe);
  const summary=document.createElement('p');summary.textContent=x.plan.ok?'PP '+x.plan.used+'/'+card.pp+' · hipótese não validada':x.plan.reason;panel.appendChild(summary);
  if(x.plan.ok){
   const details=document.createElement('div');details.className='levels';details.innerHTML=chart(x.plan.levels);panel.appendChild(details);
   const btn=document.createElement('button');btn.type='button';btn.className='action';btn.textContent='Guardar hipótese para teste';btn.onclick=()=>choose(card,x.key,x.plan);panel.appendChild(btn);
   const chosen=confirmed[card.numero]?.[x.key];
   if(chosen){const saved=document.createElement('p');saved.className='fine';saved.textContent='Hipótese guardada localmente · não validada';panel.appendChild(saved)}
  }
  holder.appendChild(panel);
 });
 const url=new URL(location.href);url.searchParams.set('c',String(card.numero));history.replaceState(null,'',url.pathname+url.search);
 $('saved-status').textContent='Compare o comportamento em partidas equivalentes antes de validar ou substituir qualquer treino.';
}
function refresh(){
 const text=$('search').value.trim().toLowerCase(),mode=$('filter').value;
 visible=all.filter(c=>(!text||(c.nome+' '+c.numero).toLowerCase().includes(text))&&
 (mode==='all'||mode==='missing'&&!c.base_stats_known||mode==='registered'&&c.referencia==='anterior'||mode==='preview'&&c.referencia==='experimental-v95'||mode==='complete'&&c.base_stats_known));
 selected=0;render();
}
$('search').addEventListener('input',refresh);
$('filter').addEventListener('change',refresh);
$('prev').onclick=()=>{if(selected>0){selected--;render()}};
$('next').onclick=()=>{if(selected<visible.length-1){selected++;render()}};
fetch('SCOUT_V98_AUDITORIA_TATICA.json').then(r=>{if(!r.ok)throw Error('Arquivo de auditoria indisponível');return r.json()}).then(data=>{
 if(data.version!=='V98'||data.cartas.length!==246)throw Error('Auditoria incompleta');
 all=data.cartas;
 const stats=[['Cartas',246],['Com PP',all.filter(c=>Number.isInteger(c.pp)).length],['Treinos anteriores',all.filter(c=>c.treino_anterior).length],['Propostas V95',all.filter(c=>!c.treino_anterior).length],['Base cadastrada',all.filter(c=>c.base_stats_known).length]];
 const box=$('metrics');stats.forEach(([name,num])=>{const m=document.createElement('div');m.className='metric';m.innerHTML='<b>'+num+'</b><small>'+name+'</small>';box.appendChild(m)});
 const requested=new URLSearchParams(location.search).get('c');
 refresh();
 const index=all.findIndex(c=>String(c.numero)===String(requested));
 if(index>=0){selected=index;render()}
}).catch(error=>{$('counter').textContent='Falha ao carregar auditoria: '+error.message});
})();