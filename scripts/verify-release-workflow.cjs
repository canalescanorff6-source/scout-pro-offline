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
const apkJob=winJob;
if(!winJob.includes('needs: [validate, windows, android]'))throw Error('Windows exige as duas compilações GREEN');
if(!winJob.includes('assets/latest.yml')||!winJob.includes('Publicar atualização conjunta Android e Windows'))throw Error('Release conjunta ausente');
if(!winJob.includes("if: ${{ github.ref == 'refs/heads/main' && needs.android.outputs.signed == 'true' }}"))throw Error('Release precisa da main e do APK oficialmente assinado');
if(wf.includes('\n  release_android:'))throw Error('Publicação em dois jobs distintos não é permitida');
if((wf.match(/uses: softprops\/action-gh-release@v2/g)||[]).length!==1)throw Error('Exigir apenas uma publicação para Android e Windows');
for(const f of ['name: scout-pro-android-assinado','assets/ScoutPRO-Android.apk','assets/ScoutPRO-Android.apk.sha256','assets/ScoutPRO-Setup-*.exe'])if(!winJob.includes(f))throw Error('Release sem artefato '+f);
if(!wf.includes('APKSIGNER')||!wf.includes('EXPECTED_CERT')||!wf.includes('ACTUAL_CERT'))throw Error('APK sem conferência do certificado oficial');
if(!apkJob.includes('sha256sum -c ScoutPRO-Android.apk.sha256'))throw Error('APK oficial exige verificação SHA256');
if(!wf.includes('(cd release-out && sha256sum ScoutPRO-Android.apk > ScoutPRO-Android.apk.sha256)'))throw Error('Checksum do APK deve ser relativo ao artefato da Release');
const officialSigner=fs.readFileSync(path.join(base,'scripts/official-android-sign-v99.cjs'),'utf8');
const expectedCert=officialSigner.match(/const expectedCert='([0-9a-f]{64})'/)?.[1];
if(!expectedCert||!wf.includes("EXPECTED_CERT='"+expectedCert+"'"))throw Error('Certificado de release diferente da identidade oficial V99');
if(!apkJob.includes('sha256sum -c ScoutPRO-Android.apk.sha256'))throw Error('Release sem checksum do APK');
console.log('V297 PASSOU: release única Android + Windows, condicionada à main, à assinatura oficial e ao SHA256 do APK.');
