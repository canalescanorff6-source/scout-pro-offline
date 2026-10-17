/* SCOUT PRO V219 — rodízio de testes: nenhuma carta repetida dentro de cada bateria.
 * Evidência documental da versão, NUNCA Overall, jogador inventado ou proficiência presumida.
 * Até a foto do Black ser conferida, a lista de 23 fica vazia e a grade é uma PRÉVIA.
 */
(function(host){
'use strict';
const ALIASES=Object.freeze({AC:'CA',CA:'CA',SA:'SA',MO:'MAT',MAT:'MAT',MC:'MLG',ME:'MLG',MLG:'MLG',MDF:'VOL',VOL:'VOL',DC:'ZG',ZC:'ZG',ZG:'ZG',DD:'LD',LD:'LD',DE:'LE',LE:'LE',GR:'GO',GO:'GO',PTD:'PTD',PTE:'PTE',MLD:'MLD',MLE:'MLE'});
const BENCH_SIZE=12,START_SIZE=11,SQUAD_SIZE=23;
const NAMES=Object.freeze(['Âncora','Circuito','Magnetismo','Diamante','Labirinto','Triângulo','Cadência','Prisma','Vértice','Controle','Ritmo','Precisão','Sutileza','Visão','Pressão']);
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function position(card){return ALIASES[String(card?.posicao||'').toUpperCase()]||null}
function isKeeper(c){return position(c)==='GO'}
function desired(slot){
 if(slot==='go')return 'GO';if(['zge','zgd'].includes(slot))return 'ZG';
 if(['cae','cad'].includes(slot))return 'CA';if(['vole','vold'].includes(slot))return 'VOL';
 if(slot==='mlg')return 'MLG';if(slot==='mat')return 'MAT';if(slot==='sa')return 'SA';
 if(['le','ld'].includes(slot))return slot.toUpperCase();return null;
}
function suitability(card,slot){
 const want=desired(slot),have=position(card);
 if(!want||!have)return {score:-100,kind:'indisponível'};
 if(want==='GO')return have==='GO'?{score:100,kind:'posição original'}:{score:-100,kind:'sem goleiro'};
 if(have==='GO')return {score:-100,kind:'goleiro incompatível'};
 if(have===want)return {score:100,kind:'posição original'};
 const nearby={
  SA:['CA','MAT'],CA:['SA','MAT','PTD','PTE'],MAT:['SA','MLG','VOL','MLD','MLE'],
  MLG:['MAT','VOL','MLD','MLE'],VOL:['MLG','ZG','MAT'],
  ZG:['VOL','LD','LE'],LD:['LE','ZG','MLD','PTD'],LE:['LD','ZG','MLE','PTE']
 };
 return nearby[want]?.includes(have)?{score:37,kind:'adaptação não confirmada'}:
  {score:-100,kind:'posição não compatível documentada'};
}
function styleFor(card){return norm(String(card.estilo_ataque||'')+' '+String(card.estilo_defesa||''))}
function evidenceScore(card,slot){
 const base=suitability(card,slot);
 if(base.score<0)return base.score;
 const type=styleFor(card),native=norm(card.habilidades_nativas);
 let score=base.score;
 if(slot==='vole'&&/orquestrador/.test(type))score+=24;
 else if(slot==='vold'&&/primeiro volante|trinco|destruidor/.test(type))score+=20;
 else if(slot==='mat'&&/armador criativo/.test(type))score+=21;
 else if(['cae','cad'].includes(slot)&&/artilheiro|homem de area|puxa marcacao/.test(type))score+=17;
 else if(['le','ld'].includes(slot)&&/lateral defensivo/.test(type))score+=15;
 else if(slot==='zge'&&/destruidor/.test(type))score+=12;
 else if(slot==='zgd'&&/defensor criativo|construcao de jogo/.test(type))score+=12;
 else if(slot==='mlg'&&/meia versatil|orquestrador/.test(type))score+=10;
 if(['cae','cad','sa','mat','mlg','vole','vold'].includes(slot)&&/one.?touch pass|passe de primeira/.test(native))score+=4;
 return score;
}
function excludedSet(list,cards){
 const known=new Set(cards.map(c=>Number(c.numero)));
 const items=(Array.isArray(list)?list:[]).map(Number);
 const out=new Set(items.filter(n=>Number.isInteger(n)&&known.has(n)));
 return out;
}
function analyze(cards,excluded){
 if(!Array.isArray(cards))throw Error('Catálogo indisponível');
 const unique=new Map();
 for(const c of cards){const n=Number(c.numero);
  if(!Number.isInteger(n)||unique.has(n))throw Error('ID do elenco ausente ou repetido: '+n);
  unique.set(n,c);
 }
 const blocked=excludedSet(excluded,cards),available=cards.filter(c=>!blocked.has(Number(c.numero)));
 const keepers=available.filter(isKeeper).length;
 const sizeLimit=Math.floor(available.length/SQUAD_SIZE);
 const maxTeams=Math.min(sizeLimit,keepers);
 return {cards:cards.length,excluded:blocked.size,available:available.length,keepers,
  maxTeams,remaining:available.length-maxTeams*SQUAD_SIZE,
  totalFullByQuantity:sizeLimit,goalkeeperLimited:keepers<sizeLimit,
  requiresBlackPhoto:true,listComplete:blocked.size===23,
  blocked:[...blocked].sort((a,b)=>a-b)};
}
// Vincula cada partida à composição realmente utilizada; não reaproveita resultados após mudar a escalação.
function rosterFingerprint(team,excluded=[],cards=[]){
 if(!team||!Array.isArray(team.starters)||!Array.isArray(team.bench))throw Error('Equipe inválida para registrar partida');
 if(!Array.isArray(cards)||cards.length!==246)throw Error('Catálogo completo necessário para identidade do elenco');
 const map=new Map(cards.map(c=>[Number(c.numero),c]));
 const identity=cap=>{
  const c=map.get(Number(cap));if(!c)throw Error('Carta inexistente no histórico: '+cap);
  return [Number(c.numero),String(c.id??''),String(c.versao??'')].join(':');
 };
 const blocked=[...new Set((Array.isArray(excluded)?excluded:[]).map(Number))].sort((a,b)=>a-b);
 const starters=team.starters.map(x=>String(x.slot)+':'+identity(x.cap)).sort();
 const bench=team.bench.map(x=>identity(x.cap)).sort();
 return JSON.stringify({schema:'SCOUT_ROSTER_SIGNATURE_V223',formation:team.formation,
  team:team.id,starters,bench,excluded:blocked});
}
function build(cards,formation,excluded,cycle=1,tactic='posse'){
 const tactical=host?.CRAQUE_TACTICS_V230;
 if(!['posse','normal','rapido','fora','longo'].includes(tactic))throw Error('Tática de técnico inválida');
 if(tactic!=='posse'&&!tactical)throw Error('Motor dos cinco estilos não carregou');
 if(!formation||!['4312','4213'].includes(formation.id)||!Array.isArray(formation.starters)||formation.starters.length!==START_SIZE)throw Error('Formação não reconhecida');
 const stat=analyze(cards,excluded);
 if(![1,2].includes(Number(cycle)))throw Error('Rodada de teste inválida');
 const blocked=new Set(stat.blocked);
 const filtered=cards.filter(c=>!blocked.has(Number(c.numero)));
 const expectedTotal=stat.available;
 const count=stat.maxTeams;
 const entries=Array.from({length:count},(_,i)=>({
  id:formation.id+'-r'+cycle+'-'+String(i+1).padStart(2,'0')+(tactic==='posse'?'':'-'+tactic),
  name:(tactic==='posse'?'Posse':tactical.MODES[tactic].label)+' '+formation.id+' · '+NAMES[i%NAMES.length]+' '+String(i+1).padStart(2,'0')+(cycle===2?' · Rodada 2':''),
  tactic,
  index:i+1,formation:formation.id,starters:[],bench:[],warnings:[]
 }));
 const byN=new Map(filtered.map(c=>[Number(c.numero),c]));
 const used=new Set();
 const slots=formation.starters.map(s=>({slot:s.slot,role:desired(s.slot)}));
 // Posicionamentos raros primeiro para evitar consumir jogadores de funções escassas.
 const exactCount=role=>filtered.filter(c=>position(c)===role).length;
 slots.sort((a,b)=>(exactCount(a.role)/slots.filter(s=>s.role===a.role).length)-
                     (exactCount(b.role)/slots.filter(s=>s.role===b.role).length)||
   (a.slot==='vole'?-1:b.slot==='vole'?1:a.slot.localeCompare(b.slot)));
 function takeFor(slot,teamIndex){
  const possible=filtered.filter(c=>!used.has(Number(c.numero))&&suitability(c,slot).score>=0);
  if(!possible.length)return null;
  possible.sort((a,b)=>{
   const extras=card=>tactic==='posse'?0:Math.max(-150,tactical.score(card,slot,tactic).score)*0.6;
   const as=evidenceScore(a,slot)+extras(a),bs=evidenceScore(b,slot)+extras(b);
   if(bs!==as)return bs-as;
   // Rotação determinística: evita empilhar sempre o mesmo grupo no primeiro XI.
   const ra=(Number(a.numero)+teamIndex*17)%Math.max(1,filtered.length);
   const rb=(Number(b.numero)+teamIndex*17)%Math.max(1,filtered.length);
   return ra-rb||Number(a.numero)-Number(b.numero);
  });
  const pick=possible[0];used.add(Number(pick.numero));return pick;
 }
 for(let s=0;s<slots.length;s++){
  const slot=slots[s].slot;
  for(let offset=0;offset<count;offset++){
   const t=(offset+s*3)%count;
   const pick=takeFor(slot,t);
   if(!pick){entries[t].warnings.push('Sem jogador disponível para '+slot);continue}
   const fit=suitability(pick,slot);
   entries[t].starters.push({slot,cap:Number(pick.numero),fit:fit.kind,role:desired(slot)});
   if(fit.kind!=='posição original')entries[t].warnings.push('#'+pick.numero+' '+pick.name+' em '+slot+': '+fit.kind+'; confirmar familiaridade no jogo.');
  }
 }
 const benchPool=filtered.filter(c=>!used.has(Number(c.numero)));
 // Reserva balanceada em camadas de 1 carta por time, sem repetir cartas.
 const byRarity=(a,b)=>{
  const aCount=filtered.filter(x=>position(x)===position(a)).length;
  const bCount=filtered.filter(x=>position(x)===position(b)).length;
  return aCount-bCount||Number(a.numero)-Number(b.numero);
 };
 benchPool.sort(byRarity);
 let cursor=0;
 for(let round=0;round<BENCH_SIZE;round++){
  for(let offset=0;offset<count;offset++){
   const t=(offset+round*3)%count;
   const c=benchPool[cursor++];
   if(!c)break;
   used.add(Number(c.numero));entries[t].bench.push({cap:Number(c.numero),role:position(c)});
  }
 }
 // Rodada 2: os jogadores que sobraram na primeira bateria entram agora no banco.
 // Outros assumem a lista de espera; a UNIÃO das duas rodadas cobre todas as cartas.
 let left=filtered.filter(c=>!used.has(Number(c.numero))).map(c=>Number(c.numero));
 if(Number(cycle)===2&&left.length&&entries.length){
  const swaps=left.slice();
  for(let k=0;k<swaps.length;k++){
   const team=entries[k%entries.length];
   const benchIndex=Math.floor(k/entries.length)%team.bench.length;
   if(!team.bench.length)continue;
   const previous=team.bench[benchIndex].cap,coming=swaps[k];
   const selectedCard=byN.get(coming);
   team.bench[benchIndex]={cap:coming,role:position(selectedCard)};
   used.delete(previous);used.add(coming);
  }
  left=filtered.filter(c=>!used.has(Number(c.numero))).map(c=>Number(c.numero));
 }
 for(const team of entries){
  const inTeam=new Set([...team.starters.map(s=>s.cap),...team.bench.map(b=>b.cap)]);
  if(inTeam.size!==team.starters.length+team.bench.length)throw Error('Carta duplicada na equipe');
  const occupied=new Map(team.starters.map(s=>[s.slot,byN.get(s.cap)]));
  const play=slot=>occupied.get(slot),hasStyle=(slots,rx)=>slots.some(slot=>rx.test(styleFor(play(slot)||{})));
  const primary=hasStyle(['vole','vold'],/orquestrador/);
  const attack=hasStyle(['cae','cad'],/artilheiro/);
  const creator=hasStyle(['mat'],/armador criativo/);
  team.linkup={volOrchestrator:primary,caArtilheiro:attack,matCreative:creator,
   documentaryMatch:primary&&attack&&creator,verifiedInGame:false};
  if(!team.linkup.documentaryMatch)team.warnings.push('Link-Up não atende a todos os requisitos documentais: não afirmar que o bônus está ativo.');
  team.ready=team.starters.length===START_SIZE&&team.bench.length===BENCH_SIZE&&
    team.starters.some(s=>s.slot==='go'&&s.fit==='posição original');
  team.positionallyConfirmed=team.starters.length===START_SIZE&&
    team.starters.every(s=>s.fit==='posição original');
  team.requiresPositionReview=team.starters.some(s=>s.fit!=='posição original');
  if(team.requiresPositionReview)team.warnings.push('ADAPTAÇÃO PROVISÓRIA: confirmar posição utilizável no jogo antes de testar esta escalação.');
  if(!team.ready)team.warnings.push('Equipe incompleta: conferir disponibilidade de posição/GO; não reutilizar outras cartas desta rodada.');

 }
 const usedInAll=new Set(entries.flatMap(e=>[...e.starters.map(s=>s.cap),...e.bench.map(b=>b.cap)]));
 if(usedInAll.size!==entries.reduce((sum,t)=>sum+t.starters.length+t.bench.length,0))throw Error('Uma carta aparece em mais de uma equipe da mesma série');
 if(usedInAll.size+left.length!==expectedTotal||left.some(n=>usedInAll.has(n)))throw Error('Cobertura de cartas inconsistente na rodada');
 return {schema:'SCOUT_ROTATION_V219',formation:formation.id,cycle:Number(cycle),tactic,teams:entries,leftovers:left,counts:stat,
  rules:'23 cartas por equipe: 11 titulares e 12 reservas. Sem repetição entre equipes da mesma formação/rodada. Adaptação não prova compatibilidade. Sem Overall.',
  source:'SCOUT_V69_AUDITORIA.json',
  exactBlackMappingConfirmed:false};
}
const api=Object.freeze({ALIASES,NAMES,position,isKeeper,desired,suitability,evidenceScore,excludedSet,analyze,rosterFingerprint,build});
if(typeof module==='object'&&module.exports)module.exports=api;
if(host)host.SCOUT_ROTATION_V219=api;
})(typeof window!=='undefined'?window:null);
