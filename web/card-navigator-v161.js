(()=>{'use strict';
if(document.body?.dataset.page!=='detail'||document.getElementById('scout-card-navigator'))return;
const match=location.pathname.match(/\/fichas\/(\d{3})_[^/]+\.html$/i);
if(!match)return;
const current=Number(match[1]);
const style=document.createElement('style');style.textContent=`
#scout-card-navigator{position:relative;z-index:5;display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin:12px 0 18px;padding:12px;border:1px solid #33536b;background:#0d2234;color:#e8f5ff;border-radius:14px}
#scout-card-navigator button{border:1px solid #47728a;border-radius:9px;background:#173d56;color:#f3faff;padding:10px 13px;min-height:44px;font-weight:700;cursor:pointer}
#scout-card-navigator button:disabled{opacity:.4;cursor:not-allowed}
#scout-card-navigator .scout-nav-count{font-size:13px;color:#a8ccda;margin-right:auto}
#scout-card-search{position:fixed;inset:0;z-index:99998;background:rgba(0,8,16,.82);display:flex;align-items:center;justify-content:center;padding:16px}
#scout-card-search[hidden]{display:none}
#scout-card-search .scout-search-panel{width:min(520px,100%);max-height:85vh;overflow:auto;background:#10273a;border:1px solid #50758a;border-radius:16px;padding:20px;color:#fff}
#scout-card-search input{box-sizing:border-box;width:100%;min-height:46px;padding:12px;background:#081b2b;border:1px solid #658498;border-radius:10px;color:#fff;font-size:16px}
#scout-card-search .scout-results{max-height:52vh;overflow:auto;margin-top:10px}
#scout-card-search .scout-results a{display:block;padding:12px;color:#e3f7ff;text-decoration:none;border-bottom:1px solid #345166}
#scout-card-search .scout-results a:focus,#scout-card-search .scout-results a:hover{background:#205074}
#scout-card-search .scout-search-top{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:12px}
#scout-card-search .scout-search-top button{background:#23455b;color:white;border:1px solid #62859b;border-radius:8px;padding:10px;min-height:44px}
@media(max-width:540px){#scout-card-navigator{justify-content:space-between}#scout-card-navigator .scout-nav-count{width:100%;text-align:center;margin:0}#scout-card-navigator button{flex:1;white-space:nowrap;font-size:12px;padding:10px 6px}}
`;document.head.appendChild(style);
const nav=document.createElement('nav');nav.id='scout-card-navigator';nav.setAttribute('aria-label','Navegar entre fichas');
nav.innerHTML='<span class="scout-nav-count">Carta '+String(current).padStart(3,'0')+' de 246</span><button type="button" data-move="-1" aria-label="Carta anterior">← Anterior</button><button type="button" id="scout-card-jump">⌕ Ir para carta</button><button type="button" data-move="1" aria-label="Próxima carta">Próxima →</button>';
const cardContent=document.querySelector('.profile-content');
const mobileProfile=cardContent?.querySelector('.mobile-profile');
// Sempre dentro da ficha aberta: após a arte no Android e no topo da coluna da ficha no Windows.
if(mobileProfile)mobileProfile.insertAdjacentElement('afterend',nav);
else if(cardContent)cardContent.prepend(nav);
else (document.querySelector('main')||document.body).prepend(nav);
const overlay=document.createElement('div');overlay.id='scout-card-search';overlay.hidden=true;
overlay.innerHTML='<section class="scout-search-panel" role="dialog" aria-modal="true" aria-label="Escolher carta"><div class="scout-search-top"><strong>Ir para uma carta</strong><button type="button" id="scout-search-close">✕ Fechar</button></div><input type="search" id="scout-search-input" placeholder="Nome ou número (ex.: 050, Messi)" aria-label="Buscar carta"/><div class="scout-results" id="scout-search-results" aria-live="polite"></div></section>';
document.body.appendChild(overlay);
let cards=[];let originFocus=null;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const getCards=async()=>{
 if(cards.length)return cards;
 try{
  const response=await fetch('../index.html',{cache:'no-store'});
  if(!response.ok)throw Error('catalogo indisponivel');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html');
  cards=[...doc.querySelectorAll('a.player-card[href]')].map(a=>({id:Number(a.dataset.cap),name:a.dataset.name||a.querySelector('.player-name')?.textContent||'',href:a.getAttribute('href')})).filter(a=>Number.isInteger(a.id)&&a.id>=1&&a.id<=246&&/^fichas\/[^/?#]+\.html$/.test(a.href)).sort((a,b)=>a.id-b.id);
 }catch(e){console.warn('Scout: indice de cartas indisponivel',e)}
 return cards;
};
const render=(search='')=>{
 const q=normalize(search.trim().replace(/^#/,''));
 const matches=cards.filter(c=>!q||String(c.id).includes(q)||normalize(c.name).includes(q)).slice(0,60);
 document.getElementById('scout-search-results').replaceChildren(...matches.map(c=>{
  const a=document.createElement('a');a.href='../'+c.href;a.textContent='#'+String(c.id).padStart(3,'0')+' · '+c.name;return a;
 }));
 if(!matches.length)document.getElementById('scout-search-results').textContent=cards.length?'Nenhuma carta encontrada.':'Não foi possível carregar a lista de cartas.';
};
const close=()=>{overlay.hidden=true;document.body.style.overflow='';originFocus?.focus()};
document.getElementById('scout-search-close').addEventListener('click',close);
overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close()});
document.getElementById('scout-search-input').addEventListener('input',e=>render(e.target.value));
document.getElementById('scout-card-jump').addEventListener('click',async e=>{
 originFocus=e.currentTarget;overlay.hidden=false;document.body.style.overflow='hidden';
 const input=document.getElementById('scout-search-input');input.value='';input.focus();
 await getCards();if(!overlay.hidden)render();
});
nav.querySelectorAll('[data-move]').forEach(button=>button.addEventListener('click',async()=>{
 const list=await getCards();
 const index=list.findIndex(c=>c.id===current);
 const target=list[index+Number(button.dataset.move)];
 if(target)location.href='../'+target.href;
 else if(!list.length){button.title='Índice indisponível';button.disabled=true}
}));
getCards().then(list=>{const i=list.findIndex(c=>c.id===current);nav.querySelectorAll('[data-move]').forEach(b=>{b.disabled=i<0||i+Number(b.dataset.move)<0||i+Number(b.dataset.move)>=list.length});if(list.length)nav.querySelector('.scout-nav-count').textContent='Carta '+String(current).padStart(3,'0')+' de '+list.length});
})();