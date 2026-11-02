/* O mesmo Meu elenco nas duas contas; executar antes dos filtros do catálogo. */
(()=>{'use strict';if(document.body?.dataset.page!=='catalog')return;
const A=window.CRAQUE_ACCOUNTS_V382,L=window.CRAQUE_ACCOUNT_LIBRARY_V385,params=new URLSearchParams(location.search),account=params.get('account')==='secondary'?'secondary':'primary',secondary=account==='secondary';
const mk=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;},grid=document.getElementById('cards');
window.CRAQUE_CATALOG_ACCOUNT_V385={account};document.body.dataset.ct385Account=account;
if(secondary){grid.replaceChildren();document.body.dataset.ct364Owned='ready';document.title='Meu elenco · Secundária | CRAQUE TÁTICO';
 const actions=document.querySelector('.hero-actions');actions.replaceChildren();for(const [href,text]of [['#catalogo','Minhas cartas'],['plano-do-time-v382.html?account=secondary','Plano da Secundária'],['manual-2027/index.html','Como jogar']]){const a=mk('a','btn',text);a.href=href;actions.append(a);}
 const notice=document.querySelector('.notice');if(notice)notice.textContent='Acervo da conta Secundária. Fichas são propostas por função, com dados e pendências desta edição. Suas cartas da Principal permanecem separadas.';
 document.querySelector('.hero-visual')?.remove();document.querySelector('.stats-strip')?.remove();document.querySelector('.lab-intro')?.remove();
}
const bar=mk('nav','ct385-account-bar');bar.setAttribute('aria-label','Escolher conta');
for(const [id,text]of [['primary','Principal'],['secondary','Secundária']]){const a=mk('a','ct385-account-tab',text);a.id='ct385-account-'+id;a.href='index.html?account='+id;if(id===account)a.setAttribute('aria-current','page');bar.append(a);}
const manage=mk('details','ct385-manage');manage.id='ct385-manage';manage.append(mk('summary','','+ Carta'));const popup=mk('div','ct385-manage-popup');popup.append(mk('strong','','Adicionar na '+L.label(account)));
const add=mk('button','','Cadastrar carta');add.id='ct385-add';add.type='button';popup.append(add);
const importLabel=mk('label','ct385-import-label','Importar cartas por arquivo'),input=mk('input');input.id='ct385-import';input.type='file';input.accept='.json,application/json';importLabel.append(input);popup.append(importLabel);
const backup=mk('button','','Exportar backup das contas');backup.type='button';backup.onclick=async()=>{try{await window.SCOUT_FILE_EXPORT.saveJson(await window.CRAQUE_BACKUP_V226.create(),'craque-backup-contas.json');status.textContent='Exportação solicitada. Confira o arquivo salvo.';}catch(e){status.textContent=e.message;}};popup.append(backup);manage.append(popup);bar.append(manage);document.querySelector('.hero .hero-text').prepend(bar);
const status=mk('p','ct385-status');status.id='ct385-catalog-status';status.setAttribute('role','status');document.getElementById('catalogo').prepend(status);
const preview=mk('section','ct385-import-preview');preview.hidden=true;preview.id='ct385-import-preview';const previewText=mk('p'),confirm=mk('button','','Confirmar importação nesta conta'),cancel=mk('button','','Cancelar');confirm.id='ct385-confirm-import';confirm.type=cancel.type='button';preview.append(previewText,confirm,cancel);status.after(preview);let pending=null;
input.onchange=async()=>{pending=null;preview.hidden=true;try{const file=input.files[0];if(!file)return;if(file.size>A.MAX_BYTES)throw Error('Arquivo excede3MB.');const data=JSON.parse(await file.text()),result=L.previewImport(localStorage,account,data);pending=data;
 previewText.textContent='Destino: '+result.accountLabel+' · '+result.added+' novas cartas. '+result.cards.slice(0,12).map(c=>c.name+' · '+(c.edition||'edição pendente')).join('; ')+(result.cards.length>12?' …':'');preview.hidden=false;manage.open=false;preview.scrollIntoView({block:'center'});
 }catch(e){status.textContent=e.message;status.dataset.error='true';}finally{input.value='';}};
cancel.onclick=()=>{pending=null;preview.hidden=true;};confirm.onclick=()=>{try{if(!pending)return;L.importCards(localStorage,account,pending);window.dispatchEvent(new Event('craque:data-changed'));location.href='index.html?account='+account;}catch(e){status.textContent=e.message;status.dataset.error='true';}};
add.onclick=()=>{manage.open=false;window.CRAQUE_ACCOUNT_EDITOR_V385.open({accountId:account,onSaved:id=>{location.href='index.html?account='+id;}});};
const empty=mk('section','ct385-empty');empty.id='ct385-empty';empty.append(mk('h2','','Seu elenco começa aqui.'),mk('p','','Esta é a conta '+L.label(account)+'. Importe o arquivo das suas cartas ou cadastre uma nova carta.'));const emptyAdd=mk('button','','Adicionar primeira carta');emptyAdd.type='button';emptyAdd.onclick=()=>add.click();empty.append(emptyAdd);grid.after(empty);
try{const cards=A.read(localStorage)[account].cards;empty.hidden=!secondary||cards.length>0;
 for(const [i,c]of cards.entries()){const a=mk('a','player-card');a.dataset.accountCard=c.id;a.dataset.cap=String(500000+i);a.dataset.name=c.name;a.dataset.position=c.position;a.dataset.role=c.position;a.dataset.rarity=c.rarity||'A conferir';a.dataset.style=c.offenseStyle||'Não informado';a.dataset.styleDefense=c.defenceStyle;a.dataset.search=[c.name,c.edition,c.cardId,c.position,c.offenseStyle,c.defenceStyle,c.rarity].join(' ');
  a.href='ficha-da-conta-v385.html?account='+account+'&id='+encodeURIComponent(c.id);const art=mk('div','card-art');art.append(mk('span','mini-cap',L.label(account)),mk('span','mini-rarity',c.rarity||'Edição cadastrada'));
  if(c.image){const img=mk('img');img.src=c.image;img.alt='Carta cadastrada de '+c.name;img.loading='lazy';img.decoding='async';art.append(img);}else art.append(mk('span','ct385-art-placeholder','Arte a adicionar'));
  const main=mk('div','player-main');main.append(mk('span','player-role',c.position+' · '+(c.offenseStyle||'Estilo a conferir')),mk('div','player-name',c.name),mk('div','player-version',c.edition||'Edição a conferir'));
  const bottom=mk('div','player-bottom');bottom.append(mk('span','pp',c.pp===null?'PP a conferir':c.pp+' PP'),mk('span','status wait','Ficha por função'),mk('span','v68-mini-label',c.maxLevel===null?'Nível máximo a conferir':'Nível máximo '+c.maxLevel));main.append(bottom);a.append(art,main);grid.append(a);
 }
 document.body.dataset.ct385Catalog='ready';
}catch(e){status.textContent=e.message;status.dataset.error='true';add.disabled=true;input.disabled=true;empty.hidden=true;document.body.dataset.ct385Catalog='error';}
const setText=(el,s)=>{if(el&&el.textContent!==s)el.textContent=s;},setHref=(el,s)=>{if(el&&el.getAttribute('href')!==s)el.setAttribute('href',s);};
function sync(){setHref(document.querySelector('.topbar .brand'),'index.html?account='+account);const mark=document.getElementById('ct361-home-mark');if(mark)mark.hidden=true;
 if(secondary){const quick=[...document.querySelectorAll('.scout-v189-quick>a')];for(const [i,href,title]of [[1,'index.html?account=primary','Conta Principal'],[2,'plano-do-time-v382.html?account=secondary','Escalação'],[3,'plano-do-time-v382.html?account=secondary','Laboratório']]){setHref(quick[i],href);setText(quick[i]?.querySelector('strong'),title);}
  for(const a of document.querySelectorAll('a[href="conferir-cartas.html"]')){setHref(a,'index.html?account=secondary#catalogo');setText(a,'Conferir acervo →');}
  const tools=document.querySelector('.scout-v189-extra-links');if(tools){for(const a of tools.querySelectorAll('a')){const href=a.getAttribute('href')||'';if(href.includes('tecnicos-v307')){setHref(a,'plano-do-time-v382.html?account=secondary#manager');setText(a,'Técnicos da Secundária →');}else if(/outros-elencos|fichas\/|revisao|progresso|raridade|player-model|pesquisa/.test(href))a.remove();}}
  for(const a of document.querySelectorAll('#scout-app-bar a[href]')){const href=a.getAttribute('href');if(href==='index.html')setHref(a,'index.html?account=secondary');else if(href==='outros-elencos-v227.html'){setHref(a,'index.html?account=primary');setText(a,'Principal');}else if(/^(?:meu-time|tecnicos-v307)/.test(href))setHref(a,'plano-do-time-v382.html?account=secondary');}
  const footer=document.querySelector('.footer');setText(footer,'CRAQUE TÁTICO · MEU ELENCO · CONTA SECUNDÁRIA · DADOS LOCAIS');
 }
 const clear=document.getElementById('scout-v205-clear');if(clear&&secondary)clear.setAttribute('aria-label','Limpar filtros da Secundária');
}
document.addEventListener('DOMContentLoaded',()=>{sync();window.CRAQUE_CATALOG_V379?.refresh();});window.addEventListener('load',sync);window.addEventListener('craque:owned-cards-ready',sync);
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;sync();if(document.querySelector('.scout-v189-home')&&document.getElementById('ct382-accounts'))observer.disconnect();});});observer.observe(document.body,{childList:true,subtree:true});
setTimeout(()=>observer.disconnect(),12000);
})();
