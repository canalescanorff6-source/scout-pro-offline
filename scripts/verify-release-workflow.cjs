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
const winJob=wf.split('  release:\n')[1]?.split('\n  release_android:')[0]||'';
const apkJob=wf.split('  release_android:\n')[1]||'';
if(!winJob.includes('needs: [validate, windows, android]'))throw Error('Windows exige as duas compilações GREEN');
if(!winJob.includes('assets/latest.yml')||!winJob.includes('Publicar Windows para atualização automática'))throw Error('Windows sem release de atualização');
if(winJob.includes("needs.android.outputs.signed == 'true'"))throw Error('Windows não pode depender da assinatura Android');
if(!apkJob.includes("if: ${{ needs.android.outputs.signed == 'true' }}"))throw Error('APK oficial precisa de assinatura persistente');
if(!apkJob.includes('sha256sum -c ScoutPRO-Android.apk.sha256'))throw Error('APK oficial exige verificação SHA256');
console.log('PASSOU: Windows publica após CI GREEN sem bloquear por assinatura Android; APK somente assinado.');
