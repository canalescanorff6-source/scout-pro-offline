/* As rotas antigas continuam explicitamente na Principal. */
(()=>{'use strict';if(window.CRAQUE_ACCOUNT_UI_V382)return;window.CRAQUE_ACCOUNT_UI_V382=true;
const script=document.currentScript,root=new URL('.',script.src),bar=document.createElement('nav');bar.id='ct382-accounts';bar.setAttribute('aria-label','Contas e plano do time');
Object.assign(bar.style,{display:'flex',gap:'10px',flexDirection:'column',padding:'10px 0',color:'#f0e9e3',fontSize:'13px'});
const label=document.createElement('span');label.textContent='Esta tela: conta Principal';bar.append(label);
for(const [account,text]of [['primary','Plano da Principal →'],['secondary','Conta Secundária →']]){const a=document.createElement('a');a.href=new URL('plano-do-time-v382.html?account='+account,root).href;a.textContent=text;a.style.color='#e5a7b8';bar.append(a);}
// Reutilizar o menu: uma faixa extra tirava a primeira carta da abertura em320px.
const mount=()=>{const target=document.querySelector('.scout-v189-dock-options,#ct362-navtools');if(!target)return false;target.append(bar);return true;};
if(mount())return;
const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>observer.disconnect(),10000);
})();
