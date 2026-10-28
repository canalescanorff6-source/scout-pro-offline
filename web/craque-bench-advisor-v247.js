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
const identityDefault=()=>host?.SCOUT_PLAYER_IDENTITY_V245||moduleApi('./scout-player-identity-v245.js');
const byId=(byCap,cap)=>typeof byCap?.get==='function'?byCap.get(Number(cap)):byCap?.[Number(cap)];
const formatCap=n=>'#'+String(n).padStart(3,'0');
function recommend({card,starters,selections,byCap,mode='posse',training,tactics,identity}={}){
 const pos=training||trainingDefault(),tac=tactics||tacticsDefault(),
  people=identity||identityDefault();
 if(!pos||!tac||!card||!Array.isArray(starters)||!selections||!byCap)
  return {eligible:false,status:'indisponível',reason:'Dados táticos ou escalação indisponíveis.'};
 const entries=starters.map(entry=>{
  const slot=entry.slot,role=entry.role||tac.slotRole(slot);
  const incumbent=byId(byCap,selections[slot]??entry.cap);
  const fit=role?pos.status(card,role):{eligible:false,label:'Vaga não documentada'};
  return {slot,role,incumbent,fit};
 }).filter(x=>x.role&&x.incumbent);
 if(entries.some(x=>Number(x.incumbent.numero)===Number(card.numero)||
  (people?.key&&people.key(x.incumbent)===people.key(card)))){
  return {eligible:false,status:'já escalado',position:null,slot:null,incumbent:null,
   reason:'Esta pessoa já é titular nesta formação (inclusive se for outra edição da carta). Escolha um reserva diferente.'};
 }
 const possible=entries.filter(x=>x.fit.eligible).map(x=>{
  const scored=tac.score(card,x.slot,mode),
   incumbentFit=pos.status(x.incumbent,x.role),
   incumbent=incumbentFit.eligible?tac.score(x.incumbent,x.slot,mode):null;
  // O V246 pode ter prova explícita de posição enquanto a pontuação
  // ordinal V230 ainda usa um snapshot antigo. A posição CONTINUA
  // habilitada, mas sua pontuação fica INDETERMINADA, nunca -100 ou 0.
  const candidateUnscored=x.fit.eligible&&(!Number.isFinite(scored.score)||scored.score<0);
  const candidate={...scored,score:candidateUnscored?null:scored.score,
   signals:Array.isArray(scored.signals)?scored.signals:[]};
  // Um titular fora de posição ou score ausente não demonstra ganho de
  // desempenho. NUNCA inferir superioridade por diferença com -100.
  const incumbentScore=incumbent&&Number.isFinite(incumbent.score)&&incumbent.score>=0?
   incumbent.score:null;
  const gain=candidate.score!==null&&incumbentScore!==null?
   candidate.score-incumbentScore:null;
  return {...x,candidate,candidateUnscored,incumbentFit,incumbentScore,gain};
 }).filter(x=>x.candidate.score===null||x.candidate.score>=0);
 // Comparação ordinal/documental, não ranking de desempenho ou prova de meta.
 possible.sort((a,b)=>
  Number(b.incumbentFit.eligible===false)-Number(a.incumbentFit.eligible===false)||
  (b.gain??-999)-(a.gain??-999)||
  (b.candidate.score??-1)-(a.candidate.score??-1)||
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
 const decision=best.incumbentFit.eligible===false?'corrigir_posicao_titular':
  best.gain!==null&&best.gain>0?'encaixe_documental_favoravel':'alternativa_sem_vantagem_comprovada';
 const caution=decision==='corrigir_posicao_titular'?
  'O titular atual não tem familiaridade confirmada nesta vaga. Esta troca corrige o encaixe posicional; NÃO é prova de qualidade superior.':
  decision==='encaixe_documental_favoravel'?
  'O reserva tem sinais documentais de encaixe melhores nesta tática, não desempenho superior comprovado.':
  'Sem ganho de encaixe documental demonstrado sobre o titular atual; considerar somente rodízio, cansaço ou instrução específica.';
 const extraCaution=best.candidateUnscored?
  ' Pontuação tática temporariamente indisponível apesar da posição confirmada. Não comparar notas como se fossem rendimento real.':'';
 return {eligible:true,status:best.fit.status,position:best.role,slot:best.slot,
  incumbent:{numero:best.incumbent.numero,name:best.incumbent.name},
  candidateScore:best.candidate.score,incumbentScore:best.incumbentScore,
  evidence:best.candidateUnscored?'posicao_confirmada_sem_pontuacao':'comparacao_ordinal_sem_gameplay',
  decision,gain:best.gain,
  positionEvidence:best.fit.label,incumbentPositionConfirmed:best.incumbentFit.eligible,
  reason:'Alternativa documental para '+tacticName+': '+roleStatus+'; '+suggestion+
   '. '+caution+extraCaution+' Não usa Overall, nem garante rendimento em partidas.',
  text:'Jogar como '+best.role+' · Substituir '+formatCap(best.incumbent.numero)+' '+best.incumbent.name};
}
return Object.freeze({recommend});
});
