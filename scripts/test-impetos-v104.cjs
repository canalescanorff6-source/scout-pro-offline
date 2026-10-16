'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const engine=require('../web/booster-engine-v103.js');
const audit=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V69_AUDITORIA.json'),'utf8'));
const visual=JSON.parse(fs.readFileSync(path.join(root,'web/SCOUT_V98_AUDITORIA_TATICA.json'),'utf8'));
const expected=[
 "Agility",
 "Technique",
 "Passing",
 "Ball Protection",
 "Ball-carrying",
 "Striker's Instinct",
 "Off the Ball",
 "Offence Creator",
 "Shooting",
 "Aerial",
 "Physicality",
 "Accuracy",
 "Regista",
 "Rebuilding",
 "Shutdown",
 "Defending",
 "Duelling",
 "Stealing",
 "Saving",
 "Goalkeeping",
 "Balancer",
 "Breakthrough",
 "Strength",
 "Fantasista",
 "Hard Worker",
 "Counter",
 "Crossing",
 "Free-kick Taking"
];
assert.deepEqual([...engine.CRAFTABLE],expected,'A lista de 28 ímpetos selecionáveis da v5.2.0 deve ser fiel à Konami');
assert.equal(new Set(engine.CRAFTABLE).size,28);
const r=engine.audit(audit.cards);
assert.equal(r.version,'V104');
assert.equal(r.cards.length,246);
assert.deepEqual(r.summary,{total:246,selecionavel:95,possivel:3,nome_registrado:4,indefinido:144});
assert.equal(visual.cartas.length,246);
const byNumber=new Map(visual.cartas.map(c=>[c.numero,c]));
const numbers=new Set(),ids=new Set();
for(const c of r.cards){
 assert(!numbers.has(c.numero),'Carta duplicada');numbers.add(c.numero);
 assert.equal(c.card_id,byNumber.get(c.numero).card_id,'Card ID não pode mudar');
 assert.equal(c.ficha,byNumber.get(c.numero).ficha,'Ficha original precisa continuar vinculada');
 assert(byNumber.get(c.numero).imagem.startsWith('cartas/CAP_'),'Arte original obrigatória');
 assert.equal(typeof c.impeto_fixo,'string');
 assert.equal(typeof c.impeto_extra,'string');
 for(const tactic of engine.tactics){
  const rec=c.recomendacoes[tactic];
  assert(rec.length>=1&&rec.length<=(['GR','GO'].includes(c.posicao)?2:3),'Não incluir ímpeto nativo ou já registrado');
  for(const choice of rec){
   assert(engine.CRAFTABLE.includes(choice.nome),'Ímpeto exclusivo não pode ser oferecido como token: '+choice.nome);
   assert.equal(choice.atributos.length,4);
   assert(Number.isFinite(choice.score));
   if(['GR','GO'].includes(c.posicao))assert(['Saving','Goalkeeping'].includes(choice.nome));
   else assert(!['Saving','Goalkeeping'].includes(choice.nome));
  }
 }
}
assert.equal(numbers.size,246);
assert.equal(r.cards.find(x=>x.numero===1).status_slot_fonte,'selecionavel');
assert.equal(r.cards.find(x=>x.numero===11).status_slot_fonte,'nome_registrado');
assert.equal(r.cards.find(x=>x.numero===236).status_slot_fonte,'selecionavel');
const ui=fs.readFileSync(path.join(root,'web/revisao-impetos-v103.js'),'utf8');
const html=fs.readFileSync(path.join(root,'web/revisao-impetos-v103.html'),'utf8');
for(const field of ['slot-saved','comparison','planned','choose-posse','verification-metrics']){
 assert(html.includes('id="'+field+'"'),'Campo ausente '+field);
 assert(ui.includes("'"+field+"'"),'Campo não conectado '+field);
}
assert(ui.includes("'scoutpro:v103:booster:'"),'Chaves pessoais devem permanecer compatíveis com backup');
assert(ui.includes('card_id:c.card_id'),'Vincular dados pessoais ao Card ID');
assert(html.includes('www.konami.com/efootball/'),'Fonte oficial ausente');
const app=fs.readFileSync(path.join(root,'web/app-bridge.js'),'utf8');
assert(app.includes('revisao-impetos-v103.html?c='),'Ficha sem atalho');
assert(app.includes('scout-card-booster-shortcut'));
console.log('V104 OK: 246 artes/fichas preservadas, 28 ímpetos craftáveis, três táticas e slots verificados sem assumir vazio.');
