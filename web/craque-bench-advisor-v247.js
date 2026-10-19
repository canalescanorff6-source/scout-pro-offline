/* Craque Tático V247 — substituições documentais por formação/estilo.
 * Recomenda uma vaga somente se a edição EXATA tem posição original,
 * familiaridade ou treino já confirmado. Não usa Overall como prova.
 * Não altera elencos, fichas, PP, nem a configuração do eFootball.
 */
(function(host,factory){'use strict';
 const api=factory(host);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_BENCH_ADVISOR_V247=api;
})(typeof window!=='undefined'?window:null,function(host){'use strict';
const moduleApi=name=>{
 if(typeof module!=='object'||!module.exports)return null;
 try{return require(name)}catch(_){return null}
};
const trainingDefault=()=>host?.SCOUT_POSITION_TRAINING_V246||moduleApi('./scout-position-training-v246.js');
const tacticsDefault=()=>host?.CRAQUE_TACTICS_V230||moduleApi('./craque-tactics-v230.js');
const byId=(byCap,cap)=>typeof byCap?.get==='function'?byCap.get(Number(cap)):byCap?.[Number(cap)];
const formatCap=n=>'#'+String(n).padStart(3,'0');
function recommend({card,starters,selections,byCap,mode='posse',training,tactics}={}){
 const pos=training||trainingDefault(),tac=tactics||tacticsDefault();
 if(!pos||!tac||!card||!Array.isArray(starters)||!selections||!byCap)
  return {eligible:false,status:'indisponível',reason:'Dados táticos ou escalação indisponíveis.'};
 const entries=starters.map(entry=>{
  const slot=entry.slot,role=entry.role||tac.slotRole(slot);
  const incumbent=byId(byCap,selections[slot]??entry.cap);
  const fit=role?pos.status(card,role):{eligible:false,label:'Vaga não documentada'};
  return {slot,role,incumbent,fit};
 }).filter(x=>x.role&&x.incumbent);
 if(entries.some(x=>Number(x.incumbent.numero)===Number(card.numero))){
  return {eligible:false,status:'já escalado',reason:'Esta carta já é titular; não pode substituir a si mesma.'};
 }
 const possible=entries.filter(x=>x.fit.eligible).map(x=>{
  const candidate=tac.score(card,x.slot,mode),incumbent=tac.score(x.incumbent,x.slot,mode);
  const gain=candidate.score-incumbent.score;
  return {...x,candidate,incumbentScore:incumbent.score,gain};
 }).filter(x=>x.candidate.score>=0);
 // Comparação ordinal/documental, não ranking de desempenho ou prova de meta.
 possible.sort((a,b)=>b.gain-a.gain||b.candidate.score-a.candidate.score||
  Number(a.incumbent.numero)-Number(b.incumbent.numero)||a.slot.localeCompare(b.slot));
 if(!possible.length){
  const observed=[...new Set(entries.filter(x=>x.role!=='GO')
   .map(x=>x.role))].join(', ');
  return {eligible:false,status:'posição não confirmada',position:null,slot:null,incumbent:null,
   reason:'Nenhuma vaga elegível confirmada nesta formação. Conferir no eFootball se esta edição já tem familiaridade ou recebeu treinamento para alguma das posições: '+
    (observed||'nenhuma vaga de linha')+'. Índice OVR alto não comprova habilitação.'};
 }
 const best=possible[0],tacticName=tac.MODES?.[mode]?.label||mode;
 const roleStatus=best.fit.status==='original'?'posição original':
  best.fit.status==='treinada'?'treino confirmado':'familiaridade confirmada';
 const reasons=best.candidate.signals.filter(x=>!/^Estilo da edição|^Habilidades nativas|^Validar familiaridade/.test(x));
 const suggestion=reasons[0]||'posição e estilo cadastrados; avaliação funcional ainda pendente';
 return {eligible:true,status:best.fit.status,position:best.role,slot:best.slot,
  incumbent:{numero:best.incumbent.numero,name:best.incumbent.name},
  candidateScore:best.candidate.score,incumbentScore:best.incumbentScore,
  reason:'Alternativa documental para '+tacticName+': '+roleStatus+'; '+suggestion+
   '. Não garante que será melhor em partidas.',
  text:'Jogar como '+best.role+' · Substituir '+formatCap(best.incumbent.numero)+' '+best.incumbent.name};
}
return Object.freeze({recommend});
});
