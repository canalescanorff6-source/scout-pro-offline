/* As rotas antigas continuam explicitamente na Principal. */
(()=>{'use strict';if(window.CRAQUE_ACCOUNT_UI_V382)return;window.CRAQUE_ACCOUNT_UI_V382=true;
const script=document.currentScript,root=new URL('.',script.src),bar=document.createElement('nav');bar.id='ct382-accounts';bar.setAttribute('aria-label','Contas e plano do time');
Object.assign(bar.style,{display:'flex',gap:'10px',flexDirection:'column',padding:'10px 0',color:'#f0e9e3',fontSize:'13px'});
let selected=new URLSearchParams(location.search).get('account')==='secondary'?'secondary':'primary';
const label=document.createElement('span');label.textContent='Conta '+(selected==='primary'?'Principal':'Secundária');bar.append(label);
for(const [account,text,file]of [['primary','Conta Principal →','index.html'],['secondary','Conta Secundária →','index.html'],['primary','Plano da Principal →','plano-do-time-v382.html'],['secondary','Plano da Secundária →','plano-do-time-v382.html']]){const a=document.createElement('a');a.href=new URL(file+'?account='+account,root).href;a.textContent=text;a.style.color='#e5a7b8';bar.append(a);}
// V384: o manual e as fintas pertencem ao pacote offline, no menu ativo.
for(const [text,hash] of [['Como jogar · manual',''],['Fintas avançadas','#fintas']]){
 const a=document.createElement('a');a.href=new URL('manual-2027/index.html'+hash,root).href;a.textContent=text;a.dataset.ct384Guide='true';a.style.color='#e5a7b8';bar.append(a);
}
// Reutilizar o menu: uma faixa extra tirava a primeira carta da abertura em320px.
function accountNavigation(){selected=new URLSearchParams(location.search).get('account')==='secondary'?'secondary':'primary';label.textContent='Conta '+(selected==='primary'?'Principal':'Secundária');for(const a of document.querySelectorAll('#scout-app-bar a[href],.ct362-appnav a[href],header a[href]')){
 if(a.closest('#ct382-accounts'))continue;
 if(!a.dataset.ct385OriginalHref){a.dataset.ct385OriginalHref=a.getAttribute('href');a.dataset.ct385OriginalText=a.textContent;}
 const url=new URL(a.dataset.ct385OriginalHref,location.href),file=url.pathname.split('/').pop();
 if(file==='index.html'&&!url.searchParams.has('account')){url.searchParams.set('account',selected);a.href=url.href;}
 else if(file==='plano-do-time-v382.html'&&!url.searchParams.has('account')){url.searchParams.set('account',selected);a.href=url.href;}
 else if(selected==='secondary'&&file==='outros-elencos-v227.html'){a.href=new URL('index.html?account=primary',root).href;a.textContent='Principal';}
 else if(selected==='secondary'&&/^(?:meu-time|tecnicos-v307|conferir-cartas)/.test(file)){a.href=new URL('plano-do-time-v382.html?account=secondary',root).href;}
 else if(!url.searchParams.has('account')){a.href=a.dataset.ct385OriginalHref;if(a.textContent==='Principal'&&file==='outros-elencos-v227.html')a.textContent=a.dataset.ct385OriginalText;}
 }}
document.addEventListener('DOMContentLoaded',accountNavigation);window.addEventListener('load',accountNavigation);window.addEventListener('craque:account-selected',accountNavigation);
const mount=()=>{const target=document.querySelector('.scout-v189-dock-options,#ct362-navtools');if(!target)return false;target.append(bar);accountNavigation();return true;};
if(mount())return;
const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>observer.disconnect(),10000);
})();
