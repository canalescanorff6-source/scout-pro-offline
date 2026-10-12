/* Scout PRO V98 — hypotheses, never proven performance. No invented card attributes. */
(function(host){
 'use strict';
 const positions={AC:'CA',CA:'CA',SA:'SA',PTD:'PTD',PTE:'PTE',MO:'MAT',MAT:'MAT',MLD:'MLD',MLE:'MLE',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DD:'LD',LD:'LD',DE:'LE',LE:'LE',ZC:'ZG',DC:'ZG',ZG:'ZG',GR:'GO',GO:'GO'};
 const names=['Chute','Passe','Drible','Destreza','Força das pernas','Jogo aéreo','Defesa','Goleiro 1','Goleiro 2','Goleiro 3'];
 const tactics=[
  {key:'posse',title:'Posse de Bola',description:'Apoio curto, passes seguros, triangulações e proteção do centro.'},
  {key:'normal',title:'Contra-Ataque Normal',description:'Equilíbrio entre retomada, conexão vertical e cobertura defensiva.'},
  {key:'rapido',title:'Contra-Ataque Rápido',description:'Ruptura em profundidade e primeira ação após recuperar a bola.'}
 ];
 // Relative, role-based preferences only. Not card attributes or measured efficacy.
 const presets={
  CA:[[9,8,8,9,8,4,0,0,0,0],[11,4,6,11,10,3,0,0,0,0],[12,2,5,12,12,2,0,0,0,0]],
  SA:[[7,10,10,9,7,2,0,0,0,0],[9,7,8,11,10,1,0,0,0,0],[10,5,7,12,11,1,0,0,0,0]],
  MAT:[[5,12,11,10,6,0,1,0,0,0],[6,9,10,11,9,0,2,0,0,0],[7,7,10,12,11,0,1,0,0,0]],
  MLG:[[2,12,9,9,7,3,5,0,0,0],[3,9,8,10,10,3,7,0,0,0],[3,8,8,11,11,2,7,0,0,0]],
  VOL:[[0,10,5,4,7,7,11,0,0,0],[0,7,4,4,9,8,12,0,0,0],[0,6,3,5,10,8,12,0,0,0]],
  LD:[[0,9,8,8,8,3,9,0,0,0],[0,7,6,8,10,4,11,0,0,0],[0,6,6,9,11,3,11,0,0,0]],
  LE:[[0,9,8,8,8,3,9,0,0,0],[0,7,6,8,10,4,11,0,0,0],[0,6,6,9,11,3,11,0,0,0]],
  ZG:[[0,7,2,3,8,10,12,0,0,0],[0,5,2,4,10,10,12,0,0,0],[0,4,1,5,11,10,12,0,0,0]],
  GO:[[0,0,0,0,2,0,0,11,11,11],[0,0,0,0,2,0,0,10,12,12],[0,0,0,0,2,0,0,10,12,12]],
  PTD:[[4,8,11,10,8,1,0,0,0,0],[5,6,11,11,10,1,0,0,0,0],[5,5,10,12,12,1,0,0,0,0]],
  PTE:[[4,8,11,10,8,1,0,0,0,0],[5,6,11,11,10,1,0,0,0,0],[5,5,10,12,12,1,0,0,0,0]],
  MLD:[[2,10,9,9,9,2,5,0,0,0],[3,8,8,10,11,1,6,0,0,0],[3,7,8,11,12,1,6,0,0,0]],
  MLE:[[2,10,9,9,9,2,5,0,0,0],[3,8,8,10,11,1,6,0,0,0],[3,7,8,11,12,1,6,0,0,0]]
 };
 const mapPos=s=>positions[String(s||'')]||null;
 const costOne=n=>n<=4?n:n<=8?4+(n-4)*2:n<=12?12+(n-8)*3:n<=16?24+(n-12)*4:40+(n-16)*5;
 const cost=v=>v.reduce((s,n)=>s+costOne(n),0);
 const valid=v=>Array.isArray(v)&&v.length===10&&v.every(n=>Number.isInteger(n)&&n>=0&&n<=20);
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function weights(card,kind){
  const position=mapPos(card.posicao),data=presets[position];
  if(!data||!tactics.some(t=>t.key===kind))return null;
  const w=data[tactics.findIndex(t=>t.key===kind)].slice();
  const s=norm(card.estilo_ataque);
  if(position==='CA'||position==='SA'){
   if(/artilheiro|matador|oportunista|homem de area/.test(s)){w[0]+=1.2;w[3]+=1.0}
   if(/pivo/.test(s)){w[1]+=1.5;w[5]+=1.5}
  }
  if(/armador|orquestrador/.test(s)&&w[1]>0)w[1]+=1.5;
  if(/destruidor|primeiro volante/.test(s)&&w[6]>0)w[6]+=1.5;
  return w;
 }
 function proposal(card,tactic){
  const pp=card.pp,w=weights(card,tactic);
  if(!Number.isInteger(pp)||pp<0||pp>250||!w)return {ok:false,reason:'Posição ou orçamento não documentado.'};
  // Exact-budget dynamic programming across progression cost tiers.
  let states=new Array(pp+1).fill(null);states[0]={score:0,levels:[]};
  for(let category=0;category<10;category++){
   const next=new Array(pp+1).fill(null);
   for(let spent=0;spent<=pp;spent++){
    const state=states[spent];if(!state)continue;
    for(let n=0;n<=20;n++){
     if(w[category]===0&&n!==0)break;
     const c=costOne(n),sum=spent+c;if(sum>pp)break;
     const score=state.score+w[category]*Math.log1p(n);
     if(!next[sum]||score>next[sum].score+1e-9){
      next[sum]={score,levels:state.levels.concat(n)};
     }
    }
   }
   states=next;
  }
  const result=states[pp];
  if(!result||!valid(result.levels)||cost(result.levels)!==pp)return {ok:false,reason:'Não há alocação exata com as regras atuais.'};
  return {ok:true,levels:result.levels,used:pp,remaining:0,status:'hipótese heurística não validada',tactic};
 }
 function comparison(card){
  const original=valid(card.treino_anterior)?card.treino_anterior:null;
  return {previous:original?{levels:original.slice(),used:cost(original),source:'treino anterior registrado, sem validação automática'}:null,
   proposals:tactics.map(t=>({key:t.key,title:t.title,description:t.description,plan:proposal(card,t.key)}))};
 }
 const API={positions,names,tactics,mapPos,cost,valid,weights,proposal,comparison};
 if(typeof module==='object'&&module.exports)module.exports=API;
 if(host)host.SCOUT_TACTICS_V98=API;
})(typeof window!=='undefined'?window:null);
