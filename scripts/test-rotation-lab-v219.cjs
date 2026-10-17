'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const E=require('../web/scout-rotation-engine-v219.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const plan=JSON.parse(read('web/SCOUT_V177_DUAS_FORMACOES.json'));
const images=JSON.parse(read('web/SCOUT_V98_AUDITORIA_TATICA.json')).cartas;
assert.equal(cards.length,246,'Catálogo original precisa ter exatamente 246 cartas');
assert.equal(images.length,246,'Não faltar artes de nenhuma carta');
assert.deepEqual(plan.formations.map(x=>x.id),['4312','4213'],'Preservar os dois esquemas originais');
assert.equal(E.position({posicao:'AC'}),'CA');
assert.equal(E.position({posicao:'ZC'}),'ZG');
assert.equal(E.position({posicao:'GR'}),'GO');
assert.equal(E.position({posicao:'MDF'}),'VOL');
assert.equal(E.suitability({posicao:'SA'},'sa').kind,'posição original');
assert.equal(E.suitability({posicao:'CA'},'sa').kind,'adaptação não confirmada');
assert.equal(E.suitability({posicao:'CA'},'go').score,-100,'Goleiro nunca inventado');
assert(E.evidenceScore({posicao:'VOL',estilo_ataque:'Orquestrador'},'vole')>
       E.evidenceScore({posicao:'VOL',estilo_ataque:'Primeiro volante'},'vole'),
       'VOL orquestrador tem prioridade documental de função');
const sampleBlocked=cards.filter(c=>!E.isKeeper(c)).slice(0,22).map(c=>c.numero);
assert.equal(sampleBlocked.length,22);
const counts=E.analyze(cards,sampleBlocked);
assert.equal(counts.cards,246);
assert.equal(counts.excluded,22);
assert.equal(counts.available,224);
assert.equal(counts.totalFullByQuantity,10);
assert.equal(counts.maxTeams,10,'Existem goleiros suficientes no teste de exclusões não GO');
assert.equal(counts.remaining,4);
assert.equal(counts.requiresBlackPhoto,true,'Mesmo 22 cartas selecionadas não validam foto do Black');
assert.equal(counts.listComplete,true,'22 entradas aceitas enquanto revisão visual continua pendente');
const noBlack=E.analyze(cards,[]);
assert.equal(noBlack.requiresBlackPhoto,true,'Antes das fotos não afirmar mapeamento concluído');
assert.equal(noBlack.available,246);
assert.equal(noBlack.totalFullByQuantity,11);
assert.throws(()=>E.analyze([{numero:1},{numero:1}],[]),'ID do catálogo duplicado deve ser rejeitado');
assert.deepEqual(E.excludedSet([1,1,800,undefined],cards),new Set([1]));
let outputs=[];
for(const form of plan.formations){
 const result=E.build(cards,form,sampleBlocked),next=E.build(cards,form,sampleBlocked);
 assert.deepEqual(result,next,'Construção estável com mesmas cartas e exclusões');
 assert.equal(result.exactBlackMappingConfirmed,false,'Nunca identificar Black por inferência');
 assert.equal(result.teams.length,10);
 assert.equal(result.leftovers.length,4);
 const all=new Set();
 for(const team of result.teams){
  assert.equal(team.starters.length,11,form.id+' titulares');
  assert.equal(team.bench.length,11,form.id+' reservas');
  assert(team.ready,form.id+' inclui GO nativo');
  assert.equal(team.starters.find(s=>s.slot==='go').fit,'posição original');
  assert.equal(new Set([...team.starters.map(x=>x.cap),...team.bench.map(x=>x.cap)]).size,22);
  assert.equal(team.linkup.verifiedInGame,false,'Nunca afirmar Link-Up ativo');
  for(const row of [...team.starters,...team.bench]){
   assert(!sampleBlocked.includes(row.cap),'Carta do mapeamento proibida');
   assert(!all.has(row.cap),'Nenhuma carta repetida entre equipes da mesma série: '+row.cap);
   all.add(row.cap);
  }
 }
 assert.equal(all.size,220);
 for(const cap of result.leftovers)assert(!all.has(cap),'Sobrantes não usados');
 assert.equal(new Set([...all,...result.leftovers]).size,224,'Todas cartas disponíveis classificadas');
 if(form.id==='4213')assert(result.teams.some(t=>t.warnings.some(w=>w.includes('adaptação'))),
  'A posição SA é escassa e a adaptação deve ficar evidente');
 outputs.push(result);
}
for(const form of plan.formations){
 const one=E.build(cards,form,sampleBlocked,1);
 const two=E.build(cards,form,sampleBlocked,2);
 assert.equal(two.cycle,2,'Segunda rodada explícita');
 assert.equal(two.teams.length,10);
 assert.equal(two.leftovers.length,4,'Cada rodada mantém quatro na espera');
 const idsOne=new Set(one.teams.flatMap(t=>[...t.starters.map(s=>s.cap),...t.bench.map(s=>s.cap)]));
 const idsTwo=new Set(two.teams.flatMap(t=>[...t.starters.map(s=>s.cap),...t.bench.map(s=>s.cap)]));
 assert.equal(idsTwo.size,220,'A segunda rodada não repete jogadores entre times');
 assert.equal(new Set([...idsOne,...idsTwo]).size,224,'TODAS as cartas restantes aparecem nas duas rodadas combinadas');
 for(const leftover of one.leftovers)assert(idsTwo.has(leftover),'Carta de fora da primeira rodada entra na segunda: '+leftover);
 for(const left of two.leftovers)assert(idsOne.has(left),'Carta de fora da segunda foi testada na primeira');
}
assert.equal(outputs[0].teams.length,outputs[1].teams.length,'Ambas as séries independentes com as mesmas cartas restantes');
const js=read('web/scout-rotation-lab-v219.js'),html=read('web/meu-time-testes-v219.html'),css=read('web/scout-rotation-lab-v219.css');
for(const path of ['scout-rotation-engine-v219.js','scout-rotation-lab-v219.js','scout-rotation-lab-v219.css','meu-time-testes-v219.html']){
 assert(read('web/sw.js').includes("'./"+path+"'"),'Arquivo no cache offline: '+path);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+path+"'"),'Arquivos no fingerprint: '+path);
}
assert(read('web/index.html').includes('href="meu-time-testes-v219.html"'));
assert(html.includes('id="black-input"')&&html.includes('id="rec-start"'));
assert(html.includes('data-cycle="2"'),'UI oferece segunda rodada para todas as cartas');
assert(js.includes("scoutpro:v219:black-caps")&&js.includes("scoutpro:v219:match-logs"));
assert(js.includes("navigator.clipboard.writeText")&&js.includes('shareRecording'));
assert(css.includes('@media(max-width:360px)'));
assert(!/\.overall\b|\.ovr\b|\[['\"]overall['\"]\]/i.test(read('web/scout-rotation-engine-v219.js')),'Nunca ordenar por Overall');
const plug=read('native/android/ScoutRecorderPlugin.java'),service=read('native/android/ScoutRecorderService.java'),installer=read('scripts/install-native-updater-v102.cjs');
assert(plug.includes('@CapacitorPlugin(name="ScoutRecorder")'));
for(const term of ['MediaProjectionManager','startActivityForResult','FLAG_GRANT_READ_URI_PERMISSION','Intent.ACTION_SEND','getStatus'])
 assert(plug.includes(term),'Bridge de permissão/compartilhamento '+term);
for(const term of ['MediaRecorder','MediaProjection','VirtualDisplay','START_NOT_STICKY','MAX_MS=15*60*1000','IS_PENDING','startForeground'])
 assert(service.includes(term),'Proteções do serviço '+term);
assert(installer.includes("registerPlugin(ScoutRecorderPlugin.class)"));
assert(installer.includes('FOREGROUND_SERVICE_MEDIA_PROJECTION')&&installer.includes('android:foregroundServiceType="mediaProjection"'));
assert(!service.includes('openai.com')&&!service.includes('chatgpt.com'),'Nenhum upload automático para ChatGPT');
console.log('V219 PASS: 246 cartas; 22 excluídas (teste); 10 elencos de 22 sem repetição em cada formação, 4 sobrantes, GO e adaptações sinalizados; gravador Android com consentimento e envio manual.');
