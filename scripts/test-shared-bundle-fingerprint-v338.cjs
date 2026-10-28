'use strict';
/* Pré-release V338: detectar arquivos usados pelo app, mas fora da prova
   de paridade web Android/Windows. Somente lê arquivos; não altera a build. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const stamp=read('scripts/stamp-bundle-v189.cjs');
const declaration=stamp.match(/const paths=\[([\s\S]*?)\];/);
assert(declaration,'A lista de arquivos comuns deve existir no stamper');
const names=[...declaration[1].matchAll(/'([^']+)'/g)].map(m=>m[1]);
assert(names.length>100,'O manifesto precisa cobrir o frontend e os motores compartilhados');
assert.equal(new Set(names).size,names.length,'Nenhum arquivo deve ser contado duas vezes');
const essential=[
 'index.html','premium.js','pwa.js','premium.css','app-bridge.js',
 'scout-config.js','position-order.js','lab.js','manifest.webmanifest',
 'craque-positional-v311.js','craque-positional-ui-v311.js',
 'craque-ficha-decision-v327.js','craque-ficha-individual-v251.js',
 'craque-manager-fichas-v324.js','craque-lineup-focus-v330.js',
 'craque-manager-selector-v328.js','sw.js','SCOUT_V69_AUDITORIA.json'
];
for(const p of essential){
 assert(names.includes(p),'Arquivo crítico fora da paridade Android/Windows: '+p);
 assert(fs.statSync(path.join(root,'web',p)).isFile(),
  'Arquivo crítico ausente do conteúdo do app: '+p);
}
assert(!names.some(p=>p.startsWith('/')||p.includes('..')||p.includes('\\')),
 'A prova de paridade não pode sair da pasta web');
const hash=(changes=new Map())=>{
 const h=crypto.createHash('sha256');
 for(const name of names){
  const file=path.join(root,'web',name);
  const content=(changes.has(name)?changes.get(name):fs.readFileSync(file,'utf8'))
   .replace(/\r\n/g,'\n');
  h.update(name+'\0'+content.length+'\0'+content);
 }
 return h.digest('hex').slice(0,20);
};
const baseline=hash();
assert(/^[0-9a-f]{20}$/.test(baseline));
for(const changed of ['premium.js','pwa.js','scout-config.js',
                      'position-order.js','lab.js','manifest.webmanifest']){
 const original=read('web/'+changed);
 const altered=hash(new Map([[changed,original+'\n// alteração simulada V338']]));
 assert.notEqual(altered,baseline,
  'Alterar '+changed+' deve mudar a prova de paridade sem alterar arquivos reais');
}
const workflow=read('.github/workflows/release.yml');
assert(workflow.includes('run: npm run bundle:stamp')&&
 (workflow.match(/run: npm run bundle:stamp/g)||[]).length>=2,
 'Android e Windows devem executar a geração da prova de paridade');
assert(workflow.includes("keys=('schema','version','git_revision','bundle_fingerprint','source_count')"),
 'A publicação conjunta precisa comparar fonte, versão e hash');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
assert.equal(cards.length,246,'Acervo original deve permanecer 246 cartas');
console.log('V338 PARIDADE PASS: '+names.length+
 ' fontes compartilhadas; Premium, PWA, config, navegação e laboratório alteram o hash; 246 cartas intactas.');
