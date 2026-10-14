'use strict';
/* V177: restaurar as DUAS formações escolhidas em documento do usuário. Nada de skills ou Link-Up inventados. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const p=path.resolve(__dirname,'..');
const txt=s=>fs.readFileSync(path.join(p,s),'utf8'),json=s=>JSON.parse(txt(s));
const data=json('web/SCOUT_V177_DUAS_FORMACOES.json');
const catalog=json('web/SCOUT_V69_AUDITORIA.json').cards;
const arts=json('web/SCOUT_V98_AUDITORIA_TATICA.json').cartas;
const old=json('web/SCOUT_V176_POSSE_4312.json');
const by=new Map(catalog.map(c=>[c.numero,c]));
const images=new Map(arts.map(c=>[c.numero,c.imagem]));
const roles={GR:'GO',GO:'GO',DD:'LD',LD:'LD',DE:'LE',LE:'LE',DC:'ZG',ZC:'ZG',ZG:'ZG',MDF:'VOL',VOL:'VOL',MC:'MLG',ME:'MLG',MLG:'MLG',MO:'MAT',MAT:'MAT',AC:'CA',CA:'CA',SA:'SA'};
const slotRoles={go:'GO',le:'LE',zge:'ZG',zgd:'ZG',ld:'LD',vole:'VOL',vold:'VOL',mlg:'MLG',mat:'MAT',sa:'SA',cae:'CA',cad:'CA'};
const base={go:11,le:10,zge:143,zgd:150,ld:127,vole:106,vold:104,mat:78,cae:39,cad:25};
const expected={
 '4312':{...base,mlg:95},
 '4213':{...base,sa:2}
};
assert.equal(catalog.length,246);
assert.equal(arts.length,246);
assert.equal(old.starter_slots.length,11,'Não remover proposta V176');
assert.equal(data.schema,'SCOUT_V177_DUAS_FORMACOES_ESCOLHIDAS');
assert.equal(data.roster_count,246);
assert.equal(data.coach.name,'R. Rodríguez');
assert.equal(data.coach.game_activation_verified,false);
assert.equal(data.coach.bonuses_applied_to_stats,false);
assert.equal(data.formations.length,2);
assert.deepEqual(new Set(data.formations.map(f=>f.id)),new Set(['4312','4213']));
assert.deepEqual(data.link_requirements.map(l=>[l.role_a,l.style_a,l.role_b,l.style_b]),[
 ['VOL','Orquestrador','CA','Artilheiro'],
 ['MAT','Armador criativo','CA','Artilheiro']
]);
for(const form of data.formations){
 assert.equal(form.starters.length,11);
 assert.equal(form.bench.length,12);
 assert.deepEqual(Object.fromEntries(form.starters.map(x=>[x.slot,x.cap])),expected[form.id]);
 assert.deepEqual(new Set(form.rows.flat()),new Set(Object.keys(expected[form.id])));
 assert.equal(new Set([...form.starters.map(x=>x.cap),...form.bench.map(x=>x.cap)]).size,23);
 for(const s of form.starters){
  const c=by.get(s.cap);
  assert(c,'Missing original card '+s.cap);
  assert.equal(s.name,c.name);
  assert.equal(s.card_id,c.id);
  assert.equal(s.original_pos,c.posicao);
  assert.equal(s.atk,c.estilo_ataque);
  assert.equal(s.def,c.estilo_defesa);
  assert.equal(s.pp,c.pp);
  assert.equal(s.art,images.get(s.cap));
  assert.equal(s.card_page,c.arquivo);
  assert(s.role_instruction.length>15);
 }
 for(const c of form.bench){
  assert.equal(c.name,by.get(c.cap)?.name);
  assert.equal(c.art,images.get(c.cap));
  assert.equal(c.card_page,by.get(c.cap)?.arquivo);
 }
 const has=(role,style)=>form.starters.some(x=>x.role===role&&x.atk===style);
 for(const rule of data.link_requirements)
  assert(has(rule.role_a,rule.style_a)&&has(rule.role_b,rule.style_b),'Falhou Link-Up documental na formação '+form.id);
 assert(form.starters.find(x=>x.slot==='le').cap===10);
 assert.equal(roles[by.get(10).posicao],'LD','Maladaption: alert Maldini LE');
}
const h=txt('web/meu-time-duas-formacoes-v177.html');
const js=txt('web/meu-time-duas-formacoes-v177.js');
const nav=txt('web/index.html'),sw=txt('web/sw.js'),oldHtml=txt('web/meu-time-posse-4312.html');
for(const section of ['id="formation-pick"','data-formation="4312"','data-formation="4213"','id="linkup"','id="pitch"','id="bench"','id="picker"'])
 assert(h.includes(section),'Falta seção '+section);
assert(h.includes('meta name="viewport"'));
assert(h.includes('meu-time-duas-formacoes-v177.js'));
assert(js.includes('SCOUT_V177_DUAS_FORMACOES.json'));
assert(js.includes("storedKey(activeId)"));
assert(js.includes("localStorage.setItem(storedKey(activeId)"));
assert(js.includes("new Set(Object.values(next)).size===11"));
assert(js.includes('Requisitos encontrados'));
assert(js.includes('confirmada dentro do jogo')||js.includes('confirmada dentro do jogo')||js.includes('confirmada dentro do jogo')||js.includes('confirmada dentro do jogo')||js.includes('ativação real'));
assert(js.includes('A carta #'));
assert(nav.includes('href="meu-time-duas-formacoes-v177.html"'));
assert(oldHtml.includes('href="meu-time-duas-formacoes-v177.html"'));
for(const f of ['meu-time-duas-formacoes-v177.html','meu-time-duas-formacoes-v177.js','SCOUT_V177_DUAS_FORMACOES.json'])
 assert(sw.includes("'./"+f+"'"),'Offline cache falta '+f);
assert(sw.includes("scout-pro-v177-1"));
console.log('V177 OK: ambas as formações, Link-Up documental, 11+12 por formação, Maldini LE com ressalva, 246 cartas, PP e imagens preservados.');
