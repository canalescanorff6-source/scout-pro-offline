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
 return ({go:'GO',le:'LE',ld:'LD',mlg:'MLG',mat:'MAT',sa:'SA'})[slot]||null;
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
 if(trained?.status(card,want).status==='treinada')
  return {match:true,score:49,label:'Posição treinada e confirmada nesta carta'};
 if(NEAR[want]?.includes(have))return {match:false,score:15,label:'Adaptação sem familiaridade confirmada'};
 return {match:false,score:-100,label:'Posição incompatível'};
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
 .filter(x=>x.score>=0)
 .sort((a,b)=>b.score-a.score||Number(a.card.numero)-Number(b.card.numero));
}
return Object.freeze({MODES,POS,position,slotRole,fit,score,rank});
});
