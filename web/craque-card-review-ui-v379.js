/* Fluxo de conferência com imagem, retomável e offline. */
(async()=>{'use strict';const R=window.CRAQUE_CARD_REVIEW_V379,$=id=>document.getElementById(id),form=$('review-form');
const feedback=(text,error=false)=>{const p=$('review-feedback');p.textContent=text;p.dataset.error=String(error);};
const mk=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
try{
 const load=async f=>{const r=await fetch(f);if(!r.ok)throw Error('Arquivo offline indisponível: '+f);return r.json();};
 const [data,own,refs]=await Promise.all(['SCOUT_V69_AUDITORIA.json','ct364-owned-cards.json','ct376-card-references.json'].map(load));
 const initial=decodeURIComponent(location.hash.slice(1))||localStorage.getItem('scoutpro:v379:review-cursor');
 const cards=R.catalog(data.cards,own.cards,refs.cards);let visible=cards.slice(),active=null,dirty=false;
 const field=(parent,key,label,type='text',options)=>{
  const l=mk('label',label),e=mk(options?'select':'input');e.name=key;
  if(options)for(const [value,text] of options){const op=mk('option',text);op.value=value;e.append(op);}
  else{e.type=type;if(type==='number'){e.min='0';e.max=key.includes('Overall')?'150':key==='pp'?'1000':'120';e.step='1';}if(key==='cardId')e.inputMode='numeric';}
  l.append(e);$(parent).append(l);return e;
 };
 field('review-identity','rarity','Raridade','text',[['','A conferir'],...['ÉPICA','BIG TIME','SHOW TIME','DISTINGUIDO','LENDÁRIA','PADRÃO','DESTAQUE','EM ALTA','OUTRA'].map(x=>[x,x])]);
 for(const [key,label] of [['cardId','Card ID (se conhecido)'],['edition','Edição / pacote'],['attackStyle','Estilo ofensivo'],['defenceStyle','Estilo defensivo']])field('review-identity',key,label);
 for(const [key,label] of [['currentLevel','Nível atual'],['maxLevel','Nível máximo'],['currentOverall','OVR atual observado'],['maxOverall','OVR máximo observado'],['pp','PP total disponível para distribuir']])field('review-progress',key,label,'number');
 const groups=['Finalização','Passe','Drible','Destreza','Força nas pernas','Força aérea','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
 groups.forEach((g,i)=>{const e=field('review-training','train'+i,g,'number');e.max='20';});
 field('review-equipment','fixedBooster','Ímpeto fixo / nativo');
 field('review-equipment','extraSlot','Segundo slot de ímpeto','text',[['pendente','A conferir'],['ausente','Não existe nesta carta'],['vazio','Existe e está vazio'],['ocupado','Existe e já está equipado']]);
 field('review-equipment','extraBooster','Ímpeto adicional já equipado');
 for(let i=0;i<5;i++)field('review-skills','skill'+i,'Adicional equipada '+(i+1));
 const value=key=>form.elements.namedItem(key).value;
 const values=()=>{const v=Object.fromEntries(new FormData(form).entries());v.equipmentReviewed=form.elements.equipmentReviewed.checked;v.skills=Array.from({length:5},(_,i)=>value('skill'+i));
  const train=Array.from({length:10},(_,i)=>value('train'+i));v.training=train.every(x=>x==='')?null:train.map(x=>x===''?NaN:Number(x));return v;};
 const stats=()=>{const n=cards.filter(c=>R.read(localStorage,c,true)).length;return n+' de '+cards.length+' cartas confirmadas';};
 const persist=confirmed=>{if(!active)return false;try{
  if(confirmed&&!$('review-owner-confirm').checked)throw Error('Marque que conferiu os campos preenchidos no jogo, ou salve como rascunho.');
  const saved=R.save(localStorage,active,values(),confirmed);dirty=false;window.dispatchEvent(new Event('craque:data-changed'));
  feedback((saved.status==='confirmed'?'Carta confirmada. ':'Rascunho salvo; ainda não altera a ficha. ')+stats());paintHistory(saved);$('review-state').textContent=saved.status==='confirmed'?'Conferida por você · dados usados na ficha':'Rascunho salvo · ficha preservada';return true;
 }catch(e){feedback(e.message,true);return false;}};
 const paintHistory=r=>{$('review-history').replaceChildren();for(const row of [...(r?.history||[]),...(r?[r]:[])].reverse()){
  $('review-history').append(mk('li',(row.status==='confirmed'?'Confirmada':'Rascunho')+' · '+new Date(row.updatedAt).toLocaleString('pt-BR')));
 }if(!r)$('review-history').append(mk('li','Nenhuma conferência salva nesta edição.'));};
 function show(card){
  if(dirty&&!persist(false))return;
  active=card;const saved=R.read(localStorage,card),source=saved||{};form.reset();
  const catalog={attackStyle:card.attackStyle,defenceStyle:card.defenceStyle,edition:card.edition,cardId:/^\d{5,20}$/.test(card.cardId)?card.cardId:''};
  for(const [key,val] of Object.entries({...catalog,...source})){const e=form.elements.namedItem(key);if(e&&typeof val!=='object'){if(e.type==='checkbox')e.checked=val===true;else e.value=val??'';}}
  for(let i=0;i<10;i++)form.elements.namedItem('train'+i).value=source.training?.[i]??'';
  for(let i=0;i<5;i++)form.elements.namedItem('skill'+i).value=source.skills?.[i]??'';
  $('review-owner-confirm').checked=false;$('review-art').src=card.image;$('review-art').alt='Carta de '+card.name;
  $('review-name').textContent=card.name;$('review-edition').textContent=card.edition;$('review-index').textContent='CARTA '+(cards.indexOf(card)+1)+' / '+cards.length;
  $('review-state').textContent=saved?.status==='confirmed'?'Conferida por você · dados usados na ficha':saved?'Rascunho salvo':'Aguardando sua conferência no jogo';
  $('review-sheet').href=card.href;$('review-jump').value=card.key;$('review-workspace').hidden=false;
  $('review-prev').disabled=visible.indexOf(card)<=0;$('review-next').disabled=visible.indexOf(card)>=visible.length-1;
  history.replaceState(null,'','#'+encodeURIComponent(card.key));localStorage.setItem('scoutpro:v379:review-cursor',card.key);dirty=false;paintHistory(saved);paintCost();
 }
 function paintCost(){try{const v=values();$('review-cost').textContent=v.training?'Treino informado: '+R.cost(v.training)+' PP.':'Treino atual ainda não informado.';}catch(_){$('review-cost').textContent='Complete as categorias para conferir os PP.';}}
 function filter(){
  if(dirty&&!persist(false))return;
  visible=cards.filter(c=>R.matches(c,$('review-search').value)&&($('review-filter').value==='all'||(Boolean(R.read(localStorage,c,true))===($('review-filter').value==='confirmed'))));
  $('review-jump').replaceChildren(...visible.map(c=>{const e=mk('option',(cards.indexOf(c)+1)+' · '+c.name);e.value=c.key;return e;}));
  if(visible.length)show(visible.includes(active)?active:visible[0]);else{$('review-workspace').hidden=true;active=null;}
  feedback(visible.length+' nesta busca · '+stats());
 }
 form.addEventListener('input',()=>{dirty=true;paintCost();});
 form.addEventListener('change',()=>{dirty=true;const slot=value('extraSlot');form.elements.extraBooster.disabled=slot!=='ocupado';if(slot!=='ocupado')form.elements.extraBooster.value='';});
 form.onsubmit=e=>{e.preventDefault();persist(true);};$('review-draft').onclick=()=>persist(false);
 const move=delta=>{const i=visible.indexOf(active)+delta;if(i>=0&&i<visible.length)show(visible[i]);};
 $('review-prev').onclick=()=>move(-1);$('review-next').onclick=()=>move(1);
 $('review-confirm-next').onclick=()=>{if(persist(true))move(1);};
 $('review-search').oninput=filter;$('review-filter').onchange=filter;
 $('review-jump').onchange=e=>{const c=visible.find(c=>c.key===e.target.value);if(c)show(c);};
 $('review-export').onclick=async()=>{try{
  if(dirty&&!persist(false))return;
  if(typeof window.scoutSaveJson!=='function')throw Error('Exportação ainda carregando; tente novamente.');
  const result=await window.scoutSaveJson({schema:R.SCHEMA,exportedAt:new Date().toISOString(),cards:cards.map(c=>R.read(localStorage,c)).filter(Boolean)},'craque-conferencias-261.json');
  feedback(result.status==='saved'?'Conferências exportadas.':'Exportação cancelada; dados continuam salvos no app.');
 }catch(e){feedback(e.message,true);}};
 window.addEventListener('beforeunload',e=>{if(dirty&&!persist(false)){e.preventDefault();e.returnValue='';}});
 filter();const start=initial;
 if(start){const card=cards.find(c=>c.key===start);if(card)show(card);}
 document.body.dataset.review379='ready';
}catch(e){feedback('Não foi possível abrir a conferência: '+e.message,true);}
})();
