'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const web=path.resolve(__dirname,'../web'),load=f=>JSON.parse(fs.readFileSync(path.join(web,f),'utf8'));
const a=load('SCOUT_V69_AUDITORIA.json'),t=load('SCOUT_V98_AUDITORIA_TATICA.json'),ev=load('SCOUT_V180_NATIVE_SKILLS_EVIDENCE.json');
assert.equal(a.cards.length,246);assert.equal(t.cartas.length,246);
assert.equal(a.summary.native_skills,242);assert.equal(a.cards.filter(x=>x.habilidades_nativas).length,242);
assert.equal(ev.matched_entries.length,21);assert.equal(ev.investigations.length,6);
for(const c of ev.matched_entries){
 assert([226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246].includes(c.cap));assert.equal(c.status,'coincidencia_externa_multifatorial');assert.equal(c.card_id_confirmado_na_conta,false);
 const x=a.cards.find(x=>x.numero===c.cap);assert(x&&String(x.id).startsWith('PENDENTE'));
 assert.equal(x.habilidades_nativas,c.skills.join('; '));
 assert.equal(x.habilidades_nativas_origem?.status,'coincidencia_externa_multifatorial_sem_id_na_conta');
 assert.equal(x.pp,c.pp);assert.equal(x.name,c.name);
 assert.equal(t.cartas.find(x=>x.numero===c.cap)?.habilidades_nativas_documentadas,true);
}
for(const c of ev.investigations.filter(c=>![75,170].includes(c.cap)))assert(!a.cards.find(x=>x.numero===c.cap)?.habilidades_nativas,'Não inventar lista: '+c.cap);
for(const n of [50,75,151,170,181,225])assert(ev.investigations.find(x=>x.cap===n)?.reason,'Pendência justificada: '+n);
assert.equal(a.cards.find(x=>x.numero===225)?.id,'106780940205246','Não trocar ID anterior sem evidência do jogo');
const app=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
assert(app.includes('loadNativeEvidence().finally(()=>loadV180Evidence().finally(startRecommendations))'));
assert(app.includes("!String(card.id||'').startsWith('PENDENTE')"),'Não reatribuir skills quando há outro Card ID');
const sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
assert(sw.includes('SCOUT_V180_NATIVE_SKILLS_EVIDENCE.json')&&sw.includes('v179-v180'),'Cache Android deve renovar');
console.log('V183 OK: 242/246 listas documentadas; 4 identidades pendentes; sem substituir IDs, PP e boosters.');
