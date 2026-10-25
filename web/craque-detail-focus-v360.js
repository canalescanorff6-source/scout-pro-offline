/* V360 — navegação compacta e seções avançadas recolhíveis das fichas originais.
 * Não altera o conteúdo, dados, builders, inputs, estado de treino ou links.
 */
(function(host){'use strict';
 const doc=host?.document;if(!doc)return;
 function init(){
  if(doc.body?.dataset.page!=='detail'||doc.getElementById('ct360-card-quick'))return;
  const content=doc.querySelector('.profile-content');
  if(!content)return;
  const items=[
   ['foco','Foco'],['pontos','Treinamento'],['jogar','Como jogar'],
   ['performance','Laboratório'],['status','Status']
  ].filter(([id])=>Boolean(doc.getElementById(id)));
  if(!items.length)return;
  for(const [id,label] of [['performance','Laboratório de performance'],['status','Status finais e bônus']]){
   const section=doc.getElementById(id);
   if(!section||section.closest('details.ct360-card-extra'))continue;
   const wrap=doc.createElement('details');wrap.className='ct360-card-extra';
   const title=doc.createElement('summary');title.textContent=label+' · abrir análise';
   wrap.appendChild(title);
   section.parentNode.insertBefore(wrap,section);
   wrap.appendChild(section);
  }
  const nav=doc.createElement('nav');nav.id='ct360-card-quick';
  nav.className='ct360-card-quick';nav.setAttribute('aria-label','Acesso rápido à ficha do jogador');
  for(const [id,label] of items){
   const a=doc.createElement('a');a.href='#'+id;a.textContent=label;
   nav.appendChild(a);
  }
  const header=content.querySelector('.detail-header');
  if(header)header.insertAdjacentElement('afterend',nav);
  else content.prepend(nav);
  function revealAnchor(){
   const id=decodeURIComponent((host.location.hash||'').replace(/^#/,''));if(!id)return;
   const target=doc.getElementById(id);
   for(let extra=target?.closest('details.ct360-card-extra');extra;extra=extra.parentElement?.closest('details.ct360-card-extra')){
    extra.open=true;
   }
  }
  doc.addEventListener('click',event=>{
   const a=event.target?.closest?.('a[href^="#"]');
   if(!a)return;
   const id=String(a.getAttribute('href')||'').slice(1);
   const target=id?doc.getElementById(id):null;
   const wrapper=target?.closest('details.ct360-card-extra');
   if(wrapper)wrapper.open=true;
  });
  host.addEventListener('hashchange',revealAnchor);
  revealAnchor();
 }
 if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})(typeof window!=='undefined'?window:null);
