/* Scout PRO V186 — animacao opt-in controlavel por raridade. Efeitos CSS locais, NAO assets oficiais. */
(function(host){
'use strict';
const SETTINGS_KEY='scoutpro:v186:card-motion';
function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim()}
function classifyRarity(value){
 const s=normalize(value);
 if(/SHOW\s*TIME/.test(s))return 'show';
 if(/BIG\s*TIME/.test(s))return 'big';
 if(/EPIC|EPICA/.test(s))return 'epic';
 if(/DISTINGUIDO|HIGHLIGHT|DESTAQUE/.test(s))return 'highlight';
 return 'highlight';
}
const labels={show:'Show Time · energia',epic:'Épica · brilho lendário',big:'Big Time · impacto',highlight:'Distinguido · reflexos'};
if(typeof module!=='undefined'&&module.exports)module.exports={classifyRarity,normalize,SETTINGS_KEY,labels};
if(!host||!host.document)return;
const doc=host.document;
function run(){
 if(doc.body.dataset.scoutMotionInit==='1')return;
 doc.body.dataset.scoutMotionInit='1';
 const lowMotion=host.matchMedia?host.matchMedia('(prefers-reduced-motion: reduce)'):null;
 let saved=null;try{saved=host.localStorage.getItem(SETTINGS_KEY)}catch(e){}
 const dataSaver=!!host.navigator?.connection?.saveData;
 let wanted=saved==='on'?true:saved==='off'?false:!dataSaver;
 const frameNodes=[];
 let observer=null;
 let onScreen=new Set();
 const isAllowed=()=>wanted&&!lowMotion?.matches&&!doc.hidden;
 function updateState(){
  const on=isAllowed();
  doc.body.classList.toggle('scout-motion-on',on);
  doc.querySelectorAll('.scout-motion-toggle').forEach(button=>{
   button.setAttribute('aria-pressed',String(on));
   button.disabled=Boolean(lowMotion?.matches);
   button.textContent=lowMotion?.matches?'✧ Animação desativada pelo sistema':on?'✦ Cartas animadas: ON':'✧ Cartas animadas: OFF';
   button.title=lowMotion?.matches?'Desative Reduzir movimentos nas configurações do dispositivo para habilitar os efeitos.':'Ativar ou pausar os efeitos das cartas. Não altera as artes originais.';
  });
  for(const entry of frameNodes){
   const visible=!observer||onScreen.has(entry);
   entry.dataset.scoutMotionActive=String(on&&visible);
  }
 }
 function insertFx(art,rarity){
  if(!art||art.querySelector('.scout-motion-layer'))return;
  art.classList.add('scout-motion-art');
  art.dataset.scoutMotionRarity=rarity;
  const layer=doc.createElement('span');
  layer.className='scout-motion-layer';
  layer.setAttribute('aria-hidden','true');
  art.appendChild(layer);
  frameNodes.push(art);
  if(observer)observer.observe(art);
 }
 if(typeof host.IntersectionObserver==='function'){
  observer=new host.IntersectionObserver(entries=>{
   for(const item of entries){
    if(item.isIntersecting)onScreen.add(item.target);
    else onScreen.delete(item.target);
    item.target.dataset.scoutMotionActive=String(isAllowed()&&item.isIntersecting);
   }
  },{root:null,rootMargin:'110px 0px',threshold:0.01});
 }
 const isCatalog=doc.body.dataset.page==='catalog';
 if(isCatalog){
  const cards=Array.from(doc.querySelectorAll('.player-card[data-rarity]'));
  cards.forEach(card=>insertFx(card.querySelector('.card-art'),classifyRarity(card.dataset.rarity)));
 }else if(doc.body.dataset.page==='detail'){
  const title=doc.title||'';
  const label=title.match(/—\s*(SHOW TIME|BIG TIME|ÉPICA|EPICA|DISTINGUIDO)/i);
  const rarity=classifyRarity(label?label[1]:title);
  insertFx(doc.querySelector('.side-art'),rarity);
  const mobile=doc.querySelector('.mobile-profile');
  const img=mobile?.querySelector('img');
  if(img){
   const frame=doc.createElement('div');
   frame.className='scout-mobile-art';
   img.parentNode.insertBefore(frame,img);
   frame.appendChild(img);
   insertFx(frame,rarity);
  }
 }
 const target=isCatalog?doc.querySelector('.toolbar .tools'):doc.querySelector('.profile-content');
 if(target){
  const controls=doc.createElement('div');
  controls.className='scout-motion-controls';
  controls.setAttribute('role','group');
  controls.setAttribute('aria-label','Movimento das cartas');
  const btn=doc.createElement('button');
  btn.type='button';btn.className='scout-motion-toggle';btn.setAttribute('aria-pressed','false');
  btn.addEventListener('click',()=>{
   wanted=!wanted;
   try{host.localStorage.setItem(SETTINGS_KEY,wanted?'on':'off')}catch(e){}
   updateState();
  });
  const caption=doc.createElement('span');
  caption.className='scout-motion-caption';
  caption.textContent=isCatalog?'4 estilos • Show Time · Épica · Big Time · Distinguido':'Efeito visual inspirado nas raridades; arte original preservada.';
  controls.append(btn,caption);
  if(isCatalog)target.insertAdjacentElement('afterend',controls);
  else target.insertBefore(controls,target.firstChild);
 }
 doc.addEventListener('visibilitychange',updateState);
 if(lowMotion){
  if(typeof lowMotion.addEventListener==='function')lowMotion.addEventListener('change',updateState);
  else if(typeof lowMotion.addListener==='function')lowMotion.addListener(updateState);
 }
 updateState();
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',run,{once:true});
else run();
})(typeof window!=='undefined'?window:null);
