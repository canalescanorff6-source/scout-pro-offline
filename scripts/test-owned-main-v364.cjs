'use strict';
/* V364: prova das 15 fichas principais sem substituir qualquer original. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const read=name=>fs.readFileSync(path.join(web,name),'utf8');
const index=read('index.html'),orig=JSON.parse(read('SCOUT_V69_AUDITORIA.json'));
const c=JSON.parse(read('ct364-owned-cards.json'));
const js=read('ct364-owned-main.js'),css=read('ct364-owned-main.css');
const sw=read('sw.js'),fingerprint=fs.readFileSync(path.join(root,'scripts/stamp-bundle-v189.cjs'),'utf8');
assert.equal(c.schema,'craque-owned-cards-v364');
assert.equal(c.destination,'minhas-cartas-principais');
assert.equal(c.originalsPreserved,246);
assert.equal(c.additions,15);
assert.equal(c.cards.length,15);
assert.equal(fs.readdirSync(path.join(web,'fichas')).filter(p=>/^\d{3}_.+\.html$/.test(p)).length,246);
assert.equal((index.match(/class="player-card"/g)||[]).length,246,'246 miniaturas HTML originais devem continuar intactas');
assert.equal(orig.cards.length,246,'audit oficial inalterada');
assert.equal(new Set(c.cards.map(v=>v.key)).size,15);
assert.equal(new Set(c.cards.map(v=>v.image)).size,15);
const names=c.cards.map(x=>x.name);
assert.ok(names.includes('Serhou Guirassy')&&index.includes('data-cap="181" data-name="Serhou Guirassy"'),'duas versões coexistem');
for(const card of c.cards){
 assert.equal(card.maxLevel,null,card.name+' inventou nível máximo');
 assert.equal(card.pp,null,card.name+' inventou PP');
 assert.equal(card.cardId,null,card.name+' inventou Card ID');
 assert.ok(card.position&&card.style,card.name+' sem função');
 assert.ok(card.observed.shownLevel>=1,card.name+' sem nível exibido do eFHub');
 assert.equal(card.observed.attributes.length,21,card.name+' sem atributos documentados');
 assert.ok(card.observed.nativeSkills.length>=3,card.name+' sem habilidades da captura');
 const img=path.join(web,card.image);
 assert.ok(fs.existsSync(img),card.name+' sem imagem original recortada');
 assert.ok(fs.statSync(img).size>15000,card.name+' imagem miniatura inválida');
 assert.ok(sw.includes('./'+card.image),'SW sem foto offline de '+card.name);
 assert.ok(fingerprint.includes("'"+card.image+"'"),'bundle sem SHA da foto de '+card.name);
}
for(const name of ['ct364-owned-main.js','ct364-owned-main.css','ct364-owned-cards.json']){
 assert.ok(index.includes(name)||name.endsWith('.json'),'home não carrega '+name);
 assert.ok(sw.includes('./'+name),'SW sem '+name);
 assert.ok(fingerprint.includes("'"+name+"'"),'fingerprint sem '+name);
}
assert.match(js,/CRAQUE_FRIEND_TRAINING_V228/,'mesmo motor de análise tática');
assert.match(js,/const STYLE_IDS=\['posse','normal','rapido','fora','longo'\]/);
assert.match(js,/scoutpro:v364:owned-confirmed/);
assert.match(js,/scoutpro:v364:owned-equipment/,'skills e ímpetos manuais sem armazenamento isolado');
assert.match(js,/equipmentSave/,'gravação manual por edição ausente');
assert.match(js,/unique.size!==names.length/,'colisão entre skills adicionais não bloqueada');
assert.match(js,/known.has\(normalize\(v\)\)/,'colisão com nativa simulada não bloqueada');
assert.match(js,/ct364-equipped-booster/,'ípetos manuais não possuem campo individual');
assert.ok(index.indexOf('craque-app-shell-v362.css')<index.indexOf('ct364-owned-main.css'),
 'CSS V364 deve carregar DEPOIS de V362 para corrigir cascata visual em 320px');
assert.match(js,/ct364-owned-section/);
assert.match(js,/const compactHint=/,'sinalização compacta via JS não instalada');
assert.match(js,/margin-top','-6px'/,'espaçamento da grade principal em 320px não corrigido');
assert.match(js,/\(max-width:355px\)/,'limite responsivo de 320px não configurado');
assert.match(js,/ct364-owned-grid/);
assert.match(js,/function refreshReview/,'V365 sem auditoria consolidada das 15 cartas');
assert.match(js,/function createReview/,'V365 sem montagem segura da central');
assert.match(js,/ct365-review-summary/,'V365 sem painel de conferência');
assert.match(js,/ct365-review-filter/,'V365 sem filtro de pendências');
assert.match(js,/mode==='missing-level'/,'V365 não preserva níveis pendentes');
assert.match(js,/mode==='missing-id'/,'V365 não identifica Card IDs pendentes');
assert.match(js,/2\*\(conf.level-1\)/,'V365 deve distinguir PP calculados de atributos eFHub');
assert.match(js,/openCard\(c,'confirm'\)/,'V365 não abre a ficha para confirmação');
assert.match(css,/\.ct365-review-row/,'V365 sem estilo da tabela responsiva');
assert.ok(index.includes('261 cartas'),'catálogo não informa o acervo total');

assert.match(js,/ct364-card-navigator/,'navegacao 15 cartas ausente');
assert.match(js,/scoutpro:v367:owned-gameplay/,'V367 sem registros persistentes de gameplay');
assert.match(js,/function renderGameplay\(/,'V367 sem aba para anotação de partidas');
assert.match(js,/function renderGameplayComparison\(/,'V367 sem confronto de evidências');
assert.match(js,/gameplayKey=\(c,role,tactic\)/,'prova não isolada por edição e função');
assert.match(js,/cardIdAtCapture:id/,'prova não associada à identidade cadastrada na data');
assert.match(js,/function gameplayStale/,'alteração de Card ID não invalidou a prova');
assert.match(js,/function gameplayBuildSnapshot/,'V367 não vincula partidas à build documentada');
assert.match(js,/buildSnapshot:gameplayBuildSnapshot\(c\)/,'build observada não foi salva com as partidas');
assert.match(js,/record.buildSnapshot!==gameplayBuildSnapshot\(c\)/,'build alterada não sinaliza prova desatualizada');
assert.match(js,/ownerConfirmed:true/,'prova não distingue declaração do proprietário');
assert.match(js,/validVideoLink\(value.url\)/,'vídeo importado não é revalidado');
assert.match(js,/notifyBackup\(\)/,'backup não notificado após nova prova');
assert.match(js,/PENDENTE DE AVALIAÇÃO/,'comparador promove carta sem prova');
assert.match(css,/\.ct367-compare-rows/,'V367 sem visual responsivo da comparação');

assert.match(js,/function renderAdvisory/,'V366 sem parecer competitivo por carta');
assert.match(js,/CRAQUE_FRIEND_TRAINING_V228\.evaluate\(cardAsEngine\(c,role\),tactic\)/,'V366 sem motor oficial');
assert.match(js,/result.freeSkillSlots===null/,'V366 deve impedir presunção de cinco vagas');
assert.match(js,/Gastar tokens','NÃO AUTORIZADO/,'V366 sem trava informativa de tokens');
assert.match(js,/activeRole!==role/,'V366 permite vazamento assíncrono ao trocar posição');
assert.match(css,/\.ct366-advisory/,'V366 sem estilos para painel consultivo');
assert.match(css,/\.ct366-rank/,'V366 sem hierarquia de recomendações');
assert.match(js,/function switchOwnedCard/,'isolamento entre fichas ausente');
assert.match(js,/function navigateOwned/,'anterior/proxima ausentes');
assert.match(js,/ct364-jump/,'ir ao numero especifico ausente');
assert.match(css,/ct364-player-card/);
assert.match(css,/ct364-card-nav/,'navegador responsivo ausente');
assert.match(css,/V364[.]2/,'correcao da primeira dobra ausente');
assert.doesNotMatch(js,/localStorage\.removeItem\(/,'não apagar dados e backup');
assert.doesNotMatch(js,/localStorage\.setItem\(['"]SCOUT_V69_AUDITORIA/,'não regravar catálogo original');
assert.match(js,/fetch\('SCOUT_V69_AUDITORIA\.json'/,'ler coleção original com fonte canônica');
assert.match(js,/data\.cards\.length!==246/,'não aceitar catálogo incompleto');
assert.match(js,/originalGameplayKey\(cap,role,tactic\)/,'registro original não isola edição/posição/tática');
assert.match(js,/scoutpro:v368:original-gameplay/,'evidência original não isolada');
assert.match(js,/function originalGameplayStale/,'detectar referência original alterada');
assert.match(js,/function renderOriginalEvidence/,'ausente formulário original separado');
assert.match(js,/function renderOriginal=|const renderOriginal=/,'ausente comparação com original');
assert.match(js,/PENDENTE DE AVALIAÇÃO/,'comparador deve recusar meta automático');
assert.match(css,/\.ct368-original-form/,'V368 sem estilos mobile');
assert.match(js,/function revisionHistory/,'V369 deve preservar revisões anteriores');
assert.match(js,/history:revisionHistory\(previous\)/,'V369 sem histórico no mesmo registro atômico');
assert.match(js,/function revisionSummary/,'V369 sem variação de build por nível habilidades e ímpeto');
assert.match(js,/function renderRevisionHistory/,'V369 sem histórico visível');
assert.match(js,/function renderTestQueue/,'V369 sem fila de novos testes');
assert.match(js,/function refreshTestQueue/,'V369 sem atualização após novo registro');
assert.match(js,/scoutpro:v367:owned-gameplay/,'V369 perdeu armazenamento V367');
assert.match(js,/scoutpro:v368:original-gameplay/,'V369 perdeu armazenamento V368');
assert.match(js,/i\.stale\?0:i\.identityMissing\?1:/,'V369 deve priorizar reconferência documental');
assert.match(js,/Nenhuma versão recebe nota meta automática/,'V369 não deve criar classificação meta');
assert.match(css,/\.ct369-history/,'V369 sem estilo de histórico');
assert.match(css,/\.ct369-test-queue/,'V369 sem fila responsiva');

// V370: executar a lógica pura do diff com snapshots antigos/novos, sem DOM.
assert.match(js,/function renderRevisionDiff/,'V370 sem interface de comparação histórica');
assert.match(js,/function revisionDiff/,'V370 sem comparação documental');
assert.match(js,/function revisionFieldKnown/,'V370 deve separar valor desconhecido de zero');
assert.match(css,/\.ct370-diff-row/,'V370 sem diferenciação visual mobile');
assert.match(css,/\.ct370-controls/,'V370 sem seleção de revisões');
const vm=require('node:vm');
const startDiff=js.indexOf('function revisionSnapshot(');
const endDiff=js.indexOf('function renderRevisionDiff(',startDiff);
assert.ok(startDiff>0&&endDiff>startDiff,'extrator isolado V370 falhou');
const testSandbox={};
vm.runInNewContext(js.slice(startDiff,endDiff)+';this.compare=revisionDiff;',testSandbox);
const oldBuild={buildSnapshot:JSON.stringify({cardId:'',maxLevel:35,skills:['Passe curto','','','',''],
 booster:'',boosterSlot:'pendente'})};
const nextBuild={buildSnapshot:JSON.stringify({cardId:'',maxLevel:36,skills:['Passe curto','','Interceptação','',''],
 booster:'Condução Firme',boosterSlot:'ocupado'})};
const delta=testSandbox.compare(oldBuild,nextBuild);
assert.deepEqual(Array.from(delta.changes,x=>x.label).sort(),
 ['Nível máximo informado'],
 'V370 mudanças documentadas reais não detectadas');
assert.ok(delta.pending.some(x=>x.label==='Estado do segundo slot'),
 'V370 estado do slot antes pendente não pode ser tratado como ausência comprovada');
assert.ok(delta.pending.some(x=>x.label==='Habilidade adicional · vaga 3'),
 'V370 deve preservar índice de skill e marcar lacuna anterior');
assert.ok(delta.pending.some(x=>x.label==='Ímpeto adicional anotado'),
 'V370 booster antigo ausente não autoriza afirmar que estava vazio');
assert.ok(!delta.changes.some(x=>x.label==='Card ID'),
 'V370 não inventar alteração de Card ID desconhecido');
const noChange=testSandbox.compare(oldBuild,{...oldBuild,notes:'Outra observação'});
assert.equal(noChange.changes.length,0);
assert.equal(noChange.pending.length,0);
const oldOriginal={snapshot:JSON.stringify({id:'105123',versao:'Highlight',pp:60,levels:[3,4,5]})};
const newerOriginal={snapshot:JSON.stringify({id:'105123',versao:'Highlight',pp:62,levels:[3,5,5]})};
const originalDiff=testSandbox.compare(oldOriginal,newerOriginal);
assert.deepEqual(Array.from(originalDiff.changes,x=>x.label).sort(),
 ['PP do catálogo','Treino catalogado'].sort(),
 'V370 detectar treino/PP originais sem editar os dados fonte');
const corrupt=testSandbox.compare({snapshot:'INVALID_JSON'},newerOriginal);
assert.ok(corrupt.unreadable&&corrupt.pending.length>0,
 'V370 não deve mascarar snapshot inválido');
// V371: checklist funcional por mudanças documentais, função e tática.
assert.match(js,/function buildRetestPlan/,'V371 sem gatilhos verificáveis por diff');
assert.match(js,/function renderRetestPlan/,'V371 sem apresentação consultiva');
assert.match(js,/data-retest-plan|dataset.retestPlan/,'V371 sem painel isolado do histórico');
assert.match(css,/\.ct371-retest-item/,'V371 sem checklist responsivo');
assert.match(js,/não homologados nem salvos como gameplay/,'V371 confundiu checklist com evidência');
const planFromVm={};
const startPlan=js.indexOf('function buildRetestPlan('),endPlan=js.indexOf('function renderRevisionDiff(',startPlan);
assert.ok(startPlan>0&&endPlan>startPlan,'bloco testável V371 indisponível');
vm.runInNewContext(js.slice(startPlan,endPlan)+';this.plan=buildRetestPlan;',planFromVm);
const plan=planFromVm.plan;
const specificDiff={changes:[{label:'Habilidade adicional · vaga 2',before:'Passe curto',after:'Interceptação'}],pending:[],unreadable:false};
const posse=plan(specificDiff,'MAT','posse');
assert.equal(posse.state,'retest');
assert.ok(posse.checks.some(x=>x.key==='skills'&&x.label.includes('vaga 2')));
assert.ok(posse.checks.some(x=>x.key==='role'&&x.label.includes('triangulações')));
assert.ok(posse.checks.some(x=>x.key==='tactic'&&x.label.includes('Posse de Bola')));
assert.ok(posse.checks.some(x=>x.key==='sampling'&&x.label.includes('3–5 partidas')));
const volante=plan(specificDiff,'VOL','rapido');
assert.ok(volante.checks.some(x=>x.label.includes('interceptações')));
assert.ok(volante.checks.some(x=>x.label.includes('Contra-Ataque Rápido')));
assert.ok(!volante.checks.some(x=>x.label.includes('Na Posse de Bola')),'V371 misturou estilos');
const allPending=plan({changes:[],pending:[{label:'Ímpeto adicional anotado'}],unreadable:false},'CA','posse');
assert.equal(allPending.state,'verify');
assert.ok(!allPending.checks.some(x=>x.key==='sampling'),'pendência não pode obrigar declarar partidas como comprovadas');
const diffIdentity=plan({changes:[{label:'Card ID'}],pending:[],unreadable:false},'CA','posse');
assert.equal(diffIdentity.state,'identity-change');
assert.match(diffIdentity.explanation,/NÃO autoriza comparação causal/);
const noDiff=plan({changes:[],pending:[],unreadable:false},'MAT','posse');
assert.equal(noDiff.state,'unchanged');
assert.equal(noDiff.checks.length,0);
const booster=plan({changes:[{label:'Estado do segundo slot'}],pending:[{label:'Ímpeto adicional anotado'}],unreadable:false},'SA','normal');
assert.ok(booster.checks.some(x=>x.key==='booster'&&x.label.includes('tokens')));
assert.ok(booster.checks.some(x=>x.key==='pending'));
// V372: dados observados de ações individuais não podem virar nota fabricada.
assert.match(js,/function observedData/,'V372 sem sanitização de métricas');
assert.match(js,/function renderObservedForm/,'V372 sem entrada de dados observáveis');
assert.match(js,/function collectObserved/,'V372 sem validação de contagens');
assert.match(js,/function appendObservedSummary/,'V372 sem observações na comparação/histórico');
assert.match(js,/observed:actions.value/,'V372 não salva dados na revisão por carta');
assert.match(css,/\.ct372-observed-inputs/,'V372 formulário não responsivo');
const observedVm={};
let obsStart=js.indexOf('const ACTIONS_372='),obsEnd=js.indexOf('function renderObservedForm(',obsStart);
assert.ok(obsStart>0&&obsEnd>obsStart);
vm.runInNewContext(js.slice(obsStart,obsEnd)+';this.parseObserved=observedData;',observedVm);
const clean=observedVm.parseObserved({observed:{
 shortPass:{total:10,success:8},
 receive:{total:4,success:4},
 support:{total:6,success:9},
 recover:{total:0,success:0},
 injected:{total:100,success:100}
}});
assert.deepEqual(Object.keys(clean),['shortPass','receive'],'V372 deve rejeitar dados sem denominador e êxitos acima de tentativas');
const formStart=js.indexOf('function collectObserved('),formEnd=js.indexOf('function appendObservedSummary(',formStart);
assert.ok(formStart>0&&formEnd>formStart);
const forms={};
vm.runInNewContext(js.slice(obsStart,obsEnd)+js.slice(formStart,formEnd)+';this.collect=collectObserved;',forms);
function mockFields(d){
 return {querySelector(selector){
  const m=selector.match(/data-ct372-(total|success)="([^"]+)"/);
  return m?{value:d[m[2]]?.[m[1]]??''}:null;
 }};
}
assert.equal(forms.collect(mockFields({shortPass:{total:'8',success:'9'}})).error.includes('êxitos devem'),true);
assert.ok(forms.collect(mockFields({shortPass:{total:'8',success:''}})).error);
assert.ok(forms.collect(mockFields({receive:{total:'2.5',success:'2'}})).error);
const validEvidence=forms.collect(mockFields({shortPass:{total:'8',success:'6'},recover:{total:'3',success:'0'}}));
assert.equal(validEvidence.error,undefined);
assert.equal(validEvidence.value.shortPass.success,6);
assert.equal(validEvidence.value.recover.success,0);
assert.equal(Object.keys(validEvidence.value).length,2);
// V372: protocolo exige evidência e bloqueia comparações sem identidade.
const pStart=js.indexOf('function retestEvidenceProtocol(');
const pEnd=js.indexOf('function renderRetestPlan(',pStart);
assert.ok(pStart>0&&pEnd>pStart);
const proto={};vm.runInNewContext(js.slice(pStart,pEnd)+';this.proto=retestEvidenceProtocol;',proto);
assert.equal(proto.proto(posse).scope,'observational');
assert.equal(proto.proto(posse).eligible,true);
assert.ok(proto.proto(posse).fields.includes('Conexão / lag / aquecimento'));
assert.equal(proto.proto(diffIdentity).eligible,false);
assert.equal(proto.proto(allPending).eligible,false);
assert.equal(proto.proto(noDiff).eligible,false);
assert.match(js,/renderEvidenceProtocol\(block,plan\)/);
assert.match(css,/\.ct372-protocol-fields/);
console.log('V364 OK: 246 originais + 15 minhas cartas com fotos, dados reais e lacunas honestas; 5 táticas mesmo motor, Android/Windows offline.');
