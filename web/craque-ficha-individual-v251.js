/* Craque Tático V251 — engenharia INDIVIDUAL, documental e conservadora.
 * Nenhuma build é homologada por OVR, custo PP fechado ou heurística.
 * Rentão/Blackjhon são referências de CRITÉRIOS, não fonte de uma build sem vídeo.
 * Mantém 246 cartas, hashes, treinos, boosters e habilidades de origem intactos.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_FICHA_INDIVIDUAL_V251=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const moduleGet=p=>{if(typeof module!=='object'||!module.exports)return null;try{return require(p)}catch(_){return null}};
const T=host?.SCOUT_TACTICS_V220||moduleGet('./scout-multitactic-engine-v220.js');
const I=host?.CRAQUE_INTERPRETATION_V233||moduleGet('./craque-role-intelligence-v233.js');
const STATES=Object.freeze({
 complete:'PP e treino cadastrados · sem validação competitiva',
 no_build:'PP confirmado · distribuição ainda pendente',
 no_level:'Treino cadastrado · nível máximo sem comprovação',
 unsupported:'Edição ou PP divergente · revisão obrigatória'
});
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const nativeNames=s=>String(s??'').split(';').map(x=>norm(x)).filter(Boolean);
const exact=(source,raw)=>Boolean(source&&raw&&Number(source.numero)===Number(raw.capture)&&
 String(source.id)===String(raw.id)&&norm(source.name)===norm(raw.name)&&
 norm(source.versao)===norm(raw.edition));
const roleOf=c=>T?.roleOf?.({shown_position:c?.posicao||c?.shown_position})||null;
const confirmedLevel=c=>Number.isInteger(c?.max_level)&&c.max_level>=1&&
 typeof c.pp_origem==='string'&&c.pp_origem.startsWith('informado_pelo_usuario_')&&
 Number(c.pp)===2*(c.max_level-1)&&c.pp_estimado!==true;
const hasValidBuild=c=>T?.valid(c?.niveis)===true&&T.total(c.niveis)===Number(c.pp);
// Para confrontar a V211, não agrupar PTE e PTD artificialmente.
const comparisonPosition=c=>{
 const position=String(c?.posicao||'').toUpperCase();
 return ({AC:'CA',ZC:'ZG',DC:'ZG',MC:'MLG',GR:'GO',MDF:'VOL'})[position]||position;
};
const signature=c=>hasValidBuild(c)?[
  comparisonPosition(c),norm(c.estilo_ataque),Number(c.pp),c.niveis.join(',')
].join('|'):null;
function related(card,cards){
 const sig=signature(card);
 if(!sig||!Array.isArray(cards))return [];
 return cards.filter(c=>Number(c.numero)!==Number(card.numero)&&signature(c)===sig)
   .map(c=>({
    numero:c.numero,name:c.name,id:String(c.id),
    differentSkills:nativeNames(c.habilidades_nativas).join('|')!==nativeNames(card.habilidades_nativas).join('|'),
    differentBooster:norm(c.impeto_fixo)!==norm(card.impeto_fixo),
    details:'Mesmo PP, posição, estilo e níveis; não significa mesma performance.'
   }));
}
function sourceFor(card,raw){
 if(!exact(card,raw)||Number(card.pp)!==Number(raw.pp))return null;
 // Catálogo confirmado por CAP + Card ID + edição. Não copiar para outras cartas.
 return {
  capture:Number(card.numero),id:String(card.id),name:card.name,edition:card.versao,
  shown_position:card.posicao,role_used:raw.role_used,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,
  native_skills:card.habilidades_nativas,
  pp:Number(card.pp),pp_estimated:card.pp_estimado===true,
  recommended_levels:hasValidBuild(card)?card.niveis.slice():null,
  base_stats_known:card.base_stats_known===true,
  training_provisional:card.treino_proposto_nao_validado===true,
  max_level:card.max_level,pp_origem:card.pp_origem,
  confirmacao_no_jogo:card.habilidades_nativas_origem?.confirmacao_no_jogo===true,
  habilidades_nativas_origem:card.habilidades_nativas_origem||null
 };
}
const recognizedStyles=new Set(['posse','normal','rapido','fora','longo']);
 // Revisão V248/V250: só a mesma edição, confirmação explícita de nível
 // e PP coerentes. Esse registro é declaração do usuário, não prova externa.
 function localLevelReview(card,store){
  if(!card||!store?.getItem)return null;
  try{
   const key='scoutpro:v248:level-review:'+Number(card.numero)+'@'+String(card.id);
   const value=JSON.parse(store.getItem(key)||'null');
   if(!value||value.schema!=='CRAQUE_PROGRESS_REVIEW_V248'||
    value.confirmed_in_game!==true||
    Number(value.numero)!==Number(card.numero)||
    String(value.card_id)!==String(card.id)||
    String(value.name)!==String(card.name)||
    !Number.isInteger(value.level)||value.level<1||value.level>120||
    value.pp!==2*(value.level-1))return null;
   return Object.freeze({level:value.level,pp:value.pp,source:'conferencia_local_usuario'});
  }catch(_){return null}
 }

/* Otimização limitada de INVESTIMENTO em categorias: mochila inteira,
 * custo progressivo e função convexamente penalizada. Não simula status final.
 * Não introduz diferenças por nome, número da carta ou Card ID.
 */
function allocate(weights,role,pp,baseline){
 if(!T||!Number.isInteger(pp)||pp<0||pp>300||!Array.isArray(weights)||weights.length!==10)return null;
 const allowed=role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
 let dp=Array(pp+1).fill(null);dp[0]={utility:0,levels:Array(10).fill(0)};
 for(const i of allowed){
  const next=Array(pp+1).fill(null);
  const w=Math.max(0,Number(weights[i])||0);
  for(let spent=0;spent<=pp;spent++){
   const before=dp[spent];if(!before)continue;
   for(let n=0;n<=20;n++){
    const price=T.ppCost(n),newCost=spent+price;
    if(newCost>pp)break;
    const preserve=Array.isArray(baseline)&&T.valid(baseline)?
      Math.abs(n-baseline[i])*0.15:0;
    const utility=before.utility+w*(n-0.047*n*n)-preserve;
    const existing=next[newCost];
    if(!existing||utility>existing.utility+1e-9){
     const levels=before.levels.slice();levels[i]=n;
     next[newCost]={utility,levels};
    }
   }
  }
  dp=next;
 }
 return dp[pp]&&T.total(dp[pp].levels)===pp?dp[pp].levels:null;
}
/* V253 — comparar uma proposta com outras edições de função/orçamento
 * iguais. Nunca inventar diferenças por nome, Card ID ou Overall.
 * Proposta repetida não prova erro, mas nunca é chamada de individualmente
 * otimizada enquanto seus sinais reais forem insuficientes.
 */
function compareProposals(card,cards,style,role,levels,opts={}){
 if(!T||!I||!T.valid(levels)||!Array.isArray(cards))
  return {status:'pendente',compared:0,matches:[],distinctSources:0};
 const pp=Number(card.pp);
 const native=c=>nativeNames(c.habilidades_nativas).sort().join('|');
 const peers=cards.filter(c=>Number(c.numero)!==Number(card.numero)&&
  Number(c.pp)===pp&&roleOf(c)===role);
 const matches=[];let compared=0;
 for(const peer of peers){
  if(!confirmedLevel(peer)&&!localLevelReview(peer,opts.store))continue;
  const profile={
   capture:Number(peer.numero),id:String(peer.id),edition:peer.versao,
   shown_position:peer.posicao,role_used:role,
   attack_style:peer.estilo_ataque,defence_style:peer.estilo_defesa,
   native_skills:peer.habilidades_nativas,
   boost1:peer.impeto_fixo,boost2:peer.impeto_extra,
   pp:Number(peer.pp),pp_estimated:peer.pp_estimado===true,
   base_stats_known:peer.base_stats_known===true,
   recommended_levels:hasValidBuild(peer)?peer.niveis:null
  };
  const interpretation=I.interpret(profile,style,{});
  if(!interpretation||interpretation.role!==role)continue;
  const alternate=allocate(interpretation.weights,role,pp,
   hasValidBuild(peer)?peer.niveis:null);
  if(!T.valid(alternate)||T.total(alternate)!==pp)continue;
  compared++;
  if(!alternate.every((value,i)=>value===levels[i]))continue;
  const inputsDifferent=[];
  if(native(card)!==native(peer))inputsDifferent.push('habilidades nativas');
  if(norm(card.impeto_fixo)!==norm(peer.impeto_fixo))inputsDifferent.push('ímpeto fixo');
  if(norm(card.estilo_ataque)!==norm(peer.estilo_ataque))inputsDifferent.push('estilo da carta');
  if(norm(card.estilo_defesa)!==norm(peer.estilo_defesa))inputsDifferent.push('função defensiva');
  matches.push({numero:peer.numero,id:String(peer.id),name:peer.name,inputsDifferent});
 }
 const distinctSources=matches.filter(x=>x.inputsDifferent.length>0).length;
 const status=distinctSources?'repeticao_exige_validacao':
  matches.length?'proposta_repetida_sem_prova':'sem_repeticao_detectada';
 const note=distinctSources?
  'A mesma distribuição foi calculada para cartas com habilidades ou comportamentos diferentes. Sem atributos finais e gameplay, nenhuma das propostas está comprovada.':
  matches.length?'A proposta coincide com outra edição; isso não demonstra acerto, erro ou superioridade.':
  'Nenhuma repetição detectada no grupo comparado. Isso não comprova desempenho competitivo.';
 return {status,compared,matches,distinctSources,note};
}
function buildReview(card,raw,lab,all,style,opts={}){
 if(!recognizedStyles.has(style))throw Error('Estilo de técnico inválido');
 if(!T||!I)return {status:'unsupported',reason:'Motor de revisão indisponível.',proposal:null};
 const aligned=sourceFor(card,raw),rawIdentity=exact(card,raw);
 if(!aligned)return {
  status:'unsupported',canDraft:false,proposal:null,
  reason:rawIdentity?'PP da ficha e do catálogo divergem. Não calcular a ficha até reconciliar ambos.':
   'CAP, Card ID, nome ou edição não coincidem. Proposta bloqueada.',
  sourceCompatible:false,related:[],differences:[]
 };
 const localProof=localLevelReview(card,opts.store);
 if(localProof&&localProof.pp!==aligned.pp)return {
  status:'unsupported',canDraft:false,proposal:null,sourceCompatible:true,
  related:[],differences:[],evidenceLevel:'conferencia_local_usuario',
  reason:'PP DIVERGENTES: nível máximo '+localProof.level+
   ' conferido nesta edição indica '+localProof.pp+' PP, mas o catálogo e a ficha usam '+
   aligned.pp+' PP. Treinamentos bloqueados até reconciliar os dados.'
 };
 const target=String(opts.targetPosition||card.posicao);
 const natural=opts.positionTraining?.pos?.(card.posicao)||String(card.posicao);
 const mapped=opts.positionTraining?.pos?.(target)||target;
 let positionProof=null;
 if(mapped!==natural){
  positionProof=opts.positionTraining?.status?.(card,mapped,opts.store)||null;
  if(!positionProof?.eligible)return {
   status:'unsupported',canDraft:false,proposal:null,sourceCompatible:true,
   related:[],differences:[],
   reason:'Posição '+mapped+' não confirmada para esta edição. Treine ou confirme familiaridade no eFootball antes de gerar uma build para essa função.'
  };
 }
 // A troca só muda a função TÁTICA da proposta; identidade e posição original
 // do catálogo seguem intactas.
 const interpreted={...aligned,shown_position:mapped,role_used:mapped};
 const levelKnown=confirmedLevel(card)||Boolean(localProof),buildKnown=hasValidBuild(card);
 const status=levelKnown?(buildKnown?'complete':'no_build'):'no_level';
 const nativeMismatch=norm(card.habilidades_nativas)!==norm(raw.native_skills);
 const boostMismatch=norm(card.impeto_fixo)!==norm(raw.boost1);
 const context=I.interpret(interpreted,style,lab)||null;
 const shared=related(card,all);
 const differences=[];
 if(nativeMismatch)differences.push('As habilidades nativas do catálogo são diferentes das da ficha antiga; análise usa a edição identificada no catálogo.');
 if(boostMismatch)differences.push('Ímpeto fixo da ficha antiga diverge do catálogo; confirmar antes de equipar qualquer ímpeto.');
 if(!card.habilidades_nativas||card.habilidades_nativas_origem?.confirmacao_no_jogo===false)
  differences.push('Habilidades nativas ainda não confirmadas dentro do jogo; consultar a edição exata.');
 if(!card.base_stats_known||!Object.keys(lab?.stats||{}).length)
  differences.push('Atributos-base numéricos finais indisponíveis; não otimizar por limite de atributo/Overall.');
 if(!levelKnown)
  differences.push('Nível máximo desta edição não comprovado; não recalcular o treino apenas com PP do catálogo.');
 if(localProof)differences.push('Nível '+localProof.level+
  ' e '+localProof.pp+' PP conferidos localmente pelo usuário na edição exata. Não equivalem a atributos-base nem gameplay confirmados.');
 if(!buildKnown)
  differences.push('Sem distribuição de treino documentada; proposta matemática não equivale a ficha aprovada.');
 if(shared.length)differences.push('Distribuição repetida em '+shared.length+' outra(s) carta(s); comparar habilidades, corpo e gameplay, sem forçar diferenciação.');
 const canDraft=levelKnown&&context&&Number.isInteger(aligned.pp);
 let proposal=null,changed=null,specificity=null;
 if(canDraft){
  const levels=allocate(context.weights,context.role,aligned.pp,buildKnown?card.niveis:null);
  if(levels&&T.total(levels)===aligned.pp){
   const diffs=buildKnown?levels.map((n,i)=>({
    name:T.CATEGORIES[i],before:card.niveis[i],after:n,delta:n-card.niveis[i]
   })).filter(x=>x.delta):[];
   specificity=compareProposals(card,all,style,context.role,levels,opts);
   proposal={
    levels,spent:aligned.pp,style,role:context.role,
    source:'hipotese_matematica_v251_sem_status_finais',
    note:'Distribuição consultiva por função, estilo e habilidades documentais. NÃO validada por Rentão, Blackjhon ou partidas.',
    differsFromRegistered:buildKnown?diffs.length>0:null
   };
   changed=diffs;
  }
 }
 return {
  status,description:STATES[status],canDraft:!!proposal,proposal,
  positionUsed:mapped,positionEvidence:positionProof?.status||'original',
  changes:changed,specificity,sourceCompatible:true,related:shared,differences,
  capture:aligned.capture,card_id:aligned.id,style,role:context?.role||roleOf(card),
  pp:aligned.pp,level:levelKnown?(localProof?.level??card.max_level):null,
  original:buildKnown?card.niveis.slice():null,
  tacticLabel:T.styleFor(style)?.label,context,
  nativeSkills:String(card.habilidades_nativas||'').split(';').map(s=>s.trim()).filter(Boolean),
  boosterFixed:card.impeto_fixo,boosterExtra:card.impeto_extra,
  originNative:card.habilidades_nativas_origem||null,
  evidenceLevel:confirmedLevel(card)?'documental_usuario':
   localProof?'conferencia_local_usuario':'pendente',
  trainingProof:'sem_teste_independente_de_partida',
  method:'Revisão de investimento de PP, não engenharia comprovada de atributos finais.'
 };
}
function catalogAudit(cards){
 if(!Array.isArray(cards)||cards.length!==246)throw Error('O acervo precisa manter 246 cartas.');
 const seen=new Set(),counts={
  total:246,withLevelAndBuild:0,withLevelNoBuild:0,withBuildNoLevel:0,
  withoutLevelAndBuild:0,duplicateGroups:0,duplicatedCards:0,
  nativeDocumented:0,baseFlag:0,confirmedBuildsByGameplay:0
 };
 const groups=new Map();
 for(const card of cards){
  const number=Number(card.numero);
  if(!Number.isInteger(number)||seen.has(number))throw Error('CAP inválido ou duplicado: '+card.numero);
  seen.add(number);
  const lvl=confirmedLevel(card),has=hasValidBuild(card);
  if(lvl&&has)counts.withLevelAndBuild++;
  else if(lvl)counts.withLevelNoBuild++;
  else if(has)counts.withBuildNoLevel++;
  else counts.withoutLevelAndBuild++;
  if(card.habilidades_nativas)counts.nativeDocumented++;
  if(card.base_stats_known===true)counts.baseFlag++;
  const sig=signature(card);
  if(sig){if(!groups.has(sig))groups.set(sig,[]);groups.get(sig).push(number)}
 }
 const duplicates=[...groups.values()].filter(v=>v.length>1);
 counts.duplicateGroups=duplicates.length;
 counts.duplicatedCards=duplicates.reduce((n,v)=>n+v.length,0);
 counts.proposalsAreVerified=false;
 return counts;
}
/* V252 — documentação individual, NÃO pontuação meta.
 * Prints candidatos e flags gerais não comprovam a edição exata. */
function proofChecklist(card,index,lab,store){
 const matched=!!(card&&index&&Number(index.numero)===Number(card.numero)&&
  String(index.card_id)===String(card.id)&&norm(index.nome)===norm(card.name)&&
  norm(index.edicao)===norm(card.versao));
 const row=matched?index:{};
 const native=String(card?.habilidades_nativas||'').split(';').filter(x=>x.trim()).length;
 const stats=lab?.stats&&typeof lab.stats==='object'&&
  Object.values(lab.stats).some(x=>x&&Number.isFinite(x.base)&&x.base>=0&&x.base<=120);
 let installedSkills='',boostSlot=null;
 try{
  installedSkills=String(store?.getItem('scoutpro:v162:equipped:'+
   card.numero+':'+card.id)||'').trim();
  boostSlot=JSON.parse(store?.getItem('scoutpro:v103:booster:'+
   Number(card.numero))||'null');
 }catch(_){boostSlot=null}
 const extraConfirmed=installedSkills.split(';').map(x=>x.trim()).filter(Boolean);
 const boosterReported=boostSlot&&String(boostSlot.card_id)===String(card.id)&&
  ['vazio','ocupado','ausente'].includes(boostSlot.status);
 const checks=[
  {id:'edition',name:'CAP e Card ID vinculados à edição do catálogo',
   documented:matched&&!['sem_card_id','card_id_compartilhado'].includes(row.id_status),
   note:'Identidade cadastral não substitui print da versão.'},
  {id:'budget',name:'Nível máximo e PP comprovados pelo usuário',
   documented:confirmedLevel(card)||Boolean(localLevelReview(card,store)),
   note:'PP matematicamente fechados não homologam builds.'},
  {id:'native',name:'Habilidades nativas documentadas',
   documented:matched&&native>0&&native===row.nativas_documentadas,
   note:'Cadastro não comprova habilidades equipadas.'},
  {id:'additional',name:'Habilidades adicionais informadas nesta conta',
   documented:extraConfirmed.length>0&&extraConfirmed.length<=5,
   note:'Registro manual de habilidades; não comprova sua aplicação no jogo.'},
  {id:'booster',name:'Slot de ímpeto conferido pelo usuário',
   documented:Boolean(boosterReported),
   note:'Só o slot confirmado da edição permite avaliar ímpeto equipável.'},
  {id:'base',name:'Atributos-base numéricos utilizáveis',
   documented:row.base_stats_confirmados===true&&Boolean(stats),
   note:'Uma flag sem valores não permite simular status finais.'},
  {id:'body',name:'Biotipo/documentação corporal da edição',
   documented:row.modelo_corporal_documentado===true,
   note:'Biotipo não confirma automaticamente animações.'},
  {id:'playerid',name:'Player ID e animações confirmados',
   documented:card?.player_id_animacao_confirmado===true,
   note:'Não inferir Player ID por outro cartão do mesmo atleta.'},
  {id:'video',name:'Print/vídeo com edição e Card ID verificados',
   documented:row.print_edicao_confirmada===true,
   note:'Print candidato vinculado somente pelo nome é insuficiente.'},
  {id:'gameplay',name:'Teste comparável da build em partidas',
   documented:card?.training_gameplay_verified===true,
   note:'Nunca atribuir aprovação ao Rentão ou Blackjhon sem evidência.'}
 ];
 return {matched,checks,documented:checks.filter(x=>x.documented).length,
  pending:checks.filter(x=>!x.documented).length,
  competitivelyVerified:checks.find(x=>x.id==='gameplay').documented&&
    checks.find(x=>x.id==='base').documented&&checks.find(x=>x.id==='budget').documented};
}
const api=Object.freeze({STATES,norm,roleOf,confirmedLevel,localLevelReview,hasValidBuild,proofChecklist,signature,compareProposals,
  exact,sourceFor,related,allocate,buildReview,catalogAudit});
if(!host?.document)return api;
const doc=host.document;
const mk=(tag,cls,value)=>{
 const e=doc.createElement(tag);if(cls)e.className=cls;
 if(value!==undefined)e.textContent=String(value);
 return e;
};
let card=null,raw=null,lab=null,all=null,active='posse',block=null,positionSelected=null,evidenceByCap=new Map();
function display(){
 if(!card||!raw||!block)return;
 const posApi=host.SCOUT_POSITION_TRAINING_V246;
 const check=buildReview(card,raw,lab,all,active,{
  targetPosition:positionSelected||card.posicao,positionTraining:posApi,
  store:host.localStorage
 });
 block.replaceChildren();
 block.dataset.review=check.status;
 const reviewSummary=doc.getElementById('ct253-integrated-review')?.querySelector('summary');
 if(reviewSummary){
  const status=check.status==='unsupported'?'revisão obrigatória':
   check.status==='no_level'?'nível pendente':
   check.status==='no_build'?'treino pendente':'PP documentados';
  reviewSummary.textContent='03 · Auditoria da edição · '+(check.tacticLabel||'Posse de Bola')+
   ' · '+status+' · abrir detalhes';
 }
 const heading=mk('div','ct251-heading');
 heading.append(mk('strong','ct251-title','Auditoria da edição · '+(check.tacticLabel||'Posse de Bola')),
  mk('span','ct251-status',check.description||'Evidências a revisar'));
 block.append(heading);
 // A função original é a opção padrão; alternativas somente após confirmação
 // por edição exata no V246. Overall alto em CA NÃO é treinamento.
 if(posApi){
  const positions=[{
   code:posApi.pos(card.posicao)||String(card.posicao),
   note:'posição original'
  }];
  for(const code of posApi.trained(card,host.localStorage))
   if(!positions.some(p=>p.code===code))positions.push({code,note:'treinamento confirmado'});
  for(const code of posApi.familiar(card,host.localStorage))
   if(!positions.some(p=>p.code===code))positions.push({code,note:'familiaridade confirmada'});
  if(positions.length>1){
   const label=mk('label','ct251-position-label','Função tática da proposta');
   const select=mk('select','ct251-position-select');
   select.id='ct251-position';
   for(const item of positions){
    const op=mk('option','',item.code+' · '+item.note);
    op.value=item.code;select.append(op);
   }
   select.value=posApi.pos(positionSelected||card.posicao)||positions[0].code;
   select.addEventListener('change',()=>{positionSelected=select.value;display()});
   label.append(select);block.append(label);
  }
 }
 if(check.status==='unsupported'){
  block.append(mk('p','ct251-warning',check.reason));
  return;
 }
 const info=mk('p','ct251-intro',
  '#'+String(card.numero).padStart(3,'0')+' · '+card.versao+' · '+
  (check.level?'Nível '+check.level+' confirmado documentalmente':'Nível máximo não comprovado')+
  ' · '+card.pp+' PP do catálogo. Função proposta: '+check.role+
  (check.positionEvidence==='original'?' (posição original).':' (posição alternativa confirmada na conta).'));
 block.append(info);
 const chips=mk('div','ct251-evidence');
 chips.append(mk('span','','Sem Overall como critério'),
  mk('span','',check.nativeSkills.length+' habilidades nativas no catálogo'),
  mk('span','',check.related.length+' fichas semelhantes'),
  mk('span','',check.evidenceLevel==='documental_usuario'?'PP/nível documentado':
    check.evidenceLevel==='conferencia_local_usuario'?'PP/nível conferidos neste dispositivo':'PP sem nível comprovado'));
 block.append(chips);
 const proof=proofChecklist(card,evidenceByCap.get(Number(card.numero)),lab,host.localStorage);
 const criteria=mk('details','ct251-evidence-details ct251-proof');
 criteria.append(mk('summary','','Fontes desta edição: '+proof.documented+
  ' documentadas · '+proof.pending+' pendentes · nenhuma homologação automática'));
 const criteriaList=mk('ul','ct251-proof-list');
 for(const item of proof.checks){
  const li=mk('li','',item.name+' — '+
   (item.documented?'DOCUMENTADO':'PENDENTE')+'. '+item.note);
  li.dataset.proof=item.documented?'documented':'pending';
  criteriaList.append(li);
 }
 criteria.append(criteriaList);block.append(criteria);
 if(check.related.length){
  const similar=mk('p','ct251-duplicates',
   'Revisão obrigatória de treinos repetidos: '+
    check.related.slice(0,5).map(x=>'#'+x.numero+' '+x.name+
     (x.differentSkills?' (nativas diferentes)':'')+
     (x.differentBooster?' (ímpeto diferente)':'')).join(' · ')+
    '. Repetição não é prova de erro nem de acerto.');
  block.append(similar);
 }
 const detail=mk('details','ct251-evidence-details');
 detail.append(mk('summary','','O que esta carta confirma e o que ainda falta'));
 const ul=mk('ul','');
 for(const line of check.differences){
  ul.append(mk('li','',line));
 }
 detail.append(ul);block.append(detail);
 const comp=mk('section','ct251-preview');
 comp.append(mk('h4','','Simulação de PP por '+(check.tacticLabel||active)+' · não é treino homologado'));
 if(!check.proposal){
  comp.append(mk('p','ct251-warning',
   check.status==='no_level'?
   'Esta edição tem treino registrado, mas o nível máximo não está comprovado. Não vou gerar outra build até validar os PP no eFootball.':
   'Edição sem dados suficientes para gerar uma distribuição segura.'));
 }else{
  const grid=mk('div','ct251-grid');
  const weights=check.context?.priorities||[];
  for(let i=0;i<10;i++){
   const v=check.proposal.levels[i];
   if((check.role==='GO'?i<7:i>=7))continue;
   const item=mk('div','ct251-point');
   item.append(mk('span','',T.CATEGORIES[i]),
    mk('strong','',v+' níveis'),
    mk('small','',T.ppCost(v)+' PP'));
   if(weights.some(w=>w.index===i&&weights.indexOf(w)<3))item.classList.add('ct251-priority');
   grid.append(item);
  }
  comp.append(grid);
  // Nomes das categorias e sinais REAIS que alteram seus pesos nesta edição.
  const explanations=mk('details','ct253-reasons');
  explanations.append(mk('summary','','Por que o sistema distribuiu esses pontos?'));
  const reasons=mk('ul','ct253-reason-list');
  const priorities=(check.context?.priorities||[]).slice(0,3);
  if(priorities.length)reasons.append(mk('li','',
   'Prioridades para '+check.role+' em '+check.tacticLabel+': '+
    priorities.map(p=>p.name+' ('+p.stats+')').join('; ')+'.'));
  for(const reason of (check.context?.signals||[]).slice(0,10))
   reasons.append(mk('li','',reason));
  if(!reasons.children.length)
   reasons.append(mk('li','','Sem dados adicionais suficientes além da posição e da tática.'));
  explanations.append(reasons);comp.append(explanations);
  if(check.specificity?.matches?.length){
   const compare=check.specificity;
   const flag=mk('p','ct253-repetition','Treino matematicamente igual ao de '+
    compare.matches.length+' outra(s) carta(s) com função e PP semelhantes. '+
    compare.note);
   flag.dataset.status=compare.status;
   comp.append(flag);
   const other=mk('details','ct253-reasons');
   other.append(mk('summary','','Ver cartas com distribuição repetida e as diferenças documentadas'));
   const list=mk('ul','ct253-reason-list');
   for(const peer of compare.matches.slice(0,12))
    list.append(mk('li','',
     '#'+String(peer.numero).padStart(3,'0')+' '+peer.name+
     ' · Card ID '+peer.id+
     (peer.inputsDifferent.length?' · Diferenças: '+peer.inputsDifferent.join(', '):' · Sinais documentais semelhantes')));
   if(compare.matches.length>12)
    list.append(mk('li','','Mais '+(compare.matches.length-12)+' coincidências no acervo.'));
   other.append(list);comp.append(other);
  }
  comp.append(mk('p','ct251-pp',check.proposal.spent+' / '+check.pp+
   ' PP · Hipótese exata de custo, NÃO validada em partidas.'));
  if(check.changes?.length)
   comp.append(mk('p','ct251-changes',
    'Diferenças em relação ao treino registrado: '+check.changes.map(d=>d.name+
     ' '+(d.delta>0?'+':'')+d.delta).join(' · ')+'.'));
  const apply=mk('button','ct251-use','Usar apenas como rascunho nesta tática');
  apply.type='button';
  apply.addEventListener('click',()=>{
   if(!host.confirm?.('Carregar esta distribuição TEÓRICA como rascunho local de '+
     (check.tacticLabel||active)+'? Não altera a carta no eFootball.'))return;
   host.dispatchEvent(new host.CustomEvent('scoutpro:v251:apply-proposal',{detail:{
    cap:Number(card.numero),card_id:String(card.id),tactic:active,
    levels:check.proposal.levels.slice(),source:'Hipótese individual V251'
   }}));
  });
  comp.append(apply);
 }
 block.append(comp);
 const principles=mk('p','ct251-caution',
 'A decisão competitiva exige atributos-base exatos, vídeo da mesma edição, '+
 'biotipo/Player ID comprovados e testes comparáveis em partidas. '+ 
 'Habilidades adicionais e ímpetos são consultivos; slots/equipados não são presumidos.');
 block.append(principles);
}
async function begin(){
 if(doc.body?.dataset.page!=='detail')return;
 const rawScript=doc.getElementById('scout-v68-data'),labScript=doc.getElementById('lab-data');
 if(!rawScript||!labScript)return;
 try{raw=JSON.parse(rawScript.textContent);lab=JSON.parse(labScript.textContent)}catch(_){return}
 if(!Number.isInteger(Number(raw.capture)))return;
 try{
  const response=await host.fetch('../SCOUT_V69_AUDITORIA.json');
  if(!response.ok)throw Error('Catálogo indisponível.');
  all=(await response.json()).cards;
  if(!Array.isArray(all)||all.length!==246)return;
 }catch(_){return}
 try{
  const r=await host.fetch('../SCOUT_V221_EVIDENCE_INDEX.json');
  if(r.ok){
   const index=(await r.json()).cards;
   if(Array.isArray(index)&&index.length===246)
    evidenceByCap=new Map(index.map(x=>[Number(x.numero),x]));
  }
 }catch(_){evidenceByCap=new Map()}
 card=all.find(c=>Number(c.numero)===Number(raw.capture));
 const root=doc.getElementById('scout-v220-hero');
 if(!root||!card)return;
 const training=root.querySelector('#scout-v220-training');
 if(!training)return;
 // V253: manter uma ficha PRINCIPAL. Análise avançada passa a ocupar
 // uma área recolhível dentro da progressão, não uma segunda ficha concorrente.
 const review=mk('details','ct253-integrated-review');
 review.id='ct253-integrated-review';
 review.append(mk('summary','','03 · Auditoria por edição, PP e evidências'));
 block=mk('section','ct251-shell');block.id='ct251-individual-ficha';
 block.setAttribute('aria-label','Auditoria documental e simulação por edição');
 review.append(block);
 training.append(review);
 const initial=root.querySelector('.scout-v220-tab[aria-pressed="true"]');
 active=initial?.dataset.tactic||'posse';
 // Corrigir o catálogo informativo da interface APENAS para a edição exata.
 const canonical=sourceFor(card,raw);
 if(canonical){
  host.dispatchEvent(new host.CustomEvent('scoutpro:v251:canonical-data',{
   detail:canonical
  }));
 }
 display();
 doc.addEventListener('scoutpro:tactic-selected-v220',event=>{
  if(event.detail&&recognizedStyles.has(event.detail.tactic)){
   active=event.detail.tactic;display();
  }
 });
 host.addEventListener('scoutpro:v251:review-updated',display);
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',()=>{
 const observer=new host.MutationObserver(()=>{
  if(doc.getElementById('scout-v220-training')){observer.disconnect();begin()}
 });
 observer.observe(doc.body,{childList:true,subtree:true});
 if(doc.getElementById('scout-v220-training')){observer.disconnect();begin()}
},{once:true});
else if(doc.getElementById('scout-v220-training'))begin();
else if(host.MutationObserver){
 const obs=new host.MutationObserver(()=>{
  if(doc.getElementById('scout-v220-training')){obs.disconnect();begin()}
 });
 obs.observe(doc.body,{childList:true,subtree:true});
}
return api;
});
