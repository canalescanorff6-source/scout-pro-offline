'use strict';
const {historicalRoster,historicalCards}=require('./historical-catalog-v377.cjs'); // Conciliação dos dois snapshots corrigidos.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../web');
const read=name=>{const data=JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));return name==='SCOUT_V69_AUDITORIA.json'?historicalRoster(data):data;};
const audit=read('SCOUT_V69_AUDITORIA.json'),tactic=read('SCOUT_V98_AUDITORIA_TATICA.json'),source=read('SCOUT_V179_NATIVE_SKILLS_RESEARCH.json');
assert.equal(audit.cards.length,246);
assert.equal(tactic.cartas.length,246);
assert.equal(source.records.length,94);
const confirmed=source.records.filter(c=>c.status==='card_id_nome_edicao');
assert.equal(confirmed.length,91);
assert.equal(audit.summary.native_skills,243);
assert.equal(audit.cards.filter(c=>c.habilidades_nativas).length,243);
for(const c of confirmed){
 const card=audit.cards.find(x=>x.numero===c.cap);
 assert(card&&String(card.id)===String(c.card_id));
 assert.equal(card.habilidades_nativas,c.skills.join('; '));
 assert.equal(card.habilidades_nativas_origem?.url,c.source_url);
 assert.equal(new Set(c.skills).size,c.skills.length);
 assert(c.skills.length>0&&c.skills.length<=12);
 assert.equal(tactic.cartas.find(x=>x.numero===c.cap).habilidades_nativas_documentadas,true);
}
for(const c of source.records.filter(r=>r.status!=='card_id_nome_edicao'&&r.cap!==225)){
 assert(!audit.cards.find(x=>x.numero===c.cap).habilidades_nativas,'Não promover conflito '+c.cap);
}
const rodri=audit.cards.find(x=>x.numero===225);
assert.equal(rodri.id,'105779675902175');
assert.equal(rodri.habilidades_nativas.split(';').length,10);
assert.equal(rodri.habilidades_nativas_origem.confirmacao_no_jogo,false);
assert.equal(source.records.find(x=>x.cap===225).resolucao_v185.skills_nico_must_never_promote,true);
for(const n of [75,170])assert(audit.cards.find(x=>x.numero===n).habilidades_nativas_origem?.confirmacao_no_jogo===false,'Skill externa nao homologada na conta: '+n);
for(const n of [151,181])assert(!audit.cards.find(x=>x.numero===n).habilidades_nativas,'Não importar habilidades Show Time para Distinguido: '+n);
const app=fs.readFileSync(path.join(root,'app-bridge.js'),'utf8');
assert(app.includes('loadNativeEvidence().finally(()=>loadV180Evidence().finally(startRecommendations))'));
assert(app.includes("item.status!=='card_id_nome_edicao'"),'V179 deve barrar cartas sem coincidência exata');
assert(app.includes("item.status!=='card_id_nome_edicao'"));
assert(app.includes("String(item.card_id)!==String(current.id)"));
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
assert(sw.includes('SCOUT_V179_NATIVE_SKILLS_RESEARCH.json'));
assert(sw.includes('scout-pro-v177-1-v178-skills-v179'));
console.log('V183 OK: 91 listas externas por ID/edicao, 243/246 documentadas, 3 pendentes; nenhum dado inventado.');
