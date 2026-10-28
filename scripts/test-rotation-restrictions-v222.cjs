'use strict';
/* SCOUT PRO V222 — exclusão visual dos jogadores do Black e integridade 4-3-1-2/4-2-1-3.
 * Nenhuma identidade é inventada; os IDs 1..23 abaixo são FIXTURES de teste, não seleção do usuário.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const plan=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json'));
const images=JSON.parse(read('web/SCOUT_V98_AUDITORIA_TATICA.json')).cartas;
const engine=require('../web/scout-rotation-engine-v219.js');
const R=require('../web/scout-roster-restrictions-v222.js');
assert.equal(cards.length,246);
assert.equal(images.length,246);
assert.deepEqual(plan.formations.map(f=>f.id),['4312','4213'],'Manter as duas táticas previamente aprovadas');
assert(plan.formations.every(f=>f.starters.length===11&&f.bench.length===12),'Preservar as duas formações existentes com seus 12 reservas cadastrados');
assert(R.SCHEMA.includes('V224'));
assert.equal(R.LIMIT,23);
assert.equal(R.catalog(cards).size,246);
assert.equal(R.filter(cards,'Massaro','',48).total,1);
assert.equal(R.filter(cards,'#001','',48).items[0].numero,1);
assert.equal(R.filter(cards,'001','',48).items[0].numero,1);
assert.equal(R.filter(cards,'Huijsen','',48).total,2,'Busca mostra edições/entradas distintas');
assert.equal(R.filter(cards,'Raúl','',48).items[0].numero,2);
assert.equal(R.filter(cards,'','',48).visible,48);
assert.throws(()=>R.filter(cards,'','',300),/Limite/);
assert.deepEqual(R.validateCaps([1,2,2,3],cards),[1,2,3]);
assert.deepEqual(R.validateCaps(['001','002'],cards),[1,2]);
assert.throws(()=>R.validateCaps([0],cards),/inexistente/i);
assert.throws(()=>R.validateCaps([247],cards),/inexistente/i);
assert.throws(()=>R.validateCaps(['bad'],cards),/inválido/i);
assert.throws(()=>R.validateCaps(Array.from({length:24},(_,i)=>i+1),cards),/23 jogadores/i);
assert.throws(()=>R.validateCaps(null,cards),/lista/i);
const excluded=Array.from({length:23},(_,i)=>i+1),blocked=new Set(excluded);
const record=R.makeRecord(excluded,cards,false);
assert.equal(record.excluded.length,23);
assert.equal(record.userReviewed,false,'Exatamente 23 entradas NÃO significa que o Black foi verificado');
assert.equal(record.externalPhotoVerified,false,'Nunca simular validação da foto');
assert.deepEqual(R.readRecord(record,cards).excluded,record.excluded);
const legacy={...record,schema:R.LEGACY_SCHEMA,limit:22,excluded:record.excluded.slice(0,22),excludedCount:22,userReviewed:true};
const migrated=R.readRecord(legacy,cards);
assert.equal(migrated.excluded.length,22,'Preserva todos os bloqueios locais existentes antes da V224');
assert.equal(migrated.userReviewed,false,'22 cartas anteriormente conferidas não validam 23');
const reviewed=R.makeRecord(excluded,cards,true);
assert.equal(reviewed.userReviewed,true,'Marcação significa somente conferência pessoal');
assert.equal(reviewed.externalPhotoVerified,false,'Mesmo com marcação pessoal, foto externa não conferida');
const half=R.makeRecord(excluded.slice(0,10),cards,true);
assert.equal(half.userReviewed,false,'Seleção incompleta não recebe conferência pessoal');
const tampered=structuredClone(record);
tampered.excluded[0].card_id='id-inventado';
assert.throws(()=>R.readRecord(tampered,cards),/divergente/i,'Importação protege a versão exata');
const tamperedName=structuredClone(record);tamperedName.excluded[0].nome='jogador inventado';
assert.throws(()=>R.readRecord(tamperedName,cards),/divergente/i);
const tamperedEdition=structuredClone(record);tamperedEdition.excluded[0].edicao='Outra edição';
assert.throws(()=>R.readRecord(tamperedEdition,cards),/divergente/i,'Importação rejeita edição incorreta');
const tamperedPosition=structuredClone(record);tamperedPosition.excluded[0].posicao='OUTRA';
assert.throws(()=>R.readRecord(tamperedPosition,cards),/divergente/i,'Importação rejeita posição de outra versão');
const badProof=structuredClone(record);badProof.externalPhotoVerified=true;
assert.throws(()=>R.readRecord(badProof,cards),/não realizada/i);
const dupe=structuredClone(record);dupe.excluded[1]=structuredClone(dupe.excluded[0]);
assert.throws(()=>R.readRecord(dupe,cards),/repetid/i);
const tooMany=structuredClone(record);tooMany.excluded.push(record.excluded[0]);
assert.throws(()=>R.readRecord(tooMany,cards),/23 exclusões/i);
assert.throws(()=>R.readRecord({schema:'outra',excluded:[]},cards),/não é do Scout PRO/i);
assert.equal(R.available(cards,excluded).length,223);
assert(R.available(cards,excluded).every(c=>!blocked.has(c.numero)));
assert.equal(engine.analyze(cards,excluded).excluded,23);
assert.equal(engine.analyze(cards,excluded).available,223);
for(const formation of plan.formations){
 const expectedLeft=formation.id==='4213'?21:16; // V374: preserve five unfilled SA positions.
 const allCycles=[];
 for(const cycle of [1,2]){
  const result=engine.build(cards,formation,excluded,cycle);
  assert.equal(result.exactBlackMappingConfirmed,false,'Sem fotos não homologar lista real');
  assert.equal(result.teams.length,9,'O cenário de 23 restrições sem GO gera 9 elencos');
  assert.equal(result.leftovers.length,expectedLeft,'Unassigned cards include the SA vacancies, never forced adaptations');
  const numbers=[];
  for(const team of result.teams){
   const missing=formation.starters.filter(s=>!team.starters.some(x=>x.slot===s.slot)).map(x=>x.slot);
   assert.deepEqual(missing,team.starters.length===11?[]:['sa']);
   assert(team.starters.every(s=>s.fit==='posição original'),'Only documented positions may be auto-selected');
   assert.equal(team.bench.length,12,'Cada time precisa 12 reservas');
   assert(team.starters.some(s=>s.slot==='go'&&s.fit==='posição original'),'Goleiro original para cada XI');
   assert.equal(team.linkup.verifiedInGame,false,'Bônus nunca tratado como ativado');
   for(const c of [...team.starters,...team.bench]){
    assert(!blocked.has(c.cap),'Nenhum jogador restringido no '+formation.id+' rod. '+cycle+': '+c.cap);
    numbers.push(c.cap);
   }
  }
  assert.equal(numbers.length,223-expectedLeft);
  assert.equal(new Set(numbers).size,numbers.length,'Sem repetição entre as 9 equipes de mesma formação e rodada');
  for(const cap of result.leftovers)assert(!numbers.includes(cap),'Sobrantes não entram nos times desta rodada');
  allCycles.push(numbers);
 }
 assert.equal(new Set([...allCycles[0],...allCycles[1]]).size,223,'As duas rodadas incluem TODAS as cartas não restritas');
}
const protectGoalies=cards.filter(engine.isKeeper).slice(0,3).map(c=>c.numero);
assert(protectGoalies.length===3);
const mixed=excluded.filter(x=>!protectGoalies.includes(x)).slice(0,20).concat(protectGoalies);
const summary=engine.analyze(cards,mixed);
assert.equal(summary.excluded,23);
assert(summary.maxTeams<=summary.keepers,'Quantidade adaptada aos GO elegíveis');
for(const formation of plan.formations){
 const r=engine.build(cards,formation,mixed,1);
 const numbers=r.teams.flatMap(t=>[...t.starters.map(s=>s.cap),...t.bench.map(b=>b.cap)]);
 assert.equal(new Set(numbers).size,numbers.length);
 assert(numbers.every(n=>!mixed.includes(n)));
}
const first=engine.build(cards,plan.formations[0],excluded,1).teams[0];
const sig=engine.rosterFingerprint(first,excluded,cards);
assert(sig.includes('SCOUT_ROSTER_SIGNATURE_V223'));
assert.equal(sig,engine.rosterFingerprint(first,excluded.slice().reverse(),cards),'Ordem dos bloqueios não altera histórico');
const inFirst=new Set([...first.starters,...first.bench].map(x=>x.cap));
const replacement=cards.find(c=>!inFirst.has(c.numero)).numero;
const another=structuredClone(first);another.bench[0].cap=replacement;
assert.notEqual(sig,engine.rosterFingerprint(another,excluded,cards),'Alterar uma reserva muda a identidade do elenco');
const anotherStarter=structuredClone(first);anotherStarter.starters[0].cap=replacement;
assert.notEqual(sig,engine.rosterFingerprint(anotherStarter,excluded,cards),'Alterar um titular muda a identidade do elenco');
assert.notEqual(sig,engine.rosterFingerprint(first,excluded.slice(1),cards),'Alterar restrições muda a identidade do experimento');
const changedCatalog=cards.map(c=>c.numero===first.starters[0].cap?{...c,versao:String(c.versao||'')+' modificada'}:c);
assert.notEqual(sig,engine.rosterFingerprint(first,excluded,changedCatalog),'Edição alterada nunca herda histórico de outra carta');
const changedIds=cards.map(c=>c.numero===first.starters[0].cap?{...c,id:'versão-incorreta'}:c);
assert.notEqual(sig,engine.rosterFingerprint(first,excluded,changedIds),'Card ID alterado nunca herda histórico de outra carta');
assert.throws(()=>engine.rosterFingerprint({}),/inválida/);
assert.throws(()=>engine.rosterFingerprint(first,excluded,[]),/Catálogo completo/);
const ui=read('web/scout-rotation-lab-v219.js');
const html=read('web/meu-time-testes-v219.html');
const css=read('web/scout-rotation-lab-v219.css');
for(const target of ['black-search','black-candidates','black-reserved','black-position','black-reviewed','black-export','black-import','black-save','black-clear']){
 assert(html.includes('id="'+target+'"'),'Controle visual funcional ausente: '+target);
}
assert(html.indexOf('scout-roster-restrictions-v222.js')<html.indexOf('scout-rotation-lab-v219.js'),'Motor de restrições deve carregar antes do laboratório');
assert(ui.includes("restrictions.validateCaps")&&ui.includes("restrictions.makeRecord")&&ui.includes("restrictions.readRecord"));
assert(ui.includes("data-black-cap")&&ui.includes("updateBlack")&&ui.includes('renderPicker'));
assert(ui.includes("rosterSignature")&&ui.includes("rosterLogs"),'Resultados de partidas antigas não podem ser atribuídos a novos elencos após mudar exclusões');
assert(ui.includes("lineupSnapshot:lineupSnapshot(team)"),'Partidas devem gravar composição exata dos 23 jogadores');
assert(ui.includes("engine.rosterFingerprint(team,excluded,cards)"),'Histórico precisa incluir titulares, banco, edição, Card ID e bloqueios');
assert(ui.includes("JSON.stringify(savedReview.caps)===JSON.stringify(excluded)"),'Verificação pessoal atrelada exatamente aos números conferidos');
assert(ui.includes("blackVisualVerified:false"),'Não afirmar foto externa confirmada em relatórios');
assert(css.includes('@media(max-width:420px)'),'Seletor cabe no celular');
for(const file of ['scout-roster-restrictions-v222.js','scout-rotation-lab-v219.js','scout-rotation-lab-v219.css']){
 assert(read('web/sw.js').includes("'./"+file+"'"),'Cache offline precisa conter '+file);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+file+"'"),'Bundle digital precisa conter '+file);
}
assert.equal(cards.find(c=>c.numero===40).name,'Dwight Yorke','Não substituir jogador aprovado pela metodologia');
console.log('V224 PASS: 246 cards, 23 exact-card restrictions, independent cycles, visible SA vacancies, no restricted players or unproven secondary roles selected.');
