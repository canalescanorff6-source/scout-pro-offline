/* SCOUT PRO V220 — cinco estilos táticos oficiais com rótulos PT-BR.
 * Simulações matemáticas por papel + habilidades documentadas, NÃO builds homologadas.
 * Nunca altera nem substitui as 246 cartas originais ou PP registrados.
 */
(function(host){
'use strict';
const STYLES=Object.freeze([
 {id:'posse',label:'Posse de Bola',short:'Posse',focus:'Apoios curtos, criação entrelinhas, circulação e domínio sob pressão.',
  priorities:[0,5,6,8,4,1,2,3,7,9]},
 {id:'normal',label:'Contra-Ataque',short:'CA Normal',focus:'Recuperação organizada, passe vertical seguro e ataque do espaço no momento certo.',
  priorities:[0,6,5,8,7,4,3,1,2,9]},
 {id:'rapido',label:'Contra-Ataque Rápido',short:'CA Rápido',focus:'Aceleração após a recuperação, ataques diretos e corrida sem bola.',
  priorities:[8,7,3,6,4,0,5,1,2,9]},
 {id:'fora',label:'Pelas Pontas · Por Fora',short:'Por Fora',focus:'Amplitude e apoio pelos lados; adaptação à preferência de jogo central requer validação.',
  priorities:[5,4,6,7,3,8,1,0,2,9]},
 {id:'longo',label:'Bola Longa · Passe Longo',short:'Bola Longa',focus:'Ligação mais direta, disputa da segunda bola, cobertura e transição.',
  priorities:[4,6,8,0,7,5,1,3,2,9]}
]);
const CATEGORIES=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
const ROLE={AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DC:'ZG',ZC:'ZG',ZG:'ZG',DD:'LD',LD:'LD',DE:'LE',LE:'LE',GR:'GO',GO:'GO',PTE:'ALA',PTD:'ALA',MLD:'ALA',MLE:'ALA'};
const BASE={
 CA:[16,9,8,14,13,9,0,0,0,0],
 SA:[12,15,13,16,12,4,0,0,0,0],
 MAT:[9,17,14,15,9,1,3,0,0,0],
 MLG:[6,16,13,14,13,4,9,0,0,0],
 VOL:[1,12,8,8,11,11,19,0,0,0],
 ZG:[0,6,2,6,12,13,20,0,0,0],
 LD:[3,13,10,11,14,8,16,0,0,0],
 LE:[3,13,10,11,14,8,16,0,0,0],
 ALA:[12,13,16,12,16,2,5,0,0,0],
 GO:[0,0,0,0,0,0,0,18,19,17]
};
const MOD={
 posse:[0,8,7,6,0,-1,2,0,0,0],
 normal:[1,6,2,2,4,2,5,0,0,0],
 rapido:[5,2,7,9,9,0,3,0,0,0],
 fora:[3,8,10,4,7,5,1,0,0,0],
 longo:[3,8,-1,3,7,10,7,0,0,0]
};
const nativeNames=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const ppCost=n=>{if(!Number.isInteger(n)||n<0||n>20)throw Error('Nível não permitido');let p=0;for(let j=0;j<n;j++)p+=1+Math.floor(j/4);return p};
const valid=x=>Array.isArray(x)&&x.length===10&&x.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
const total=x=>valid(x)?x.reduce((a,n)=>a+ppCost(n),0):null;
const roleOf=c=>ROLE[String(c?.shown_position||c?.posicao||c?.role_used||'').toUpperCase()]||null;
function styleFor(id){return STYLES.find(s=>s.id===id)||null}
function confirmSource(card){
 const budget=Number(card.pp),levels=card.recommended_levels||card.niveis;
 return valid(levels)&&Number.isInteger(budget)&&total(levels)===budget;
}
function strategy(card,id){
 const style=styleFor(id);if(!style)throw Error('Estilo de jogo desconhecido');
 const role=roleOf(card)||'CA',base=(BASE[role]||BASE.CA).slice(),mode=MOD[id];
 const result=base.map((n,i)=>n+mode[i]);
 const behavior=nativeNames([card.estilo_ataque,card.attack_style,card.estilo_defesa,card.defence_style].filter(Boolean).join(' '));
 const native=nativeNames(card.habilidades_nativas||card.native_skills||'');
 const signal=[];
 const add=(i,n,reason)=>{result[i]+=n;signal.push(reason)};
 if(/orquestrador|armador criativo|classico/.test(behavior)){add(1,5,'Armador/Orquestrador cadastrado');add(2,2,'Recepção e domínio no apoio')}
 if(/artilheiro|matador|oportunista|infiltracao/.test(behavior)){add(0,4,'Perfil de finalização/infiltração');add(3,3,'Desmarque vertical')}
 if(/homem de area|pivo|target/.test(behavior)){add(5,6,'Jogo aéreo e pivô documentais');add(3,1,'Proteção e reação curta')}
 if(/destruidor|primeiro volante|lateral defensivo/.test(behavior)){add(6,4,'Cobertura e recuperação por função');add(4,2,'Físico e mobilidade')}
 if(/meia versatil/.test(behavior)){add(3,2,'Meia versátil');add(4,3,'Resistência/mobilidade do meio')}
 if(/one.touch pass|passe de primeira/.test(native)){add(1,4,'Passe de primeira nativo registrado')}
 if(/through pass|passe em profundidade/.test(native)){add(1,3,'Passe em profundidade nativo registrado')}
 if(/double touch|sole control|toque duplo|controle com a sola/.test(native)){add(2,3,'Controle/drible nativos documentados')}
 if(/first.time shot|phenomenal finish/.test(native)){add(0,4,'Finalização nativa documentada')}
 if(/heading|aerial superiority|cabec/.test(native)){add(5,4,'Recursos aéreos nativos documentados')}
 if(/interception|blocker|interceptacao|bloqueador/.test(native)){add(6,4,'Habilidades defensivas nativas documentadas')}
 // Ímpeto FIXO entra apenas como sinal de contexto, nunca como prova de atributos finais.
 const fixed=nativeNames(card.impeto_fixo||card.boost1||'');
 if(/technique|passing|passe/.test(fixed)){add(1,2,'Ímpeto fixo ligado à técnica/passe')}
 if(/physicality|fisicalidade|aerial/.test(fixed)){add(5,2,'Ímpeto fixo relacionado a atributos físicos')}
 return {role,weights:result,signals:signal,style};
}
function benefit(vec,weights){
 let result=0;
 for(let i=0;i<10;i++)result+=weights[i]*vec[i];
 return result;
}
/** Somente trocas com custo EXATO de PP e categoria permitida são elegíveis.
 * Nenhum atributo-base, OVR, animação ou compatibilidade do jogo é presumido.
 */
function hypothetical(card,tactic,baseline,variant=0){
 const cfg=strategy(card,tactic),budget=Number(card.pp);
 if(!valid(baseline)||!Number.isInteger(budget)||total(baseline)!==budget)return null;
 if(tactic==='posse'&&variant===0)return {levels:baseline.slice(),source:'registrado',changes:[],signals:cfg.signals,confidence:'documental_baseline'};
 const allowed=cfg.role==='GO'?[7,8,9]:[0,1,2,3,4,5,6];
 const weights=cfg.weights.slice();
 if(variant===1){
  const skew={posse:2,normal:6,rapido:4,fora:5,longo:6}[tactic]||1;
  weights[skew]+=8;
 }
 const current=baseline.slice(),original=current.slice();
 let rounds=0;
 while(rounds++<8){
  let best=null;
  for(const i of allowed){
   if(current[i]<1)continue;
   for(const j of allowed){
    if(i===j||current[j]>=20)continue;
    for(let down=1;down<=Math.min(3,current[i]);down++){
     for(let up=1;up<=Math.min(3,20-current[j]);up++){
      const delta=ppCost(current[j]+up)-ppCost(current[j])-
        (ppCost(current[i])-ppCost(current[i]-down));
      if(delta!==0)continue;
      const next=current.slice();next[i]-=down;next[j]+=up;
      const gain=benefit(next,weights)-benefit(current,weights);
      const diversity=tactic==='posse'?0:Math.abs(next[j]-original[j])*.025;
      const score=gain+diversity;
      if(score>0.1&&(!best||score>best.score+1e-7||Math.abs(score-best.score)<1e-7&&j<best.j))
       best={score,vec:next,j};
     }
    }
   }
  }
  if(!best)break;
  current.splice(0,10,...best.vec);
 }
 const changes=current.map((to,i)=>({category:CATEGORIES[i],from:original[i],to,delta:to-original[i]})).filter(v=>v.delta);
 return {levels:current,source:changes.length?'hipotese_tatica':'igual_ao_registrado',
  changes,signals:cfg.signals,confidence:'experimental_sem_atributos_finais',
  style:cfg.style.id,role:cfg.role,pp:total(current),
  note:changes.length?'Comparação teórica por investimento de PP; NÃO validada por status finais ou gameplay.':
   'Não foi encontrada alternativa diferente com PP exatos. Manter treino registrado até nova evidência.'};
}
function focus(card,tactic){
 const p=strategy(card,tactic);return {
  headline:p.style.focus,
  role:p.role,priority:p.weights.map((n,i)=>({name:CATEGORIES[i],weight:n,index:i}))
    .sort((a,b)=>b.weight-a.weight).slice(0,4),
  evidence:p.signals,baseKnown:card.base_stats_known===true,
  confidence:card.base_stats_known===true?'parcial':'pendente_atributos',
  warning:'PP são custo de progressão, não status finais nem desempenho comprovado.'
 };
}
const api=Object.freeze({STYLES,CATEGORIES,ROLE,BASE,MOD,valid,total,ppCost,roleOf,styleFor,confirmSource,strategy,hypothetical,focus});
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_TACTICS_V220=api;
})(typeof window!=='undefined'?window:null);
