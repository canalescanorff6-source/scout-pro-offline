'use strict';
/* V302 — data importado do ZIP do usuário, por versão e com fonte;
 * não presume que o usuário possui todos os técnicos. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const API=require('../web/craque-managers-v302.js');
const base64=read('web/craque-manager-catalog-v302.gz.b64').trim();
assert.equal(base64,API.DATA_GZIP_BASE64,'Fonte compactada e módulo Android/Windows divergentes');
const raw=zlib.gunzipSync(Buffer.from(base64,'base64'));
const sha=crypto.createHash('sha256').update(raw).digest('hex');
assert.equal(sha,'8e80354cbf77c10a454a6a4cc61d76d9945f0a046d61e1b889334e6e0838a34e',
 'Catálogo difere do JSON enviado pelo usuário');
const data=API.validate(JSON.parse(raw.toString('utf8')));
const C=data.tecnicos;
assert.equal(C.length,70);
assert.equal(new Set(C.map(x=>x.catalog_id)).size,70);
assert.equal(new Set(C.map(x=>x.nome)).size,50);
assert.equal(API.STYLES.length,6);
assert.deepEqual(API.STYLES.filter(s=>s.supported).map(s=>s.id),
 ['posse','rapido','normal','fora','longo']);
assert.equal(API.STYLES.find(x=>x.id==='overload').supported,false,
 'Overload oficial precisa aguardar motor próprio; não reusar PP de outro estilo');
let dual=0,uncertain=0,unknownDate=0,notLicensed=0;
for(const x of C){
 if(API.STYLES.filter(s=>s.supported&&API.proficiency(x,s.id)>=85).length>=2)dual++;
 if(x.linkups_status==='não confirmado')uncertain++;
 if(x.versao_lancamento===null)unknownDate++;
 if(/não autorizado|não confirmado/i.test(x.portrait_license_status))notLicensed++;
 assert(/^[A-Z]{2}-MGR-[0-9]{3}$/.test(x.catalog_id));
 assert(x.source_profile.startsWith('https://'));
 for(const s of API.STYLES){
  const rank=API.model(x,s.id);
  assert.equal(rank.score,x.prof_cada_estilo[s.field]);
  assert.equal(rank.canCalculate,s.supported&&rank.score!==null);
  if(!s.supported)assert.equal(rank.status,
   rank.score===null?'nao_documentado':'motor_tatico_pendente');
 }
}
assert.equal(dual,33);
assert.equal(uncertain,40);
assert.equal(unknownDate,1);
assert.equal(notLicensed,70);
const klopp=C.find(x=>x.catalog_id==='CT-MGR-001');
assert.equal(API.proficiency(klopp,'rapido'),90);
assert.equal(API.proficiency(klopp,'posse'),63);
assert.equal(API.preferred(klopp,null),'rapido');
const chivu=C.find(x=>x.catalog_id==='CT-MGR-002');
assert.equal(API.proficiency(chivu,'fora'),90);
assert.equal(API.proficiency(chivu,'longo'),90);
assert.equal(API.model(chivu,'longo').status,'prof_89_mais');
const bridge=read('web/app-bridge.js'),card=read('web/scout-card-unified-v220.js');
assert(bridge.includes("managers.onload=prepareStylePlanner;managers.onerror=prepareStylePlanner;"),
 'V303 precisa carregar simulador por estilo antes da UI principal');
assert(bridge.includes("craque-managers-v302.js")&&bridge.includes("craque-managers-v302.css"));
assert(card.includes('scoutpro:card-shell-ready-v302'));
const js=read('web/craque-managers-v302.js');
assert(js.includes("scoutpro:tactic-ui-selected-v220"));
assert(js.includes("scoutpro:manager-selected-v302"));
assert(js.includes("host.localStorage.setItem(KEY"));
assert(!js.includes('createElement(\'img\')'),
 'Retratos sem permissão não podem aparecer automaticamente');
const sw=read('web/sw.js'),stamp=read('scripts/stamp-bundle-v189.cjs');
for(const f of ['craque-managers-v302.js','craque-managers-v302.css']){
 assert(sw.includes("'./"+f+"'"),'Arquivo ausente do cache offline: '+f);
 assert(stamp.includes("'"+f+"'"),'Arquivo ausente da paridade Android/Windows: '+f);
}
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246,'Nenhuma carta pode ser substituída');
console.log('V302 PASS: 70 versões, 50 nomes, seis proficiências, 33 duplos >=85, 40 linkups não confirmados, 70 retratos sem licença e 246 cartas intactas. SHA256 original '+sha);
