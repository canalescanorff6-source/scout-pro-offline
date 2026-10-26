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
  }catch(e){feedback.textContent='Falha ao gravar localmente: '+String(e.message||e)}
 };
 additional.append(save);
 body.append(additional);
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
  }catch(e){feedback.textContent='Falha ao gravar localmente: '+String(e.message||e)}
 };
 additional.append(save);body.append(additional);
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
 const labels={resumo:'Visão geral',treino:'5 fichas',skills:'Habilidades',boost:'Ímpetos',body:'Biotipo',confirm:'Confirmar dados'};
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
function openCard(c){
 switchOwnedCard(c);
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
 const inner=mk('div','ct364-owned-inner');inner.append(header,grid);wrapper.append(inner);
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
