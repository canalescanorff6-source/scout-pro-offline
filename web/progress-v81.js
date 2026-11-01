(function(root){
'use strict';
const key=cap=>'scoutpro:v81:pp:'+cap;
const budget=level=>root?.CRAQUE_PP_UNIVERSAL_V309?.budget(level)??(Number.isInteger(level)&&level>=1&&level<=120?2*(level-1):null);
const cost=vec=>vec.reduce((sum,n)=>{for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);return sum},0);
const valid=vec=>Array.isArray(vec)&&vec.length===10&&vec.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
const record=(raw,card)=>{
 if(!raw||!card||raw.cap!==card.capture||raw.name!==card.name)return null;
 const pp=budget(raw.level);
 if(pp===null||raw.pp!==pp)return null;
 const known=/^\d{8,16}$/.test(String(card.id||''));
 if(raw.cardId&&(!/^\d{8,16}$/.test(raw.cardId)||(known&&raw.cardId!==String(card.id))))return null;
 return raw;
};
const weights={
CA:[10,3,7,11,9,5,0,0,0,0],SA:[6,7,9,10,8,2,0,0,0,0],
MAT:[3,10,10,10,7,1,2,0,0,0],MLG:[2,10,8,8,8,3,7,0,0,0],
VOL:[0,9,5,4,7,6,11,0,0,0],ZG:[0,5,1,2,8,9,12,0,0,0],
LD:[0,7,6,7,9,5,9,0,0,0],LE:[0,7,6,7,9,5,9,0,0,0],
GO:[0,0,0,0,3,0,0,10,11,11],
PTD:[3,8,10,10,10,1,0,0,0,0],PTE:[3,8,10,10,10,1,0,0,0,0],
MLD:[2,9,9,9,8,2,5,0,0,0],MLE:[2,9,9,9,8,2,5,0,0,0]};
const categories=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
function suggest(pp,role,defence){
 if(!Number.isInteger(pp)||pp<0||pp>238)throw Error('PP inválidos.');
 const position=({AC:'CA',DC:'ZG',ZC:'ZG',MC:'MLG',MDF:'VOL',GR:'GO',DD:'LD',DE:'LE',MO:'MAT'})[role]||role;
 const w=(weights[position]||weights.MLG).slice(),vec=Array(10).fill(0);
 if(/destruidor|primeiro volante/i.test(defence||''))w[6]+=2;
 let left=pp;
 while(left){
  let pick=-1,best=-Infinity;
  for(let i=0;i<10;i++){
   const next=1+Math.floor(vec[i]/4);
   if(!w[i]||vec[i]>=20||next>left)continue;
   const score=w[i]/(1+0.5*(next-1))-0.11*vec[i];
   if(score>best){best=score;pick=i}
  }
  if(pick<0)break;
  left-=1+Math.floor(vec[pick]/4);vec[pick]++;
 }
 if(!valid(vec)||cost(vec)>pp)throw Error('Falha de orçamento');
 return {vec,spent:cost(vec),remaining:left};
}
const api={key,budget,cost,valid,record,suggest,categories};
if(typeof module==='object'&&module.exports)module.exports=api;
if(!root||typeof document==='undefined')return;
function getSaved(card){try{return record(JSON.parse(localStorage.getItem(key(card.capture))||'null'),card)}catch(e){return null}}
function emit(data){root.dispatchEvent(new CustomEvent('scoutpro:pp-updated',{detail:data}))}
function mountDetail(){
 const script=document.getElementById('scout-v68-data'),parent=document.querySelector('.profile-content');
 if(!script||!parent)return;
 let d;try{d=JSON.parse(script.textContent)}catch(e){return}
 if(d.pp!==null)return;
 // V380: manter editor de PP, mas não gerar segunda tela do Scout PRO.
 const host=document.createElement('section');host.id='scout-progress-v81';host.className='v81-progress';
 const disclosure=document.createElement('details');
 disclosure.id='ct380-progress-disclosure';disclosure.className='ct380-progress-disclosure';
 const summary=document.createElement('summary');summary.textContent='Completar nível e PP · conferência no jogo';
 disclosure.append(summary,host);
 function mountInsidePremium(){
  const advanced=document.querySelector('#scout-v220-technical .scout-v220-technical-body');
  if(!advanced)return false;
  if(disclosure.parentElement!==advanced)advanced.appendChild(disclosure);
  return true;
 }
 if(!mountInsidePremium()){
  const observer=typeof MutationObserver==='function'?new MutationObserver(()=>{
   if(mountInsidePremium())observer.disconnect();
  }):null;
  observer?.observe(document.body,{childList:true,subtree:true});
  root.setTimeout(()=>{observer?.disconnect();if(!disclosure.isConnected)parent.appendChild(disclosure)},10000);
 }
 const html=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 let info='';
 function render(){
  const saved=getSaved(d),known=/^\d{8,16}$/.test(String(d.id||''));
  host.innerHTML='<small>CRAQUE TÁTICO · PROGRESSÃO DA CARTA</small><h2>Completar os níveis e os PP de '+html(d.name)+'</h2>'+
  '<p>A imagem mostra o <b>Overall</b>, não o nível máximo. Abra essa mesma carta no eFootball e confira o nível máximo na tela de progressão.</p>'+
  '<div class="v81-result">'+(saved?'<b>Nível máximo '+saved.level+' · '+saved.pp+' PP</b> — dados informados por você, salvos neste dispositivo.':'<b>PP pendente:</b> nível máximo ainda não registrado.')+'</div>'+
  '<form id="v81-form"><label>Nível máximo da carta (não Overall)<input type="number" name="level" min="1" max="120" step="1" required placeholder="Ex.: 33" value="'+(saved?.level||'')+'"></label>'+
  '<label>Card ID <span>'+(known?'associado':'opcional para identificar a versão')+'</span><input type="text" name="cardId" pattern="[0-9]{8,16}" maxlength="16" inputmode="numeric" '+(known?'readonly':'')+' placeholder="Somente se for conhecido" value="'+html(known?d.id:(saved?.cardId||''))+'"></label>'+
  '<label class="v81-check"><input type="checkbox" name="check" required> Conferi o NÍVEL MÁXIMO na carta dentro do jogo.</label>'+
  '<div class="v81-buttons"><button type="submit">Calcular e salvar PP</button>'+
  (saved?'<button id="v81-start" type="button" class="v81-alt">Sugerir treino para Posse</button>':'')+'</div></form>'+
  '<p class="v81-help">Fórmula: 2 × (nível máximo − 1). Ex.: nível 33 = 64 PP. Nada é deduzido do Overall nem do nome do jogador.</p>'+
  (saved?'<p>Abra o <a href="#performance">Laboratório PRO</a> para ajustar os níveis. A sugestão por posição é experimental, não uma build comprovada em campo.</p>':'')+
  '<p id="v81-feedback" role="status">'+html(info)+'</p>';
  host.querySelector('#v81-form').addEventListener('submit',event=>{
   event.preventDefault();
   const values=new FormData(event.currentTarget),level=Number(values.get('level')),pp=budget(level),id=String(values.get('cardId')||'').trim();
   if(!values.has('check')||pp===null||(id&&!/^\d{8,16}$/.test(id))||(known&&id!==String(d.id))){
    host.querySelector('#v81-feedback').textContent='Confirme o nível máximo e o Card ID correto.';return;
   }
   if(level>=70&&!confirm('Confirma nível máximo '+level+' (e não Overall)?'))return;
   const next={cap:d.capture,name:d.name,level,pp,cardId:id,date:new Date().toISOString(),source:'nível confirmado manualmente no jogo'};
   try{localStorage.setItem(key(d.capture),JSON.stringify(next))}
   catch(e){host.querySelector('#v81-feedback').textContent='Falha ao salvar no dispositivo.';return}
   info='Orçamento de '+pp+' PP calculado. Você pode distribuir os pontos no Laboratório PRO.';
   emit(next);render();
  });
  const start=host.querySelector('#v81-start');
  if(start)start.addEventListener('click',()=>{
   const current=getSaved(d);if(!current)return;
   const proposal=suggest(current.pp,d.role_used||d.shown_position,d.defence_style);
   const summary=categories.map((n,i)=>n+': '+proposal.vec[i]).join(' · ');
   if(!confirm('Sugestão experimental '+proposal.spent+'/'+current.pp+' PP: '+summary+'. Aplicar ao laboratório?'))return;
   const el=document.getElementById('lab-data');if(!el)return;
   const lab=JSON.parse(el.textContent);
   try{localStorage.setItem('scoutpro:v67:'+lab.id+':'+lab.card,JSON.stringify({train:proposal.vec,updated:new Date().toISOString(),method:'heurística por função'}))}
   catch(e){host.querySelector('#v81-feedback').textContent='Não foi possível salvar o treino.';return}
   info='Treino inicial de '+proposal.spent+' PP salvo no Laboratório. Ajuste e teste no jogo; não é uma build validada.';
   emit({...current,train:proposal.vec});render();
  });
 }
 render();
}
function mountCatalog(){
 const items=Array.from(document.querySelectorAll('.player-card'));
 for(const item of items){
  const pp=item.querySelector('.pp');
  if(!pp||!pp.textContent.includes('pendente'))continue;
  let raw;try{raw=JSON.parse(localStorage.getItem(key(Number(item.dataset.cap)))||'null')}catch(e){continue}
  if(!raw||raw.cap!==Number(item.dataset.cap)||raw.name!==item.dataset.name||budget(raw.level)!==raw.pp)continue;
  pp.textContent=raw.pp+' PP (seus dados)';
  const note=item.querySelector('.v68-mini-label');if(note)note.textContent='Nível '+raw.level+' informado';
 }
}
if(document.body.dataset.page==='detail')mountDetail();
if(document.body.dataset.page==='catalog')mountCatalog();
})(typeof window!=='undefined'?window:null);