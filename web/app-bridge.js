(()=>{'use strict';
if(document.getElementById('scout-app-bar'))return;
const repo=String(window.SCOUT_GITHUB_REPO||'').trim();
const scoutNativeAndroid=Boolean(window.Capacitor?.isNativePlatform?.() && window.Capacitor?.getPlatform?.()==='android');
if(scoutNativeAndroid)document.body.classList.add('scout-native-android');
const bar=document.createElement('aside');bar.id='scout-app-bar';bar.setAttribute('aria-label','Gerenciamento do Scout PRO');
bar.innerHTML='<div><strong>SCOUT PRO · OFFLINE</strong><span class="app-small" id="scout-update-label">246 fichas no dispositivo · atualização quando houver conexão</span></div><nav class="scout-page-actions" aria-label="Navegação Scout PRO"><button id="scout-back" type="button">← Voltar</button><a id="scout-home" href="#">⌂ Elenco</a><button id="scout-top" type="button">↑ Topo</button></nav><div class="app-actions"><button id="scout-backup" type="button">Meus dados</button><button id="scout-update" type="button">Atualizar</button></div>';
document.body.appendChild(bar);
const inCard=location.pathname.includes('/fichas/');
if(inCard){
 const match=location.pathname.match(/\/fichas\/(\d{3})_/);
 const cardView=document.querySelector('.profile-content');
 if(match&&cardView&&!document.getElementById('scout-card-booster-shortcut')){
  const shortcut=document.createElement('a');
  shortcut.id='scout-card-booster-shortcut';
  shortcut.href='../revisao-impetos-v103.html?c='+Number(match[1]);
  shortcut.textContent='Consultar ímpeto selecionável desta carta ↗';
  shortcut.style.cssText='display:inline-flex;align-items:center;min-height:40px;margin:0 0 12px;padding:9px 12px;border:1px solid #3d837a;border-radius:10px;background:#123846;color:#a4f4d3;font-weight:650;text-decoration:none;font-size:13px';
  cardView.insertBefore(shortcut,cardView.firstChild);
 }
}
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
if(!inCard&&document.body.dataset.page==='catalog')homeBtn.href='#catalogo';

const label=document.getElementById('scout-update-label'),btn=document.getElementById('scout-update');
let scoutToastTimer;
const scoutToast=scoutNativeAndroid?document.createElement('output'):null;
if(scoutToast){
 scoutToast.id='scout-android-toast';
 scoutToast.setAttribute('role','status');
 scoutToast.setAttribute('aria-live','polite');
 scoutToast.hidden=true;
 document.body.appendChild(scoutToast);
 scoutToast.addEventListener('click',()=>{
  clearTimeout(scoutToastTimer);
  scoutToast.hidden=true;
 });
}
const notify=s=>{
 label.textContent=s;label.title=s;
 if(!scoutToast)return;
 scoutToast.textContent=s;
 scoutToast.hidden=false;
 clearTimeout(scoutToastTimer);
 scoutToastTimer=setTimeout(()=>{scoutToast.hidden=true},5200);
};
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
let scoutNativeUpdaterBridge=null;
const nativeUpdater=()=>{
 if(!nativeAndroid())return null;
 if(scoutNativeUpdaterBridge)return scoutNativeUpdaterBridge;
 const capacitor=window.Capacitor;
 scoutNativeUpdaterBridge=typeof capacitor?.registerPlugin==='function'
   ?capacitor.registerPlugin('ScoutUpdater')
   :capacitor?.Plugins?.ScoutUpdater;
 return scoutNativeUpdaterBridge;
};
let lastAutomaticCheck=0;
async function onlineUpdate(auto=false){
 if(!repo||!/^[-\w.]+\/[-\w.]+$/.test(repo)){notify('Configure SCOUT_GITHUB_REPO no projeto.');if(nativeAndroid())showAndroidStatus('Repositório de atualizações não configurado.');return;}
 if(!navigator.onLine){notify('Sem internet: o Scout PRO continua funcionando offline.');if(nativeAndroid())showAndroidStatus('Sem internet. Conecte-se e toque em Verificar novamente.');return;}
 notify('Verificando versão do Scout PRO para este dispositivo…');
 let installed=String(window.SCOUT_VERSION||'1.0.0');
 // Plugin failures must not prevent the user from checking GitHub releases.
 if(nativeAndroid()){
  try{
   const plugin=nativeUpdater();
   if(plugin && typeof plugin.getInstalledInfo==='function'){
    const current=await plugin.getInstalledInfo();
    installed=String(current.versionName||installed);
    const display=document.getElementById('scout-android-installed');
    if(display)display.textContent=installed;
   }
  }catch(e){
   showAndroidStatus('Versão nativa indisponível; consultando o GitHub mesmo assim.');
  }
 }
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  if(nativeAndroid()){
   const resp=await fetch('https://api.github.com/repos/'+repo+'/releases?per_page=100',{
    signal:controller.signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});
   if(!resp.ok)throw Error('GitHub HTTP '+resp.status);
   const releases=await resp.json();
   const selected=chooseAndroidRelease(releases);
   if(!selected){
    const msg='Ainda não há APK oficial Android publicado. Ative o segredo ANDROID_RELEASE_SECRET no GitHub e execute a CI para disponibilizar a primeira versão assinada. Faça backup antes da migração do APK de teste.';
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
let androidDownload=null,androidVerified=false,androidProgressListener=null;
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
 androidVerified=false;
 if(!androidPanel)return;
 const link=androidPanel.querySelector('#scout-android-download');
 const install=androidPanel.querySelector('#scout-android-install');
 link.hidden=!androidDownload;link.disabled=!androidDownload;
 install.hidden=true;install.disabled=true;
 const progress=androidPanel.querySelector('#scout-android-progress');
 if(progress){progress.hidden=true;progress.value=0}
 const percentage=androidPanel.querySelector('#scout-android-percent');
 if(percentage)percentage.textContent='';

};
if(androidPanel){
 androidPanel.id='scout-android-update-modal';
 androidPanel.setAttribute('aria-label','Atualizar APK Android do Scout PRO');
 androidPanel.innerHTML='<h3>Atualizar Scout PRO Android</h3>'
  +'<p>Versão instalada: <strong id="scout-android-installed"></strong></p>'
  +'<p>Última versão oficial assinada: <strong id="scout-android-newest">Não disponível</strong></p>'
  +'<p id="scout-android-status" role="status">Toque em Verificar atualização para consultar o GitHub.</p>'
  +'<p class="scout-update-help">O arquivo oficial é baixado e conferido dentro do app (SHA256), sem Chrome. O Android solicitará confirmação da instalação. Se o APK anterior tiver assinatura diferente, não será possível instalar por cima: salve um backup antes de qualquer migração.</p>'
  +'<progress id="scout-android-progress" max="100" value="0" hidden aria-label="Progresso do download do APK"></progress>'
  +'<p id="scout-android-percent" aria-live="polite"></p>'
  +'<div class="scout-update-actions"><button id="scout-android-check" type="button">Verificar atualização</button>'
  +'<button id="scout-android-download" type="button" hidden disabled>Baixar APK oficial no app</button>'
  +'<button id="scout-android-install" type="button" hidden disabled>Instalar APK baixado</button>'
  +'<button id="scout-android-backup" type="button">Fazer backup</button>'
  +'<button id="scout-android-close" type="button">Fechar</button></div>';
 document.body.appendChild(androidPanel);
 // Register this handler before touching the native bridge.
 btn.textContent='Atualizar APK';
 btn.setAttribute('aria-label','Verificar e baixar atualização APK Android');
 btn.onclick=()=>{try{openAndroidUpdater()}catch(e){notify('Não foi possível abrir o atualizador. Use Meus dados para backup e consulte a Release oficial no GitHub.')}};
 androidPanel.querySelector('#scout-android-installed').textContent=String(window.SCOUT_VERSION||'1.0.0');
 androidPanel.querySelector('#scout-android-close').onclick=()=>{
  try{androidPanel.close()}catch(e){}
  androidPanel.removeAttribute('open');
  androidPanel.classList.remove('scout-dialog-fallback');
 };
 androidPanel.querySelector('#scout-android-backup').onclick=()=>{androidPanel.close();modal.showModal()};
 androidPanel.querySelector('#scout-android-check').onclick=()=>onlineUpdate(false);
 const installBtn=androidPanel.querySelector('#scout-android-install');
 const downloadBtn=androidPanel.querySelector('#scout-android-download');
 const progress=androidPanel.querySelector('#scout-android-progress');
 const percentage=androidPanel.querySelector('#scout-android-percent');
 try{
  const updater=nativeUpdater();
  if(updater && typeof updater.addListener==='function'){
   const result=updater.addListener('downloadProgress',p=>{
    if(!p)return;
    progress.hidden=false;
    if(Number.isFinite(p.percent)&&p.percent>=0){progress.value=p.percent;percentage.textContent='Download no app: '+p.percent+'%'}
    else{progress.removeAttribute('value');percentage.textContent='Baixando dentro do app…'}
   });
   if(result && typeof result.then==='function')result.then(h=>{androidProgressListener=h}).catch(()=>{});
  }
 }catch(e){
  androidPanel.dataset.nativeBridgeError='true';
 }
 async function installReadyAPK(){
  if(!androidVerified)return;
  let native=null;
  try{native=nativeUpdater()}catch(e){}
  if(!native || typeof native.installDownloaded!=='function'){showAndroidStatus('Instalador interno indisponível. Faça backup e instale a versão oficial diretamente do GitHub.');return;}
  try{
   const result=await native.installDownloaded();
   if(result.status==='signature_mismatch'){
    showAndroidStatus('IMPOSSÍVEL ATUALIZAR POR CIMA: a assinatura do APK instalado é diferente da assinatura oficial. Não desinstale antes de exportar e conferir o backup em Meus dados. Este problema não pode ser corrigido baixando o APK em outro lugar.');
    percentage.textContent='Certificado instalado: '+result.installedFingerprint+' · certificado do APK: '+result.newFingerprint;
    installBtn.disabled=true;return;
   }
   if(result.status==='version_not_newer'){showAndroidStatus('O APK baixado não é superior à versão já instalada. Nenhuma alteração foi feita.');return;}
   if(result.status==='permission_required'){showAndroidStatus('O Android abriu a permissão “Instalar apps desconhecidos”. Autorize apenas o Scout PRO, volte ao app e toque Instalar APK baixado.');return;}
   if(result.status==='installer_opened'){showAndroidStatus('Pacote validado. Confirme a instalação/atualização na tela oficial do Android. Seus dados serão mantidos se a atualização for aceita.');return;}
   showAndroidStatus('Estado de instalação: '+String(result.status||'indisponível'));
  }catch(e){showAndroidStatus('Instalação não iniciada: '+(e.message||String(e)));}
 }
 installBtn.onclick=installReadyAPK;
 downloadBtn.onclick=async()=>{
  if(!androidDownload)return;
  if(!confirm('Antes de instalar, faça backup em Meus dados. O download será feito dentro do Scout PRO; o Android confirmará a instalação. Continuar?'))return;
  let native=null;
  try{native=nativeUpdater()}catch(e){}
  if(!native || typeof native.download!=='function'){showAndroidStatus('Atualizador interno indisponível nesta instalação. Faça backup; tente instalar o APK oficial diretamente do GitHub, sem desinstalar.');return;}
  downloadBtn.disabled=true;progress.hidden=false;progress.value=0;percentage.textContent='Preparando download seguro…';
  try{
   const downloaded=await native.download({url:androidDownload});
   if(downloaded.status!=='verified')throw Error('APK não verificado');
   androidVerified=true;percentage.textContent='APK conferido por SHA256. Pronto para instalar.';
   installBtn.hidden=false;installBtn.disabled=false;
   showAndroidStatus('Arquivo baixado dentro do Scout PRO e checksum conferido. Abrindo instalador oficial do Android…');
   await installReadyAPK();
  }catch(e){androidVerified=false;showAndroidStatus('Não foi possível baixar dentro do app: '+(e.message||String(e)));percentage.textContent='';progress.hidden=true}
  finally{downloadBtn.disabled=false;}
 };
}
function openAndroidUpdater(){
 if(!androidPanel){notify('Atualização Android não disponível nesta instalação.');return;}
 if(!androidPanel.open){
  try{androidPanel.showModal()}
  catch(e){androidPanel.setAttribute('open','');androidPanel.classList.add('scout-dialog-fallback')}
 }
 setAndroidDownload(null);
 showAndroidStatus('Verificando atualizações oficiais para Android…');
 Promise.resolve().then(()=>onlineUpdate(false)).catch(()=>{
  showAndroidStatus('Falha ao consultar versões. Confira sua conexão ou baixe o APK oficial no GitHub.');
 });
}
if(window.scoutDesktop){
 btn.textContent='Atualizar Windows';
 window.scoutDesktop.onUpdate(e=>notify(e.message));
 btn.onclick=async()=>{notify('Buscando atualizações…');const result=await window.scoutDesktop.checkUpdates();if(!result?.ok)notify(result?.message||'Verificação indisponível.')};
}else if(nativeAndroid()){
 btn.textContent='Atualizar APK';
 btn.setAttribute('aria-label','Verificar e baixar atualização APK Android');
 // Primary Android click handler is attached before native bridge setup.
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