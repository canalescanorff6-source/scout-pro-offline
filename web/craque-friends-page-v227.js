/* Craque Tático V227 · UI de acervos independentes (sem usar catálogo original). */
(()=>{'use strict';
const api=window.CRAQUE_FRIENDS_V227;
const budgets=window.CRAQUE_FRIEND_TRAINING_V228;
const $=id=>document.getElementById(id);
if(!api||!$('friend-people'))return;
let data,locked=false,selected=null,cardImage='',imageModified=false;
const status=(value)=>{$('friend-feedback').textContent=String(value||'');};
const el=(tag,className,text)=>{
 const node=document.createElement(tag);
 if(className)node.className=className;
 if(text!==undefined)node.textContent=String(text);
 return node;
};
try{data=api.read(localStorage)}
catch(e){data=api.empty();locked=true;status(e.message+' Não faça novos cadastros até restaurar o backup da central de dados.');}
// V304: agregar a coleção solicitada sem importar para as 246 cartas e
// sem recriar uma carta que a pessoa tenha excluído posteriormente.
const bruno=window.CRAQUE_BRUNO_V304;
if(!locked&&bruno){
 try{data=bruno.seed(data,api,localStorage).data}
 catch(e){status('Não foi possível registrar a coleção Bruno Santos CD: '+e.message+
  '. Seus acervos existentes foram mantidos.')}
}
const getOwner=()=>data.owners.find(x=>x.id===selected);
const brunoOwner=()=>data.owners.find(x=>bruno?.normalize(x.name)===bruno.normalize(bruno.NAME));
const personCards=id=>data.cards.filter(x=>x.ownerId===id);
function restoreSelection(){
 try{const id=sessionStorage.getItem('craque:v227:selected-owner');if(data.owners.some(x=>x.id===id))selected=id;}
 catch(_e){}
 try{
  if(new URLSearchParams(location.search).get('colecao')==='bruno-santos-cd'&&brunoOwner())
   selected=brunoOwner().id;
 }catch(_e){}
 if(!selected&&brunoOwner())selected=brunoOwner().id;
 if(!selected&&data.owners.length)selected=data.owners[0].id;
}
restoreSelection();
function selectOwner(id){
 if(!data.owners.some(x=>x.id===id))return;
 selected=id;
 try{sessionStorage.setItem('craque:v227:selected-owner',id)}catch(_e){}
 $('friend-search').value='';$('friend-position').value='';
 render();
}
function save(next,message){
 if(locked)throw Error('Acervo bloqueado para impedir sobrescrever dados ilegíveis. Restaure um backup primeiro.');
 data=api.write(localStorage,next);
 window.dispatchEvent(new CustomEvent('craque:data-changed',{detail:{key:api.KEY}}));
 status(message||'Alterações salvas localmente.');
 render();
}
function button(text,cls,onClick){
 const b=el('button',cls,text);b.type='button';b.onclick=onClick;return b;
}
function renderBruno(){
 const owner=brunoOwner(),button=$('bruno-open-collection'),counter=$('bruno-featured-count');
 const cover=$('bruno-featured-card-art');
 if(cover&&bruno?.PHOTO&&!cover.src.startsWith('data:image/'))cover.src=bruno.PHOTO;
 if(counter)counter.textContent=owner?personCards(owner.id).length+
  ' carta'+(personCards(owner.id).length===1?'':'s'):'Acervo ainda não disponível';
 if(button){
  button.disabled=!owner||locked;
  button.onclick=()=>{
   if(!owner||locked)return;
   selectOwner(owner.id);
   $('friend-selected')?.scrollIntoView({block:'start',behavior:'smooth'});
  };
 }
}
function renderPeople(){
 const root=$('friend-people');root.replaceChildren();
 $('friend-person-count').textContent=String(data.owners.length);
 $('friend-people-empty').hidden=data.owners.length!==0;
 for(const owner of data.owners){
  const count=personCards(owner.id).length,b=button('','friends-person',()=>selectOwner(owner.id));
  b.setAttribute('aria-pressed',String(owner.id===selected));
  b.title='Abrir somente as cartas de '+owner.name;
  const avatar=el('span','friends-avatar',owner.name.slice(0,1).toUpperCase());
  const text=el('span');text.append(el('strong','',owner.name),el('small','',count+' carta'+(count===1?'':'s')));
  b.append(avatar,text);root.append(b);
 }
}
function makeCard(card){
 const node=el('article','friends-card');
 const progress=budgets.resolveBudget(card);
 const ready=Number.isInteger(progress.pp)&&progress.pp>=0&&Boolean(card.position);
 node.dataset.ready=ready?'true':'false';
 if(card.image){
  const img=el('img');img.src=card.image;img.alt='Miniatura enviada da carta de '+card.name;img.loading='lazy';
  node.append(img);
 }else node.append(el('div','friends-placeholder','⚽'));
 const info=el('div','friends-card-info');
 info.append(el('strong','',card.name));
 if(card.edition)info.append(el('small','friends-edition',card.edition));
 info.append(el('small','',(card.position||'Posição pendente')+' · '+(card.rarity||'Raridade não informada')));
 if(card.style)info.append(el('small','friends-playstyle','Estilo: '+card.style));
 if(card.cardId)info.append(el('small','','Card ID: '+card.cardId));
 if(card.level!==null||card.pp!==null)info.append(el('small','',[
  (card.level!==null?'Nível máx. '+card.level:null),
  (progress.pp!==null?progress.pp+' PP'+(progress.source==='nivel_maximo'?' calculados':' manuais'):null)
 ].filter(Boolean).join(' · ')));
 if(progress.source==='conflito')info.append(el('small','friends-pp-conflict',progress.reason));
 const state=el('div','friends-card-fichas');
 state.append(el('span','friends-card-fichas-title','FICHAS DO APLICATIVO'),
  el('strong',ready?'5 estilos · análise disponível':'5 estilos · dados pendentes'),
  el('small','',ready?'Treino calculável com '+progress.pp+' PP · habilidades e ímpetos por estilo':
   'Informe o nível MÁXIMO ou resolva o conflito de PP para gerar treino; Card ID pode ficar pendente.'));
 info.append(state);
 const actions=el('div','friends-actions');
 actions.append(
  button('Ver ficha do app','friends-analysis-action',()=>{
   const analyzer=window.CRAQUE_FRIEND_TRAINING_UI_V228;
   const owner=getOwner();
   if(!analyzer||!owner||card.ownerId!==owner.id){status('Motor de fichas indisponível para esta carta.');return;}
   analyzer.openCard(card,owner,(original,proposed)=>{
    if(locked||original.ownerId!==selected||original.id!==proposed.id)throw Error('Coleção foi alterada: análise não salva.');
    const next=api.saveCard(data,proposed);
    save(next,'Cinco fichas individuais atualizadas para '+original.name+' · '+owner.name);
    return data.cards.find(x=>x.ownerId===owner.id&&x.id===original.id);
   },()=>openCard(card));
  }),
  button('Editar dados','',()=>openCard(card)),
  button('Excluir','friends-remove',()=>eraseCard(card))
 );
 info.append(actions);
 const extra=[card.style&&'Estilo: '+card.style,card.skills&&'Habilidades: '+card.skills,card.booster&&'Ímpetos: '+card.booster,card.notes&&'Observações: '+card.notes].filter(Boolean);
 if(extra.length){
  const details=el('details');details.append(el('summary','','Dados e observações'));
  const body=el('p','friends-card-more',extra.join('\n'));details.append(body);info.append(details);
 }
 node.append(info);return node;
}
function renderCards(){
 const hasOwner=Boolean(getOwner());
 $('friend-no-selection').hidden=hasOwner;
 $('friend-selected').hidden=!hasOwner;
 if(!hasOwner)return;
 const owner=getOwner(),current=personCards(owner.id);
 $('friend-current-name').textContent=owner.name;
 $('friend-current-meta').textContent=current.length+' carta'+(current.length===1?'':'s')+' cadastrada'+(current.length===1?'':'s')+' · coleção independente';
 const done=current.filter(c=>Number.isInteger(budgets.resolveBudget(c).pp)&&c.position).length;
 $('friend-fichas-count').textContent=done+'/'+current.length+' com PP e posição · 5 estilos por carta';
 const search=$('friend-search').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const position=$('friend-position').value;
 const shown=current.filter(card=>{
  const text=[card.name,card.cardId,card.edition,card.style,card.rarity].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return (!search||text.includes(search))&&(!position||card.position===position);
 }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 const area=$('friend-cards');area.replaceChildren(...shown.map(makeCard));
 $('friend-cards-empty').hidden=shown.length>0;
 $('friend-cards-empty').textContent=current.length?'Nenhuma carta encontrada neste filtro.':'Ainda não há cartas nesta coleção. Toque em “Nova carta” para cadastrar a primeira.';
}
function render(){
 renderBruno();renderPeople();renderCards();
 const disabled=locked;for(const id of ['friend-person-name','friend-new-card','friend-rename','friend-export','friend-delete','friend-import']){
  const control=$(id);if(control)control.disabled=disabled;
 }
}
$('friend-person-form').onsubmit=event=>{
 event.preventDefault();
 try{
  const next=api.addOwner(data,$('friend-person-name').value);
  const owner=next.owners[next.owners.length-1];
  save(next,'Acervo separado criado para '+owner.name+'. Suas 246 cartas permanecem intactas.');
  $('friend-person-name').value='';selectOwner(owner.id);
 }catch(e){status('Não foi possível cadastrar: '+e.message)}
};
$('friend-search').addEventListener('input',renderCards);
$('friend-position').addEventListener('change',renderCards);
$('friend-new-card').onclick=()=>openCard();
$('friend-rename').onclick=()=>{
 const owner=getOwner();if(!owner)return;
 const name=prompt('Novo nome desta pessoa:',owner.name);
 if(name===null)return;
 try{save(api.renameOwner(data,owner.id,name),'Nome do acervo atualizado.')}catch(e){status(e.message)}
};
$('friend-delete').onclick=()=>{
 const owner=getOwner();if(!owner)return;
 const count=personCards(owner.id).length;
 if(!confirm('Excluir o acervo de '+owner.name+' e suas '+count+' carta(s)? Esta ação não altera suas 246 cartas, mas elimina os dados locais desta pessoa. Salve um backup antes, se necessário.'))return;
 try{
  const next=api.removeOwner(data,owner.id),old=owner.name;
  selected=next.owners[0]?.id||null;
  save(next,'Acervo de '+old+' excluído. Seu catálogo original está intacto.');
 }catch(e){status(e.message)}
};
async function exportOwner(){
 const owner=getOwner();if(!owner)return;
 try{
  const out=api.exportOwner(data,owner.id),clean=owner.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]/gi,'_').slice(0,36);
  const result=await window.SCOUT_FILE_EXPORT.saveJson(out,'CraqueTatico-Acervo-'+(clean||'Pessoa')+'.json');
  status(result.status==='saved'?'Acervo de '+owner.name+' exportado com '+out.cards.length+' cartas.':
   result.status==='cancelled'?'Exportação cancelada. As cartas continuam salvas.':
   'Download solicitado. Confira o arquivo na pasta Downloads.');
 }catch(e){status('Exportação não concluída: '+e.message)}
}
$('friend-export').onclick=exportOwner;
const importPicker=$('friend-import-file');
$('friend-import').onclick=()=>importPicker.click();
importPicker.onchange=async()=>{
 const file=importPicker.files?.[0];
 if(!file)return;
 try{
  if(file.size>api.MAX_STORAGE)throw Error('Arquivo maior que 3 MB.');
  const payload=JSON.parse(await file.text());
  if(!confirm('Importar este acervo como uma NOVA pessoa? Não serão substituídas suas cartas nem as coleções atuais.'))return;
  const next=api.importOwner(data,payload);
  const owner=next.owners[next.owners.length-1];
  save(next,'Coleção de '+owner.name+' importada separadamente ('+payload.cards.length+' cartas).');
  selectOwner(owner.id);
 }catch(e){status('Importação não realizada: '+e.message)}
 finally{importPicker.value=''}
};
$('friend-open-backup').onclick=()=>{
 if(typeof window.CRAQUE_OPEN_BACKUP==='function')window.CRAQUE_OPEN_BACKUP();
 else $('scout-backup')?.click();
};
const dialog=$('friend-card-dialog'),form=$('friend-card-form');
const fields={name:'friend-card-name',cardId:'friend-card-gameid',edition:'friend-card-edition',
 position:'friend-card-position',rarity:'friend-card-rarity',style:'friend-card-style',
 level:'friend-card-level',pp:'friend-card-pp',skills:'friend-card-skills',
 booster:'friend-card-booster',nativeSkills:'friend-card-native',
 fixedBooster:'friend-card-fixed-booster',boosterSlot:'friend-card-booster-slot',
 trainingLevels:'friend-card-training-levels',notes:'friend-card-notes'};
const preview=$('friend-photo-preview'),removePhoto=$('friend-photo-remove'),photoInput=$('friend-photo');
const levelInput=$('friend-card-level'),ppInput=$('friend-card-pp');
const budgetPreview=$('friend-budget-preview');
function previewBudget(){
 if(!budgetPreview)return;
 const level=levelInput.value.trim()===''?null:Number(levelInput.value);
 const manual=ppInput.value.trim()===''?null:Number(ppInput.value);
 const result=budgets.resolveBudget({level,pp:manual});
 budgetPreview.textContent=result.source==='conflito'?result.reason:
  result.pp!==null?'Orçamento '+result.pp+' PP · '+(result.source==='nivel_maximo'?
   'calculados: 2 × ('+level+' − 1). PP manual pode ficar em branco.':
   'informado manualmente'+(level!==null?' (confere com o nível máximo).':'.')):
  'Informe o nível MÁXIMO da carta para obter os PP automaticamente.';
 budgetPreview.dataset.state=result.source;
}
levelInput.addEventListener('input',previewBudget);
ppInput.addEventListener('input',previewBudget);
function setPreview(){
 preview.hidden=!cardImage;removePhoto.hidden=!cardImage;
 if(cardImage)preview.src=cardImage;else preview.removeAttribute('src');
}
function openCard(card=null){
 const owner=getOwner();if(!owner||locked)return;
 form.reset();photoInput.value='';
 cardImage=card?.image||'';imageModified=false;
 $('friend-card-id').value=card?.id||'';
 $('friend-dialog-title').textContent=card?'Editar carta':'Nova carta';
 $('friend-dialog-owner').textContent='Acervo exclusivo: '+owner.name;
 for(const [key,id] of Object.entries(fields))$(id).value=card?.[key]??'';
 // O print complementar mostra NÍVEL 35, mas não prova sozinho a mesma edição
 // da carta inicialmente cadastrada. Apenas SUGERIR no formulário, sem salvar.
 const isInitialZico=card?.id===bruno?.CARD_ID&&card?.level===null&&card?.pp===null;
 if(isInitialZico)levelInput.value='35';
 previewBudget();
 if(isInitialZico&&budgetPreview){
  budgetPreview.textContent+=' Sugestão do print de Zico: confirme que o nível 35 pertence à mesma edição antes de salvar. Nenhum dado foi modificado ainda.';
 }
 setPreview();
 if(!dialog.open)dialog.showModal();
 $('friend-card-name').focus();
}
const close=()=>{if(dialog.open)dialog.close()};
$('friend-dialog-close').onclick=close;$('friend-dialog-cancel').onclick=close;
removePhoto.onclick=()=>{cardImage='';imageModified=true;photoInput.value='';setPreview()};
async function thumbnail(file){
 if(!/^image\/(?:jpeg|png|webp)$/.test(file.type))throw Error('Use uma foto JPG, PNG ou WebP.');
 if(file.size>12*1024*1024)throw Error('Imagem acima de 12 MB. Reduza o arquivo antes de inserir.');
 const bitmap=await createImageBitmap(file);
 try{
  for(const width of [220,190,160,140]){
   const ratio=Math.min(1,width/bitmap.width,310/bitmap.height);
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
   canvas.getContext('2d',{alpha:false}).drawImage(bitmap,0,0,canvas.width,canvas.height);
   const webp=canvas.toDataURL('image/webp',0.58);
   const data=webp.startsWith('data:image/webp')?webp:canvas.toDataURL('image/jpeg',0.55);
   if(api.bytes(data)<=api.MAX_IMAGE)return data;
  }
  throw Error('Não foi possível compactar a foto abaixo de 85 KB.');
 }finally{bitmap.close?.()}
}
photoInput.onchange=async()=>{
 const file=photoInput.files?.[0];if(!file)return;
 photoInput.disabled=true;
 try{cardImage=await thumbnail(file);imageModified=true;setPreview();status('Miniatura preparada. Toque em Salvar carta para registrar neste acervo.')}
 catch(e){status('Foto não adicionada: '+e.message)}
 finally{photoInput.disabled=false}
};
form.onsubmit=event=>{
 event.preventDefault();
 const owner=getOwner();if(!owner)return;
 const cardId=$('friend-card-id').value;
 const existing=cardId?data.cards.find(x=>x.id===cardId&&x.ownerId===owner.id):null;
 if(cardId&&!existing){status('A carta deixou de existir nesta coleção. Nada foi salvo.');return;}
 const raw={ownerId:owner.id,...Object.fromEntries(Object.entries(fields).map(([k,id])=>[k,$(id).value]))};
 if(existing)raw.id=existing.id;
 if(imageModified||!existing)raw.image=cardImage;
 try{
  let next=api.saveCard(data,raw);
  const saved=next.cards.find(x=>x.ownerId===owner.id&&
   (existing?x.id===existing.id:!data.cards.some(previous=>previous.id===x.id)));
  if(!saved)throw Error('Não foi possível localizar a carta recém-cadastrada.');
  const progress=budgets.resolveBudget(saved);
  let analysisNote=progress.source==='nivel_maximo'?
   ' Nível máximo '+saved.level+' → '+progress.pp+' PP calculados automaticamente.':
   progress.source==='conflito'?' ATENÇÃO: PP manual diverge do nível; treino bloqueado para revisão.':'';

  try{
   const training=window.CRAQUE_FRIEND_TRAINING_V228;
   if(!training)throw Error('Motores táticos não carregaram.');
   const prepared=training.generate(saved);
   next=api.saveCard(next,{...saved,analysis:prepared});
   analysisNote=' Cinco fichas por tática calculadas e armazenadas (pendências identificadas quando faltam dados).';
  }catch(e){
   analysisNote=' A carta foi salva; geração da ficha pendente: '+String(e.message||e);
  }
  save(next,(existing?'Carta atualizada: ':'Carta adicionada: ')+raw.name+' · acervo de '+owner.name+'.'+analysisNote);
  close();
 }catch(e){status('Carta não foi salva: '+e.message)}
};
function eraseCard(card){
 const owner=getOwner();if(!owner||card.ownerId!==owner.id)return;
 if(!confirm('Excluir somente a carta '+card.name+' do acervo de '+owner.name+'?'))return;
 try{save(api.removeCard(data,owner.id,card.id),'Carta excluída apenas do acervo de '+owner.name+'.')}
 catch(e){status(e.message)}
}
render();
})();
