/* V230 · duas formações históricas reavaliadas por CINCO estilos de técnico.
 * O usuário escolhe os jogadores manualmente, com um ranking consultivo para cada posição.
 * Não escreve na ficha, PP, habilidades, instruções aprovadas ou 23 restrições.
 */
(()=>{'use strict';
const tactical=window.CRAQUE_TACTICS_V230,bar=document.getElementById('ct-v230-tactic-profile');
if(!tactical||!bar)return;
const $=id=>document.getElementById(id);
let cards=[],activeMode='posse',currentId='4312',ready=false;
const KEY=id=>'scoutpro:v230:formation-mode:'+id;
const escString=s=>String(s??'');
const v=id=>{try{return localStorage.getItem(KEY(id))||'posse'}catch(_e){return 'posse'}};
const store=(id,mode)=>{try{localStorage.setItem(KEY(id),mode);window.dispatchEvent(
 new CustomEvent('craque:data-changed',{detail:{key:KEY(id)}}));return true}catch(_e){return false}};
const node=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
function formation(){
 return document.querySelector('#formation-pick [data-formation][aria-pressed="true"]')?.dataset.formation||currentId;
}
function slots(){
 const out=[];
 for(const el of document.querySelectorAll('#pitch button[data-slot]')){
  const slot=el.dataset.slot,match=el.querySelector('.p-cap')?.textContent?.match(/#(\d{1,3})\b/);
  if(!match)continue;
  out.push({slot,cap:Number(match[1])});
 }
 return out;
}
function render(){
 if(!ready)return;
 const chosen=slots(),used=chosen.map(x=>x.cap);
 const container=$('ct-v230-tactic-details');container.replaceChildren();
 const name=tactical.MODES[activeMode];
 $('ct-v230-tactic-name').textContent=name.label+' · '+(currentId==='4312'?'4-3-1-2':'4-2-1-3 estreita');
 $('ct-v230-tactic-explain').textContent=name.hint+
  ' Esta análise não muda o desenho nem troca os titulares automaticamente.';
 bar.querySelectorAll('button[data-mode]').forEach(b=>{
  b.setAttribute('aria-pressed',String(b.dataset.mode===activeMode));
  b.classList.toggle('selected',b.dataset.mode===activeMode);
 });
 const blocked=(()=>{try{const a=JSON.parse(localStorage.getItem('scoutpro:v219:black-caps')||'[]');return Array.isArray(a)?a:[]}catch(_e){return[]}})();
 let strong=0,pending=0;
 for(const {slot,cap} of chosen){
  const player=cards.find(c=>Number(c.numero)===cap);
  if(!player)continue;
  const info=tactical.score(player,slot,activeMode);
  if(info.confidence==='comparativo_documental'&&info.score>=65)strong++;
  else pending++;
  const block=node('article','ct-v230-fit-row');
  const title=node('div','ct-v230-fit-heading');
  title.append(node('strong','',('#'+String(cap).padStart(3,'0')+' '+player.name)),
   node('small','',slot.toUpperCase()+' · '+info.placement+' · '+(info.score<0?'Não elegível':'Encaixe '+info.score+'/100 (heurístico)')));
  const note=node('p','',info.signals.slice(0,2).join(' · '));block.append(title,note);
  const rivals=tactical.rank(cards,slot,activeMode,blocked,used).slice(0,2);
  if(rivals.length){
   block.append(node('small','ct-v230-fit-alts','Opções por função (não equipadas): '+
    rivals.map(x=>'#'+String(x.card.numero).padStart(3,'0')+' '+x.card.name).join(' · ')));
  }
  const change=node('button','ct-v230-fit-change','Trocar nesta posição');
  change.type='button';change.onclick=()=>{
   document.querySelector('#pitch button[data-slot="'+slot+'"]')?.click();
  };
  block.append(change);container.append(block);
 }
 $('ct-v230-tactic-count').textContent=chosen.length+
  ' titulares · '+strong+' com sinais fortes · '+pending+' para conferir';
 $('ct-v230-tactic-warning').textContent='Comparação documental, não rendimento garantido. Os 23 jogadores da lista de restrições não aparecem nas sugestões. Link-Up e instruções originais foram planejados para Posse e dependem do técnico escolhido no jogo.';
}
function select(mode){
 if(!Object.hasOwn(tactical.MODES,mode))return;
 activeMode=mode;
 const persisted=store(currentId,mode);
 $('ct-v230-persist').textContent=persisted?
  'Estilo salvo para esta formação neste aparelho. Cartas e PP preservados.':
  'Estilo selecionado nesta sessão; armazenamento local indisponível.';
 render();
}
function sync(){
 const id=formation();
 if(id!==currentId){
  currentId=id;
  const saved=v(id);activeMode=Object.hasOwn(tactical.MODES,saved)?saved:'posse';
 }
 render();
}
for(const [mode,cfg] of Object.entries(tactical.MODES)){
 const button=node('button','ct-v230-tactic-option',cfg.label);button.type='button';
 button.dataset.mode=mode;button.setAttribute('aria-pressed','false');
 button.onclick=()=>select(mode);
 $('ct-v230-tactic-tabs').append(button);
}
const observer=new MutationObserver(()=>sync());
const pitch=$('pitch');if(pitch)observer.observe(pitch,{childList:true,subtree:false});
const holder=$('formation-pick');
if(holder)holder.addEventListener('click',event=>{
 if(event.target.closest?.('[data-formation]'))queueMicrotask(sync);
});
Promise.all([
 fetch('SCOUT_V69_AUDITORIA.json').then(r=>{if(!r.ok)throw Error('Catálogo offline indisponível');return r.json()}),
 fetch('SCOUT_V177_DUAS_FORMACOES.json').then(r=>{if(!r.ok)throw Error('Duas formações indisponíveis');return r.json()})
]).then(([roster,forms])=>{
 if(roster.cards?.length!==246||forms.formations?.length!==2)throw Error('Catálogo e formações incompletos');
 cards=roster.cards;ready=true;sync();
}).catch(e=>{$('ct-v230-tactic-explain').textContent='Não foi possível analisar as formações: '+e.message});
window.CRAQUE_FORMATION_UI_V230={render,sync};
})();
