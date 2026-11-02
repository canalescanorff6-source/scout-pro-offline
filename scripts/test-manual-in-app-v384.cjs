'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../web/manual-2027');
a(fs.existsSync(path.join(root,'index.html')),'Manual completo precisa entrar no aplicativo');
const D=require(path.join(root,'content.js'));
a.equal(D.chapters.length,18);a.equal(D.feints.items.length,13);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
a(html.includes('../index.html'));a(html.includes('native-guide-v384.js'));
a(!fs.readFileSync(path.join(root,'app.js'),'utf8').includes("serviceWorker.register('./sw.js')"),'Um único cache de atualização do app');
a(fs.readFileSync('web/craque-account-ui-v382.js','utf8').includes('manual-2027/index.html'));
const manifest=require(path.join(root,'embedded-manifest.json'));
for(const file of manifest.files){let bytes=fs.readFileSync(path.join(root,file));if(/\.(html|js|css|json|svg)$/.test(file))bytes=Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'));a.equal(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.sha256[file],file+' source proof');a(fs.existsSync(path.join(root,file)));a(fs.readFileSync('web/sw.js','utf8').includes('./manual-2027/'+file));a(fs.readFileSync('scripts/stamp-bundle-v189.cjs','utf8').includes('manual-2027/'+file));}
a(fs.readFileSync(path.join(root,'manual-2027.pdf')).subarray(0,5).equals(Buffer.from('%PDF-')));
a(fs.readFileSync('native/android/ScoutFileExportPlugin.java','utf8').includes('saveGuidePdf'));
a(fs.readFileSync('desktop/preload.cjs','utf8').includes('saveGuidePdf'));
console.log('V384 MANUAL PASS:18capítulos/13gestos/PDF/imagens no bundle e cache compartilhados,retorno e exportação nativa.');
