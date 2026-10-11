'use strict';
const fs=require('fs'),path=require('path');
const base=path.resolve(__dirname,'..');
const wf=fs.readFileSync(path.join(base,'.github/workflows/release.yml'),'utf8');
for (const x of ['needs: [validate, windows, android]','steps.keys.outputs.signed', 'ScoutPRO-Android.apk', 'dist/latest.yml', 'assets/latest.yml', 'permissions:', 'contents: write']) {
  if (!wf.includes(x)) throw Error('Workflow sem garantia: '+x);
}
const pkg=JSON.parse(fs.readFileSync(path.join(base,'package.json')));
if(!pkg.dependencies['electron-updater'] || !pkg.dependencies['@capacitor/android'])throw Error('Faltam dependências das plataformas');
const config=fs.readFileSync(path.join(base,'web/scout-config.js'),'utf8');
if(!config.includes('canalescanorff6-source/scout-pro-offline'))throw Error('Repositório de atualização incorreto');
console.log('PASSOU: publicação protegida, Windows + Android, origem de atualização correta.');
