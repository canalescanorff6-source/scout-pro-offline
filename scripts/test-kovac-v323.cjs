'use strict';
/* V323 — edição Niko Kovač 22/10/2026: nova fonte sem alterar 70 originais. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const API=require('../web/craque-managers-v302.js');
const hub=require('../web/craque-manager-hub-v307.js');
const packed=read('web/craque-manager-catalog-v302.gz.b64').trim();
const raw=zlib.gunzipSync(Buffer.from(packed,'base64'));
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),'8e80354cbf77c10a454a6a4cc61d76d9945f0a046d61e1b889334e6e0838a34e',
 'Catálogo histórico precisa manter hash original');
const legacy=JSON.parse(raw.toString('utf8'));
assert.equal(legacy.tecnicos.length,70);
const combined=API.withKovacEdition(legacy);
assert.equal(legacy.tecnicos.length,70,'Importação V323 não pode mutar o catálogo original');
assert.equal(combined.tecnicos.length,71);
const newEdition=combined.tecnicos.find(x=>x.catalog_id==='CT-MGR-071');
const old=combined.tecnicos.filter(x=>x.catalog_id!=='CT-MGR-071');
assert.deepEqual(old,legacy.tecnicos,'As 70 versões devem permanecer byte semanticamente idênticas');
assert.equal(new Set(combined.tecnicos.map(x=>x.catalog_id)).size,71,'Nunca duplicar edições');
assert.equal(newEdition.nome,'Niko Kovač');
assert.equal(newEdition.versao_lancamento,'2026-10-22');
assert.equal(newEdition.afinidade_PTBR,'Jogadores veteranos');
assert.equal(API.proficiency(newEdition,'posse'),90);
assert.equal(API.proficiency(newEdition,'fora'),89);
assert.equal(API.proficiency(newEdition,'normal'),59);
assert.equal(API.proficiency(newEdition,'rapido'),67);
assert.equal(API.proficiency(newEdition,'longo'),53);
assert.equal(API.proficiency(newEdition,'overload'),57);
assert.equal(API.model(newEdition,'overload').canCalculate,false);
assert.equal(API.preferred(newEdition,null),'posse');
assert.deepEqual(newEdition.boosters_PTBR,['Controle de bola +1','Dedicação defensiva +1']);
assert.deepEqual(newEdition.link_ups_EN,['Aggressive Centring B','Shadow Link B']);
const wide=newEdition.ativacao_das_combinacoes[0],shadow=newEdition.ativacao_das_combinacoes[1];
assert.deepEqual([wide.centrepiece_position_EN,wide.keyman_position_EN],['LB/RB','CF']);
assert.deepEqual([shadow.centrepiece_position_EN,shadow.keyman_position_EN],['SS','CF']);
assert.equal(shadow.centrepiece_playstyle_EN,'Deep-lying Forward');
assert.equal(shadow.keyman_playstyle_EN,'Fox in the Box');
assert.equal(hub.pick(combined.tecnicos,{scope:'featured'}).length,23,
 'Novo técnico deve aparecer junto aos 22 destaques sem alterar a seleção histórica');
assert.equal(hub.pick(legacy.tecnicos,{scope:'featured'}).length,22);
assert(hub.pick(combined.tecnicos,{scope:'featured',query:'kovac'}).some(x=>x.catalog_id==='CT-MGR-071'));
const js=read('web/meu-time-duas-formacoes-v177.js');
assert(js.includes('function renderKovacLink()'));
assert(js.includes("Object.hasOwn(slots,'sa')"));
assert(js.includes("verified('sa','Atacante pivô')"));
assert(js.includes("verified(slot,'Homem de área')"));
assert(js.includes('Atacante pivô, apenas se SA confirmado'));
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246);
for(const [cap,match] of [[40,'Dwight Yorke'],[45,'Didier Drogba'],[47,'Neymar']]){
 const c=cards.find(x=>x.numero===cap);
 assert(c&&c.name.includes(match),'Carta original da recomendação indisponível: '+cap);
}
assert(!read('web/craque-managers-v302.js').includes('createElement(\'img\')'),
 'Não incorporar fotos de terceiros automaticamente');
console.log('V323 PASS: 71 edições, 23 destaques, Kovač 90/89, 2 bônus, 2 Link-Ups, 246 cartas e 70 técnicos antigos intocados.');
