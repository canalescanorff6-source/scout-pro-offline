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
// V283: o app-bridge carrega esses motores em outra cadeia assíncrona.
// Referências resolvidas UMA VEZ na inicialização ficavam nulas em parte das
// fichas. Consultar a API em tempo de uso e refrescar no evento de prontidão.
const fallbackS=moduleGet('./skills-booster-v162.js');
const fallbackB=moduleGet('./booster-engine-v103.js');
const S=new Proxy({}, {get(_target,key){
 return (host?.SCOUT_RECOMMENDATIONS_V162||fallbackS)?.[key];
}});
const B=new Proxy({}, {get(_target,key){
 return (host?.SCOUT_BOOSTERS_V103||fallbackB)?.[key];
}});
const C=host?.CRAQUE_COMPETITIVE_READINESS_V264||moduleGet('./craque-competitive-readiness-v264.js');
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
    numero:c.numero,name:c.name,id:String(c.id),edition:String(c.versao||''),
    differentSkills:nativeNames(c.habilidades_nativas).sort().join('|')!==
     nativeNames(card.habilidades_nativas).sort().join('|'),
    differentBooster:norm(c.impeto_fixo)!==norm(card.impeto_fixo),
    differentDefenceStyle:norm(c.estilo_defesa)!==norm(card.estilo_defesa),
    missingLevelEvidence:!confirmedLevel(c)||!confirmedLevel(card),
    baseEvidencePending:c.base_stats_known!==true||card.base_stats_known!==true,
    details:'Mesmo PP, posição, estilo ofensivo e distribuição. Comparação só documental; não significa mesma performance.'
   }));
}
function sourceFor(card,raw,lab,index){
 if(!exact(card,raw)||Number(card.pp)!==Number(raw.pp))return null;
 // V268: só disponibilizar números-base no ranking quando o mesmo
 // laboratório e o índice desta edição passaram pela prova V260.
 const base=baseEvidence(card,index,lab);
 const baseVerified=base.complete===true;
 // Catálogo confirmado por CAP + Card ID + edição. Não copiar para outras cartas.
 return {
  capture:Number(card.numero),id:String(card.id),name:card.name,edition:card.versao,
  shown_position:card.posicao,role_used:raw.role_used,
  attack_style:card.estilo_ataque,defence_style:card.estilo_defesa,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,
  native_skills:card.habilidades_nativas,
  base_stats:baseVerified?lab.stats:null,
  base_stats_proof:baseVerified?lab.stats_proof:null,
  base_catalog_proof:baseVerified?{
   base_stats_confirmados:true,print_edicao_confirmada:true}:null,
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
/* V260 — indicadores separados para dados numéricos PARCIAIS e
 * comprovação de uma base completa da versão exata.
 * O laboratório legado possui snapshots parciais de vários jogadores;
 * flag verdadeira no índice não equivale a screenshot confirmado.
 */
function baseEvidence(card,row,lab){
 const identity=Boolean(card&&lab&&String(lab.id)===String(card.id)&&
  norm(lab.name)===norm(card.name)&&Number(lab.pp)===Number(card.pp));
 const entries=identity&&lab.stats&&typeof lab.stats==='object'&&!Array.isArray(lab.stats)?
  Object.entries(lab.stats):[];
 const valid=entries.filter(([name,value])=>String(name).trim()&&value&&
  typeof value.base==='number'&&Number.isInteger(value.base)&&value.base>=0&&value.base<=120);
 const recorded=Boolean(identity&&row?.base_stats_confirmados===true&&valid.length>0);
 const p=lab?.stats_proof;
 // Salvaguarda estrutural: 1 ou 9 estatísticas jamais comprovam uma
 // base exaustiva. O patamar de 20 NÃO é uma regra do eFootball, é só um
 // limite inferior para rejeitar snapshots parciais; ainda exige fonte.
 const complete=Boolean(recorded&&valid.length>=20&&valid.length===entries.length&&
  row?.print_edicao_confirmada===true&&p?.schema==='CRAQUE_BASE_PROOF_V260'&&
  p.confirmed_in_game===true&&p.complete===true&&
  Number(p.attribute_count)===valid.length&&String(p.card_id)===String(card.id)&&
  norm(p.edition)===norm(card.versao)&&
  typeof p.source_ref==='string'&&p.source_ref.trim().length>=6);
 const note=complete?
  valid.length+' atributos-base numericamente identificados, com confirmação da edição e referência de origem. Ainda não comprova a build em partidas.':
  recorded?valid.length+' atributos-base numéricos cadastrados nesta edição, mas sem fonte completa validada. São dados PARCIAIS: não calcular atributos finais nem homologar o treino.':
  !identity&&lab?.stats&&Object.keys(lab.stats).length?
   'Laboratório não corresponde ao Card ID, nome ou PP desta edição. Valores ignorados.':
   'Não há um conjunto completo de atributos-base conferido para esta edição; flag isolada ou print candidato não bastam.';
 return Object.freeze({identity,recorded,complete,partial:recorded&&!complete,
  count:valid.length,note});
}
/* V252 — documentação individual, NÃO pontuação meta.
 * Prints candidatos e flags gerais não comprovam a edição exata. */
function proofChecklist(card,index,lab,store){
 const matched=!!(card&&index&&Number(index.numero)===Number(card.numero)&&
  String(index.card_id)===String(card.id)&&norm(index.nome)===norm(card.name)&&
  norm(index.edicao)===norm(card.versao));
 const row=matched?index:{};
 const native=String(card?.habilidades_nativas||'').split(';').filter(x=>x.trim()).length;
 const base=baseEvidence(card,row,lab);
 let installedSkills='',boostSlot=null,equipmentRecord=null;
 try{
  installedSkills=String(store?.getItem('scoutpro:v162:equipped:'+
   card.numero+':'+card.id)||'').trim();
  boostSlot=JSON.parse(store?.getItem('scoutpro:v103:booster:'+
   Number(card.numero))||'null');
 }catch(_){boostSlot=null}
 try{
  equipmentRecord=JSON.parse(store?.getItem(S?.confirmationKey?.(card.numero,card.id))||'null');
 }catch(_){equipmentRecord=null}
 // V259: digitar habilidades não comprova slots. Só a confirmação V254
 // vigente para CAP+Card ID e a impressão digital da lista é prova local.
 const identity={capture:Number(card.numero),id:String(card.id),edition:String(card.versao||''),
  shown_position:card.posicao,native_skills:card.habilidades_nativas};
 const checked=Boolean(S?.checkedEquipment?.(identity,installedSkills,equipmentRecord));
 const extra=checked?S.evaluate(identity,'posse',installedSkills,{equippedConfirmed:true}):null;
 const knownNames=installedSkills.split(/[;,\n]+/).map(x=>x.trim()).filter(Boolean)
  .every(x=>Boolean(S?.keyFor?.(x)));
 const additionalDocumented=checked&&Boolean(extra)&&knownNames&&
  !extra.manualOverLimit&&extra.nativeManualConflicts.length===0;
 const boosterEvidence=S?.boosterRecordEvidence?.(identity,boostSlot);
 const boosterReported=boosterEvidence?.valid===true;
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
  {id:'additional',name:'Lista completa de habilidades adicionais conferida na conta',
   documented:additionalDocumented,
   note:additionalDocumented?
    'Confirmação local V254 vinculada ao CAP, Card ID, edição, nativas e lista atual; não comprova gameplay.':
    'Lista digitada ou incompleta não confirma slots. Conferir todas as habilidades equipadas na V254, inclusive quando forem zero.'},
  {id:'booster',name:'Slot de ímpeto conferido pelo usuário',
   documented:Boolean(boosterReported),
   note:'Só o slot confirmado da edição permite avaliar ímpeto equipável.'},
  {id:'base',name:'Atributos-base completos da edição, com fonte',
   documented:base.complete,partial:base.partial,
   note:base.note},
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
  partial:checks.filter(x=>x.partial===true).length,baseEvidence:base,
  competitivelyVerified:checks.find(x=>x.id==='gameplay').documented&&
    checks.find(x=>x.id==='base').documented&&checks.find(x=>x.id==='budget').documented};
}
/* V261 — uma decisão consultiva unificada, com a metodologia de triagem
 * competitiva solicitada (Blackjhon/Rentão como CRITÉRIOS, jamais
 * autoria/aval de builds). Não escreve no catálogo ou no armazenamento.
 */
function methodologyGate(card,proof,style,store,review={}){
 if(!recognizedStyles.has(style))throw Error('Tática não reconhecida');
 const byId=Object.fromEntries((proof?.checks||[]).map(x=>[x.id,x]));
 const has=id=>byId[id]?.documented===true;
 const role=review?.positionUsed||card.posicao;
 const data={capture:Number(card.numero),id:String(card.id),
  // V271: custo de PP matematicamente coerente é sinal consultivo de
  // INVESTIMENTO, mesmo sem prova da origem do nível. A confirmação
  // documental ('budget') continua independente; proposta não validada
  // é bloqueada dentro de trainingAudit.
  edition:card.versao,shown_position:role,role_used:role,attack_style:card.estilo_ataque,
  defence_style:card.estilo_defesa,native_skills:card.habilidades_nativas,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,
  pp:hasValidBuild(card)&&card.pp_estimado!==true?Number(card.pp):null,
  recommended_levels:hasValidBuild(card)?card.niveis.slice():null,
  training_provisional:card.treino_proposto_nao_validado===true};
 let manual='',confirmation=null,slot=null;
 try{
  manual=String(store?.getItem('scoutpro:v162:equipped:'+card.numero+':'+card.id)||'');
  confirmation=JSON.parse(store?.getItem(S?.confirmationKey?.(card.numero,card.id))||'null');
 }catch(_){confirmation=null}
 try{
  const record=JSON.parse(store?.getItem('scoutpro:v103:booster:'+card.numero)||'null');
  if(S?.boosterRecordEvidence?.(data,record)?.valid===true)slot=record;
 }catch(_){slot=null}
 const confirmed=Boolean(S?.checkedEquipment?.(data,manual,confirmation)&&has('additional'));
 let skills=null,boost=null;
 try{skills=S?.evaluate?.(data,style,manual,{equippedConfirmed:confirmed})||null}catch(_){}
 try{boost=S?.booster?.(data,style,B,slot?.status,slot?.equipped)||null}catch(_){}
 const trained=hasValidBuild(card),budget=has('budget');
 const proven=trained&&budget&&has('base')&&has('video')&&has('gameplay');
 const training={
  status:proven?'evidencia_para_avaliacao_competitiva':trained?'treino_registrado_nao_homologado':'sem_treino_validado',
  note:proven?'Há referências declaradas para base, edição e partidas; revisão humana ainda obrigatória.':
   trained?'Build do catálogo preservada. PP fechados não comprovam atributos finais nem desempenho.':
   'Sem distribuição original comprovada; não substituir por hipótese matemática.'
 };
 // V262: cinco prioridades, cada qual com motivo da própria regra de
 // função+tática e eventual complementaridade nativa. Nunca inferir slot.
 const safeEdition=has('edition')&&!/\bpendente\b|\bconfirmar\b|\binvalidad[oa]\b/i.test(
  String(card.id||'')+' '+String(card.versao||''));
 const skillList=(safeEdition?skills?.recommendations||[]:[]).slice(0,5).map(x=>({
  name:x.name,reason:x.why||'Prioridade heurística de função e tática.',
  synergy:x.synergies||[]
 }));
 const skillStatus=confirmed?'lista_conferida_localmente':'slots_nao_conferidos';
 const boosterStatus=safeEdition&&boost?.able&&has('booster')?'slot_elegivel_para_comparacao':
  'nao_autorizado_para_equipar';
 const gapIds=['edition','budget','native','additional','booster','base','video','gameplay'];
 const missing=gapIds.filter(id=>!has(id)).map(id=>byId[id]?.name||id);
 return Object.freeze({
  capture:Number(card.numero),card_id:String(card.id),style,role,
  training,skills:{status:skillStatus,slots:confirmed?skills?.slotsRemaining:null,
   candidates:skillList,nativeKnown:skills?.nativeKnown===true,
   nativeEvidence:has('native')?'catalogo_documental':'habilidades_nativas_pendentes'},
  booster:{status:boosterStatus,slotState:slot?.status||'nao_conferido',
   slotEvidence:boost?.slotEvidence||'sem_slot_documentado',
   equipStatus:boost?.equipStatus||'slot_nao_verificado',
   name:safeEdition?(boost?.primary?.nome_pt||boost?.primary?.nome||null):null,
   reason:safeEdition?(boost?.primary?.motivo||'Sem critérios suficientes para comparar ímpetos.'):
    'Card ID ou edição pendente: não calcular escolha de ímpeto confirmada.',
   note:boost?.note||'Motor não disponível.',
   ppStatus:boost?.primary?.evidencias?.pp_status||'sem_ranking',
   budgetOriginConfirmed:has('budget'),
   scoreMargin:boost?.spread??null,
   comparison:boost?.alternatives?.map(x=>({
    name:x.nome_pt||x.nome,score:x.score,attributes:x.atributos.slice(),
    documentedTranslation:x.traducao_documentada===true
   }))||[],
   budgetNote:boost?.primary?.evidencias?.pp_status==='custo_pp_conferido'?
    (has('budget')?
     'Custo do PP conferido e origem documentada; comparação de investimento, não atributos finais.':
     'Custo de PP conferido matematicamente, mas ORIGEM NÃO DOCUMENTADA; sinal consultivo, nunca build homologada.'):
    'Treino sem PP matematicamente utilizável ou ainda provisório: NÃO influenciou o ranking.',
   attributes:safeEdition?(boost?.primary?.atributos||[]):[]},
  missing,competitivelyHomologated:false
 });
}
// V263: a seleção de função é somente consultiva e precisa de prova V246
// por CAP + Card ID. Nunca inferir familiaridade por Overall.
function confirmedRole(card,wanted,positionTraining,store){
 const original=positionTraining?.pos?.(card?.posicao)||String(card?.posicao||'');
 const proposed=positionTraining?.pos?.(wanted||original)||String(wanted||original);
 if(proposed===original)return {position:original,evidence:'original',eligible:true};
 const status=positionTraining?.status?.(card,proposed,store);
 if(status?.eligible===true&&['treinada','familiar'].includes(status.status))
  return {position:proposed,evidence:status.status,eligible:true};
 return {position:original,evidence:'original',eligible:false,
  rejected:proposed};
}
const api=Object.freeze({STATES,norm,roleOf,confirmedLevel,localLevelReview,hasValidBuild,baseEvidence,proofChecklist,methodologyGate,confirmedRole,signature,compareProposals,
  exact,sourceFor,related,allocate,buildReview,catalogAudit});
if(!host?.document)return api;
const doc=host.document;
const mk=(tag,cls,value)=>{
 const e=doc.createElement(tag);if(cls)e.className=cls;
 if(value!==undefined)e.textContent=String(value);
 return e;
};
let card=null,raw=null,lab=null,all=null,active='posse',block=null,positionSelected=null,evidenceByCap=new Map();
let lastRolePublished=null;
function display(){
 if(!card||!raw||!block)return;
 const posApi=host.SCOUT_POSITION_TRAINING_V246;
 const choice=confirmedRole(card,positionSelected||card.posicao,posApi,host.localStorage);
 if(!choice.eligible)positionSelected=null; // confirmação revogada: voltar à origem
 const check=buildReview(card,raw,lab,all,active,{
  targetPosition:choice.position,positionTraining:posApi,
  store:host.localStorage
 });
 // Publicar somente se a edição é íntegra. O evento não altera o catálogo;
 // evita circularidade com o V220, que também dispara eventos de tática.
 if(check.sourceCompatible===true&&check.status!=='unsupported'&&
    lastRolePublished!==choice.position){
  lastRolePublished=choice.position;
  const detail={capture:Number(card.numero),card_id:String(card.id),
   position:choice.position,evidence:choice.evidence};
  host.SCOUT_ROLE_SELECTION_V263=Object.freeze(detail);
  host.dispatchEvent(new host.CustomEvent('scoutpro:role-selected-v263',{detail}));
 }
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
  ' documentadas · '+proof.pending+' pendentes ('+proof.partial+
  ' parciais) · nenhuma homologação automática'));
 const criteriaList=mk('ul','ct251-proof-list');
 for(const item of proof.checks){
  const li=mk('li','',item.name+' — '+
   (item.documented?'DOCUMENTADO':item.partial?'PARCIAL':'PENDENTE')+'. '+item.note);
  li.dataset.proof=item.documented?'documented':item.partial?'partial':'pending';
  criteriaList.append(li);
 }
 criteria.append(criteriaList);block.append(criteria);
 // V261: parecer compacto dentro da ficha principal; mantém o painel de
 // habilidades existente sem duplicar slots ou oferecer botão de aplicação.
 const method=methodologyGate(card,proof,active,host.localStorage,check);
 // V264: status individual de cada uma das 246 edições, sem declarar
 // 246 builds homologadas por rodar testes de integridade.
 const readiness=C?.assess?.(card,proof,active,method)||null;
 if(readiness){
  const status=mk('section','ct264-status');
  status.dataset.readiness=readiness.classification;
  status.append(mk('strong','',readiness.label));
  // V279: leitura humana do status de PP sem esconder pendências.
  const trainingLabel={
   registrada_sem_homologacao:'Vetor e custo de PP conferidos; sem homologação',
   proposta_nao_homologada:'Treino proposto, ainda não validado no jogo',
   orcamento_pp_divergente:'PP divergentes: vetor não utilizado no ranking',
   ausente_ou_pendente:'Sem treino verificável para esta edição'
  }[readiness.training]||'Auditoria de treino pendente';
  status.append(mk('p','',
   'Treino: '+trainingLabel+' · Habilidades: '+readiness.additional+
   ' · Ímpeto: '+readiness.booster+'.'));
  const reasons=mk('details','ct251-evidence-details ct264-pendencies');
  reasons.append(mk('summary','',
   'Prioridades documentais desta edição · '+readiness.missing.length+' lacuna(s)'));
  const list=mk('ul','');
  for(const missing of readiness.missing)
   list.append(mk('li','',missing));
  if(!readiness.missing.length)list.append(mk('li','',
   'Verificar qualidade das fontes e o rendimento real em partidas antes de homologar.'));
  reasons.append(list);status.append(reasons);
  status.append(mk('small','',
   'Não aplicar builds, habilidades ou ímpetos automaticamente. Na v6.1.0,'+
   ' 100 Tokens de Habilidade Selecionada permitem escolher uma habilidade.'+
   ' Confirme saldo e compatibilidade dentro do jogo.'));
  block.append(status);
 }
 const audit=mk('details','ct251-evidence-details ct261-methodology');
 audit.append(mk('summary','','Parecer competitivo · treino, habilidades e ímpeto ('+
  (T.styleFor(active)?.label||active)+')'));
 const methodList=mk('ul','ct261-methodology-list');
 const add=(label,msg)=>methodList.append(mk('li','',label+' — '+msg));
 add('Treino',method.training.note);
 add('Habilidades adicionais',method.skills.status==='lista_conferida_localmente'?
  'Lista completa conferida neste dispositivo; '+method.skills.slots+
  ' vagas informadas. Sugestões táticas continuam consultivas.':
  'Lista completa não confirmada nesta edição. Nenhuma vaga é presumida.');
 if(method.skills.nativeEvidence!=='catalogo_documental')
  add('Prova das habilidades nativas',
   'Lista nativa incompleta ou sem correspondência documental: todas as prioridades são provisórias.');
 for(const [index,candidate] of method.skills.candidates.entries()){
  add('Habilidade adicional '+(index+1)+' · '+candidate.name,
   candidate.reason+
   (candidate.synergy.length?' Complementaridade com nativas: '+candidate.synergy.join('; ')+'.':'')+
   ' Prioridade consultiva; não há aplicação automática.');
 }
 add('Ímpeto',method.booster.name?
  method.booster.name+' — '+method.booster.note+' '+method.booster.reason+' '+method.booster.budgetNote+
   (method.booster.attributes.length?
    ' Quatro atributos afetados: '+method.booster.attributes.join(', ')+'.':''):
  'Nenhuma opção confiável calculável. '+method.booster.note);
 if(method.booster.comparison.length){
  const margin=method.booster.scoreMargin;
  add('Comparação de ímpetos',
   'Distância relativa ao segundo colocado: '+(margin===null?'indisponível':margin)+
   '. Alternativas: '+method.booster.comparison.map(x=>x.name+
    ' ('+x.score+' pontos; '+x.attributes.join(', ')+')').join(' / ')+
   '. Diferença de score não é ganho comprovado em jogo.');
 }
 if(method.missing.length)
  add('Evidências a completar',method.missing.join('; ')+'.');
 add('Critério de referência',
  'Triagem competitiva inspirada nos critérios de Blackjhon e Rentão; '+
  'NENHUMA recomendação atribuída ou aprovada por eles sem vídeo da edição exata.');
 audit.append(methodList);block.append(audit);
 // V283: análise de sensibilidade recolhível, sem segunda ficha e sem gravação.
 const exactSource=sourceFor(card,raw,lab,evidenceByCap.get(card.numero));
 // Caso a ficha HTML antiga diverja da fonte central, avaliar somente o
 // catálogo canônico, sem importação de PP/atributos daquela ficha.
 const sensitiveSource=exactSource||{
  capture:Number(card.numero),id:String(card.id),edition:String(card.versao||''),
  original_position:card.posicao,shown_position:card.posicao,
  role_used:card.posicao,attack_style:card.estilo_ataque,
  defence_style:card.estilo_defesa,native_skills:card.habilidades_nativas,
  boost1:card.impeto_fixo,boost2:card.impeto_extra,
  pp:card.pp_estimado===true?null:Number(card.pp),
  pp_estimado:card.pp_estimado===true,
  recommended_levels:hasValidBuild(card)?card.niveis.slice():null,
  training_provisional:card.treino_proposto_nao_validado===true
 };
 if(typeof S?.evidenceSensitivityV283==='function'){
  const sensitivity=S.evidenceSensitivityV283({
   ...sensitiveSource,original_position:card.posicao,
   role_used:check.positionUsed||card.posicao,shown_position:card.posicao
  },active,B);
  const section=mk('details','ct251-evidence-details ct283-sensitivity');
  section.append(mk('summary','','Sensibilidade de habilidades e ímpetos · comparar evidências'));
  section.append(mk('p','','Retiramos um sinal por vez para medir a estabilidade das recomendações. Nada é aplicado, validado ou equipado.'));
  if(!exactSource)section.append(mk('p','ct251-warning',
   'Fonte HTML da ficha não conciliada com o catálogo: os sinais abaixo vêm apenas dos registros canônicos da edição. A confirmação documental permanece pendente.'));
  const list=mk('ul','');
  const names=keys=>keys.map(k=>S.SKILLS[k]?.name||k).join(', ')||'nenhuma';
  for(const variant of sensitivity.comparisons){
   list.append(mk('li','',variant.label+' — '+(variant.skillsChanged?
    variant.changedSkillPositions+' posições de prioridade mudaram. ':
    'O top cinco permaneceu igual. ')+
    (variant.boosterChanged?'O primeiro ímpeto mudou. ':'O primeiro ímpeto permaneceu igual. ')+
    'Com evidências: '+names(variant.originalTopFive)+
    '. Sem o sinal: '+names(variant.scenarioTopFive)+'.'));
  }
  for(const warning of sensitivity.warnings)list.append(mk('li','',warning));
  section.append(list);block.append(section);
 }
 // V284: laboratório detalhado único, sempre recolhido por padrão.
 // Reusa apenas a edição canônica; não altera build, habilidades ou slots.
 if(sensitiveSource&&typeof S?.competitiveDecisionBoardV284==='function'){
  const selectedData={...sensitiveSource,original_position:card.posicao,
   role_used:check.positionUsed||card.posicao,shown_position:card.posicao};
  const board=S.competitiveDecisionBoardV284(selectedData,active,B,'',{
   roleConfirmed:check.positionUsed===card.posicao||check.roleApproved===true
  });
  const panel=mk('details','ct251-evidence-details ct284-decision-lab');
  panel.append(mk('summary','','Laboratório competitivo V284 · cinco habilidades, ímpetos e prova'));
  panel.append(mk('p','ct251-caution',
   'Análise por CAP '+board.identity.capture+' · Card ID '+board.identity.cardId+
   ' · '+board.identity.edition+'. Sugestões calculadas; nunca equipamentos aplicados.'));
  panel.append(mk('h4','','01 · Cinco habilidades adicionais por função e estilo'));
  const lskills=mk('ol','ct284-decision-skills');
  for(const skill of board.skills){
   const li=mk('li','');
   li.append(mk('strong','',skill.rank+' · '+skill.name+' · família '+skill.family));
   li.append(mk('p','',skill.explanation.join(' ')));
   if(skill.synergy.length)li.append(mk('small','','Nativas/sinergias registradas: '+skill.synergy.join('; ')+'.'));
   lskills.append(li);
  }
  if(!board.skills.length)lskills.append(mk('li','',
   'Sem candidatas seguras: slots ou posição precisam de conferência.'));
  panel.append(lskills);
  if(board.alternativeSkills.length){
   const alts=mk('details','ct251-evidence-details');
   alts.append(mk('summary','','Alternativas próximas · não são piores por definição'));
   const list=mk('ul','');
   for(const skill of board.alternativeSkills)
    list.append(mk('li','',skill.name+' · família '+skill.family+
     ' · diferença heurística do primeiro: '+(skill.gapFromFirst??'—')+
     '. Sem teste comparativo, não há desempenho superior comprovado.'));
   alts.append(list);panel.append(alts);
  }
  panel.append(mk('p','ct251-caution',
   'Portfólio equilibrado: '+board.portfolio.balanced.map(x=>x.name).join(', ')+
   '. Interseção com a lista principal: '+board.portfolio.sharedWithPrimary+
   '. Diferenças entre portfólios são opções de comparação, não correções obrigatórias.'));
  panel.append(mk('h4','','02 · Ímpetos · quatro atributos e alternativas reais'));
  const lbs=mk('ol','ct284-booster-rank');
  for(const booster of board.boosters){
   const li=mk('li','');
   li.append(mk('strong','',booster.rank+' · '+booster.name+
    ' · nota relativa '+booster.score));
   li.append(mk('p','','Quatro atributos: '+booster.axes.join(', ')+
    '. Coincidem com o ímpeto fixo em '+(booster.fixedKnown?
    booster.sharedWithFixed+' dos quatro atributos':'quantidade não comprovada')+
    '. '+booster.explanation));
   li.append(mk('small','','Critérios: função '+booster.factors.function+
    '; treino '+booster.factors.training+'; contexto '+booster.factors.context+
    '; base '+booster.factors.base+'. Não gastar tokens com base na nota.'));
   lbs.append(li);
  }
  if(!board.boosters.length)lbs.append(mk('li','','Sem opção documentada para esta função.'));
  panel.append(lbs);
  panel.append(mk('p','ct251-caution',
   'Segundo slot: '+board.boosterEligibility.catalogSlot+
   ' · conta: '+board.boosterEligibility.manualSlot+
   '. A comparação não comprova slot disponível.'));
  panel.append(mk('h4','','03 · Evidências e próximos passos para homologação'));
  const readiness=mk('ul','ct284-pending');
  for(const gap of board.pending)
   readiness.append(mk('li','',gap.action));
  panel.append(readiness);
  panel.append(mk('small','','Sem indicação de autoria, aprovação de criador, atributos finais ou gameplay comprovado.'));
  // V285: segunda opinião recolhível dentro da mesma ficha.
  if(typeof S?.competitiveQualityLabV285==='function'){
   const review=S.competitiveQualityLabV285(selectedData,active,B,'',{
    roleConfirmed:check.positionUsed===card.posicao||check.roleApproved===true
   });
   const lab285=mk('details','ct251-evidence-details ct285-quality-lab');
   lab285.append(mk('summary','','V285 · Segunda opinião competitiva · cinco estilos'));
   lab285.append(mk('p','ct285-subtitle',
    'Comparação de prioridades por edição; não muda a ficha principal nem homologa resultados.'));
   const stats=mk('div','ct285-stat-grid');
   for(const pair of [
    [review.summary.distinctSkillSets+'/5','Conjuntos de cinco habilidades'],
    [review.summary.sameFivePairs+'/10','Pares de táticas com ordem idêntica'],
    [review.summary.uniqueFirstBoosters,'Ímpetos líderes diferentes'],
    [review.summary.nativeMapped+'/'+review.summary.sourceNativeTotal,'Nativas interpretadas/cadastradas']]){
    const stat=mk('div','ct285-stat');
    stat.append(mk('strong','',String(pair[0])),mk('span','',pair[1]));stats.append(stat);
   }
   lab285.append(stats);
   if(review.summary.exactlySameFiveAllStyles)
    lab285.append(mk('p','ct251-warning',
     'Top cinco idêntico nos cinco estilos: isso exige comparação individual, mas não prova uma ficha ruim.'));
   lab285.append(mk('h4','','01 · Cinco habilidades explicadas para o campo'));
   const reasons=mk('ol','ct285-skill-reasons');
   for(const s of review.skillReasons){
    const li=mk('li','ct285-skill');
    li.append(mk('strong','',s.rank+' · '+s.name));
    li.append(mk('p','',s.explanation+' Função: '+s.fieldTask+' Apoio: '+s.fieldSupport));
    li.append(mk('small','','Risco: '+s.fieldRisk+
     ' · presente em '+s.usedInTactics.length+'/5 estilos'+
     (s.familyPresentNative?' · há nativa da mesma família':'')+
     (s.closeCompetitor?' · concorrente '+s.closeCompetitor.name+
       ', diferença relativa '+s.closeCompetitor.difference:'')+'.'));
    reasons.append(li);
   }
   if(!reasons.children.length)reasons.append(mk('li','','Sem candidatas verificáveis.'));
   lab285.append(reasons);
   lab285.append(mk('h4','','02 · Robustez ao retirar sinais da carta'));
   const experiments=mk('ul','ct285-experiments');
   for(const x of review.evidenceAblation)
    experiments.append(mk('li','',x.label+': '+
     (x.tested?x.changedSkills+' posições das cinco habilidades mudaram; '+
      (x.changedBooster?'ímpeto líder mudou.':'ímpeto líder não mudou.'):
      'sem sinal documentado para retirar.')+' '+x.reason));
   lab285.append(experiments);
   lab285.append(mk('h4','','03 · Matriz das cinco estratégias'));
   const tactics=mk('div','ct285-tactics');
   for(const item of review.tacticalMatrix){
    const entry=mk('div','ct285-tactic');entry.dataset.tactic=item.tactic;
    entry.append(mk('strong','',item.label+(item.tactic===active?' · ativa':'')));
    entry.append(mk('p','',item.skills.map(k=>S.SKILLS[k]?.name||k).join(' · ')||'Nenhuma'));
    entry.append(mk('small','',
     'Ímpeto: '+(B?.PTBR?.[item.booster]||item.booster||'indisponível')+
     ' · '+item.overlapsWithSelected+'/5 habilidades compartilhadas.'));
    tactics.append(entry);
   }
   lab285.append(tactics);
   lab285.append(mk('h4','','04 · Ímpetos: quatro atributos, fixo e elegibilidade'));
   const boosters=mk('ol','ct285-boosters');
   for(const b of review.boosterReasons)
    boosters.append(mk('li','',b.name+' · '+b.fourAxes.join(', ')+'. '+
     b.argument+(b.sharedWithFixed===null?
     ' Fixo ainda não identificado.':' Compartilha '+b.sharedWithFixed+
     ' dos quatro atributos com o fixo.')+
     (b.eligibilityForManualReview?' Slot registrado no catálogo e vazio na conta.':
      ' Slot não comprovado; não gastar tokens.')));
   if(!boosters.children.length)boosters.append(mk('li','','Sem candidato confirmado.'));
   lab285.append(boosters);
   lab285.append(mk('h4','','05 · Pendências para uma homologação competitiva'));
   const gaps=mk('ol','ct285-tasks');
   for(const item of review.evidenceTasks)gaps.append(mk('li','',item.what));
   lab285.append(gaps);
   lab285.append(mk('p','ct251-caution',
    'Parecer sem validação em jogo. Referências a Rentão e Blackjhon indicam rigor metodológico, '+
    'não autoria ou aprovação de qualquer build desta edição.'));
   panel.append(lab285);
   // V286: comparação do PACOTE, sem criar outra ficha nem equipar habilidade.
   if(typeof S?.strategicPortfolioV286==='function'){
    const improved=S.strategicPortfolioV286(selectedData,active,B);
    const opt=mk('details','ct251-evidence-details ct286-strategic');
    opt.append(mk('summary','','V286 · Cinco habilidades como conjunto · ímpetos e evidências'));
    const intro=mk('div','ct286-head');
    intro.append(mk('strong','',improved.adopted?
     'Proposta de conjunto complementar · sem substituir build aprovada':
     'Ordem original preservada · sem mudanças artificiais'));
    intro.append(mk('p','',improved.evaluatedCombos+' combinações avaliadas; diferença '+
     improved.improvement+' pontos relativos. Não representa ganho comprovado em jogo.'));
    opt.append(intro);
    if(!improved.identity.valid)
     opt.append(mk('p','ct251-warning',
      'CAP/Card ID/edição não conciliados: não usar como build confirmada.'));
    if(improved.insufficientCandidates)
     opt.append(mk('p','ct251-warning',
      'Só '+improved.maxCandidates+' habilidades candidatas distintas restaram após excluir nativas. '+
      'Não vamos inventar outra para completar cinco.'));
    const comparison=mk('div','ct286-comparison');
    const old=mk('section','ct286-side');
    old.append(mk('h5','','Antes · cinco candidatas por nota individual'));
    const oldList=mk('ol','');
    for(const key of improved.baseline)
     oldList.append(mk('li','',S.SKILLS[key]?.name||key));
    old.append(oldList);
    const now=mk('section','ct286-side ct286-chosen');
    now.append(mk('h5','','V286 · pacote completo por complementaridade'));
    const ranked=mk('ol','ct286-new-list');
    for(const item of improved.selected){
     const li=mk('li','');
     li.append(mk('strong','',item.name));
     li.append(mk('small','','Família '+item.family+
      (item.sameNativeFamily?' · nativa desta família já cadastrada':'')+
      ' · prioridade original #'+item.rankingBase+'. '+item.reason));
     ranked.append(li);
    }
    if(!ranked.children.length)ranked.append(mk('li','','Sem candidatas disponíveis.'));
    now.append(ranked);comparison.append(old,now);opt.append(comparison);
    opt.append(mk('p','ct286-explanation',improved.skillSelectionNote+
     ' Cobertura funcional: '+improved.utility.coverageRole+
     ' · tática: '+improved.utility.coverageTactic+
     ' · sinergias: '+improved.utility.bonus+
     ' · repetição: −'+improved.utility.repeat+
     ' · sobreposição familiar nativa: −'+improved.utility.nativeOverlap+'.'));
    const links=mk('ul','ct286-synergies');
    for(const item of improved.utility.synergies)
     links.append(mk('li','',item.reason));
    if(!links.children.length)
     links.append(mk('li','','Nenhuma sinergia adicional justificou alterar a ordem anterior.'));
    opt.append(mk('h5','','Combinações táticas encontradas'),links);
    const boosters=mk('div','ct286-boosters');
    const explain=item=>item?item.name+' · '+item.axes.join(', ')+
     (item.sharedFixed===null?' · ímpeto fixo sem eixos comprovados.':
      ' · '+item.sharedFixed+'/4 atributos compartilhados com o fixo.')+
     ' Comparação apenas; sem gastar tokens.':'Sem ímpeto classificável.';
    boosters.append(mk('h5','','Ímpetos · melhor prioridade e alternativa contextual'),
     mk('p','','Primeiro: '+explain(improved.boosters.primary)),
     mk('p','','Alternativa: '+(improved.boosters.complementaryAlternative?
      explain(improved.boosters.complementaryAlternative):
      'Não há alternativa próxima com complementaridade diferente comprovável.')));
    opt.append(boosters);
    const pending=mk('ol','ct286-pending');
    for(const gap of improved.priorityQueue){
     const item=mk('li','',gap.what);item.dataset.severity=gap.level;pending.append(item);
    }
    opt.append(mk('h5','','Pendências por ordem de prova'),pending);
    opt.append(mk('p','ct251-caution',
     'Análise consultiva baseada nos dados desta edição. Não altera builds, PP, slots ou equipamentos '+
     'e não atribui aprovação a criadores sem fonte da edição exata.'));
    panel.append(opt);
    // V287: conselho documental integra índice + cadastro + V286 sem inventar prints.
    if(typeof S?.professionalEvidenceCouncilV287==='function'){
     let equipmentRecord=null,manual='',boostSlot=null;
     try{
      manual=String(host.localStorage?.getItem('scoutpro:v162:equipped:'+
       Number(card.numero)+':'+String(card.id))||'');
      equipmentRecord=JSON.parse(host.localStorage?.getItem(
       S.confirmationKey(Number(card.numero),String(card.id)))||'null');
      boostSlot=JSON.parse(host.localStorage?.getItem('scoutpro:v103:booster:'+
       Number(card.numero))||'null');
     }catch(_){}
     const editionIdentity={capture:Number(card.numero),id:String(card.id),
      edition:String(card.versao)};
     const additionalEvidence=S.checkedEquipment(editionIdentity,manual,equipmentRecord);
     const boosterEvidence=S.boosterRecordEvidence(editionIdentity,boostSlot);
     const audited=S.professionalEvidenceCouncilV287(selectedData,active,B,
      evidenceByCap.get(Number(card.numero)),{
       manualEquipped:manual,equippedConfirmed:additionalEvidence,
       equipmentRecord,
       verifiedSlot:boosterEvidence.valid?boosterEvidence.status:null,
       verifiedBooster:boosterEvidence.valid?boosterEvidence.equipped:null
      });
     const audit287=mk('details','ct251-evidence-details ct287-evidence-council');
     audit287.dataset.confidence=audited.confidence;
     audit287.append(mk('summary','','V287 · Conselho de evidências · cinco habilidades e ímpetos'));
     audit287.append(mk('p','ct287-status','Situação: '+audited.confidence.replaceAll('_',' ')+
      ' · '+audited.pendingCount+'/'+audited.checks.length+
      ' verificações ainda exigem fontes. Sem homologação automática.'));
     const dashboard=mk('div','ct287-metrics');
     for(const [stat,label] of [
      [audited.skillCouncil.length,'Habilidades candidatas'],
      [audited.boosters.length,'Ímpetos para comparar'],
      [audited.changeLog.length,'Mudanças no pacote V286'],
      [audited.pendingCount,'Evidências pendentes']]){
      const cell=mk('div','ct287-metric');
      cell.append(mk('strong','',String(stat)),mk('small','',label));
      dashboard.append(cell);
     }
     audit287.append(dashboard);
     audit287.append(mk('h5','','Prioridades documentais por carta'));
     const urgent=mk('ol','ct287-priority');
     for(const gap of audited.pending){
      const item=mk('li','');
      item.dataset.severity=gap.phase;
      item.append(mk('strong','',gap.title),mk('p','',gap.action));
      urgent.append(item);
     }
     if(!audited.pendingCount)urgent.append(mk('li','',
      'Fontes catalogadas alinhadas; ainda conferir vídeo e partidas da edição.'));
     audit287.append(urgent);
     audit287.append(mk('h5','','Decisão das habilidades e sua estabilidade'));
     const skills=mk('ol','ct287-skill-council');
     for(const skill of audited.skillCouncil){
      const item=mk('li','');
      item.append(mk('strong','',skill.order+' · '+skill.name+
       ' · '+skill.family));
      item.append(mk('p','',skill.reason+
       ' Presente em '+skill.usedByStyles.length+'/5 estilos. '+
       (skill.agreementWithIndividual?
       'Também está entre as prioridades do ranking individual.':
       'O pacote completo a prioriza por cobertura ou complementaridade.')));
      if(skill.reasonsForReview.length)
       item.append(mk('small','','Conferir: '+skill.reasonsForReview.join('; ')+'.'));
      skills.append(item);
     }
     if(!audited.skillCouncil.length)
      skills.append(mk('li','','Nenhuma skill nova autorizada por dados suficientes.'));
     audit287.append(skills);
     audit287.append(mk('h5','','Ímpetos · eixos por função, fixo e sensibilidade'));
     const boostList=mk('ol','ct287-booster-council');
     for(const item of audited.boosters){
      const row=mk('li','');
      row.append(mk('strong','',item.rank+' · '+item.name));
      row.append(mk('p','','Quatro atributos: '+item.fourAttributes.map(
       k=>B.BASE_STAT_LABELS?.[k]||k).join(', ')+
       '. Peso relativo da função: '+item.roleWeightSum+
       (item.fixedKnown?' · '+item.fixedOverlap+'/4 eixos coincidem com o fixo.':
        ' · ímpeto fixo não identificado com quatro eixos.')));
      boostList.append(row);
     }
     if(!audited.boosters.length)boostList.append(mk('li','','Nenhum ímpeto classificável.'));
     audit287.append(boostList);
     const sensitive=audited.boosterSensitivity.filter(x=>x.available&&x.firstChoiceChanges);
     audit287.append(mk('p','ct287-interpretation',sensitive.length?
      'ATENÇÃO: o primeiro ímpeto muda quando são retirados os sinais de '+
       sensitive.map(x=>x.factor).join(', ')+'. Não comprar com base numa única nota.':
      'Nenhuma variação de ímpeto comprovada pelos sinais que puderam ser testados; '+
      'estabilidade heurística não equivale a vantagem real.'));
     audit287.append(mk('p','ct251-caution',
      'Card ID '+audited.identity.cardId+' · edição '+audited.identity.edition+
      '. Sem OVR, sem aplicação de habilidades/ímpetos, sem autoria atribuída a criadores '+
      'e sem assumir que print candidato é prova de gameplay.'));
     panel.append(audit287);
    }

   }

  }
  block.append(panel);
 }
 if(check.related.length){
  // V258: ampliar a conferência sem criar uma segunda ficha, nem copiar
  // treino entre edições com mesmo orçamento ou função.
  const divergent=check.related.filter(x=>x.differentSkills||
   x.differentBooster||x.differentDefenceStyle);
  const similar=mk('p','ct251-duplicates',
   'Atenção: treino registrado idêntico em '+check.related.length+
   ' outra(s) edição(ões). '+divergent.length+
   ' têm diferenças documentais de habilidades, ímpeto ou função defensiva. '+
   'Isso exige comparação individual, não substituição automática.');
  block.append(similar);
  const peers=mk('details','ct251-evidence-details ct258-duplicate-details');
  peers.append(mk('summary','','Conferir TODAS as '+check.related.length+
   ' edições com treino igual · Card IDs e diferenças'));
  const list=mk('ul','ct258-duplicate-list');
  for(const peer of check.related){
   const differences=[];
   if(peer.differentSkills)differences.push('habilidades nativas diferentes');
   if(peer.differentBooster)differences.push('ímpeto fixo diferente');
   if(peer.differentDefenceStyle)differences.push('função defensiva diferente');
   if(peer.missingLevelEvidence)differences.push('nível/PP sem documentação completa');
   if(peer.baseEvidencePending)differences.push('atributos-base ainda pendentes');
   if(!differences.length)differences.push('revisar atributos-base e comportamento em campo');
   list.append(mk('li','',
    '#'+String(peer.numero).padStart(3,'0')+' · '+peer.name+
    ' · Card ID '+peer.id+' · '+(peer.edition||'edição pendente')+
    ' — '+differences.join('; ')+'.'));
  }
  peers.append(list);block.append(peers);
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
 const canonical=sourceFor(card,raw,lab,evidenceByCap.get(card.numero));
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
 // Se a ficha inicializou antes de V162/V103, recalcular sem reload.
 doc.addEventListener('scoutpro:recommendations-ready',display);
 host.addEventListener('craque:data-changed',event=>{
  if(event.detail?.key===host.SCOUT_POSITION_TRAINING_V246?.KEY)display();
 });
 // V259: a confirmação V254 chega sem recarregar a ficha. Atualizar somente
 // a mesma edição, sem gravar nada e sem interferir na outra carta da pessoa.
 doc.addEventListener('scoutpro:skills-updated',event=>{
  const change=event.detail||{};
  if(Number(change.capture)===Number(card.numero)&&
   String(change.card_id)===String(card.id))display();
 });
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
