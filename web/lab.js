
(function(){'use strict';
const el=document.getElementById('lab-data');if(!el)return;
const d=JSON.parse(el.textContent), cat=d.categories,box=document.getElementById('lab-controls'),status=document.getElementById('lab-stats');
const pps=n=>{let k=0;for(let i=0;i<n;i++)k+=1+Math.floor(i/4);return k};
const total=vec=>vec.reduce((s,n)=>s+pps(n),0);
const GROUP={'Consciência ofensiva':3,'Finalização':0,'Força do chute':4,'Aceleração':3,'Velocidade':4,'Controle de bola':2,'Drible':2,'Posse apertada':2,'Equilíbrio':3,'Contato físico':5,'Passe rasteiro':1,'Passe alto':1,'Resistência':4,'Cabeceio':5,'Salto':5,'Consciência defensiva':6,'Desarme':6,'Dedicação defensiva':6,'Agressividade':6,'Talento de GO':7,'Consciência do goleiro':7,'Salto GO':7,'Reflexos de GO':9,'Alcance do GO':8,'Defesa do GO':8,'Firmeza do GO':9,'Reflexos':9,'Alcance':8};
let current=(d[d.recommended]||d.A||Array(10).fill(0)).slice();let active=d.recommended||'A';
const $=id=>document.getElementById(id), safe=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const storageKey='scoutpro:v67:'+d.id+':'+d.card;
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&Array.isArray(saved.train)&&saved.train.length===10){current=saved.train.map(n=>Math.min(20,Math.max(0,Number(n)||0)));active='personalizado'}}catch(e){}
function persist(){try{localStorage.setItem(storageKey,JSON.stringify({train:current,updated:new Date().toISOString()}))}catch(e){}}
function render(){
 box.innerHTML='';
 current.forEach((n,i)=>{
  const row=document.createElement('div');row.className='lab-group';
  row.innerHTML='<label>'+safe(cat[i])+'</label><div class="lab-adjust"><button type="button" data-d="-1" aria-label="Diminuir '+safe(cat[i])+'">−</button><input type="number" min="0" max="20" value="'+n+'" aria-label="Níveis '+safe(cat[i])+'"><button type="button" data-d="1" aria-label="Aumentar '+safe(cat[i])+'">+</button></div><small>'+pps(n)+' PP</small>';
  const input=row.querySelector('input');input.disabled=d.pp===null;
  row.querySelectorAll('button').forEach(btn=>{btn.disabled=d.pp===null;btn.addEventListener('click',()=>{current[i]=Math.min(20,Math.max(0,current[i]+Number(btn.dataset.d)));active='personalizado';persist();render()})});
  input.addEventListener('change',()=>{current[i]=Math.min(20,Math.max(0,Math.round(Number(input.value)||0)));active='personalizado';persist();render()});box.appendChild(row)
 });
 const used=total(current); $('lab-budget').textContent=d.pp===null?'Sem orçamento':used+' / '+d.pp;
 const remaining=d.pp===null?null:d.pp-used; $('lab-remain').textContent=remaining===null?'—':remaining;
 $('lab-remain').className=remaining===null?'':remaining<0?'bad':'ok';
 $('lab-flag').textContent=d.pp===null?'Pendente':remaining<0?'PP excedidos':remaining===0?'Distribuição válida':'PP não alocados';
 $('lab-flag').className=d.pp===null?'':remaining<0?'bad':remaining===0?'ok':'';
 document.querySelectorAll('.lab-preset').forEach(b=>b.classList.toggle('active',active===b.dataset.load));
 if(!Object.keys(d.stats||{}).length){status.innerHTML='<h3>Atributos finais: pendentes</h3><p>Sem a base numérica da versão exata, não há como demonstrar os efeitos do treino nos atributos com segurança. Use os PP como hipótese e confirme a tela da carta antes de redefinir a progressão.</p>';return}
 const numeric=Object.entries(d.stats).map(([name,ref])=>({name,value:ref.base+current[GROUP[name]??0]+ref.boost+ref.mgr,reference:ref,level:current[GROUP[name]??0]}));
 status.innerHTML='<h3>Subtotais previstos — cenário '+safe(active)+'</h3><p>Base cadastrada + treino ajustado + ímpetos fixos documentados + bônus direto do técnico. Não inclui todos os efeitos de proficiência/condição do jogo.</p><div class="lab-stat-grid">'+numeric.map(x=>'<div class="lab-stat"><small>'+safe(x.name)+'</small><b>'+x.value+'</b><em>base '+x.reference.base+' + treino '+x.level+' + ímpetos '+x.reference.boost+' + técnico '+x.reference.mgr+'</em><span class="'+(x.value>=90?'':'review')+'">'+(x.value>=95?'Referência 95+':x.value>=90?'Referência 90+':x.value>=85?'Referência 85+':'Abaixo de 85')+'</span></div>').join('')+'</div>';
}
document.querySelectorAll('.lab-preset').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.load;if(Array.isArray(d[key])){active=key;current=d[key].slice();persist();render()}}));
$('lab-restore').addEventListener('click',()=>{active='A';current=(d.A||Array(10).fill(0)).slice();persist();render()});
$('lab-export').addEventListener('click',()=>{
 const lines=['SCOUT PRO V68 — '+d.name,'Card ID: '+d.id,'Posição: '+d.role,'Cenário: '+active,'PP: '+total(current)+' / '+(d.pp??'pendente'),...cat.map((c,i)=>c+': '+current[i]+' níveis ('+pps(current[i])+' PP)'), 'Subtotais não equivalem ao valor final em campo.'];
 const a=document.createElement('a'),u=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));a.href=u;a.download='Scout_'+d.id+'_treino.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)
});
const historyKey='scoutpro:v67:test:'+d.id+':'+d.card;
let history=[];try{history=JSON.parse(localStorage.getItem(historyKey)||'[]')}catch(e){}
function showHistory(){$('lab-history').innerHTML=history.slice(-5).reverse().map(x=>'<div class="lab-history-item"><b>'+safe(x.result)+'</b> · '+safe(x.when)+' · '+safe(x.plan)+' · '+x.goals+' '+safe(d.measureName.toLowerCase())+'<br>'+safe(x.note)+'</div>').join('')||'<p>Nenhuma partida registrada neste navegador.</p>'}
$('lab-save').addEventListener('click',()=>{const obs=$('lab-note').value.trim().slice(0,400),goals=Math.min(20,Math.max(0,Number($('lab-goals').value)||0));history.push({when:new Date().toLocaleDateString('pt-BR'),result:$('lab-result').value,goals,plan:active,note:obs});history=history.slice(-30);try{localStorage.setItem(historyKey,JSON.stringify(history))}catch(e){}$('lab-note').value='';showHistory()});
render();showHistory();
})();
