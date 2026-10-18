'use strict';
/* V245: o eFootball admite UMA pessoa por equipe, independente da carta/raridade. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const forms=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const identities=require('../web/scout-player-identity-v245.js');
const profiles=require('../web/craque-lineup-profiles-v231.js');
const engine=require('../web/scout-rotation-engine-v219.js');
const tactics=require('../web/craque-tactics-v230.js');
const byCap=new Map(roster.map(c=>[Number(c.numero),c]));
const original=JSON.stringify(roster);
assert.equal(roster.length,246);
assert.equal(forms.length,2);
const dup=identities.duplicates(roster);
assert(dup.length>=25,'As cartas duplicadas devem continuar no catálogo');
const id=n=>identities.key(byCap.get(n));
assert.equal(id(118),id(97),'Sandro Tonali #118 e #097 são a mesma pessoa');
assert.equal(id(118),id(6),'Sandro Tonali #006 também é a mesma pessoa');
for(const n of [47,79,90,186])assert.equal(id(47),id(n),'Neymar Jr: versões iguais');
for(const n of [50,53,57,58])assert.equal(id(50),id(n),'Messi: versões iguais');
assert.notEqual(id(97),id(118+1),'Atleta diferente não pode ser bloqueado por numeração');

const modes=['posse','normal','rapido','fora','longo'];
for(const formation of forms){
 const base=profiles.defaults(formation);
 assert.equal(profiles.validate(formation,base,byCap),true,'Plano original dos 11 titulares válido');
 // Duas versões de Konaté em cartões diferentes no mesmo XI: vetadas.
 const conflict={...base,zge:154,zgd:150};
 assert.equal(profiles.validate(formation,conflict,byCap),false,
  'Mesmo Ibrahima Konaté (#154/#150) não pode ser escalado duas vezes');
 const selection={...base};
 selection[formation.id==='4312'?'mlg':'sa']=96; // Vitinha #096 titular e #217 no banco original.
 assert(profiles.validate(formation,selection,byCap),'Vitinha sozinho deve ser válido');
 const reserves=identities.benchFor(Object.values(selection),formation.bench,roster);
 assert.equal(reserves.length,12);
 assert(identities.unique([...Object.values(selection).map(n=>byCap.get(n)),
  ...reserves.map(x=>byCap.get(x.cap))]),'Não repetir Vitinha titular/reserva');
 assert(!reserves.some(x=>x.cap===217),'A outra versão de Vitinha sai do banco desta equipe');
 assert(reserves.some(x=>x.autoReplacement),'Uma reserva alternativa é escolhida');
 assert.equal(formation.bench.some(x=>x.cap===217),true,'Plano histórico original preservado');

 const storage=new Map();
 const local={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
 for(const mode of modes){
  assert.throws(()=>profiles.save(formation,mode,conflict,local,byCap),
   /11 posições|mesma pessoa|inválida/i,
   'Perfil de '+mode+' não pode persistir duas versões do mesmo jogador');
  assert.equal(profiles.validate(formation,selection,byCap),true);
  profiles.save(formation,mode,selection,local,byCap);
  assert(profiles.hasSaved(formation,mode,local,byCap),'Perfil salvo no modo '+mode);
  assert.deepEqual(profiles.read(formation,mode,local,byCap),selection,'Modo '+mode+' restaurado');
 }
 for(const tactic of modes)for(const cycle of [1,2]){
  const result=engine.build(roster,formation,[],cycle,tactic);
  assert.equal(result.teams.length,10,formation.id+' 10 equipes com 246 cartas');
  const allCards=new Set();
  for(const team of result.teams){
   const members=[...team.starters,...team.bench];
   assert.equal(team.starters.length,11,'11 titulares');
   assert.equal(team.bench.length,12,'12 reservas');
   assert.equal(members.length,23,'23 pessoas');
   const personKeys=members.map(x=>id(x.cap));
   assert.equal(new Set(personKeys).size,23,
    'PESSOA duplicada em '+formation.id+'/'+tactic+'/'+cycle+'/'+team.id);
   assert(!new Set(team.starters.map(x=>id(x.cap))).has(
       'p:nao existe'),'Não inventar jogador');
   for(const row of members){
    assert(!allCards.has(row.cap),'Não repetir carta dentro da rodada');
    allCards.add(row.cap);
   }
  }
  assert.equal(allCards.size,230,'230 cartas distribuídas em 10 elencos, sem apagar nenhuma');
  assert.equal(result.leftovers.length,16,'16 cartas disponíveis em espera sem exclusões');
 }
}
// Alternativas por função também não devem sugerir outras versões do mesmo titular.
for(const n of [6,97,118])assert(!tactics.rank(roster,'vole','posse',[],[118])
 .some(x=>Number(x.card.numero)===n),'Sugestões de VOL não reutilizam Tonali');
const paths=['web/meu-time-duas-formacoes-v177.html','web/meu-time-testes-v219.html'];
for(const p of paths){
 const html=read(p);
 assert(html.includes('scout-player-identity-v245.js'),'Carregamento de identidade offline em '+p);
 assert(html.indexOf('scout-player-identity-v245.js')<
  html.indexOf(p.includes('testes')?'scout-rotation-engine-v219.js':'craque-lineup-profiles-v231.js'));
}
for(const p of ['web/sw.js','scripts/stamp-bundle-v189.cjs'])
 assert(read(p).includes('scout-player-identity-v245.js'),'Pacote offline: '+p);
const editor=read('web/meu-time-duas-formacoes-v177.js');
assert(editor.includes('identity.benchFor('));
assert(editor.includes('identity.key(byCap.get(Number(n)))===identity.key(c)'));
assert.equal(JSON.stringify(roster),original,'Não alterar a base de 246 cartas');
console.log('V245 OK: 2 formações × 5 estilos × 2 rodadas × 10 equipes; 11 titulares + 12 reservas sem pessoas duplicadas. 246 cartas originais intactas.');
