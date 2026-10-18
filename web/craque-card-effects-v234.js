/* V234 · melhora camada visual do motor V186, sem substituir imagens ou controles.
 * O próprio V186 gere opt-in, visibilidade, saveData, bateria e reduced-motion.
 * Esta camada usa apenas <span> decorativo com aria-hidden e 3D leve em mouse.
 */
(function(host){
 'use strict';
 const API=Object.freeze({
  rarities:Object.freeze(['show','epic','big','highlight']),
  eligible:(page)=>page==='catalog'||page==='detail',
  canTilt:(reduced,saveData,hover)=>!reduced&&!saveData&&!!hover
 });
 if(typeof module==='object'&&module.exports)module.exports=API;
 if(!host?.document)return;
 const doc=host.document;
 let pending=false,last=null,observer=null;
 // A preferência pode mudar com o aplicativo aberto. Mantém a escuta de mouse
 // preparada mesmo se "Reduzir movimentos" estiver ativo durante a inicialização.
 const reducedMedia=host.matchMedia?.('(prefers-reduced-motion: reduce)');
 const finePointer=host.matchMedia?.('(hover: hover) and (pointer: fine)');
 const supportsTilt=API.canTilt(false,
  !!host.navigator?.connection?.saveData,!!finePointer?.matches
 );
 function decorate(art){
  if(!art||art.dataset.ct234Premium==='1')return;
  const rarity=art.dataset.scoutMotionRarity;
  if(!API.rarities.includes(rarity))return;
  // Marca antes de alterar o DOM para não provocar reinicializações do MutationObserver.
  art.dataset.ct234Premium='1';
  const prism=doc.createElement('span');
  prism.className='ct234-motion-prism';
  prism.setAttribute('aria-hidden','true');
  art.appendChild(prism);
 }
 function upgrade(){
  pending=false;
  if(!API.eligible(doc.body?.dataset.page))return;
  const nodes=doc.querySelectorAll('.scout-motion-art[data-scout-motion-rarity]');
  for(const art of nodes)decorate(art);
  const expected=doc.body?.dataset.page==='catalog'?246:2;
  if(nodes.length>=expected&&observer){observer.disconnect();observer=null}
 }
 function requestUpgrade(){
  if(pending)return;
  pending=true;
  if(typeof host.requestAnimationFrame==='function')host.requestAnimationFrame(upgrade);
  else upgrade();
 }
 function stopTilt(){
  if(!last)return;
  delete last.dataset.ct234Hover;
  last.style?.removeProperty?.('--ct234-rx');
  last.style?.removeProperty?.('--ct234-ry');
  last=null;
 }
 function motionAllowed(){
  return doc.body?.classList.contains('scout-motion-on') && !doc.hidden &&
   !reducedMedia?.matches && !host.navigator?.connection?.saveData &&
   !!finePointer?.matches;
 }
 function activeArt(target){
  const e=target?.closest?.('.scout-motion-art[data-ct234-premium="1"]');
  if(!e||e.dataset.scoutMotionActive!=='true')return null;
  if(!e.closest?.('.player-card') && !e.closest?.('.mobile-profile') && !e.classList.contains('side-art'))return null;
  return e;
 }
 function attachPointer(){
  if(!supportsTilt)return;
  doc.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch'||!motionAllowed()){stopTilt();return}
   const art=activeArt(event.target);
   if(!art){stopTilt();return}
   if(last!==art){stopTilt();last=art}
   const r=art.getBoundingClientRect();
   if(!r.width||!r.height){stopTilt();return}
   const px=Math.max(-.5,Math.min(.5,(event.clientX-r.left)/r.width-.5));
   const py=Math.max(-.5,Math.min(.5,(event.clientY-r.top)/r.height-.5));
   art.dataset.ct234Hover='1';
   art.style.setProperty('--ct234-rx',(-py*7).toFixed(2)+'deg');
   art.style.setProperty('--ct234-ry',(px*7).toFixed(2)+'deg');
  },{passive:true});
  doc.addEventListener('pointerout',e=>{
   if(last&&last.contains(e.target)&&!last.contains(e.relatedTarget))stopTilt();
  },{passive:true});
  doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stopTilt()});
  doc.addEventListener('keydown',e=>{if(e.key==='Escape')stopTilt()});
  // O botão também pode ser acionado pelo teclado. Limpa o tilt sem exigir
  // um novo movimento do mouse quando a animação é desligada/religada.
  doc.addEventListener('click',e=>{
   if(e.target?.closest?.('.scout-motion-toggle'))stopTilt();
  },{passive:true});
  // Não deixa uma rotação anterior reaparecer após alternar a preferência do SO.
  const onMotionPreferenceChange=()=>{if(reducedMedia?.matches)stopTilt()};
  if(typeof reducedMedia?.addEventListener==='function')
   reducedMedia.addEventListener('change',onMotionPreferenceChange);
  else if(typeof reducedMedia?.addListener==='function')
   reducedMedia.addListener(onMotionPreferenceChange);
 }
 function init(){
  if(!API.eligible(doc.body?.dataset.page))return;
  if(doc.body.dataset.ct234MotionReady==='1')return;
  doc.body.dataset.ct234MotionReady='1';
  upgrade();
  if(host.MutationObserver){
   const expected=doc.body.dataset.page==='catalog'?246:2;
   if(doc.querySelectorAll('.scout-motion-art[data-ct234-premium="1"]').length<expected){
    observer=new host.MutationObserver(requestUpgrade);
    observer.observe(doc.body,{childList:true,subtree:true});
   }
  }
  attachPointer();
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window!=='undefined'?window:null);

