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
 posicao:card.position||'',shown_position:card.position||'',
 attack_style:card.style||'',estilo_ataque:card.style||'',
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
 const role=t.roleOf(profileOf(card)),allowed=role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
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
  skillsStatus:!sk?.nativeKnown?'nativas_pendentes':sk.requiresReconciliation?'conciliar':'consultivo',
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
function evaluate(card,tactic='posse',deps){
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
  skill=s.evaluate(raw,tactic,existing);
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
 return {...result,professional:professionalAudit(card,result)};
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
return Object.freeze({MODES,LABEL,METHODOLOGY,levelBudget,resolveBudget,profileOf,sourceSignature,parseBaseline,allocate,evaluate,professionalAudit,generate,validateSaved});
});
