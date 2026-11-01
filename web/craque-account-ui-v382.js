/* As rotas antigas continuam explicitamente na Principal. */
(()=>{'use strict';if(document.getElementById('ct382-accounts'))return;
const script=document.currentScript,root=new URL('.',script.src),bar=document.createElement('nav');bar.id='ct382-accounts';bar.setAttribute('aria-label','Contas e plano do time');
Object.assign(bar.style,{display:'flex',gap:'12px',flexWrap:'wrap',padding:'12px 18px',background:'#29292e',borderBottom:'1px solid #48454b',color:'#f0e9e3',fontSize:'13px',position:'relative',zIndex:'2'});
const label=document.createElement('span');label.textContent='Esta tela: conta Principal';bar.append(label);
for(const [account,text]of [['primary','Plano da Principal →'],['secondary','Conta Secundária →']]){const a=document.createElement('a');a.href=new URL('plano-do-time-v382.html?account='+account,root).href;a.textContent=text;a.style.color='#e5a7b8';bar.append(a);}
document.body.prepend(bar);
})();
