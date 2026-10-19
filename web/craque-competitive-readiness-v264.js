/* V264 — readiness competitivo DOCUMENTAL, não nota meta nem Overall.
 * Motor puro: percorre 246 edições e cinco táticas sem gravar nenhuma build.
 * Critérios do usuário (Blackjhon/Rentão) são referência metodológica,
 * nunca autoria atribuída a creators sem vídeo da edição.
 */
(function(host,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_COMPETITIVE_READINESS_V264=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const PENDING=/\bpendente\b|\bconfirmar\b|\binvalidad[oa]\b/i;
 const STATUS=Object.freeze({
  blocked:'EDIÇÃO PENDENTE — SEM RECOMENDAÇÃO CONFIRMADA',
  review:'REVISÃO TÉCNICA — NÃO HOMOLOGADA',
  registered:'BUILD REGISTRADA — NÃO HOMOLOGADA',
  gameplay:'EVIDÊNCIAS DOCUMENTADAS — EXIGIR REVISÃO HUMANA'
 });
 const styles=Object.freeze(['posse','normal','rapido','fora','longo']);
 const has=(proof,id)=>proof?.checks?.some(x=>x.id===id&&x.documented===true)===true;
 function assess(card,proof,style,advice={}){
  if(!styles.includes(style))throw new Error('Tática inválida na V264');
  if(!card||!Number.isInteger(Number(card.numero)))throw new Error('Carta não identificável');
  const id=String(card.id??''),edition=String(card.versao??'');
  // Player ID de seis dígitos NÃO implica erro; somente marcador literal
  // pendente ou índice sem Card ID impede recomendar em edição exata.
  const identity=Boolean(proof?.matched&&has(proof,'edition')&&
   id.trim()&&!PENDING.test(id)&&!PENDING.test(edition));
  const training=Array.isArray(card.niveis)&&card.niveis.length===10&&
   card.niveis.every(n=>Number.isInteger(n)&&n>=0);
  const natives=has(proof,'native');
  const equipment=has(proof,'additional');
  const base=has(proof,'base');
  const field=has(proof,'gameplay');
  const video=has(proof,'video');
  const budget=has(proof,'budget');
  const slot=has(proof,'booster');
  const eligibleBooster=Boolean(identity&&slot&&
   advice?.booster?.status==='slot_elegivel_para_comparacao'&&
   advice?.booster?.equipStatus==='condicionado_a_slot');
  const pending=[];
  if(!identity)pending.push('Identidade exata da edição/Card ID');
  if(!budget)pending.push('Nível máximo e PP com prova');
  if(!training)pending.push('Vetor de treino original registrado');
  if(!natives)pending.push('Habilidades nativas da edição');
  if(!equipment)pending.push('Lista completa das cinco habilidades adicionais no jogo');
  if(!slot)pending.push('Situação do segundo slot de ímpeto nesta conta');
  if(!base)pending.push('Atributos-base completos desta versão');
  if(!video)pending.push('Print/vídeo comprovando a edição exata');
  if(!field)pending.push('Comparação controlada em partidas');
  const classification=!identity?'blocked':field&&budget&&base&&video&&training?
   'gameplay':training?'registered':'review';
  return Object.freeze({
   capture:Number(card.numero),card_id:id,style,
   classification,label:STATUS[classification],
   allowedToPresentCandidates:identity,
   allowedToReplaceApprovedBuild:false,
   canSpendTokensAutomatically:false,
   competitivelyHomologated:false,
   training:training?'registrada_sem_homologacao':'ausente_ou_pendente',
   additional:!identity?'sem_indicacao_confiavel':
    !natives?'nativas_pendentes':equipment?'lista_local_conferida':'cinco_slots_nao_conferidos',
   booster:!identity?'identidade_pendente':
    eligibleBooster?'elegivel_apos_provas_de_slot':'somente_comparacao',
   // Token selecionado: valor oficial anunciado em 28/09/2026 para v6.1.0;
   // não deduz inventário do jogador e não representa botão de compra.
   selectedSkillTokenCost:100,
   missing:Object.freeze(pending),
   documentationCount:9-pending.length,
   sources:Object.freeze({identity,training,budget,natives,equipment,slot,base,video,field})
  });
 }
 return Object.freeze({assess,STATUS,styles});
});
