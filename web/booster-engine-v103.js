/* Scout PRO V104: use the 28 selectable boosters supported since Konami v5.2.0; slot eligibility remains edition-specific. */
(function(host){
'use strict';
const BOOSTERS={
 'Agility':['speed','accel','balance','stamina'],
 'Technique':['control','dribble','tight','pass'],
 'Passing':['pass','loft','curl','power'],
 'Ball Protection':['control','tight','physical','balance'],
 'Ball-carrying':['dribble','tight','speed','balance'],
 "Striker's Instinct":['awareness','control','finish','accel'],
 'Off the Ball':['awareness','speed','accel','stamina'],
 'Offence Creator':['awareness','control','pass','power'],
 'Shooting':['control','finish','power','physical'],
 'Aerial':['finish','heading','jump','physical'],
 'Physicality':['jump','physical','balance','stamina'],
 'Accuracy':['pass','loft','finish','power'],
 'Regista':['tight','pass','defaware','tackle'],
 'Rebuilding':['pass','defaware','defengage','aggression'],
 'Shutdown':['speed','defaware','tackle','defengage'],
 'Defending':['accel','jump','defaware','tackle'],
 'Duelling':['speed','stamina','defaware','tackle'],
 'Stealing':['accel','physical','tackle','aggression'],
 'Saving':['gkaware','gkparry','gkreflex','gkreach'],
 'Goalkeeping':['gkaware','gkcatch','gkparry','gkreflex'],
 'Balancer':['awareness','accel','stamina','defaware'],
 'Breakthrough':['dribble','speed','power','physical'],
 'Strength':['speed','power','jump','physical'],
 'Fantasista':['control','dribble','finish','balance'],
 'Hard Worker':['accel','physical','stamina','aggression'],
 'Counter':['pass','physical','tackle','defengage'],
 'Crossing':['loft','curl','speed','stamina'],
 'Free-kick Taking':['finish','placekick','curl','power']
};
// Konami v5.2.0: Select Booster Tokens can craft all 28 types, including Accuracy and Strength.
// Natural booster values remain immutable; availability of the second slot is checked per card.
const CRAFTABLE=Object.freeze(Object.keys(BOOSTERS));
const ROLE={CA:{awareness:6,finish:7,accel:5,control:4,power:3,physical:2,speed:3,pass:2,balance:2,heading:1,jump:1,stamina:1},
SA:{awareness:5,finish:4,accel:5,control:5,pass:5,dribble:4,tight:4,balance:4,speed:2,physical:2,stamina:2},
MAT:{control:6,tight:5,dribble:5,pass:7,awareness:4,accel:4,balance:5,finish:3,stamina:2,power:2},
MLG:{control:5,tight:5,dribble:3,pass:7,defaware:4,tackle:2,stamina:4,balance:4,accel:3,physical:2},
VOL:{pass:6,tight:3,defaware:7,tackle:6,defengage:6,physical:4,stamina:4,accel:3,speed:3,balance:2},
ZG:{defaware:7,tackle:7,defengage:7,speed:4,accel:5,physical:5,jump:4,heading:3,pass:2,stamina:2},
LD:{speed:5,accel:5,stamina:5,defaware:7,tackle:6,defengage:5,pass:4,physical:3,tight:2,balance:2},
LE:{speed:5,accel:5,stamina:5,defaware:7,tackle:6,defengage:5,pass:4,physical:3,tight:2,balance:2},
ALA:{speed:5,accel:6,dribble:6,tight:5,balance:5,control:5,pass:4,finish:3,stamina:3},
GO:{gkaware:9,gkreflex:9,gkreach:9,gkparry:8,gkcatch:6}};
const POS={AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DD:'LD',LD:'LD',DE:'LE',LE:'LE',DC:'ZG',ZC:'ZG',GR:'GO',GO:'GO',ZG:'ZG',PTD:'ALA',PTE:'ALA',MLD:'ALA',MLE:'ALA',MLE:'ALA'};
const label={awareness:'consciência ofensiva',finish:'finalização',accel:'aceleração',control:'controle de bola',power:'força do chute',physical:'contato físico',speed:'velocidade',pass:'passe rasteiro',loft:'passe alto',tight:'posse apertada',dribble:'drible',balance:'equilíbrio',heading:'cabeceio',jump:'salto',stamina:'resistência',curl:'efeito',placekick:'bola parada',defaware:'consciência defensiva',tackle:'desarme',defengage:'dedicação defensiva',aggression:'agressividade',gkaware:'consciência de goleiro',gkparry:'desvio de goleiro',gkreflex:'reflexos de goleiro',gkreach:'alcance de goleiro',gkcatch:'firmeza de goleiro'};
const tactics=['posse','normal','rapido','fora','longo'];
const TACTIC_LABEL=Object.freeze({
 posse:'Posse de Bola',normal:'Contra-Ataque Normal',
 rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Passe Longo'
});
// Traduções do próprio vocabulário PT-BR já cadastrado no projeto.
// Caso não exista grafia documental, manter o nome TÉCNICO em vez de
// inventar um nome oficial da Konami.
const PTBR=Object.freeze({
 'Agility':'Agilidade','Technique':'Técnica','Passing':'Passe',
 'Ball Protection':'Proteção de Posse','Ball-carrying':'Condução de Bola',
 "Striker's Instinct":'Instinto Artilheiro','Off the Ball':'Fora da Bola',
 'Offence Creator':'Criador Ofensivo','Shooting':'Finalização',
 'Aerial':'Disputa Aérea','Physicality':'Fisicalidade','Accuracy':'Precisão',
 'Regista':'Regista','Rebuilding':'Reconstrução',
 'Defending':'Defesa','Duelling':'Duelo','Stealing':'Roubo de Bola',
 'Goalkeeping':'Goleiro','Balancer':'Equilíbrio',
 'Breakthrough':'Rompe Barreira','Strength':'Força','Crossing':'Cruzamento'
});
const displayName=name=>PTBR[name]||name;
const translationKnown=name=>Object.hasOwn(PTBR,name);
function slotStatus(extra){
 const s=String(extra||'');
 if(/^SLOT SELECIONÁVEL/i.test(s))return 'selecionavel';
 if(/selecion[aá]vel/i.test(s))return 'possivel';
 if(/^(PENDENTE|NENHUM|NÃO|—)/i.test(s))return 'indefinido';
 return 'nome_registrado';
}
function normStyle(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
/* V200: complementaridade da build para Posse, sem inventar atributos finais.
 * Os níveis são INVESTIMENTO por categoria (não valores reais de velocidade/chute).
 * A recomendação nunca equipa boosters nem aprova gasto de Tokens automaticamente. */
const TRAINING_GROUP={
 awareness:3,finish:0,accel:3,control:2,power:4,physical:5,speed:4,
 pass:1,loft:1,tight:2,dribble:2,balance:3,heading:5,jump:5,stamina:4,
 curl:0,placekick:0,defaware:6,tackle:6,defengage:6,aggression:6
};
const ROLE_TRAINING={
 CA:[0,1,2,3,4,5],SA:[0,1,2,3,4,5],MAT:[0,1,2,3,4],
 MLG:[1,2,3,4,6],VOL:[1,2,3,4,5,6],ZG:[1,3,4,5,6],
 LD:[1,2,3,4,5,6],LE:[1,2,3,4,5,6],ALA:[0,1,2,3,4],GO:[7,8,9]
};
const CANONICAL={
 'fisicalidade':'Physicality','instinto artilheiro':"Striker's Instinct",
 'fora da bola':'Off the Ball','sem bola':'Off the Ball','conducao de bola':'Ball-carrying',
 'agilidade':'Agility','tecnica':'Technique','passe':'Passing',
 'proteção de posse':'Ball Protection','protecao de posse':'Ball Protection',
 'chute':'Shooting','finalizacao':'Shooting','criador ofensivo':'Offence Creator',
 'disputa aerea':'Aerial','precisao':'Accuracy','defesa':'Defending',
 'duelo':'Duelling','roubo de bola':'Stealing','reconstrucao':'Rebuilding',
 'goleiro':'Goalkeeping','forca':'Strength','cruzamento':'Crossing',
 'rompe barreira':'Breakthrough','equilibrio':'Balancer'
};
const plain=s=>normStyle(s).replace(/[^a-z0-9]+/g,' ').trim();
function boosterName(value){
 const cleaned=String(value??'').replace(/\s*\+\s*\d+(?:\s.*)?$/,'').trim();
 const matched=Object.keys(BOOSTERS).find(k=>plain(k)===plain(cleaned));
 return matched||CANONICAL[plain(cleaned)]||null;
}
// V267 — um vetor que não fecha com o orçamento da MESMA edição não pode
// alterar as prioridades de ímpetos. Ausência de PP/nível não é zero PP.
const progressCost=levels=>levels.reduce((sum,n)=>{
 for(let i=0;i<n;i++)sum+=1+Math.floor(i/4);
 return sum;
},0);
function trainingAudit(card){
 const values=card.niveis??card.recommended_levels??card.treino_anterior;
 const pp=card.pp;
 if(!Array.isArray(values))return Object.freeze({status:'vetor_ausente',levels:null,pp:null,spent:null});
 if(values.length!==10||!values.every(n=>Number.isInteger(n)&&n>=0&&n<=20))
  return Object.freeze({status:'vetor_invalido',levels:null,pp:null,spent:null});
 const spent=progressCost(values);
 if(!Number.isInteger(pp)||pp<0||pp>238)
  return Object.freeze({status:'pp_nao_documentados',levels:null,pp:null,spent});
 if(spent!==pp)
  return Object.freeze({status:'pp_divergentes',levels:null,pp,spent});
 if(card.training_provisional===true||card.treino_proposto_nao_validado===true)
  return Object.freeze({status:'treino_proposto_nao_validado',levels:null,pp,spent});
 return Object.freeze({status:'custo_pp_conferido',levels:values.slice(),pp,spent});
}
// Compatibilidade da API pública usada por revisões anteriores.
const levelsOf=card=>trainingAudit(card).levels;
/* V268 — números parciais ou flags sem prova NÃO podem interferir no
 * ranking. Mesma edição, Card ID, fonte, >=20 bases e índice validado.
 * A comparação relativa não calcula atributos FINAIS nem prova gameplay. */
const baseStatNames=Object.freeze(Object.fromEntries(
 Object.entries(label).map(([stat,name])=>[plain(name),stat])));
function baseStatsAudit(card){
 const source=card?.base_stats;
 const entries=source&&typeof source==='object'&&!Array.isArray(source)?
  Object.entries(source):[];
 const initial=Object.freeze({status:entries.length?'base_parcial_sem_prova':'base_nao_documentada',
  values:null,count:entries.length,recognized:0,source:null});
 if(!entries.length)return initial;
 const proof=card.base_stats_proof||null;
 const index=card.base_catalog_proof||null;
 const edition=String(card.versao||card.edition||'');
 const id=String(card.id||card.card_id||'');
 // V268: aliases conflitantes são bloqueio de identidade, não escolha
 // silenciosa de um único campo (outro Pack / mesmo jogador).
 if((card.versao&&card.edition&&
    plain(card.versao)!==plain(card.edition))||
   (card.id&&card.card_id&&String(card.id)!==String(card.card_id)))
  return Object.freeze({...initial,status:'identidade_da_base_divergente'});
 const numeric=entries.every(([name,value])=>name.trim()&&value&&
  Number.isInteger(value.base)&&value.base>=0&&value.base<=120);
 const identified=Boolean(id&&edition&&proof?.schema==='CRAQUE_BASE_PROOF_V260'&&
  proof.confirmed_in_game===true&&proof.complete===true&&
  String(proof.card_id)===id&&String(proof.edition)===edition&&
  Number(proof.attribute_count)===entries.length&&
  String(proof.source_ref||'').trim().length>=6&&
  index?.base_stats_confirmados===true&&
  index?.print_edicao_confirmada===true);
 if(!identified||!numeric||entries.length<20)
  return Object.freeze({...initial,status:'base_parcial_sem_prova'});
 const values={};
 for(const [name,record] of entries){
  const stat=baseStatNames[plain(name)];
  if(stat)values[stat]=record.base;
 }
 if(Object.keys(values).length<16)
  return Object.freeze({...initial,status:'base_mapeamento_incompleto',
   recognized:Object.keys(values).length});
 return Object.freeze({status:'base_completa_confirmada',
  values:Object.freeze(values),count:entries.length,
  recognized:Object.keys(values).length,source:String(proof.source_ref).trim()});
}
function addStat(w,key,value){w[key]=(w[key]||0)+value;}
function addStats(w,keys,value){for(const k of keys)addStat(w,k,value);}
function playingStyle(w,role,style){
 const rule=(pattern,mods)=>{if(pattern.test(style))for(const [k,n] of Object.entries(mods))addStat(w,k,n)};
 rule(/pivo|homem de area|target|avancado pivo/,{physical:6,heading:3,jump:3,control:5,pass:5,tight:3,balance:3});
 rule(/infiltra|puxa marcacao|arrastar defesa/,{awareness:2,accel:2,control:4,pass:5,tight:4,balance:3});
 rule(/matador|oportunista|artilheiro/,{awareness:3,finish:3,accel:1,power:1});
 rule(/orquestrador|criador de espacos|armador|classico.{0,5}10/,{control:5,tight:5,pass:7,balance:3});
 rule(/versatil|todo o terreno/,{stamina:3,pass:3,defaware:2,control:2});
 // V272: variantes documentadas da mesma edição, com dupla função.
 if(role==='VOL'&&/primeiro volante|trinco|orquestrador/.test(style))
  addStats(w,['pass','defaware','defengage'],3);
 if(role==='MLG'&&/meia versatil|todo o terreno/.test(style))
  addStats(w,['stamina','defaware','pass'],2);
 if(role==='SA'&&/arrastar defesa|puxa marcacao|jogador de infiltracao/.test(style))
  addStats(w,['control','pass','awareness'],3);
 if(role==='ALA'&&/ala produtivo|lateral movel|armador criativo/.test(style))
  addStats(w,['tight','pass','dribble'],3);
 rule(/destruidor|lateral defensivo|primeiro volante|trinco/,{defaware:3,tackle:3,defengage:2,physical:1});
 rule(/ala produtivo|ala rapido|driblador|ala movel/,{dribble:3,tight:3,speed:2,accel:3});
 // V270: interpretar estilos exatos já presentes no catálogo, não OVR.
 // Um construtor defensivo precisa preservar saída curta e cobertura;
 // um lateral ofensivo exige apoio e circulação sem presumir aptidão de ponta.
 if(role==='ZG'&&/construcao de jogo|defensor criativo|defensor participativo/.test(style)){
  addStat(w,'pass',6);addStat(w,'control',2);addStat(w,'tight',1);addStat(w,'defaware',2);
 }
 if(role==='ZG'&&/destruidor/.test(style)){
  addStats(w,['tackle','defengage'],2);
 }
 if((role==='LD'||role==='LE')&&/lateral ofensivo|lateral atacante|lateral movel/.test(style)){
  addStat(w,'pass',4);addStat(w,'tight',2);addStat(w,'stamina',2);addStat(w,'speed',1);
 }
 if(role==='CA'&&/pivo/.test(style)){addStat(w,'awareness',-1);addStat(w,'finish',-1)}
}
function nativeSkillContext(w,raw,role){
 const skills=normStyle(raw).toLowerCase();
 const has=s=>s.test(skills);
 const findings=[];
 // V274: leitura conservadora dos nomes NATIVOS ESPECIAIS cadastrados.
 // São sinais de função para desempate, NÃO habilidade adicional
 // selecionável, tradução oficial ou atributo final demonstrado.
 if(has(/phenomenal pass|visionary pass|no look pass|game.changing pass|passe fenomenal|passe sem olhar/)){
  addStat(w,'pass',3);addStat(w,'control',1);
  findings.push('distribuição especial cadastrada (efeito exato não validado)');
 }
 if(has(/outside curler|curva para fora/)){
  addStat(w,'curl',2);addStat(w,'pass',1);
  findings.push('curva externa registrada (uso específico a conferir)');
 }
 if(has(/marseille turn|scissors feint|chop turn|flip flap|sombrero|scotch move|pedalada|momentum dribbling|magnetic feet/)){
  addStat(w,'tight',2);addStat(w,'dribble',2);
  findings.push('recurso de condução especial registrado');
 }
 if((role==='ZG'||role==='VOL'||role==='LD'||role==='LE')&&
    has(/aerial fort|fortress|long.reach tackle/)){
  addStat(w,'defaware',2);addStat(w,'tackle',1);
  findings.push('recurso defensivo especial registrado');
 }
 if(role==='GO'&&has(/gk directing defen[cs]e|gk spirit roar/)){
  addStat(w,'gkaware',2);
  findings.push('habilidade especial de goleiro registrada');
 }
 // Complementaridade baseada só em skills documentadas, sem estatística
 // final presumida. Ambas as grafias PT-BR / EN indicam o mesmo sinal.
 if(has(/interception|interceptacao|blocker|bloqueador|man marking|marcacao individual/)){
  addStats(w,['defaware','tackle','defengage'],2);
  findings.push('interceptação, bloqueio e marcação cadastrados');
 }
 if(has(/weighted pass|passe ponderado|passe na medida|low lofted pass|passe meio levantado/)){
  addStats(w,['pass','loft'],2);
  findings.push('distribuição em apoio e saída de bola');
 }
 if(has(/fighting spirit|espirito guerreiro|track back|volta para marcar/)){
  addStats(w,['stamina','physical'],2);
  findings.push('recomposição e esforço documentados');
 }
 if(has(/one.touch pass|one touch pass|passe de primeira|through passing|passe em profundidade/)){
  addStats(w,['pass','control'],2);addStat(w,'tight',1);
  findings.push('tabelas e passes de apoio');
 }
 if(has(/double touch|sole control|toque duplo|controle com a sola/)){
  addStats(w,['tight','control','dribble'],2);
  findings.push('domínio e giro curto');
 }
 if(has(/long.range shooting|long.range curler|first.time shot|phenomenal finishing|low screamer|precisao a distancia|efeito de longe|chute de primeira|finalizacao de primeira|chute de longa distancia|finalizacao de longa distancia/)){
  addStat(w,'power',2);addStat(w,'finish',1);
  findings.push('finalização já prevista nas habilidades');
 }
 if((role==='CA'||role==='ZG')&&has(/heading|bullet header|aerial superiority|cabeceio|cabecada/)){
  addStat(w,'heading',1);addStat(w,'jump',1);
  findings.push('jogo aéreo');
 }
 return findings;
}
function rank(card,tactic){
 if(!tactics.includes(tactic))throw Error('Tática desconhecida');
 // V265: a função CONFIRMADA pelo V246/V263 (role_used/shown_position)
 // prevalece sobre a posição ORIGINAL no catálogo. Ranking não confirma
 // por si só uma doutrinação: essa prova ocorre na interface da carta.
 const requestedRole=card.role_used||card.shown_position||card.posicao;
 const role=POS[String(requestedRole||'').toUpperCase()];
 if(!role)throw Error('Posição não mapeada: '+requestedRole);
 const weights={...ROLE[role]};
 const style=normStyle([card.estilo_ataque||card.attack_style||'',card.estilo_defesa||card.defence_style||''].join(' '));
 playingStyle(weights,role,style);
 if(tactic==='posse'){
  addStats(weights,['pass','tight','control','balance'],3);
  addStats(weights,['awareness','defaware'],1);
 }else if(tactic==='normal'){
  addStats(weights,['physical','defaware','balance','stamina'],2);
 }else if(tactic==='rapido'){
  addStats(weights,['speed','accel','awareness','stamina'],2);
 }else if(tactic==='fora'){
  addStats(weights,['pass','loft','curl','dribble','stamina'],3);
  addStats(weights,['speed','tight','balance'],1);
 }else if(tactic==='longo'){
  addStats(weights,['loft','heading','jump','physical','stamina'],3);
  addStats(weights,['defaware','awareness','power'],1);
 }
 const nativeFindings=nativeSkillContext(weights,card.habilidades_nativas||card.native_skills||'',role);
 const training=trainingAudit(card);
 const verifiedBase=baseStatsAudit(card);
 const levels=training.levels;
 const trainingIndices=ROLE_TRAINING[role];
 const mean=levels?trainingIndices.reduce((sum,i)=>sum+levels[i],0)/trainingIndices.length:null;
 // As categorias apenas sinalizam para onde foram direcionados os níveis:
 // não são conversões, não provam que um atributo ficou abaixo de algum limiar.
 const trainingEvidence=levels?'investimento_da_build_sem_atributos_finais':
  training.status==='pp_divergentes'?'custo_pp_divergente':
  training.status==='pp_nao_documentados'?'vetor_sem_orcamento_comprovado':
  training.status==='treino_proposto_nao_validado'?'treino_proposto_a_revisar':
  'treino_individual_nao_documentado';
 const fixed=boosterName(card.impeto_fixo||card.boost1);
 const extraStatus=slotStatus(card.impeto_extra||card.boost2);
 const extra=extraStatus==='nome_registrado'?boosterName(card.impeto_extra||card.boost2):null;
 const excluded=new Set([fixed,extra].filter(Boolean));
 return Object.entries(BOOSTERS)
 .filter(([name])=>CRAFTABLE.includes(name)&&!excluded.has(name)&&
  (role==='GO'?(name==='Saving'||name==='Goalkeeping'):(name!=='Saving'&&name!=='Goalkeeping')))
 .map(([name,stats])=>{
  const functionScore=stats.reduce((sum,k)=>sum+Math.max(0,weights[k]||0),0);
  let trainingScore=0;
  if(levels&&role!=='GO'){
   for(const stat of stats){
    const i=TRAINING_GROUP[stat];
    if(i===undefined||!trainingIndices.includes(i))continue;
    // Diferença limitada: investiu menos numa categoria => pedir comparação,
    // nunca deduzir velocidade, chute, ou qualquer atributo numérico final.
    const delta=Math.max(-1.6,Math.min(2.25,(mean-levels[i])/2.6));
    const relevance=Math.max(0.45,Math.min(1.25,(weights[stat]||0)/7));
    trainingScore+=delta*relevance*0.85;
   }
  }
  // Evita uma recomendação baseada exclusivamente em "corrigir" nível baixo.
  trainingScore=Math.max(-4,Math.min(4,trainingScore));
  let baseScore=0;
  if(verifiedBase.status==='base_completa_confirmada'){
   const entries=Object.entries(verifiedBase.values)
    .filter(([key])=>(weights[key]||0)>0);
   const reference=entries.length?entries.reduce((sum,[,v])=>sum+v,0)/entries.length:null;
   if(reference!==null){
    const matched=stats.filter(key=>Object.hasOwn(verifiedBase.values,key));
    // Métrica consultiva: comparação RELATIVA entre os dados-base
    // documentados da própria edição, jamais status final previsto.
    if(matched.length>=2){
     baseScore=matched.reduce((sum,key)=>sum+
      (reference-verifiedBase.values[key])/20*
      Math.max(.35,Math.min(1.1,(weights[key]||0)/7)),0);
     baseScore=Math.max(-2,Math.min(2,baseScore));
    }
   }
  }
  let contextScore=0;
  if(role==='CA'||role==='SA'){
   const pivot=/pivo|homem de area|target/.test(style);
   const runner=/infiltra|matador|oportunista|artilheiro/.test(style);
   // A função de apoio em Posse tem prioridades distintas do finalizador puro.
   const linkForward=/puxa marcacao|infiltra/.test(style);
   if(tactic==='posse'&&linkForward&&['Passing','Technique','Offence Creator','Ball Protection'].includes(name))contextScore+=4;
   if(tactic==='posse'&&pivot&&name==='Passing')contextScore+=3;
   if(tactic==='posse'&&runner&&!pivot&&name==='Off the Ball')contextScore+=2;
   if(pivot&&['Offence Creator','Ball Protection','Technique','Aerial'].includes(name))contextScore+=4.5;
   if(runner&&name==='Shooting')contextScore+=3;
   // Chute de primeira e finalizações especiais tornam Shooting uma alternativa real.
   if(/first.time shot|phenomenal finishing|low screamer|long.range shooting|chute de primeira|finalizacao de primeira|chute de longa distancia|finalizacao de longa distancia/i.test(normStyle(card.habilidades_nativas||card.native_skills||''))&&name==='Shooting')contextScore+=3;
   if(levels&&levels[4]<=5&&name==='Off the Ball')contextScore+=2;
  }
  // V272: desempates por arquétipo de campo, sem usar OVR ou inventar bases.
  // Prioridade respeita a função utilizada na formação, não apenas a posição de origem.
  if(role==='ZG'){
   if(/construcao de jogo|defensor criativo|defensor participativo/.test(style)&&
    ['Regista','Passing','Rebuilding'].includes(name))contextScore+=4;
   if(/destruidor/.test(style)&&['Shutdown','Duelling','Stealing','Defending'].includes(name))
    contextScore+=4;
   if(tactic==='posse'&&/one.touch pass|passe de primeira|weighted pass|passe ponderado/.test(style+' '+normStyle(card.habilidades_nativas||card.native_skills||''))&&
    name==='Regista')contextScore+=2;
  }
  if(role==='VOL'){
   if(/primeiro volante|trinco/.test(style)&&['Rebuilding','Regista','Shutdown'].includes(name))
    contextScore+=4;
   if(/versatil|orquestrador/.test(style)&&['Regista','Passing','Ball Protection'].includes(name))
    contextScore+=3;
  }
  if(role==='LD'||role==='LE'){
   if(/lateral ofensivo|lateral atacante|lateral movel/.test(style)&&
    ['Agility','Passing','Ball Protection'].includes(name))contextScore+=3;
   if(/lateral defensivo/.test(style)&&['Shutdown','Duelling','Defending'].includes(name))
    contextScore+=3;
  }
  if(role==='ALA'){
   if(/ala produtivo|ala movel|armador criativo/.test(style)&&
    ['Ball-carrying','Fantasista','Ball Protection'].includes(name))contextScore+=4;
   if(tactic==='fora'&&name==='Crossing')contextScore+=3;
   if(tactic==='posse'&&name==='Passing'&&/armador criativo/.test(style))contextScore+=3;
  }
  if(role==='SA'&&/arrastar defesa|puxa marcacao/.test(style)&&
   ['Passing','Offence Creator','Ball Protection'].includes(name))contextScore+=3;
  if((role==='MAT'||role==='MLG')){
   if(name==='Passing'&&/orquestrador|armador|classico/.test(style))contextScore+=2;
   if(/meia versatil|todo o terreno/.test(style)&&
    ['Regista','Ball Protection','Hard Worker'].includes(name))contextScore+=3;
   if(/criador de espacos|jogador de infiltracao/.test(style)&&
    ['Offence Creator','Off the Ball','Fantasista'].includes(name))contextScore+=3;
  }
  if(role==='GO'&&tactic==='posse'&&name==='Goalkeeping')contextScore+=1;
  const score=Math.round((functionScore+trainingScore+contextScore+baseScore)*100)/100;
  const ordered=stats.slice().sort((a,b)=>(weights[b]||0)-(weights[a]||0));
  const axes=[label[ordered[0]],label[ordered[1]]];
  const info=[
   'Função '+role+' em '+TACTIC_LABEL[tactic],
   'prioriza '+axes.join(' e '),
   levels?'níveis de treino servem apenas como sinal de investimento, sem atributos finais medidos':'níveis individuais indisponíveis; recomendação provisória'
  ];
  if(nativeFindings.length)info.push('habilidades nativas indicam '+nativeFindings.slice(0,2).join(' e '));
  return {
   nome:name,nome_pt:displayName(name),traducao_documentada:translationKnown(name),
   funcao_considerada:role,score,atributos:stats.map(k=>label[k]),
   motivo:info.join('; ')+'.',
   confianca:levels?'comparativa_limitada':'baixa',
   perfil_documental:style||'sem estilo registrado',
   recomendacao_condicional:true,
   status_validacao:'HIPOTESE_COMPETITIVA_SEM_HOMOLOGACAO',
   evidencias:{treino:trainingEvidence,pp_status:training.status,
    base_status:verifiedBase.status,
    base_count:verifiedBase.count,base_atributos_mapeados:verifiedBase.recognized,
    base_fonte:verifiedBase.source,
    score_base:Number(baseScore.toFixed(2)),
    pp_orcamento:training.pp,pp_investidos:training.spent,
    impeto_fixo:fixed||null,impeto_extra_registrado:extra||null,
    score_funcao:Number(functionScore.toFixed(2)),score_complemento:Number(trainingScore.toFixed(2)),
    score_contexto:Number(contextScore.toFixed(2)),
    nativas_contextuais_registradas:nativeFindings.slice(0,6),
    participacao_contexto:Number((contextScore/Math.max(1,Math.abs(score))*100).toFixed(1)),
    atributos_finais_documentados:verifiedBase.status==='base_completa_confirmada'?false:null,
    atributos_finais_comprovados:false,
    limite:'Sem atributos finais comparados nem teste controlado de partida. Não aplicar automaticamente.'}
  };
 }).sort((a,b)=>b.score-a.score||a.nome.localeCompare(b.nome));
}

function audit(cards){
 if(!Array.isArray(cards)||cards.length!==246)throw Error('Acervo incompleto: esperado 246');
 const ids=new Set;const result=cards.map(c=>{
  if(ids.has(c.numero))throw Error('Número duplicado '+c.numero);ids.add(c.numero);
  return {numero:c.numero,nome:c.name,card_id:c.id,edition:c.versao,posicao:c.posicao,estilo_ataque:c.estilo_ataque,estilo_defesa:c.estilo_defesa,
    impeto_fixo:c.impeto_fixo,impeto_extra:c.impeto_extra,status_slot_fonte:slotStatus(c.impeto_extra),
    base_stats_known:c.base_stats_known,
    treino_individual_documentado:trainingAudit(c).status==='custo_pp_conferido',
    pp_validacao:trainingAudit(c).status,ficha:c.arquivo,
    recomendacoes:Object.fromEntries(tactics.map(t=>[t,rank(c,t).slice(0,3)]))};
 });
 const summary={total:result.length,selecionavel:result.filter(c=>c.status_slot_fonte==='selecionavel').length,
 possivel:result.filter(c=>c.status_slot_fonte==='possivel').length,
 nome_registrado:result.filter(c=>c.status_slot_fonte==='nome_registrado').length,
 indefinido:result.filter(c=>c.status_slot_fonte==='indefinido').length};
 return {version:'V104',method:'V200: função, tática, estilo, habilidades nativas e investimento por categoria; sem inferir atributos finais ou slot livre, sem prova de desempenho em partidas',summary,cards:result};
}
const api={BOOSTERS,CRAFTABLE,ROLE,POS,tactics,TACTIC_LABEL,PTBR,
 trainingAudit,progressCost,baseStatsAudit,BASE_STAT_LABELS:label,
 displayName,translationKnown,slotStatus,boosterName,levelsOf,rank,audit};
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_BOOSTERS_V103=api;
})(typeof window!=='undefined'?window:null);
