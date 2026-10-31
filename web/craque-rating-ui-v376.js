/* OVR contextual sobre a arte original, sem alterar arquivos de imagem. */
(function(host,factory){'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else if(host){host.CRAQUE_RATING_UI_V376=api;api.boot(host).catch(e=>{
  const p=host.document.createElement('p');p.className='ct376-error';
  p.textContent='Overall contextual indisponível: '+e.message;
  (host.document.querySelector('main')||host.document.body).append(p);
 });}
})(typeof window!=='undefined'?window:null,function(){'use strict';
const OBS='scoutpro:v376:ovr:';
const observationKey=(ref,ctx)=>OBS+ref.key+':'+ctx.cardId;
const LABELS=['Finalização','Passe','Drible','Destreza','Força nas pernas','Força aérea','Defesa','GO 1','GO 2','GO 3'];
function paint(doc,parent,entry,context,result){
 parent.classList.add('ct376-art');
 let b=parent.querySelector('.ct376-ovr');
 if(!b){b=doc.createElement('span');b.className='ct376-ovr';
  for(let i=0;i<3;i++)b.append(doc.createElement('span'));parent.append(b);}
 const available=Number.isInteger(result.overall),position=context.ctx.position||entry.position;
 b.children[0].textContent=available?String(result.overall):'—';
 b.children[1].textContent=position;
 b.children[2].textContent=result.status==='observed'?'no jogo':available?'estimado':'conferir';
 b.dataset.state=result.status;
 const text=entry.name+' · '+(available?(result.label||'OVR estimado')+' '+result.overall:'OVR a conferir')+
  ' · '+position+' · '+(result.manager||'Sem técnico')+' · '+context.source+
  (available?' · '+result.spent+'/'+result.budget+' PP · saldo '+result.remaining:' · '+(context.error||result.reason||'Treino pendente'));
 b.title=text;b.setAttribute('aria-label',text);return b;
}
async function boot(w){
 const d=w.document;if(!['catalog','detail'].includes(d.body.dataset.page))return;
 const root=d.body.dataset.page==='detail'?'../':'';
 const load=(file,key)=>new Promise((resolve,reject)=>{
  if(w[key])return resolve(w[key]);
  let s=[...d.scripts].find(x=>x.src.split('?')[0].endsWith('/'+file));
  const timer=w.setTimeout(()=>reject(Error('Não foi possível carregar os dados locais.')),20000);
  const done=()=>{w.clearTimeout(timer);w[key]?resolve(w[key]):reject(Error('Componente local incompleto.'))};
  if(!s){s=d.createElement('script');s.src=root+file;d.head.append(s);}
  s.addEventListener('load',done,{once:true});s.addEventListener('error',()=>{w.clearTimeout(timer);reject(Error('Arquivo local indisponível.'))},{once:true});
 });
 const [R,C,M]=await Promise.all([
  load('craque-rating-v376.js','CRAQUE_RATING_V376'),
  load('craque-rating-context-v376.js','CRAQUE_RATING_CONTEXT_V376'),
  load('craque-managers-v302.js','CRAQUE_MANAGERS_V302')]);
 await M.load();
 await load('craque-card-review-v379.js','CRAQUE_CARD_REVIEW_V379');
 // Receipts use the existing edition checks; no additional equipment is inferred.
 await load('skills-booster-v162.js','SCOUT_RECOMMENDATIONS_V162');
 const P=await load('craque-positional-v311.js','CRAQUE_POSITIONAL_V311');
 const Progress=await load('craque-progress-consistency-v249.js','CRAQUE_PROGRESS_CONSISTENCY_V249');
 const read=async file=>{const r=await w.fetch(root+file);if(!r.ok)throw Error('Catálogo local indisponível.');return r.json()};
 const [data,model,original,owned,corrections,Archive]=await Promise.all([
  read('ct376-card-references.json'),read('ct376-rating-model.json'),read('SCOUT_V69_AUDITORIA.json'),read('ct364-owned-cards.json'),
  read('ct377-identity-corrections.json'),load('craque-identity-archive-v377.js','CRAQUE_IDENTITY_ARCHIVE_V377')]);
 w.CRAQUE_REFERENCES_V376=data;
 const cards=new Map([...original.cards.map(c=>['cap:'+c.numero,c]),...owned.cards.map(c=>[c.key,c])]);
 const refs=new Map(data.cards.map(c=>[c.key,c]));
 const images=new Map(data.cards.map(c=>[c.image.split('/').pop(),c]));
 const Review=w.CRAQUE_CARD_REVIEW_V379;
 const descriptors=new Map(Review.catalog(original.cards,owned.cards).map(c=>[c.key,c]));
 const infoBases=new Map();
 function paintInfoCatalog(){
  let changed=false;
  for(const tile of d.querySelectorAll('.player-card[data-cap],.ct364-player-card[data-owned-id]')){
   const key=tile.dataset.ownedId||'cap:'+Number(tile.dataset.cap),descriptor=descriptors.get(key);
   if(!descriptor)continue;
   const info=Review.infoRead(w.localStorage,descriptor);if(!info)continue;
   const pp=tile.querySelector('.pp');if(pp)pp.textContent=(info.pp??'—')+' PP';
   const tag=tile.querySelector('.ct364-card-tag');if(tag)tag.textContent='Nível máx. '+(info.maxLevel??'pendente')+' · '+(info.pp??'—')+' PP';
   const rarity=tile.querySelector('.mini-rarity');
   if(rarity){rarity.textContent=info.rarity;rarity.className='mini-rarity'+({'SHOW TIME':' show','BIG TIME':' big','DISTINGUIDO':' hl'}[info.rarity]||'');}
   if(tile.dataset.rarity!==info.rarity){tile.dataset.rarity=info.rarity;changed=true;}
  }
  if(changed)d.getElementById('search')?.dispatchEvent(new w.Event('input'));
 }
 function showInfo(ref,parent){
  const descriptor=descriptors.get(ref.key);if(!descriptor)return;
  if(!infoBases.has(ref.key)){
   const context=state(ref).context,card=cards.get(ref.key);
   const types={Epic:'ÉPICA','Big Time':'BIG TIME','Show Time':'SHOW TIME',Highlight:'DISTINGUIDO',Standard:'NORMAL'};
   infoBases.set(ref.key,{maxLevel:context.maxLevel,pp:context.ctx.budget,
    rarity:card.rarity||types[ref.reference?.type]||
     (ref.capture!==null?d.querySelector('.detail-overline .tiny-chip.gold')?.textContent.trim():'')||'',
    maxOverall:ref.ownerMaximumOverall?.value??card.max_overall??null});
  }
  const base=infoBases.get(ref.key),values=Review.infoValues(w.localStorage,descriptor,base);
  const saved=Review.infoRead(w.localStorage,descriptor),stamp=JSON.stringify([ref.key,values,saved?.updatedAt]);
  let editor=parent.querySelector('.ct-card-info-editor');
  if(!editor){editor=mk('section');editor.className='ct-card-info-editor';parent.append(editor);}
  if(editor.dataset.stamp===stamp)return;
  const wasOpen=editor.dataset.card===ref.key&&editor.querySelector('form')?.hidden===false;
  editor.dataset.card=ref.key;editor.dataset.stamp=stamp;editor.replaceChildren();
  editor.append(mk('h2','Informações da carta'));
  editor.append(mk('p','Nível máximo: '+(values.maxLevel??'pendente')+' · '+(values.pp??'pendente')+
   ' PP · '+(values.rarity||'Raridade pendente')+' · Overall máximo: '+(values.maxOverall??'não informado')));
  editor.append(mk('p','Overall máximo é informativo e separado do Overall da ficha. Os treinos aprovados são preservados.'));
  if(saved&&!saved.mathOk)editor.append(mk('p','Nível e PP incompatíveis: cálculos pendentes até corrigir os dados.'));
  const open=mk('button','EDITAR INFORMAÇÕES DA CARTA');open.type='button';
  const form=mk('form');form.hidden=!wasOpen;form.id='ct-card-info-'+ref.key.replace(/[^a-z0-9-]/gi,'-');
  open.setAttribute('aria-controls',form.id);open.setAttribute('aria-expanded',String(wasOpen));
  open.onclick=()=>{form.hidden=!form.hidden;open.setAttribute('aria-expanded',String(!form.hidden));};
  const fields={};
  for(const [key,title,min,max] of [['maxLevel','Nível máximo da carta',1,120],['pp','Pontos de Progresso (PP)',0,1000],
   ['rarity','Raridade da carta'],['maxOverall','Overall máximo da carta (informativo)',1,150]]){
   const label=mk('label',title),input=mk('input');input.name=key;
   input.value=values[key]??'';input.type=key==='rarity'?'text':'number';
   input.required=key!=='maxOverall';
   if(key==='rarity')input.maxLength=80;else{input.min=String(min);input.max=String(max);input.step='1';input.inputMode='numeric';}
   label.append(input);form.append(label);fields[key]=input;
  }
  const feedback=mk('p');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  const save=mk('button','Salvar alterações');save.type='submit';
  const restore=mk('button','Restaurar valores anteriores');restore.type='button';restore.disabled=!saved?.previous;
  const changed=message=>{
   w.dispatchEvent(new w.CustomEvent('craque:data-changed',{detail:{key:Review.INFO_PREFIX+ref.key}}));
   showInfo(ref,parent);parent.querySelector('.ct-card-info-editor [role="status"]').textContent=message;
  };
  form.onsubmit=e=>{e.preventDefault();try{
   const record=Review.saveInfo(w.localStorage,descriptor,Object.fromEntries(Object.entries(fields).map(([k,input])=>[k,input.value])),base);
   changed(record.mathOk?'Alterações salvas neste dispositivo. Fichas atualizadas; treino preservado.':
    'Alterações salvas. Nível e PP incompatíveis; cálculos pendentes. Treino preservado.');
  }catch(e){feedback.textContent='Não foi possível salvar: '+e.message;}};
  restore.onclick=()=>{try{Review.restoreInfo(w.localStorage,descriptor);changed('Valores anteriores restaurados.');}
   catch(e){feedback.textContent='Não foi possível restaurar: '+e.message;}};
  form.append(save,restore,mk('p','PP esperados: 2 × (nível máximo − 1). Os dados são locais e incluídos no backup do aplicativo.'));
  editor.append(open,form,feedback);
 }
 const overrides=new Map();let queue=null,review=null,activeDetail=null;
 const mk=(tag,text)=>{const n=d.createElement(tag);if(text!==undefined)n.textContent=text;return n};
 function state(ref){
  const context=C.resolve(ref,cards.get(ref.key),w.localStorage,{managers:M,positional:P,progress:Progress,...overrides.get(ref.key)});
  let result=R.evaluate(ref,context.ctx,model);
  if(context.error)result={status:'pending',overall:null,reason:context.error};
  if(C.valid(context.ctx.training))try{
   const proof=R.readObservation(JSON.parse(w.localStorage.getItem(observationKey(ref,context.ctx))||w.localStorage.getItem(OBS+ref.key)||'null'),ref,context.ctx,model);
   if(proof)result={...result,status:'observed',label:'Observado no jogo',overall:proof.overall,
    manager:context.ctx.manager?.name||'Sem técnico',spent:C.cost(context.ctx.training),budget:context.ctx.budget,
    remaining:context.ctx.budget-C.cost(context.ctx.training)};
  }catch(_){context.warning+=' Registro de OVR ilegível; preservado.';}
  return {context,result};
 }
 function showPanel(ref,parent){
  let panel=parent.querySelector('.ct376-panel');
  if(!panel){panel=mk('details');panel.className='ct376-panel';parent.append(panel);}
  const previousOpen=panel.open;panel.replaceChildren();panel.open=previousOpen;
  const {context,result}=state(ref),ctx=context.ctx;
  panel.append(mk('summary','Overall, nível e treino atual'));
  panel.append(mk('p',Number.isInteger(result.overall)?
   (result.label||'OVR estimado')+': '+result.overall+' · '+ctx.position+' · '+(ctx.manager?.name||'Sem técnico'):
   'OVR a conferir: '+(context.error||result.reason)));
  panel.append(mk('p','Nível máximo: '+(context.maxLevel??'pendente')+
   (ref.capture===null?' · conferir edição':/^catalogo_publico_/.test(cards.get(ref.key).pp_origem||'')?' · referência pública':' · cadastro')+
   ' · Orçamento: '+(ctx.budget??'pendente')+' PP'+
   (C.valid(ctx.training)?' · Distribuídos: '+C.cost(ctx.training)+' · Saldo: '+(ctx.budget-C.cost(ctx.training)):'')));
  panel.append(mk('p',context.source+'. '+context.warning));
  const maximum=Review.infoValues(w.localStorage,descriptors.get(ref.key),{maxOverall:ref.ownerMaximumOverall?.value??null}).maxOverall;
  if(maximum!==null)panel.append(mk('p','Máximo informado por você: '+maximum+
   ' OVR. Técnico e distribuição desse máximo ainda não foram vinculados; esta referência não altera o cálculo do treino atual.'));
  panel.append(mk('p','O cálculo é uma estimativa independente. O número máximo do banco não substitui seu treino. Bônus extras entram apenas com equipamento confirmado.'));
  for(const text of result.warnings||[])panel.append(mk('p',text));
  if(ref.reference){const link=mk('a','Ver referência desta edição ↗');link.href=ref.reference.url;link.target='_blank';link.rel='noopener noreferrer';panel.append(link);}
  if(ref.reference?.levelSourceUrl&&ref.reference.levelSourceUrl!==ref.reference.url){
   const link=mk('a',' · Referência do nível máximo ↗');link.href=ref.reference.levelSourceUrl;link.target='_blank';link.rel='noopener noreferrer';panel.append(link);
  }
  const correction=corrections.cards.find(c=>c.capture===ref.identityCorrectionKey);
  if(correction){
   const history=mk('details');history.className='ct377-history';
   history.append(mk('summary','Histórico anterior à correção da edição'));
   history.append(mk('p','Somente consulta. Estes treinos e comprovantes não são aplicados à identidade corrigida.'));
   history.append(mk('p',correction.beforeCanonical.versao+' · ID '+correction.beforeCanonical.id+
    ' · '+correction.beforeCanonical.pp+' PP · distribuição anterior: '+correction.beforeCanonical.niveis.join(' / ')));
   const local=Archive.read(w.localStorage,correction);
   for(const item of local.items){const entry=mk('details'),pre=mk('pre',item.raw);pre.style.whiteSpace='pre-wrap';pre.style.overflowWrap='anywhere';
    entry.append(mk('summary',item.kind),pre);history.append(entry);}
   for(const warning of local.warnings)history.append(mk('p',warning));
   if(!local.items.length)history.append(mk('p','Nenhum registro local compatível encontrado para a identidade anterior.'));
   panel.append(history);
  }
  const form=mk('form');form.className='ct376-training-form';
  form.append(mk('p','Confira no jogo e informe os níveis das categorias do seu treino atual. Esta confirmação só atualiza a exibição no app.'));
  const inputs=LABELS.map((text,i)=>{
   const label=mk('label',text),input=mk('input');input.type='number';input.min='0';input.max='20';input.step='1';
   input.required=true;input.value=C.valid(ctx.training)?String(ctx.training[i]):'';
   label.append(input);form.append(label);return input;
  });
  const consent=mk('input');consent.type='checkbox';const label=mk('label');
  label.className='ct376-consent';label.append(consent,mk('span','Conferi esta distribuição no jogo.'));form.append(label);
  const save=mk('button','Confirmar treino atual');save.type='submit';form.append(save);
  const feedback=mk('p');feedback.setAttribute('role','status');form.append(feedback);
  form.onsubmit=e=>{e.preventDefault();try{
   C.saveTraining(ref,w.localStorage,inputs.map(x=>x.value===''?NaN:Number(x.value)),ctx.budget,consent.checked,ctx.cardId);
   w.dispatchEvent(new w.Event('craque:data-changed'));refresh();
  }catch(e){feedback.textContent=e.message}};
  panel.append(form);
  const observedForm=mk('form'),observedLabel=mk('label','OVR que aparece no jogo com este treino e técnico: '),observed=mk('input');
  observed.type='number';observed.min='40';observed.max='120';observed.required=true;observedLabel.append(observed);
  const observedConsent=mk('input');observedConsent.type='checkbox';const observedCheck=mk('label');
  observedCheck.append(observedConsent,mk('span','Conferi o número no jogo com este mesmo técnico e treino.'));
  const observedSave=mk('button','Registrar OVR observado');observedSave.type='submit';
  const observedFeedback=mk('p');observedFeedback.setAttribute('role','status');
  observedForm.append(observedLabel,observedCheck,observedSave,observedFeedback);
  observedForm.onsubmit=e=>{e.preventDefault();try{
   const current=state(ref).context.ctx;
   const proof=R.observation(ref,current,model,Number(observed.value),observedConsent.checked);
   w.localStorage.setItem(observationKey(ref,current),JSON.stringify(proof));w.dispatchEvent(new w.Event('craque:data-changed'));refresh();
  }catch(e){observedFeedback.textContent=e.message}};
  panel.append(observedForm);
 }
 function refresh(){
  if(queue!==null)w.cancelAnimationFrame(queue);queue=null;
  paintInfoCatalog();
  for(const img of d.querySelectorAll('.card-art img,.ct364-card-art img,.side-art img,.mobile-profile>img,.ct361-glance-art img,#ct364-dialog-art')){
   const ref=images.get(decodeURIComponent(img.src.split('/').pop().split('?')[0]));if(!ref)continue;
   const {context,result}=state(ref);paint(d,img.parentElement,ref,context,result);
   if(d.body.dataset.page==='detail')activeDetail=ref;
  }
  if(activeDetail){const target=d.querySelector('.profile-content')||d.querySelector('main');if(target){showPanel(activeDetail,target);showInfo(activeDetail,target);
   const v=Review.infoValues(w.localStorage,descriptors.get(activeDetail.key),infoBases.get(activeDetail.key));
   const pp=d.querySelector('.hero-kpi strong');if(pp)pp.textContent=(v.pp??'—')+' PP';
   const rarity=d.querySelector('.detail-overline .tiny-chip.gold');if(rarity&&v.rarity)rarity.textContent=v.rarity;
   const mobileRarity=d.querySelector('.mobile-profile div > div[style]');if(mobileRarity&&v.rarity)mobileRarity.textContent=v.rarity;
  }}
  const dialog=d.getElementById('ct364-dialog');
  if(dialog?.open){const ref=refs.get(dialog.dataset.ct376Key);const target=d.getElementById('ct364-panel');if(ref&&target){showPanel(ref,target);showInfo(ref,target);}}
  if(review?.open)renderReview();
 }
 const schedule=()=>{if(queue===null)queue=w.requestAnimationFrame(()=>{queue=null;refresh()})};
 function renderReview(){
  const body=review.querySelector('.ct376-review-body');body.replaceChildren();
  for(const ref of data.cards){const row=mk('p'),{context,result}=state(ref),link=mk('a',ref.name+' · '+ref.position);
   if(ref.file)link.href=root+ref.file;else {link.href='#ct364-owned-section';link.onclick=()=>d.querySelector('[data-owned-id="'+ref.key+'"]')?.click();}
   row.append(link,mk('span',' — '+(result.overall===null?'OVR pendente':(result.label||'OVR estimado')+' '+result.overall)+
    ' · máximo '+(context.maxLevel??'pendente')+' · '+(context.ctx.budget??'?')+' PP · '+
    (context.error||result.reason||context.source)));
   body.append(row);
  }
 }
 if(d.body.dataset.page==='catalog'){
  review=mk('details');review.className='ct376-panel ct376-review';
  review.append(mk('summary','Revisão das minhas 261 cartas · níveis, PP e Overall'));
  review.append(mk('p','As referências públicas não comprovam o treino ou equipamento da sua conta. Abra a ficha para conferir sua distribuição.'));
  const body=mk('div');body.className='ct376-review-body';review.append(body);
  (d.querySelector('main')||d.body).append(review);review.addEventListener('toggle',()=>{if(review.open)renderReview()});
 }
 for(const name of ['craque:data-changed','scoutpro:manager-selected-v302','storage'])w.addEventListener(name,schedule);
 w.addEventListener('scoutpro:lab-changed-v218',schedule);
 w.addEventListener('scoutpro:v324:context-selected',e=>{
  const c=e.detail?.context;if(!c)return;
  const ref=data.cards.find(r=>r.cardKey===c.cardKey&&String(r.cardId)===String(c.cardId));
  if(ref){overrides.set(ref.key,{position:c.position,style:c.style});schedule();}
 });
 w.addEventListener('craque:owned-context-changed',e=>{
  const c=e.detail;if(!refs.has(c?.key))return;
  overrides.set(c.key,{position:c.position,style:c.style});
  const dialog=d.getElementById('ct364-dialog');if(dialog)dialog.dataset.ct376Key=c.key;schedule();
 });
 // Only newly inserted images matter: badge/text updates never trigger another refresh.
 new w.MutationObserver(rows=>{if(rows.some(row=>[...row.addedNodes].some(n=>n.nodeType===1&&
  (n.tagName==='IMG'||n.querySelector?.('img')))))schedule();}).observe(d.body,{childList:true,subtree:true});
 w.dispatchEvent(new w.CustomEvent('craque:references-ready'));
 refresh();
 return {refresh,state};
}
return Object.freeze({paint,boot,observationKey});
});
