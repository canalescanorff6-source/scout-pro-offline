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
 impeto_extra:card.boosterSlot==='vazio'?'SLOT SELECIONÁVEL':card.booster||'PENDENTE',
 boost2:card.boosterSlot==='vazio'?'SLOT SELECIONÁVEL':card.booster||'PENDENTE',
 pp:resolveBudget(card).pp,niveis:null
});
function sourceSignature(card){
 const signatureParts=[
  card.name,card.cardId,card.edition,card.position,card.style,card.pp,
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
// Multiple-choice knapsack. Exact PP only, categories <=20 and step costs equal to the game engine.
// Marginal value declines by level; a single generic allocation is not copied to every card.
function allocate(card,tactic,deps){
 const {tactical:t}=getDeps(deps);
 if(!t?.strategy||!t?.ppCost||!t?.valid||!t?.roleOf)
  throw Error('Motor tático V220 indisponível; nenhuma ficha pode ser calculada.');
 if(!MODES.includes(tactic))throw Error('Estilo tático inválido.');
 const progress=resolveBudget(card);
 const budget=progress.pp,source=profileOf(card),role=t.roleOf(source);
 if(!role)return {status:'pendente',reason:'Cadastre uma posição reconhecida (CA, SA, MAT, MLG, VOL, ZC, LD, LE, GO ou ponta).',levels:null};
 // PP manuais permanecem utilizáveis conforme V228, mas divergências ficam documentadas.
 if(!Number.isInteger(budget)||budget<0||budget>300)
  return {status:'pendente',reason:progress.reason||'Informe o nível máximo da carta para calcular os PP.',levels:null,role};
 const cfg=t.strategy(source,tactic);
 const allowed=role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
 const upper=allowed.length*60;
 if(budget>upper)return {status:'pendente',reason:'PP informados excedem o máximo das categorias permitidas ('+upper+'). Confira o cadastro.',levels:null,role};
 const weights=cfg.weights;
 let dp=Array(budget+1).fill(null);dp[0]={score:0,levels:Array(10).fill(0)};
 const costs=Array.from({length:21},(_,n)=>t.ppCost(n));
 const diminishing=Array(21).fill(0);
 for(let n=1;n<=20;n++)diminishing[n]=diminishing[n-1]+1/(1+0.23*(n-1));
 for(const index of allowed){
  const next=Array(budget+1).fill(null);
  for(let spent=0;spent<=budget;spent++){
   const previous=dp[spent];if(!previous)continue;
   for(let n=0;n<=20&&spent+costs[n]<=budget;n++){
    const target=spent+costs[n],score=previous.score+weights[index]*diminishing[n];
    if(!next[target]||score>next[target].score+1e-9){
     const levels=previous.levels.slice();levels[index]=n;
     next[target]={score,levels};
    }
   }
  }
  dp=next;
 }
 const result=dp[budget];
 if(!result||!t.valid(result.levels)||t.total(result.levels)!==budget)
  return {status:'pendente',reason:'Não há combinação válida que utilize exatamente os PP declarados.',levels:null,role};
 const base=parseBaseline(card,t);
 const differences=base.levels?t.CATEGORIES.flatMap((name,i)=>base.levels[i]!==result.levels[i]?
   [{name,was:base.levels[i],proposed:result.levels[i]}]:[]):[];
 const evidence=[...cfg.signals];
 return {
  status:'hipotese',role,levels:result.levels,pp:budget,remaining:0,
  categories:t.CATEGORIES,style:tactic,
  focus:t.focus(source,tactic),evidence,
  baselineValid:Boolean(base.levels),baselineError:base.error,
  differences,
  note:'Treino experimental com PP fechados. Simulação por função, tática e informações fornecidas; não comprova atributos finais nem desempenho.'
 };
}
function evaluate(card,tactic='posse',deps){
 const {tactical:t,skills:s,boosters:b}=getDeps(deps);
 if(!t||!s||!b)throw Error('Um dos motores oficiais do Craque Tático não carregou.');
 const progress=resolveBudget(card);
 const plan=allocate(card,tactic,{tactical:t,skills:s,boosters:b});
 const raw=profileOf(card);
 const identity=Boolean(String(card.cardId||'').trim()&&String(card.edition||'').trim());
 const nativeDocumented=Boolean(String(card.nativeSkills||'').trim());
 const existing=String(card.skills||'').trim();
 const warnings=[];
 if(progress.source==='manual_divergente')warnings.push(progress.reason);
 if(progress.source==='nivel_maximo')warnings.push(
  'PP calculados pelo nível máximo: 2 × ('+card.level+' − 1) = '+progress.pp+
  '. Verifique se o nível do print é o MÁXIMO desta edição; isso não comprova Card ID nem atributos finais.');
 if(!identity)warnings.push('Identidade da versão pendente: preencha a edição e o Card ID exato para maior confiabilidade.');
 if(!nativeDocumented)warnings.push('Habilidades nativas não cadastradas: confira antes de aplicar as sugestões.');
 if(card.boosterSlot!=='vazio')warnings.push(card.boosterSlot==='ocupado'?'Segundo ímpeto ocupado: a sugestão é somente comparativa.':
 card.boosterSlot==='ausente'?'Carta informada sem slot selecionável: não equipa novo ímpeto.':
 'Disponibilidade do slot de ímpeto não confirmada: não utilize tokens ainda.');
 if(plan.baselineError)warnings.push(plan.baselineError);
 if(!card.style)warnings.push('Estilo individual de jogo não informado: recomendação baseada apenas na posição.');
 let skill=null,boost=null;
 if(plan.role){
  skill=s.evaluate(raw,tactic,existing);
  boost=s.booster({...raw,niveis:plan.levels},tactic,b,card.boosterSlot||'pendente',card.booster||'');
  if(skill.missing?.length)warnings.push(...skill.missing);
 }
 const distinct=skill?Math.max(0,5-skill.alreadyEquippedProvided):0;
 return {
  tactic,label:LABEL[tactic],plan,progress,skills:skill,booster:boost,
  suggestedSkills:skill?.recommendations.slice(0,distinct)||[],
  freeSkillSlots:distinct,identityConfirmed:identity,nativeDocumented,
  boosterEligible:card.boosterSlot==='vazio'&&boost?.able===true,
  confidence:plan.status!=='hipotese'?'pendente':
    identity&&nativeDocumented?'simulacao_documentada_parcial':'hipotese_dados_incompletos',
  warnings:[...new Set(warnings)]
 };
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
return Object.freeze({MODES,LABEL,levelBudget,resolveBudget,profileOf,sourceSignature,parseBaseline,allocate,evaluate,generate,validateSaved});
});
