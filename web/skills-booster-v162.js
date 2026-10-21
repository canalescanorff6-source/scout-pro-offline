/* Scout PRO V162 — sugestões competitivas por edição/função, não confirmação de equipamento. */
(function(host){
'use strict';
const ENTRIES=[
 ['onepass','Passe de primeira',['One-touch Pass','One Touch Pass','Passe de primeira'],'Acelera tabelas e devoluções curtas.'],
 ['through','Passe em profundidade',['Through Passing','Passe em profundidade','Passe a rasgar'],'Melhora a opção de passe para a infiltração pelo centro.'],
 ['double','Toque duplo',['Double Touch','Toque duplo'],'Amplia as saídas curtas do marcador com a bola dominada.'],
 ['sole','Controle com a sola',['Sole Control','Controle com a sola'],'Facilita recepção e giro sob pressão.'],
 ['heel','Toque de calcanhar',['Heel Trick','Passe de calcanhar','Toque de calcanhar'],'Oferece devoluções rápidas quando o corpo não está de frente.'],
 ['weighted','Passe na medida',['Weighted Pass','Passe ponderado','Passe na medida'],'Dá opção de passe com peso controlado em transições e apoio.'],
 ['fighting','Espírito guerreiro',['Fighting Spirit','Espírito guerreiro'],'Ajuda a manter ações competitivas sob pressão e cansaço.'],
 ['intercept','Interceptação',['Interception','Interceptação'],'Fortalece a leitura e o corte de linhas de passe.'],
 ['blocker','Bloqueador',['Blocker','Bloqueador'],'Apoia bloqueios de passes e finalizações em cobertura.'],
 ['mark','Marcação individual',['Man Marking','Marcação individual'],'Apoia acompanhamento defensivo quando a função exigir.'],
 ['aerial','Superioridade aérea',['Aerial Superiority','Superioridade aérea'],'Aumenta recursos nos duelos aéreos.'],
 ['heading','Cabeçada',['Heading','Cabeceio','Cabeçada'],'Melhora o recurso de cabeceio para atacantes que recebem bola alta.'],
 ['firstshot','Chute de primeira',['First-time Shot','First Time Shot','Finalização de primeira','Chute de primeira'],'Permite finalizar mais rapidamente após a tabela.'],
 ['acrobatic','Finalização acrobática',['Acrobatic Finishing','Finalização acrobática'],'Oferece finalizações em posições difíceis dentro da área.'],
 ['longshot','Precisão à distância',['Long-range Shooting','Long Range Shooting','Long-Range Shooting','Finalização de longa distância','Chute de longa distância','Precisão à distância'],'Cria alternativa quando a defesa fecha a área.'],
 ['curler','Efeito de longe',['Long-range Curler','Long-Range Curler','Chute colocado de longa distância','Efeito de longe'],'Oferece curva em finalizações de média e longa distância.'],
 ['trackback','Volta para marcar',['Track Back','Track-back','Recuar para marcar','Volta para marcar'],'Ajuda o jogador ofensivo a recompor quando perde a bola.'],
 ['sliding','Carrinho',['Sliding Tackle','Carrinho'],'Amplia alternativa de desarme com cuidado para não cometer faltas.'],
 ['clear','Afastamento acrobático',['Acrobatic Clearance','Corte acrobático','Afastamento acrobático'],'Ajuda a afastar bolas difíceis em situações defensivas.'],
 ['lowloft','Passe aéreo baixo',['Low Lofted Pass','Passe meio levantado','Passe aéreo baixo'],'Oferece uma saída aérea mais rápida quando o passe curto é bloqueado.'],
 ['cutturn','Puxada de letra',['Cut Behind & Turn','Cut Behind Turn','Cut Behind And Turn','Corte para trás e giro','Puxada de letra'],'Recurso de giro curto para escapar da marcação.'],
 ['gklow','Reposição baixa do GO',['GK Low Punt','Lançamento rasteiro de goleiro','Repos. baixa do GO'],'Ajuda a repor a bola rapidamente em zonas mais baixas.'],
 ['gkhigh','Lançamento alto de goleiro',['GK High Punt','Lançamento alto de goleiro'],'Amplia a reposição com os pés quando o passe curto não é seguro.'],
 ['gklong','Arremesso longo do GO',['GK Long Throw','Lançamento longo de goleiro','Arrem. longo do GO'],'Permite iniciar jogadas com lançamentos manuais longos.'],
 ['gkpenalty','Pegador de pênaltis',['GK Penalty Saver','Defesa de pênalti','Pegador de pênaltis'],'Adiciona recurso nas cobranças de pênalti.'],
 ['captain','Liderança',['Captaincy','Liderança','Capitão'],'Contribui com o papel de liderança da equipe.'],
 ['supersub','Super substituto',['Super Sub','Super-sub','Super reserva','Super substituto'],'Alternativa para quem normalmente entra na segunda etapa.']
];
const SKILLS=Object.fromEntries(ENTRIES.map(x=>[x[0],Object.freeze({key:x[0],name:x[1],aliases:x[2],why:x[3]})]));
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const aliasMap=new Map;
for(const e of ENTRIES)for(const alias of [e[1],...e[2]])aliasMap.set(normal(alias),e[0]);
// Alias adicionais derivados das grafias portuguesas encontradas nos prints eFHUB.
for(const [raw,key] of Object.entries({
 'chute de primeira':'firstshot','finalizacao de primeira':'firstshot',
 'chute de longa distancia':'longshot','finalizacao de longa distancia':'longshot','precisao a distancia':'longshot',
 'efeito de longe':'curler','chute colocado de longa distancia':'curler','chute de longe':'curler',
 'cabeçada':'heading','cabecada':'heading',
 'afastamento acrobatico':'clear','corte acrobatico':'clear','reposicao alta do go':'gkhigh',
 'arremesso longo do go':'gklong','pegador de penaltis':'gkpenalty',
 'comandante da defesa go':'captain','controle com a sola':'sole',
 'passe de primeira':'onepass','passe em profundidade':'through',
 'passe a rasgar':'through','passe ponderado':'weighted','recuar para marcar':'trackback',
 'corte para tras e giro':'cutturn','super reserva':'supersub','capitao':'captain','bloqueador':'blocker',
 'superioridade aerea':'aerial','interceptacao':'intercept',
 'passe de calcanhar':'heel','passe rasteiro de primeira':'onepass',
 'passe infiltrado':'through','passe a rasgar defesa':'through',
 'sangue frio':'fighting','marcacao individual':'mark',
 'chute de primeira intencional':'firstshot'

}))if(!aliasMap.has(normal(raw)))aliasMap.set(normal(raw),key);
const keyFor=s=>aliasMap.get(normal(s))||'';
const splitSkills=s=>Array.isArray(s)?s:String(s||'').split(/[;\n,]+/).map(x=>x.trim()).filter(Boolean);
// A confirmação só vale para a edição exata e para ESTA lista de habilidades.
// Editar o texto invalida automaticamente a confirmação antiga.
const confirmationKey=(cap,id)=>'scoutpro:v254:additional-confirmed:'+Number(cap)+'@'+String(id);
const fingerprint=s=>[...new Set(splitSkills(s).map(x=>keyFor(x)||'unmapped:'+normal(x)))].sort().join('|');
// V278: não confiar em confirmação antiga sem vínculo EXPLÍCITO da edição.
// Registros legados são preservados para leitura; sua prova deixa de liberar
// slots até o usuário reconfirmar na carta exata, sem migrar automaticamente.
function checkedEquipment(card,manual,record){
 const names=splitSkills(manual);
 const native=splitSkills(card.native_skills||card.habilidades_nativas||'');
 const nativeKeys=new Set(native.map(keyFor).filter(Boolean));
 const equippedKeys=names.map(keyFor);
 const edition=String(card.edition||card.versao||'');
 return Boolean(record&&record.schema==='CRAQUE_ADDITIONAL_V254'&&record.confirmed===true&&
  edition.trim()&&String(record.edition||'')===edition&&
  Number(record.capture)===Number(card.capture)&&String(record.card_id)===String(card.id)&&
  record.fingerprint===fingerprint(manual)&&
  Object.hasOwn(record,'nativeFingerprint')&&
  record.nativeFingerprint===fingerprint(native.join(';'))&&
  names.length<=5&&new Set(equippedKeys).size===names.length&&
  equippedKeys.every(key=>Boolean(key)&&!nativeKeys.has(key)));
}
function boosterRecordEvidence(card,record){
 const edition=String(card.edition||card.versao||'');
 const cap=Number(card.capture??card.numero);
 const valid=Boolean(record&&record.schema==='CRAQUE_BOOST_SLOT_V283'&&
  Number.isInteger(cap)&&cap>=1&&Number(record.capture)===cap&&edition.trim()&&
  Object.hasOwn(record,'edition')&&String(record.edition)===edition&&
  String(record.card_id)===String(card.id)&&
  ['vazio','ocupado','ausente'].includes(String(record.status))&&
  (record.status==='ocupado'||!String(record.equipped||'').trim()));
 return Object.freeze({
  valid,status:valid?record.status:null,equipped:valid?(record.equipped||''):null,
  legacy:!!record&&!valid,
  reason:!record?'Nenhuma conferência salva do segundo ímpeto.':
   valid?'Conferência vinculada a CAP, Card ID e edição.':
   'Conferência antiga, incompleta ou de outra carta: reconfirme o slot na edição exata.'
 });
}
// V274: vocabulário de habilidades NATIVAS ESPECIAIS do próprio catálogo.
// Não são skills adicionais selecionáveis; não inventar traduções KONAMI,
// efeitos numéricos, equivalência com skill comum ou autorização de token.
// O grupo é uma indicação tática ampla para comparação humana.
const CONTEXT_NATIVE_GROUPS=Object.freeze({
 conducao:['Marseille Turn','Scissors Feint','Chop Turn','Flip Flap',
  'Sombrero','Scotch Move','Momentum Dribbling','Acceleration Burst',
  'Magnetic Feet','Pedalada'],
 distribuicao:['Outside Curler','Phenomenal Pass','Visionary Pass',
  'No Look Pass','Game-changing Pass','Passe sem olhar',
  'Passe fenomenal','Curva para Fora'],
 amplitude:['Pinpoint Crossing','Edged Crossing','Edge Crossing',
  'Cruzamento preciso','Long Throw'],
 finalizacao:['Rising Shot','Dipping Shot','Chip Shot Control','Knuckle Shot',
  'Phenomenal Finishing','Low Screamer','Blitz Curler','Bullet Header',
  'Folha seca'],
 defesa:['Aerial Fort','Fortress','Long Reach Tackle','Long-reach Tackle',
  'GK Directing Defence','GK Directing Defense'],
 especial:['Gamesmanship','Penalty Specialist','Rabona','Willpower',
  'GK Spirit Roar','Attacking Surge','Astúcia','Pressionante',
  'Especialista em pênalti']
});
const contextualMap=new Map();
for(const [group,names] of Object.entries(CONTEXT_NATIVE_GROUPS))
 for(const name of names){
  const key=normal(name);
  if(contextualMap.has(key)&&contextualMap.get(key)!==group)
   throw Error('Nativa contextual de grupos diferentes: '+name);
  contextualMap.set(key,group);
 }
const contextForNative=name=>contextualMap.get(normal(name))||null;
const contextNativeProfile=native=>{
 const groups=new Map(),known=[],unknown=[];
 for(const name of splitSkills(native)){
  const type=contextForNative(name);
  if(type){known.push({name,group:type});groups.set(type,(groups.get(type)||0)+1);}
  else if(!keyFor(name))unknown.push(name);
 }
 return Object.freeze({known,unknown,groups:Object.fromEntries(groups)});
};
const POSITION={AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DD:'LD',LD:'LD',DE:'LE',LE:'LE',DC:'ZG',ZC:'ZG',ZG:'ZG',GR:'GO',GO:'GO',PTD:'ALA',PTE:'ALA',MLD:'ALA',MLE:'ALA'};
const ROLE_LABEL=Object.freeze({CA:'Centroavante',SA:'Segundo atacante',MAT:'Meia-atacante',
 MLG:'Meia de ligação',VOL:'Volante',ZG:'Zagueiro',LD:'Lateral direito',
 LE:'Lateral esquerdo',ALA:'Ala / ponta',GO:'Goleiro'});
// V273: somente investimento documentado no vetor registrado da MESMA carta.
// Não representa atributo final e é zero se o orçamento não fecha, estiver
// ausente/estimado ou a proposta ainda não tiver sido aprovada.
const TRAINING_CATEGORY=Object.freeze({
 firstshot:0,acrobatic:0,longshot:0,curler:0,
 onepass:1,through:1,weighted:1,lowloft:1,
 double:2,sole:2,heel:2,cutturn:2,
 fighting:4,trackback:4,supersub:4,
 intercept:6,blocker:6,mark:6,sliding:6,clear:6,
 aerial:5,heading:5
});
function investmentAudit(d){
 const levels=d?.recommended_levels??d?.niveis;
 const pp=d?.pp;
 if(!Array.isArray(levels)||levels.length!==10||
  !levels.every(n=>Number.isInteger(n)&&n>=0&&n<=20))
  return Object.freeze({status:'vetor_indisponivel',levels:null});
 if(!Number.isInteger(pp)||pp<0||pp>238||d.training_provisional===true||
  d.treino_proposto_nao_validado===true||d.pp_estimado===true||d.pp_estimated===true)
  return Object.freeze({status:'nao_confirmado_ou_provisorio',levels:null});
 const spent=levels.reduce((cost,n)=>{
  for(let i=0;i<n;i++)cost+=1+Math.floor(i/4);
  return cost;
 },0);
 if(spent!==pp)return Object.freeze({status:'pp_divergente',levels:null});
 return Object.freeze({status:'investimento_matematico',levels:levels.slice(),pp,spent});
}
const POOLS={
 CA:['firstshot','onepass','through','sole','heel','acrobatic','longshot','fighting','heading','aerial','double','curler','supersub','weighted'],
 SA:['onepass','through','double','sole','firstshot','heel','longshot','fighting','curler','weighted','cutturn','acrobatic','trackback','supersub'],
 MAT:['onepass','through','sole','double','heel','weighted','fighting','longshot','curler','cutturn','firstshot','intercept','trackback'],
 MLG:['onepass','through','weighted','sole','intercept','fighting','double','heel','blocker','mark','lowloft','cutturn','longshot','trackback'],
 VOL:['intercept','blocker','onepass','through','fighting','mark','aerial','weighted','sliding','clear','sole','lowloft','heading'],
 ZG:['blocker','intercept','mark','aerial','fighting','onepass','clear','heading','sliding','weighted','through','sole','lowloft'],
 LD:['intercept','blocker','onepass','fighting','mark','aerial','through','sliding','weighted','sole','clear','trackback','lowloft'],
 LE:['intercept','blocker','onepass','fighting','mark','aerial','through','sliding','weighted','sole','clear','trackback','lowloft'],
 ALA:['double','sole','onepass','through','fighting','heel','firstshot','cutturn','longshot','trackback','weighted','curler','supersub'],
 GO:['gklow','gklong','gkhigh','gkpenalty','fighting','captain','weighted','lowloft','onepass']
};
// V281: prioridades POR FUNÇÃO × TÁTICA (consultivas). A média do score
// base continua dominante; nenhum dado de jogador é alterado. O mapa
// explica por que Posse, CA rápido, CA normal, Por Fora e Passe Longo
// não devem receber automaticamente as mesmas cinco skills.
const ROLE_TACTIC_SKILLS=Object.freeze({
 CA:{
  posse:['onepass','sole','heel','double'],normal:['fighting','weighted','acrobatic','onepass'],
  rapido:['firstshot','through','double','longshot'],fora:['weighted','sole','double','aerial'],
  longo:['aerial','heading','weighted','fighting']
 },
 SA:{
  posse:['onepass','sole','heel','through'],normal:['fighting','weighted','onepass','trackback'],
  rapido:['through','firstshot','double','longshot'],fora:['weighted','cutturn','double','sole'],
  longo:['weighted','acrobatic','fighting','through']
 },
 MAT:{
  posse:['onepass','through','sole','heel'],normal:['fighting','intercept','weighted','onepass'],
  rapido:['through','double','firstshot','longshot'],fora:['lowloft','weighted','cutturn','sole'],
  longo:['weighted','lowloft','fighting','longshot']
 },
 MLG:{
  posse:['onepass','through','sole','heel'],normal:['intercept','blocker','fighting','mark'],
  rapido:['through','double','fighting','trackback'],fora:['lowloft','weighted','sole','cutturn'],
  longo:['weighted','lowloft','intercept','fighting']
 },
 VOL:{
  posse:['onepass','through','weighted','sole'],normal:['blocker','mark','fighting','intercept'],
  rapido:['intercept','through','fighting','aerial'],fora:['weighted','lowloft','onepass','sole'],
  longo:['aerial','lowloft','heading','blocker']
 },
 ZG:{
  posse:['onepass','weighted','sole','intercept'],normal:['blocker','mark','sliding','fighting'],
  rapido:['intercept','blocker','fighting','clear'],fora:['weighted','lowloft','onepass','intercept'],
  longo:['aerial','heading','clear','weighted']
 },
 LD:{
  posse:['onepass','through','sole','intercept'],normal:['blocker','mark','fighting','sliding'],
  rapido:['intercept','through','trackback','fighting'],fora:['weighted','lowloft','sole','onepass'],
  longo:['aerial','lowloft','clear','fighting']
 },
 LE:{
  posse:['onepass','through','sole','intercept'],normal:['blocker','mark','fighting','sliding'],
  rapido:['intercept','through','trackback','fighting'],fora:['weighted','lowloft','sole','onepass'],
  longo:['aerial','lowloft','clear','fighting']
 },
 ALA:{
  posse:['onepass','sole','double','heel'],normal:['trackback','fighting','onepass','weighted'],
  rapido:['double','firstshot','longshot','through'],fora:['cutturn','weighted','sole','double'],
  longo:['aerial','weighted','fighting','firstshot']
 },
 GO:{
  posse:['gklow','gklong','fighting'],normal:['gkhigh','gkpenalty','fighting'],
  rapido:['gklow','gkhigh','fighting'],fora:['gklow','gklong','weighted'],
  longo:['gklong','gkhigh','fighting']
 }
});
const TACTIC_REASON=Object.freeze({
 posse:'Tabelas, passe curto, recepção orientada e controle sob pressão.',
 normal:'Equilíbrio defensivo e primeira ligação segura após recuperar.',
 rapido:'Ataque ao espaço, passe vertical e ações imediatas na transição.',
 fora:'Apoio nos corredores e entrada por dentro; cruzar não é obrigatório.',
 longo:'Apoio à segunda bola, passe longo consciente e duelos no setor.'
});
function roleOf(d){return POSITION[d.role_used]||POSITION[d.shown_position]||POSITION[d.posicao]||null}
// V276: composição de um pacote HIPOTÉTICO complementar.
// A função evita concentrar 5 sugestões na mesma família. O motor
// principal da ficha permanece intacto e os 5 slots só existem se
// comprovados pelo usuário na edição correta.
const SKILL_FAMILY=Object.freeze({
 onepass:'apoio',heel:'apoio',through:'criacao',weighted:'criacao',
 lowloft:'criacao',sole:'dominio',double:'dominio',cutturn:'dominio',
 firstshot:'finalizacao',acrobatic:'finalizacao',longshot:'finalizacao',
 curler:'finalizacao',heading:'jogo_aereo',aerial:'jogo_aereo',
 intercept:'cobertura',blocker:'cobertura',mark:'cobertura',
 sliding:'cobertura',clear:'cobertura',fighting:'intensidade',
 trackback:'intensidade',supersub:'intensidade',captain:'intensidade',
 gklow:'reposicao',gklong:'reposicao',gkhigh:'reposicao',
 gkpenalty:'defesa_goleiro'
});
const ROLE_FAMILIES=Object.freeze({
 CA:['finalizacao','apoio','dominio'],SA:['apoio','criacao','dominio'],
 MAT:['apoio','criacao','dominio'],MLG:['apoio','criacao','cobertura'],
 VOL:['cobertura','apoio','criacao'],ZG:['cobertura','apoio','jogo_aereo'],
 LD:['cobertura','apoio','criacao'],LE:['cobertura','apoio','criacao'],
 ALA:['dominio','apoio','criacao'],GO:['reposicao','defesa_goleiro','intensidade']
});
const TACTIC_FAMILIES=Object.freeze({
 posse:['apoio','criacao','dominio'],normal:['cobertura','apoio'],
 rapido:['finalizacao','criacao','intensidade'],
 fora:['criacao','dominio','jogo_aereo'],
 longo:['jogo_aereo','criacao','intensidade']
});
function composePortfolio(ranked,role,tactic,limit,context={}){
 // Contexto APENAS de nativas/adicionais com identidade canônica reconhecida;
 // habilidades especiais não são equipáveis nem recebem equivalência presumida.
 const knownNatives=new Set((context.nativeKeys||[]).filter(k=>SKILL_FAMILY[k]));
 const knownEquipped=new Set((context.equippedKeys||[]).filter(k=>SKILL_FAMILY[k]));
 const nativeFamilyCounts=new Map(),equippedFamilyCounts=new Map();
 for(const key of knownNatives){
  const family=SKILL_FAMILY[key];nativeFamilyCounts.set(family,(nativeFamilyCounts.get(family)||0)+1);
 }
 for(const key of knownEquipped){
  const family=SKILL_FAMILY[key];equippedFamilyCounts.set(family,(equippedFamilyCounts.get(family)||0)+1);
 }
 if(!Number.isInteger(limit)||limit<0||limit>5)throw Error('Limite de cinco slots inválido');
 const pool=Array.isArray(ranked)?ranked:[],roleNeeds=ROLE_FAMILIES[role]||[],
  tacticNeeds=TACTIC_FAMILIES[tactic]||[];
 const chosen=[],seen=new Set(),families=new Map();
 for(let i=0;i<Math.min(limit,pool.length);i++){
  const options=pool.filter(s=>!seen.has(s.key)).map(s=>{
   const family=SKILL_FAMILY[s.key]||'outros';
   const n=families.get(family)||0;
   const roleBonus=roleNeeds.includes(family)&&n===0?16:0;
   const tacticBonus=tacticNeeds.includes(family)&&n===0?10:0;
   const redundancyPenalty=n?12*n:0;
   // Nativa da mesma família não significa skill equivalente: peso é leve,
   // nunca bloqueio. Família já equipada pesa mais, pois ocupa slot real.
   const nativeOverlapPenalty=(nativeFamilyCounts.get(family)||0)>0?7:0;
   const equippedOverlapPenalty=(equippedFamilyCounts.get(family)||0)>0?12:0;
   return {skill:s,family,roleBonus,tacticBonus,redundancyPenalty,
    nativeOverlapPenalty,equippedOverlapPenalty,
    adjustedScore:s.score+roleBonus+tacticBonus-redundancyPenalty-
     nativeOverlapPenalty-equippedOverlapPenalty};
  }).sort((a,b)=>b.adjustedScore-a.adjustedScore||
   b.skill.score-a.skill.score||a.skill.key.localeCompare(b.skill.key));
  const best=options[0];if(!best)break;
  chosen.push(Object.freeze({
   key:best.skill.key,name:best.skill.name,family:best.family,
   baseScore:best.skill.score,relativeScore:best.adjustedScore,
   evidence:Object.freeze({nativeFamilyPresent:best.nativeOverlapPenalty>0,
    equippedFamilyPresent:best.equippedOverlapPenalty>0,
    currentFamilySelected:families.get(best.family)||0,
    roleBonus:best.roleBonus,tacticBonus:best.tacticBonus,
    nativePenalty:best.nativeOverlapPenalty,equippedPenalty:best.equippedOverlapPenalty,
    repetitionPenalty:best.redundancyPenalty}),
   explanation:(best.roleBonus?'Lacuna funcional prioritária. ':'')+
    (best.tacticBonus?'Complementa o estilo de jogo. ':'')+
    (best.redundancyPenalty?'Família já representada no pacote. ':'')+
    (best.nativeOverlapPenalty?'Há skill nativa da mesma família; não é habilidade idêntica. ':'')+
    (best.equippedOverlapPenalty?'Há habilidade equipada da mesma família; verifique complementaridade. ':'')+
    'Seleção heurística; confirmar na carta exata.',
   equipAuthorized:false
  }));
  seen.add(best.skill.key);
  families.set(best.family,(families.get(best.family)||0)+1);
 }
 return Object.freeze({
  kind:'ALTERNATIVA_EQUILIBRADA_CONSULTIVA',role,tactic,
  candidates:Object.freeze(chosen),families:Object.freeze(Object.fromEntries(families)),
  nativeFamilyCounts:Object.freeze(Object.fromEntries(nativeFamilyCounts)),
  equippedFamilyCounts:Object.freeze(Object.fromEntries(equippedFamilyCounts)),
  slotCountConfirmed:false,mayApply:false,
  warning:'Até cinco candidatos complementares; não representam vagas livres ou skill de criador.'
 });
}
function evaluate(d,tactic,manualEquipped,options={}){
 if(!['posse','normal','rapido','fora','longo'].includes(tactic))throw Error('Tática inválida');
 const role=roleOf(d);if(!role)return {role:null,recommendations:[],nativeKnown:false,missing:['Posição da carta não cadastrada']};
 const native=splitSkills(d.native_skills||d.habilidades_nativas);
 const nativeKnown=Boolean(native.length);
 const equipped=splitSkills(manualEquipped);
 const nativeIds=new Set(native.map(name=>keyFor(name)||'unmapped:'+normal(name)));
 const nativeKeys=new Set(native.map(keyFor).filter(Boolean));
 const contextNatives=contextNativeProfile(native);
 const unmappedNative=contextNatives.unknown;
 // Cinco slots são físicos. Grafias PT-BR/EN da mesma habilidade contam uma vez;
 // nenhuma habilidade nativa registrada conta como adicional equipado.
 const userMap=new Map();
 for(const name of equipped){
  const identity=keyFor(name)||'unmapped:'+normal(name);
  if(identity&&!userMap.has(identity))userMap.set(identity,name);
 }
 const nativeManualConflicts=[...userMap].filter(([id])=>nativeIds.has(id)).map(([,name])=>name);
 const unmappedEquipped=[...userMap].filter(([id])=>id.startsWith('unmapped:')).map(([,name])=>name);
 const distinctExtras=[...userMap].filter(([id])=>!nativeIds.has(id));
 const used=new Set([...nativeKeys,...userMap.keys()].filter(id=>!id.startsWith('unmapped:')));
 const style=normal([d.playing_style,d.attack_style,d.defence_style,d.estilo_ataque,d.estilo_defesa].filter(Boolean).join(' '));
 const investment=investmentAudit(d);
 const pool=POOLS[role];const scorer=new Map;
 const factors=new Map();
 pool.forEach((key,i)=>{const base=200-i*10;scorer.set(key,base);
  factors.set(key,{funcao:base,tatica:0,estilo:0,nativas:0,investimento:0});});
 const bump=(names,amount,source='estilo')=>names.forEach(k=>{
  if(!scorer.has(k))return;
  scorer.set(k,scorer.get(k)+amount);
  factors.get(k)[source]+=amount;
 });
 if(tactic==='posse')bump(['onepass','through','sole','double','heel','intercept','blocker'],22,'tatica');
 if(tactic==='normal')bump(['intercept','fighting','weighted','blocker','through'],16,'tatica');
 if(tactic==='rapido')bump(['through','firstshot','double','longshot','fighting','intercept'],18,'tatica');
 if(tactic==='fora')bump(['weighted','lowloft','onepass','sole','double','through','aerial','gklong'],23,'tatica');
 if(tactic==='longo')bump(['weighted','lowloft','aerial','heading','firstshot','fighting','intercept','gklong'],24,'tatica');
 if(/pivo|homem de area|target/.test(style))bump(['heading','aerial','onepass','heel'],34);
 // V269: quem puxa marcação/infiltra para criar apoio não recebe, por padrão,
 // a mesma priorização de chute de primeira de um Artilheiro.
 if(/infiltr|puxa marcacao|arrastar defesa/.test(style))bump(['onepass','through','heel','sole','weighted'],24);
 if(/matador|artilheiro|oportunista/.test(style))bump(['firstshot','through','onepass','acrobatic'],18);
 if(/armador|orquestrador|classico|criativo|criador de espacos/.test(style))bump(['onepass','through','weighted','sole','heel'],23);
 if(/destruidor|primeiro volante|lateral defensivo|defensor criativo/.test(style))bump(['intercept','blocker','mark','onepass'],22);
 // V270: perfis de saída de bola e lateral ofensivo existentes no catálogo.
 // Somente desempate consultivo por função/estilo; não instala skills.
 if(role==='ZG'&&/construcao de jogo|defensor criativo|defensor participativo/.test(style))
  bump(['onepass','weighted','through','sole'],18);
 if((role==='LD'||role==='LE')&&/lateral ofensivo|lateral atacante|lateral movel/.test(style))
  bump(['onepass','weighted','through','sole'],18);
 if(/versatil|todo o terreno/.test(style))bump(['fighting','onepass','intercept'],18);
 if(/goleiro ofensivo|goleiro adiantado|gr ofensivo/.test(style))bump(['gklow','gklong'],25);
 // V272: 12 ramificações de função e estilo, sem automatizar slot/PP.
 // Perfis são heurísticos ancorados no estilo documentado da mesma carta.
 if((role==='CA'||role==='SA')&&/pivo|homem de area/.test(style))
  bump(['onepass','heel','heading','aerial','sole'],24);
 if((role==='CA'||role==='SA')&&/matador|artilheiro|oportunista/.test(style))
  bump(['firstshot','acrobatic','through','longshot'],19);
 if((role==='CA'||role==='SA')&&/puxa marcacao|arrastar defesa/.test(style))
  bump(['onepass','heel','through','sole','weighted'],21);
 if((role==='SA'||role==='MAT')&&/jogador de infiltracao|criador de espacos/.test(style))
  bump(['through','onepass','double','sole','firstshot'],19);
 if((role==='MAT'||role==='MLG')&&/orquestrador|armador criativo|classico/.test(style))
  bump(['onepass','through','weighted','heel','sole'],17);
 if(role==='MLG'&&/meia versatil|todo o terreno/.test(style))
  bump(['intercept','fighting','onepass','weighted'],19);
 if(role==='VOL'&&/primeiro volante|trinco/.test(style))
  bump(['intercept','blocker','onepass','mark'],20);
 if(role==='VOL'&&/orquestrador|meia versatil/.test(style))
  bump(['onepass','weighted','through','intercept'],17);
 if(role==='ZG'&&/destruidor/.test(style))
  bump(['intercept','blocker','mark','aerial','fighting'],18);
 if(role==='ZG'&&/construcao de jogo|defensor criativo/.test(style))
  bump(['onepass','weighted','through','blocker'],18);
 if((role==='LD'||role==='LE')&&/lateral defensivo/.test(style))
  bump(['intercept','blocker','mark','fighting'],17);
 if((role==='LD'||role==='LE')&&/lateral ofensivo|lateral atacante|lateral movel/.test(style))
  bump(['onepass','through','weighted','fighting','intercept'],16);
 if(role==='ALA'&&/ala produtivo|lateral movel/.test(style))
  bump(['double','sole','onepass','through','heel'],20);
 if(role==='GO'&&/goleiro defensivo/.test(style))
  bump(['gkhigh','gkpenalty','fighting'],16);
 // V281: reforço tático limitado e explicável, nunca prova meta ou OVR.
 // Até quatro recursos funcionais por combinação; cartas com nativas
 // diferentes continuam excluindo os equipamentos já existentes.
 const tacticalPriority=(ROLE_TACTIC_SKILLS[role]||{})[tactic]||[];
 bump(tacticalPriority,28,'tatica');
 // V217: heurísticas transparentes de complementaridade das habilidades NATIVAS
 // cadastradas na própria carta. Não representam bônus medidos ou gameplay validado.
 const synergy=new Map();
 const support=(condition,targets,amount,explanation)=>{
  if(!condition)return;
  const modifier=tactic==='posse'?amount:(tactic==='fora'?Math.round(amount*.65):tactic==='longo'?Math.round(amount*.55):Math.round(amount*.75));
  for(const id of targets){
   if(!scorer.has(id)||used.has(id))continue;
   scorer.set(id,scorer.get(id)+modifier);
   factors.get(id).nativas+=modifier;
   const notes=synergy.get(id)||[];
   notes.push(explanation);
   synergy.set(id,notes);
  }
 };
 support(nativeKeys.has('firstshot'),['onepass','through','sole'],11,
  'Complementar opção de finalização de primeira com apoios curtos');
 support(nativeKeys.has('double')||nativeKeys.has('sole'),['onepass','through','weighted'],9,
  'Complementar condução/recepção nativa com distribuição de bola');
 support(nativeKeys.has('onepass')&&nativeKeys.has('through'),['sole','double','weighted'],15,
  'Complementar tabela e passe em profundidade já registrados');
 support(nativeKeys.has('heading')&&nativeKeys.has('aerial'),['onepass','sole','heel'],8,
  'Diversificar apoios de carta com recursos aéreos registrados');
 support(nativeKeys.has('intercept')&&nativeKeys.has('blocker'),['onepass','weighted','sole'],12,
  'Apoiar saída curta após ações defensivas cadastradas');
 support(nativeKeys.has('longshot')&&nativeKeys.has('curler'),['onepass','double'],7,
  'Diversificar criação de jogadas de carta com finalizações longas');
 // Complementariedade por lacunas documentadas: somente o que a carta
 // REALMENTE possui, nunca criar nativas nem garantir um resultado em campo.
 support(nativeKeys.has('onepass')&&!nativeKeys.has('through'),
  ['through','weighted','heel'],12,'Apoio curto nativo com opção de penetração');
 support(nativeKeys.has('through')&&!nativeKeys.has('onepass'),
  ['onepass','heel','sole'],12,'Passe em profundidade nativo com tabela curta');
 support(nativeKeys.has('intercept')&&!nativeKeys.has('blocker')&&
  ['VOL','ZG','LD','LE','MLG'].includes(role),
  ['blocker','mark','onepass'],13,'Interceptação nativa com defesa posicional');
 support(nativeKeys.has('blocker')&&!nativeKeys.has('intercept')&&
  ['VOL','ZG','LD','LE'].includes(role),
  ['intercept','mark','fighting'],13,'Bloqueio nativo com leitura de linhas');
 support(nativeKeys.has('aerial')&&!nativeKeys.has('heading')&&
  ['CA','ZG','VOL'].includes(role),
  ['heading','fighting'],10,'Duelos aéreos nativos sem cabeceio registrado');
 support(nativeKeys.has('firstshot')&&!nativeKeys.has('onepass')&&
  ['CA','SA','MAT'].includes(role),
  ['onepass','heel'],11,'Finalização nativa com devolução de primeira');
 support(nativeKeys.has('trackback')&&role==='ALA',
  ['onepass','fighting','intercept'],9,'Recomposição nativa com circulação curta');
 support(nativeKeys.has('gklow')&&role==='GO'&&tactic==='posse',
  ['gklong','captain','fighting'],8,'Reposição baixa nativa, diversificar saídas');
 // V274: sinais contextuais das nativas ESPECIAIS reconhecidas.
 // Apenas desempates consultivos (no máximo 6 por candidata); nomes
 // cadastrados ≠ habilidade adicional disponível para equipar.
 const contextGroup=contextNatives.groups;
 const contextualBump=(group,targets,amount,reason)=>{
  if(!contextGroup[group])return;
  const limited=Math.min(6,amount);
  for(const key of targets){
   if(!scorer.has(key)||used.has(key))continue;
   scorer.set(key,scorer.get(key)+limited);
   factors.get(key).nativas+=limited;
   const notes=synergy.get(key)||[];
   notes.push(reason+' (nativa especial documentada; hipótese)');
   synergy.set(key,notes);
  }
 };
 if(['CA','SA','MAT','MLG','ALA'].includes(role)){
  contextualBump('conducao',['sole','onepass','through'],5,
   'Condução especial registrada; complementar com recepção e apoio');
  contextualBump('finalizacao',['onepass','through','sole'],4,
   'Finalização especial registrada; alternativa de criação de espaço');
 }
 if(['MAT','MLG','VOL','SA','ZG','LD','LE'].includes(role))
  contextualBump('distribuicao',['onepass','through','weighted'],5,
   'Distribuição especial registrada; reforçar circulação curta');
 if(['VOL','ZG','LD','LE'].includes(role))
  contextualBump('defesa',['intercept','blocker','onepass'],5,
   'Recursos defensivos especiais registrados; conferir cobertura e saída');
 if(['LD','LE','ALA','MLG'].includes(role)&&tactic==='fora')
  contextualBump('amplitude',['weighted','lowloft','onepass'],4,
   'Habilidade nativa de amplitude; comparar para tática Por Fora');
 // Grupo "especial" permanece sem efeito heurístico até evidência.
 // Investimento é um discriminador DOCUMENTAL limitado a 0..8 pontos;
 // um nível não diz que a carta tem atributo final mais alto ou baixo.
 // Não cria build, não inventa vetor e não usa Overall.
 if(investment.levels)for(const key of pool){
  const category=TRAINING_CATEGORY[key];
  if(category===undefined)continue;
  const points=Math.min(8,Math.round(investment.levels[category]*.4));
  scorer.set(key,scorer.get(key)+points);
  factors.get(key).investimento+=points;
 }
 // O histórico de sugestões genéricas não aumenta a nota da carta.
 // Prioridade depende apenas da função, da tática e do estilo, não do OVR.
 // Desempate V275: preservar prioridade da função, não ordem alfabética.
 const poolRank=new Map(pool.map((key,i)=>[key,i]));
 const ranked=[...scorer.entries()].filter(([key])=>!used.has(key))
  .sort((a,b)=>b[1]-a[1]||poolRank.get(a[0])-poolRank.get(b[0]))
  .map(([key,score],i,list)=>({
   ...SKILLS[key],score,
   marginToNext:i+1<list.length?Number((score-list[i+1][1]).toFixed(2)):null,
   priorityNote:i+1<list.length&&score-list[i+1][1]<3?
    'PRIORIDADES PRÓXIMAS — comparar a mesma edição em jogo':
    'Ordem consultiva por função e estilo',
   criterios:Object.freeze({...factors.get(key)}),
   synergies:synergy.get(key)||[]
  }));
 const overLimit=distinctExtras.length>5;
 const requiresReconciliation=overLimit||nativeManualConflicts.length>0||unmappedEquipped.length>0;
 // A lista manual pode estar INCOMPLETA. Não declarar espaços livres
 // ou cinco skills aplicáveis até o usuário conferir no Plano de Jogo.
 const equippedConfirmed=options.equippedConfirmed===true&&!requiresReconciliation;
 const slotsRemaining=equippedConfirmed&&!overLimit?Math.max(0,5-distinctExtras.length):null;
 const limit=overLimit?0:equippedConfirmed?slotsRemaining:5;
 const balancedPortfolio=composePortfolio(ranked,role,tactic,limit,{
  nativeKeys:[...nativeKeys],equippedKeys:[...used].filter(k=>!nativeKeys.has(k))
 });
 const warnings=[
  ...(unmappedNative.length?['Nativas cadastradas fora do vocabulário de recomendações: '+
   [...new Set(unmappedNative)].slice(0,5).join(', ')+
   '. Isso NÃO prova que essas habilidades estejam ausentes da carta.']:[]),
  ...(overLimit?['Foram informadas mais de cinco habilidades adicionais distintas: revisar no jogo.']:[]),
  ...(unmappedEquipped.length?['Adicionais informadas com nomenclatura não reconhecida: '+
   unmappedEquipped.slice(0,5).join(', ')+
   '. Não confirmar cinco vagas até conferir os nomes no jogo.']:[]),
  ...(nativeManualConflicts.length?['Informadas também como adicionais, mas já aparecem nas nativas cadastradas: '+nativeManualConflicts.join(', ')]:[])
 ];
 return {role,nativeKnown,knownNative:native.length,
  alreadyEquippedProvided:Math.min(5,distinctExtras.length),
  manualReportedCount:distinctExtras.length,nativeManualConflicts,unmappedEquipped,manualOverLimit:overLimit,
  equippedConfirmed,slotsRemaining,
  requiresReconciliation,
  unmappedNativeSkills:unmappedNative.slice(),
  contextualNativeSkills:contextNatives.known.slice(),
  contextualNativeGroups:{...contextNatives.groups},
  contextualEvidence:'nome_cadastrado_sem_efeito_de_gameplay_validado',
  rankedCandidates:Object.freeze(ranked.map(x=>Object.freeze({...x}))),
  recommendations:ranked.slice(0,limit),alternatives:ranked.slice(limit,limit+3),
  balancedPortfolio:Object.freeze({...balancedPortfolio,
   slotCountConfirmed:equippedConfirmed,mayApply:false}),
  synergyDetected:synergy.size>0,
  inference:'CONSULTIVA_SEM_OVR_OU_TESTE_DE_GAMEPLAY',
  perfil:ROLE_LABEL[role]||role,estilos_registrados:style,rankings_condicionais:true,
  nativeCoverage:nativeKnown?(unmappedNative.length?'parcial':contextNatives.known.length?'contextual_sem_efeito_validado':'lista_reconhecida'):'nativas_ausentes',
  slotProof:'somente_confirmacao_do_jogador_e_mesma_edicao',
  investmentEvidence:investment.status,
  investmentApplied:investment.levels!==null,
  tacticalRolePriorities:Object.freeze([...(ROLE_TACTIC_SKILLS[role]?.[tactic]||[])]),
  tacticalReason:TACTIC_REASON[tactic],
  recommendationMode:equippedConfirmed?'comparacao_com_lista_confirmada':
   'ate_cinco_candidatos_sem_slots_comprovados',
  missing:[...(nativeKnown?[]:['Habilidades nativas da edição não documentadas: confirme antes de gastar tokens.']),...warnings]};
}
function booster(d,tactic,engine,verifiedSlot,verifiedEquipped){
 const value=String(d.boost2||d.impeto_extra||'');
 const status=engine?.slotStatus?engine.slotStatus(value):(/^SLOT SELECION[AÁ]VEL/i.test(value)?'selecionavel':'indefinido');
 const position=POSITION[d.role_used]?d.role_used:d.shown_position||d.role_used||d.posicao;
 const natural=String(d.boost1||d.impeto_fixo||'').replace(/\s*\+\d+.*/,'').trim();
 const extra=String(value).replace(/\s*\+\d+.*/,'').trim();
 // V269: nomes PT-BR (inclusive +1/+2), técnicos EN e aliases do motor
 // representam o MESMO ímpeto; o registro na conta jamais reaparece como
 // uma recomendação distinta só por diferença de idioma.
 const validBooster=s=>{
  const name=engine?.boosterName?.(s);
  return name&&Object.hasOwn(engine.BOOSTERS||{},name)?name:
   Object.keys(engine?.BOOSTERS||{}).find(x=>normal(x)===normal(s))||'';
 };
 const knownExtra=validBooster(extra);
 // Apenas um slot confirmado VAZIO pode receber um novo ímpeto.
 // 'ocupado' autoriza comparação, nunca marca a carta como equipável.
 // V262: "PENDENTE / selecionável" classifica-se como POSSÍVEL no motor
 // legado, não como slot documentalmente existente. A conta marcar "vazio"
 // não autoriza gastar token se o catálogo permanece ambíguo.
 const slotSupported=status==='selecionavel';
 const slotEvidence=status==='selecionavel'?'slot_documentado':
  status==='possivel'?'slot_pendente':'sem_slot_documentado';
 const able=slotSupported&&verifiedSlot==='vazio';
 const existing=knownExtra||'';
 const equippedName=validBooster(verifiedEquipped)||'';
 const unavailable=new Set([validBooster(natural),knownExtra,equippedName].filter(Boolean));
 let ranked=[];
 if(engine&&typeof engine.rank==='function'){
  try{ranked=engine.rank({id:d.id,edition:d.edition,base_stats:d.base_stats,
   base_stats_proof:d.base_stats_proof,base_catalog_proof:d.base_catalog_proof,
   posicao:position,estilo_ataque:d.attack_style||d.estilo_ataque,estilo_defesa:d.defence_style||d.estilo_defesa,impeto_fixo:d.boost1||d.impeto_fixo,impeto_extra:value,niveis:d.recommended_levels||d.niveis,
   pp:d.pp,training_provisional:d.training_provisional===true||
    d.treino_proposto_nao_validado===true,
    pp_estimado:d.pp_estimado===true||d.pp_estimated===true,
   habilidades_nativas:d.native_skills||d.habilidades_nativas},tactic).filter(x=>!unavailable.has(x.nome));}catch(e){ranked=[]}
 }
 const note=verifiedSlot==='ausente'?'Você marcou esta carta como sem slot selecionável neste dispositivo. Nenhum ímpeto novo será recomendado.':
 status==='nome_registrado'?'Segundo ímpeto já nomeado no cadastro; não tratar como slot livre ou substituível.':
 status==='possivel'?'SLOT PENDENTE: o acervo diz apenas "PENDENTE / selecionável", não é prova do slot nesta edição. Conferir a carta e conciliar o registro antes de gastar tokens.':
 !slotSupported?'O catálogo não comprova um segundo slot selecionável nesta edição; mesmo que a conta tenha registro de slot vazio, não autorizar gastos sem reconciliar as evidências.':
 verifiedSlot==='ocupado'?'Você confirmou slot ocupado. A opção abaixo é apenas comparação, nunca substituição automática.':
 verifiedSlot==='vazio'?'Slot selecionável no catálogo e vazio confirmado nesta edição; confira os quatro atributos afetados antes de gastar tokens.':
 able?'Slot selecionável indicado no catálogo; confirmação no Plano de Jogo ainda necessária.':
 'Não existe prova documental suficiente de um slot selecionável. Confira no jogo antes de aplicar tokens.';
 // V276: ímpeto fixo não desaparece: medir a SOBREPOSIÇÃO DOS QUATRO
 // atributos com cada alternativa, sem concluir que +1 seria desperdiçado.
 const factory=validBooster(natural);
 const factoryAxes=engine?.BOOSTERS?.[factory]||[];
 const axesOf=name=>engine?.BOOSTERS?.[name]||[];
 const overlapOf=candidate=>{
  const current=axesOf(candidate?.nome);
  const common=current.filter(x=>factoryAxes.includes(x));
  return Object.freeze({technicalName:candidate?.nome||null,
   documentedName:candidate?.nome_pt||candidate?.nome||null,
   shared:common.length,sharedStatKeys:common,
   uniqueStatKeys:current.filter(x=>!factoryAxes.includes(x)),
   factoryDocumented:factoryAxes.length===4,applyAuthorized:false});
 };
 const overlapComparisons=ranked.slice(0,3).map(overlapOf);
 const primaryOverlap=overlapComparisons[0]?.shared??null;
 const complementCandidate=factoryAxes.length===4&&ranked.length?
  ranked.find(candidate=>candidate.score>=ranked[0].score-8&&
   overlapOf(candidate).shared<primaryOverlap):null;
 // Os componentes de score são rastreáveis, não atributos finais.
 const rankedEvidence=Object.freeze(ranked.slice(0,3).map((item,i)=>Object.freeze({
  technicalName:item.nome,displayName:item.nome_pt||item.nome,
  rank:i+1,relativeScore:item.score,
  marginFromFirst:Number((ranked[0].score-item.score).toFixed(2)),
  factors:Object.freeze({
   funcao:item.evidencias?.score_funcao??null,
   investimento:item.evidencias?.score_complemento??null,
   contexto:item.evidencias?.score_contexto??null,
   atributosBase:item.evidencias?.score_base??null
  }),
  trainingStatus:item.evidencias?.pp_status||'pendente',
  baseStatus:item.evidencias?.base_status||'pendente',
  applyAuthorized:false
 })));
 const evidenceWarnings=[];
 if(!factoryAxes.length)evidenceWarnings.push('Ímpeto fixo não identificado: não calcular redundância.');
 if(!slotSupported)evidenceWarnings.push('Segundo slot não comprovado na edição.');
 if(verifiedSlot!=='vazio')evidenceWarnings.push('Vaga real não confirmada como vazia na conta.');
 if(!ranked[0])evidenceWarnings.push('Sem ímpeto compatível para ranquear.');
 else{
  if(ranked[0].evidencias?.pp_status!=='custo_pp_conferido')
   evidenceWarnings.push('Treino individual não homologado; investimento não é evidência de atributo final.');
  if(ranked[0].evidencias?.base_status!=='base_completa_confirmada')
   evidenceWarnings.push('Atributos-base da edição ainda sem comprovação completa.');
  if(ranked.length>1&&ranked[0].score-ranked[1].score<2)
   evidenceWarnings.push('Ímpetos próximos: diferença relativa não comprova superioridade.');
 }
 const complementaryAlternative=complementCandidate?
  Object.freeze({...overlapOf(complementCandidate),relativeScore:complementCandidate.score,
   warning:'Menor sobreposição não prova resultado superior; comparar com a build real.'}):null;
 // O ranking da carta deve existir independentemente da disponibilidade do slot.
 // "primary" é uma prioridade competitiva, NÃO algo equipado ou autorizado.
 return {status,verifiedSlot,slotSupported,slotEvidence,able,knownExtra:existing,confirmedEquipped:equippedName||null,natural,primary:ranked[0]||null,alternatives:ranked.slice(1,3),note,
  decisionEvidence:Object.freeze({
   rankExplanation:'Nota relativa de função, investimento, contexto e base registrada; não é desempenho em jogo.',
   candidates:rankedEvidence,
   warnings:Object.freeze(evidenceWarnings),
   status:able?'ELEGIVEL_SOMENTE_PARA_COMPARACAO':'SEM_AUTORIZACAO_DE_APLICACAO',
   canSpendTokens:false
  }),
  complementarity:Object.freeze({
   factoryName:factory||null,factoryDocumented:factoryAxes.length===4,
   factoryAxes:Object.freeze(factoryAxes.slice()),
   comparisons:Object.freeze(overlapComparisons),
   lowOverlapAlternative:complementaryAlternative,
   explanation:factoryAxes.length===4?
    'Comparação apenas dos quatro atributos afetados por cada tipo de ímpeto.':
    'Ímpeto fixo sem identidade documentada: não calcular sobreposição.'
  }),
  confidence:ranked[0]?.confianca||'sem_base_para_ranquear',
  spread:ranked.length>1?Number((ranked[0].score-ranked[1].score).toFixed(2)):null,
  equipStatus:verifiedSlot==='ausente'?'impossivel_na_conta':status==='nome_registrado'?'comparacao_segundo_fixo':status==='possivel'?'slot_pendente_no_catalogo':!slotSupported?'slot_nao_documentado':verifiedSlot==='ocupado'?'ocupado_na_conta':able?'condicionado_a_slot':'slot_nao_verificado'};
}
// V273: dossiê competitivo de uma edição, sem dependências mutáveis.
// Referências de criadores são critério de rigor; nunca atribuir autoria.
const DOSSIER_TACTICS=Object.freeze(['posse','normal','rapido','fora','longo']);
const PLAYBOOK_ROLE=Object.freeze({
 CA:{task:'Aproveite o espaço liberado pela tabela curta.',support:'Aproxime SA ou MAT antes da recepção.',risk:'Evite girar de costas com o defensor colado.'},
 SA:{task:'Recuar para apoiar os CAs e atacar a segunda bola.',support:'Use a devolução de primeira na zona central.',risk:'Não transforme o SA em ponta aberto por padrão.'},
 MAT:{task:'Receba entre a defesa e os volantes adversários.',support:'Busque triângulos com VOL e CA.',risk:'Sob marcação, devolva antes de tentar girar.'},
 MLG:{task:'Ofereça passe curto atrás do MAT.',support:'Alterne apoio com o primeiro volante.',risk:'Não avance os dois meias sem cobertura.'},
 VOL:{task:'Proteja os zagueiros e inicie o primeiro passe.',support:'Receba orientado e conecte aos meias.',risk:'Não force passes pelo centro contra dois marcadores.'},
 ZG:{task:'Proteja a profundidade e procure saída curta.',support:'Conecte VOL ou lateral defensivo.',risk:'Evite perseguir atacante deixando espaço na zaga.'},
 LD:{task:'Dê opção de passe e mantenha equilíbrio defensivo.',support:'Apoie VOL e meia sem subir simultaneamente ao outro lateral.',risk:'Proteja o corredor quando perder a bola.'},
 LE:{task:'Dê opção de passe e mantenha equilíbrio defensivo.',support:'Apoie VOL e meia sem subir simultaneamente ao outro lateral.',risk:'Proteja o corredor quando perder a bola.'},
 ALA:{task:'Receba e entre por dentro quando houver espaço.',support:'Combine com MAT/SA para liberar passagem central.',risk:'Não dependa de cruzamentos para uma equipe de posse central.'},
 GO:{task:'Leia a pressão antes da reposição.',support:'Priorize o defensor/volante livre para a saída curta.',risk:'Não force passe rasteiro quando a pressão fecha a linha.'}
});
const PLAYBOOK_TACTIC=Object.freeze({
 posse:'Circule com calma, triangule e finalize após criar espaço.',
 normal:'Ao recuperar, prefira o primeiro passe seguro antes de acelerar.',
 rapido:'Explore a desorganização com dois ou três passes objetivos.',
 fora:'Aproxime o apoio do corredor, mas procure entrada por dentro; cruzar é opcional.',
 longo:'Explore a segunda bola com apoio, sem rifar passes curtos livres.'
});
function playbookOf(d,tactic){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Tática inválida no guia');
 const role=roleOf(d),guide=PLAYBOOK_ROLE[role];
 if(!guide)return Object.freeze({role:null,steps:[],warning:'Posição não cadastrada'});
 return Object.freeze({role,tactic,steps:Object.freeze([guide.task,guide.support,PLAYBOOK_TACTIC[tactic]]),
  warning:guide.risk,evidence:'ORIENTACAO_CONDICIONAL_NAO_TESTADA_EM_PARTIDAS'});
}
const archetypeOf=d=>{
 const role=roleOf(d);
 const style=normal([d.attack_style||d.estilo_ataque,
  d.defence_style||d.estilo_defesa].join(' '));
 if(['CA','SA'].includes(role)&&/pivo|homem de area/.test(style))
  return 'Referência de apoio e jogo de costas';
 if(['CA','SA'].includes(role)&&/puxa marcacao|arrastar defesa/.test(style))
  return 'Atacante de apoio e arraste da defesa';
 if(['CA','SA'].includes(role)&&/artilheiro|matador|oportunista/.test(style))
  return 'Finalizador de infiltração e tabelas';
 if(role==='MAT'&&/infiltr|criador de espacos/.test(style))
  return 'Meia de ruptura entre linhas';
 if(['MAT','MLG'].includes(role)&&/armador|orquestrador|classico/.test(style))
  return 'Organizador de circulação e último passe';
 if(role==='MLG'&&/versatil|todo o terreno/.test(style))
  return 'Meia de conexão e recomposição';
 if(role==='VOL'&&/primeiro volante|trinco|destruidor/.test(style))
  return 'Volante de cobertura e primeiro passe';
 if(role==='ZG'&&/construcao de jogo|defensor criativo/.test(style))
  return 'Zagueiro construtor para saída curta';
 if(role==='ZG'&&/destruidor/.test(style))
  return 'Zagueiro de duelo e proteção';
 if(['LD','LE'].includes(role)&&/lateral ofensivo|lateral atacante|lateral movel/.test(style))
  return 'Lateral de apoio e conexão';
 if(['LD','LE'].includes(role)&&/lateral defensivo/.test(style))
  return 'Lateral de cobertura defensiva';
 if(role==='ALA'&&/ala produtivo/.test(style))
  return 'Ala de condução e entrada por dentro';
 if(role==='GO')return 'Goleiro de construção ou defesa, conforme estilo';
 return 'Perfil por função cadastrada, estilo específico pendente';
};
// V278 — plano de investigação conservador. A prioridade é corrigir a PROVA,
// não alterar valores da carta para produzir um resultado aparentemente meta.
function evidenceRoadmap(checks,{creatorSource=null}={}){
 const priority={identidade:1,posicao:2,nativas:3,pp:4,adicionais:5,impeto:6,atributos:7};
 const task={
  identidade:'Localize captura da edição com Card ID e versão exatos.',
  posicao:'Confira as posições eficazes e o treino de posição desta versão no jogo.',
  nativas:'Confira todas as habilidades nativas na captura da mesma edição.',
  pp:'Confira nível máximo, PP disponível e distribuição de treino completa.',
  adicionais:'Confira quais dos cinco slots estão ocupados e reconfirme a lista.',
  impeto:'Confira ímpeto fixo, existência do segundo slot e se ele está vazio.',
  atributos:'Registre atributos-base da edição antes de inferir atributos finais.'
 };
 const missing=checks.filter(x=>!x.ok)
  .sort((a,b)=>priority[a.key]-priority[b.key])
  .map(x=>Object.freeze({key:x.key,action:task[x.key],blocking:true}));
 const source=creatorSource&&typeof creatorSource==='object'?
  creatorSource:null;
 // Uma URL isolada não comprova a mesma carta ou aprovação de criador.
 const hasCreatorCandidate=Boolean(source&&
  typeof source.url==='string'&&/^https:\/\//i.test(source.url));
 return Object.freeze({
  kind:'ROTEIRO_DOCUMENTAL_SEM_ALTERAR_BUILD',
  checked:checks.filter(x=>x.ok).length,total:checks.length,
  missing:Object.freeze(missing),
  firstAction:missing[0]?.action||
   'Rever a edição no jogo e testar a função em partidas antes de aprovar a build.',
  videoSourceCandidate:hasCreatorCandidate,
  sourceStatus:hasCreatorCandidate?'VIDEO_CANDIDATO_NAO_VERIFICADO':
   'VIDEO_EXATO_AINDA_NAO_DOCUMENTADO',
  creatorAttributionAllowed:false,competitiveApproval:false,
  mayWriteTraining:false,maySpendTokens:false
 });
}
// V281: análise de DIFERENÇAS, não otimização por diversidade artificial.
// Dez pares dos cinco estilos do técnico revelam recomendações idênticas
// entre contextos diferentes e explicam quando o acervo não sustenta mudança.
function decisionMatrixFromScenarios(scenarios){
 if(!Array.isArray(scenarios)||scenarios.length!==DOSSIER_TACTICS.length||
  scenarios.some((x,i)=>x.style!==DOSSIER_TACTICS[i]))
  throw Error('Matriz exige exatamente cinco estilos em ordem documentada');
 const rows=scenarios.map(x=>Object.freeze({
  tactic:x.style,topSkill:x.firstSkill||null,topBooster:x.technicalName||null,
  skills:Object.freeze((x.skillKeys||[]).slice()),
  balancedSkills:Object.freeze((x.balancedKeys||[]).slice()),
  skillMargin:x.skillMargin??null,boosterMargin:x.margin??null,
  canEquip:false
 }));
 const pairs=[];
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  const a=rows[i],b=rows[j];
  const aa=new Set(a.skills),bb=new Set(b.skills);
  const union=new Set([...aa,...bb]).size;
  const both=[...aa].filter(x=>bb.has(x)).length;
  pairs.push(Object.freeze({
   first:a.tactic,second:b.tactic,
   sharedSkills:both,totalDistinctSkills:union,
   overlapPercent:union?Math.round(100*both/union):null,
   topSkillSame:Boolean(a.topSkill&&b.topSkill&&a.topSkill===b.topSkill),
   boosterSame:Boolean(a.topBooster&&b.topBooster&&a.topBooster===b.topBooster),
   verdict:!union?'SEM_CANDIDATOS_CONFERIDOS':
    both===union?'LISTAS_IDENTICAS':'LISTAS_DIFERENTES'
  }));
 }
 const topSkills=new Set(rows.map(x=>x.topSkill).filter(Boolean));
 const topBoosters=new Set(rows.map(x=>x.topBooster).filter(Boolean));
 const populated=rows.filter(x=>x.skills.length>0).length;
 const highSimilarity=pairs.filter(x=>x.overlapPercent!==null&&x.overlapPercent>=80).length;
 const identicalLists=pairs.filter(x=>x.verdict==='LISTAS_IDENTICAS').length;
 const risks=[];
 if(populated<5)risks.push('Há estilos sem candidato: não transformar ausência de vaga em habilidade equipável.');
 if(identicalLists>=6)
  risks.push('Listas de habilidades muito parecidas entre estilos; exigir atributos e testes da edição antes de escolher.');
 if(topSkills.size===1&&populated===5)
  risks.push('Primeira habilidade idêntica nos cinco estilos: NÃO é prova de superioridade universal.');
 if(topBoosters.size===1)
  risks.push('Primeiro ímpeto idêntico nos cinco estilos: conferir a função e os quatro atributos da mesma versão.');
 if(rows.some(x=>x.skillMargin!==null&&x.skillMargin<3))
  risks.push('Prioridades de habilidades próximas; ordem não prova eficácia competitiva.');
 if(rows.some(x=>x.boosterMargin!==null&&x.boosterMargin<2))
  risks.push('Ímpetos próximos; não equipar apenas pela diferença de score.');
 return Object.freeze({
  schema:'CRAQUE_V281_CROSS_TACTIC_DIAGNOSTIC',tactics:5,pairCount:pairs.length,
  rows:Object.freeze(rows),pairs:Object.freeze(pairs),
  repeatedPairs:identicalLists,similarPairs80:highSimilarity,
  uniqueFirstSkills:topSkills.size,uniqueFirstBoosters:topBoosters.size,
  warnings:Object.freeze(risks),
  interpretation:'Sem OVR, gameplay medido, autoria de criador ou eficácia provada.',
  canModifyBuild:false,canEquipSkills:false,canEquipBooster:false
 });
}
// V282: impressão DIGITAL DE EVIDÊNCIA, não hash de identidade autorizado
// para mesclar cartas. Duas cartas podem recomendar a mesma skill por
// caminhos diferentes; isso exige revisão de fontes, jamais diversidade forçada.
function individualEvidenceProfile(d,tactic,engine,manualEquipped='',opts={}){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Estilo inválido na ficha individual');
 const skills=evaluate(d,tactic,manualEquipped,{equippedConfirmed:opts.equippedConfirmed===true});
 const boost=booster(d,tactic,engine,opts.verifiedSlot,opts.verifiedBooster);
 const training=investmentAudit(d);
 const native=splitSkills(d.native_skills||d.habilidades_nativas||'');
 const nativeProfile=contextNativeProfile(native);
 const nativeIdentity=fingerprint(native.join(';'));
 const role=skills.role||null;
 const style=normal([d.playing_style,d.attack_style,d.defence_style,
  d.estilo_ataque,d.estilo_defesa].filter(Boolean).join(' '));
 const recommended=Object.freeze(skills.recommendations.map(x=>Object.freeze({
  key:x.key,name:x.name,score:x.score,
  margin:x.marginToNext,criteria:Object.freeze({...x.criterios}),
  provenance:Object.freeze({
   functionScore:x.criterios.funcao,tacticScore:x.criterios.tatica,
   styleScore:x.criterios.estilo,nativeScore:x.criterios.nativas,
   investmentScore:x.criterios.investimento
  }),
  status:'SUGESTAO_SEM_HOMOLOGACAO'
 })));
 const proof=Object.freeze({
  cardId:String(d.id||''),edition:String(d.edition||d.versao||''),
  capture:Number(d.capture??d.numero),role,style,tactic,
  originalPosition:String(d.original_position||d.posicao_original||d.shown_position||d.posicao||''),
  usedPosition:String(d.role_used||d.shown_position||d.posicao||''),
  nativeFingerprint:nativeIdentity,
  nativeCount:native.length,unmappedNativeCount:nativeProfile.unknown.length,
  contextualNativeCount:nativeProfile.known.length,
  pp:d.pp===null||d.pp===undefined||d.pp===''?null:(Number.isInteger(Number(d.pp))?Number(d.pp):null),
  progressStatus:training.status,progressVector:training.levels?Object.freeze([...training.levels]):null,
  ppEstimated:d.pp_estimado===true,
  equippedProof:skills.equippedConfirmed,boosterSlotProof:boost.able
 });
 const missing=[];
 if(!proof.cardId||!proof.edition)missing.push('Identidade da edição não completa.');
 if(!native.length||nativeProfile.unknown.length)missing.push('Habilidades nativas incompletas ou sem interpretação.');
 if(training.levels===null)missing.push('Vetor de treino não validado no orçamento PP.');
 if(proof.ppEstimated)missing.push('Orçamento PP estimado, sem confirmação.');
 if(!skills.equippedConfirmed)missing.push('Lista de habilidades adicionais não confirmada.');
 if(!boost.able)missing.push('Segundo slot de ímpeto não documentado como livre.');
 if(!d.base_stats_proof?.confirmed_in_game)missing.push('Atributos-base não validados na mesma edição.');
 return Object.freeze({
  schema:'CRAQUE_V282_PERFIL_EVIDENCIA_INDIVIDUAL',
  proof,recommendations:recommended,
  suggestedSkillKeys:Object.freeze(recommended.map(x=>x.key)),
  balancedSkillKeys:Object.freeze(skills.balancedPortfolio.candidates.map(x=>x.key)),
  firstBooster:boost.primary?.nome||null,
  boosterMargin:boost.spread,
  missing:Object.freeze(missing),
  verdict:'PARECER_DOCUMENTAL_CONSULTIVO',
  mayChangeBuild:false,maySpendTokens:false,
  verifiedCreatorBuild:false,verifiedGameplay:false
 });
}
function compareIndividualEvidence(left,right,tactic,engine){
 const a=individualEvidenceProfile(left,tactic,engine);
 const b=individualEvidenceProfile(right,tactic,engine);
 const ap=a.proof,bp=b.proof;
 const changed=[];
 const examine=(field,label,leftValue,rightValue)=>{
  if(JSON.stringify(leftValue)!==JSON.stringify(rightValue))
   changed.push(Object.freeze({field,label,left:leftValue,right:rightValue}));
 };
 examine('role','Função tática',ap.role,bp.role);
 examine('playingStyle','Estilo ofensivo/defensivo',ap.style,bp.style);
 examine('native','Habilidades nativas originais',ap.nativeFingerprint,bp.nativeFingerprint);
 examine('training','Vetor de treino com PP conferido',ap.progressVector,bp.progressVector);
 examine('pp','Orçamento de PP',ap.pp,bp.pp);
 examine('edition','Edição da carta',ap.edition,bp.edition);
 const topSame=a.suggestedSkillKeys.join('|')===b.suggestedSkillKeys.join('|')&&
  a.suggestedSkillKeys.length>0;
 const boosterSame=Boolean(a.firstBooster&&b.firstBooster&&a.firstBooster===b.firstBooster);
 const differentEvidence=changed.some(x=>['role','playingStyle','native','training','pp'].includes(x.field));
 const assessment=!a.suggestedSkillKeys.length||!b.suggestedSkillKeys.length?
  'SEM_CANDIDATOS_COMPARAVEIS':
  topSame&&differentEvidence?'MESMAS_SKILLS_EVIDENCIAS_DIFERENTES_REVISAR':
  topSame?'MESMAS_SKILLS_PERFIL_SEM_DIVERGENCIA_COMPROVADA':
  'RECOMENDACOES_DISTINTAS';
 return Object.freeze({
  schema:'CRAQUE_V282_COMPARATIVO_SEM_CLONE_FORCADO',
  left:Object.freeze({cap:ap.capture,id:ap.cardId,edition:ap.edition}),
  right:Object.freeze({cap:bp.capture,id:bp.cardId,edition:bp.edition}),
  tactic,assessment,topFiveIdentical:topSame,
  firstBoosterIdentical:boosterSame,
  evidenceDeltas:Object.freeze(changed),
  reviewRequired:topSame&&differentEvidence,
  warning:'Semelhança não comprova erro de build; validar Card ID, atributos-base e testes da mesma edição.',
  canApply:false,canChangeTraining:false
 });
}
// V282: decompor como a escolha do técnico alterou os cinco CRITÉRIOS
// de uma skill, sem confundir ausência no top-8 com pontuação zero.
function tacticalSkillDelta(d,first,second){
 if(!DOSSIER_TACTICS.includes(first)||!DOSSIER_TACTICS.includes(second))
  throw Error('Comparação exige dois estilos conhecidos');
 const a=evaluate(d,first),b=evaluate(d,second);
 const collect=result=>new Map([...result.recommendations,...result.alternatives].map(x=>[x.key,x]));
 const left=collect(a),right=collect(b);
 const keys=[...new Set([...a.recommendations.map(x=>x.key),
  ...b.recommendations.map(x=>x.key)])];
 const lines=keys.map(key=>{
  const x=left.get(key),y=right.get(key);
  const fields=['funcao','tatica','estilo','nativas','investimento'];
  const factors=Object.fromEntries(fields.map(field=>[field,Object.freeze({
   first:x?.criterios?.[field]??null,second:y?.criterios?.[field]??null,
   delta:x&&y?y.criterios[field]-x.criterios[field]:null
  })]));
  return Object.freeze({
   key,name:x?.name||y?.name||key,
   firstRank:a.recommendations.findIndex(z=>z.key===key)+1||null,
   secondRank:b.recommendations.findIndex(z=>z.key===key)+1||null,
   firstScore:x?.score??null,secondScore:y?.score??null,
   scoreDelta:x&&y?y.score-x.score:null,
   factors:Object.freeze(factors),comparable:Boolean(x&&y),
   caveat:x&&y?'Diferença da fórmula documentada, não ganho no jogo.':
    'Fora do conjunto de até oito opções de um estilo; não inferir nota zero.'
  });
 });
 return Object.freeze({
  schema:'CRAQUE_V282_DELTA_TATICO',
  first,second,
  firstTop:a.recommendations[0]?.key||null,
  secondTop:b.recommendations[0]?.key||null,
  sameFirst:!!a.recommendations[0]&&a.recommendations[0].key===b.recommendations[0]?.key,
  rows:Object.freeze(lines),
  interpretation:'Valores relativos e rastreáveis, sem alteração de habilidade equipada.',
  changesAuthorized:false
 });
}
function evidenceDossier(d,tactic,engine,manualEquipped='',opts={}){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Tática não reconhecida');
 const skills=evaluate(d,tactic,manualEquipped,{
  equippedConfirmed:opts.equippedConfirmed===true
 });
 const boosters=booster(d,tactic,engine,opts.verifiedSlot,opts.verifiedBooster);
 const edition=String(d.edition||d.versao||'');
 const id=String(d.id||'');
 const identity=Boolean(id.trim()&&edition.trim()&&
  !/pendente|confirmar|invalid|desconhecid|nao informado/i.test(id+' '+edition));
 const warnings=[];
 const original=String(d.original_position||d.posicao_original||d.shown_position||d.posicao||'');
 const requested=String(d.role_used||d.shown_position||original);
 const position=roleOf(d);
 const roleApproved=(POSITION[requested]||requested)===(POSITION[original]||original)||
  opts.roleConfirmed===true; // não presumir proficiência treinada
 const training=investmentAudit(d);
 const individualProfile=individualEvidenceProfile(d,tactic,engine,manualEquipped,opts);
 if(!identity)warnings.push('Conferir Card ID e versão exatos antes de comparar.');
 if(!skills.nativeKnown)warnings.push('Conferir lista de habilidades nativas da versão.');
 else if(skills.unmappedNativeSkills.length)
  warnings.push('Há '+skills.unmappedNativeSkills.length+
   ' habilidade(s) nativa(s) ainda sem interpretação do motor. Não assumir ausência.');
 if(training.levels===null)
  warnings.push('Conferir vetor de treino e custo PP com a mesma edição. Não propor substituição.');
 if(!roleApproved)warnings.push('Proficiência da posição utilizada ainda não confirmada.');
 if(!skills.equippedConfirmed)warnings.push('Conferir lista integral dos cinco slots de habilidade.');
 if(!boosters.able)warnings.push('Conferir elegibilidade e estado do segundo slot de ímpeto.');
 if(skills.requiresReconciliation)warnings.push('Resolver conflito de nomes/equipamentos antes de gastar fichas.');
 const gap=boosters.spread;
 if(gap!==null&&gap<2)
  warnings.push('Ímpetos com pontuação próxima: só selecionar após comparação real da edição.');
 const base=engine?.baseStatsAudit?.({
  id,versao:edition,base_stats:d.base_stats,
  base_stats_proof:d.base_stats_proof,base_catalog_proof:d.base_catalog_proof
 });
 if(base?.status!=='base_completa_confirmada')
  warnings.push('Atributos-base completos não confirmados: não alegar build meta ou status final.');
 // V275: checklist CADASTRAL; não é indicador meta ou teste em partidas.
 const checks=Object.freeze([
  {key:'identidade',ok:identity,label:'Card ID e edição identificáveis'},
  {key:'posicao',ok:roleApproved,label:'Posição nativa ou doutrinação confirmada'},
  {key:'nativas',ok:skills.nativeKnown&&!skills.unmappedNativeSkills.length,
   label:'Nativas catalogadas sem nomes desconhecidos'},
  {key:'pp',ok:training.levels!==null,label:'PP e vetor coerentes e não provisórios'},
  {key:'adicionais',ok:skills.equippedConfirmed,label:'Cinco slots de adicionais conferidos nesta edição'},
  {key:'impeto',ok:boosters.able,label:'Slot selecionável e vazio comprovado na conta'},
  {key:'atributos',ok:base?.status==='base_completa_confirmada',
   label:'Atributos-base com fonte da edição'}
 ]);
 const checksReady=checks.filter(c=>c.ok).length;
 const roadmap=evidenceRoadmap(checks,{creatorSource:opts.creatorSource});
 const scenarios=Object.freeze(DOSSIER_TACTICS.map(style=>{
  const result=evaluate(d,style,manualEquipped,{
   equippedConfirmed:opts.equippedConfirmed===true
  });
  const ranked=booster(d,style,engine,opts.verifiedSlot,opts.verifiedBooster);
  return Object.freeze({
   style,skills:result.recommendations.map(x=>x.name),
   skillKeys:Object.freeze(result.recommendations.map(x=>x.key)),
   balancedKeys:Object.freeze(result.balancedPortfolio.candidates.map(x=>x.key)),
   skillMargin:result.recommendations[0]?.marginToNext??null,
   firstSkill:result.recommendations[0]?.name||null,
   booster:ranked.primary?.nome_pt||ranked.primary?.nome||null,
   technicalName:ranked.primary?.nome||null,
   margin:ranked.spread,
   confidence:ranked.confidence,
   equipAuthorized:false
  });
 }));
 const decisionMatrix=decisionMatrixFromScenarios(scenarios);
 const uniqueTopSkills=[...new Set(scenarios.map(x=>x.firstSkill).filter(Boolean))];
 const uniqueBoosters=[...new Set(scenarios.map(x=>x.technicalName).filter(Boolean))];
 const tacticalStability=Object.freeze({
  tacticsCompared:scenarios.length,
  topSkillVariations:uniqueTopSkills.length,
  boosterVariations:uniqueBoosters.length,
  skillIdenticalInFive:uniqueTopSkills.length===1,
  boosterIdenticalInFive:uniqueBoosters.length===1,
  interpretation:'Comparação de rankings, não prova de eficácia em campo'
 });
 return Object.freeze({
  schema:'CRAQUE_DOSSIER_COMPETITIVO_V273',
  cap:Number(d.capture??d.numero),cardId:id,edition,role:position,
  roleLabel:ROLE_LABEL[position]||'Não reconhecido',
  originalPosition:original,positionUsed:requested,roleApproved,
  archetype:archetypeOf(d),style:tactic,identityConfirmed:identity,
  nativeCoverage:skills.nativeCoverage,unmappedNative:skills.unmappedNativeSkills.slice(),
  contextualNatives:skills.contextualNativeSkills.map(x=>({...x})),
  trainingStatus:training.status,sourceConfirmed:false,
  trainingCategories:training.levels?[
   'Chute','Passe','Drible','Destreza','Força inferior','Jogo aéreo',
   'Defesa','Goleiro 1','Goleiro 2','Goleiro 3'
  ].map((name,i)=>({name,level:training.levels[i]})):[],
  skillCandidateCount:skills.recommendations.length,
  tacticalReason:skills.tacticalReason,
  tacticalPriorities:skills.tacticalRolePriorities.map(k=>SKILLS[k]?.name||k),
  skillCandidates:skills.recommendations.map(x=>Object.freeze({
   key:x.key,name:x.name,score:x.score,criteria:{...x.criterios},
   documentReason:x.synergies.slice()
  })),
  skillSlotsVerified:skills.equippedConfirmed,
  boosterName:boosters.primary?.nome_pt||boosters.primary?.nome||null,
  boosterMargin:gap,boosterSlotVerified:boosters.able,
  boosterComplementarity:boosters.complementarity,
  boosterDecisionEvidence:boosters.decisionEvidence,
  skillFamilyEvidence:Object.freeze({
   nativeFamilies:Object.freeze({...skills.balancedPortfolio.nativeFamilyCounts}),
   equippedFamilies:Object.freeze({...skills.balancedPortfolio.equippedFamilyCounts}),
   proposedFamilies:Object.freeze({...skills.balancedPortfolio.families}),
   balancedCandidates:Object.freeze(skills.balancedPortfolio.candidates.map(x=>Object.freeze({
    name:x.name,family:x.family,score:x.relativeScore,evidence:{...x.evidence}
   }))),
   applyAuthorized:false
  }),
  boosterAlternatives:boosters.alternatives.map(x=>Object.freeze({
   name:x.nome_pt||x.nome,score:x.score
  })),
  evidencePending:warnings,scenarios,decisionMatrix,
  individualProfile,
  tacticCounterfactuals:Object.freeze(DOSSIER_TACTICS
   .filter(x=>x!==tactic).map(x=>tacticalSkillDelta(d,tactic,x))),
  playbook:playbookOf(d,tactic),
  evidenceChecklist:checks,roadmap,documentedIndicators:checksReady,
  totalIndicators:checks.length,tacticalStability,
  auditLabel:checksReady===checks.length?
   'Cadastro completo nos critérios locais; validação competitiva externa ainda pendente':
   'Cadastro parcial: '+(checks.length-checksReady)+' confirmação(ões) pendente(s)',
  sourcePublication:null,creatorVerified:false,realMatchValidated:false,
  competitivelyApproved:false,maySpendTokensAutomatically:false,
  note:'Não é ficha de Rentão/Blackjhon sem Card ID e vídeo exatos; análise heurística condicional.'
 });
}
const tacticLabelFor=t=>({
 posse:'Posse de Bola',normal:'Contra-Ataque Normal',rapido:'Contra-Ataque Rápido',
 fora:'Por Fora',longo:'Passe Longo'
})[t]||t;
const USER_SLOT_NOTES=Object.freeze({
 24:'Cristiano Ronaldo Big Time #024: o usuário relata dois ímpetos embutidos, sem edição; preservar ambos.',
 81:'Rivaldo Big Time #081: o usuário relata um único ímpeto fixo; o nome ainda precisa de validação na carta.',
 172:'Courtois #172: o usuário relata um espaço selecionável; o banco não confirma o slot. Conferir no jogo.',
 236:"Eto'o #236: o usuário relata ímpeto fixo e outro selecionável; nome e edição seguem pendentes."
});
// V283 — testar se o ranking muda quando sinais reais são retirados,
// sem simular atributos finais, criar cartas ou autorizar equipamento.
function evidenceSensitivityV283(d,tactic,engine){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Tática inválida na sensibilidade V283');
 const original=individualEvidenceProfile(d,tactic,engine);
 const variants=[
  {factor:'nativas',label:'Sem sinais das habilidades nativas',
   card:{...d,native_skills:'',habilidades_nativas:''}},
  {factor:'treino',label:'Sem distribuição de PP',
   card:{...d,recommended_levels:null,niveis:null,
    training_provisional:true,treino_proposto_nao_validado:true}}
 ];
 const asKeys=p=>p.suggestedSkillKeys.join('|');
 const comparisons=variants.map(v=>{
  const scenario=individualEvidenceProfile(v.card,tactic,engine);
  const allKeys=[...original.suggestedSkillKeys,...scenario.suggestedSkillKeys];
  const changedSkillPositions=Math.max(
   original.suggestedSkillKeys.length,scenario.suggestedSkillKeys.length)-
   allKeys.filter((_,i)=>original.suggestedSkillKeys[i]===scenario.suggestedSkillKeys[i]&&i<original.suggestedSkillKeys.length).length;
  return Object.freeze({
   factor:v.factor,label:v.label,
   originalTopFive:Object.freeze(original.suggestedSkillKeys.slice()),
   scenarioTopFive:Object.freeze(scenario.suggestedSkillKeys.slice()),
   skillsChanged:asKeys(original)!==asKeys(scenario),changedSkillPositions,
   originalBooster:original.firstBooster||null,
   scenarioBooster:scenario.firstBooster||null,
   boosterChanged:(original.firstBooster||null)!==(scenario.firstBooster||null),
   mayApply:false});
 });
 const proof=original.proof,alerts=[];
 if(!proof.cardId||!proof.edition||!Number.isInteger(proof.capture))
  alerts.push('CAP, Card ID ou edição ausentes.');
 if(!proof.nativeCount||proof.unmappedNativeCount)
  alerts.push('Habilidades nativas ausentes ou parcialmente interpretadas.');
 if(proof.progressStatus!=='investimento_matematico')
  alerts.push('Treino não utilizável para calcular atributos finais.');
 if(proof.ppEstimated)alerts.push('PP ainda estimados.');
 if(!proof.equippedProof)alerts.push('Cinco slots de adicionais não reconfirmados nesta edição.');
 if(!proof.boosterSlotProof)alerts.push('Slot de ímpeto não confirmado na edição e na conta.');
 if(comparisons.some(x=>x.skillsChanged||x.boosterChanged))
  alerts.push('Prioridades mudam sem algumas evidências: conferir fontes da carta.');
 return Object.freeze({
  schema:'CRAQUE_V283_SENSIBILIDADE_EVIDENCIAS',
  identity:Object.freeze({capture:proof.capture,cardId:proof.cardId,edition:proof.edition}),
  tactic,sourceTopFive:Object.freeze(original.suggestedSkillKeys.slice()),
  sourceBooster:original.firstBooster||null,
  comparisons:Object.freeze(comparisons),warnings:Object.freeze(alerts),
  changesAuthorized:false,equipAuthorized:false,creatorApproval:false,
  meaning:'Retirar sinais mede sensibilidade da heurística, não rendimento, ganho numérico ou aprovação de criador.'
 });
}
// V284 — laboratório comparativo de decisões em cada edição.
 // Não converte score em eficácia, não cria PP, slot ou aprovação de criador.
function competitiveDecisionBoardV284(d,tactic,engine,manualEquipped='',opts={}){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Tática inválida V284');
 const cap=Number(d.capture??d.numero),id=String(d.id||''),edition=String(d.edition||d.versao||'');
 const result=evaluate(d,tactic,manualEquipped,{equippedConfirmed:opts.equippedConfirmed===true});
 const boost=booster(d,tactic,engine,opts.verifiedSlot,opts.verifiedBooster);
 const training=investmentAudit(d);
 const native=splitSkills(d.native_skills||d.habilidades_nativas||'');
 const nativeKeys=new Set(native.map(keyFor).filter(Boolean));
 const original=String(d.original_position||d.posicao_original||d.posicao||d.shown_position||'');
 const used=String(d.role_used||d.shown_position||d.posicao||'');
 const alternate=normal(original)!==normal(used);
 const identityOK=Number.isInteger(cap)&&cap>=1&&Boolean(id.trim()&&edition.trim())&&
  !/pendente|confirmar|desconhecid|invalid/i.test(id+' '+edition);
 const base=engine?.baseStatsAudit?.({
  id,versao:edition,base_stats:d.base_stats,
  base_stats_proof:d.base_stats_proof,base_catalog_proof:d.base_catalog_proof
 })||{status:'base_nao_documentada'};
 const nativeFamilies={};
 for(const key of nativeKeys){
  const family=SKILL_FAMILY[key];
  if(family)nativeFamilies[family]=(nativeFamilies[family]||0)+1;
 }
 const list=result.recommendations||[];
 const alternatives=(result.alternatives||[]).slice(0,3);
 const skills=Object.freeze(list.slice(0,5).map((item,i)=>{
  const family=SKILL_FAMILY[item.key]||'nao_classificada';
  const relativeGap=i+1<list.length?Number((item.score-list[i+1].score).toFixed(2)):null;
  const factor=item.criterios||{};
  const explanation=[
   'Função '+(result.role||'pendente')+' em '+TACTIC_REASON[tactic],
   'Família '+family+'; prioridade relativa '+(i+1)+'.',
   factor.estilo>0?'Estilo registrado contribuiu para a prioridade.':'Sem bônus contextual do estilo.',
   factor.nativas>0?'Complementaridade com habilidades nativas catalogadas.':'Sem sinal adicional das nativas nessa candidata.',
   factor.investimento>0?'Vetor de PP coerente influenciou apenas como investimento.':'PP não utilizados para reforçar esta habilidade.',
   nativeFamilies[family]?'Há habilidade nativa da mesma família; não significa duplicata.':'Nenhuma nativa dessa família foi reconhecida.',
   relativeGap!==null&&relativeGap<3?'Diferença estreita: não inferir superioridade em jogo.':'Ranking heurístico; não representa teste de partidas.'
  ];
  return Object.freeze({
   key:item.key,name:item.name,rank:i+1,family,
   score:item.score,marginToNext:relativeGap,
   factors:Object.freeze({...factor}),
   factorSum:Number(Object.values(factor).reduce((s,n)=>s+Number(n||0),0).toFixed(2)),
   nativeFamilyCount:nativeFamilies[family]||0,
   synergy:Object.freeze((item.synergies||[]).slice()),
   explanation:Object.freeze(explanation),
   status:'RECOMENDACAO_CALCULADA_NAO_EQUIPADA',canEquip:false
  });
 }));
 const alternativeSkills=Object.freeze(alternatives.map(item=>Object.freeze({
  key:item.key,name:item.name,score:item.score,family:SKILL_FAMILY[item.key]||'nao_classificada',
  gapFromFirst:list[0]?Number((list[0].score-item.score).toFixed(2)):null,
  warning:'Alternativa consultiva; posição não é comprovação de inferioridade.'
 })));
 const balanced=Object.freeze(result.balancedPortfolio.candidates.map(x=>Object.freeze({
  key:x.key,name:x.name,family:x.family,score:x.relativeScore,
  reason:x.explanation,canApply:false
 })));
 const setA=new Set(skills.map(x=>x.key)),setB=new Set(balanced.map(x=>x.key));
 const shared=[...setA].filter(x=>setB.has(x)).length;
 const topBoost=[boost.primary,...boost.alternatives].filter(Boolean).slice(0,3);
 const factory=boost.complementarity.factoryAxes||[];
 const boosters=Object.freeze(topBoost.map((b,i)=>{
  const axes=engine?.BOOSTERS?.[b.nome]||[];
  const sharedAxes=axes.filter(a=>factory.includes(a));
  const evidence=b.evidencias||{};
  return Object.freeze({
   key:b.nome,name:b.nome_pt||b.nome,rank:i+1,score:b.score,
   axes:Object.freeze((b.atributos||[]).slice()),
   affectedKeys:Object.freeze(axes.slice()),sharedWithFixed:sharedAxes.length,
   sharedKeys:Object.freeze(sharedAxes),fixedKnown:factory.length===4,
   factors:Object.freeze({
    function:Number(evidence.score_funcao||0),training:Number(evidence.score_complemento||0),
    context:Number(evidence.score_contexto||0),base:Number(evidence.score_base||0)
   }),
   baseStatus:evidence.base_status||'pendente',trainingStatus:evidence.pp_status||'pendente',
   comparisonGap:topBoost[0]?Number((topBoost[0].score-b.score).toFixed(2)):null,
   explanation:factory.length===4?
    'Comparação dos quatro atributos com ímpeto fixo; sobreposição não é desperdício.':
    'Ímpeto fixo não identificado; não calcular ganho por sobreposição.',
   canSpendTokens:false,canApply:false
  });
 }));
 const gaps=[];
 if(!identityOK)gaps.push({key:'identidade',action:'Conferir captura, Card ID e edição.'});
 if(alternate&&opts.roleConfirmed!==true)
  gaps.push({key:'posicao',action:'Confirmar proficiência da posição alternativa.'});
 if(!native.length||result.unmappedNativeSkills?.length)
  gaps.push({key:'nativas',action:'Conferir nativas e especiais da mesma edição.'});
 if(!training.levels)
  gaps.push({key:'pp',action:'Conferir nível máximo, PP de origem e distribuição registrada.'});
 if(base.status!=='base_completa_confirmada')
  gaps.push({key:'base',action:'Anexar atributos-base e fonte da edição exata.'});
 if(!result.equippedConfirmed)
  gaps.push({key:'adicionais',action:'Conferir TODOS os cinco slots de habilidades adicionais.'});
 if(!boost.able)
  gaps.push({key:'impeto',action:'Conferir existência e estado do segundo slot no jogo.'});
 gaps.push({key:'gameplay',action:'Comparar partidas controladas e vídeo da mesma edição; sem atribuir autoria.'});
 return Object.freeze({
  schema:'CRAQUE_V284_LABORATORIO_DECISAO',
  identity:Object.freeze({capture:cap,cardId:id,edition,originalPosition:original,
   usedPosition:used,alternatePosition:alternate,
   roleEvidence:alternate?(opts.roleConfirmed===true?'CONFIRMADA_PELO_USUARIO':'PENDENTE'):'POSICAO_CADASTRADA'}),
  tactic,role:result.role||null,archetype:archetypeOf(d),
  evidence:Object.freeze({
   identity:identityOK?'CADASTRO_IDENTIFICADO':'PENDENTE',
   natives:native.length&&!(result.unmappedNativeSkills||[]).length?
    'NOMES_CADASTRADOS':'PENDENTE',
   training:training.status,
   base:base.status,
   equipped:result.equippedConfirmed?'LISTA_CONFERIDA_NA_CONTA':'SLOTS_DESCONHECIDOS',
   secondBooster:boost.able?'INDICADO_E_VAZIO_CONFERIDO':'NAO_CONFERIDO',
   gameplay:'SEM_TESTE_COMPARATIVO_COMPROVADO'
  }),
  skills,alternativeSkills,
  portfolio:Object.freeze({balanced,sharedWithPrimary:shared,
   mainCount:skills.length,balancedCount:balanced.length,
   divergent:skills.map(x=>x.key).join('|')!==balanced.map(x=>x.key).join('|'),
   meaning:'Duas estratégias de seleção para comparação; não são cinco slots livres.'}),
  boosters,boosterEligibility:Object.freeze({
   catalogSlot:boost.slotEvidence,manualSlot:boost.verifiedSlot||'nao_confirmado',
   canSpendTokens:false,fixed:boost.complementarity.factoryName||null
  }),
  pending:Object.freeze(gaps.map(x=>Object.freeze(x))),
  checks:Object.freeze({skillNamesUnique:new Set(skills.map(x=>x.key)).size===skills.length,
   boosterAllFourAxes:boosters.every(x=>x.affectedKeys.length===4),
   evidenceCount:gaps.length-1}),
  noAutomaticApplication:true,mayModifyTraining:false,maySpendTokens:false,
  creatorEndorsement:false,gameplayValidated:false,
  disclaimer:'Rankings são heurísticos e específicos aos registros desta edição; não comprovam desempenho, atributos finais nem autoria.'
 });
}

// V285 — segunda opinião competitiva, NÃO mais uma ficha ou build gravada.
// Mede individualização, sensibilidade e custo de oportunidade por edição.
function competitiveQualityLabV285(d,tactic,engine,manualEquipped='',opts={}){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Tática V285 inválida');
 const board=competitiveDecisionBoardV284(d,tactic,engine,manualEquipped,opts);
 const original=evaluate(d,tactic,manualEquipped,{
  equippedConfirmed:opts.equippedConfirmed===true
 });
 const own=Object.freeze({
  id:String(d.id||''),edition:String(d.edition||d.versao||''),
  capture:Number(d.capture??d.numero),
  position:board.identity.usedPosition,role:board.role
 });
 const skills=splitSkills(d.native_skills||d.habilidades_nativas||'');
 const nativeProfile=contextNativeProfile(skills);
 const hasSource=skills.length>0&&nativeProfile.unknown.length===0;
 const variants=[
  {key:'sem_nativas',label:'Sem habilidades nativas',isPresent:skills.length>0,
   data:{...d,native_skills:'',habilidades_nativas:''}},
  {key:'sem_pp',label:'Sem vetor PP',isPresent:board.evidence.training==='investimento_matematico',
   data:{...d,recommended_levels:null,niveis:null,
    training_provisional:true,treino_proposto_nao_validado:true}},
  {key:'sem_estilo',label:'Sem estilo ofensivo/defensivo',isPresent:Boolean(
   String(d.playing_style||d.attack_style||d.defence_style||d.estilo_ataque||d.estilo_defesa||'').trim()),
   data:{...d,playing_style:'',attack_style:'',defence_style:'',
    estilo_ataque:'',estilo_defesa:''}}
 ];
 const originalFive=original.recommendations.slice(0,5).map(x=>x.key);
 const originalBoost=board.boosters[0]?.key||null;
 const cleanList=arr=>arr.slice(0,5).map(x=>x.key);
 const tests=Object.freeze(variants.map(variant=>{
  if(!variant.isPresent)return Object.freeze({
   factor:variant.key,label:variant.label,tested:false,
   reason:'Sinal não documentado ou matematicamente indisponível; não há remoção válida para testar.',
   changedSkills:0,changedBooster:false,unchangedPositions:null,
   chosenMoves:Object.freeze([]),boosterBefore:originalBoost,boosterAfter:null,
   mayChangeBuild:false
  });
  const evaluated=evaluate(variant.data,tactic,manualEquipped,{
   equippedConfirmed:opts.equippedConfirmed===true
  });
  const after=cleanList(evaluated.recommendations);
  const differences=[];
  for(let i=0;i<Math.max(originalFive.length,after.length);i++){
   if(originalFive[i]!==after[i])differences.push(Object.freeze({
    position:i+1,before:originalFive[i]||null,after:after[i]||null
   }));
  }
  const rebuilt=booster(variant.data,tactic,engine,opts.verifiedSlot,opts.verifiedBooster);
  const next=rebuilt.primary?.nome||null;
  return Object.freeze({
   factor:variant.key,label:variant.label,tested:true,
   reason:'Experimento de remoção de entrada; não mede rendimento real.',
   changedSkills:differences.length,changedBooster:originalBoost!==next,
   unchangedPositions:5-differences.length,
   chosenMoves:Object.freeze(differences),boosterBefore:originalBoost,
   boosterAfter:next,mayChangeBuild:false
  });
 }));
 const rotation=Object.freeze(DOSSIER_TACTICS.map(style=>{
  const curr=evaluate(d,style,manualEquipped,{
   equippedConfirmed:opts.equippedConfirmed===true
  });
  const boost=booster(d,style,engine,opts.verifiedSlot,opts.verifiedBooster);
  const top=curr.recommendations.slice(0,5).map(x=>x.key);
  const topSet=new Set(top);
  return Object.freeze({tactic:style,label:engine?.TACTIC_LABEL?.[style]||style,
   role:curr.role,skills:Object.freeze(top),booster:boost.primary?.nome||null,
   overlapsWithSelected:originalFive.filter(k=>topSet.has(k)).length,
   sameOrder:top.join('|')===originalFive.join('|'),
   mayApply:false
  });
 }));
 const pairs=[];
 for(let i=0;i<rotation.length;i++)for(let j=i+1;j<rotation.length;j++){
  const x=rotation[i],y=rotation[j];
  pairs.push(Object.freeze({
   first:x.tactic,second:y.tactic,
   sameFiveInOrder:x.skills.join('|')===y.skills.join('|'),
   sharedFive:x.skills.filter(k=>y.skills.includes(k)).length,
   sameBooster:x.booster===y.booster
  }));
 }
 const duplicates=pairs.filter(p=>p.sameFiveInOrder).length;
 const nativeNames=new Set(skills.map(keyFor).filter(Boolean));
 const main=Object.freeze(board.skills.map((skill,i)=>{
  const definition=SKILLS[skill.key]||{};
  const next=board.skills[i+1]||board.alternativeSkills[0]||null;
  const gap=next?Number((skill.score-next.score).toFixed(2)):null;
  const bestFamily=skill.family;
  const selected=rotation.filter(r=>r.skills.includes(skill.key)).map(r=>r.tactic);
  const relevance=selected.length===5?'constante_nos_cinco_estilos':
   selected.length>1?'comum_a_multiplos_estilos':'mais_especifica_de_estilo';
  const nativeSignal=skill.factors.nativas||0;
  const missingEvidence=[];
  if(!hasSource)missingEvidence.push('nativas incompletas ou sem interpretação');
  if(board.evidence.training!=='investimento_matematico')missingEvidence.push('treino individual não comprovado');
  if(board.evidence.equipped!=='LISTA_CONFERIDA_NA_CONTA')missingEvidence.push('cinco slots não conferidos');
  const competitor=next?Object.freeze({
   key:next.key,name:next.name,difference:gap,
   verdict:gap<3?'PRIORIDADE_PROXIMA_SEM_VENCEDOR_PROVADO':'VANTAGEM_HEURISTICA_NAO_VALIDADA'
  }):null;
  return Object.freeze({
   key:skill.key,name:skill.name,family:bestFamily,rank:skill.rank,
   role:board.role,tactic,score:skill.score,
   explanation:definition.why||'Conferir habilidade oficial da edição.',
   fieldTask:PLAYBOOK_ROLE[board.role]?.task||'Confirmar função.',
   fieldSupport:PLAYBOOK_ROLE[board.role]?.support||'Confirmar apoio.',
   fieldRisk:PLAYBOOK_ROLE[board.role]?.risk||'Não presumir sinergia.',
   trainingSignal:skill.factors.investimento||0,nativeSignal,
   sourceNativeCount:skills.length,nativeIdentityRecognized:nativeNames.has(skill.key),
   familyPresentNative:skill.nativeFamilyCount>0,
   usedInTactics:Object.freeze(selected),tacticalRelevance:relevance,
   closeCompetitor:competitor,
   requires:Object.freeze(missingEvidence),
   recommendationOnly:true,neverEquippedByApp:true
  });
 }));
 const boosters=Object.freeze(board.boosters.map((b,i)=>{
  const competitor=board.boosters[i+1]||null;
  const near=competitor&&b.score-competitor.score<2;
  const supported=board.boosterEligibility.catalogSlot==='slot_documentado';
  const verified=board.boosterEligibility.manualSlot==='vazio';
  const axisList=engine?.BOOSTERS?.[b.key]||[];
  return Object.freeze({
   key:b.key,name:b.name,rank:b.rank,fourAxes:Object.freeze(axisList.slice()),
   sharedWithFixed:b.fixedKnown?b.sharedWithFixed:null,
   independentOfFixed:b.fixedKnown?4-b.sharedWithFixed:null,
   relativeScore:b.score,
   nextGap:competitor?Number((b.score-competitor.score).toFixed(2)):null,
   nearAlternative:Boolean(near),
   argument:near?'As notas próximas não distinguem o rendimento prático.':
    'A ordem é apenas heurística; comparar os quatro atributos e a função.',
   slotInCatalog:supported,slotEmptyInAccount:verified,
   eligibilityForManualReview:supported&&verified,
   unverifiedBase:b.baseStatus!=='base_completa_confirmada',
   unverifiedTraining:b.trainingStatus!=='custo_pp_conferido',
   maySpendTokens:false,mayApply:false
  });
 }));
 const missing=[
  ...board.pending.filter(x=>x.key!=='gameplay').map(x=>Object.freeze({
   key:x.key,what:x.action,priority:
    ['identidade','posicao','nativas'].includes(x.key)?'identidade':
    ['pp','base'].includes(x.key)?'fonte':'equipamento'
  })),
  {key:'gameplay',what:'Validar comparação em partidas e vídeo do mesmo Card ID e edição.',
   priority:'homologacao'}
 ];
 const guards=Object.freeze({
  duplicateSkills:board.checks.skillNamesUnique,
  identityNotFaked:board.evidence.identity==='CADASTRO_IDENTIFICADO'||
   board.pending.some(x=>x.key==='identidade'),
  noInventedSecondSlot:!(board.boosterEligibility.manualSlot==='vazio'&&
    board.boosterEligibility.catalogSlot!=='slot_documentado'&&
    boosters.some(x=>x.eligibilityForManualReview)),
  noAutomaticTraining:board.mayModifyTraining===false,
  noTokens:boosters.every(x=>!x.maySpendTokens),
  noGameplayClaim:board.gameplayValidated===false,
  noCreatorAttribution:board.creatorEndorsement===false,
  sourceHasFiveTactics:rotation.length===5,
  fourAxesEach:boosters.every(b=>b.fourAxes.length===4)
 });
 return Object.freeze({
  schema:'CRAQUE_V285_SEGUNDA_OPINIAO_COMPETITIVA',
  identity:own,tactic,styleLabel:engine?.TACTIC_LABEL?.[tactic]||tactic,
  skillReasons:main,boosterReasons:boosters,
  evidenceAblation:tests,tacticalMatrix:rotation,
  tacticPairs:Object.freeze(pairs),
  summary:Object.freeze({
   sameFivePairs:duplicates,comparablePairs:pairs.length,
   exactlySameFiveAllStyles:duplicates===10,
   distinctSkillSets:new Set(rotation.map(x=>x.skills.join('|'))).size,
   uniqueFirstBoosters:new Set(rotation.map(x=>x.booster).filter(Boolean)).size,
   nativeMapped:nativeProfile.known.length,
   nativeUnmapped:nativeProfile.unknown.length,
   sourceNativeTotal:skills.length,
   trainingEvidence:board.evidence.training,
   secondSlotEvidence:board.evidence.secondBooster,
   unsupportedClaims:false,
   repeatedSkillsDoNotImplyBadBuild:true
  }),
  evidenceTasks:Object.freeze(missing.map(x=>Object.freeze(x))),
  guards,readiness:'PARECER_CONSULTIVO_SEM_HOMOLOGACAO',
  mayAlterOriginalBuild:false,mayEquipSkill:false,
  maySpendTokens:false,creatorSourceVerified:false,
  note:'Blackjhon e Rentão são padrões de rigor; este relatório não atribui uma build a eles sem verificação de vídeo e carta exatos.'
 });
}

// V286 — examina o pacote COMPLETO de habilidades. Notas são heurísticas,
// nunca desempenho medido, aprovação de criador ou permissão de equipar.
function strategicPortfolioV286(d,tactic,engine,manualEquipped='',opts={}){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Tática inválida V286');
 const base=evaluate(d,tactic,manualEquipped,{
  equippedConfirmed:opts.equippedConfirmed===true});
 const role=base.role,cap=Number(d.capture??d.numero),
  id=String(d.id||''),edition=String(d.edition||d.versao||'');
 const identityOK=Number.isInteger(cap)&&cap>0&&id.trim()&&edition.trim()&&
  !/pendente|confirmar|invalid|desconhecid/i.test(id+' '+edition);
 const requested=base.equippedConfirmed?Math.max(0,Math.min(5,base.slotsRemaining)):5;
 const pool=base.rankedCandidates||[],rank=new Map(pool.map((x,i)=>[x.key,i]));
 // Nativas e adicionais já informadas podem deixar menos que 5 SKILLS elegíveis.
 // Nunca inventar ou recomendar a nativa outra vez apenas para preencher vagas.
 const limit=Math.min(requested,pool.length);
 const family=k=>SKILL_FAMILY[k]||'outros';
 const needsRole=ROLE_FAMILIES[role]||[],needsTactic=TACTIC_FAMILIES[tactic]||[];
 const native=splitSkills(d.native_skills||d.habilidades_nativas||''),
  nativeKeys=new Set(native.map(keyFor).filter(Boolean));
 const nativeFamilies={};
 for(const k of nativeKeys)nativeFamilies[family(k)]=(nativeFamilies[family(k)]||0)+1;
 const baseline=pool.slice(0,limit).map(x=>x.key);
 const score=keys=>{
  const families={};let raw=0;
  for(const key of keys){
   const x=pool[rank.get(key)];if(!x)return null;
   raw+=x.score;families[family(key)]=(families[family(key)]||0)+1;
  }
  let coverageRole=0,coverageTactic=0,repeat=0,nativeOverlap=0;
  for(const [f,n] of Object.entries(families)){
   if(needsRole.includes(f))coverageRole+=20;
   if(needsTactic.includes(f))coverageTactic+=13;
   if(n>1)repeat+=Math.min(65,18*(n-1)*(n-1));
   if(nativeFamilies[f])nativeOverlap+=5*n;
  }
  const s=new Set(keys),synergy=[];
  if(s.has('onepass')&&s.has('through'))
   synergy.push({key:'tabela',score:tactic==='posse'?12:7,
    reason:'Tabelas e passes verticais conectam apoio e infiltração.'});
  if(s.has('sole')&&(s.has('double')||s.has('heel'))&&
    ['CA','SA','MAT','MLG','ALA'].includes(role))
   synergy.push({key:'giro',score:tactic==='posse'?9:5,
    reason:'Domínio e giro facilitam ações centrais sob pressão.'});
  if(s.has('intercept')&&s.has('blocker')&&
    ['VOL','ZG','LD','LE'].includes(role))
   synergy.push({key:'cobertura',score:9,
    reason:'Cobertura de linhas e bloqueios são ações complementares.'});
  if(s.has('onepass')&&s.has('firstshot')&&['CA','SA'].includes(role))
   synergy.push({key:'finalizacao',score:6,
    reason:'Passe e chute de primeira cobrem fases distintas.'});
  const bonus=synergy.reduce((a,x)=>a+x.score,0);
  return Object.freeze({total:Number((raw+coverageRole+coverageTactic+
   bonus-repeat-nativeOverlap).toFixed(2)),raw,coverageRole,coverageTactic,
   bonus,repeat,nativeOverlap,families:Object.freeze(families),
   synergies:Object.freeze(synergy.map(x=>Object.freeze(x)))});
 };
 const combos=[],enumerate=(start,keys)=>{
  if(keys.length===limit){const calc=score(keys);
   if(calc)combos.push({keys:keys.slice(),calc});return;}
  for(let i=start;i<=pool.length-(limit-keys.length);i++)
   enumerate(i+1,[...keys,pool[i].key]);
 };
 if(limit===0)combos.push({keys:[],calc:score([])});
 else if(pool.length>=limit)enumerate(0,[]);
 const sumRank=keys=>keys.reduce((n,k)=>n+(rank.get(k)||0),0);
 combos.sort((a,b)=>b.calc.total-a.calc.total||
  sumRank(a.keys)-sumRank(b.keys)||a.keys.join('|').localeCompare(b.keys.join('|')));
 const initial=score(baseline),best=combos[0]||{keys:baseline,calc:initial};
 const improvement=Number((best.calc.total-initial.total).toFixed(2));
 const adopted=improvement>=3&&best.keys.join('|')!==baseline.join('|');
 const selected=adopted?best:{keys:baseline,calc:initial};
 const chosen=selected.keys.map((key,i)=>{
  const x=pool[rank.get(key)];
  return Object.freeze({key,name:SKILLS[key].name,family:family(key),
   position:i+1,rankingBase:(rank.get(key)||0)+1,scoreBase:x.score,
   reason:SKILLS[key].why,factors:Object.freeze({...x.criterios}),
   sameNativeFamily:Boolean(nativeFamilies[family(key)]),
   equipAuthorized:false});
 });
 const boost=booster(d,tactic,engine,opts.verifiedSlot,opts.verifiedBooster);
 const fixed=boost.complementarity.factoryAxes||[];
 const options=[boost.primary,...boost.alternatives].filter(Boolean).map((x,i)=>{
  const axes=engine?.BOOSTERS?.[x.nome]||[];
  const shared=fixed.length===4?axes.filter(k=>fixed.includes(k)).length:null;
  return Object.freeze({key:x.nome,name:x.nome_pt||x.nome,position:i+1,
   score:x.score,axes:Object.freeze(axes.slice()),sharedFixed:shared,
   complementaryScore:Number((x.score-(shared===null?0:1.25*shared)).toFixed(2)),
   maySpendTokens:false,mayApply:false});
 });
 const primary=options[0]||null;
 const tied=options.filter(x=>primary&&primary.score-x.score<=5);
 const alternative=tied.slice().sort((a,b)=>b.complementaryScore-a.complementaryScore||
  a.position-b.position)[0]||primary;
 const pending=[];
 if(!identityOK)pending.push({key:'identidade',level:'bloqueio',
  what:'Card ID ou edição pendentes; não comparar com outro pack.'});
 if(!native.length)pending.push({key:'nativas',level:'alto',
  what:'Habilidades nativas da edição não documentadas.'});
 const unknown=contextNativeProfile(native).unknown;
 if(unknown.length)pending.push({key:'nativas_nao_interpretadas',level:'alto',
  what:unknown.length+' nativas não interpretadas com segurança.'});
 if(!investmentAudit(d).levels)pending.push({key:'pp',level:'alto',
  what:'Conferir custo e vetor de PP nesta carta exata.'});
 if(!base.equippedConfirmed)pending.push({key:'adicionais',level:'alto',
  what:'Conferir os cinco slots de habilidades adicionais na conta.'});
 if(!boost.slotSupported)pending.push({key:'slot_catalogo',level:'bloqueio',
  what:'Slot selecionável não comprovado pelo catálogo.'});
 if(boost.verifiedSlot!=='vazio')pending.push({key:'slot_conta',level:'alto',
  what:'Slot de ímpeto vazio não confirmado nesta conta.'});
 if(!d.base_stats_proof?.confirmed_in_game)pending.push({key:'base',level:'alto',
  what:'Atributos-base completos e fonte da edição não confirmados.'});
 pending.push({key:'gameplay',level:'revisao',
  what:'Comparar vídeo e partidas da mesma edição antes de homologar.'});
 return Object.freeze({
  schema:'CRAQUE_V286_OTIMIZADOR_PACOTE',tactic,
  identity:Object.freeze({capture:cap,cardId:id,edition,role,valid:Boolean(identityOK)}),
  selected:Object.freeze(chosen),baseline:Object.freeze(baseline),
  mathematicalOptimum:Object.freeze(best.keys.slice()),adopted,
  improvement,evaluatedCombos:combos.length,
  maxCandidates:limit,requestedCandidates:requested,
  insufficientCandidates:limit<requested,
  slotsConfirmed:base.equippedConfirmed,
  utility:selected.calc,baselineUtility:initial,
  skillSelectionNote:adopted?'Complementaridade alterou a lista calculada; sem prova de superioridade.':
   'Lista anterior preservada: não diversificar sem ganho heurístico justificado.',
  boosters:Object.freeze({primary,complementaryAlternative:alternative&&primary&&alternative.key!==primary.key?alternative:null,
   candidates:Object.freeze(options),catalogProof:boost.slotSupported,
   accountEmpty:boost.verifiedSlot==='vazio',maySpendTokens:false}),
  priorityQueue:Object.freeze(pending.map(x=>Object.freeze(x))),
  mayEditBuild:false,mayEquip:false,creatorVerified:false,gameplayVerified:false
 });
}

// V287 — prontuário de fontes + consenso de conjunto e ímpeto; somente hipótese.
function professionalEvidenceCouncilV287(d,tactic,engine,index=null,opts={}){
 if(!DOSSIER_TACTICS.includes(tactic))throw Error('Estilo tático inválido V287');
 const main=strategicPortfolioV286(d,tactic,engine,'',opts);
 const opinion=competitiveQualityLabV285(d,tactic,engine,'',opts);
 const cap=Number(d.capture??d.numero),id=String(d.id||''),
  edition=String(d.edition||d.versao||'');
 const canonical=Boolean(main.identity.valid);
 const matchedIndex=Boolean(index&&Number(index.numero)===cap&&
  String(index.card_id||'')===id&&normal(index.edicao||'')===normal(edition));
 const record=matchedIndex?index:null;
 const native=splitSkills(d.native_skills||d.habilidades_nativas||'');
 const base=engine?.baseStatsAudit?.({
  id,versao:edition,base_stats:d.base_stats,
  base_stats_proof:d.base_stats_proof,base_catalog_proof:d.base_catalog_proof
 })||{status:'base_nao_documentada'};
 const indexNative=record?Number(record.nativas_documentadas):null;
 const nativeAligned=Boolean(record&&native.length&&indexNative===native.length);
 const completeBase=base.status==='base_completa_confirmada';
 const level=investmentAudit(d);
 const localSkills=opts.equippedConfirmed===true;
 const catalogSlot=main.boosters.catalogProof===true;
 const accountSlot=main.boosters.accountEmpty===true;
 const fixedName=engine?.boosterName?.(d.boost1||d.impeto_fixo)||null;
 const factoryAxes=fixedName?(engine?.BOOSTERS?.[fixedName]||[]):[];
 const profile={
  catalogEdition:canonical?'CADASTRADA_NAO_PROVADA_NO_JOGO':'PENDENTE',
  documentaryIndex:record?'VINCULADO_POR_CAP_CARD_ID_EDICAO':'SEM_VINCULO_EXATO',
  nativeList:nativeAligned?'QUANTIDADE_ALINHADA_SEM_PRINT':'CONFERIR_NATIVAS',
  editionImage:record?.print_edicao_confirmada===true?'SINAL_CADASTRADO_REVISAR_FONTE':'NAO_CONFIRMADA',
  numericalBase:completeBase?'BASE_COMPLETA_COM_FONTE':'BASE_INCOMPLETA_OU_PENDENTE',
  training:level.status,
  additionalSlots:localSkills?'DECLARACAO_LOCAL_USUARIO':'SEM_CONFIRMACAO_LOCAL',
  boosterCatalog:catalogSlot?'SELECIONAVEL_NESTE_CATALOGO':'NAO_CONFIRMADO',
  boosterAccount:accountSlot?'DECLARADO_VAZIO':'NAO_CONFIRMADO_VAZIO',
  video:'SEM_VINCULO_COM_CARD_ID_VERIFICADO_NESTE_RELATORIO',
  gameplay:'SEM_COMPARACAO_CONTROLADA_VALIDADA'
 };
 const checks=[
  {key:'identity',title:'Edição, CAP e Card ID',ok:canonical,phase:'bloqueio',
   action:'Conferir identificadores com o próprio cartão exibido no jogo.'},
  {key:'source',title:'Fonte reconciliada no índice',ok:matchedIndex,phase:'bloqueio',
   action:'Reconciliar HTML, catálogo e índice da edição; não copiar dados de versão similar.'},
  {key:'natives',title:'Nativas no índice da edição',ok:nativeAligned,phase:'alta',
   action:'Conferir nomes e quantidade das nativas, inclusive especiais, com print da edição exata.'},
  {key:'print',title:'Print com edição confirmada',ok:record?.print_edicao_confirmada===true,phase:'alta',
   action:'Obter print legível com edição e Card ID; foto candidata por nome não basta.'},
  {key:'training',title:'Custo matemático de PP',ok:Boolean(level.levels),phase:'alta',
   action:'Validar nível máximo e distribuição individual; custo coerente não é homologação.'},
  {key:'base',title:'Atributos-base completos',ok:completeBase,phase:'alta',
   action:'Conferir todos os atributos-base da mesma edição e a fonte, sem inventar finais.'},
  {key:'additional',title:'Cinco slots adicionais conferidos',ok:localSkills,phase:'alta',
   action:'Conferir a lista completa no jogo e reconfirmar por CAP, Card ID e edição.'},
  {key:'boosterCatalog',title:'Segundo slot no catálogo',ok:catalogSlot,phase:'bloqueio',
   action:'Verificar se existe um segundo slot selecionável nesta carta exata.'},
  {key:'boosterAccount',title:'Segundo slot vazio na conta',ok:accountSlot,phase:'alta',
   action:'Conferir se o slot está vazio; não inferir que um boost vazio equivale a slot existente.'},
  {key:'body',title:'Modelo corporal associado à edição',ok:record?.modelo_corporal_documentado===true,phase:'revisao',
   action:'Conferir dados corporais sem deduzir animações só pelo nome do jogador.'},
  {key:'video',title:'Vídeo associado ao Card ID exato',ok:false,phase:'revisao',
   action:'Vincular vídeo da edição exata e apontar trechos e critérios avaliados.'},
  {key:'gameplay',title:'Teste controlado comparável',ok:false,phase:'validacao',
   action:'Comparar partidas em condições semelhantes e registrar resultado; heurísticas não provam meta.'}
 ];
 const pending=checks.filter(x=>!x.ok);
 const ranking=new Map(opinion.skillReasons.map(x=>[x.key,x]));
 const skillCouncil=main.selected.map(x=>{
  const baseRank=ranking.get(x.key);
  const tactical=opinion.tacticalMatrix.filter(v=>v.skills.includes(x.key)).map(v=>v.tactic);
  const sourceWarnings=[];
  if(!nativeAligned)sourceWarnings.push('nativas sem alinhamento documental completo');
  if(!level.levels)sourceWarnings.push('PP não utilizado para comprovar');
  if(!localSkills)sourceWarnings.push('lista adicional da conta não confirmada');
  return Object.freeze({
   key:x.key,name:x.name,family:x.family,order:x.position,
   priorRank:x.rankingBase,role:main.identity.role,
   reason:x.reason,usedByStyles:Object.freeze(tactical),
   nativeFamilyOverlap:x.sameNativeFamily,
   agreementWithIndividual:opinion.skillReasons.some(v=>v.key===x.key),
   reasonsForReview:Object.freeze(sourceWarnings),
   status:'SUGESTAO_NAO_EQUIPADA',mayEquip:false
  });
 });
 const gain=main.selected.filter(x=>!main.baseline.includes(x.key))
  .map(x=>Object.freeze({key:x.key,name:x.name,
   replaced:main.baseline.filter(k=>!main.selected.some(s=>s.key===k))
    .map(k=>SKILLS[k]?.name||k),cause:
    'Cobertura funcional, repetição e combinações de habilidades — ganho heurístico, não teste.'}));
 // Four confirmed axes and exact role weights, without inventing final attributes.
 const roleWeights=engine?.ROLE?.[main.identity.role]||{};
 const axes=Object.freeze((engine?.BOOSTERS?.[fixedName]||[]).slice());
 const boosterRows=main.boosters.candidates.map(x=>{
  const statNames=x.axes||[];
  const usefulness=statNames.map(k=>Number(roleWeights[k]||0));
  const rankSupport=Number(usefulness.reduce((s,v)=>s+v,0).toFixed(2));
  return Object.freeze({
   key:x.key,name:x.name,rank:x.position,fourAttributes:Object.freeze(statNames.slice()),
   roleWeightSum:rankSupport,score:x.score,relativeScore:x.complementaryScore,
   fixedOverlap:x.sharedFixed,fixedKnown:factoryAxes.length===4,
   metric:'PESOS_DA_FUNCAO_NAO_ATRIBUTOS_FINAIS',
   canApply:false,canSpendTokens:false
  });
 });
 // Ablations from V285 are retrospective, not proof of new equipment.
 const boosterSensitivity=opinion.evidenceAblation.map(x=>Object.freeze({
  factor:x.factor,available:x.tested,
  firstChoiceChanges:x.tested?x.changedBooster:null,
  important:x.tested&&x.changedBooster
 }));
 const warnings=[];
 if(pending.some(x=>x.phase==='bloqueio'))warnings.push(
  'Pendência de bloqueio: não homologar identidade, fonte ou segundo slot.');
 if(!nativeAligned)warnings.push('Diferenças de edição ou de nativas exigem revisão da fonte.');
 if(main.insufficientCandidates)warnings.push(
  'Menos de cinco skills novas elegíveis: não completar a lista artificialmente.');
 if(opinion.summary.exactlySameFiveAllStyles)warnings.push(
  'Cinco estilos geram o mesmo ranking; revisar contexto sem forçar variação.');
 if(boosterSensitivity.some(x=>x.important))warnings.push(
  'O líder do ímpeto varia quando uma evidência é retirada; evitar gasto baseado apenas na ordem.');
 const confidence=canonical&&nativeAligned&&completeBase&&localSkills&&catalogSlot&&accountSlot&&
   record?.print_edicao_confirmada===true?'DOCUMENTAL_PARCIAL_SEM_TESTE':
   pending.some(x=>x.phase==='bloqueio')?'BLOQUEADO_POR_EVIDENCIA':
   'CONSULTIVO_COM_LACUNAS';
 return Object.freeze({
  schema:'CRAQUE_V287_CONSELHO_DE_EVIDENCIAS',
  identity:Object.freeze({capture:cap,cardId:id,edition,role:main.identity.role}),
  tactic,confidence,evidence:Object.freeze(profile),
  checks:Object.freeze(checks.map(x=>Object.freeze(x))),
  pending:Object.freeze(pending.map(x=>Object.freeze(x))),
  pendingCount:pending.length,
  skillCouncil:Object.freeze(skillCouncil),
  changeLog:Object.freeze(gain),
  adoptedOptimizedPortfolio:main.adopted,
  priorFive:Object.freeze(main.baseline.slice()),
  chosenFive:Object.freeze(main.selected.map(x=>x.key)),
  boosters:Object.freeze(boosterRows),
  fixedBooster:Object.freeze({name:fixedName,
   axes:factoryAxes.length===4?axes:Object.freeze([]),
   documented:factoryAxes.length===4}),
  boosterSensitivity:Object.freeze(boosterSensitivity),
  criticalWarnings:Object.freeze(warnings),
  authorVerified:false,gameplayVerified:false,
  mayApply:false,maySpendTokens:false,mayOverwriteBuild:false,
  note:'Respeita a metodologia criteriosa de análise por versão; não atribui aprovação ou fichas a Rentão/Blackjhon.'
 });
}
const api={SKILLS,ENTRIES,POSITION,POOLS,ROLE_LABEL,ROLE_TACTIC_SKILLS,TACTIC_REASON,SKILL_FAMILY,ROLE_FAMILIES,TACTIC_FAMILIES,composePortfolio,PLAYBOOK_ROLE,PLAYBOOK_TACTIC,playbookOf,TRAINING_CATEGORY,CONTEXT_NATIVE_GROUPS,contextForNative,contextNativeProfile,investmentAudit,evidenceDossier,archetypeOf,keyFor,roleOf,evaluate,booster,USER_SLOT_NOTES,
 confirmationKey,fingerprint,checkedEquipment,boosterRecordEvidence,evidenceRoadmap,decisionMatrixFromScenarios,individualEvidenceProfile,compareIndividualEvidence,tacticalSkillDelta,evidenceSensitivityV283,competitiveDecisionBoardV284,competitiveQualityLabV285,strategicPortfolioV286,professionalEvidenceCouncilV287};
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_RECOMMENDATIONS_V162=api;
if(typeof document==='undefined'||document.body?.dataset.page!=='detail')return;
const ds=document.getElementById('scout-v68-data');if(!ds)return;
let d;try{d=JSON.parse(ds.textContent)}catch(e){return}
const container=document.querySelector('.profile-content');if(!container)return;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const css=document.createElement('style');css.textContent=
'#scout-v162{border:1px solid rgba(234,195,108,.48);background:linear-gradient(145deg,#11293d,#071624 85%);border-radius:20px;padding:18px;margin:16px 0 20px;color:#f5f4ed;scroll-margin-top:15px;box-shadow:0 14px 34px #0005}'+
'#scout-v162 h2{margin:4px 0 8px;font-size:clamp(18px,3vw,24px)}#scout-v162 p{font-size:13px;line-height:1.55;margin:7px 0}'+
'#scout-v162 .v162-meta{font-size:11px;letter-spacing:.08em;color:#a6d9e8;font-weight:800}'+
'#scout-v162 .v162-modes{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}'+
'#scout-v162 button{background:#173449;border:1px solid #678294;border-radius:10px;color:#f7f0de;cursor:pointer;min-height:42px;padding:8px 12px;font-size:13px;font-weight:700}'+
'#scout-v162 button[aria-pressed=true]{background:linear-gradient(135deg,#cfac62,#f5d58f);border-color:#ffe1aa;color:#102031}'+
'#scout-v162 .v162-list{display:grid;gap:8px;padding:0;list-style:none;margin:12px 0}'+
'#scout-v162 .v162-list li{border:1px solid #36556d;background:linear-gradient(120deg,#0b2435,#132e40);border-radius:12px;padding:12px}'+
'#scout-v162 .v162-list li p{margin:3px 0 0;color:#b7d6e5}'+
'#scout-v162 .v162-panels{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
'#scout-v162 .v276-portfolio{border:1px solid rgba(232,195,120,.55);background:linear-gradient(120deg,#192e3f,#0d2333);border-radius:12px;padding:13px;margin:13px 0}'+
'#scout-v162 .v276-portfolio h3{margin:0 0 5px;color:#f6d99c;font-size:14px}'+
'#scout-v162 .v276-portfolio ol{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:8px;padding:0;margin:8px 0;list-style:none}'+
'#scout-v162 .v276-portfolio li{border:1px solid #3d5368;border-radius:9px;background:#102638;padding:9px;font-size:12px;line-height:1.5;overflow-wrap:anywhere}'+
'#scout-v162 .v276-portfolio small{color:#bdcbd8;font-size:11px;display:block;margin-top:4px}'+
'#scout-v162 .v276-boostnote{color:#f0d29a;font-size:12px;padding:9px;border-left:3px solid #d5ab5a;background:#162b3b;border-radius:7px}'+
'#scout-v162 .v272-proofline{font-size:11px;color:#f1d79a;padding:9px 11px;border:1px solid rgba(234,195,108,.35);background:#142737;border-radius:10px;margin:10px 0;line-height:1.6;overflow-wrap:anywhere}'+
'#scout-v162 .v272-skill-reason{display:block;font-size:12px;color:#c4d7e5;line-height:1.5;margin-top:5px}'+
'#scout-v162 .v272-skill-rank{display:inline-flex;align-items:center;justify-content:center;min-width:26px;padding:4px 7px;margin-right:8px;border-radius:8px;background:#3b3540;color:#f9d996;font-size:11px;border:1px solid #7f694d}'+
'#scout-v162 .v272-score{color:#eac36c;font-weight:800;font-size:11px;margin-left:8px}'+
'#scout-v162 .v272-criteria{margin-top:7px;color:#d7dfeb;font-size:11px}'+
'#scout-v162 .v272-criteria summary{min-height:40px;display:flex;align-items:center;cursor:pointer;color:#d3bb87;font-weight:700}'+
'#scout-v162 .v272-booster-compare{border:1px solid #596777;padding:10px;border-radius:10px;background:#102637;color:#d8e6ec}'+
'#scout-v162 .v272-booster-compare summary{min-height:40px;display:flex;align-items:center;cursor:pointer;color:#efcf89}'+
'#scout-v162 .v272-booster-compare li{margin:8px 0;line-height:1.6;overflow-wrap:anywhere;font-size:11px}'+
'#scout-v162 #v273-dossier{border:1px solid #8b7552;background:linear-gradient(125deg,#172b3c,#0b1d2e);border-radius:12px;margin:12px 0;padding:12px;color:#e6edf2}'+
'#scout-v162 #v273-dossier summary{min-height:44px;cursor:pointer;color:#f2d594;font-weight:850;line-height:1.6}'+
'#scout-v162 #v273-dossier h4{font-size:13px;color:#f1d9a2;margin:12px 0 6px}'+
'#scout-v162 #v273-dossier ul{font-size:12px;line-height:1.65;padding-left:22px;margin:8px 0}'+
'#scout-v162 #v273-dossier li{overflow-wrap:anywhere;padding:4px 0}'+
'#scout-v162 #v273-dossier .v273-tactic{padding:7px 9px;margin:4px 0;border:1px solid #39576e;border-radius:8px;background:#102939;font-size:12px;line-height:1.5}'+
'#scout-v162 #v273-dossier .v274-audit{font-size:12px;line-height:1.65;color:#e6dac1;border:1px solid #806b4f;border-radius:10px;padding:10px;margin:10px 0;background:#182b3b}'+
'#scout-v162 #v273-dossier .v275-doc-summary{color:#f2d594;font-weight:800;line-height:1.65;overflow-wrap:anywhere}'+
'#scout-v162 .v162-panel{border:1px solid #33556b;border-radius:12px;padding:12px;background:#0b1e2d;min-width:0}'+
'#scout-v162 .v162-note{color:#d3caa5}#scout-v162 textarea{box-sizing:border-box;width:100%;min-height:62px;background:#081e2d;border:1px solid #5b829a;border-radius:8px;color:white;font-size:14px;padding:10px}'+
'#scout-v162 .v162-foot{font-size:12px;color:#b9d3dc;border-top:1px solid #35566a;padding-top:10px;margin-top:12px}'+
'@media(max-width:750px){#scout-v162 .v162-panels{grid-template-columns:1fr}#scout-v162{padding:12px}}';
css.textContent+=
 '#scout-v162 .v254-confirm-line{display:flex;gap:10px;align-items:flex-start;padding:11px;margin:12px 0;border:1px solid #82745d;border-radius:10px;background:#152c42;color:#f1deb4;line-height:1.45;font-size:12px;font-weight:700}'+
 '#scout-v162 .v254-confirm-line input{flex:0 0 20px;width:20px;height:20px;margin:1px 0 0;accent-color:#e3bb75}'+
 '#scout-v162 .v254-confirm-line input:focus-visible{outline:3px solid #f0cc82;outline-offset:3px}';
document.head.appendChild(css);
const section=document.createElement('section');section.id='scout-v162';section.setAttribute('aria-label','Recomendações de habilidades e ímpetos por carta');
section.innerHTML='<div class="v162-meta">SCOUT PRO · OTIMIZAÇÃO COMPETITIVA V162</div><h2>Habilidades adicionais e melhor ímpeto</h2><p>Recomendações por edição, função, estilo e tática. A prioridade é o desempenho em campo, não o Overall.</p>'+
'<div class="v162-modes" role="group" aria-label="Estilo tático"><button type="button" data-tactic="posse" aria-pressed="true">Posse de Bola</button><button type="button" data-tactic="normal" aria-pressed="false">Contra-Ataque Normal</button><button type="button" data-tactic="rapido" aria-pressed="false">Contra-Ataque Rápido</button><button type="button" data-tactic="fora" aria-pressed="false">Por Fora</button><button type="button" data-tactic="longo" aria-pressed="false">Passe Longo</button></div>'+
'<p id="v272-proofline" class="v272-proofline" aria-live="polite"></p>'+
'<section id="v276-portfolio" class="v276-portfolio" aria-label="Portfólio complementar de habilidades"></section>'+
'<details id="v273-dossier"><summary>Laudo competitivo desta carta · 5 estilos e evidências</summary><div id="v273-dossier-content"></div></details><div class="v162-panels"><article class="v162-panel"><h3>Até 5 habilidades adicionais · ordem por edição</h3><p id="v162-skills-status"></p><ol class="v162-list" id="v162-skills"></ol><p id="v162-alts"></p></article><article class="v162-panel"><h3>Ímpetos fixos / adicionais</h3><div id="v162-source"></div><div id="v162-booster"></div></article></div>'+
'<details><summary>Informar habilidades adicionais desta edição</summary><p>Separe os nomes por ponto e vírgula. Sem conferência, esta é apenas uma lista parcial: não presumimos que os outros slots estejam vazios.</p><textarea id="v162-equipped" aria-label="Habilidades adicionais já equipadas" placeholder="Ex.: Passe de primeira; Toque duplo"></textarea><label class="v254-confirm-line"><input type="checkbox" id="v254-confirm-equipped"><span>Conferi no Plano de Jogo: esta lista contém TODAS as habilidades adicionais equipadas nesta edição exata, inclusive se estiver vazia.</span></label><button id="v162-save" type="button">Salvar conferência e recalcular</button><p id="v162-feedback" aria-live="polite"></p></details>'+
'<p class="v162-foot">Recomendações teóricas baseadas nas habilidades registradas, no estilo e na função da carta. Não são testes comprovados em partidas; verifique habilidades nativas, compatibilidade e slot antes de usar tokens. Nenhuma escolha é aplicada automaticamente.</p>';
// V192: mostrar as cinco habilidades dentro da ficha PRINCIPAL, sem cópia do painel.
const principal=container.querySelector('#scout-v188-principal');
const anatomical=principal?.querySelector('.scout-v188-body');
if(anatomical){
 anatomical.insertAdjacentElement('beforebegin',section);
 // V193: esconder o atalho redundante apenas quando o painel de habilidades já está visível.
 principal.classList?.add('scout-v193-skills-integrated');
}
else {
 const after=principal||container.querySelector('#scout-card-navigator')||container.querySelector('.detail-header')||container.querySelector('.mobile-profile');
 if(after)after.insertAdjacentElement('afterend',section);else container.prepend(section);
}
const side=document.querySelector('.side-nav');if(side){const link=document.createElement('a');link.href='#scout-v162';link.textContent='★ Habilidades e ímpetos PRO';side.prepend(link)}
const storage='scoutpro:v162:equipped:'+String(d.capture)+':'+String(d.id||'unknown');
let extra='';try{extra=localStorage.getItem(storage)||''}catch(e){}
const ta=section.querySelector('#v162-equipped');ta.value=extra;
const verifiedCheck=section.querySelector('#v254-confirm-equipped');
const verifyKey=confirmationKey(d.capture,d.id);
const readProof=()=>{try{return JSON.parse(localStorage.getItem(verifyKey)||'null')}catch(_){return null}};
const equipmentConfirmed=()=>checkedEquipment(d,extra,readProof());
verifiedCheck.checked=equipmentConfirmed();
ta.addEventListener('input',()=>{if(fingerprint(ta.value)!==fingerprint(extra))verifiedCheck.checked=false});
let tactic='posse';
const originalPosition=String(d.original_position||d.posicao_original||d.shown_position||d.role_used||d.posicao||'');
let actualPosition=originalPosition,roleEvidence='original';
function setConfirmedRole(event){
 const detail=event||{};
 if(Number(detail.capture)!==Number(d.capture)||
    String(detail.card_id)!==String(d.id))return false;
 const API=host.SCOUT_POSITION_TRAINING_V246;
 const native=API?.pos?.(originalPosition)||originalPosition;
 const requested=API?.pos?.(detail.position)||'';
 if(!requested)return false;
 const sourceCard={numero:Number(d.capture),id:String(d.id),posicao:originalPosition};
 const proof=API?.status?.(sourceCard,requested,host.localStorage);
 const valid=requested===native||proof?.eligible===true&&
  ['treinada','familiar'].includes(proof.status);
 if(!valid)return false;
 actualPosition=requested;
 roleEvidence=requested===native?'original':proof.status;
 // Preserva posição NATIVA em vez de chamar CA a posição original de um PTE.
 d.original_position=originalPosition;
 d.shown_position=requested;d.role_used=requested;
 draw();return true;
}
function draw(){
 let manuallyVerified={};
 let boosterProof=boosterRecordEvidence(d,null);
 try{
  const val=JSON.parse(localStorage.getItem('scoutpro:v103:booster:'+Number(d.capture))||'null');
  boosterProof=boosterRecordEvidence(d,val);
  if(boosterProof.valid)manuallyVerified=val;
 }catch(e){}
 const confirmed=equipmentConfirmed();
 const result=evaluate(d,tactic,extra,{equippedConfirmed:confirmed});
 const boost=booster(d,tactic,host.SCOUT_BOOSTERS_V103,manuallyVerified.status,manuallyVerified.equipped);
 const dossier=evidenceDossier(d,tactic,host.SCOUT_BOOSTERS_V103,extra,{
  equippedConfirmed:confirmed,verifiedSlot:manuallyVerified.status,
  verifiedBooster:manuallyVerified.equipped,
  roleConfirmed:roleEvidence==='treinada'||roleEvidence==='familiar'
 });
 const remaining=result.slotsRemaining;
 const proposed=result.recommendations;
 verifiedCheck.checked=result.equippedConfirmed;
 section.querySelectorAll('[data-tactic]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tactic===tactic)));
 section.querySelector('#v162-skills-status').textContent='Função analisada: '+actualPosition+
  ' ('+(roleEvidence==='original'?'posição original':roleEvidence==='treinada'?
  'treino confirmado':'familiaridade confirmada')+'). '+
  'Nativas catalogadas: '+result.knownNative+
  ' · Adicionais informadas (distintas): '+result.manualReportedCount+'/5 · '+
  (result.equippedConfirmed?'Lista completa conferida · vagas restantes: '+remaining+'. ':
   'LISTA NÃO CONFERIDA: vagas disponíveis desconhecidas. Até cinco candidatos teóricos, não cinco slots livres. ')+
  (result.nativeKnown?'Ordem consultiva por função, tática e habilidades nativas cadastradas; não é homologação de gameplay.':
   'EDIÇÃO SEM NATIVAS DOCUMENTADAS: sugestões provisórias; não gaste tokens sem conferir.')+
  (result.requiresReconciliation?
   ' CONFLITO: revisar a lista antes de consumir tokens; as prioridades abaixo são apenas comparações.':'')+
  (result.missing.length?' Atenção: '+result.missing.join(' '):'');
 const proofline=section.querySelector('#v272-proofline');
 proofline.textContent='LEITURA DA CARTA · '+result.perfil+' · '+tacticLabelFor(tactic)+
  ' · nativas: '+result.nativeCoverage+' · especiais: '+result.contextualNativeSkills.length+
  ' · investimento: '+result.investmentEvidence+
  ' · PP: '+(boost.primary?.evidencias?.pp_status||'pendente')+
  ' · segundo ímpeto: '+boost.slotEvidence+
  (boosterProof.legacy?' · PROVA ANTIGA: confirmar novamente o slot no jogo.':'')+
  ' · SEM homologação por OVR ou gameplay.';
 // Parecer auditável de 246 edições: campos de perfil e pendências.
 // Sem HTML do jogador e sem duplicar a ficha principal.
 const portfolioSection=section.querySelector('#v276-portfolio');
 portfolioSection.replaceChildren();
 const portfolioHeading=document.createElement('h3');
 portfolioHeading.textContent='Alternativa equilibrada · até 5 habilidades';
 const portfolioDescription=document.createElement('p');
 portfolioDescription.textContent=
  'Uma combinação alternativa por função, tática e cobertura entre habilidades. '+
  (result.equippedConfirmed?'Vagas informadas: '+remaining+'. ':
   'Sem confirmação dos cinco slots: esta lista NÃO equivale a habilidades equipáveis. ')+
  'Não é uma build de Rentão ou Blackjhon sem fonte da edição exata.';
 portfolioSection.append(portfolioHeading,portfolioDescription);
 const portfolioItems=document.createElement('ol');
 for(const item of result.balancedPortfolio.candidates){
  const li=document.createElement('li'),name=document.createElement('strong'),
   reason=document.createElement('small');
  name.textContent=item.name+' · '+item.family;
  reason.textContent=item.explanation+
   (item.evidence.nativeFamilyPresent?' · Família também presente entre as nativas.':'')+
   (item.evidence.equippedFamilyPresent?' · Família já equipada na edição.':'');
  li.append(name,reason);portfolioItems.append(li);
 }
 if(!result.balancedPortfolio.candidates.length){
  const empty=document.createElement('li');
  empty.textContent='Nenhuma sugestão adicional segura nesta combinação de dados/slots.';
  portfolioItems.append(empty);
 }
 portfolioSection.append(portfolioItems);
 const dossierContent=section.querySelector('#v273-dossier-content');
 dossierContent.replaceChildren();
 const addSection=(heading,values,cssClass='')=>{
  const h=document.createElement('h4');h.textContent=heading;dossierContent.append(h);
  if(cssClass==='scenario'){
   for(const value of values){const p=document.createElement('p');p.className='v273-tactic';p.textContent=value;dossierContent.append(p)}
  }else{
   const list=document.createElement('ul');
   for(const value of values){const li=document.createElement('li');li.textContent=value;list.append(li)}
   dossierContent.append(list);
  }
 };
 addSection('Perfil tático de origem',[
  dossier.archetype+' · posição usada: '+dossier.positionUsed+' · '+dossier.roleLabel,
  'CAP '+dossier.cap+' / Card ID '+dossier.cardId+' · '+dossier.edition,
  'Progresso: '+dossier.trainingStatus+' · nativas: '+dossier.nativeCoverage+
   ' · cinco adicionais: '+(dossier.skillSlotsVerified?'conferidos':'vagas não comprovadas')
 ]);
 const docSummary=document.createElement('p');docSummary.className='v275-doc-summary';
 docSummary.textContent='EVIDÊNCIAS DO CADASTRO · '+dossier.documentedIndicators+
  '/'+dossier.totalIndicators+' verificações. '+dossier.auditLabel+
  '. Não é avaliação de força ou desempenho.';
 dossierContent.append(docSummary);
 addSection('V281 · prioridades da função na tática escolhida',[
  dossier.tacticalReason,
  'Recursos priorizados: '+dossier.tacticalPriorities.join(' / '),
  'Mudanças por tática são hipóteses de função, não habilidades oficiais comprovadas por criadores.'
 ]);
 addSection('Habilidades · justificativa individualizada do portfólio',[
  'Famílias das nativas identificadas: '+
   (Object.keys(dossier.skillFamilyEvidence.nativeFamilies).join(', ')||'nenhuma com alias de adicional'),
  'Famílias das adicionais equipadas conferidas: '+
   (Object.keys(dossier.skillFamilyEvidence.equippedFamilies).join(', ')||'não documentadas nesta consulta'),
  'Pacote complementar: '+dossier.skillFamilyEvidence.balancedCandidates.map(x=>
   x.name+' ['+x.family+']').join(' / ')+
   '. Não significa que existam cinco vagas nem que as habilidades sejam autorizadas.'
 ]);
 addSection('Ordem segura para melhorar esta ficha',
  [dossier.roadmap.firstAction,
   ...dossier.roadmap.missing.slice(1).map(x=>x.action),
   'Fonte de treino de Rentão/Blackjhon: '+dossier.roadmap.sourceStatus+
    ' · atribuição não autorizada sem comparação exata do vídeo com esta edição.'
  ]);
 addSection('Checklist de sete verificações independentes',
  dossier.evidenceChecklist.map(c=>(c.ok?'CONFERIDO: ':'PENDENTE: ')+c.label));
 addSection('V282 · assinatura individual da carta (sem classificação meta)',[
  'Card ID '+dossier.individualProfile.proof.cardId+
   ' · edição '+dossier.individualProfile.proof.edition+
   ' · origem '+dossier.individualProfile.proof.originalPosition+
   ' · uso '+dossier.individualProfile.proof.usedPosition,
  'Nativas registradas: '+dossier.individualProfile.proof.nativeCount+
   ' · nativas especiais catalogadas: '+dossier.individualProfile.proof.contextualNativeCount+
   ' · desconhecidas: '+dossier.individualProfile.proof.unmappedNativeCount+
   ' · perfil '+dossier.individualProfile.proof.nativeFingerprint,
  'PP '+dossier.individualProfile.proof.pp+' · '+dossier.individualProfile.proof.progressStatus+
   ' · distribuição: '+(dossier.individualProfile.proof.progressVector?.join(' / ')||'SEM PROVA'),
  ...dossier.individualProfile.recommendations.map((x,i)=>
   (i+1)+'. '+x.name+' · função '+x.criteria.funcao+
    ' · tática '+x.criteria.tatica+' · estilo '+x.criteria.estilo+
    ' · nativas '+x.criteria.nativas+' · investimento '+x.criteria.investimento+
    ' · NOTA RELATIVA, não atributos finais'),
  ...dossier.individualProfile.missing.map(x=>'PENDENTE: '+x)
 ]);
 addSection('V282 · por que a prioridade muda com o técnico?',
  dossier.tacticCounterfactuals.map(x=>
   tacticLabelFor(x.first)+' × '+tacticLabelFor(x.second)+
   ' · primeira skill '+(x.sameFirst?'mantida':'diferente')+
   ' · '+x.rows.filter(z=>z.comparable&&z.scoreDelta!==0).length+
   ' candidatos com nota relativa alterada; '+x.rows
    .filter(z=>z.comparable&&z.scoreDelta!==0).slice(0,2)
    .map(z=>z.name+' (diferença '+(z.scoreDelta>0?'+':'')+z.scoreDelta+')')
    .join(', ')+'.' ));
 addSection('V281 · comparador competitivo entre estilos',[
  'Cinco estilos, '+dossier.decisionMatrix.pairCount+' pares comparados; '+
   dossier.decisionMatrix.repeatedPairs+' pares com listas idênticas e '+
   dossier.decisionMatrix.similarPairs80+' pares com 80% ou mais de sobreposição.',
  ...dossier.decisionMatrix.pairs.map(p=>
   tacticLabelFor(p.first)+' × '+tacticLabelFor(p.second)+': '+
   (p.overlapPercent===null?'sem candidatos equipáveis documentados':
    p.overlapPercent+'% de habilidades coincidentes')+
   ' · primeiro ímpeto '+(p.boosterSame?'igual':'diferente ou pendente')),
  ...dossier.decisionMatrix.warnings.map(w=>'ATENÇÃO: '+w)
 ]);
 addSection('Variação entre os cinco estilos do técnico',[
  'A habilidade prioritária muda entre '+dossier.tacticalStability.topSkillVariations+
   ' resultados diferentes.',
  'O ímpeto prioritário muda entre '+dossier.tacticalStability.boosterVariations+
   ' resultados diferentes.',
  'Estabilidade da opção não equivale a desempenho superior em campo.'
 ]);
 if(dossier.contextualNatives.length){
  addSection('Habilidades nativas especiais cadastradas (não são adicionais)',
   dossier.contextualNatives.map(c=>c.name+' · contexto: '+c.group+
    ' · efeito específico NÃO validado na edição'));
 }
 if(dossier.unmappedNative.length){
  addSection('Nativas pendentes de interpretação, preservadas sem substituição',
   dossier.unmappedNative);
 }
 if(dossier.trainingCategories.length)addSection('Vetor registrado (níveis por categoria, não atributos finais)',
  dossier.trainingCategories.map(c=>c.name+': '+c.level));
 addSection('Como jogar nesta função (orientação, não teste de partidas)',
  [...dossier.playbook.steps,'Evitar: '+dossier.playbook.warning]);
 addSection('Comparação conservadora: todos os estilos',dossier.scenarios.map(t=>
  tacticLabelFor(t.style)+' · skill inicial: '+(t.firstSkill||'nenhuma')+
  ' · ímpeto: '+(t.booster||'pendente')+
  ' · margem: '+(t.margin??'pendente')+' · não equipar automaticamente'
 ),'scenario');
 addSection('Ímpetos · matriz comparativa dos motivos',[
  dossier.boosterDecisionEvidence.rankExplanation,
  ...dossier.boosterDecisionEvidence.candidates.map(x=>
   '#'+x.rank+' '+x.displayName+' · pontuação relativa '+x.relativeScore+
   ' · função '+x.factors.funcao+' · treino '+x.factors.investimento+
   ' · contexto '+x.factors.contexto+' · base '+x.factors.atributosBase),
  ...dossier.boosterDecisionEvidence.warnings.map(x=>'PENDENTE: '+x)
 ]);
 if(dossier.boosterComplementarity.factoryDocumented){
  addSection('Ímpetos vs. atributos do ímpeto fixo',
   dossier.boosterComplementarity.comparisons.map(x=>x.documentedName+
    ' · '+x.shared+'/4 atributos coincidentes com o fixo · '+
    'diferentes: '+x.uniqueStatKeys.join(', ')));
  if(dossier.boosterComplementarity.lowOverlapAlternative){
   addSection('Alternativa de menor sobreposição (sem prova de superioridade)',[
    dossier.boosterComplementarity.lowOverlapAlternative.documentedName+
    ' · pontuação '+dossier.boosterComplementarity.lowOverlapAlternative.relativeScore+
    ' · '+dossier.boosterComplementarity.lowOverlapAlternative.warning
   ]);
  }
 }
 const auditNote=document.createElement('p');auditNote.className='v274-audit';
 auditNote.textContent='AUDITORIA DE FONTES: habilidades especiais são nomes nativos cadastrados, não tokens selecionáveis. Sem comprovação de builds de Rentão/Blackjhon, atributos finais ou desempenho em partidas nesta edição. Não gastar fichas ou ímpetos apenas pela nota.';
 dossierContent.append(auditNote);
 addSection('Provas e conferências prioritárias',
  dossier.evidencePending.length?dossier.evidencePending:
   ['Informações cadastrais sem bloqueios automáticos; gameplay e validação humana continuam necessários.']);
 const ul=section.querySelector('#v162-skills');ul.replaceChildren();
 for(const [i,skill] of proposed.entries()){
  const li=document.createElement('li'),rank=document.createElement('span'),
   b=document.createElement('strong'),reason=document.createElement('span'),
   breakdown=document.createElement('details'),summary=document.createElement('summary'),
   p=document.createElement('p'),score=document.createElement('span');
  rank.className='v272-skill-rank';rank.textContent=String(i+1).padStart(2,'0');
  b.textContent=skill.name;score.className='v272-score';score.textContent='· '+skill.score+' pts relativos';
  reason.className='v272-skill-reason';reason.textContent=skill.why+' '+skill.priorityNote;
  const factors=skill.criterios||{};
  breakdown.className='v272-criteria';summary.textContent='Entender por que esta habilidade foi priorizada';
  p.textContent='Critérios: função '+(factors.funcao??'—')+' · tática '+(factors.tatica??'—')+
   ' · estilo '+(factors.estilo??'—')+' · nativas '+(factors.nativas??'—')+
   ' · investimento PP '+(factors.investimento??'—')+
   '. '+(skill.synergies?.length?skill.synergies.join('; ')+'. ':'')+
   'A pontuação é comparativa, não prova status finais nem desempenho.';
  breakdown.append(summary,p);li.append(rank,b,score,reason,breakdown);ul.appendChild(li);
 }
 for(let i=proposed.length;i<(remaining??0);i++){
  const li=document.createElement('li');li.textContent='Vaga '+(result.alreadyEquippedProvided+i+1)+'/5 · Sem habilidade adicional segura nesta base; confirmar compatibilidade e skills atuais antes de preencher.';ul.appendChild(li);
 }
 if(result.equippedConfirmed&&remaining===0){const li=document.createElement('li');li.textContent='Nenhum slot adicional restante: as cinco habilidades equipadas foram conferidas nesta edição. Alternativas são apenas para comparação.';ul.appendChild(li)}
 if(result.manualOverLimit){const li=document.createElement('li');li.textContent='LISTA INVÁLIDA: mais de cinco habilidades diferentes informadas. Corrija o cadastro antes de usar novas sugestões.';ul.appendChild(li)}
 section.querySelector('#v162-alts').textContent=
  (result.equippedConfirmed&&remaining===0?'Slots completos: nenhuma sugestão adicional pode ser equipada. ':'Prioridades por função, não instalação automática. ')+
  (result.alternatives.length?'Opções comparativas: '+result.alternatives.map(x=>x.name).join(' · ')+'.':
   'Confira disponibilidade e compatibilidade no jogo.');
 const source=section.querySelector('#v162-source');source.replaceChildren();
 const line=(value)=>{const p=document.createElement('p');p.textContent=value;source.appendChild(p)};
 line('Ímpeto de fábrica: '+String(d.boost1||'não documentado'));
 line('Segundo ímpeto no acervo: '+String(d.boost2||'não documentado'));
 const named=boost.status==='nome_registrado';
 const verifiedLabel=({vazio:'Slot vazio confirmado por você',ocupado:'Slot ocupado confirmado por você',ausente:'Sem slot, conforme sua conferência',pendente:'Verificação pendente'})[manuallyVerified.status]||'Ainda não conferido neste dispositivo';
 line('Estado de sua conta: '+verifiedLabel+(manuallyVerified.equipped?' · '+manuallyVerified.equipped:''));
 if(manuallyVerified.status&&!Object.hasOwn(manuallyVerified,'edition'))
  line('Conferência legada sem edição explícita: confira o slot no jogo antes de gastar ímpetos.');
 if(USER_SLOT_NOTES[Number(d.capture)])line('Relato seu (a confirmar na tela do jogo): '+USER_SLOT_NOTES[Number(d.capture)]);
 const panel=section.querySelector('#v162-booster');panel.replaceChildren();
 const title=document.createElement('p');title.style.fontWeight='800';
 const tacticLabel=host.SCOUT_BOOSTERS_V103?.TACTIC_LABEL?.[tactic]||tactic;
 const boosterLabel=boost.primary?.nome_pt||boost.primary?.nome;
 title.textContent=boost.primary?
  'Ímpeto para comparar em '+tacticLabel+': '+boosterLabel+' +1':
  'Sem ímpeto calculável para esta função';
 panel.appendChild(title);
 const applicability=document.createElement('p');applicability.style.fontWeight='700';
 applicability.textContent=boost.equipStatus==='impossivel_na_conta'?'Sua conferência indica que esta carta não possui slot: a escolha é somente comparativa.':
 boost.equipStatus==='comparacao_segundo_fixo'?'Há segundo ímpeto fixo registrado: esta é apenas a melhor alternativa teórica, não uma opção para substituir.':
 boost.equipStatus==='ocupado_na_conta'?'Você confirmou que o segundo slot está ocupado: comparação informativa, sem possibilidade de equipar outro ímpeto.':
 boost.equipStatus==='slot_pendente_no_catalogo'?'Slot selecionável PENDENTE na edição: prioridade apenas teórica, mesmo que você tenha marcado vazio. Conferir no jogo antes de gastar tokens.':
 boost.equipStatus==='slot_nao_documentado'?'Sem segundo slot comprovado no catálogo: comparação teórica, não gastar tokens nem considerar slot livre.':
 boost.equipStatus==='condicionado_a_slot'?'Indicação para o segundo slot, confirmada localmente como vaga mas ainda não homologada em gameplay.':
 'Recomendação pronta; falta confirmar se esta edição possui segundo slot selecionável. Não exige que você insira um ímpeto para descobrir qual seria o melhor.';
 panel.appendChild(applicability);
 if(boost.complementarity.factoryDocumented&&boost.primary){
  const overlap=boost.complementarity.comparisons[0];
  const caution=document.createElement('p');caution.className='v276-boostnote';
  caution.textContent='Complementaridade com o ímpeto fixo: '+overlap.shared+
   ' de 4 atributos coincidem. '+(overlap.shared>=3?
    'ALTA SOBREPOSIÇÃO: compare a alternativa e os atributos da build.':
    'Sobreposição informativa, não estimativa de ganho.')+
   (boost.complementarity.lowOverlapAlternative?
    ' Alternativa menos repetitiva: '+boost.complementarity.lowOverlapAlternative.documentedName+'.':'');
  panel.append(caution);
 }
 if(boost.primary){
 if(!boost.primary.traducao_documentada){
  const translation=document.createElement('p');
  translation.textContent='Nome técnico do ímpeto ('+boost.primary.nome+
   '): tradução PT-BR ainda sem comprovação documental. Confira no jogo.';
  panel.appendChild(translation);
 }
 const why=document.createElement('p');why.textContent='Por que esta carta: '+boost.primary.motivo;panel.appendChild(why);
 const atr=document.createElement('p');atr.textContent='Atributos afetados pelo ímpeto: '+boost.primary.atributos.join(', ')+'. Não são valores finais calculados.';panel.appendChild(atr);
 if(boost.alternatives.length){
  const comparison=document.createElement('details');comparison.className='v272-booster-compare';
  const summary=document.createElement('summary');
  summary.textContent='Comparar '+(boost.alternatives.length+1)+' ímpetos por atributos';
  const list=document.createElement('ol');
  for(const candidate of [boost.primary,...boost.alternatives]){
   const li=document.createElement('li');
   li.textContent=(candidate.nome_pt||candidate.nome)+' · '+candidate.score+
    ' pontos relativos · '+candidate.atributos.join(' / ')+'. '+candidate.motivo;
   list.appendChild(li);
  }
  comparison.append(summary,list);panel.appendChild(comparison);
 }
 const uncertainty=document.createElement('p');uncertainty.className='v200-booster-caution';
 uncertainty.textContent=boost.spread!==null&&boost.spread<2?
  'ESCOLHA MUITO PRÓXIMA DAS ALTERNATIVAS. Não vale gastar pedras sem conferir a build final e o slot no eFootball.':
  boost.confidence==='baixa'?'DADOS INDIVIDUAIS INCOMPLETOS. Esta escolha é provisória; não gastar pedras com base só nela.':
  'Escolha consultiva para a build registrada. Os níveis não comprovam quanto falta de velocidade, passe ou finalização. Compare no jogo antes de gastar pedras.';
 panel.appendChild(uncertainty);
 const details=document.createElement('details');details.className='v200-evidence';
 const summary=document.createElement('summary');summary.textContent='Como esta recomendação foi calculada';details.appendChild(summary);
 const e=boost.primary.evidencias||{};
 const explain=document.createElement('p');
 explain.textContent='Pontuação relativa (não Overall): função '+(e.score_funcao??'—')+' · complementaridade do investimento '+(e.score_complemento??'—')+' · estilo e habilidades '+(e.score_contexto??'—')+
 ' · bases comprovadas '+(e.score_base??0)+'. '+
 (e.base_status==='base_completa_confirmada'?
  'Atributos-base completos com fonte desta edição: comparação relativa limitada, NÃO atributos finais.':
  'Atributos-base pendentes ou parciais: ignorados na pontuação. ')+(e.treino==='investimento_da_build_sem_atributos_finais'?
  'Vetor de progresso com custo de PP matematicamente conferido; não comprova atributos finais ou desempenho.':
  e.pp_status==='pp_divergentes'?'ALERTA: custo calculado '+e.pp_investidos+
   ' PP, mas o orçamento da carta informa '+e.pp_orcamento+
   '. O motor IGNOROU o vetor ao ranquear ímpetos.':
  e.pp_status==='pp_nao_documentados'?'PP não documentados: vetor IGNORADO.':
  e.pp_status==='treino_proposto_nao_validado'?'Treino proposto não validado: vetor IGNORADO.':
  'Sem vetor documental utilizável para comparar investimento de PP.')+
  ' Ímpeto fixo informado: '+(e.impeto_fixo||'não comprovado')+'.';
 details.appendChild(explain);panel.appendChild(details);
}
 const note=document.createElement('p');note.className='v162-note';note.textContent=boost.note;panel.appendChild(note);
 const jump=document.createElement('a');jump.href='../revisao-impetos-v103.html?c='+Number(d.capture);jump.textContent='Confirmar o slot, o ímpeto equipado e as opções desta carta ↗';jump.style.color='#8dd8f7';jump.style.fontWeight='700';panel.appendChild(jump);
}
section.querySelectorAll('[data-tactic]').forEach(b=>b.addEventListener('click',()=>{tactic=b.dataset.tactic;draw();document.dispatchEvent(new CustomEvent('scoutpro:tactic-ui-selected-v220',{detail:{tactic}}))}));
 document.addEventListener('scoutpro:tactic-selected-v220',e=>{if(['posse','normal','rapido','fora','longo'].includes(e.detail?.tactic)){tactic=e.detail.tactic;draw()}});
 // V251: harmonizar também o painel legado de habilidades/ímpetos, não apenas
 // a ficha principal, desde que a versão EXATA da carta seja identificada.
 host.addEventListener('scoutpro:role-selected-v263',event=>setConfirmedRole(event.detail));
 // Revalidar também a última seleção caso o V251 inicialize primeiro.
 if(host.SCOUT_ROLE_SELECTION_V263)setConfirmedRole(host.SCOUT_ROLE_SELECTION_V263);
 host.addEventListener('scoutpro:v251:canonical-data',event=>{
  const row=event.detail||{};
  if(Number(row.capture)!==Number(d.capture)||String(row.id)!==String(d.id)||
   String(row.name)!==String(d.name)||String(row.edition)!==String(d.edition))return;
  for(const field of ['native_skills','attack_style','defence_style','boost1','boost2',
   'recommended_levels','base_stats_known',
   'base_stats','base_stats_proof','base_catalog_proof']){
   if(Object.hasOwn(row,field))d[field]=row[field];
  }
  draw();
  document.dispatchEvent(new CustomEvent('scoutpro:skills-updated',{
   detail:{capture:Number(d.capture),card_id:String(d.id),source:'catalogo_v251'}
  }));
 });

section.querySelector('#v162-save').addEventListener('click',()=>{
 const proposedText=ta.value.trim().slice(0,700);
 const requested=verifiedCheck.checked;
 const precheck=evaluate(d,tactic,proposedText,{equippedConfirmed:true});
 if(requested&&precheck.requiresReconciliation){
  section.querySelector('#v162-feedback').textContent=
   'CONFERÊNCIA NÃO SALVA: há habilidade nativa repetida entre adicionais ou mais de cinco diferentes. Revise o Plano de Jogo.';
  verifiedCheck.checked=false;
  return;
 }
 let saved=false;
 try{
  // A impressão digital vincula a confirmação à lista e à edição.
  // Falha entre os writes invalida a marca antiga pelo fingerprint.
  localStorage.setItem(storage,proposedText);
  if(requested){
   localStorage.setItem(verifyKey,JSON.stringify({
    schema:'CRAQUE_ADDITIONAL_V254',capture:Number(d.capture),
    card_id:String(d.id),edition:String(d.edition||d.versao||''),
    confirmed:true,fingerprint:fingerprint(proposedText),
    nativeFingerprint:fingerprint(d.native_skills||d.habilidades_nativas||''),
    confirmed_at:new Date().toISOString()
   }));
  }else localStorage.removeItem(verifyKey);
  extra=proposedText;saved=true;
  section.querySelector('#v162-feedback').textContent=requested?
   'Lista completa confirmada nesta edição. Vagas disponíveis recalculadas.':
   'Lista parcial salva: não assumiremos que há slots livres.';
 }catch(_e){
  section.querySelector('#v162-feedback').textContent=
   'Não foi possível salvar a conferência. Confira o armazenamento deste dispositivo.';
  extra=localStorage.getItem(storage)||'';
 }
 draw();
 if(saved){
  document.dispatchEvent(new CustomEvent('scoutpro:skills-updated',{
   detail:{capture:Number(d.capture),card_id:String(d.id)}
  }));
  host.dispatchEvent(new CustomEvent('craque:data-changed',{
   detail:{key:storage,edition:String(d.id)}
  }));
 }
});
draw();
})(typeof window!=='undefined'?window:null);
