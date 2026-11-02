(function(g){'use strict';
const arrows=['→','↘','↓','↙','←','↖','↑','↗'],turn={right:0,down:2,left:4,up:6};
function rotateArrows(text,facing){return text.replace(/[→↘↓↙←↖↑↗]/g,a=>arrows[(arrows.indexOf(a)+(turn[facing]||0))%8]);}
const norm=t=>String(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filter(items,query,group){const q=norm(query).trim();return items.filter(f=>(!group||f.group===group)&&norm([f.name,f.aliases,f.requirement,...f.steps].join(' ')).includes(q));}
const paths={front:'M45 52L75 52',back:'M55 52L25 52',side:'M50 65L50 24',diagonal:'M34 67L70 31','back-diagonal':'M66 67L30 31','front-arc':'M50 20C94 20 94 84 50 84','back-arc':'M50 20C6 20 6 84 50 84','tap-slide':'M45 52L75 52','ball-slide':'M45 52L75 52',exit:'M45 52L75 52'};
function pad(gesture,hand,key,facing){const id='gesture-'+key+'-'+hand,angle=(turn[facing]||0)*45;const tap=gesture==='tap'||gesture==='triple-tap',free=gesture==='exit';
 return `<svg viewBox="0 0 110 130" aria-hidden="true" focusable="false"><defs><marker id="${id}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L5 3L0 6" fill="none" stroke="#d5bd91" stroke-width="1.2"/></marker></defs><circle cx="55" cy="52" r="38" fill="#26262b" stroke="#73616b"/><circle cx="55" cy="52" r="21" fill="#863e54" opacity=".45"/><g transform="rotate(${free?0:angle} 55 52)">${free?'<text x="55" y="56" text-anchor="middle" fill="#c2b7b8" font-size="10">saída</text>':tap?'<circle cx="55" cy="52" r="11" fill="none" stroke="#e8acbd" stroke-width="2"/>':'<path d="'+(paths[gesture]||paths.front)+'" fill="none" stroke="#d5bd91" stroke-width="2.5" stroke-linecap="round" marker-end="url(#'+id+')"/>'}</g>${tap?'<text x="55" y="56" text-anchor="middle" fill="#f3ede4" font-size="11">'+(gesture==='triple-tap'?'3×':'1×')+'</text>':''}<text x="55" y="112" text-anchor="middle" fill="#f3ede4" font-size="9">${hand==='D'?'D · Acelerar':'E · Direcional'}</text></svg>`;
}
function mount(){const D=g.CT_GUIDE,root=document.getElementById('feint-list');if(!root||!D?.feints)return;
 const $=id=>document.getElementById(id),make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};let facing='right';
 function draw(){const found=filter(D.feints.items,$('feint-search').value,$('feint-group').value);root.replaceChildren();$('feint-count').textContent=found.length+' de '+D.feints.items.length+' fichas nesta seleção.';
  for(const f of found){const box=make('article',undefined,'feint-card');box.id='finta-'+f.id;box.append(make('p',f.group==='Base'?'FINTA AVANÇADA · BASE':f.group.toUpperCase(),'eyebrow'),make('h3',f.name),make('p',f.aliases,'feint-alias'));box.append(make('p',f.sources.includes('finta-lista')?'Lista touchscreen · captura':f.sources.includes('finta-recepcao')?'Tutorial touchscreen · captura':'Demonstração independente · confira na Lista','feint-evidence'));
   const drawing=make('div',undefined,'finger-map');drawing.innerHTML=pad(f.left,'E',f.id,facing)+pad(f.right,'D',f.id,facing);box.append(drawing);
   const ol=make('ol');for(const t of f.steps)ol.append(make('li',rotateArrows(t,facing)));box.append(ol);
   if(f.id==='trap-through')box.append(make('p','Atenção: o desenho gira como exemplo; no jogo, acompanhe o sentido real da bola.','feint-important'));
   box.append(make('p',f.requirement,'feint-requirement'));
   const details=make('details'),summary=make('summary','Quando usar, erros e treino');details.append(summary,make('h4','Quando usar'),make('p',f.use),make('h4','Evite'),make('p',f.avoid),make('h4','Leve para o treino'),make('p',f.drill),make('p',rotateArrows(f.variants,facing),'editorial-note'));box.append(details);
   const refs=make('div',undefined,'source-inline');for(const id of f.sources){const s=D.sources.find(s=>s.id===id),a=make('a',s.title);a.href='#fonte-'+id;refs.append(a);}box.append(refs);root.append(box);
  }
  $('feint-empty').hidden=found.length!==0;
 }
 $('feint-setup').textContent=D.feints.setup;$('feint-legend').textContent=D.feints.legend;$('feint-scope').textContent=D.feints.scope;
 $('feint-search').addEventListener('input',draw);$('feint-group').addEventListener('change',draw);
 for(const b of document.querySelectorAll('[data-feint-facing]'))b.addEventListener('click',()=>{facing=b.dataset.feintFacing;for(const other of document.querySelectorAll('[data-feint-facing]'))other.setAttribute('aria-pressed',String(other===b));$('feint-facing-note').textContent='Jogador voltado para '+{right:'a direita →',up:'cima ↑',left:'a esquerda ←',down:'baixo ↓'}[facing]+'. As setas dos gestos foram giradas junto com o corpo.';draw();});
 $('feint-clear').addEventListener('click',()=>{$('feint-search').value='';$('feint-group').value='';draw();$('feint-search').focus();});draw();
}
const api={rotateArrows,filter};if(typeof module!=='undefined'&&module.exports)module.exports=api;else{g.CT_FEINTS_UI=api;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();}
})(typeof window!=='undefined'?window:globalThis);
