'use strict';
/* V392 — guia dos dois contra-ataques; integridade das fichas e duas formações. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const tactics=require('../web/craque-tactics-v230.js');
const formations=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json')).formations;
const original=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const pristine=JSON.stringify(original);
assert.equal(formations.length,2);
assert.equal(original.length,246);
assert.deepEqual(formations.map(f=>f.id).sort(),['4213','4312']);
const modes=['normal','rapido'];
let verified=0;
for(const f of formations){
 assert.equal(f.starters.length,11);
 for(const mode of modes){
  const g=tactics.counterGuide(mode,f.id);
  assert(g&&Object.isFrozen(g),'Guia imutável '+mode+'/'+f.id);
  for(const k of ['attack','defence','risk','formationAttack','formationDefence','evidence','source']){
   assert.equal(typeof g[k],'string');
   assert(g[k].length>25, 'Guia completo: '+k);
  }
  assert(g.source.startsWith('https://efhub.com/'));
  assert.equal(g.role,undefined,'Sem vaga, não inferir jogador');
  for(const s of f.starters){
   const card=original.find(c=>Number(c.numero)===Number(s.cap));
   assert(card,'Carta original cadastrada '+s.cap);
   const duty=tactics.counterGuide(mode,f.id,s.slot);
   assert(duty&&duty.role===tactics.slotRole(s.slot),'Papel correto na vaga');
   assert(duty.roleAttack.length>25&&duty.roleDefence.length>25);
   assert.equal(duty.mode,mode);
   assert(!Object.hasOwn(duty,'levels'));
   assert(!Object.hasOwn(duty,'skills'));
   assert(!Object.hasOwn(duty,'booster'));
   assert(Number.isFinite(tactics.score(card,s.slot,mode).score));
   verified++;
  }
 }
}
assert.notEqual(tactics.counterGuide('normal','4312').attack,
 tactics.counterGuide('rapido','4312').attack);
assert.notEqual(tactics.counterGuide('normal','4312').defence,
 tactics.counterGuide('rapido','4312').defence);
for(const mode of ['posse','fora','longo','inexistente'])
 assert.equal(tactics.counterGuide(mode,'4312'),null,'Não alterar estilos fora do escopo');
assert.equal(tactics.counterGuide('normal','inexistente'),null);
assert.equal(tactics.counterGuide('normal','4312','vaga_invalida'),null);
const ui=read('web/craque-formation-ui-v230.js');
assert(ui.includes('counterGuide?.(activeMode,currentId)'),'Guia geral renderizado');
assert(ui.includes('counterGuide?.(activeMode,currentId,slot)'),'Função de cada vaga renderizada');
assert(ui.includes('Abrir ficha na vaga'),'Acesso à ficha individual preservado');
assert(ui.includes("node('details'"),'Guia recolhível e leve');
// V392: ranking completo por vaga sem presunção de elegibilidade ou identidade.
const identity=require('../web/scout-player-identity-v245.js');
let recommended=0;
for(const f of formations){
 for(const mode of modes){
  const squad=tactics.recommendSquad(original,f,mode);
  assert(squad,'Sugestões disponíveis em '+f.id+'/'+mode);
  assert.equal(squad.starters.length,11,'Onze titulares elegíveis');
  assert.equal(squad.bench.length,12,'Doze reservas elegíveis');
  assert.equal(squad.ready,true,'Plano completo');
  const all=[...squad.starters,...squad.bench];
  assert.equal(new Set(all.map(x=>x.cap)).size,23);
  assert(identity.unique(all.map(x=>original.find(c=>c.numero===x.cap))));
  for(const p of all){
   const c=original.find(x=>x.numero===p.cap);
   assert(tactics.fit(c,p.slot).match,'Função de '+p.name+' confirmada');
   assert(p.score>=0&&p.score<=100);
  }
  assert.deepEqual(Object.keys(squad.slots).sort(),
   f.starters.map(x=>x.slot).sort());
  const forbidden=[squad.starters[0].cap,squad.bench[0].cap];
  const filtered=tactics.recommendSquad(original,f,mode,forbidden);
  assert(filtered);
  assert(![...filtered.starters,...filtered.bench].some(x=>forbidden.includes(x.cap)));
  recommended++;
 }
}
assert.equal(tactics.recommendSquad(original,formations[0],'posse'),null);
const lineupUI=read('web/meu-time-duas-formacoes-v177.js');
assert(lineupUI.includes('applySuggested'),'Aplicação com aprovação real disponível');
assert(lineupUI.includes('profiles.validate(active(),slots,byCap)'),'Validar onze titulares');
assert(lineupUI.includes("if(!['normal','rapido'].includes(activeMode))"),'Impedir gravação na Posse');
assert(lineupUI.includes('benchKey(activeId,activeMode)'),'Banco independente da tática');
const tacticalUI=read('web/craque-formation-ui-v230.js');
assert(tacticalUI.includes('tactical.recommendSquad?.('),'Mostrar sugestão completa');
assert(tacticalUI.includes('window.confirm('),'Exigir confirmação antes de aplicar');
assert.equal(JSON.stringify(original),pristine,'Catálogo original intacto');
console.log('V392 PASS: '+verified+' vagas em 2 formações x 2 contra-ataques; '+
 '246 cartas intactas; Posse/Por Fora/Passe Longo sem guia novo.');
