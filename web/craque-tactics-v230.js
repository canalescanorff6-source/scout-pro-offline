/* Craque Tático V230 — comparação documental de estilos nas DUAS formações.
 * 5 estratégias + qualquer um dos 246 jogadores, sem inventar atributos ou Overall.
 * Pontuação ordinal de encaixe tático, NÃO avaliação de qualidade/meta em partidas.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_TACTICS_V230=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const MODES=Object.freeze({
 posse:{label:'Posse de Bola',hint:'Apoios, tabelas, domínio e saída curta. Meias orquestradores e atacantes que conectam linhas ganham relevância.'},
 normal:{label:'Contra-Ataque Normal',hint:'Bloco equilibrado, transição controlada e apoio defensivo. A mesma formação pode ser usada com funções complementares.'},
 rapido:{label:'Contra-Ataque Rápido',hint:'Ataque à profundidade, pressão após perda e movimentos de ruptura. Preferir características de velocidade sem supor atributos desconhecidos.'},
 fora:{label:'Por Fora',hint:'Criar amplitude a partir de laterais/meias sem obrigar pontas nem cruzamentos. Seu desenho estreito continua possível.'},
 longo:{label:'Bola Longa',hint:'Primeira ligação vertical, disputa aérea e segunda bola. Considerar um atacante de referência e meias que recolham rebotes.'}
});
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const POS=Object.freeze({AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DC:'ZG',ZC:'ZG',ZG:'ZG',DD:'LD',LD:'LD',DE:'LE',LE:'LE',GR:'GO',GO:'GO',PTE:'PTE',PTD:'PTD',MLE:'MLE',MLD:'MLD'});
function slotRole(slot){
 if(['zge','zgd'].includes(slot))return 'ZG';
 if(['cae','cad'].includes(slot))return 'CA';
 if(['vole','vold'].includes(slot))return 'VOL';
 return ({go:'GO',le:'LE',ld:'LD',vol:'VOL',mlg:'MLG',mlge:'MLG',mlgd:'MLG',mat:'MAT',sa:'SA',ca:'CA'})[slot]||null;
}
const NEAR={
 CA:['SA','MAT'],SA:['CA','MAT'],MAT:['SA','MLG','VOL'],MLG:['MAT','VOL'],
 VOL:['MLG','ZG','MAT'],ZG:['VOL','LD','LE'],LD:['LE','ZG','MLD'],LE:['LD','ZG','MLE']
};
function position(card){return POS[String(card?.posicao||card?.shown_position||'').toUpperCase()]||null;}
function fit(card,slot){
 const want=slotRole(slot),have=position(card);
 if(!want||!have)return {match:false,score:-100,label:'Posição não documentada'};
 if(want==='GO'||have==='GO')return have===want?
   {match:true,score:55,label:'Posição original'}:{match:false,score:-100,label:'Goleiro incompatível'};
 if(want===have)return {match:true,score:55,label:'Posição original'};
 const trained=(typeof window!=='undefined'?window.SCOUT_POSITION_TRAINING_V246:null)||
  (typeof module==='object'&&module.exports?require('./scout-position-training-v246.js'):null);
 const confirmed=trained?.status(card,want);
 if(confirmed?.status==='treinada'||confirmed?.status==='familiar')
  return {match:true,score:49,label:confirmed.label};
 if(NEAR[want]?.includes(have))return {match:false,score:15,label:'Adaptação sem familiaridade confirmada'};
 return {match:false,score:-100,label:'Posição incompatível'};
}
/* V392: guia de execução MANUAL para duas táticas. São tarefas por VAGA,
 * nunca equipamento, build validada ou comportamento garantido da carta.
 * A ficha individual, seu PP e seus slots seguem nos motores V251/V228/V311.
 */
const COUNTER_GUIDES=Object.freeze({
 normal:Object.freeze({
  label:'Contra-Ataque',
  attack:'Recupere, confirme a primeira linha de passe e procure MAT/SA entre as linhas. Combine passe curto e vertical; lance ao espaço só quando o CA tiver vantagem. Um CA apoia, o outro ataca a profundidade.',
  defence:'Defenda primeiro pelo centro controlando o VOL. Feche o passe para o atacante, use contenção e intercepte; não tire o ZG da cobertura sem necessidade. Reagrupe antes de tentar recuperar alto.',
  risk:'Bloco recuado pode isolar os atacantes. Se o MAT/SA não acompanhar, segure a bola no VOL e reaproxime em vez de forçar lançamento.',
  formations:Object.freeze({
   '4312':Object.freeze({attack:'4-3-1-2: VOL de proteção + VOL de ligação; MLG se aproxima do MAT para formar o apoio do primeiro CA. Segundo CA procura ruptura.',defence:'4-3-1-2: dois VOL vedam o meio; MLG recompõe e MAT corta a linha de passe ao volante rival.'}),
   '4213':Object.freeze({attack:'4-2-1-3 estreita: VOL encontra MAT ou SA central; SA devolve a um dos dois CA. Alterne passe de apoio e profundidade.',defence:'4-2-1-3 estreita: o SA fecha a saída central e o MAT recua sobre o primeiro volante rival; os dois VOL não devem subir juntos.'})
  }),
  roles:Object.freeze({
   GO:Object.freeze(['Distribuir com segurança para ZG/VOL; ligação direta só se receptor e segunda bola estiverem cobertos.','Proteger a meta e não sair sem ângulo claro.']),
   LE:Object.freeze(['Dar apoio simples por fora ou por dentro sem cruzamento obrigatório.','Segurar o lado esquerdo e não abandonar o corredor em transição.']),
   LD:Object.freeze(['Dar passe de apoio, ficando como cobertura da perda.','Segurar o lado direito e fechar o espaço entre lateral e ZG.']),
   ZG:Object.freeze(['Iniciar com passe limpo e não conduzir para zona congestionada.','Conservar linha, acompanhar a profundidade e cobrir o colega que confronta.']),
   VOL:Object.freeze(['Um sustenta o time; outro oferece passe vertical ao MAT/SA conforme a jogada.','Proteger zona central, bloquear passe de ruptura e não pressionar com os dois ao mesmo tempo.']),
   MLG:Object.freeze(['Ser terceiro homem: recuperar, apoiar o MAT e chegar de trás.','Recompor o meio e fechar opções de passe ao redor do VOL.']),
   MAT:Object.freeze(['Receber entre linhas, devolver de primeira quando possível e servir o CA desmarcado.','Fechar o passe central de saída e voltar ao espaço dos VOL.']),
   SA:Object.freeze(['Aproximar dos dois CA e preparar tabela curta para ruptura.','Atrapalhar a distribuição pelo centro sem perder a linha do meio.']),
   CA:Object.freeze(['Alternar apoio de costas e desmarque nas costas; finalizar quando houver ângulo real.','Fechar o passe simples ao meio; não gastar corrida perseguindo os dois ZG.'])
  })
 }),
 rapido:Object.freeze({
  label:'Contra-Ataque Rápido',
  attack:'Após o desarme, procure rapidamente uma linha curta e vertical para VOL, MAT ou SA. Acione um CA em profundidade e use o outro como apoio; se o caminho estiver fechado, recicle o passe sem acelerar às cegas.',
  defence:'A pressão é mais adiantada: pressione com o jogador próximo e cubra a linha de passe com o VOL. Troque o cursor para proteger a profundidade antes do lançamento rival. Evite puxar os dois ZG e pressionar sem cobertura.',
  risk:'Linha alta expõe bolas nas costas. Quando o adversário prepara lançamento, abandone a perseguição e priorize o ZG de cobertura; se necessário, desacelere a pressão.',
  formations:Object.freeze({
   '4312':Object.freeze({attack:'4-3-1-2: recuperar no VOL/MLG, MAT recebe em um ou dois toques, CA de apoio combina com o CA de ruptura.',defence:'4-3-1-2: MLG pressiona o portador próximo; um VOL cobre a frente da zaga e o outro vigia o passe de retorno.'}),
   '4213':Object.freeze({attack:'4-2-1-3 estreita: MAT liga o primeiro passe e SA central encosta nos dois CA para tabela e ruptura por dentro.',defence:'4-2-1-3 estreita: MAT/SA perturbam a saída central; um VOL guarda a zona da bola nas costas do MAT e o outro protege os ZG.'})
  }),
  roles:Object.freeze({
   GO:Object.freeze(['Saída rápida, mas com passe seguro para iniciar a transição.','Ficar atento à profundidade sem sair automaticamente em toda bola.']),
   LE:Object.freeze(['Apoiar curto sem subir ao mesmo tempo que o outro lateral.','Recompor imediatamente; proteger o corredor na linha alta.']),
   LD:Object.freeze(['Ser linha de passe de retorno sem romper a cobertura.','Recompor e não abrir o espaço lateral do ZG.']),
   ZG:Object.freeze(['Primeiro passe vertical apenas quando houver receptor livre; caso contrário, apoiar o VOL.','Um confronta, o outro cobre a profundidade; antecipar lançamentos, não perseguir os dois CA.']),
   VOL:Object.freeze(['Um progride com passe vertical; outro permanece preparado para a perda.','Controlar a zona à frente dos ZG e cortar a bola nas costas do MAT.']),
   MLG:Object.freeze(['Pressionar, recuperar e atacar como terceiro homem em apoio ao MAT.','Pressionar apenas com cobertura do VOL; retornar se a primeira pressão falhar.']),
   MAT:Object.freeze(['Receber de frente e acelerar a tabela; decidir rapidamente entre CA de apoio e CA de ruptura.','Fechar passe ao meio e iniciar pressão coordenada, sem perseguir lateral fora de sua zona.']),
   SA:Object.freeze(['Aproximar dos dois CA, combinar passe de primeira e infiltração central.','Pressionar saída por dentro e recompor para não abrir a frente dos VOL.']),
   CA:Object.freeze(['Um ataca a última linha, o outro encosta para tabela; alternar funções conforme as cartas reais.','Orientar a pressão para o corredor escolhido, não correr sem direção.'])
  })
 })
});
function counterGuide(mode,formation,slot){
 const cfg=COUNTER_GUIDES[mode];
 if(!cfg||!Object.hasOwn(cfg.formations,formation))return null;
 const role=slot===undefined||slot===null?null:slotRole(slot);
 if(slot!==undefined&&slot!==null&&!role)return null;
 const task=role?cfg.roles[role]:null;
 if(role&&!task)return null;
 return Object.freeze({
  mode,formation,label:cfg.label,attack:cfg.attack,defence:cfg.defence,risk:cfg.risk,
  formationAttack:cfg.formations[formation].attack,
  formationDefence:cfg.formations[formation].defence,
  ...(task?{role,roleAttack:task[0],roleDefence:task[1]}:{}),
  evidence:'Guia tático de controle manual por formação e vaga. Não é ficha individual, nem prova de habilidade, ímpeto ou rendimento da carta.',
  source:'https://efhub.com/pt-BR/articles/261021_3-the-six-team-playstyles-underlying-parameters-revealed'
 });
}

const clauses={
 posse:[
 [/orquestrador|armador criativo|classico|meia versatil|primeiro volante/,17,'Apoio e controle pelo centro'],
 [/pivo|puxa marcacao|homem de area|infiltracao/,11,'Conexão ofensiva entre linhas'],
 [/lateral defensivo|defensor criativo/,9,'Segurança para saída curta']
 ],
 normal:[
 [/primeiro volante|meia versatil|lateral defensivo|defensor criativo/,15,'Equilíbrio defensivo na transição'],
 [/artilheiro|puxa marcacao|infiltracao|destruidor/,10,'Respostas ao recuperar a bola']
 ],
 rapido:[
 [/artilheiro|infiltracao|puxa marcacao|ala produtivo|lateral ofensivo/,17,'Ataque aos espaços'],
 [/meia versatil|destruidor|lateral defensivo/,10,'Recuperação e cobertura'],
 [/orquestrador|armador criativo/,5,'Passe de ligação']
 ],
 fora:[
 [/lateral ofensivo|lateral atacante|lateral movel|ala produtivo|perito em cruzamento/,16,'Amplitude funcional'],
 [/meia versatil|orquestrador|armador criativo/,10,'Mudança de corredor'],
 [/lateral defensivo/,6,'Equilíbrio sem subir o lateral']
 ],
 longo:[
 [/pivo|homem de area|artilheiro/,17,'Recepção e presença ofensiva'],
 [/destruidor|primeiro volante|meia versatil/,10,'Segunda bola e cobertura'],
 [/defensor criativo|orquestrador/,8,'Primeira distribuição']
 ]
};
const SKILL={
 posse:[/one.touch pass|passe de primeira|through passing|passe em profundidade/,9,'Habilidade de ligação curta'],
 normal:[/interception|interceptacao|one.touch pass|passe de primeira/,7,'Leitura da transição'],
 rapido:[/through passing|passe em profundidade|first.time shot|chute de primeira/,8,'Passe ou finalização rápida'],
 fora:[/weighted pass|passe na medida|low lofted pass|passe aereo baixo/,8,'Circulação lateral'],
 longo:[/heading|cabecada|aerial superiority|superioridade aerea|low lofted pass/,8,'Jogo aéreo ou lançamento']
};
function score(card,slot,mode='posse'){
 if(!Object.hasOwn(MODES,mode))throw Error('Estilo de técnico não reconhecido');
 const placement=fit(card,slot);
 if(placement.score<0)return {score:-100,role:slotRole(slot),position:position(card),
  placement:placement.label,signals:[],confidence:'pendente',mode};
 const styles=norm([card?.estilo_ataque,card?.estilo_defesa,card?.attack_style,card?.defence_style].filter(Boolean).join(';'));
 const skill=norm(card?.habilidades_nativas||card?.native_skills||'');
 let result=placement.score,signals=[];
 for(const [rx,bonus,text] of clauses[mode])if(rx.test(styles)){result+=bonus;signals.push(text)}
 const [rx,bonus,text]=SKILL[mode];
 if(rx.test(skill)){result+=bonus;signals.push(text)}
 if(!styles){signals.push('Estilo da edição ainda não documentado')}
 if(!skill){signals.push('Habilidades nativas ainda não documentadas')}
 if(!placement.match)signals.push('Validar familiaridade real com a posição no jogo');
 if(!signals.length)signals.push('Posição cadastrada, sem prova suficiente sobre movimentação');
 return {
  score:Math.min(100,result),role:slotRole(slot),position:position(card),
  placement:placement.label,signals,
  confidence:placement.match&&styles&&skill?'comparativo_documental':'provisorio',
  mode,why:'Encaixe por posição/estilo/habilidade documentados, sem Overall, atributos ocultos ou testes inventados.'
 };
}
function rank(cards,slot,mode,exclude=[],used=[]){
 if(!Array.isArray(cards))throw Error('Lista de cartas indisponível');
 const banned=new Set([...exclude,...used].map(Number));
 const identity=(typeof window!=='undefined'?window.SCOUT_PLAYER_IDENTITY_V245:null)||
  (typeof module==='object'&&module.exports?require('./scout-player-identity-v245.js'):null);
 const busyNames=new Set(cards.filter(c=>used.some(n=>Number(n)===Number(c.numero)))
  .map(c=>identity?.key(c)).filter(Boolean));
 return cards.filter(c=>!banned.has(Number(c.numero))&&
  (!identity||!busyNames.has(identity.key(c))))
 .map(c=>({card:c,...score(c,slot,mode)}))
 // V374: a positive comparison score is not proof of a usable secondary role.
 // fit/score remain available for conditional previews; recommendations require proof.
 .filter(x=>x.score>=0&&fit(x.card,slot).match)
 .sort((a,b)=>b.score-a.score||Number(a.card.numero)-Number(b.card.numero));
}

/* V392: 11 + 12 para as duas formações existentes. Este é um ranking
 * DOCUMENTAL de encaixe, não uma simulação de vitória, status final ou meta.
 * Usa apenas posição comprovada, identidade e sinais reais cadastrados.
 * Nunca escreve no banco de dados nem substitui plano salvo.
 */
function recommendSquad(cards,formation,mode,exclude=[]){
 if(!['normal','rapido'].includes(mode)||!Array.isArray(cards)||!formation||
   !['4312','4213'].includes(formation.id)||formation.starters?.length!==11)
  return null;
 const identity=(typeof window!=='undefined'?window.SCOUT_PLAYER_IDENTITY_V245:null)||
  (typeof module==='object'&&module.exports?require('./scout-player-identity-v245.js'):null);
 if(!identity?.key)throw Error('Identidade por pessoa indisponível: recomendação bloqueada');
 const excluded=new Set((Array.isArray(exclude)?exclude:[]).map(Number));
 const pool=cards.filter(c=>Number.isInteger(Number(c.numero))&&!excluded.has(Number(c.numero)));
 const names=new Set(),caps=new Set();
 const normStyle=c=>norm([c?.estilo_ataque,c?.estilo_defesa].filter(Boolean).join(' '));
 const bonus=(card,slot)=>{
  const t=normStyle(card);
  if(slot==='vole'&&/orquestrador|defensor criativo/.test(t))return 7;
  if(slot==='vold'&&/primeiro volante|destruidor/.test(t))return 7;
  if(slot==='zge'&&/destruidor/.test(t))return 6;
  if(slot==='zgd'&&/defensor criativo|construcao de jogo/.test(t))return 6;
  if(slot==='cae'&&/artilheiro|infiltracao/.test(t))return mode==='rapido'?8:5;
  if(slot==='cad'&&/pivo|homem de area|puxa marcacao|arrastar defesa/.test(t))return 7;
  if(slot==='mat'&&/armador criativo|jogador de infiltracao/.test(t))return 5;
  if(slot==='sa'&&/atacante pivo|infiltracao|puxa marcacao/.test(t))return 5;
  if(['le','ld'].includes(slot)&&/lateral defensivo/.test(t))return 7;
  return 0;
 };
 const optionCache=new Map();
 function options(slot){
  if(optionCache.has(slot))return optionCache.get(slot);
  const ordered=pool.flatMap(card=>{
   if(!fit(card,slot).match)return [];
   const info=score(card,slot,mode);
   if(info.score<0)return [];
   return [{card,slot,role:slotRole(slot),fit:info.placement,
    score:info.score,priority:info.score+bonus(card,slot),
    confidence:info.confidence,signals:info.signals.slice(0,3),
    source:'Ranking documental por posição, função e estilo: testar no jogo.'}];
  }).sort((a,b)=>b.priority-a.priority||b.score-a.score||
   Number(a.card.numero)-Number(b.card.numero));
  optionCache.set(slot,ordered);
  return ordered;
 }
 function pick(slot){
  const next=options(slot).find(item=>!caps.has(Number(item.card.numero))&&
   !names.has(identity.key(item.card)));
  if(!next)return null;
  caps.add(Number(next.card.numero));names.add(identity.key(next.card));
  return Object.freeze({slot,role:next.role,cap:Number(next.card.numero),
   name:next.card.name,fit:next.fit,score:next.score,
   confidence:next.confidence,signals:Object.freeze(next.signals),
   source:next.source});
 }
 const order=formation.starters.map(x=>x.slot).sort((a,b)=>{
  const aDemand=formation.starters.filter(x=>slotRole(x.slot)===slotRole(a)).length;
  const bDemand=formation.starters.filter(x=>slotRole(x.slot)===slotRole(b)).length;
  return options(a).length/aDemand-options(b).length/bDemand||
   a.localeCompare(b);
 });
 const starterMap=new Map();
 for(const slot of order){const choice=pick(slot);if(choice)starterMap.set(slot,choice);}
 const starters=formation.starters.map(x=>starterMap.get(x.slot)).filter(Boolean);
 // Banco funcional por vaga, sem permitir duas cartas da mesma pessoa.
 const needs=['go','zge','zgd','le','ld','vole','vold','mlg','mat','sa','cae','cad'];
 const bench=[];
 for(const slot of needs){
  const choice=pick(slot);
  if(choice)bench.push(choice);
 }
 const slots=Object.fromEntries(starters.map(s=>[s.slot,s.cap]));
 const ready=starters.length===11&&bench.length===12;
 const pending=starters.filter(s=>s.confidence!=='comparativo_documental').length+
  bench.filter(s=>s.confidence!=='comparativo_documental').length;
 return Object.freeze({formation:formation.id,mode,starters:Object.freeze(starters),
  bench:Object.freeze(bench),slots:Object.freeze(slots),ready,pending,
  excluded:excluded.size,method:'encaixe documental e complementaridade por função; não é prova de melhor rendimento',
  warnings:Object.freeze([
   ...(starters.length!==11?['Não há 11 posições elegíveis confirmadas. Não aplicar escalação incompleta.']:[]),
   ...(bench.length!==12?['Banco incompleto: faltam reservas comprovadamente elegíveis para algumas funções.']:[]),
   ...(pending?['Algumas edições não têm todos os sinais documentados: conferir fichas antes de investir PP, habilidades ou ímpetos.']:[])
  ])});
}

return Object.freeze({MODES,POS,position,slotRole,fit,score,rank,counterGuide,recommendSquad});
});
