/* Regras consultivas versionadas. Não alteram a carta, os atributos ou a IA do jogo. */
(function(w,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;if(w)w.CRAQUE_FUNCTION_METHOD_V383=a;})(typeof window!=='undefined'?window:null,function(){'use strict';
const VERSION='function-383-20261101',CHECKED='2026-11-01',BASE='https://efootballexplained.com/playing-styles/';
const DEF='https://efhub.com/articles/260816_1-four-new-playing-styles-found-in-the-game-files';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const source=url=>({url,checked:CHECKED,kind:'Levantamento técnico independente; conferir após atualização do jogo',version:'eFootball 2027 / 11.1.1'});
const table={attack:{},defence:{}};
function rule(phase,names,positions,slug){for(const name of names)table[phase][norm(name)]={positions,source:source(slug?BASE+slug+'/':DEF)};}
rule('attack',['Jogador de infiltração'],['SA','MAT','MLG','MLE','MLD'],'hole-player');
rule('attack',['Ala produtivo'],['PTE','PTD'],'prolific-winger');
rule('attack',['Orquestrador'],['VOL','MLG'],'orchestrator');
rule('attack',['Armador criativo'],['SA','MAT','PTE','PTD','MLE','MLD'],'creative-playmaker');
rule('attack',['Atacante pivô'],['CA','SA'],'deep-lying-forward');
rule('attack',['Pivô'],['CA'],'target-man');
rule('attack',['Homem de área'],['CA'],'fox-in-the-box');
rule('attack',['Puxa marcação','Arrastar defesa'],['CA','SA','MAT'],'dummy-runner');
rule('attack',['Clássico nº 10'],['SA','MAT'],'classic-no-10');
rule('attack',['Perito em cruzamento'],['PTE','PTD','MLE','MLD'],'cross-specialist');
rule('attack',['Meia versátil','Todo o terreno'],['VOL','MLG','MLE','MLD'],'box-to-box');
rule('attack',['Primeiro volante'],['VOL'],'anchor-man');
rule('attack',['Construção de jogo'],['ZG'],'build-up');
rule('attack',['Lateral ofensivo'],['LE','LD'],'attacking-full-back');
rule('attack',['Lateral defensivo'],['LE','LD'],'defensive-full-back');
rule('defence',['Pressão no ataque'],['CA','SA','PTE','PTD']);
rule('defence',['Ladrão no ataque'],['CA','SA','PTE','PTD']);
rule('defence',['Foco no ataque'],['CA','SA','PTE','PTD','MAT']);
rule('defence',['Defensor participativo'],['MAT','MLE','MLD','MLG','VOL']);
rule('defence',['Interceptador de passe'],['MAT','MLE','MLD','MLG','VOL']);
rule('defence',['Meia versátil','Todo o terreno'],['MLE','MLD','MLG','VOL']);
rule('defence',['Primeiro volante','Trinco'],['VOL']);
rule('defence',['O destruidor','Destruidor'],['MLG','VOL','LE','LD','ZG']);
rule('defence',['Mestre da linha alta'],['LE','LD','ZG']);
rule('defence',['Goleiro ofensivo','GR ofensivo'],['GO']);rule('defence',['Goleiro defensivo'],['GO']);
function phase(style,position,kind){const label=String(style||'Não informado'),key=norm(style),r=table[kind][key];
 const status=['basico','básico'].includes(key)?'basic':!r?'pending':r.positions.includes(position)?'active':'inactive';
 const labels={active:'Ativo segundo a referência',inactive:'Inativo nesta posição',basic:'Básico: sem estilo específico',pending:'Ativação a conferir'};
 return {style:label,position,status,label:labels[status],positions:r?.positions||[],source:r?.source||null,
  explanation:status==='inactive'?'O estilo específico não ativa nesta posição; a movimentação geral continua. Familiaridade, função, instruções e companheiros precisam ser avaliados separadamente.':
   status==='pending'?'Sem equivalência documentada para este rótulo/fase. A proposta utiliza posição e função; não presume este estilo ativo.':
   status==='basic'?'Sem padrão específico documentado; avaliar o papel no conjunto.':'Regra da referência para esta fase e posição; não comprova a edição da conta nem o rendimento em partida.'};
}
function activation(member){return {version:VERSION,attack:phase(member.offenseStyle,member.slot.position,'attack'),defence:phase(member.defenceStyle,member.offBall.position,'defence'),
 familiarity:(member.card.positions||[member.card.position]).includes(member.slot.position)&&(member.card.positions||[member.card.position]).includes(member.offBall.position)};}
// Pesos editoriais de prioridade, não limiares de IA ou atributos finais.
const FUNCTIONS={
 keeper:{label:'Proteger a meta e iniciar a saída',positions:['GO'],attack:'Dar saída segura ao recuperar a bola',defence:'Fechar a meta e observar rebotes e bolas nas costas',delta:{1:4,7:6,8:6,9:6},skills:['gklow','gklong','gkhigh','gkpenalty'],boosters:['Goalkeeping','Saving'],test:'Saída segura, rebotes e decisões ao sair do gol'},
 cover:{label:'Proteger a linha e cobrir',positions:['ZG'],attack:'Oferecer primeiro passe sem expor a linha',defence:'Proteger profundidade e cobrir o companheiro que pressiona',delta:{1:4,4:5,5:5,6:10},skills:['intercept','blocker','aerial','mark','onepass'],boosters:['Defending','Duelling'],test:'Bolas nas costas, cobertura e primeiro passe'},
 secure:{label:'Dar apoio seguro pelo lado',positions:['LE','LD'],attack:'Oferecer passe de apoio sem abandonar a proteção',defence:'Recompor o corredor e fechar o espaço ao lado da zaga',delta:{1:7,4:5,6:10},skills:['intercept','blocker','onepass','mark','through'],boosters:['Defending','Passing'],test:'Retorno ao corredor, cobertura e saída curta'},
 advance:{label:'Apoiar por dentro e recuperar',positions:['LE','LD'],attack:'Aproximar do meio para tabelar e oferecer passe de retorno',defence:'Recuperar o corredor após a perda, com cobertura do volante',delta:{1:10,2:5,4:9,6:3},skills:['onepass','through','intercept','sole','blocker'],boosters:['Passing','Technique'],test:'Apoio interior útil e espaço deixado após avançar'},
 anchor:{label:'Guardar a frente da zaga',positions:['VOL','MLG'],attack:'Sustentar a circulação e o primeiro passe atrás da jogada',defence:'Proteger a frente da área e cobrir os avanços',delta:{1:9,4:3,6:12},skills:['intercept','blocker','onepass','mark','through'],boosters:['Defending','Passing'],test:'Proteção central e opção atrás da bola'},
 connect:{label:'Conectar os setores',positions:['VOL','MLG','MAT','SA'],attack:'Receber sob pressão, aproximar e ligar defesa e ataque',defence:'Recompor o meio e reduzir linhas de passe',delta:{1:14,2:8,4:4,6:3},skills:['onepass','through','sole','intercept','weighted'],boosters:['Passing','Technique'],test:'Apoio ao portador, domínio pressionado e recomposição'},
 infiltrate:{label:'Infiltrar e voltar ao meio',positions:['MLG','MAT','SA','MLE','MLD'],attack:'Atacar o espaço entre zagueiro e volante após o passe',defence:'Voltar ao setor e fechar a linha de passe após a perda',delta:{0:6,3:16,4:8,6:2},skills:['onepass','firstshot','through','sole','fighting'],boosters:['Agility','Shooting'],test:'Chegada sem bola no momento do passe e retorno após a perda'},
 create:{label:'Criar entre as linhas',positions:['MAT','SA','MLG'],attack:'Dar opção entre linhas e preparar o passe decisivo',defence:'Fechar o passe pelo centro e apoiar a pressão próxima',delta:{1:15,2:9,3:5},skills:['onepass','through','sole','weighted','firstshot'],boosters:['Passing','Technique'],test:'Recepção entre linhas, passe decisivo e apoio ao perder'},
 finish:{label:'Atacar a profundidade e finalizar',positions:['CA','SA'],attack:'Oferecer ruptura e finalizar com pouco tempo para dominar',defence:'Orientar a pressão sem abrir o corredor central',delta:{0:14,3:11,4:7},skills:['firstshot','onepass','through','aerial','fighting'],boosters:['Shooting','Agility'],test:'Desmarque no tempo do passe e finalização pressionada'},
 pivot:{label:'Receber de costas e tabelar',positions:['CA','SA'],attack:'Fixar um zagueiro, proteger e devolver para quem chega',defence:'Fechar a saída central e preparar a transição',delta:{1:10,2:4,5:12,0:5},skills:['onepass','aerial','firstshot','through','sole'],boosters:['Duelling','Technique'],test:'Proteção de costas, devolução e espaço para o infiltrador'},
 outlet:{label:'Aproximar para combinar',positions:['PTE','PTD','MLE','MLD'],attack:'Oferecer apoio e passe de retorno conforme o desenho',defence:'Recompor o setor e fechar o passe de progressão',delta:{1:9,2:8,4:8},skills:['onepass','through','sole','intercept','double'],boosters:['Passing','Agility'],test:'Apoio útil e recomposição no próprio setor'}
};
function choices(position){return Object.entries(FUNCTIONS).filter(([,v])=>v.positions.includes(position)).map(([key,v])=>({key,label:v.label}));}
function contract(member,requested){const active=activation(member),pos=member.slot.position;
 let key=requested||({GO:'keeper',ZG:'cover',LD:'secure',LE:'secure',VOL:'anchor',MLG:'connect',MAT:'create',SA:'connect',CA:'finish'}[pos]||'outlet');
 if(!requested&&active.attack.status==='active'&&norm(member.offenseStyle)==='jogador de infiltracao')key='infiltrate';
 if(!FUNCTIONS[key]?.positions.includes(pos))throw Error('Função incompatível com esta posição.');
 const f=FUNCTIONS[key],defensive=member.instructions.some(i=>i.type==='defensive');
 return {version:VERSION,key,label:f.label,attack:defensive?'Manter apoio de segurança e limitar avanço':f.attack,defence:f.defence,
  priorities:Object.entries(f.delta).map(([index,weight])=>({index:Number(index),weight})),skillKeys:defensive?['intercept','blocker','onepass','mark','through']:f.skills.slice(),
  boosterNames:defensive?['Defending','Passing']:f.boosters.slice(),test:f.test,
  constraints:[...(defensive?['Defensivo limita os avanços desta função.']:[]),...(member.instructions.some(i=>i.type==='anchoring')?['Ancoragem contém o deslocamento lateral; não bloqueia por si a infiltração.']:[]),
   ...(!active.familiarity?['Familiaridade nas duas fases ainda não comprovada.']:[]),...(active.attack.status==='pending'||active.defence.status==='pending'?['Estilo sem regra documentada: avaliar sem presumir sua ativação.']:[])],
  evidence:'Prioridade editorial por tarefa; proposta para comparar no jogo, sem nota de rendimento.'};
}
return Object.freeze({VERSION,CHECKED,activation,contract,choices});
});
