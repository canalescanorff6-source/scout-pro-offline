/* Craque Tático V303 — simulador de investimento PP independente por estilo.
 * Perfil calculado por função, modo de jogar e sinais nativos da MESMA carta.
 * Não inventa nível, Card ID, atributo-base, validação de criadores ou gameplay.
 */
(function(host,factory){'use strict';
 const api=factory(host?.SCOUT_TACTICS_V220||(typeof module==='object'?require('./scout-multitactic-engine-v220.js'):null));
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_STYLE_PLANNER_V303=api;
})(typeof window!=='undefined'?window:null,function(T){'use strict';
const STYLES=Object.freeze({
 posse:Object.freeze({weights:[0.88,1.65,1.48,1.3,.88,.73,1.06],keeper:[1.38,1.05,.82],focus:'apoios curtos, giro, recepção e circulação'}),
 normal:Object.freeze({weights:[1.17,1.38,.78,1.01,1.18,1.12,1.34],keeper:[.97,1.17,1.17],focus:'cobertura e passe vertical após recuperar'}),
 rapido:Object.freeze({weights:[1.25,.82,1.16,1.65,1.67,.82,.97],keeper:[.91,1.56,.98],focus:'aceleração, reação e ataque do espaço'}),
 fora:Object.freeze({weights:[1.06,1.3,1.54,1.09,1.32,1.29,.85],keeper:[1.31,1.02,1.06],focus:'condução e progressão por corredor'}),
 longo:Object.freeze({weights:[1.09,1.38,.66,.91,1.38,1.68,1.3],keeper:[.87,1.14,1.49],focus:'ligação direta, jogo aéreo e segunda bola'})
});
function levelsValid(v){return T?.valid?.(v)===true}
function budgetStatus(card){
 const budget=Number(card?.pp);
 if(!Number.isInteger(budget)||budget<0||budget>300)return 'pp_desconhecidos';
 if(card.pp_estimated===true||card.pp_estimado===true)return 'orcamento_estimado';
 const level=Number(card.max_level);
 if(Number.isInteger(level)&&level>0&&budget===2*(level-1)&&
  /^informado_pelo_usuario_/.test(String(card.pp_origem||'')))return 'nivel_pp_informados';
 return 'nivel_ou_pp_sem_confirmacao';
}
function vectorEqual(a,b){return levelsValid(a)&&levelsValid(b)&&a.every((x,i)=>x===b[i])}
function total(v){return T.total(v)}
function allocate(card,tactic){
 if(!T||!Object.hasOwn(STYLES,tactic))return null;
 const budget=Number(card?.pp),role=T.roleOf(card);
 if(!Number.isInteger(budget)||budget<0||budget>300||!role)return null;
 const cfg=T.strategy(card,tactic),factors=STYLES[tactic];
 const go=role==='GO',positions=go?[7,8,9]:[0,1,2,3,4,5,6];
 const weight=i=>Math.max(.05,cfg.weights[i])*(
  go?factors.keeper[i-7]:factors.weights[i]);
 // Dynamic programming: exact PP, bounded 0..20; harmonic utility
 // rewards balanced investment in categories with genuine contextual weight.
 let dp=Array(budget+1).fill(null);
 dp[0]={score:0,levels:Array(10).fill(0)};
 for(const index of positions){
  const next=Array(budget+1).fill(null);
  for(let used=0;used<=budget;used++){
   const prev=dp[used];if(!prev)continue;
   for(let level=0;level<=20;level++){
    const cost=T.ppCost(level),sum=used+cost;
    if(sum>budget)break;
    const value=weight(index)*(Math.sqrt(1+level*.75)-1);
    const score=prev.score+value;
    const other=next[sum];
    if(!other||score>other.score+1e-8){
     const levels=prev.levels.slice();levels[index]=level;
     next[sum]={score,levels};
    }
   }
  }
  dp=next;
 }
 return dp[budget]?.levels||null;
}
function proposal(card,tactic,baseline){
 const profile=STYLES[tactic];
 if(!profile)return null;
 const budget=Number(card?.pp);
 if(!Number.isInteger(budget)||budget<0||budget>300)return null;
 const registered=levelsValid(baseline)&&total(baseline)===budget?baseline.slice():null;
 const origin=registered||(
  levelsValid(card.recommended_levels)&&total(card.recommended_levels)===budget?
   card.recommended_levels.slice():
  levelsValid(card.niveis)&&total(card.niveis)===budget?card.niveis.slice():null);
 // Posse approved registration is immutable; alternate táticas are simulations.
 const useReference=tactic==='posse'&&origin!==null;
 const chosen=useReference?origin:allocate(card,tactic);
 if(!levelsValid(chosen)||total(chosen)!==budget)return null;
 const evid=budgetStatus(card),provisional=card.training_provisional===true||
  card.treino_proposto_nao_validado===true;
 const change=origin?chosen.map((n,i)=>({
  index:i,category:T.CATEGORIES[i],before:origin[i],after:n,
  delta:n-origin[i]
 })).filter(x=>x.delta!==0):[];
 const mode=useReference?'referencia_cadastrada':'simulacao_por_estilo';
 return Object.freeze({
  levels:Object.freeze(chosen.slice()),pp:budget,tactic,role:T.roleOf(card),
  source:mode,confidence:useReference?'documental_distribuicao_nao_gameplay':
   evid==='nivel_pp_informados'?'hipotese_matematica_com_pp_informados':'hipotese_condicional',
  budgetEvidence:evid,baselineProvisional:provisional,
  changes:Object.freeze(change.map(Object.freeze)),
  focus:profile.focus,
  profileReasons:Object.freeze(T.strategy(card,tactic).signals.slice()),
  note:useReference?'Treino cadastrado preservado, não validado em partidas.':
   'ALTERNATIVA CALCULADA: investimento PP por função e estilo, SEM atributos finais ou validação de gameplay; não instala treino nem altera a carta.'
 });
}
return Object.freeze({STYLES,budgetStatus,allocate,proposal,vectorEqual});
});
