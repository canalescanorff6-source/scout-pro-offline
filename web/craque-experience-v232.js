/* Craque Tático V232 — atalhos de navegação sem tocar em cartas ou preferências.
 * Sem novas chaves locais: preserva persistência V177/V231 e biblioteca V227. */
(function(root){
 'use strict';
 if(!root?.document)return;
 const doc=root.document;
 function makeJumpNav(items){
  const nav=doc.createElement('nav');
  nav.className='ct-v232-jumps';
  nav.setAttribute('aria-label','Acesso rápido às seções do Craque Tático');
  for(const [target,label] of items){
   const a=doc.createElement('a');
   a.href='#'+target;
   a.textContent=label;
   a.setAttribute('aria-label','Ir para '+label);
   nav.appendChild(a);
  }
  return nav;
 }
 function initTeam(){
  if(doc.body?.dataset.page!=='team')return;
  const formation=doc.getElementById('formation-pick');
  if(!formation||doc.querySelector('.ct-v232-jumps'))return;
  const links=[
   ['formation-pick','Formações'],
   ['ct-v230-tactic-profile','Estilo de jogo'],
   ['pitch','Campo'],
   ['bench','Banco']
  ].filter(([id])=>doc.getElementById(id));
  if(links.length>1)formation.before(makeJumpNav(links));
 }
 function initDetail(){
  if(doc.body?.dataset.page!=='detail')return true;
  const options=doc.querySelector('#scout-app-bar .scout-v189-dock-options');
  if(!options)return false; // O menu Mais é criado de modo assíncrono na V189.
  if(options.querySelector('.ct-v232-jumps'))return true;
  // Links no menu Mais não empurram o treino para baixo na primeira viewport.
  const nav=makeJumpNav([
   ['scout-v188-principal','Ficha principal'],
   ['scout-v220-technical','Análise técnica'],
   ['scout-v229-legacy-archive','Arquivo completo']
  ]);
  nav.classList.add('ct-v232-jumps-menu');
  options.appendChild(nav);
  return true;
 }
 function menuAccessibility(){
  const menu=doc.querySelector('#scout-app-bar .scout-v189-dock-more');
  if(!menu)return false;
  if(menu.dataset?.ct232Ready==='1')return true;
  const summary=menu.querySelector('summary');
  if(!summary)return false;
  summary.setAttribute('aria-label','Mais opções: navegação e backup');
  summary.setAttribute('title','Abrir opções adicionais sem sair desta tela');
  menu.dataset.ct232Ready='1';
  doc.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&menu.open){
    menu.open=false;
    summary.focus();
   }
  });
  return true;
 }
 function androidSecurityNote(){
  if(!doc.body?.classList.contains('scout-native-android'))return;
  const modal=doc.getElementById('scout-android-update-modal');
  if(!modal||modal.querySelector('.ct-v232-security-note'))return;
  const note=doc.createElement('p');
  note.className='ct-v232-security-note';
  note.setAttribute('role','note');
  note.textContent='Segurança: se o Google Play Protect bloquear o APK, não desative a proteção. Preserve a instalação e os dados atuais; confira a procedência, a assinatura e a distribuição da versão antes de tentar novamente.';
  const actions=modal.querySelector('.scout-update-actions');
  if(actions)actions.before(note);
  else modal.appendChild(note);
 }
 function init(){
  initTeam();
  androidSecurityNote();
  let pendingDetail=!initDetail();
  let pendingMenu=!menuAccessibility();
  if((pendingDetail||pendingMenu)&&typeof MutationObserver==='function'){
   const observer=new MutationObserver(()=>{
    if(pendingDetail)pendingDetail=!initDetail();
    if(pendingMenu)pendingMenu=!menuAccessibility();
    if(!pendingDetail&&!pendingMenu)observer.disconnect();
   });
   observer.observe(doc.body,{childList:true,subtree:true});
  }
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window==='object'?window:null);
