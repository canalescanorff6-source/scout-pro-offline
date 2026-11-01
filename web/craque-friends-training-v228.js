/* Craque Tático V228 — simulação de PP, cinco habilidades e booster por carta de terceiros.
 * Reaproveita exatamente os motores V220, V162 e V103, SEM consultar/escrever nas 246 cartas.
 * Resultados hipotéticos, nunca apresentados como atributos finais, ficha oficial ou equipamento.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_FRIEND_TRAINING_V228=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const MODES=['posse','normal','rapido','fora','longo'];
const LABEL={posse:'Posse de Bola',normal:'Contra-Ataque Normal',rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Bola Longa'};
// V309: mesmo cálculo para Minhas Cartas e todos os outros elencos.
const progression=typeof window!=='undefined'?window.CRAQUE_PP_UNIVERSAL_V309:
  require('./craque-pp-universal-v309.js');
if(!progression)throw Error('Motor universal de PP ausente. Verifique a instalação offline.');
const levelBudget=progression.budget,resolveBudget=progression.resolve;
// V359: o cálculo competitivo de TODOS os acervos passa pelos MESMOS
// motores V251 (distribuição) e V233 (interpretação) de Minhas Cartas.
// Dependências consultadas ao abrir: preservar o carregamento assíncrono.
const primaryEngines=deps=>({
 individual:deps?.individual||(typeof window!=='undefined'?
  window.CRAQUE_FICHA_INDIVIDUAL_V251:require('./craque-ficha-individual-v251.js')),
 interpretation:deps?.interpretation||(typeof window!=='undefined'?
  window.CRAQUE_INTERPRETATION_V233:require('./craque-role-intelligence-v233.js'))
});
const METHODOLOGY='V251/V233 · mesma engenharia das fichas principais';
const getDeps=(deps)=>deps||{
 tactical:typeof window!=='undefined'?window.SCOUT_TACTICS_V220:null,
 skills:typeof window!=='undefined'?window.SCOUT_RECOMMENDATIONS_V162:null,
 boosters:typeof window!=='undefined'?window.SCOUT_BOOSTERS_V103:null
};
const profileOf=card=>({
 capture:card.capture??null,id:String(card.cardId||''),edition:String(card.edition||''),
 posicao:card.position||'',shown_position:card.position||'',
 attack_style:card.style||'',estilo_ataque:card.style||'',
 defence_style:card.defenceStyle||'',estilo_defesa:card.defenceStyle||'',
 native_skills:card.nativeSkills||'',habilidades_nativas:card.nativeSkills||'',
 impeto_fixo:card.fixedBooster||'',boost1:card.fixedBooster||'',
 // V321: status MANUAL de slot vazio não comprova que a edição tenha um
 // segundo slot SELECIONÁVEL no catálogo. Não fabricar evidência circular.
 // Nome equipado, quando informado, permanece intacto, inclusive se houver
 // conflito entre "vazio" e o nome cadastrado.
 impeto_extra:card.booster||'PENDENTE',
 boost2:card.booster||'PENDENTE',
 pp:resolveBudget(card).pp,niveis:null
});
function sourceSignature(card){
 const signatureParts=[
  'motor-individual-v359',card.name,card.cardId,card.edition,card.position,card.style,card.pp,
  card.nativeSkills,card.skills,card.booster,card.fixedBooster,card.boosterSlot,card.trainingLevels
 ];
 // Preservar assinaturas V228 de builds manuais existentes; apenas o PP derivado
 // precisa incluir o nível máximo para invalidar a hipótese se ele mudar.
 if(card.pp===null||card.pp===undefined)signatureParts.push(card.level);
 if(card.defenceStyle)signatureParts.push('defenceStyle',card.defenceStyle);
 if(card.managerId)signatureParts.push('manager',String(card.managerId));
 const serialized=JSON.stringify(signatureParts);
 // Marca de atualização, NÃO assinatura de segurança (backup usa SHA-256).
 let h=2166136261>>>0,j=0x9e3779b9>>>0;
 for(let i=0;i<serialized.length;i++){
  const n=serialized.charCodeAt(i);
  h=Math.imul(h^n,16777619)>>>0;
  j=Math.imul(j+n,2246822519)>>>0;
 }
 return 'v228:'+serialized.length.toString(36)+':'+h.toString(16)+':'+j.toString(16);
}
function parseBaseline(card,t){
 const raw=String(card.trainingLevels||'').trim();
 if(!raw)return {levels:null,error:null};
 const parts=raw.split(/[,\s;]+/).filter(Boolean),values=parts.map(Number);
 if(parts.length!==10||!values.every(x=>Number.isInteger(x)&&x>=0&&x<=20)||!t.valid(values))
  return {levels:null,error:'Treino anterior inválido: informe os 10 níveis (0 a 20) na ordem das categorias.'};
 if(t.total(values)!==resolveBudget(card).pp)
  return {levels:null,error:'O treino anterior não fecha os PP informados; revise os dez grupos.'};
 const role=t.roleOf(profileOf(card)),allowed=role==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6];
 if(values.some((x,i)=>x>0&&!allowed.includes(i)))
  return {levels:null,error:'Treino informado usa categorias fora da função escolhida; confirme a posição.'};
 return {levels:values,error:null};
}
// Paridade V359: utilizar a distribuição exata da engenharia V251 e a leitura
// V233. Não converter OVR/atributos do eFHub com técnico em atributos-base.
// Na falta de motor, não apresentar a heurística antiga como equivalente.
function allocate(card,tactic,deps){
 const {tactical:t}=getDeps(deps),{individual,interpretation}=primaryEngines(deps);
 if(!t?.strategy||!t?.ppCost||!t?.valid||!t?.roleOf)
  throw Error('Motor tático V220 indisponível; nenhuma ficha pode ser calculada.');
 if(!MODES.includes(tactic))throw Error('Estilo tático inválido.');
 const progress=resolveBudget(card),budget=progress.pp;
 const source=profileOf(card),role=t.roleOf(source);
 const pending=reason=>({status:'pendente',reason,levels:null,role:role||null,
  methodology:METHODOLOGY});
 if(!role)return pending('Cadastre uma posição reconhecida para analisar esta função.');
 if(!Number.isInteger(budget)||budget<0||budget>300)
  return pending(progress.reason||'Informe o nível máximo e PP da edição exata.');
 if(!individual?.allocate||!interpretation?.interpret)
  return pending('Engenharia individual V251/V233 não carregada. Não usar ficha genérica.');
 // Identidade incompleta mantém a comparação matemática em estado hipotético.
 // A avaliação abaixo NÃO a converterá em versão comprovada nem autorizará uso.

 const aligned={...source,id:String(card.cardId),card_id:String(card.cardId),
  edition:String(card.edition),versao:String(card.edition),pp:budget,
  max_level:card.level??null,
  // Esta fonte NÃO é comprovante de nível conferido dentro do eFootball.
  pp_origem:'nivel_informado_no_cadastro_externo',
  recommended_levels:null,niveis:null,base_stats_known:false,
  pp_estimado:progress.source==='manual_divergente'};
 const context=interpretation.interpret(aligned,tactic,null);
 if(!context||context.role!==role||!Array.isArray(context.weights)||
    context.weights.length!==10)return pending('Interpretação individual da edição indisponível.');
 const baseline=parseBaseline(card,t);
 const levels=individual.allocate(context.weights,context.role,budget,baseline.levels);
 if(!t.valid(levels)||t.total(levels)!==budget)
  return pending('Motor V251 não encontrou distribuição compatível com os PP.');
 const differences=baseline.levels?t.CATEGORIES.flatMap((name,i)=>
  baseline.levels[i]!==levels[i]?[{name,was:baseline.levels[i],proposed:levels[i]}]:[]):[];
 return {
  status:'hipotese',role:context.role,levels,pp:budget,remaining:0,
  categories:t.CATEGORIES,style:tactic,
  focus:{...t.focus(source,tactic),priority:context.priorities.slice(0,4).map(x=>({
   index:x.index,name:x.name,weight:x.weight}))},
  evidence:[...context.signals],baselineValid:Boolean(baseline.levels),
  baselineError:baseline.error,differences,
  methodology:METHODOLOGY,
  tests:context.tests.slice(),
  tradeoffs:context.tradeoffs.slice(),
  confidence:'hipotese_documental_sem_gameplay',
  note:'Mesmo motor de distribuição V251 e interpretação V233 de Minhas Cartas; comparação individual por função, estilo, habilidades e PP. NÃO otimiza Overall e NÃO prova desempenho real nem autoriza trocar treino aprovado.'
 };
}
/* V373 — dossiê PRO usa SÓ as hipóteses do motor oficial V251/V233/V162/V103.
   Rentão/Blackjhon são referência de critérios, não autores destas builds. */
function professionalAudit(card,result){
 const sk=result.skills,boost=result.booster,plan=result.plan;
 const byKey=new Map((sk?.rankedCandidates||[]).map(x=>[x.key,x]));
 const portfolio=(sk?.balancedPortfolio?.candidates||[]).slice(0,5).map((x,i)=>{
  const r=byKey.get(x.key);return {
   priority:i+1,name:x.name,family:x.family,explanation:x.explanation,
   functionReason:r?.decision?.reason||r?.why||'Função a conferir',
   situation:r?.decision?.situation||null,
   nativeRelation:r?.decision?.nativeRelation||null,
   eligibility:r?.decision?.eligibility||'pendente',
   applyAuthorized:false};
 });
 const overlap=boost?.complementarity?.comparisons||[];
 const boosters=(boost?.decisionEvidence?.candidates||[]).slice(0,3).map((x,i)=>{
  const original=i===0?boost.primary:boost.alternatives?.[i-1];
  return {priority:i+1,name:x.displayName||x.technicalName,
   technicalName:x.technicalName,relativeScore:x.relativeScore,
   axes:(original?.atributos||[]).slice(0,4),
   overlapWithFixed:Number.isInteger(overlap[i]?.shared)?overlap[i].shared:null,
   factors:x.factors,applyAuthorized:false};
 });
 const issues=[];
 if(!result.identityConfirmed)issues.push('Card ID e edição exata pendentes: não copiar treinos de outra versão.');
 else issues.push('Card ID informado com formato plausível, mas não é recibo da edição.');
 if(!sk?.nativeKnown)issues.push('Inventário de habilidades nativas pendente.');
 if(sk?.requiresReconciliation)issues.push('Habilidades adicionais/nativas em conflito ou sem confirmação.');
 if(result.freeSkillSlots===null)issues.push('Vagas livres de skills NÃO comprovadas: cinco opções não significam cinco vagas.');
 if(!plan?.levels)issues.push('Treino e PP pendentes. Não substituir build aprovada.');
 if(plan?.baselineError)issues.push(plan.baselineError);
 if(!boost?.slotSupported)issues.push('Segundo slot de ímpeto NÃO comprovado.');
 if(!boost?.complementarity?.factoryDocumented)
  issues.push('Ímpeto fixo não identificado; complementaridade não comprovada.');
 issues.push(...(boost?.decisionEvidence?.warnings||[]));
 return Object.freeze({
  schema:'craque-pro-v373',role:plan?.role||null,tactic:result.tactic,
  creatorMethod:'critérios competitivos inspirados em Rentão/Blackjhon, sem vídeo da edição atribuído',
  status:'HIPOTESE_SEM_HOMOLOGACAO',noOverall:true,autoWrite:false,
  trainingStatus:plan?.status||'pendente',trainingDifferences:(plan?.differences||[]).slice(),
  baselineValid:plan?.baselineValid===true,
  proposedLevels:plan?.levels?plan.levels.slice():null,
  skillsStatus:!sk?.nativeKnown?'nativas_pendentes':sk?.requiresReconciliation?'conciliar':'consultivo',
  freeSkillSlots:result.freeSkillSlots,
  skillPortfolio:portfolio,boosterAlternatives:boosters,
  factoryBooster:boost?.natural||null,
  fixedOverlapVerified:boost?.complementarity?.factoryDocumented===true,
  slotSupported:boost?.slotSupported===true,
  tokenSpendAuthorized:false,
  roleTests:(plan?.tests||[]).slice(0,5),
  tradeoffs:(plan?.tradeoffs||[]).slice(0,5),
  issues:[...new Set(issues)]
 });
}
/* V374: one individual function review for the 246 originals and additions.
   Category investment is compared directly; it is never final-attribute proof. */
function functionReview(card,result,currentLevels,provided){
 const deps=getDeps(provided),t=deps.tactical,{interpretation}=primaryEngines(provided);
 const analysis=interpretation?.interpret?.(profileOf(card),result.tactic,null);
 const budget=result.plan.pp??result.progress.pp;
 const role=result.plan.role||analysis?.role;
 const allowed=role==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6];
 const usable=levels=>Number.isInteger(budget)&&t?.valid?.(levels)&&t.total(levels)<=budget&&
  levels.every((n,i)=>n===0||allowed.includes(i));
 const baseline=currentLevels===undefined?parseBaseline(card,t).levels:currentLevels;
 const current=usable(baseline)?baseline.slice():null;
 const proposed=result.plan.status==='hipotese'&&usable(result.plan.levels)&&
  t.total(result.plan.levels)===budget?result.plan.levels.slice():null;
 const positionCode=value=>({AC:'CA',ZC:'ZG',DC:'ZG',DD:'LD',DE:'LE',GR:'GO',MO:'MAT',MC:'MLG',ME:'MLG',MDF:'VOL'})[value]||String(value||'');
 const sourcePosition=positionCode(card.originalPosition||card.position);
 const position=positionCode(card.position);
 const nativeSkills=String(card.nativeSkills||'').split(/[;,\n]+/).map(x=>x.trim()).filter(Boolean);
 const nativeKeys=new Set(nativeSkills.map(x=>deps.skills?.keyFor?.(x)).filter(Boolean));
 const skillLabels=provided?.skillLabels||(typeof window!=='undefined'?window.SCOUT_SKILL_NAMES_V196:
  require('./skill-names-v196.js'));
 const skillLabel=name=>skillLabels?.supported?.(name)?skillLabels.display(name):
  deps.skills?.SKILLS?.[deps.skills?.keyFor?.(name)]?.name||name;
 const boosterLabels=provided?.boosterLabels||(typeof window!=='undefined'?window.CRAQUE_IMPETOS_PTBR_V230:
  require('./craque-impetos-ptbr-v230.js'));
 const boosterLabel=value=>boosterLabels?.translate?boosterLabels.translate(value):
  String(value||'').replace(/^([^+]+?)(\s*\+.*)?$/,(_all,name,suffix)=>
   (deps.boosters?.displayName?.(name.trim())||name.trim())+(suffix||''));
 const equippedSkills=String(card.skills||'').split(/[;,\n]+/).map(x=>x.trim()).filter(Boolean);
 const suggestions=(result.suggestedSkills||[]).filter(x=>{
  const key=deps.skills?.keyFor?.(x.name);return !key||!nativeKeys.has(key);
 }).slice(0,5).map(x=>({name:x.name,reason:x.decision?.reason||x.why||x.reason||'Recurso para testar nesta função',
  situation:x.decision?.situation||x.situation||'Conferir a execução nesta função e estilo.',
  trainingRelation:x.decision?.attributeRelation||'Sem atributos finais confirmados para quantificar o benefício.',
  nativeRelation:x.decision?.nativeRelation||'Comparar com o inventário nativo desta edição.',
  eligibility:x.decision?.eligibility||'pendente',applyAuthorized:false}));
 const changes=current&&proposed?proposed.flatMap((to,i)=>to===current[i]?[]:[{
  index:i,category:t.CATEGORIES[i],from:current[i],to,
  deltaPP:t.ppCost(to)-t.ppCost(current[i])
 }]):[];
 return {
  schema:'CRAQUE_FUNCTION_REVIEW_V374',sourcePosition,position,role,tactic:result.tactic,
  identity:{name:String(card.name||'Carta sem nome'),cardId:String(card.cardId||''),
   edition:String(card.edition||''),localKey:String(card.localKey||''),
   capture:Number.isInteger(card.capture)?card.capture:
    /^\d+@/.test(String(card.localKey||''))?Number(String(card.localKey).split('@')[0]):null},
  tacticLabel:LABEL[result.tactic],playerStyle:String(card.style||'Não cadastrado'),
  job:analysis?.job||'Função pendente de identificação',
  eligibleForLineup:position===sourcePosition||card.positionEvidence?.eligible===true,
  positionEvidence:card.positionEvidence?.text||
   (position===sourcePosition?'Posição original cadastrada':'Familiaridade secundária ainda não comprovada'),
  priorities:(analysis?.priorities||[]).slice(0,4).map(x=>({index:x.index,category:x.name,attributes:x.stats})),
  pp:Number.isInteger(budget)?budget:null,current,proposed,
  trainingGroups:proposed?t.CATEGORIES.flatMap((category,i)=>allowed.includes(i)?[{
   index:i,category,proposed:proposed[i],cost:t.ppCost(proposed[i]),current:current?.[i]??null
  }]:[]):[],
  spent:proposed?t.total(proposed):null,currentSpent:current?t.total(current):null,changes,
  redistributedPP:Math.min(changes.reduce((n,x)=>n+Math.max(0,x.deltaPP),0),
   changes.reduce((n,x)=>n+Math.max(0,-x.deltaPP),0)),
  investedFromBalance:current&&proposed?Math.max(0,t.total(proposed)-t.total(current)):0,
  nativeSkills,nativeSkillLabels:nativeSkills.map(skillLabel),skills:suggestions,
  equippedSkills,equippedSkillLabels:equippedSkills.map(skillLabel),
  freeSkillSlots:Number.isInteger(result.freeSkillSlots)?result.freeSkillSlots:null,
  fixedBooster:card.fixedBooster||null,
  fixedBoosterLabel:boosterLabel(card.fixedBooster||''),
  equippedBooster:card.booster||null,boosterSlot:String(card.boosterSlot||'pendente'),
  equippedBoosterLabel:boosterLabel(card.booster||''),
  boosterSlotSupported:result.booster?.slotSupported===true,
  boosters:[result.booster?.primary,...(result.booster?.alternatives||[])].filter(Boolean).slice(0,3)
   .map(x=>({name:boosterLabels?.label?.(x.nome)||x.nome_pt||x.nome,technicalName:x.nome,
    attributes:(x.atributos||[]).slice(0,4),reason:boosterLabel(x.motivo||'Comparar estes atributos na função escolhida.'),
    applyAuthorized:false})),
  baseReference:card.baseReference===true?'Referência numérica parcial cadastrada':'Atributos-base completos pendentes',
  finalAttributesVerified:false,
  tests:(result.plan.tests||analysis?.tests||[]).slice(0,3),
  canSave:Boolean(proposed&&String(card.localKey||'').trim()),
  note:'Proposta de investimento por função e estilo; salvar cria uma revisão independente, sem equipar habilidades ou alterar a carta.'
 };
}
/* V375: the complete usable sheet is the same on screen and in exports.
   Pure formatting: no reads/writes to account equipment, drafts or catalog. */
function functionSheetText(review){
 if(!review||review.schema!=='CRAQUE_FUNCTION_REVIEW_V374')throw Error('Ficha por função indisponível.');
 const id=review.identity||{},capture=Number.isInteger(id.capture)?'#'+String(id.capture).padStart(3,'0')+' · ':'';
 const out=['CRAQUE TÁTICO · FICHA POR FUNÇÃO',capture+(id.name||'Carta sem nome'),
  'Edição: '+(id.edition||'pendente')+' · Card ID: '+(id.cardId||'pendente'),
  'Posição original: '+review.sourcePosition+' → função: '+review.position,
  'Estilo coletivo: '+review.tacticLabel,'Estilo individual cadastrado: '+review.playerStyle,
  'Familiaridade: '+review.positionEvidence,review.job,'','TREINO PROPOSTO'];
 if(review.proposed){
  out.push(review.spent+' / '+review.pp+' PP · níveis de categoria, não atributos finais');
  for(const g of review.trainingGroups)out.push(g.category+': '+g.proposed+' níveis · '+g.cost+' PP'+
   (Number.isInteger(g.current)?' · atual '+g.current:''));
  if(review.current)out.push('Realocação: '+review.redistributedPP+' PP · uso do saldo: '+review.investedFromBalance+' PP');
 }else out.push('PP pendentes: confirmar o nível máximo e o orçamento da edição.');
 out.push('','NATIVAS DA EDIÇÃO',(review.nativeSkillLabels||review.nativeSkills).join(' · ')||'Inventário pendente',
  '','ADICIONAIS JÁ INFORMADAS',(review.equippedSkillLabels||review.equippedSkills)?.join(' · ')||'Nenhuma informada; isso não comprova vagas livres.',
  '','HABILIDADES ADICIONAIS · CANDIDATAS',review.freeSkillSlots===null?
   'Vagas livres não comprovadas. Conferir a lista no jogo antes de gastar tokens.':
   'Vagas livres conferidas: '+review.freeSkillSlots);
 if(!review.skills.length)out.push('Sem nova candidata disponível; conferir inventário e equipamentos.');
 if(review.fixedProgression)out.push('EDIÇÃO TRENDING COM PROGRESSÃO FIXA · sem distribuição de PP, novas habilidades ou ímpeto selecionável.');
 review.skills.forEach((s,i)=>out.push((i+1)+'. '+s.name+' — '+s.reason,
  '   Situação: '+s.situation,'   Complemento às nativas: '+s.nativeRelation,
  '   Relação com o treino: '+s.trainingRelation));
 out.push('','ÍMPETO PRINCIPAL',
  'Fixo cadastrado: '+(review.fixedBoosterLabel||review.fixedBooster||'pendente'),
  'Extra já informado: '+(review.equippedBoosterLabel||review.equippedBooster||'nenhum informado'),
  'Slot extra: '+review.boosterSlot+(review.boosterSlotSupported?' · edição com suporte documentado':' · suporte da edição não comprovado'));
 review.boosters.forEach((b,i)=>out.push((i?'Alternativa '+i:'Principal')+': '+b.name,
  'Atributos relacionados: '+b.attributes.join(', '),b.reason));
 if(!review.boosters.length)out.push('Ímpeto candidato pendente.');
 if(review.levelRevision){const r=review.levelRevision;out.push('','PP REVISADOS',r.beforePP+' → '+r.afterPP+' PP · proposta recalculada, sem confirmar aplicação no jogo.',r.url);}
 if(review.competitiveReview){const r=review.competitiveReview;out.push('',r.title,
  'Proposta ESTIMADA · orçamento CALCULADO · desempenho em partidas PENDENTE',r.strategy,r.tradeoff,r.slotNote,r.researchNote,
  ...r.sources.map(s=>s.title+': '+s.url));}
 out.push('','OBSERVAR EM PARTIDAS ONLINE',...review.tests.map(x=>'• '+x),'',review.baseReference,
  'Proposta calculada, sem validação em partidas online. Não comprova atributos finais, familiaridade ou ativação de estilo.',
  'Não equipa habilidades/ímpetos nem altera a carta ou o treino aprovado.');
 return out.join('\n');
}
const FUNCTION_DRAFT_PREFIX='scoutpro:v374:function-draft:';
function functionDraftKey(card,tactic){
 if(!String(card.localKey||'').trim()||!MODES.includes(tactic))throw Error('Carta local e tática necessárias para a ficha independente');
 return FUNCTION_DRAFT_PREFIX+[card.localKey,card.cardId||'sem-card-id',card.edition||'edicao-pendente',
  card.position,tactic,card.managerId||'sem-tecnico'].map(x=>encodeURIComponent(String(x))).join('|');
}
function readFunctionDraft(store,card,tactic){
 const raw=store?.getItem(functionDraftKey(card,tactic));
 if(!raw)return null;
 let record;try{record=JSON.parse(raw)}catch(_){throw Error('Rascunho ilegível; histórico preservado')}
 const t=getDeps().tactical||(typeof module==='object'?require('./scout-multitactic-engine-v220.js'):null);
 const allowed=t?.roleOf?.(profileOf(card))==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6];
 if(record?.schema!=='CRAQUE_FUNCTION_DRAFT_V374'||!t?.valid?.(record.levels)||
  !Number.isInteger(record.pp)||record.pp<0||record.pp>300||t.total(record.levels)!==record.pp||
  record.levels.some((n,i)=>n>0&&!allowed.includes(i))||record.position!==card.position||record.tactic!==tactic||
  (record.budget!==undefined&&(!Number.isInteger(record.budget)||record.budget<record.pp||record.budget>300))||
  !Number.isInteger(record.revision)||record.revision<1||typeof record.source!=='string'||
  !Array.isArray(record.history)||record.history.length>39)
  throw Error('Rascunho não reconhecido; histórico preservado');
 return {...record,stale:record.source!==sourceSignature(card)};
}
function saveFunctionDraft(store,card,tactic,result,provided){
 if(!store?.setItem)throw Error('Armazenamento indisponível');
 const t=getDeps(provided).tactical||(typeof module==='object'?require('./scout-multitactic-engine-v220.js'):null),plan=result?.plan;
 if(result?.sourceSignature!==sourceSignature(card)||result?.tactic!==tactic)
  throw Error('Dados da carta mudaram; recalcule a proposta atual');
 const allowed=plan?.role==='GO'?[4,5,7,8,9]:[0,1,2,3,4,5,6];
 if(plan?.status!=='hipotese'||!t?.valid?.(plan.levels)||
  plan.pp!==resolveBudget(card).pp||t.total(plan.levels)>plan.pp||
  plan.levels.some((n,i)=>n>0&&!allowed.includes(i)))throw Error('PP ou categorias da proposta divergentes');
 const prior=readFunctionDraft(store,card,tactic);
 if(prior&&prior.history.length>=39)throw Error('Limite de 40 revisões atingido; histórico preservado. Exporte uma cópia antes de continuar.');
 const previous=prior?Object.fromEntries(Object.entries(prior).filter(([key])=>!['history','stale'].includes(key))):null;
 const record={schema:'CRAQUE_FUNCTION_DRAFT_V374',source:sourceSignature(card),
  revision:(prior?.revision||0)+1,createdAt:new Date().toISOString(),
  position:card.position,tactic,pp:t.total(plan.levels),budget:plan.pp,levels:plan.levels.slice(),
  skills:(result.suggestedSkills||[]).slice(0,5).map(x=>x.name),
  booster:result.booster?.primary?.nome||null,provisional:true,
  history:prior?[...prior.history,previous]:[]};
 store.setItem(functionDraftKey(card,tactic),JSON.stringify(record));return record;
}
function evaluate(card,tactic='posse',deps){
 if(!MODES.includes(tactic))throw Error(tactic==='sobreposicao'?
  'Sobreposição: perfil ainda não disponível; não substituir por Posse de Bola.':'Estilo tático inválido.');
 const {tactical:t,skills:s,boosters:b}=getDeps(deps);
 if(!t||!s||!b)throw Error('Um dos motores oficiais do Craque Tático não carregou.');
 const progress=resolveBudget(card);
 const plan=allocate(card,tactic,{tactical:t,skills:s,boosters:b});
 const raw=profileOf(card);
 // V322: campos preenchidos NÃO equivalem a dados da edição conferidos.
 // Um placeholder alfabético, "pendente" ou "a confirmar" não é Card ID
 // e não pode elevar a confiança competitiva de qualquer acervo.
 const cardId=String(card.cardId||'').trim(),edition=String(card.edition||'').trim();
 const identity=Boolean(/^\d{5,20}$/.test(cardId)&&edition&&
  !/pendente|confirmar|desconhecid|não informad|nao informad|não cadastr|nao cadastr|indefinid|placeholder/i.test(edition));
 const existing=String(card.skills||'').trim();
 let skill=null,boost=null;
 if(plan.role){
  const equipmentConfirmed=Boolean(s.checkedEquipment?.(raw,existing,card.equipmentRecord));
  // V375: skills and boosters must evaluate the SAME newly proposed investment.
  // A category level is still not evidence of a final attribute or a free slot.
  skill=s.evaluate({...raw,niveis:plan.levels},tactic,existing,{equippedConfirmed:equipmentConfirmed,equipmentRecord:card.equipmentRecord||null});
  boost=s.booster({...raw,niveis:plan.levels},tactic,b,card.boosterSlot||'pendente',card.booster||'');
 }
 // Usar a MESMA validação de nativas do motor V162; texto genérico
 // como "PENDENTE" não constitui inventário de habilidades documentado.
 const nativeDocumented=Boolean(skill?.nativeKnown);
 const warnings=[];
 if(progress.source==='manual_divergente')warnings.push(progress.reason);
 if(progress.source==='nivel_maximo')warnings.push(
  'PP calculados pelo nível máximo: 2 × ('+card.level+' − 1) = '+progress.pp+
  '. Verifique se o nível do print é o MÁXIMO desta edição; isso não comprova Card ID nem atributos finais.');
 if(!identity)warnings.push('Identidade da versão pendente: informe um Card ID numérico plausível e a edição exata; texto genérico não comprova identidade.');
 else warnings.push('Card ID informado com formato plausível; conferir a correspondência com a edição exata antes de validar competitivamente.');
 if(!nativeDocumented)warnings.push('Habilidades nativas ausentes, provisórias ou não documentadas: confira as habilidades da edição antes de aplicar sugestões.');
 if(card.boosterSlot==='vazio')warnings.push(
  'Slot relatado vazio pelo proprietário; a edição exata ainda não possui comprovação independente de slot selecionável. Não gastar tokens.');
 else warnings.push(card.boosterSlot==='ocupado'?'Segundo ímpeto ocupado: a sugestão é somente comparativa.':
 card.boosterSlot==='ausente'?'Carta informada sem slot selecionável: não equipa novo ímpeto.':
 'Disponibilidade do slot de ímpeto não confirmada: não utilize tokens ainda.');
 if(card.boosterSlot==='vazio'&&String(card.booster||'').trim())
  warnings.push('CONFLITO: slot marcado como vazio, mas há nome de ímpeto adicional informado. Revisar a edição e o equipamento sem excluir o nome salvo.');
 if(plan.baselineError)warnings.push(plan.baselineError);
 if(!card.style)warnings.push('Estilo individual de jogo não informado: recomendação baseada apenas na posição.');
 if(skill?.missing?.length)warnings.push(...skill.missing);
 // A lista de habilidades INFORMADAS não é recibo da quantidade de slots
 // LIVRES. O V162 somente confirma vagas quando possui prova da edição exata.
 // Preservar a quantidade consultiva de candidatas sem transformar essa
 // estimativa em disponibilidade real (compartilhado nos dois acervos).
 const candidateCapacity=skill?Math.max(0,5-skill.alreadyEquippedProvided):0;
 const freeSkillSlots=skill&&Number.isInteger(skill.slotsRemaining)?skill.slotsRemaining:null;
 const result={
  tactic,label:LABEL[tactic],plan,progress,skills:skill,booster:boost,
  suggestedSkills:skill?.recommendations.slice(0,candidateCapacity)||[],
  candidateCapacity,freeSkillSlots,
  identityConfirmed:identity,identityFormatValid:identity,
  identityEvidenceConfirmed:false,nativeDocumented,
  // O boletim manual do proprietário e a prova da edição são dimensões
  // independentes. No cadastro externo não existe ainda prova catalogada
  // vinculada ao Card ID autorizando um novo slot.
  boosterEligible:card.boosterSlot==='vazio'&&boost?.slotSupported===true&&boost?.able===true,
  boosterSlotEvidence:{
   ownerReported:card.boosterSlot||'pendente',
   editionDocumented:boost?.slotSupported===true,
   eligible:card.boosterSlot==='vazio'&&boost?.slotSupported===true&&boost?.able===true
  },
  confidence:plan.status!=='hipotese'?'pendente':
    identity&&nativeDocumented?'simulacao_documentada_parcial':'hipotese_dados_incompletos',
  warnings:[...new Set(warnings)]
 };
 return {...result,sourceSignature:sourceSignature(card),professional:professionalAudit(card,result),
  functionReview:functionReview(card,result,undefined,deps)};
}
function generate(card,deps){
 const source=sourceSignature(card);
 const profiles={};
 for(const tactic of MODES){
  const result=evaluate(card,tactic,deps);
  const plan=result.plan;
  profiles[tactic]={
   status:plan.status,levels:plan.levels?plan.levels.slice():null,
   pp:plan.levels?plan.pp:null,remaining:plan.levels?plan.remaining:null,
   confidence:result.confidence
  };
 }
 return {version:228,source,createdAt:new Date().toISOString(),profiles};
}
function validateSaved(card,record,deps){
 if(!record||record.version!==228||record.source!==sourceSignature(card)||!record.profiles)return false;
 const {tactical:t}=getDeps(deps);
 for(const tactic of MODES){
  const item=record.profiles[tactic];if(!item||!['hipotese','pendente'].includes(item.status))return false;
  if(item.status==='hipotese'&&(!t?.valid(item.levels)||t.total(item.levels)!==resolveBudget(card).pp))return false;
  if(item.status==='pendente'&&item.levels!==null)return false;
 }
 return true;
}
return Object.freeze({MODES,LABEL,METHODOLOGY,levelBudget,resolveBudget,profileOf,sourceSignature,parseBaseline,allocate,evaluate,professionalAudit,
 functionReview,functionSheetText,FUNCTION_DRAFT_PREFIX,functionDraftKey,readFunctionDraft,saveFunctionDraft,generate,validateSaved});
});
