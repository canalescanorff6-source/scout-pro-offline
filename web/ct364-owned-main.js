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
 return {localKey:card.key,originalPosition:card.position,
  name:card.name,position:role||card.position,style:card.style,
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
/* V369 — cada revisão mantém o estado anterior da anotação e build;
   revisões não equivalem a partidas adicionais e não são somadas. */
function revisionHistory(previous){
 if(!previous)return [];
 const past=Array.isArray(previous.history)?
  previous.history.filter(v=>v&&typeof v==='object'&&!Array.isArray(v)):[];
 const {history:ignored,...prior}=previous;
 return [...past,prior];
}
function revisionSummary(record){
 const raw=record?.buildSnapshot||record?.snapshot;
 if(typeof raw!=='string')return 'Build não documentada';
 try{
  const v=JSON.parse(raw),parts=[];
  if(v.cardId||v.id)parts.push('Card ID: '+(v.cardId||v.id));
  if(v.maxLevel)parts.push('Nível máximo informado: '+v.maxLevel);
  if(v.pp!==undefined&&v.pp!==null)parts.push('PP no catálogo: '+v.pp);
  if(Array.isArray(v.skills)&&v.skills.some(Boolean))
   parts.push('Habilidades anotadas: '+v.skills.filter(Boolean).join(', '));
  if(v.booster)parts.push('Ímpeto anotado: '+v.booster);
  if(Array.isArray(v.levels))parts.push('Treino catalogado: '+v.levels.join('/'));
  return parts.join(' · ')||'Build sem componentes confirmados';
 }catch(_){return 'Estado da build não interpretável; conferir exportação'}
}
/* V370 — comparar snapshots efetivamente gravados, NUNCA reconstruir uma
   revisão antiga usando a build atual. Ausência de campo é PENDENTE, não zero
   ou slot comprovadamente vazio. Todos os textos são inseridos por textContent. */
function revisionSnapshot(record){
 const raw=record?.buildSnapshot||record?.snapshot;
 if(typeof raw!=='string')return null;
 try{
  const parsed=JSON.parse(raw);
  return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:null;
 }catch(_){return null}
}
function revisionFields(snapshot){
 if(!snapshot)return {};
 const fields={
  'Card ID':snapshot.cardId??snapshot.id,
  'Edição':snapshot.versao,
  'Nível máximo informado':snapshot.maxLevel,
  'PP do catálogo':snapshot.pp,
  'Treino catalogado':Array.isArray(snapshot.levels)?snapshot.levels:undefined,
  'Estado do segundo slot':snapshot.boosterSlot,
  'Ímpeto adicional anotado':snapshot.booster
 };
 for(let i=0;i<5;i++)
  fields['Habilidade adicional · vaga '+(i+1)]=
   Array.isArray(snapshot.skills)?snapshot.skills[i]:undefined;
 return fields;
}
function revisionFieldKnown(value){
 return value!==undefined&&value!==null&&
  !(typeof value==='string'&&(!value.trim()||value.trim().toLowerCase()==='pendente'))&&
  !(Array.isArray(value)&&!value.length);
}
function revisionFieldDisplay(value){
 if(!revisionFieldKnown(value))return 'PENDENTE / não documentado';
 if(Array.isArray(value))return value.map(x=>x===null||x===undefined?'?':String(x)).join(' / ');
 if(typeof value==='object')return 'Estrutura não comparável · conferir cadastro';
 return String(value);
}
function revisionDiff(before,after){
 const earlier=revisionFields(revisionSnapshot(before)),later=revisionFields(revisionSnapshot(after));
 const labels=[...new Set([...Object.keys(earlier),...Object.keys(later)])];
 const changes=[],pending=[];
 for(const label of labels){
  const left=earlier[label],right=later[label];
  const oldKnown=revisionFieldKnown(left),newKnown=revisionFieldKnown(right);
  if(!oldKnown&&!newKnown)continue;
  if(oldKnown&&newKnown&&JSON.stringify(left)===JSON.stringify(right))continue;
  const item={label,before:revisionFieldDisplay(left),after:revisionFieldDisplay(right)};
  if(oldKnown&&newKnown)changes.push(item);
  else pending.push(item);
 }
 return {changes,pending,unreadable:!revisionSnapshot(before)||!revisionSnapshot(after)};
}
/* V371 — retestes por evidência documental, não predição de desempenho.
   Diferenças são anotadas pelo usuário/catálogo: um novo campo não comprova
   que houve alteração dentro do eFootball. Nenhum dado é persistido aqui. */
function buildRetestPlan(diff,role,tactic){
 const changed=diff.changes||[],pending=diff.pending||[];
 const found=items=>[...changed,...pending].some(x=>items.test(x.label));
 const editionChanged=changed.some(x=>/^(Card ID|Edição)$/.test(x.label));
 const editionUnknown=pending.some(x=>/^(Card ID|Edição)$/.test(x.label));
 const skills=found(/^Habilidade adicional · vaga [1-5]$/);
 const boost=found(/^(Ímpeto adicional anotado|Estado do segundo slot)$/);
 const training=found(/^(Treino catalogado|PP do catálogo|Nível máximo informado)$/);
 const primaryRole=String(role||'').toUpperCase();
 const roleTest=/^(CA|SA|SS|CF|ATA)$/.test(primaryRole)?
  'Testar apoios frontais, desmarques centrais, finalização sob pressão e devoluções curtas.':
  /^(MAT|AMF|MEI|MLG|CMF)$/.test(primaryRole)?
  'Testar recepção entrelinhas, triangulações, último passe e passe de primeira.':
  /^(VOL|DMF)$/.test(primaryRole)?
  'Testar cobertura do corredor central, interceptações e saída curta sob pressão.':
  /^(ZG|CB|ZAG)$/.test(primaryRole)?
  'Testar antecipação, recuperação de posição e primeiro passe após recuperar a bola.':
  /^(LE|LD|LB|RB)$/.test(primaryRole)?
  'Testar posicionamento sem bola, proteção do corredor e saída curta por dentro.':
  /^(GOL|GK)$/.test(primaryRole)?
  'Testar posicionamento, reposição curta e reação às finalizações sem comparar só nota geral.':
  'Testar recepção orientada, deslocamentos sem bola, passe curto e cobertura da função escolhida.';
 const tacticTest={
  posse:'Na Posse de Bola, conferir passe curto, 1–2, triangulações centrais e segurança contra pressão sem depender de cruzamentos.',
  normal:'No Contra-Ataque Normal, conferir primeiro passe da transição, apoios entrelinhas e recomposição após perda.',
  rapido:'No Contra-Ataque Rápido, conferir desmarque imediato, passe vertical de primeira e retorno defensivo após perda.',
  fora:'Na estratégia Por Fora, conferir oferta de passe e cobertura nas faixas laterais; não presumir cruzamentos como requisito.',
  longo:'Na Bola Longa, conferir recepção da bola longa, disputa da segunda bola e cobertura após perda.'
 }[tactic]||'Conferir ações coerentes com a tática selecionada sem extrapolar para outras táticas.';
 const checks=[];
 const add=(key,label)=>{if(!checks.some(x=>x.key===key))checks.push({key,label})};
 if(diff.unreadable||editionChanged||editionUnknown){
  add('edition','Conferir no jogo a mesma versão da carta (Card ID, raridade e identidade). Identidades diferentes exigem duas linhas de base; não atribuir a diferença à build.');
 }
 if(pending.length){
  add('pending','Conferir os '+pending.length+' campos que estavam ausentes ou incompletos nas revisões. Preenchimento posterior não é ganho medido.');
 }
 if(skills){
  const names=[...changed,...pending].filter(x=>/^Habilidade adicional · vaga [1-5]$/.test(x.label)).map(x=>x.label.replace('Habilidade adicional · ',''));
  add('skills','Conferir as habilidades e vagas indicadas ('+names.join(', ')+') na carta real; observar se a habilidade ativa em situações compatíveis com sua descrição, sem assumir que foi equipada.');
 }
 if(boost){
  add('booster','Verificar se o ímpeto é fixo ou selecionável, qual está equipado de fato e se o efeito consta na versão exata; não gastar tokens para cumprir este checklist.');
 }
 if(training){
  add('training','Conferir a distribuição de treino, o nível máximo e os PP usados na edição real antes de associar qualquer alteração observada aos atributos.');
 }
 const hasChanges=changed.length>0;
 if(hasChanges){
  add('role',roleTest);
  add('tactic',tacticTest);
  add('sampling','Realizar uma triagem de 3–5 partidas por condição, anotando adversários, estabilidade da conexão, posição, tática e ações observadas; é triagem, não prova estatística de superioridade.');
 }else if(pending.length===0&&!diff.unreadable){
  return {state:'unchanged',checks:[],role:primaryRole,tactic,
   explanation:'Nenhuma alteração de build foi documentada. Não há reteste acionado por este par de revisões; observações e partidas editadas não provam melhoria.'};
 }
 return {state:editionChanged?'identity-change':hasChanges?'retest':'verify',checks,
  role:primaryRole,tactic,
  explanation:editionChanged?
   'Identidade/edição divergente: primeiro separar as versões. Este plano NÃO autoriza comparação causal entre elas.':
   hasChanges?'Ações para investigar hipóteses da build; não significa que os ajustes melhoraram a gameplay.':
   'Somente lacunas documentais: conferir antes de afirmar que houve alguma mudança no jogo.'};
}
/* V372 — protocolo observacional: nenhum placar ou evidência é inferido. */
function retestEvidenceProtocol(plan){
 const blocking=plan.state==='identity-change';
 const scope=plan.state==='unchanged'?'no-change':plan.state==='verify'?'documentary':blocking?'identity':'observational';
 return {scope,eligible:scope==='observational',
  fields:['Data e horário','Versão exata / Card ID','Posição e tática','Adversário e contexto','Conexão / lag / aquecimento','Partidas da condição A','Partidas da condição B','Ações observadas sem Overall'],
  caution:blocking?'Versões diferentes não podem ser tratadas como uma mudança isolada da mesma build.':
  scope==='documentary'?'Complete a identificação e os dados faltantes antes de comparar partidas.':
  scope==='no-change'?'Sem mudança documentada; não há hipótese nova de build para testar.':
  'Mantenha a mesma posição, tática e condições comparáveis; descreva as ações, não declare superioridade sem dados.'};
}
function renderEvidenceProtocol(host,plan){
 const p=retestEvidenceProtocol(plan);
 const section=mk('section','ct372-protocol');
 section.append(mk('h5','','Protocolo de evidências de campo'));
 note(section,p.caution);
 if(!p.eligible){note(section,'Registro de resultados bloqueado nesta comparação; primeiro reconfira os dados documentais.');host.append(section);return}
 const list=mk('ul','ct372-protocol-fields');
 for(const field of p.fields)list.append(mk('li','',field));
 section.append(list);
 note(section,'Roteiro para anotar fora desta comparação: nenhum resultado, vitória, partida ou avaliação é gerado ou salvo automaticamente.');
 host.append(section);
}
function renderRetestPlan(host,plan){
 const block=mk('section','ct371-retest');block.dataset.retestPlan='true';
 block.append(mk('h4','','Plano de reconferência por posição e tática'));
 note(block,(plan.role||'Função pendente')+' · '+(STYLE_NAMES[plan.tactic]||'Tática pendente'));
 note(block,plan.explanation);
 if(!plan.checks.length){renderEvidenceProtocol(block,plan);host.append(block);return}
 const checklist=mk('div','ct371-retest-checklist');
 const progress=mk('p','ct371-retest-progress');
 progress.setAttribute('role','status');
 const count=()=>{const done=[...checklist.querySelectorAll('input[type=checkbox]')].filter(x=>x.checked).length;
  progress.textContent=done+' de '+plan.checks.length+' itens marcados nesta tela · não homologados nem salvos como gameplay.'};
 block.append(progress);
 for(const task of plan.checks){
  const label=mk('label','ct371-retest-item');
  const check=mk('input');check.type='checkbox';check.dataset.retestKey=task.key;
  check.onchange=count;
  label.append(check,mk('span','',task.label));checklist.append(label);
 }
 count();
 block.append(checklist);
 note(block,'Marcar uma conferência não cria evidência de partida, não altera a ficha e não valida automaticamente uma build.');
 renderEvidenceProtocol(block,plan);
 host.append(block);
}
function renderRevisionDiff(detail,records){
 if(records.length<2)return;
 const comparison=mk('section','ct370-diff');comparison.dataset.revisionDiff='true';
 comparison.append(mk('h4','','Comparar duas revisões da build'));
 note(comparison,'Diferenças dos registros armazenados, não provas de melhoria no gameplay. Mudança de preenchimento não confirma alteração dentro do jogo.');
 const selectors=mk('div','ct370-controls');
 const fromLabel=mk('label','ct364-form-label','Revisão anterior');
 const from=mk('select','ct370-select ct370-from');from.setAttribute('aria-label','Revisão anterior a comparar');
 const toLabel=mk('label','ct364-form-label','Revisão posterior');
 const to=mk('select','ct370-select ct370-to');to.setAttribute('aria-label','Revisão posterior a comparar');
 records.forEach((entry,i)=>{
  const name='Revisão '+(i+1)+' · '+(entry.updatedAt||'data pendente');
  const before=mk('option','',name),after=mk('option','',name);
  before.value=after.value=String(i);from.append(before);to.append(after);
 });
 from.value=String(records.length-2);to.value=String(records.length-1);
 fromLabel.append(from);toLabel.append(to);selectors.append(fromLabel,toLabel);
 comparison.append(selectors);
 const output=mk('div','ct370-diff-output');output.setAttribute('aria-live','polite');
 comparison.append(output);detail.append(comparison);
 const update=()=>{
  output.replaceChildren();
  const i=Number(from.value),j=Number(to.value);
  if(!Number.isInteger(i)||!Number.isInteger(j)||i>=j){
   note(output,'Escolha uma revisão anterior e outra posterior, sem inverter a ordem cronológica.');
   return;
  }
  const result=revisionDiff(records[i],records[j]);
  const summary=mk('p','ct370-diff-summary',result.changes.length+
   ' mudanças documentais · '+result.pending.length+' campos ainda inconclusivos');
  output.append(summary);
  if(result.unreadable)
   note(output,'Pelo menos uma revisão não contém snapshot legível: não presumir campos desconhecidos.');
  const items=[...result.changes.map(x=>({...x,status:'Alteração registrada'})),
   ...result.pending.map(x=>({...x,status:'PENDENTE — dado incompleto'}))];
  if(!items.length){
   note(output,'Nenhuma mudança de build documentada entre essas revisões. Observações e número de partidas podem ter sido editados, mas não comprovam evolução.');
   renderRetestPlan(output,buildRetestPlan(result,activeRole,activeStyle));
   return;
  }
  const list=mk('div','ct370-diff-list');
  for(const item of items){
   const row=mk('div','ct370-diff-row');
   row.append(mk('strong','',item.label));
   row.append(mk('span','ct370-diff-status',item.status));
   line(row,'Antes',item.before);
   line(row,'Depois',item.after);
   list.append(row);
  }
  output.append(list);
  note(output,'Níveis, habilidades e ímpetos são anotações do proprietário; PP e treino das 246 originais vêm do catálogo. Nada foi alterado nas fichas.');
  renderRetestPlan(output,buildRetestPlan(result,activeRole,activeStyle));
 };
 from.onchange=update;to.onchange=update;update();
}
function renderRevisionHistory(host,record,title){
 if(!host)return;
 host.replaceChildren();
 const detail=mk('details','ct369-history');
 detail.append(mk('summary','','Histórico de revisões · '+(record?1+(record.history?.length||0):0)));
 host.append(detail);
 note(detail,title+'. Histórico pessoal, não validação independente. Uma revisão não representa mais partidas.');
 if(!record){note(detail,'PENDENTE: nenhum registro nesta função/tática.');return}
 const history=Array.isArray(record.history)?record.history:[];
 const records=[...history,record].reverse();
 const list=mk('ol','ct369-history-list');
 for(const [i,item] of records.slice(0,12).entries()){
  if(!item||typeof item!=='object')continue;
  const row=mk('li','ct369-history-item');
  row.append(mk('strong','',(i===0?'Atual':'Anterior')+' · '+(item.updatedAt||'Data pendente')));
  line(row,'Partidas informadas',(item.matches??'PENDENTE')+' · não cumulativas');
  note(row,typeof item.notes==='string'?item.notes.slice(0,700):'Observações indisponíveis');
  note(row,revisionSummary(item));
  appendObservedSummary(row,item,false);list.append(row);
 }
 detail.append(list);
 // Comparar qualquer revisão existente, inclusive além das 12 visíveis no
 // histórico resumido: índices e snapshots permanecem isolados por edição.
 renderRevisionDiff(detail,[...history,record]);
 if(records.length>12)note(detail,(records.length-12)+' revisões anteriores continuam armazenadas no backup e no dispositivo.');
}
/* V369 — fila de documentação para a FUNÇÃO e a TÁTICA escolhidas.
   A ordem é de pendências de evidência, NÃO ranking de jogadores. */
let testQueueRefresh=()=>{};
function refreshTestQueue(){testQueueRefresh()}
function renderTestQueue(host,selected,role,tactic){
 if(!host)return;
 host.replaceChildren();
 const detail=mk('details','ct369-test-queue');detail.id='ct369-test-queue';
 detail.append(mk('summary','','Fila de testes · 15 novas + 246 originais'));
 host.append(detail);
 const inner=mk('div','ct369-queue-inner');detail.append(inner);
 note(inner,'Fila de documentação para '+role+' / '+STYLE_NAMES[tactic]+'. Ausência ou desatualização de testes NÃO significa carta inferior; não há nota por Overall.');
 const selectorLabel=mk('label','ct364-form-label','Coleção a conferir');
 const collection=mk('select','ct369-queue-select');collection.id='ct369-queue-collection';
 for(const [key,title] of [['owned','15 adicionais'],['original','246 originais']]){
  const opt=mk('option','',title);opt.value=key;collection.append(opt);
 }
 selectorLabel.append(collection);inner.append(selectorLabel);
 const filterLabel=mk('label','ct364-form-label','Estado da evidência');
 const status=mk('select','ct369-queue-select');status.id='ct369-queue-status';
 for(const [key,title] of [['priority','Primeiro: pendentes e desatualizados'],['missing','Sem partidas anotadas'],['stale','Exigem reconferência'],['recorded','Com observação registrada'],['all','Todas as edições']]){
  const opt=mk('option','',title);opt.value=key;status.append(opt);
 }
 filterLabel.append(status);inner.append(filterLabel);
 const searchLabel=mk('label','ct364-form-label','Buscar por jogador ou CAP');
 const search=mk('input','ct369-queue-search');search.id='ct369-queue-search';
 search.type='search';search.placeholder='Nome ou número da carta';
 searchLabel.append(search);inner.append(searchLabel);
 const summary=mk('p','ct369-queue-stats');summary.id='ct369-queue-stats';
 summary.setAttribute('aria-live','polite');inner.append(summary);
 const list=mk('div','ct369-queue-list');list.id='ct369-queue-list';inner.append(list);
 const more=mk('button','ct369-show-more','Mostrar mais cartas');more.type='button';
 more.id='ct369-show-more';inner.append(more);
 let map=null,limit=30;
 const render=()=>{
  if(!host.isConnected)return;
  const source=collection.value;
  const items=source==='owned'?entries.map(card=>({
   key:card.key,name:card.name,role:card.position,card,
   record:gameplayOf(card,role,tactic),
   stale:gameplayStale(card,gameplayOf(card,role,tactic)),
   identityMissing:!confirmationOf(card).cardId
  })):map?[...map.values()].map(card=>({
   key:'cap:'+card.numero,name:card.name,role:card.posicao,
   card,record:originalGameplayOf(card,role,tactic),
   stale:originalGameplayStale(card,originalGameplayOf(card,role,tactic)),
   identityMissing:!card.id
  })):[];
  const stat={missing:0,stale:0,recorded:0};
  for(const i of items){if(!i.record)stat.missing++;
   else if(i.stale)stat.stale++;else stat.recorded++;}
  const query=normalize(search.value);
  const visible=items.filter(i=>{
   if(query&&!normalize(i.name+' '+i.key).includes(query))return false;
   if(status.value==='missing')return !i.record;
   if(status.value==='stale')return Boolean(i.record&&i.stale);
   if(status.value==='recorded')return Boolean(i.record&&!i.stale);
   if(status.value==='priority')return !i.record||i.stale||i.identityMissing;
   return true;
  });
  // Ordem documental estável: desatualizados, identidade pendente,
  // sem registro, depois registros declarados. Não é qualidade de carta.
  const rank=i=>i.stale?0:i.identityMissing?1:!i.record?2:3;
  visible.sort((a,b)=>rank(a)-rank(b)||
    (source==='original'?a.card.numero-b.card.numero:
     entries.indexOf(a.card)-entries.indexOf(b.card)));
  summary.textContent=source==='original'&&!map?'Carregando as 246 edições originais…':
   items.length+' cartas · '+stat.missing+' sem testes · '+stat.stale+
   ' exigem reconferência · '+stat.recorded+' com registros atuais · '+visible.length+' no filtro';
  list.replaceChildren();
  for(const i of visible.slice(0,limit)){
   const row=mk('div','ct369-queue-item');row.dataset.testKey=i.key;
   const info=mk('div','ct369-queue-info');
   info.append(mk('strong','',(source==='original'? '#'+String(i.card.numero).padStart(3,'0')+' · ':'')+i.name));
   const state=i.stale?'Rever após alteração da edição/build':!i.record?
    'SEM TESTE INFORMADO':'Registro pessoal atual — não homologado';
   info.append(mk('span','',state+' · análise '+role+' / '+STYLE_NAMES[tactic]));
   if(i.identityMissing)info.append(mk('small','','Card ID pendente: conferir edição'));
   else if(i.role!==role)info.append(mk('small','','Função adaptada: conferir resposta na posição '+role));
   const button=mk('button','ct369-queue-action',source==='original'?'Comparar edição':'Abrir Gameplay');
   button.type='button';
   button.onclick=()=>{
    if(source==='owned'){
     switchOwnedCard(i.card);activeRole=role;activeStyle=tactic;
     activePanel='gameplay';renderDialog();
     return;
    }
    const other=baseSelection();
    if(other){
     other.value=i.key;other.dispatchEvent(new Event('change',{bubbles:true}));
     other.focus();
     // Voltar o usuário para o painel do comparador, sem rolar o modal fechado.
     other.scrollIntoView?.({block:'nearest'});
    }
   };
   row.append(info,button);list.append(row);
  }
  more.hidden=visible.length<=limit;
  more.textContent='Mostrar mais '+Math.min(30,visible.length-limit)+' ('+limit+'/'+visible.length+')';
 };
 const baseSelection=()=>document.querySelector('#ct367-comparison #ct367-other');
 testQueueRefresh=()=>{if(host.isConnected)render()};
 for(const input of [collection,status,search]){
  input.addEventListener(input===search?'input':'change',()=>{limit=30;render()});
 }
 more.onclick=()=>{limit+=30;render()};
 detail.addEventListener('toggle',()=>{if(detail.open)render()});
 loadOriginalCatalog().then(result=>{
  if(!host.isConnected||active!==selected||activeRole!==role||activeStyle!==tactic)return;
  map=result;if(detail.open&&collection.value==='original')render();
 }).catch(e=>{
  if(!host.isConnected)return;
  note(inner,'Não foi possível obter as 246 originais: '+String(e.message||e));
 });
}
/* V372 — critérios observáveis DECLARADOS, sem Overall/telemetria. */
const ACTIONS_372=[['shortPass','Passes curtos sob pressão'],['receive','Recepções sob pressão'],
 ['support','Apoios centrais para tabelas'],['recover','Desarmes/interceptações']];
function observedData(record){
 const raw=record?.observed;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 const out={};
 for(const [key] of ACTIONS_372){
  const v=raw[key];
  if(v&&Number.isInteger(v.total)&&Number.isInteger(v.success)&&v.total>=1&&
    v.total<=999&&v.success>=0&&v.success<=v.total)out[key]={total:v.total,success:v.success};
 }
 return out;
}
function renderObservedForm(host,record){
 const details=mk('details','ct372-observed');
 details.append(mk('summary','','Ações observadas · opcional'));
 note(details,'Contagens manuais desta carta, posição e tática. Use ações do jogador, nunca estatísticas da equipe.');
 const list=mk('div','ct372-observed-grid'),previous=observedData(record);
 for(const [key,title] of ACTIONS_372){
  const field=mk('fieldset','ct372-observed-item');
  field.append(mk('legend','',title));
  const cells=mk('div','ct372-observed-inputs');
  for(const type of ['total','success']){
   const label=mk('label','ct364-form-label',type==='total'?'Tentativas':'Êxitos');
   const el=mk('input','ct372-observed-count');el.type='number';el.step='1';
   el.min=type==='total'?'1':'0';el.max='999';
   el.setAttribute('data-ct372-'+type,key);
   el.value=previous[key]?String(previous[key][type]):'';
   label.append(el);cells.append(label);
  }
  field.append(cells);list.append(field);
 }
 details.append(list);
 note(details,'Não somar revisões: mesmas partidas podem reaparecer no histórico. Não medir qualidade pelo Overall.');
 host.append(details);return details;
}
function collectObserved(details){
 const result={};
 for(const [key,title] of ACTIONS_372){
  const a=details.querySelector('[data-ct372-total="'+key+'"]')?.value.trim();
  const b=details.querySelector('[data-ct372-success="'+key+'"]')?.value.trim();
  if(!a&&!b)continue;
  if(!a||!b||!/^\d+$/.test(a)||!/^\d+$/.test(b))
   return {error:title+': preencha tentativas e êxitos inteiros ou deixe ambos vazios.'};
  const total=Number(a),success=Number(b);
  if(total<1||total>999||success<0||success>total)
   return {error:title+': êxitos devem ficar entre 0 e tentativas (1–999).'};
  result[key]={total,success};
 }
 return {value:result};
}
function appendObservedSummary(parent,record,stale){
 const box=mk('div','ct372-evidence-summary');
 box.append(mk('strong','','Ações individuais declaradas'));
 const evidence=observedData(record);
 if(stale)note(box,'Registro de outra build/edição: não comparar taxas com a versão atual.');
 else if(!Object.keys(evidence).length)note(box,'PENDENTE: sem ações quantificadas.');
 else{
  const list=mk('ul','ct372-evidence-list');
  for(const [key,title] of ACTIONS_372){
   const item=evidence[key];if(!item)continue;
   const li=mk('li','',title+': '+item.success+' / '+item.total+' êxitos');
   li.append(mk('small','',item.total>=5?
    ' · '+Math.round(100*item.success/item.total)+'% desta amostra declarada':
    ' · amostra pequena, sem percentual'));
   list.append(li);
  }
  box.append(list);
  note(box,'Somente anotação pessoal; sem ranking meta, telemetria ou comparação estatística homologada.');
 }
 parent.append(box);
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
 const observedForm=renderObservedForm(base,saved);
 const save=mk('button','ct364-save','Salvar observação desta carta');
 save.type='button';save.id='ct367-save';
 const feedback=mk('p','ct364-feedback');feedback.id='ct367-feedback';feedback.setAttribute('role','status');
 save.onclick=()=>{
  const count=Number(matches.value),value=notes.value.trim(),video=validVideoLink(link.value);
  if(!checked.checked){feedback.textContent='Confirme que a observação veio de partidas reais com esta carta.';return;}
  if(!Number.isInteger(count)||count<1||count>200||value.length<15||video===null){
   feedback.textContent='Informe 1 a 200 partidas, pelo menos 15 caracteres e link HTTPS válido quando houver.';return;
  }
  const actions=collectObserved(observedForm);
  if(actions.error){feedback.textContent=actions.error;observedForm.open=true;return}
  const record={cardKey:c.key,role,tactic,cardIdAtCapture:id,
   buildSnapshot:gameplayBuildSnapshot(c),matches:count,observed:actions.value,
   notes:value,url:video||'',ownerConfirmed:true,updatedAt:new Date().toISOString()};
  try{
   const all=gameplayData(),previous=gameplayOf(c,role,tactic);
   localStorage.setItem(GAMEPLAY_STORAGE,JSON.stringify({
    ...all,[gameplayKey(c,role,tactic)]:{...record,history:revisionHistory(previous)}
   }));
   notifyBackup();
   feedback.textContent='Registro individual salvo neste aparelho. Não altera a build aprovada.';
   renderGameplayComparison(c,role,tactic,base);
   renderRevisionHistory(base.querySelector('#ct369-owned-history'),
    gameplayOf(c,role,tactic),'Minha carta '+c.name);
   refreshTestQueue();
  }catch(error){feedback.textContent='Não foi possível salvar: '+String(error.message||error)}
 };
 base.append(save,feedback);
 const comparison=mk('div','ct367-comparison');comparison.id='ct367-comparison';
 base.append(comparison);
 const timeline=mk('div','ct369-owned-history');timeline.id='ct369-owned-history';
 base.append(timeline);
 const queue=mk('div','ct369-queue-host');queue.id='ct369-queue-host';base.append(queue);
 body.append(base);renderGameplayComparison(c,role,tactic,base);
 renderRevisionHistory(timeline,gameplayOf(c,role,tactic),'Minha carta '+c.name);
 renderTestQueue(queue,c,role,tactic);
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
 const observedForm=renderObservedForm(box,record);
 const save=mk('button','ct364-save','Salvar observação da carta original');save.type='button';save.id='ct368-save';
 const feedback=mk('p','ct364-feedback');feedback.id='ct368-feedback';feedback.setAttribute('role','status');
 save.onclick=()=>{
  const m=Number(matches.value),n=notes.value.trim(),url=validVideoLink(link.value);
  if(!ack.checked){feedback.textContent='Confirme que observou a edição indicada em partidas reais.';return}
  if(!Number.isInteger(m)||m<1||m>200||n.length<15||url===null){
   feedback.textContent='Informe 1 a 200 partidas, notas de 15 caracteres e link HTTPS válido quando fornecido.';return;
  }
  const actions=collectObserved(observedForm);
  if(actions.error){feedback.textContent=actions.error;observedForm.open=true;return}
  const entry={cap:card.numero,role,tactic,cardIdAtCapture:String(card.id||''),
   snapshot:originalSnapshot(card),matches:m,notes:n,url:url||'',observed:actions.value,
   ownerConfirmed:true,updatedAt:new Date().toISOString()};
  try{
   const all=originalGameplayData(),previous=originalGameplayOf(card,role,tactic);
   localStorage.setItem(ORIGINAL_GAMEPLAY_STORAGE,JSON.stringify({
    ...all,[originalGameplayKey(card.numero,role,tactic)]:{
     ...entry,history:revisionHistory(previous)
    }
   }));
   notifyBackup();feedback.textContent='Registro salvo separadamente. Nenhuma ficha ou build original foi modificada.';
   refresh();
   refreshTestQueue();
  }catch(e){feedback.textContent='Falha ao salvar anotação: '+String(e.message||e)}
 };
 box.append(save,feedback);
 const timeline=mk('div','ct369-original-history');box.append(timeline);
 renderRevisionHistory(timeline,record,'Carta original #'+String(card.numero).padStart(3,'0'));
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
   appendObservedSummary(panel,value,stale);
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
   appendObservedSummary(panel,value,stale);
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
    renderOriginalEvidence(original,role,tactic,form,()=>{
     show();
     const message=form.querySelector('#ct368-feedback');
     if(message)message.textContent='Registro salvo separadamente; comparação atualizada. Nenhuma build original foi modificada.';
    });
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
 if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(x=>x.href.split('?')[0].endsWith('/craque-positional-v311.css'))){
  const style=document.createElement('link');style.rel='stylesheet';style.href='craque-positional-v311.css';document.head.append(style);
 }
 const jobs=[
 ['booster-engine-v103.js','SCOUT_BOOSTERS_V103'],
 ['skills-booster-v162.js','SCOUT_RECOMMENDATIONS_V162'],
 ['scout-multitactic-engine-v220.js','SCOUT_TACTICS_V220'],
 ['craque-role-intelligence-v233.js','CRAQUE_INTERPRETATION_V233'],
 ['craque-ficha-individual-v251.js','CRAQUE_FICHA_INDIVIDUAL_V251'],
 ['craque-pp-universal-v309.js','CRAQUE_PP_UNIVERSAL_V309'],
 ['craque-friends-training-v228.js','CRAQUE_FRIEND_TRAINING_V228'],
 ['craque-positional-v311.js','CRAQUE_POSITIONAL_V311'],
 ['craque-positional-ui-v311.js','CRAQUE_POSITIONAL_UI_V311']
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
/* V373: parecer competitivo individual V251/V233/V162/V103, sem equipar nada. */
function renderProfessionalDossier(result,host,kind){
 const pro=result?.professional;
 if(!pro){note(host,'Parecer PRO pendente: motor não retornou critérios individuais.');return}
 const block=section(kind==='treino'?'Auditoria da ficha de treino':
  kind==='skills'?'Cinco habilidades: carteira balanceada':'Ímpetos: comparação contextual');
 block.classList.add('ct373-pro');block.dataset.proKind=kind;
 note(block,'Critérios competitivos inspirados em Rentão/Blackjhon; nenhuma build ou opinião atribuída a vídeo não verificado da edição.');
 line(block,'Função · tática',(pro.role||'PENDENTE')+' · '+(STYLE_NAMES[pro.tactic]||pro.tactic));
 if(kind==='treino'){
  line(block,'Distribuição',pro.trainingStatus==='hipotese'?'PROPOSTA NÃO HOMOLOGADA':'PENDENTE — nível/PP');
  line(block,'Treino atual',pro.baselineValid?'Manual válido para comparar':'NÃO CONFERIDO — não presumir diferença');
  const differences=pro.trainingDifferences||[];
  if(differences.length){
   const ol=mk('ol','ct373-pro-list');
   for(const d of differences){const li=mk('li');
    li.append(mk('strong','',d.name),mk('p','',d.was+' → '+d.proposed+' · hipótese sem aplicação'));
    ol.append(li);}block.append(ol);
  }else note(block,'Nenhuma mudança comprovada entre o treino atual e a proposta.');
  for(const [title,items] of [['Testes por função',pro.roleTests],['Compensações',pro.tradeoffs]]){
   if(!items?.length)continue;
   const details=mk('details','ct373-pro-method');details.append(mk('summary','',title));
   const ul=mk('ul');for(const item of items)ul.append(mk('li','',item));details.append(ul);block.append(details);
  }
 }else if(kind==='skills'){
  line(block,'Vagas livres comprovadas',pro.freeSkillSlots===null?'NÃO COMPROVADAS':String(pro.freeSkillSlots));
  const list=mk('ol','ct373-pro-list');
  for(const item of pro.skillPortfolio){
   const li=mk('li');li.append(mk('strong','',item.priority+'. '+item.name));
   note(li,'Função: '+item.functionReason);note(li,'Equilíbrio: '+item.explanation);
   if(item.nativeRelation)note(li,'Nativas: '+item.nativeRelation);
   if(item.situation)note(li,'Teste: '+item.situation);list.append(li);
  }
  if(list.children.length)block.append(list);
  else note(block,'Sem cinco candidatas documentáveis: conferir edição, nativas e função.');
  note(block,'Evita repetir a mesma família sem necessidade; cinco sugestões NÃO significam cinco slots disponíveis.');
 }else{
  line(block,'Ímpeto fixo',pro.factoryBooster||'PENDENTE');
  line(block,'Slot adicional comprovado',pro.slotSupported?'Indicado no catálogo; verificar no jogo':'NÃO COMPROVADO');
  const list=mk('ol','ct373-pro-list');
  for(const item of pro.boosterAlternatives){
   const li=mk('li');li.append(mk('strong','',item.priority+'. '+item.name));
   if(item.axes?.length)note(li,'Atributos envolvidos: '+item.axes.join(' · '));
   note(li,'Sobreposição com ímpeto fixo: '+(item.overlapWithFixed===null?'pendente':item.overlapWithFixed+' de 4'));
   note(li,'Índice relativo de função/tática; não prova melhor gameplay.');list.append(li);
  }
  if(list.children.length)block.append(list);else note(block,'Sem alternativas documentadas suficientes.');
  line(block,'Gastar tokens','NÃO AUTORIZADO');
 }
 const details=mk('details','ct373-pro-method');
 details.append(mk('summary','','Pendências e limitações ('+pro.issues.length+')'));
 const ul=mk('ul');for(const item of pro.issues.slice(0,12))ul.append(mk('li','',item));
 details.append(ul);block.append(details);host.append(block);
}
async function renderTraining(c,body){
 const tools=section('Escolha a tática — cinco fichas do mesmo motor');
 const modes=mk('nav','ct364-modes');
 STYLE_IDS.forEach(id=>{const b=mk('button','',STYLE_NAMES[id]);b.type='button';
  b.setAttribute('aria-pressed',String(activeStyle===id));b.addEventListener('click',()=>{activeStyle=id;renderDialog();});modes.append(b)});
 tools.append(modes);const area=mk('div','ct364-training-area');
 tools.append(area);body.append(tools);
 note(tools,'Sobreposição: perfil ainda pendente neste laboratório. As cinco táticas disponíveis mantêm cálculos independentes.');
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
  const role=activeRole||c.position,tactic=activeStyle,engineCard=cardAsEngine(c,role);
  const result=engine.evaluate(cardAsEngine(c,activeRole),activeStyle);
  const plan=result.plan;
  const draft=engine.readFunctionDraft(localStorage,engineCard,tactic);
  const review=engine.functionReview(engineCard,result,draft&&!draft.stale?draft.levels:undefined);
  const shared=window.CRAQUE_POSITIONAL_UI_V311?.reviewPanel;
  if(shared)area.append(shared(review,{
   referenceLabel:draft?(draft.stale?'Rascunho anterior desatualizado · preservado':
    'Rascunho desta função · revisão '+draft.revision):'Nenhum rascunho salvo nesta função',
   onAdopt:()=>{
    engine.saveFunctionDraft(localStorage,cardAsEngine(c,role),tactic,result);
    notifyBackup();renderDialog();return 'Proposta adotada em nova revisão independente.';
   }
  }));
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
   renderProfessionalDossier(result,area,'treino');
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
  renderProfessionalDossier(result,results,kind);
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
 for(const p of ['CA','SA','MAT','MLG','VOL','ZC','ZG','LE','LD','PTE','PTD','MLE','MLD','GO']){
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
