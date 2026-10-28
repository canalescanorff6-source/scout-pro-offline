
(function(){'use strict';
/* V94 — Experimental previews only: never stamp speculative builds into card JSON. */
const PREVIEW_WEIGHTS={
CA:[10,6,8,11,9,5,0,0,0,0],SA:[6,9,10,10,8,2,0,0,0,0],
MAT:[3,11,10,10,7,1,2,0,0,0],MLG:[2,11,8,8,8,3,7,0,0,0],
VOL:[0,9,5,4,7,6,11,0,0,0],ZG:[0,5,1,2,8,9,12,0,0,0],
LD:[0,7,6,7,9,5,9,0,0,0],LE:[0,7,6,7,9,5,9,0,0,0],
GO:[0,0,0,0,3,0,0,10,11,11],
PTD:[3,8,10,10,10,1,0,0,0,0],PTE:[3,8,10,10,10,1,0,0,0,0],
MLD:[2,9,9,9,8,2,5,0,0,0],MLE:[2,9,9,9,8,2,5,0,0,0]
};
const PREVIEW_POSITIONS={AC:'CA',DC:'ZG',ZC:'ZG',MC:'MLG',MDF:'VOL',GR:'GO',DD:'LD',DE:'LE',MO:'MAT'};
const previewCost=vec=>vec.reduce((sum,n)=>{for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);return sum},0);
const previewValid=vec=>Array.isArray(vec)&&vec.length===10&&vec.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
const normalizeEvidence=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-_]/g,' ');
const isKeeper=(role)=>['GO','GR','GK'].includes(String(role).toUpperCase());
/* V207: evidência é apenas habilidade NATIVA e ímpeto FIXO documentados da carta.
   Nada de nome, ID, overall, sorteio ou estatística ausente para forçar builds distintas. */
function individualWeights(role,style,evidence){
 const p=PREVIEW_POSITIONS[role]||role;
 const delta=Array(10).fill(0),signals=[];
 const e=evidence||{},skills=normalizeEvidence(e.native_skills);
 const boost=normalizeEvidence(e.boost1);
 const keeper=isKeeper(role);
 const rules=keeper?[
  [/gk penalty saver|gk spirit roar/,'defesa de pênaltis / comando do gol',9,3],
  [/gk high punt|gk long throw/,'reposição longa',7,3],
  [/gk low punt|gk directing defence/,'reposição baixa / organização',8,3]
 ]:[
  [/one ?touch pass|one touch pass|passe de primeira/,'passe de primeira',1,3],
  [/through passing|passe em profundidade/,'passe em profundidade',1,4],
  [/weighted pass|phenomenal pass|visionary pass|passe ponderado/,'passe na medida',1,4],
  [/double touch|sole control|cut behind|chop turn|toque duplo|controle com a sola/,'controle/drible',2,5],
  [/long.range shooting|knuckle shot|rising shot|dipping shot|phenomenal finishing/,'finalização técnica',0,4],
  [/first.time shot|first time shot|acrobatic finishing/,'conclusão rápida',0,3],
  [/aerial superiority|heading|cabeçada/,'jogo aéreo',5,5],
  [/blocker|interception|man marking|sliding tackle|fortress/,'defesa e cobertura',6,5],
  [/track back|fighting spirit/,'apoio e retorno',6,2]
 ];
 for(const [re,title,i,weight] of rules)if(re.test(skills)){
  delta[i]+=weight;signals.push(title);
 }
 const boosters=keeper?[
  [/goalkeeping|saving/,'ímpeto de goleiro documentado',8,5]
 ]:[
  [/passing|regista/,'ímpeto fixo de passe',1,6],
  [/physicality|strength/,'ímpeto fixo físico',5,6],
  [/aerial/,'ímpeto fixo aéreo',5,7],
  [/striker.s instinct|shooting|accuracy/,'ímpeto fixo de finalização',0,5],
  [/breakthrough|ball.carrying/,'ímpeto fixo de condução',3,6],
  [/balancer|technique|ball protection/,'ímpeto fixo de controle',2,5],
  [/defending|shutdown|duelling/,'ímpeto fixo defensivo',6,6]
 ];
 if(boost&&!/pendente|nao confirmado|nenhum fixo|slot selecionavel|ausente/.test(boost)){
  for(const [re,title,i,weight] of boosters)if(re.test(boost)){
   delta[i]+=weight;signals.push(title);break;
  }
 }
 // Impedir categorias incompatíveis: GO só varia entre goleiro 1/2/3;
 // jogador de linha nunca recebe níveis de goleiro por evidência.
 for(let i=0;i<10;i++)if((keeper&&i<7)||(!keeper&&i>=7))delta[i]=0;
 return {delta,signals,confidence:signals.length>=3?'comparativa_limitada':'baixa'};
}
function suggestIndividualPreview(pp,role,style,evidence){
 const e=individualWeights(role,style,evidence);
 const result=suggestPreview(pp,role,style,e.delta);
 return {...result,signals:e.signals,confidence:e.confidence,
  reason:e.signals.length?'Diferenças observáveis em habilidades nativas/ímpeto fixo; treino experimental, atributos-base não confirmados.':
  'Sem diferença documental suficiente para personalizar com segurança; hipótese por posição e estilo.'};
}
function suggestPreview(pp,role,style,extraWeights){

 if(!Number.isInteger(pp)||pp<0||pp>238)throw Error('Orçamento de PP inválido');
 const position=PREVIEW_POSITIONS[role]||role;
 const w=(PREVIEW_WEIGHTS[position]||PREVIEW_WEIGHTS.MLG).slice();
 if(Array.isArray(extraWeights)&&extraWeights.length===10){
  for(let i=0;i<10;i++)if(Number.isFinite(extraWeights[i])&&w[i]>0)w[i]+=Math.max(0,Math.min(20,extraWeights[i]));
 }
 if(/artilheiro|matador|oportunista|homem de área|puxa marcação/i.test(style||'')){w[0]+=3;w[3]+=2}
 if(/primeiro volante|destruidor/i.test(style||''))w[6]+=3;
 if(/armador|orquestrador|clássico/i.test(style||''))w[1]+=2;
 const vec=Array(10).fill(0);let remaining=pp;
 while(remaining>0){
  let pick=-1,best=-Infinity;
  for(let i=0;i<10;i++){
   const inc=1+Math.floor(vec[i]/4);
   if(w[i]===0||vec[i]>=20||inc>remaining)continue;
   const score=w[i]/(1+0.5*(inc-1))-0.11*vec[i];
   if(score>best){best=score;pick=i}
  }
  if(pick<0)break;
  remaining-=1+Math.floor(vec[pick]/4);vec[pick]++;
 }
 // Small exact-budget repair: exchange one point between relevant categories.
 // Unlike allocating to a goalkeeper statistic, this keeps the player's role.
 if(remaining>0){
  let best=null;
  for(let i=0;i<10;i++){
   if(w[i]===0||vec[i]===0)continue;
   const refund=1+Math.floor((vec[i]-1)/4);
   for(let j=0;j<10;j++){
    if(i===j||w[j]===0||vec[j]>=20)continue;
    const spend=1+Math.floor(vec[j]/4);
    if(spend!==refund+remaining)continue;
    const score=w[j]/spend-w[i]/refund;
    if(!best||score>best.score)best={i,j,score};
   }
  }
  if(best){vec[best.i]--;vec[best.j]++;remaining=0}
 }
 if(!previewValid(vec)||previewCost(vec)+remaining!==pp)throw Error('Prévia de PP inconsistente');
 return {vec,spent:previewCost(vec),remaining,position,provisional:true};
}
if(typeof module==='object'&&module.exports)module.exports={suggestPreview,previewCost,previewValid,suggestIndividualPreview,individualWeights};
if(typeof document==='undefined')return;
window.SCOUT_TRAINING_V207=Object.freeze({suggestIndividualPreview,previewCost,previewValid,individualWeights});
document.dispatchEvent(new CustomEvent('scoutpro:individual-engine-ready'));
const el=document.getElementById('lab-data');if(!el)return;
const d=JSON.parse(el.textContent), cat=d.categories,box=document.getElementById('lab-controls'),status=document.getElementById('lab-stats');
const cardCap=Number.parseInt(d.card,10);
function refreshPersonalPP(){
 if(d.pp!==null)return;
 try{const p=JSON.parse(localStorage.getItem('scoutpro:v81:pp:'+cardCap)||'null');
 if(p?.cap===cardCap&&p.name===d.name&&Number.isInteger(p.level)&&p.level>=1&&p.level<=120&&p.pp===2*(p.level-1))d.pp=p.pp;
 }catch(e){}
}
refreshPersonalPP();
const pps=n=>{let k=0;for(let i=0;i<n;i++)k+=1+Math.floor(i/4);return k};
const total=vec=>vec.reduce((s,n)=>s+pps(n),0);
const GROUP={'Consciência ofensiva':3,'Finalização':0,'Força do chute':4,'Aceleração':3,'Velocidade':4,'Controle de bola':2,'Drible':2,'Posse apertada':2,'Equilíbrio':3,'Contato físico':5,'Passe rasteiro':1,'Passe alto':1,'Resistência':4,'Cabeceio':5,'Salto':5,'Consciência defensiva':6,'Desarme':6,'Dedicação defensiva':6,'Agressividade':6,'Talento de GO':7,'Consciência do goleiro':7,'Salto GO':7,'Reflexos de GO':9,'Alcance do GO':8,'Defesa do GO':8,'Firmeza do GO':9,'Reflexos':9,'Alcance':8};
const hasDocumentedBuild=previewValid(d[d.recommended])||previewValid(d.A)||previewValid(d.B)||previewValid(d.C);
const previewEligible=!hasDocumentedBuild&&Number.isInteger(d.pp)&&d.pp>=0;
const generate=()=>previewValid(d.draftA)&&previewCost(d.draftA)===d.pp
 ? {vec:d.draftA.slice(),spent:d.pp,remaining:0,provisional:true,source:'Ficha individual V95'}
 : suggestPreview(d.pp,d.role,d.style);
const firstPreview=previewEligible?generate():null;
let current=(previewValid(d[d.recommended])?d[d.recommended]:previewValid(d.A)?d.A:firstPreview?firstPreview.vec:Array(10).fill(0)).slice();
let active=firstPreview?'prévia experimental':(d.recommended||'A');
const $=id=>document.getElementById(id), safe=text=>String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const storageKey='scoutpro:v67:'+d.id+':'+d.card;
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(previewValid(saved?.train)&&d.pp!==null&&previewCost(saved.train)<=d.pp){
  const oldEmpty=previewEligible&&d.pp>0&&saved.train.every(n=>n===0)&&!saved.source;
  if(!oldEmpty){current=saved.train.slice();active='personalizado'}
 }
}catch(e){}
function persist(){
 if(d.pp===null||!previewValid(current)||previewCost(current)>d.pp)return false;
 try{
  localStorage.setItem(storageKey,JSON.stringify({train:current,updated:new Date().toISOString(),source:'treino pessoal editado pelo usuário'}));
  return true;
 }catch(e){return false}
}
if(previewEligible){
 const warning=document.createElement('section');warning.id='scout-preview-v95';warning.setAttribute('role','status');
 warning.style.cssText='padding:12px 14px;margin:10px 0;border:1px solid #3c7093;border-radius:12px;background:#102638;color:#e4f4ff;font-size:13px;line-height:1.5';
 const explain=document.createElement('p');explain.textContent=d.pp===0?
  'Esta carta tem 0 PP confirmados: não há pontos a distribuir.':
  'TREINO FUNCIONAL · '+d.pp+'/'+d.pp+' PP conferidos. É uma hipótese de rendimento a testar em campo; confira atributos, habilidades e ímpetos antes de adotar.';
 warning.appendChild(explain);
 if(d.pp>0){
  const button=document.createElement('button');button.type='button';button.id='scout-preview-save-v94';
  button.textContent='Salvar como meu treino de teste';
  button.addEventListener('click',()=>{
   if(!confirm('Salvar somente neste dispositivo esta distribuição experimental? Ela não altera a build aprovada do GitHub.'))return;
   if(persist()){active='personalizado';explain.textContent='Treino de teste salvo neste dispositivo. Você pode continuar ajustando; a build oficial não foi modificada.';render()}
   else explain.textContent='Não foi possível salvar: confira o orçamento e o armazenamento local.';
  });
  warning.appendChild(button);
 }
 const controls=document.getElementById('lab-controls');
 controls.parentNode.insertBefore(warning,controls);
 const restore=document.getElementById('lab-restore');
 if(restore)restore.textContent=d.pp===0?'Restaurar distribuição zerada':'Carregar treino proposto da ficha';
}
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
 $('lab-flag').textContent=d.pp===null?'Pendente':remaining<0?'PP excedidos':(active==='prévia experimental'||active==='prévia de cenário')&&d.pp>0?'PP corretos · testar em campo':remaining===0?'Distribuição válida':'PP não alocados';
 $('lab-flag').className=d.pp===null?'':remaining<0?'bad':remaining===0?'ok':'';
 document.querySelectorAll('.lab-preset').forEach(b=>b.classList.toggle('active',active===b.dataset.load));
 // V218: a tabela principal utiliza o mesmo rascunho local que o Laboratório.
 window.dispatchEvent(new CustomEvent('scoutpro:lab-changed-v218',{detail:{
  cap:cardCap,card_id:String(d.id),levels:current.slice(),scenario:active,pp:d.pp
 }}));
 if(!Object.keys(d.stats||{}).length){status.innerHTML='<h3>Atributos finais: pendentes</h3><p>Sem a base numérica da versão exata, não há como demonstrar os efeitos do treino nos atributos com segurança. Use os PP como hipótese e confirme a tela da carta antes de redefinir a progressão.</p>';return}
 const numeric=Object.entries(d.stats).map(([name,ref])=>({name,value:ref.base+current[GROUP[name]??0]+ref.boost+ref.mgr,reference:ref,level:current[GROUP[name]??0]}));
 status.innerHTML='<h3>Subtotais previstos — cenário '+safe(active)+'</h3><p>Base cadastrada + treino ajustado + ímpetos fixos documentados + bônus direto do técnico. Não inclui todos os efeitos de proficiência/condição do jogo.</p><div class="lab-stat-grid">'+numeric.map(x=>'<div class="lab-stat"><small>'+safe(x.name)+'</small><b>'+x.value+'</b><em>base '+x.reference.base+' + treino '+x.level+' + ímpetos '+x.reference.boost+' + técnico '+x.reference.mgr+'</em><span class="'+(x.value>=90?'':'review')+'">'+(x.value>=95?'Referência 95+':x.value>=90?'Referência 90+':x.value>=85?'Referência 85+':'Abaixo de 85')+'</span></div>').join('')+'</div>';
}
document.querySelectorAll('.lab-preset').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.load;if(Array.isArray(d[key])){active=key;current=d[key].slice();persist();render()}}));
$('lab-restore').addEventListener('click',()=>{
 if(previewEligible){current=generate().vec.slice();active='prévia experimental';render();return;}
 active=Array.isArray(d.A)?'A':'personalizado';
 current=(d.A||Array(10).fill(0)).slice();persist();render()
});
$('lab-export').addEventListener('click',()=>{
 const lines=['SCOUT PRO V68 — '+d.name,'Card ID: '+d.id,'Posição: '+d.role,'Cenário: '+active,'PP: '+total(current)+' / '+(d.pp??'pendente'),...cat.map((c,i)=>c+': '+current[i]+' níveis ('+pps(current[i])+' PP)'), 'Subtotais não equivalem ao valor final em campo.'];
 const a=document.createElement('a'),u=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}));a.href=u;a.download='Scout_'+d.id+'_treino.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)
});
const historyKey='scoutpro:v67:test:'+d.id+':'+d.card;
let history=[];try{history=JSON.parse(localStorage.getItem(historyKey)||'[]')}catch(e){}
function showHistory(){$('lab-history').innerHTML=history.slice(-5).reverse().map(x=>'<div class="lab-history-item"><b>'+safe(x.result)+'</b> · '+safe(x.when)+' · '+safe(x.plan)+' · '+x.goals+' '+safe(d.measureName.toLowerCase())+'<br>'+safe(x.note)+'</div>').join('')||'<p>Nenhuma partida registrada neste navegador.</p>'}
$('lab-save').addEventListener('click',()=>{const obs=$('lab-note').value.trim().slice(0,400),goals=Math.min(20,Math.max(0,Number($('lab-goals').value)||0));history.push({when:new Date().toLocaleDateString('pt-BR'),result:$('lab-result').value,goals,plan:active,note:obs});history=history.slice(-30);try{localStorage.setItem(historyKey,JSON.stringify(history))}catch(e){}$('lab-note').value='';showHistory()});
// V324: atualização VISUAL da prévia do laboratório, sem persistir em V67.
window.addEventListener('scoutpro:training-preview-v324',e=>{
 const info=e.detail||{};
 if(Number(info.cap)!==cardCap||String(info.card_id)!==String(d.id)||
    !previewValid(info.levels)||d.pp===null||total(info.levels)>d.pp)return;
 current=info.levels.slice();active='prévia por técnico '+String(info.manager||'').slice(0,20);
 render(); // Apenas visual; salvar() continua exclusivo do laboratório legado.
});
window.addEventListener('scoutpro:training-edit-v218',e=>{
 const info=e.detail||{};
 if(Number(info.cap)!==cardCap||String(info.card_id)!==String(d.id))return;
 if(info.mode==='restore'){
  try{localStorage.removeItem(storageKey)}catch(_e){}
  const recorded=previewValid(d[d.recommended])?d[d.recommended]:previewValid(d.A)?d.A:null;
  current=recorded?recorded.slice():Array(10).fill(0);
  active=recorded?(d.recommended||'A'):'prévia experimental';
  render();return;
 }
 if(!previewValid(info.levels)||d.pp===null||total(info.levels)>d.pp)return;
 // Trocar estilo/abrir ficha só atualiza a prévia. Não certificar uma
 // proposta automática como treino pessoal editado pelo usuário.
 if(info.mode!=='save'){
  current=info.levels.slice();active='prévia de cenário';render();return;
 }
 current=info.levels.slice();active='personalizado';
 persist();render();
});
window.addEventListener('scoutpro:training-load-v160',e=>{
 if(e.detail?.cap!==cardCap||!previewValid(e.detail.levels)||previewCost(e.detail.levels)!==d.pp)return;
 current=e.detail.levels.slice();active='prévia de cenário';render();
});
window.addEventListener('scoutpro:pp-updated',e=>{
 if(e.detail?.cap!==cardCap)return;
 if(Number.isInteger(e.detail.pp)){d.pp=e.detail.pp;if(previewEligible&&active==='prévia experimental')current=generate().vec.slice();}
 if(Array.isArray(e.detail.train)&&e.detail.train.length===10){
  current=e.detail.train.slice();active='personalizado';
 }
 render();
});
render();showHistory();
})();
