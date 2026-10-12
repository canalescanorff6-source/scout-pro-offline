(()=>{'use strict';
if(document.getElementById('scout-app-bar'))return;
const repo=String(window.SCOUT_GITHUB_REPO||'').trim();
const bar=document.createElement('aside');bar.id='scout-app-bar';bar.setAttribute('aria-label','Gerenciamento do Scout PRO');
bar.innerHTML='<div><strong>SCOUT PRO · OFFLINE</strong><span class="app-small" id="scout-update-label">246 fichas no dispositivo · atualização quando houver conexão</span></div><nav class="scout-page-actions" aria-label="Navegação Scout PRO"><button id="scout-back" type="button">← Voltar</button><a id="scout-home" href="#">⌂ Elenco</a><button id="scout-top" type="button">↑ Topo</button></nav><div class="app-actions"><button id="scout-backup" type="button">Meus dados</button><button id="scout-update" type="button">Atualizar</button></div>';
document.body.appendChild(bar);
const inCard=location.pathname.includes('/fichas/');
if(!document.querySelector('link[href$="scout-premium-v73.css"]')){
 const premiumLink=document.createElement('link');premiumLink.rel='stylesheet';premiumLink.href=(inCard?'../':'')+'scout-premium-v73.css';document.head.appendChild(premiumLink);
}
const originalBrand=document.querySelector('.brand .brand-logo');
if(originalBrand){const logo=document.createElement('img');logo.className='brand-logo-img';logo.alt='Logotipo Scout PRO';logo.src=(inCard?'../':'')+'assets/scout-pro-icon-premium-original.png';originalBrand.replaceWith(logo)}
const home=(inCard?'../index.html':'index.html');
const homeBtn=bar.querySelector('#scout-home'),backBtn=bar.querySelector('#scout-back');
homeBtn.href=home+'#catalogo';
const oldOrigin=()=>{try{return new URL(document.referrer).origin===location.origin}catch{return false}};
backBtn.hidden=!inCard&&!oldOrigin();
backBtn.onclick=()=>{if(history.length>1&&oldOrigin())history.back();else location.href=home+'#catalogo'};
bar.querySelector('#scout-top').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
if(!inCard)homeBtn.href='#catalogo';

const label=document.getElementById('scout-update-label'),btn=document.getElementById('scout-update');
const notify=s=>{label.textContent=s;label.title=s};
const getKeys=()=>Object.keys(localStorage).filter(k=>k.startsWith('scoutpro:'));
const dl=(data,name)=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)};
const modal=document.createElement('dialog');modal.id='scout-backup-modal';modal.innerHTML='<h3>Backup das suas builds</h3><p>Exporta somente treinos personalizados e registros salvos neste dispositivo. Antes de trocar de celular, reinstalar ou limpar dados, faça backup.</p><button id="scout-export">Exportar meus dados</button><button id="scout-import">Importar backup</button><button id="scout-close">Fechar</button><input id="scout-pick" type="file" accept=".json,application/json" hidden><p id="scout-backup-status" role="status"></p>';document.body.appendChild(modal);
const feedback=modal.querySelector('#scout-backup-status');
bar.querySelector('#scout-backup').onclick=()=>modal.showModal();modal.querySelector('#scout-close').onclick=()=>modal.close();
modal.querySelector('#scout-export').onclick=()=>{try{const out={format:'scoutpro-userdata-v1',exported_at:new Date().toISOString(),items:Object.fromEntries(getKeys().map(k=>[k,localStorage.getItem(k)]))};dl(out,'scout-pro-meus-dados.json');feedback.textContent=`Backup gerado com ${Object.keys(out.items).length} registros.`;}catch(e){feedback.textContent='Falha no backup: '+e.message}};
const pick=modal.querySelector('#scout-pick');modal.querySelector('#scout-import').onclick=()=>pick.click();
pick.onchange=async()=>{try{if(!pick.files?.[0])return;if(pick.files[0].size>4e6)throw Error('Arquivo grande demais.');const val=JSON.parse(await pick.files[0].text());if(val.format!=='scoutpro-userdata-v1'||!val.items||typeof val.items!=='object'||Array.isArray(val.items))throw Error('Formato não reconhecido.');const entries=Object.entries(val.items);if(entries.length>4000||entries.some(([k,v])=>!k.startsWith('scoutpro:')||typeof v!=='string'))throw Error('Backup inválido.');if(!confirm('Importar '+entries.length+' registros? Dados existentes das mesmas cartas serão substituídos.'))return;entries.forEach(([k,v])=>localStorage.setItem(k,v));feedback.textContent='Importação concluída. Reabra a ficha para ver seus treinos.';}catch(e){feedback.textContent=e.message}finally{pick.value=''}};
async function openReleaseLink(raw){
 const url=new URL(raw);
 if(url.protocol!=='https:'||url.hostname!=='github.com')throw Error('Link de atualização não autorizado');
 const native=window.Capacitor && typeof window.Capacitor.isNativePlatform==='function' && window.Capacitor.isNativePlatform();
 const browser=window.Capacitor?.Plugins?.Browser;
 if(native && browser && typeof browser.open==='function'){
   await browser.open({url:url.href}); // navegador de sistema; instalação autorizada pelo usuário
 } else window.open(url.href,'_blank','noopener,noreferrer');
}
const cmpVersion=(a,b)=>{
 const A=String(a||'0.0.0').split('.').map(Number),B=String(b||'0.0.0').split('.').map(Number);
 for(let i=0;i<3;i++){const x=Number.isFinite(A[i])?A[i]:0,y=Number.isFinite(B[i])?B[i]:0;if(x!==y)return x>y?1:-1;}
 return 0;
};
const chooseAndroidRelease=(releases)=>{
 if(!Array.isArray(releases))return null;
 return releases.filter(r=>r&&!r.draft&&!r.prerelease)
 .map(r=>({release:r,asset:(r.assets||[]).find(a=>a?.name==='ScoutPRO-Android.apk'&&/^https:\/\/github\.com\//.test(a.browser_download_url||''))}))
 .filter(x=>x.asset&&/^v?\d+\.\d+\.\d+$/.test(x.release.tag_name||''))
 .sort((a,b)=>cmpVersion(b.release.tag_name.replace(/^v/,''),a.release.tag_name.replace(/^v/,'')))[0]||null;
};
const nativeAndroid=()=>Boolean(window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.getPlatform?.()==='android');
let lastAutomaticCheck=0;
async function onlineUpdate(auto=false){
 if(!repo||!/^[-\w.]+\/[-\w.]+$/.test(repo)){notify('Configure SCOUT_GITHUB_REPO no projeto.');if(nativeAndroid())showAndroidStatus('Repositório de atualizações não configurado.');return;}
 if(!navigator.onLine){notify('Sem internet: o Scout PRO continua funcionando offline.');if(nativeAndroid())showAndroidStatus('Sem internet. Conecte-se e toque em Verificar novamente.');return;}
 notify('Verificando versão do Scout PRO para este dispositivo…');
 const installed=String(window.SCOUT_VERSION||'1.0.0');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  if(nativeAndroid()){
   const resp=await fetch('https://api.github.com/repos/'+repo+'/releases?per_page=100',{
    signal:controller.signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
   if(!resp.ok)throw Error('GitHub HTTP '+resp.status);
   const releases=await resp.json();
   const selected=chooseAndroidRelease(releases);
   if(!selected){
    const msg='APK Android oficial ainda não publicado: builds de teste não atualizam o aplicativo instalado. Exige assinatura permanente.';
    notify(msg);showAndroidStatus(msg);setAndroidDownload(null);
    return;
   }
   const newest=String(selected.release.tag_name).replace(/^v/,'');
   setAndroidLatest(newest);
   if(cmpVersion(newest,installed)<=0){
    const msg='Android oficial: versão '+installed+' atualizada. Os dados continuam disponíveis offline.';
    notify(msg);showAndroidStatus(msg);setAndroidDownload(null);
    return;
   }
   const url=selected.asset.browser_download_url;
   notify('APK Android oficial '+newest+' disponível. Faça backup em Meus dados antes de instalar.');
   showAndroidStatus('Nova versão '+newest+' disponível. Salve um backup em Meus dados antes de baixar. A instalação requer assinatura compatível e sua confirmação.');
   setAndroidDownload(url);
   return;
  }
  const resp=await fetch('https://api.github.com/repos/'+repo+'/releases/latest',{
   signal:controller.signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
  if(!resp.ok)throw Error('GitHub HTTP '+resp.status);
  const data=await resp.json();
  const newest=String(data.tag_name||'').replace(/^v/,'');
  if(cmpVersion(newest,installed)<=0){notify('Versão '+installed+' atualizada.');return;}
  const url=data.html_url;
  notify('Versão '+newest+' disponível no GitHub.');
  if(url){
   btn.textContent='Baixar versão';
   btn.onclick=()=>openReleaseLink(url).catch(e=>notify(e.message));
   if(!auto&&confirm('Scout PRO '+newest+' disponível. Abrir a página de atualização?'))
    openReleaseLink(url).catch(e=>notify(e.message));
  }
 }catch(e){
  notify('Não foi possível consultar atualizações. O conteúdo offline permanece disponível.');
  if(nativeAndroid()){showAndroidStatus('Não foi possível consultar o GitHub agora. Tente novamente com internet.');setAndroidDownload(null);}
 }finally{clearTimeout(timer);}
}
const androidPanel=nativeAndroid()?document.createElement('dialog'):null;
let androidDownload=null;
const showAndroidStatus=message=>{
 if(!androidPanel)return;
 const node=androidPanel.querySelector('#scout-android-status');
 if(node)node.textContent=message;
};
const setAndroidLatest=version=>{
 if(androidPanel)androidPanel.querySelector('#scout-android-newest').textContent=version;
};
const setAndroidDownload=url=>{
 androidDownload=url||null;
 if(!androidPanel)return;
 const link=androidPanel.querySelector('#scout-android-download');
 link.hidden=!androidDownload;
 link.disabled=!androidDownload;
};
if(androidPanel){
 androidPanel.id='scout-android-update-modal';
 androidPanel.setAttribute('aria-label','Atualizar APK Android do Scout PRO');
 androidPanel.innerHTML='<h3>Atualizar Scout PRO Android</h3>'
  +'<p>Versão instalada: <strong id="scout-android-installed"></strong></p>'
  +'<p>Última versão oficial assinada: <strong id="scout-android-newest">Não disponível</strong></p>'
  +'<p id="scout-android-status" role="status">Toque em Verificar atualização para consultar o GitHub.</p>'
  +'<p class="scout-update-help">O aplicativo funciona offline. O download precisa de internet e a instalação depende da autorização do Android. As atualizações só instalam por cima do APK atual com a mesma assinatura e versionCode maior. APKs de teste não são atualizações oficiais.</p>'
  +'<div class="scout-update-actions"><button id="scout-android-check" type="button">Verificar atualização</button>'
  +'<button id="scout-android-download" type="button" hidden disabled>Baixar APK oficial</button>'
  +'<button id="scout-android-backup" type="button">Fazer backup</button>'
  +'<button id="scout-android-close" type="button">Fechar</button></div>';
 document.body.appendChild(androidPanel);
 androidPanel.querySelector('#scout-android-installed').textContent=String(window.SCOUT_VERSION||'1.0.0');
 androidPanel.querySelector('#scout-android-close').onclick=()=>androidPanel.close();
 androidPanel.querySelector('#scout-android-backup').onclick=()=>{androidPanel.close();modal.showModal()};
 androidPanel.querySelector('#scout-android-check').onclick=()=>onlineUpdate(false);
 androidPanel.querySelector('#scout-android-download').onclick=async()=>{
  if(!androidDownload)return;
  if(!confirm('Antes de instalar, faça backup em Meus dados. O Android verificará a assinatura do APK e pedirá sua autorização. Abrir download oficial?'))return;
  try{await openReleaseLink(androidDownload)}catch(e){showAndroidStatus('Não foi possível abrir o download: '+e.message)}
 };
}
function openAndroidUpdater(){
 if(!androidPanel)return;
 androidPanel.showModal();
 setAndroidDownload(null);
 showAndroidStatus('Verificando atualizações oficiais para Android…');
 onlineUpdate(false);
}
if(window.scoutDesktop){
 btn.textContent='Atualizar Windows';
 window.scoutDesktop.onUpdate(e=>notify(e.message));
 btn.onclick=async()=>{notify('Buscando atualizações…');const result=await window.scoutDesktop.checkUpdates();if(!result?.ok)notify(result?.message||'Verificação indisponível.')};
}else if(nativeAndroid()){
 btn.textContent='Atualizar APK';
 btn.setAttribute('aria-label','Verificar e baixar atualização APK Android');
 btn.onclick=openAndroidUpdater;
 const checkWhenForeground=()=>{
  if(!navigator.onLine||document.hidden)return;
  const now=Date.now();if(now-lastAutomaticCheck<4*60*60*1000)return;
  lastAutomaticCheck=now;onlineUpdate(true);
 };
 setTimeout(()=>{if(navigator.onLine){lastAutomaticCheck=Date.now();onlineUpdate(true)}},16000);
 document.addEventListener('visibilitychange',checkWhenForeground);
 window.addEventListener('online',checkWhenForeground);
}else{
 btn.onclick=()=>onlineUpdate(false);
}
const ppCss=document.createElement('link');ppCss.rel='stylesheet';ppCss.href=(inCard?'../':'')+'progress-v81.css';document.head.appendChild(ppCss);
const ppScript=document.createElement('script');ppScript.src=(inCard?'../':'')+'progress-v81.js';document.body.appendChild(ppScript);
if(document.body?.dataset.page==='detail'){
 const css=document.createElement('link');css.rel='stylesheet';css.href='../scout-engine-v74.css';document.head.appendChild(css);
 const script=document.createElement('script');script.src='../scout-engine-v74.js';document.body.appendChild(script);
 // V80: auditoria por carta + experimento offline; não substitui as builds existentes.
 const reviewCss=document.createElement('link');reviewCss.rel='stylesheet';reviewCss.href='../performance-review-v80.css';document.head.appendChild(reviewCss);
 const core=document.createElement('script');core.src='../performance-core-v80.js';
 core.onload=()=>{const review=document.createElement('script');review.src='../performance-review-v80.js';document.body.appendChild(review)};
 core.onerror=()=>console.warn('Scout V80: motor de avaliação não carregado');
 document.body.appendChild(core);
}
(()=>{
if(!document.querySelector('link[data-scout-favicon]')){
 const link=document.createElement('link');link.setAttribute('data-scout-favicon','true');link.rel='icon';link.type='image/png';
 link.href=(location.pathname.includes('/fichas/')?'../':'')+'assets/icon-192.png';document.head.appendChild(link);
}
})();
})();