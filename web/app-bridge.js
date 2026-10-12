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
async function onlineUpdate(auto=false){
 if(!repo||!/^[-\w.]+\/[-\w.]+$/.test(repo)){notify('Configure a variável SCOUT_GITHUB_REPO no projeto.');return;}
 if(!navigator.onLine){notify('Sem internet: o Scout PRO continua funcionando offline.');return;}
 notify('Verificando nova versão no GitHub…');
 try{const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
 const resp=await fetch('https://api.github.com/repos/'+repo+'/releases/latest',{signal:controller.signal,headers:{Accept:'application/vnd.github+json'},cache:'no-store'});clearTimeout(timer);
 if(!resp.ok)throw Error('Não foi possível verificar (HTTP '+resp.status+').');const data=await resp.json();
 const installed=String(window.SCOUT_VERSION||'1.0.0'), newest=String(data.tag_name||'').replace(/^v/,'');
 const compare=(a,b)=>{const A=a.split('.').map(Number),B=b.split('.').map(Number);for(let i=0;i<3;i++){if((A[i]||0)!==(B[i]||0))return (A[i]||0)>(B[i]||0)?1:-1}return 0};
 if(compare(newest,installed)<=0){notify('Versão '+installed+' atualizada.');return;}
 const apk=(data.assets||[]).find(x=>/ScoutPRO-Android\.apk$/i.test(x.name));
 notify('Nova versão '+newest+' disponível! Instalação Android exige confirmação.');
 const url=(apk&&apk.browser_download_url)||data.html_url;
 if(url){if(auto){btn.textContent='Baixar versão';btn.onclick=()=>openReleaseLink(url).catch(e=>notify(e.message))}else if(confirm('Scout PRO '+newest+' disponível! Abrir a página do GitHub para instalar a nova versão?'))openReleaseLink(url).catch(e=>notify(e.message));}
 }catch(e){notify('Não foi possível consultar atualizações. Offline permanece disponível.');}
}
if(window.scoutDesktop){window.scoutDesktop.onUpdate(e=>notify(e.message));btn.onclick=async()=>{notify('Buscando atualizações…');const result=await window.scoutDesktop.checkUpdates();if(!result?.ok)notify(result?.message||'Verificação indisponível.')};}
else{btn.onclick=()=>onlineUpdate(false);setTimeout(()=>{if(navigator.onLine)onlineUpdate(true)},16000);}
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