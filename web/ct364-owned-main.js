/* Craque Tático V364 — 15 cartas próprias NO catálogo principal, sem tocar nas 246.
   Evidências eFHub são simulações, não Card ID, PP, treinos ou boosters equipados. */
(()=>{'use strict';
if(document.body?.dataset.page!=='catalog')return;
const SOURCE='ct364-owned-cards.json',STORAGE='scoutpro:v364:owned-confirmed';
const EQUIP_STORAGE='scoutpro:v364:owned-equipment';
const STYLE_IDS=['posse','normal','rapido','fora','longo'];
const STYLE_NAMES={posse:'Posse de Bola',normal:'Contra-Ataque Normal',rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Bola Longa'};
const $=(s,root=document)=>root.querySelector(s),mk=(tag,cls,txt)=>{
 const node=document.createElement(tag);
 if(cls)node.className=cls;if(txt!==undefined)node.textContent=String(txt);return node;
};
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
let entries=[],active=null,activeRole='',activeStyle='posse',activePanel='resumo',confirmed={},loadEngine=null;
const loadConfirmed=()=>{try{
 const parsed=JSON.parse(localStorage.getItem(STORAGE)||'{}');
 return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
}catch(_){return {}}};
confirmed=loadConfirmed();
const loadEquipment=()=>{try{
 const data=JSON.parse(localStorage.getItem(EQUIP_STORAGE)||'{}');
 return data&&typeof data==='object'&&!Array.isArray(data)?data:{};
}catch(_){return {}}};
let equipment=loadEquipment();
const equipmentOf=card=>{
 const data=equipment[card.key];
 if(!data||typeof data!=='object'||Array.isArray(data))return {skills:[],slot:'pendente',booster:''};
 // Preservar vagas vazias: slot #3 não pode migrar para #1.
 const skills=Array.from({length:5},(_,i)=>{
  const value=Array.isArray(data.skills)?data.skills[i]:null;
  return typeof value==='string'&&value.length<=80?value.trim():'';
 });
 const slot=['pendente','ocupado','vazio','ausente'].includes(data.slot)?data.slot:'pendente';
 return {skills,slot,booster:slot==='ocupado'&&typeof data.booster==='string'?data.booster:''};
};
const validEquipmentName=value=>typeof value==='string'&&value.trim().length<=80;
// O backup V226 já exporta todas as chaves scoutpro:, mas exige notificação
// após as edições para criar snapshots sem aguardar o próximo intervalo.
const notifyBackup=()=>{
 try{window.dispatchEvent(new Event('craque:data-changed'));}
 catch(_){/* O backup periódico permanece ativo. */}
};
const equipmentSave=(card,value)=>{
 const current=loadEquipment();
 const next={...current,[card.key]:{
  ...value,source:'declaracao_manual_proprietario',confirmedByOwner:true,
  updatedAt:new Date().toISOString()
 }};
 localStorage.setItem(EQUIP_STORAGE,JSON.stringify(next));
 equipment=next;
 notifyBackup();
 refreshReview();
};
const numberOrNull=(v)=>Number.isInteger(v)&&v>0&&v<=120?v:null;
const confirmationOf=card=>{
 const v=confirmed[card.key];
 if(!v||typeof v!=='object'||Array.isArray(v))return {};
 const level=numberOrNull(v.maxLevel);
 const id=/^\d{5,20}$/.test(String(v.cardId||''))?String(v.cardId):'';
 return {level,cardId:id};
};
const cardAsEngine=(card,role)=>{const p=confirmationOf(card),manual=equipmentOf(card);
 return {name:card.name,position:role||card.position,style:card.style,
  level:p.level,pp:null,cardId:p.cardId,edition:'',
  // Anotações manuais NÃO provam slot livre, Card ID ou versão.
  skills:manual.skills.filter(Boolean).join('; '),nativeSkills:card.observed.nativeSkills.join('; '),
  booster:manual.booster,fixedBooster:'',boosterSlot:manual.slot,trainingLevels:''};
};
function section(title){const s=mk('section','ct364-area');s.append(mk('h3','',title));return s}
function line(parent,label,value){const row=mk('div','ct364-data-row');row.append(mk('span','',label),mk('strong','',value??'Pendente'));parent.append(row)}
function note(parent,message){parent.append(mk('p','ct364-note',message))}
function makeCard(c){
 const b=mk('button','ct364-player-card');b.type='button';b.dataset.ownedId=c.key;
 const art=mk('span','ct364-card-art');
 const img=mk('img');img.src=c.image;img.alt='Imagem recortada da carta de '+c.name+' enviada pelo proprietário';
 img.loading='lazy';img.decoding='async';art.append(img);
 const info=mk('span','ct364-card-info');
 info.append(mk('strong','',c.name),mk('small','',c.position+' · '+c.style));
 const conf=confirmationOf(c);
 info.append(mk('span','ct364-card-tag',conf.level?'Nível máximo informado · conferir edição':'Nível máximo / PP pendentes'));
 b.append(art,info);b.addEventListener('click',()=>openCard(c));return b;
}
function currentFilter(c){
 const search=normalize($('#search')?.value);
 const text=normalize([c.name,c.position,c.style,c.secondaryStyle,c.observed.nativeSkills.join(' ')].join(' '));
 const role=$('#roles .filter.active')?.dataset.value||'TODOS';
 const rarity=$('#rarities .filter.active')?.dataset.value||'TODAS';
 if(search&&!text.includes(search))return false;
 if(role!=='TODOS'&&c.position!==role)return false;
 // Não afirmar raridade ausente dos prints. Somente filtro "Todas" inclui pendentes.
 if(rarity!=='TODAS')return false;
 return true;
}
function syncResults(){
 const panel=$('#ct364-owned-section');if(!panel)return;
 const filtered=entries.filter(currentFilter);
 const grid=$('#ct364-owned-grid');
 const sort=$('#sort')?.value||'cap';
 if(sort==='alpha')filtered.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 else if(sort==='reverse')filtered.reverse();
 const old=new Map([...grid.children].map(x=>[x.dataset.ownedId,x]));
 grid.replaceChildren(...filtered.map(c=>old.get(c.key)||makeCard(c)));
 panel.hidden=!filtered.length;
 if(normalize($('#search')?.value)&&filtered.length)panel.open=true;
 $('#ct364-owned-count').textContent=filtered.length+' de '+entries.length+' adicionais';
 // O estado "nenhuma carta" original só é verdadeiro quando AMBOS os grupos estão vazios.
 if(filtered.length&&$('#none'))$('#none').hidden=true;
}

/* V365 — diagnóstico local, sem inferir Card ID, nível máximo ou PP dos prints.
   PP=2×(nível máximo declarado−1) é cálculo, nunca comprovação da edição. */
function refreshReview(){
 const rows=$('#ct365-review-rows'),summary=$('#ct365-review-summary');
 if(!rows||!summary)return;
 const known=entries.filter(c=>Boolean(confirmationOf(c).level));
 const idKnown=entries.filter(c=>Boolean(confirmationOf(c).cardId));
 summary.textContent='Conferir minhas 15 cartas · '+(entries.length-known.length)+
  ' níveis máximos pendentes';
 const count=$('#ct365-review-count');
 if(count)count.textContent=known.length+' de '+entries.length+' níveis máximos informados · '+
  idKnown.length+' Card IDs anotados (identidade ainda não homologada)';
 const mode=$('#ct365-review-filter')?.value||'all';
 const shown=entries.filter(c=>{
  const conf=confirmationOf(c);
  return mode==='missing-level'?!conf.level:
   mode==='missing-id'?!conf.cardId:
   mode==='with-level'?Boolean(conf.level):true;
 });
 const frag=document.createDocumentFragment();
 for(const c of shown){
  const conf=confirmationOf(c);
  const item=mk('div','ct365-review-row');
  item.dataset.reviewCard=c.key;
  const left=mk('div','ct365-review-info');
  left.append(mk('strong','',c.name+' · '+c.position));
  left.append(mk('span','','eFHub: nível '+c.observed.shownLevel+' (simulação, não máximo)'));
  left.append(mk('span','',conf.level?
    'Máximo informado: '+conf.level+' · '+(2*(conf.level-1))+' PP calculados, não homologados':
    'Nível máximo: PENDENTE · PP: PENDENTES'));
  left.append(mk('span','',conf.cardId?
    'Card ID anotado (edição ainda não validada)':'Card ID: PENDENTE'));
  const action=mk('button','ct365-review-open',conf.level?'Revisar dados':'Informar nível');
  action.type='button';action.setAttribute('aria-label','Conferir nível máximo e Card ID de '+c.name);
  action.onclick=()=>openCard(c,'confirm');
  item.append(left,action);frag.append(item);
 }
 rows.replaceChildren(frag);
 if(!shown.length)rows.append(mk('p','ct365-empty','Nenhuma carta nesta condição.'));
}
function createReview(){
 const review=mk('details','ct365-review');review.id='ct365-review';
 const toggle=mk('summary','','Conferir minhas 15 cartas · níveis pendentes');
 toggle.id='ct365-review-summary';review.append(toggle);
 const content=mk('div','ct365-review-body');
 const description=mk('p','ct365-review-explainer',
  'Aqui você confere todas as 15 cartas de Minhas Cartas. Nível observado no eFHub não é nível máximo. PP só aparecem como cálculo após sua confirmação no jogo. Não preenche dados automaticamente.');
 description.id='ct365-review-description';
 content.append(description);
 const count=mk('p','ct365-review-count');count.id='ct365-review-count';
 count.setAttribute('aria-live','polite');content.append(count);
 const label=mk('label','ct365-review-filter-label','Mostrar cartas');
 const filter=mk('select','ct365-review-filter');filter.id='ct365-review-filter';
 for(const [value,desc] of [
  ['all','Todas as 15'],
  ['missing-level','Sem nível máximo informado'],
  ['missing-id','Sem Card ID anotado'],
  ['with-level','Com nível máximo informado']
 ]){
  const option=mk('option','',desc);option.value=value;filter.append(option);
 }
 filter.onchange=refreshReview;label.append(filter);content.append(label);
 const rows=mk('div','ct365-review-rows');rows.id='ct365-review-rows';
 content.append(rows);review.append(content);
 return review;
}

/* V367 — registros de gameplay são anotações do proprietário por carta,
   posição e tática; nunca equivalem a validação da edição ou prova de meta.
   Backups V226 capturam automaticamente as chaves scoutpro:. */
const GAMEPLAY_STORAGE='scoutpro:v367:owned-gameplay';
const gameplayKey=(c,role,tactic)=>[c.key,role,tactic].join('|');
const gameplayData=()=>{try{
 const value=JSON.parse(localStorage.getItem(GAMEPLAY_STORAGE)||'{}');
 return value&&typeof value==='object'&&!Array.isArray(value)?value:{};
}catch(_){return {}}};
function gameplayOf(c,role,tactic){
 const value=gameplayData()[gameplayKey(c,role,tactic)];
 if(!value||value.cardKey!==c.key||value.role!==role||value.tactic!==tactic||
    value.ownerConfirmed!==true||!Number.isInteger(value.matches)||value.matches<1||value.matches>200)
   return null;
 return value;
}
// Invalida o contexto da partida também quando nível máximo, habilidades
// ou ímpeto anotado mudam: a build observada não deve ser atribuída à nova.
function gameplayBuildSnapshot(c){
 const conf=confirmationOf(c),eq=equipmentOf(c);
 return JSON.stringify({cardId:conf.cardId||'',maxLevel:conf.level||null,
  skills:eq.skills,booster:eq.booster,boosterSlot:eq.slot});
}
function gameplayStale(c,record){
 if(!record)return false;
 return (record.cardIdAtCapture||'')!==(confirmationOf(c).cardId||'')||
  (record.buildSnapshot!==undefined&&record.buildSnapshot!==gameplayBuildSnapshot(c));
}
function validVideoLink(raw){
 const value=String(raw||'').trim();
 if(!value)return '';
 if(value.length>400)return null;
 try{
  const uri=new URL(value);
  return uri.protocol==='https:'&&!uri.username&&!uri.password?uri.href:null;
 }catch(_){return null}
}
function renderGameplay(c,body){
 const role=activeRole||c.position,tactic=activeStyle;
 const base=section('Laboratório de gameplay por carta, função e tática');
 base.id='ct367-gameplay';
 note(base,'Registro pessoal da carta exata: não usar dados da equipe inteira como estatística individual. Nenhuma avaliação de meta é gerada por Overall.');
 const modes=mk('nav','ct364-modes');modes.setAttribute('aria-label','Tática do teste de gameplay');
 for(const id of STYLE_IDS){
  const btn=mk('button','',STYLE_NAMES[id]);btn.type='button';
  btn.setAttribute('aria-pressed',String(id===tactic));
  btn.onclick=()=>{activeStyle=id;renderDialog()};modes.append(btn);
 }
 base.append(modes);
 line(base,'Contexto selecionado',role+' · '+STYLE_NAMES[tactic]+' · '+c.name);
 const id=confirmationOf(c).cardId||'';
 line(base,'Card ID desta edição',id? id+' (informado, não homologado)':'PENDENTE — preencher em Confirmar dados');
 const saved=gameplayOf(c,role,tactic),stale=gameplayStale(c,saved);
 if(saved)note(base,stale?'REGISTRO EXIGE RECONFERÊNCIA: Card ID ou build anotada mudou desde as partidas.':
   'Registro de gameplay informado pelo proprietário, não auditado externamente.');
 const counter=mk('label','ct364-form-label','Partidas observadas com ESTA CARTA nesta posição e tática');
 const matches=mk('input');matches.type='number';matches.min='1';matches.max='200';matches.step='1';
 matches.id='ct367-matches';matches.value=saved?String(saved.matches):'';counter.append(matches);base.append(counter);
 const clipLabel=mk('label','ct364-form-label','Vídeo da mesma carta (link HTTPS opcional)');
 const link=mk('input');link.type='url';link.maxLength=400;link.id='ct367-link';
 link.placeholder='https://… (não comprova a edição sozinho)';link.value=saved?.url||'';
 clipLabel.append(link);base.append(clipLabel);
 const noteLabel=mk('label','ct364-form-label','Observações reais por função (mínimo 15 caracteres)');
 const notes=mk('textarea','ct367-observation');notes.rows=4;notes.maxLength=700;
 notes.id='ct367-notes';notes.placeholder='Ex.: recepção sob pressão, qualidade dos passes curtos, desmarques, cobertura defensiva…';
 notes.value=saved?.notes||'';noteLabel.append(notes);base.append(noteLabel);
 const ack=mk('label','ct364-ack');const checked=mk('input');checked.type='checkbox';
 checked.id='ct367-ack';checked.setAttribute('aria-label','Confirmo que estes jogos e notas são observações reais minhas');
 ack.append(checked,mk('span','',
  'Confirmei as partidas e observações no jogo. Não confundo simulação eFHub, vídeo de outra versão ou estatística do time com rendimento desta carta.'));
 base.append(ack);
 const save=mk('button','ct364-save','Salvar observação desta carta');
 save.type='button';save.id='ct367-save';
 const feedback=mk('p','ct364-feedback');feedback.id='ct367-feedback';feedback.setAttribute('role','status');
 save.onclick=()=>{
  const count=Number(matches.value),value=notes.value.trim(),video=validVideoLink(link.value);
  if(!checked.checked){feedback.textContent='Confirme que a observação veio de partidas reais com esta carta.';return;}
  if(!Number.isInteger(count)||count<1||count>200||value.length<15||video===null){
   feedback.textContent='Informe 1 a 200 partidas, pelo menos 15 caracteres e link HTTPS válido quando houver.';return;
  }
  const record={cardKey:c.key,role,tactic,cardIdAtCapture:id,
   buildSnapshot:gameplayBuildSnapshot(c),matches:count,
   notes:value,url:video||'',ownerConfirmed:true,updatedAt:new Date().toISOString()};
  try{
   const all=gameplayData();
   localStorage.setItem(GAMEPLAY_STORAGE,JSON.stringify({...all,[gameplayKey(c,role,tactic)]:record}));
   notifyBackup();
   feedback.textContent='Registro individual salvo neste aparelho. Não altera a build aprovada.';
   renderGameplayComparison(c,role,tactic,base);
  }catch(error){feedback.textContent='Não foi possível salvar: '+String(error.message||error)}
 };
 base.append(save,feedback);
 const comparison=mk('div','ct367-comparison');comparison.id='ct367-comparison';
 base.append(comparison);
 body.append(base);renderGameplayComparison(c,role,tactic,base);
}
/* V368: cruzamento de 15 cartas adicionais com as 246 ORIGINAIS por CAP.
   Fonte somente-leitura: catálogo SCOUT_V69_AUDITORIA.json. Nenhuma escrita no
   catálogo ou nas builds aprovadas; gameplay original tem storage próprio. */
const ORIGINAL_GAMEPLAY_STORAGE='scoutpro:v368:original-gameplay';
let originalCatalogPromise=null;
function loadOriginalCatalog(){
 if(originalCatalogPromise)return originalCatalogPromise;
 originalCatalogPromise=fetch('SCOUT_V69_AUDITORIA.json',{cache:'force-cache'})
  .then(r=>{if(!r.ok)throw Error('Catálogo original indisponível');return r.json()})
  .then(data=>{
   if(!Array.isArray(data.cards)||data.cards.length!==246||
       new Set(data.cards.map(x=>x.numero)).size!==246||
       data.cards.some(x=>!Number.isInteger(x.numero)||x.numero<1||x.numero>246))
    throw Error('Catálogo original sem integridade de 246 edições');
   return new Map(data.cards.map(x=>[x.numero,x]));
  }).catch(e=>{originalCatalogPromise=null;throw e});
 return originalCatalogPromise;
}
function originalGameplayKey(cap,role,tactic){return ['cap:'+cap,role,tactic].join('|')}
function originalGameplayData(){try{
 const parsed=JSON.parse(localStorage.getItem(ORIGINAL_GAMEPLAY_STORAGE)||'{}');
 return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};
}catch(_){return {}}}
function originalSnapshot(card){
 return JSON.stringify({id:String(card.id||''),versao:String(card.versao||''),
  pp:card.pp??null,levels:Array.isArray(card.niveis)?card.niveis:null});
}
function originalGameplayOf(card,role,tactic){
 const record=originalGameplayData()[originalGameplayKey(card.numero,role,tactic)];
 return record&&record.cap===card.numero&&record.role===role&&record.tactic===tactic&&
  record.ownerConfirmed===true&&Number.isInteger(record.matches)&&
  record.matches>=1&&record.matches<=200?record:null;
}
function originalGameplayStale(card,record){
 return Boolean(record&&record.snapshot!==originalSnapshot(card));
}
function renderOriginalEvidence(card,role,tactic,parent,refresh){
 const record=originalGameplayOf(card,role,tactic),stale=originalGameplayStale(card,record);
 const box=mk('section','ct368-original-form');parent.append(box);
 box.append(mk('h4','', 'Registrar gameplay da carta original #'+String(card.numero).padStart(3,'0')));
 note(box,'Registro separado do treino oficial. Os dados abaixo representam apenas partidas que você observou nesta edição e função. O catálogo V69 não comprova o equipamento atual do seu jogo.');
 const countLabel=mk('label','ct364-form-label','Partidas desta carta original na função '+role);
 const matches=mk('input');matches.type='number';matches.min='1';matches.max='200';matches.step='1';
 matches.id='ct368-matches';matches.value=record?String(record.matches):'';
 countLabel.append(matches);box.append(countLabel);
 const noteLabel=mk('label','ct364-form-label','Observações reais (mínimo 15 caracteres)');
 const notes=mk('textarea','ct367-observation');notes.maxLength=700;notes.rows=3;
 notes.id='ct368-notes';notes.value=record?.notes||'';
 noteLabel.append(notes);box.append(noteLabel);
 const linkLabel=mk('label','ct364-form-label','Vídeo HTTPS opcional da mesma edição');
 const link=mk('input');link.type='url';link.id='ct368-link';link.maxLength=400;
 link.value=record?.url||'';linkLabel.append(link);box.append(linkLabel);
 const agree=mk('label','ct364-ack');const ack=mk('input');ack.type='checkbox';ack.id='ct368-ack';
 agree.append(ack,mk('span','',
  'Conferi pessoalmente as partidas e que esta é a carta original indicada pelo CAP e Card ID. Isso não constitui verificação independente.'));
 box.append(agree);
 const save=mk('button','ct364-save','Salvar observação da carta original');save.type='button';save.id='ct368-save';
 const feedback=mk('p','ct364-feedback');feedback.id='ct368-feedback';feedback.setAttribute('role','status');
 save.onclick=()=>{
  const m=Number(matches.value),n=notes.value.trim(),url=validVideoLink(link.value);
  if(!ack.checked){feedback.textContent='Confirme que observou a edição indicada em partidas reais.';return}
  if(!Number.isInteger(m)||m<1||m>200||n.length<15||url===null){
   feedback.textContent='Informe 1 a 200 partidas, notas de 15 caracteres e link HTTPS válido quando fornecido.';return;
  }
  const entry={cap:card.numero,role,tactic,cardIdAtCapture:String(card.id||''),
   snapshot:originalSnapshot(card),matches:m,notes:n,url:url||'',
   ownerConfirmed:true,updatedAt:new Date().toISOString()};
  try{
   const all=originalGameplayData();
   localStorage.setItem(ORIGINAL_GAMEPLAY_STORAGE,JSON.stringify({
    ...all,[originalGameplayKey(card.numero,role,tactic)]:entry
   }));
   notifyBackup();feedback.textContent='Registro salvo separadamente. Nenhuma ficha ou build original foi modificada.';
   refresh();
  }catch(e){feedback.textContent='Falha ao salvar anotação: '+String(e.message||e)}
 };
 box.append(save,feedback);
 if(stale)note(box,'A referência original mudou desde a anotação: histórico exige reconferência.');
}
function renderGameplayComparison(c,role,tactic,base){
 const box=base.querySelector('#ct367-comparison');if(!box)return;
 const previously=box.querySelector('#ct367-other')?.value||'';
 box.replaceChildren();
 box.append(mk('h3','','Comparar cartas na mesma função e tática'));
 note(box,'Compare a edição exata e registros reais. PP do catálogo original são dados cadastrados, não medida de gameplay; resultados não demonstram superioridade.');
 const label=mk('label','ct364-form-label','Comparar com carta adicional ou original');
 const select=mk('select','ct367-other');select.id='ct367-other';
 const neutral=mk('option','','Selecionar edição para comparar');neutral.value='';select.append(neutral);
 const recent=mk('optgroup');recent.label='15 cartas adicionais';
 for(const other of entries.filter(x=>x.key!==c.key)){
  const opt=mk('option','',other.name+' · '+other.position);
  opt.value=other.key;recent.append(opt);
 }
 select.append(recent);
 const originals=mk('optgroup');originals.label='246 cartas originais';originals.dataset.catalog='original';
 select.append(originals);label.append(select);box.append(label);
 const view=mk('div','ct367-compare-rows');box.append(view);
 const form=mk('div','ct368-form-slot');box.append(form);
 let originalMap=null;
 const renderAdditional=(card)=>{
  const value=gameplayOf(card,role,tactic),stale=gameplayStale(card,value);
  const panel=mk('section','ct367-compare-card');
  panel.append(mk('strong','',card.name+' · '+role+' · '+STYLE_NAMES[tactic]));
  if(card.position!==role)note(panel,'Função adaptada: posição de origem '+card.position+'.');
  if(!value)note(panel,'PENDENTE: sem partidas documentadas para esta combinação.');
  else{
   line(panel,'Partidas anotadas',value.matches+' · declaração do proprietário');
   if(stale)note(panel,'Build alterada; reconferir o gameplay desta versão.');
   line(panel,'Card ID no teste',value.cardIdAtCapture||'PENDENTE');
   note(panel,value.notes);
   const valid=validVideoLink(value.url);
   if(valid&&!stale){
    const anchor=mk('a','ct367-video-link','Abrir vídeo registrado');
    anchor.href=valid;anchor.target='_blank';anchor.rel='noopener noreferrer';panel.append(anchor);
   }
  }
  return panel;
 };
 const renderOriginal=(card)=>{
  const value=originalGameplayOf(card,role,tactic);
  const stale=originalGameplayStale(card,value);
  const panel=mk('section','ct367-compare-card');
  panel.append(mk('strong','',
   '#'+String(card.numero).padStart(3,'0')+' '+card.name+' · '+role+' · '+STYLE_NAMES[tactic]));
  line(panel,'Edição catalogada',card.versao||'PENDENTE');
  line(panel,'Card ID catalogado',String(card.id||'PENDENTE'));
  line(panel,'PP do catálogo',card.pp===null||card.pp===undefined?'PENDENTE':String(card.pp)+' · não medem gameplay');
  const dom=document.querySelector('#cards .player-card[data-cap="'+card.numero+'"]');
  if(dom?.dataset.role&&dom.dataset.role!==role)
   note(panel,'Papel adaptado: posição de origem '+dom.dataset.role+'.');
  if(!value)note(panel,'PENDENTE: sem partidas pessoais registradas para esta edição/função.');
  else{
   line(panel,'Partidas anotadas',value.matches+' · declaração do proprietário');
   if(stale)note(panel,'Cadastro de referência atualizado: reconferir edição e build observada.');
   note(panel,value.notes);
   const valid=validVideoLink(value.url);
   if(valid&&!stale){
    const anchor=mk('a','ct367-video-link','Abrir vídeo registrado');
    anchor.href=valid;anchor.target='_blank';anchor.rel='noopener noreferrer';panel.append(anchor);
   }
  }
  // Link relativo fechado e fornecido pelo próprio catálogo; nunca de entrada manual.
  if(typeof card.arquivo==='string'&&/^fichas\/\d{3}_[\w-]+\.html$/.test(card.arquivo)){
   const anchor=mk('a','ct367-video-link','Abrir ficha principal desta edição');
   anchor.href=card.arquivo;panel.append(anchor);
  }
  return panel;
 };
 const show=()=>{
  view.replaceChildren();form.replaceChildren();
  view.append(renderAdditional(c));
  const selected=select.value;
  if(selected.startsWith('cap:')){
   const cap=Number(selected.slice(4)),original=originalMap?.get(cap);
   if(original){
    view.append(renderOriginal(original));
    renderOriginalEvidence(original,role,tactic,form,show);
   }
  }else{
   const additional=entries.find(x=>x.key===selected);
   if(additional)view.append(renderAdditional(additional));
  }
 };
 select.onchange=show;
 const restoreSelection=()=>{
  if(previously&&[...select.options].some(x=>x.value===previously))select.value=previously;
  show();
 };
 restoreSelection();
 const status=mk('p','ct364-note','Situação comparativa: PENDENTE DE AVALIAÇÃO. Nenhuma versão recebe nota meta automática.');
 box.append(status);
 loadOriginalCatalog().then(map=>{
  if(!box.isConnected||active!==c||activeRole!==role||activeStyle!==tactic||
    activePanel!=='gameplay')return;
  originalMap=map;
  originals.replaceChildren();
  const ordered=[...map.values()].sort((a,b)=>{
   const eqA=normalize(a.name)===normalize(c.name)?0:1;
   const eqB=normalize(b.name)===normalize(c.name)?0:1;
   return eqA-eqB||a.numero-b.numero;
  });
  for(const card of ordered){
   const opt=mk('option','',
    '#'+String(card.numero).padStart(3,'0')+' · '+card.name+' — '+(card.versao||'Edição pendente'));
   opt.value='cap:'+card.numero;originals.append(opt);
  }
  restoreSelection();
 }).catch(e=>{
  if(!box.isConnected)return;
  note(box,'Catálogo original indisponível: '+String(e.message||e)+'. As fichas originais permanecem intactas.');
 });
}
function renderOverview(c,body){
 const meta=section('Identidade e função da carta');
 line(meta,'Posição mostrada no jogo',c.position);
 line(meta,'Estilo mostrado no jogo',c.style);
 if(c.secondaryStyle)line(meta,'Estilo/indicador secundário',c.secondaryStyle);
 line(meta,'Edição exata / Card ID',confirmationOf(c).cardId||'PENDENTE');
 line(meta,'Nível observado no eFHub',String(c.observed.shownLevel)+' · não comprovado como máximo');
 line(meta,'Nível máximo confirmado',confirmationOf(c).level??'PENDENTE');
 body.append(meta);
 const stats=section('Atributos retratados na simulação eFHub');
 const list=mk('div','ct364-stats');
 const names=window.CRAQUE_OWNED_V364?.statNames||[];
 names.forEach((name,i)=>line(list,name,c.observed.attributes[i]));
 stats.append(list);note(stats,'Atributos e bônus exibidos no eFHub com Xabi Alonso. Não são atributos-base nem previsão do efeito real de uma build.');
 body.append(stats);
 const guidance=section('Como testar a carta no gameplay');
 const role=activeRole||c.position;
 const guides={
  CA:'Teste desmarques pelo centro, domínio orientado, primeiro toque e finalização sob pressão.',
  SA:'Teste tabelas curtas com o CA, giro, infiltrações por dentro e passe na última linha.',
  MAT:'Teste recepção entrelinhas, condução curta, passe de primeira e assistência frontal.',
  MLG:'Teste apoio à saída, domínio sob marcação, triangulações e cobertura ao VOL.',
  VOL:'Teste posicionamento à frente dos zagueiros, interceptação, passe seguro e pressão pós-perda.',
  ZC:'Teste o primeiro bote, orientação corporal, cobertura de profundidade e passe na saída.',
  LE:'Teste recomposição, apoio interno, tempo do desarme e passe curto no corredor.',
  LD:'Teste recomposição, apoio interno, tempo do desarme e passe curto no corredor.',
  GO:'Teste reflexo, posicionamento, alcance e reposição curta segura.'
 };
 note(guidance,guides[role]||'Compare deslocamento, passe e sinergia com Posse de Bola nesta função.');
 note(guidance,'Avaliação consultiva por função; não classificar como meta apenas pelo Overall.');
 body.append(guidance);
}
function ensureEngine(){
 if(loadEngine)return loadEngine;
 const jobs=[
 ['booster-engine-v103.js','SCOUT_BOOSTERS_V103'],
 ['skills-booster-v162.js','SCOUT_RECOMMENDATIONS_V162'],
 ['scout-multitactic-engine-v220.js','SCOUT_TACTICS_V220'],
 ['craque-role-intelligence-v233.js','CRAQUE_INTERPRETATION_V233'],
 ['craque-ficha-individual-v251.js','CRAQUE_FICHA_INDIVIDUAL_V251'],
 ['craque-pp-universal-v309.js','CRAQUE_PP_UNIVERSAL_V309'],
 ['craque-friends-training-v228.js','CRAQUE_FRIEND_TRAINING_V228']
 ];
 const script=(path,key)=>new Promise((resolve,reject)=>{
  if(window[key])return resolve();
  const existing=[...document.querySelectorAll('script[src]')].find(x=>x.src.split('?')[0].endsWith('/'+path));
  if(existing){let elapsed=0;const poll=()=>{if(window[key])resolve();else if((elapsed+=100)>10000)reject(Error('Módulo não iniciado: '+path));else setTimeout(poll,100)};return poll();}
  const node=document.createElement('script');node.src=path;
  node.onload=()=>window[key]?resolve():reject(Error('Módulo indisponível: '+path));
  node.onerror=()=>reject(Error('Arquivo offline ausente: '+path));document.head.append(node);
 });
 loadEngine=jobs.reduce((p,[path,key])=>p.then(()=>script(path,key)),Promise.resolve());
 return loadEngine;
}
async function renderTraining(c,body){
 const tools=section('Escolha a tática — cinco fichas do mesmo motor');
 const modes=mk('nav','ct364-modes');
 STYLE_IDS.forEach(id=>{const b=mk('button','',STYLE_NAMES[id]);b.type='button';
  b.setAttribute('aria-pressed',String(activeStyle===id));b.addEventListener('click',()=>{activeStyle=id;renderDialog();});modes.append(b)});
 tools.append(modes);const area=mk('div','ct364-training-area');
 tools.append(area);body.append(tools);
 const identity=confirmationOf(c);
 if(!identity.level)note(area,'PP PENDENTES: o nível mostrado no simulador não confirma o nível MÁXIMO da edição. Informe esse dado na seção Confirmar dados da ficha.');
 const manual=equipmentOf(c);
 if(manual.skills.some(Boolean))line(area,'Habilidades informadas por você',manual.skills.filter(Boolean).join(' · ')+' · registro local, não validação automática');
 if(manual.slot!=='pendente')line(area,'Slot de ímpeto informado por você',
  {ausente:'Sem slot',vazio:'Vazio',ocupado:'Ocupado'}[manual.slot]+
  (manual.slot==='ocupado'?' · '+manual.booster:'')+' · a conferir por edição');
 const generation=++renderTraining.generation;
 try{
  await ensureEngine();
  if(active!==c||activePanel!=='treino'||generation!==renderTraining.generation)return;
  const engine=window.CRAQUE_FRIEND_TRAINING_V228;
  const result=engine.evaluate(cardAsEngine(c,activeRole),activeStyle);
  const plan=result.plan;
  if(!plan.levels||plan.status!=='hipotese'){
   note(area,'Treino ainda PENDENTE: '+(plan.reason||'falta confirmar nível máximo/PP e Card ID da edição.'));
  }else{
   line(area,'Orçamento PP calculado',String(result.progress.pp)+' · nível máximo informado pelo proprietário');
   line(area,'Status','HIPÓTESE COMPETITIVA · não homologada');
   const table=mk('div','ct364-stats');
   plan.categories.forEach((name,i)=>line(table,name,plan.levels[i]+' níveis'));
   area.append(table);line(area,'PP restantes',plan.remaining);
  }
  const suggestions=result.suggestedSkills||[];
   if(suggestions.length){
    const options=section('Habilidades para testar nesta função');
    const list=mk('div','ct364-skill-list');
    for(const suggestion of suggestions.slice(0,5)){
     const name=typeof suggestion==='string'?suggestion:
       String(suggestion?.name||suggestion?.skill||'').trim();
     if(name)list.append(mk('span','',name));
    }
    if(list.children.length)options.append(list);
    note(options,'Candidatas calculadas pelo motor V162 para posição e tática selecionadas. Não pressupõem slots livres nem habilidades instaladas. Confira edição e habilidades nativas.');
    area.append(options);
   }
   if(result.warnings?.length){
   const more=mk('details','ct364-warnings'),summary=mk('summary','',result.warnings.length+' ressalvas e verificações');
   const ul=mk('ul');result.warnings.forEach(x=>ul.append(mk('li','',x)));
   more.append(summary,ul);area.append(more);
  }
 }catch(e){note(area,'Motor competitivo indisponível nesta execução: '+String(e.message||e)+'. Nenhum treino foi inventado.')}
}
renderTraining.generation=0;
/* V366 — parecer do motor V228 (V251/V233/V162/V103) por função e tática.
   Sem inventar slots, identidade, habilidades equipadas ou ímpetos. */
let advisoryGeneration=0;
function renderAdvisory(c,body,kind){
 body.querySelector('.ct366-advisory')?.remove();
 const block=section(kind==='skills'?'Habilidades recomendadas para esta função':
   'Ímpetos para comparar nesta função');
 block.classList.add('ct366-advisory');block.id='ct366-advisory';
 const modes=mk('nav','ct364-modes');
 modes.setAttribute('aria-label','Tática usada para o parecer competitivo');
 for(const style of STYLE_IDS){
  const button=mk('button','',STYLE_NAMES[style]);button.type='button';
  button.setAttribute('aria-pressed',String(activeStyle===style));
  button.onclick=()=>{activeStyle=style;renderDialog();};
  modes.append(button);
 }
 block.append(modes);
 const role=activeRole||c.position,tactic=activeStyle,panel=activePanel;
 note(block,'Papel '+role+' · '+STYLE_NAMES[tactic]+'. Parecer consultivo: não comprova desempenho, edição ou equipamento real.');
 const results=mk('div','ct366-results');results.setAttribute('aria-live','polite');
 note(results,'Calculando parecer offline…');block.append(results);body.append(block);
 const gen=++advisoryGeneration;
 ensureEngine().then(()=>{
  if(gen!==advisoryGeneration||active!==c||activeRole!==role||
    activeStyle!==tactic||activePanel!==panel||!block.isConnected)return;
  const result=window.CRAQUE_FRIEND_TRAINING_V228.evaluate(cardAsEngine(c,role),tactic);
  results.replaceChildren();
  const proof=confirmationOf(c);
  note(results,proof.cardId?
   'Card ID anotado manualmente; ainda sem comprovação da edição exata.':
   'Card ID pendente. Os dados simulados do eFHub não confirmam a edição.');
  if(kind==='skills'){
   const choices=(result.suggestedSkills||[]).slice(0,5);
   line(results,'Vagas adicionais livres verificadas',
    result.freeSkillSlots===null?'PENDENTE — não assumir cinco vagas':String(result.freeSkillSlots));
   line(results,'Habilidades adicionais anotadas',
    equipmentOf(c).skills.filter(Boolean).length+' de 5 — inventário manual');
   if(choices.length){
    const list=mk('ol','ct366-rank');
    for(const candidate of choices){
     const item=mk('li');
     item.append(mk('strong','',String(candidate.name||candidate.skill||'Candidata')));
     if(candidate.reason)item.append(mk('p','',String(candidate.reason)));
     if(candidate.situation)item.append(mk('small','',String(candidate.situation)));
     list.append(item);
    }
    results.append(list);
   }else note(results,'Sem candidatas ranqueáveis com os dados disponíveis.');
   note(results,'Habilidades nativas vieram de captura simulada. Compare cada candidata com a carta real antes de considerar um slot. Nada é instalado automaticamente.');
  }else{
   const booster=result.booster;
   const slot=equipmentOf(c).slot;
   line(results,'Segundo slot declarado',({pendente:'Pendente',ausente:'Ausente',vazio:'Vazio',ocupado:'Ocupado'}[slot]));
   line(results,'Slot adicional comprovado nesta edição',
    booster?.slotSupported?'Indicado no catálogo':'NÃO COMPROVADO');
   const candidates=[booster?.primary,...(booster?.alternatives||[])].filter(Boolean).slice(0,3);
   if(candidates.length){
    const list=mk('ol','ct366-rank');
    for(const candidate of candidates){
     const item=mk('li');
     item.append(mk('strong','',String(candidate.nome_pt||candidate.nome||'Candidato pendente')));
     item.append(mk('p','','Comparação relativa de função/tática, não equipamento recomendado para aplicar sem prova de edição e atributos finais.'));
     list.append(item);
    }
    results.append(list);
   }else note(results,'Ranking ainda indisponível; não escolher Instinto Artilheiro automaticamente.');
   note(results,booster?.note||'Estado do ímpeto fixo e segundo slot sem evidência conclusiva.');
   line(results,'Gastar tokens','NÃO AUTORIZADO — apenas consulta');
  }
 }).catch(error=>{
  if(gen!==advisoryGeneration||active!==c||activePanel!==panel||!block.isConnected)return;
  results.replaceChildren();note(results,'Motor indisponível: '+String(error.message||error)+'. Nenhuma recomendação genérica será usada.');
 });
}
function equipmentConsent(section){
 const label=mk('label','ct364-ack');
 const check=mk('input');check.type='checkbox';
 check.setAttribute('aria-label','Confirmo que conferi os dados no meu jogo');
 label.append(check,mk('span','', 'Conferi diretamente na minha carta do eFootball. Esta anotação não comprova a edição ou a instalação em outro dispositivo.'));
 section.append(label);return check;
}
function equipmentFeedback(section){
 const msg=mk('p','ct364-feedback');msg.setAttribute('role','status');
 section.append(msg);return msg;
}
function renderSkills(c,body){
 const s=section('Habilidades observadas na captura eFHub');
 const chips=mk('div','ct364-skill-list');
 c.observed.nativeSkills.forEach(skill=>chips.append(mk('span','',skill)));s.append(chips);
 note(s,'Habilidades mostradas no simulador, não validação das habilidades equipadas na sua conta.');
 body.append(s);
 const additional=section('Minhas habilidades adicionais — cadastro manual (0 a 5)');
 note(additional,'Preencha somente nomes conferidos no jogo. Campos vazios continuam pendentes. Este registro não altera o equipamento no eFootball.');
 const saved=equipmentOf(c);
 const inputs=[];
 for(let i=0;i<5;i++){
  const label=mk('label','ct364-form-label','Habilidade adicional '+(i+1));
  const inp=mk('input');inp.type='text';inp.maxLength=80;inp.autocomplete='off';
  inp.dataset.skillSlot=String(i+1);inp.value=saved.skills[i]||'';
  inp.placeholder='Pendente — conferir no jogo';
  label.append(inp);additional.append(label);inputs.push(inp);
 }
 const consent=equipmentConsent(additional);
 const save=mk('button','ct364-save','Registrar habilidades desta carta');save.type='button';
 const feedback=equipmentFeedback(additional);
 save.onclick=()=>{
  const slots=inputs.map(el=>el.value.trim());
  const names=slots.filter(Boolean);
  const known=new Set(c.observed.nativeSkills.map(normalize));
  const unique=new Set(names.map(normalize));
  if(!consent.checked){feedback.textContent='Marque a confirmação após conferir diretamente na carta do jogo.';return}
  if(names.some(v=>!validEquipmentName(v))||unique.size!==names.length){
   feedback.textContent='Nomes inválidos ou repetidos. Revise cada uma das cinco vagas.';return;
  }
  if(names.some(v=>known.has(normalize(v)))){
   feedback.textContent='Conflito com habilidade observada como nativa no eFHub. Confira a edição antes de registrar.';return;
  }
  try{
   const old=equipmentOf(c);
   equipmentSave(c,{skills:slots,slot:old.slot,booster:old.booster});
   feedback.textContent='Registro manual salvo apenas neste aparelho para '+c.name+'. Nenhuma habilidade foi equipada automaticamente.';
    renderAdvisory(c,body,'skills');
  }catch(e){feedback.textContent='Falha ao gravar localmente: '+String(e.message||e)}
 };
 additional.append(save);
 body.append(additional);
 renderAdvisory(c,body,'skills');
}
function renderBoost(c,body){
 const s=section('Ímpetos exibidos na simulação eFHub');
 c.observed.boostersSimulated.forEach((b,i)=>line(s,i===0?'Ímpeto simulado 1':'Ímpeto simulado 2',b));
 note(s,'A simulação não confirma o ímpeto fixo, um segundo slot nem equipamento na sua conta.');
 body.append(s);
 const additional=section('Estado real do slot adicional — registro manual');
 const saved=equipmentOf(c);
 const label=mk('label','ct364-form-label','Slot adicional da carta');
 const slot=mk('select','ct364-equipment-select');slot.id='ct364-booster-slot';
 for(const [id,name] of [
  ['pendente','Pendente: não conferido'],
  ['ausente','Sem slot adicional — conferido'],
  ['vazio','Slot adicional vazio — conferido'],
  ['ocupado','Slot adicional ocupado — conferido']
 ]){
  const option=mk('option','',name);option.value=id;slot.append(option);
 }
 slot.value=saved.slot;label.append(slot);additional.append(label);
 const boosterLabel=mk('label','ct364-form-label','Nome do ímpeto adicional equipado');
 const booster=mk('input');booster.id='ct364-equipped-booster';
 booster.type='text';booster.maxLength=80;booster.autocomplete='off';
 booster.value=saved.booster;booster.placeholder='Somente quando o slot está ocupado';
 boosterLabel.append(booster);additional.append(boosterLabel);
 const sync=()=>{booster.disabled=slot.value!=='ocupado';if(booster.disabled)booster.value='';};
 slot.addEventListener('change',sync);sync();
 note(additional,'O estado declarado por você fica separado do ímpeto visto no simulador e não habilita gasto de tokens sem evidência da edição.');
 const consent=equipmentConsent(additional);
 const save=mk('button','ct364-save','Registrar estado do ímpeto');save.type='button';
 const feedback=equipmentFeedback(additional);
 save.onclick=()=>{
  const name=booster.value.trim();
  if(!consent.checked){feedback.textContent='Confirme que conferiu o slot na sua carta do jogo.';return;}
  if(slot.value==='ocupado'&&(!name||!validEquipmentName(name))){
   feedback.textContent='Informe o nome do ímpeto somente se o slot estiver comprovadamente ocupado.';return;
  }
  try{
   const old=equipmentOf(c);
   equipmentSave(c,{skills:old.skills,slot:slot.value,booster:slot.value==='ocupado'?name:''});
   feedback.textContent='Estado manual salvo somente neste aparelho. Nenhum ímpeto foi equipado ou aplicado no jogo.';
    renderAdvisory(c,body,'boost');
  }catch(e){feedback.textContent='Falha ao gravar localmente: '+String(e.message||e)}
 };
 additional.append(save);body.append(additional);
 renderAdvisory(c,body,'boost');
}
function renderBody(c,body){
 const s=section('Dados corporais do simulador');
 line(s,'Altura',c.observed.heightCm+' cm');line(s,'Peso',c.observed.weightKg+' kg');
 if(c.observed.bodyModel&&Array.isArray(c.observed.bodyModel)){
  const keys=window.CRAQUE_OWNED_V364?.bodyNames||[];
  keys.forEach((k,i)=>line(s,k,c.observed.bodyModel[i]??'PENDENTE'));
 }else note(s,'Parâmetros individuais do modelo não aparecem no print recebido.');
 note(s,'Medidas de referência do eFHub, não comprovante de Player ID ou edição exata.');
 body.append(s);
}
function renderConfirm(c,body){
 const s=section('Completar dados reais sem substituir fichas originais');
 note(s,'Preencha somente o nível MÁXIMO conferido na sua carta do jogo. O nível da simulação ('
  +c.observed.shownLevel+') NÃO pode ser transferido automaticamente.');
 const label=mk('label','ct364-form-label','Nível MÁXIMO confirmado');
 const inp=mk('input');inp.type='number';inp.min='1';inp.max='120';inp.id='ct364-max-level';
 const saved=confirmationOf(c);if(saved.level)inp.value=String(saved.level);label.append(inp);s.append(label);
 const idlabel=mk('label','ct364-form-label','Card ID numérico (opcional, somente se conferido)');
 const idinput=mk('input');idinput.type='text';idinput.inputMode='numeric';idinput.maxLength=20;idinput.id='ct364-card-id';idinput.value=saved.cardId||'';
 idlabel.append(idinput);s.append(idlabel);
 const ack=mk('label','ct364-ack');const check=mk('input');check.type='checkbox';check.id='ct364-ack';
 ack.append(check,mk('span','','Confirmo que conferi o nível máximo NA MINHA CARTA, não no Overall ou na simulação.'));s.append(ack);
 const save=mk('button','ct364-save','Salvar dados confirmados');save.type='button';
 const feedback=mk('p','ct364-feedback');feedback.setAttribute('role','status');
 save.onclick=()=>{
  const level=Number(inp.value),id=String(idinput.value||'').trim();
  if(!check.checked||!numberOrNull(level)||(!/^\d{5,20}$/.test(id)&&id!=='')){
   feedback.textContent='Confira a confirmação, um nível inteiro entre 1 e 120 e Card ID numérico válido quando fornecido.';return;
  }
  const next={...confirmed,[c.key]:{maxLevel:level,cardId:id}};
  try{localStorage.setItem(STORAGE,JSON.stringify(next));confirmed=next;
   notifyBackup();
   refreshReview();
   feedback.textContent='Salvo localmente · PP poderão ser calculados como hipótese. Edição permanece a conferir.';
   const b=$('[data-owned-id="'+c.key+'"] .ct364-card-tag');
   if(b)b.textContent='Nível máximo informado · conferir edição';
  }catch(e){feedback.textContent='Não foi possível salvar: '+String(e.message||e)}
 };
 s.append(save,feedback);body.append(s);
}
function renderDialog(){
 const c=active,dialog=$('#ct364-dialog');if(!c||!dialog)return;
 const title=$('#ct364-title');title.textContent=c.name;
 $('#ct364-dialog-art').src=c.image;
 $('#ct364-dialog-role').value=activeRole||c.position;
 const subtitle=$('#ct364-dialog-subtitle');subtitle.textContent=
  c.position+' · '+c.style+' · '+c.observed.shownLevel+' nível no eFHub (simulação)';
 const jump=$('#ct364-jump');
 if(jump)jump.value=c.key;
 const position=entries.findIndex(x=>x.key===c.key);
 const indicator=$('#ct364-card-index');
 if(indicator)indicator.textContent='Minha carta '+(position+1)+' de '+entries.length+' · cadastro independente da versão original';
 const tabs=$('#ct364-tabs');tabs.replaceChildren();
 const labels={resumo:'Visão geral',treino:'5 fichas',skills:'Habilidades',boost:'Ímpetos',body:'Biotipo',gameplay:'Gameplay',confirm:'Confirmar dados'};
 for(const [id,text] of Object.entries(labels)){
  const b=mk('button','',text);b.type='button';b.dataset.panel=id;
  b.setAttribute('aria-pressed',String(activePanel===id));b.onclick=()=>{activePanel=id;renderDialog()};
  tabs.append(b);
 }
 const body=$('#ct364-panel');body.replaceChildren();
 if(activePanel==='resumo')renderOverview(c,body);
 else if(activePanel==='treino')renderTraining(c,body);
 else if(activePanel==='skills')renderSkills(c,body);
 else if(activePanel==='boost')renderBoost(c,body);
 else if(activePanel==='body')renderBody(c,body);
 else if(activePanel==='gameplay')renderGameplay(c,body);
 else if(activePanel==='confirm')renderConfirm(c,body);
}
function switchOwnedCard(c){
 if(!c||!entries.some(item=>item.key===c.key))return;
 // Muda somente o contexto consultivo; nunca copia PP, equipamento ou
 // confirmação entre edições homônimas ou entre Minhas Cartas e Outros.
 active=c;activeRole=c.position;activeStyle='posse';activePanel='resumo';
 renderDialog();
 const dialog=$('#ct364-dialog');if(dialog)dialog.scrollTop=0;
}
function navigateOwned(delta){
 const index=entries.findIndex(c=>c.key===active?.key);
 if(index<0)return;
 switchOwnedCard(entries[(index+delta+entries.length)%entries.length]);
}
function openCard(c,panel='resumo'){
 switchOwnedCard(c);
 if(panel==='confirm'){activePanel='confirm';renderDialog();}
 const dialog=$('#ct364-dialog');
 if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();
 else dialog.setAttribute('open','');
}
function prepare(data){
 if(!data||data.schema!=='craque-owned-cards-v364'||data.cards?.length!==15)throw Error('Cadastro V364 incompleto');
 if(new Set(data.cards.map(c=>c.key)).size!==15||data.cards.some(c=>!c.image.startsWith('cartas/novas/')))
  throw Error('Identidade das 15 cartas inválida');
 window.CRAQUE_OWNED_V364=data;
 entries=data.cards;
 const toolbar=$('#catalogo'),original=$('#cards');
 if(!toolbar||!original)return;
 const wrapper=mk('details','ct364-owned-section');wrapper.id='ct364-owned-section';
 const toggle=mk('summary','ct364-owned-toggle','Minhas 15 cartas novas · abrir fichas e imagens');
 wrapper.append(toggle);
 const header=mk('div','ct364-owned-head');
 const title=mk('div');
 title.append(mk('span','ct364-eyebrow','MINHAS CARTAS · MAIS 15 EDIÇÕES'));
 title.append(mk('h3','','Novas cartas do meu elenco'));
 title.append(mk('p','','Fotos dos seus prints · 246 originais preservadas · 15 edições adicionais com dados reais e pendências identificadas.'));
 const counter=mk('strong','ct364-owned-count','15 adicionais');counter.id='ct364-owned-count';
 header.append(title,counter);
 const grid=mk('div','ct364-owned-grid');grid.id='ct364-owned-grid';
 const inner=mk('div','ct364-owned-inner');
 const review=createReview();
 inner.append(header,review,grid);wrapper.append(inner);
 toolbar.insertBefore(wrapper,original);
 // Correção estrutural: em 320px o aviso repetido ainda aparecia apesar do
 // CSS e empurrava a primeira carta sob o dock. Aplicar após montar a V364.
 // Manter o aviso original acessível em telas maiores.
 const compactHint=()=>{
  const hint=[...toolbar.querySelectorAll('.list-meta span,.list-meta p,.list-meta small')]
   .find(el=>/^Toque na carta para abrir a ficha/i.test(el.textContent.trim()));
  if(typeof window.matchMedia!=='function')return;
  const compact=window.matchMedia('(max-width:355px)').matches;
  if(hint){
   hint.hidden=compact;
   if(compact)hint.style.setProperty('display','none','important');
   else hint.style.removeProperty('display');
  }
  // Não depender da existência da dica: renderizações legadas podem
  // reordenar os spans de list-meta. Evitar o retorno prematuro V364.6.
  if(compact){
   original.style.setProperty('margin-top','-6px','important');
  }else original.style.removeProperty('margin-top');
 };
 compactHint();
 window.addEventListener('resize',compactHint,{passive:true});
 const dialog=mk('dialog','ct364-dialog');dialog.id='ct364-dialog';
 const h=mk('header','ct364-dialog-head');
 const art=mk('img');art.id='ct364-dialog-art';art.alt='Arte da carta cadastrada';art.width=80;art.height=116;
 const label=mk('div');label.append(mk('span','ct364-eyebrow','FICHA PRINCIPAL · V364'),mk('h2',''));label.lastChild.id='ct364-title';
 label.append(mk('p',''));label.lastChild.id='ct364-dialog-subtitle';
 const close=mk('button','ct364-close','×');close.type='button';close.setAttribute('aria-label','Fechar ficha');
 close.onclick=()=>dialog.close();h.append(art,label,close);
 const choices=mk('label','ct364-role','Analisar na posição:');
 const sel=mk('select');sel.id='ct364-dialog-role';
 for(const p of ['CA','SA','MAT','MLG','VOL','ZC','LE','LD','GO']){
  const opt=mk('option','',p);opt.value=p;sel.append(opt);
 }
 sel.onchange=()=>{activeRole=sel.value;renderDialog()};
 choices.append(sel);
 const nav=mk('nav','ct364-card-nav');nav.id='ct364-card-navigator';
 nav.setAttribute('aria-label','Navegar entre as 15 cartas adicionadas ao elenco principal');
 const previous=mk('button','ct364-previous','‹');previous.type='button';
 previous.setAttribute('aria-label','Carta anterior');previous.onclick=()=>navigateOwned(-1);
 const jump=mk('select');jump.id='ct364-jump';
 jump.setAttribute('aria-label','Ir diretamente ao número da carta adicionada');
 entries.forEach((card,i)=>{
  const option=mk('option','',String(i+1).padStart(2,'0')+' · '+card.name);
  option.value=card.key;jump.append(option);
 });
 jump.onchange=()=>switchOwnedCard(entries.find(card=>card.key===jump.value));
 const next=mk('button','ct364-next','›');next.type='button';
 next.setAttribute('aria-label','Próxima carta');next.onclick=()=>navigateOwned(1);
 const index=mk('small','', 'Minha carta 1 de 15');
 index.id='ct364-card-index';index.setAttribute('aria-live','polite');
 nav.append(previous,jump,next,index);
 const tabs=mk('nav','ct364-tabs');tabs.id='ct364-tabs';
 tabs.setAttribute('aria-label','Seções da ficha');
 const panel=mk('div','ct364-panel');panel.id='ct364-panel';
 dialog.append(h,choices,nav,tabs,panel);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 document.body.append(dialog);
 const search=$('#search'),sort=$('#sort');
 search?.addEventListener('input',syncResults);
 sort?.addEventListener('change',syncResults);
 $('#roles')?.addEventListener('click',syncResults);
 $('#rarities')?.addEventListener('click',syncResults);
 const params=new URLSearchParams(location.search);
 if(params.has('owned')){const found=entries.find(c=>c.key===params.get('owned'));if(found)setTimeout(()=>openCard(found),300)}
 syncResults();
 refreshReview();
 document.body.dataset.ct364Owned='ready';
}
const start=()=>{
 fetch(SOURCE,{cache:'force-cache'}).then(r=>{if(!r.ok)throw Error('JSON de cartas não encontrado');return r.json()})
 .then(prepare).catch(e=>{console.error('V364: cadastro próprio indisponível',e);
  const catalog=$('#catalogo');if(catalog)catalog.append(mk('p','ct364-failure','As 15 cartas adicionais não carregaram nesta instalação. Os 246 originais continuam disponíveis.'));
 });
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
