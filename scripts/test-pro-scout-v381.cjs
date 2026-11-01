'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const M=require('../web/craque-pro-scout-v381.js');
assert.equal(M.WORLD_FINALS_2026.mobile.length,16,'16 finalistas Mobile');
assert.equal(M.WORLD_FINALS_2026.console.length,16,'16 finalistas Console');
assert.equal(new Set(M.WORLD_FINALS_2026.mobile).size,16);
assert.equal(new Set(M.WORLD_FINALS_2026.console).size,16);
assert(M.WORLD_FINALS_2026.mobile.includes('Rentao'));
assert(M.WORLD_FINALS_2026.console.includes('FUTEASY_10'));
assert(M.SOURCES.some(x=>x.id==='dm7-blackjhon-2026'&&x.kind==='public_gameplay'));
assert(M.SOURCES.some(x=>x.kind==='official_rules'));
assert(M.SOURCES.every(s=>/^https:\/\//.test(s.url)&&s.proves.includes('não')));
assert.equal(M.PROVEN_BUILDS.length,0,'Fontes do Mundial não são builds exatas.');
assert.deepEqual(M.MODES,['posse','normal','rapido','fora','longo']);
const vector=[8,4,4,4,4,4,0,0,0,0];
const review={identity:{capture:12,cardId:'88036360719839',edition:'ÉPICA',name:'Ruud van Nistelrooij'},
 tactic:'posse',role:'CA',pp:60,sourceKind:'proposal',proposed:vector,
 skills:[{name:'Passe de primeira'},{name:'Chute de primeira'}],
 boosters:[{name:'Chute'}],boosterSlotSupported:false};
const obj=JSON.stringify(review),initial=M.inspect(review);
assert.equal(initial.verifiedBuilds,0);
assert.equal(initial.training.spent,M.totalPP(vector));
assert.equal(initial.training.valid,true);
assert.equal(initial.mayEquip,false);assert.equal(initial.maySpendTokens,false);
assert.equal(initial.mayOverwrite,false);
assert(initial.tacticNote.includes('posse central'));
for(const style of M.MODES){
 const report=M.inspect({...review,tactic:style});
 assert.equal(report.tactic,style);
 assert.equal(report.verifiedBuilds,0);
}
const proof={cardIdFrameVerified:true,progressionFrameVerified:true,
 timecodeSeconds:141,recordedAt:'2026-11-01',auditor:'verificação humana'};
const build={capture:12,cardId:'88036360719839',edition:'ÉPICA',tactic:'posse',pp:60,
 sourceId:'dm7-blackjhon-2026',levels:vector,spentPP:M.totalPP(vector),proof};
assert(M.exactCardProof(build,review),'Apenas prova completa por edição pode vincular build.');
for(const patch of [
 {cardId:'88036360719838'}, {edition:'outra'}, {pp:61}, {tactic:'rapido'},
 {capture:11}, {sourceId:'konami-2026-final'}, {levels:[0,0]}, {spentPP:59},
 {proof:{...proof,cardIdFrameVerified:false}},
 {proof:{...proof,progressionFrameVerified:false}},
 {proof:{...proof,auditor:''}},
 {proof:{...proof,timecodeSeconds:-1}},
 {skills:['Passe de primeira']},
 {booster:'Técnica'},
 {skills:Array(6).fill('Passe de primeira'),proof:{...proof,skillsFrameVerified:true}}
])assert(!M.exactCardProof({...build,...patch},review),'Prova ou identidade inválida foi aceita '+JSON.stringify(patch));
assert.equal(M.sourceForCard(review,[build]).length,1);
assert.equal(M.sourceForCard({...review,identity:{...review.identity,cardId:'99999999'}},[build]).length,0);
assert.equal(JSON.stringify(review),obj,'Radar deve ser somente leitura');
const original=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
assert.equal(original.cards.length,246,'246 cartas originais preservadas');
const bridge=read('web/app-bridge.js'),visual=read('web/craque-positional-ui-v311.js');
assert(bridge.includes("load('craque-pro-scout-v381.js',()=>"),'Motor global deve ser carregado ANTES das fichas.');
assert(bridge.includes("craque-pro-scout-v381.css"),'Tema global integrado.');
assert(visual.includes('CRAQUE_PRO_SCOUT_V381?.panel?.(review'),'Todos os elencos devem receber o painel.');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const file of ['craque-pro-scout-v381.js','craque-pro-scout-v381.css']){
 assert(sw.includes("'./"+file+"'"),'Falta no cache offline: '+file);
 assert(stamp.includes("'"+file+"'"),'Falta na paridade Android/Windows: '+file);
}
const code=read('web/craque-pro-scout-v381.js');
assert(!/localStorage\.setItem|navigator\.sendBeacon|fetch\(/.test(code),'Radar não pode enviar dados nem alterar as fichas.');
assert(!code.includes('Overall como objetivo'));
console.log('V381 PASS: 32 mundialistas, Rentão/Blackjhon separados por prova, cinco estilos, 246 cartas, sem atribuição falsa ou modificação de builds.');
