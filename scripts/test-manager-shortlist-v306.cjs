'use strict';
/* V306: 22 edições da seleção competitiva; não são 22 novos IDs da Konami. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),zlib=require('node:zlib'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const api=require('../web/craque-managers-v302.js');
const catalogue=api.validate(JSON.parse(zlib.gunzipSync(
 Buffer.from(read('web/craque-manager-catalog-v302.gz.b64').trim(),'base64')
).toString('utf8'))).tecnicos;
const expected=[
 ['013','Tuchel','posse',90],['008','Deschamps','posse',89],
 ['017','Klopp','posse',89],['001','Klopp','rapido',90],
 ['014','Cruyff','posse',89],['020','Arteta','posse',89],
 ['027','Flick','posse',89],['023','Guardiola','posse',89],
 ['025','Fabregas','posse',89],['006','Conte','rapido',90],
 ['012','Martinéz','rapido',90],['019','Alonso','rapido',89],
 ['011','Montella','rapido',89],['005','Mourinho','normal',90],
 ['028','Capello','normal',89],['009','Nagelsmann','normal',89],
 ['015','Beckenbauer','normal',89],['010','Koeman','normal',89],
 ['002','Chivu','fora',90],['007','Lampard','longo',89],
 ['004','Rodríguez','posse',88],['003','Makino','overload',88]
];
assert.equal(expected.length,22);
assert.equal(api.CURATED_IDS.length,22);
assert.equal(new Set(api.CURATED_IDS).size,22);
for(const [ix,part,style,score] of expected){
 const id='CT-MGR-'+ix;
 assert(api.CURATED_IDS.includes(id),'Versão destacada ausente: '+id);
 const c=catalogue.find(c=>c.catalog_id===id);
 assert(c,'Versão não existe nos 70 registros: '+id);
 assert(c.nome.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().includes(part.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase()),
  'ID associado ao técnico errado: '+id+' '+c.nome);
 assert.equal(api.proficiency(c,style),score,'Proficiência precisa ser da mesma versão '+id);
 assert.equal(api.STYLES.length,6);
 assert(Array.isArray(c.boosters_EN)&&Array.isArray(c.ativacao_das_combinacoes));
}
const des=catalogue.find(c=>c.catalog_id==='CT-MGR-008');
assert.equal(api.proficiency(des,'normal'),89);
const chivu=catalogue.find(c=>c.catalog_id==='CT-MGR-002');
assert.equal(api.proficiency(chivu,'longo'),90);
const app=read('web/craque-managers-v302.js'),others=read('web/craque-friends-training-ui-v228.js');
assert(app.includes('SELEÇÃO COMPETITIVA · 22 versões'));
assert(others.includes('v328.filter(managerData,managers,')&&others.includes("scope.addEventListener('change',renderManager)"), 'V328 preserva a seleção competitiva via filtro dinâmico');
assert(others.includes('scoutpro:v306:manager:'));
assert(others.includes('activeOwner.id')&&others.includes('activeCard.id'),'Isolar acervos e cartas');
assert(others.includes('engine.MODES.includes(managerTactic)'), 'Sobreposição não deve gerar PP por outro motor');
assert(others.includes('Não converter em PP'));
assert(read('web/outros-elencos-v227.html').includes('src="craque-managers-v302.js"'));
assert(read('web/sw.js').includes('v306-curated-managers'));
assert.equal(JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards.length,246);
console.log('V306 PASS: 22 edições priorizadas, nomes/valores conferidos no catálogo importado, 70 edições preservadas e integração isolada nos dois acervos.');
