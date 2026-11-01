/* Craque Tático V381 — radar internacional por carta/estilo, somente leitura.
 * Resultados oficiais de campeonatos NÃO comprovam builds, skills ou boosters.
 * Fontes abertas, offline; nenhuma requisição automática, sugestão aplicada,
 * escrita em storage, atribuição de Overall, nem vínculo por nome do atleta.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_PRO_SCOUT_V381=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const WORLD_FINALS_2026=Object.freeze({
 mobile:Object.freeze([
  'RRQ_RADIN','BRU_CantonaRuay','MAVERICK','NACEROX',
  'DidouX','Le_ZJYLALY','WPS_APIZ','NEO • YOGATTUSO',
  'Rentao','YASSINE ETTADLAOUI','AC_GEGE','WADIE_7',
  'TJC_SWEAT20','Jxmxrn','Youness Falky','Mendonça']),
 console:Object.freeze([
  'usmakabyle','BlueFin_Akbar','1mmpulseee','shesu',
  'HASSAN PAJANI','Jvictor','Diablo','Zilo',
  'RealFabiano93','FUTEASY_10','M_Mestre','RRQ_BINONGBOYS',
  'ETTORITO','BRU_JEANSUI','RafaBraga_ZeN','Abod_iraqi'])
});
const SOURCES=Object.freeze([
 Object.freeze({id:'konami-2026-final',name:'Rentão, FUTEASY_10 e finalistas do Mundial 2026',
  kind:'official_result',platform:'mobile/console',date:'2026-07-26',
  url:'https://efootballchampionship.konami.net/en/news/detail/eFC2026-World-Finals-Results',
  proves:'Resultados e categoria dos finalistas; NÃO prova treino de carta, habilidades ou ímpetos.'}),
 Object.freeze({id:'konami-2026-roster',name:'32 participantes do Mundial 2026',
  kind:'official_roster',platform:'mobile/console',date:'2026-07-26',
  url:'https://efootballchampionship.konami.net/en/worldfinals/history/2026',
  proves:'Participação no Mundial; não comprova gameplay de uma edição nem build exata.'}),
 Object.freeze({id:'dm7-blackjhon-2026',name:'Blackjhon × DM7 PRO — partida publicada',
  kind:'public_gameplay',platform:'mobile',date:'2025-08-30',
  url:'https://www.youtube.com/watch?v=fwCFo0mONck',
  proves:'Vídeo de partida atribuído a Blackjhon; não mostra aqui prova de PP, Card ID ou habilidades.'}),
 Object.freeze({id:'cbf-rentao-2026',name:'Rentão e Juninho — Seleção Brasileira Mobile',
  kind:'federation_report',platform:'mobile',date:'2026-07-09',
  url:'https://www.cbf.com.br/selecao-brasileira/noticias/selecao-brasileira/a/e-selecao-brasileira-mobile-inicia-semana-3-do-fifae-nations-league-em-primeiro-lugar',
  proves:'Participação e desempenho competitivo geral, não distribuição de PP por carta.'}),
 Object.freeze({id:'konami-2026-regulation',name:'Regulamento do Mundial 2026 — restrição às skills',
  kind:'official_rules',platform:'mobile/console',date:'2026-07-26',
  url:'https://new.efootball.pro/worldfinals/regulation/',
  proves:'Cartas com Skill Training/Position Training não eram permitidas no torneio.'})
]);
const PROVEN_BUILDS=Object.freeze([]); // Sem print/frame com Card ID, PP e treino comprovados.
const MODES=Object.freeze(['posse','normal','rapido','fora','longo']);
const MODE_TEXT=Object.freeze({posse:'Posse de Bola',normal:'Contra-Ataque Normal',
 rapido:'Contra-Ataque Rápido',fora:'Por Fora',longo:'Passe Longo'});
const ROLE_NOTE=Object.freeze({
 CA:'Priorizar recepção orientada, tabelas com MAT/SA, finalização e ataque ao espaço central.',
 SA:'Conectar os dois atacantes com MAT, apoiar tabelas curtas e escolher infiltrações.',
 MAT:'Criar superioridade por dentro, passe curto, controle orientado e último passe.',
 MLG:'Dar continuidade às triangulações, manter linhas de passe e controlar o ritmo.',
 VOL:'Proteger o corredor central, sustentar a posse e iniciar a saída segura.',
 ZG:'Proteger profundidade e executar a primeira saída curta sem expor os laterais.',
 LD:'Priorizar cobertura e passe seguro por dentro; cruzamento não é a estratégia principal.',
 LE:'Priorizar cobertura e passe seguro por dentro; cruzamento não é a estratégia principal.',
 GO:'Controlar a profundidade da defesa e buscar reposição curta segura.',
 PTE:'Quando usado por dentro, avaliar combinação curta, aceleração e finalização.',
 PTD:'Quando usado por dentro, avaliar combinação curta, aceleração e finalização.',
 MLE:'Criar linha de passe interior e apoiar a recomposição sem depender do cruzamento.',
 MLD:'Criar linha de passe interior e apoiar a recomposição sem depender do cruzamento.'
});
const MODE_NOTE=Object.freeze({
 posse:'Preferência pessoal: posse central, passes curtos, 2 CAs + MAT e laterais defensivos; sem depender de pontas e cruzamentos.',
 normal:'Comparação contextual: progressão em transição mais cadenciada; não substituir a ficha de Posse.',
 rapido:'Comparação contextual: velocidade de execução e recuperação; não substituir a ficha de Posse.',
 fora:'Comparação contextual: uso de amplitude sem impor pontas nem cruzamentos à sua escalação.',
 longo:'Comparação contextual: saída vertical e segunda bola; não substituir a ficha de Posse.'
});
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
function ppCost(n){if(!Number.isInteger(n)||n<0||n>20)return null;let total=0;
 for(let i=0;i<n;i++)total+=1+Math.floor(i/4);return total;}
function totalPP(vec){if(!Array.isArray(vec)||vec.length!==10)return null;
 const values=vec.map(ppCost);return values.some(x=>x===null)?null:values.reduce((a,b)=>a+b,0);}
function validSource(source){return SOURCES.some(x=>x.id===source?.id);}
function exactCardProof(record,review){
 const card=review?.identity||{};
 if(!record||!card.cardId||!card.edition||
  !/^\d{8,16}$/.test(String(card.cardId))||
  String(record.cardId)!==String(card.cardId)||
  norm(record.edition)!==norm(card.edition)||
  record.tactic!==review.tactic||!MODES.includes(record.tactic)||
  !Number.isInteger(record.pp)||record.pp!==review.pp||
  !Number.isInteger(card.capture)&&record.capture!==null||
  Number.isInteger(card.capture)&&Number(record.capture)!==card.capture||
  !validSource(SOURCES.find(x=>x.id===record.sourceId))||
  record.proof?.cardIdFrameVerified!==true||
  record.proof?.progressionFrameVerified!==true||
  !Number.isFinite(record.proof?.timecodeSeconds)||
  record.proof.timecodeSeconds<0||
  !record.proof?.auditor||
  !record.proof?.recordedAt)return false;
 const source=SOURCES.find(x=>x.id===record.sourceId);
 if(!source||!['public_gameplay','verified_build_frame'].includes(source.kind))return false;
 const pp=totalPP(record.levels);
 if(pp===null||pp>record.pp||pp!==record.spentPP)return false;
 if(record.skills!=null){
  if(record.proof.skillsFrameVerified!==true||!Array.isArray(record.skills)||
    record.skills.length>5||new Set(record.skills.map(norm)).size!==record.skills.length)return false;
 }
 if(record.booster!=null&&record.proof.boosterFrameVerified!==true)return false;
 return true;
}
function sourceForCard(review,records=PROVEN_BUILDS){
 return Array.isArray(records)?records.filter(x=>exactCardProof(x,review)):[];
}
function inspect(review,records=PROVEN_BUILDS){
 const identity=review?.identity||{},verified=sourceForCard(review,records);
 const budget=Number.isInteger(review?.pp)?review.pp:null;
 const spent=totalPP(review?.proposed);
 const group=review?.role||review?.position||'';
 const sourceLabel=review?.sourceKind==='profile'?'rascunho salvo':review?.sourceKind==='revision'?'revisão contextual salva':'motor consultivo';
 return Object.freeze({
  schema:'CRAQUE_PRO_RADAR_V381',capture:identity.capture??null,
  cardId:String(identity.cardId||''),edition:String(identity.edition||''),
  tactic:review?.tactic||'posse',role:group,
  training:{budget,spent,valid:budget!==null&&spent!==null&&spent<=budget,origin:sourceLabel},
  skills:{count:Math.min(5,Array.isArray(review?.skills)?review.skills.length:0),status:'recomendação contextual, não comprovada em pro player'},
  booster:{available:Boolean(review?.boosters?.length),slotSupported:review?.boosterSlotSupported===true},
  verifiedBuilds:verified.length,verified,
  referenceTier:'fontes gerais de competição, SEM atribuição de ficha exata',
  roleNote:ROLE_NOTE[group]||'Analisar função, execução e critérios individuais da edição.',
  tacticNote:MODE_NOTE[review?.tactic]||MODE_NOTE.posse,
  mayOverwrite:false,mayEquip:false,maySpendTokens:false
 });
}
function mk(doc,tag,cl,text){const e=doc.createElement(tag);if(cl)e.className=cl;
 if(text!==undefined)e.textContent=String(text);return e;}
function panel(review,doc){
 const info=inspect(review);
 if(!doc||typeof doc.createElement!=='function')return null;
 const section=mk(doc,'details','ct381-pro-radar');
 section.setAttribute('aria-label','Radar mundial de referências profissionais');
 const sum=mk(doc,'summary','','Radar PRO mundial · referências e evidências');
 section.append(sum);
 const body=mk(doc,'div','ct381-pro-body');
 body.append(mk(doc,'p','ct381-pro-context','Esta ficha: '+(info.cardId||'Card ID pendente')+' · '+(info.edition||'edição pendente')+' · '+(MODE_TEXT[info.tactic]||'Posse de Bola')+'.'));
 body.append(mk(doc,'p','ct381-pro-focus',info.roleNote));
 body.append(mk(doc,'p','ct381-pro-note',info.tacticNote));
 const counts=mk(doc,'div','ct381-pro-checks');
 counts.append(mk(doc,'p','', 'Treino: '+(info.training.valid?info.training.spent+'/'+info.training.budget+' PP · '+info.training.origin:'PP ou treino pendente')));
 counts.append(mk(doc,'p','', 'Habilidades: '+info.skills.count+' candidatas do motor, não da conta de um pro player.'));
 counts.append(mk(doc,'p','', 'Ímpeto: '+(info.booster.available?(info.booster.slotSupported?'opções consultivas; conferir slot':'opções sem slot adicional confirmado'):'nenhum extra comprovado nesta ficha')));
 counts.append(mk(doc,'p','ct381-pro-evidence',info.verifiedBuilds?
  info.verifiedBuilds+' build(s) com Card ID, edição, PP e quadros conferidos.':
  'Nenhuma build exata atribuída a Rentão, Blackjhon ou outro pro player sem prova visual.'));
 body.append(counts);
 body.append(mk(doc,'p','ct381-pro-rule','O Mundial 2026 não permitia cartas com treinamento adicional de habilidades/posições. Resultado profissional não confirma as 5 habilidades nem o ímpeto de uma carta.'));
 const sources=mk(doc,'details','ct381-pro-sources');sources.append(mk(doc,'summary','','Fontes públicas verificáveis · Rentão, Blackjhon e mundo'));
 const list=mk(doc,'ul','ct381-pro-links');
 for(const source of SOURCES){
  const li=mk(doc,'li');const a=mk(doc,'a','',source.name);
  a.href=source.url;a.target='_blank';a.rel='noopener noreferrer';
  li.append(a,mk(doc,'small','',source.proves));list.append(li);
 }
 sources.append(list);body.append(sources);
 const roster=mk(doc,'details','ct381-pro-roster');
 roster.append(mk(doc,'summary','','Mundial 2026: 16 Mobile + 16 Console'));
 roster.append(mk(doc,'p','', 'Mobile: '+WORLD_FINALS_2026.mobile.join(' · ')));
 roster.append(mk(doc,'p','', 'Console: '+WORLD_FINALS_2026.console.join(' · ')));
 body.append(roster);
 section.append(body);return section;
}
return Object.freeze({WORLD_FINALS_2026,SOURCES,PROVEN_BUILDS,MODES,MODE_TEXT,
 ppCost,totalPP,exactCardProof,sourceForCard,inspect,panel});
});
