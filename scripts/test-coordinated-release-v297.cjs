'use strict';
/* V297 — release única Android + Windows, sem dependência de segredos na CI de PR. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const wf=read('.github/workflows/release.yml');
const signer=read('scripts/official-android-sign-v99.cjs');
const before=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(before).cards;
assert.equal(cards.length,246);
const release=wf.split('\n  release:\n')[1];
const android=wf.split('\n  android:\n')[1]?.split('\n  release:\n')[0];
assert(release&&android);
assert(!wf.includes('\n  release_android:'),'APK não pode chegar depois da release Windows');
assert.equal((wf.match(/uses: softprops\/action-gh-release@v2/g)||[]).length,1);
assert(release.includes("if: ${{ github.ref == 'refs/heads/main' && needs.android.outputs.signed == 'true' }}"));
assert(release.includes('needs: [validate, windows, android]'));
const required=[
 'name: scout-pro-windows','name: scout-pro-android-teste',
 'name: scout-pro-android-assinado','assets/latest.yml',
 'assets/ScoutPRO-Setup-*.exe','assets/*.blockmap',
 'assets/ScoutPRO-Android.apk','assets/ScoutPRO-Android.apk.sha256',
 'sha256sum -c ScoutPRO-Android.apk.sha256',
 "keys=('schema','version','git_revision','bundle_fingerprint','source_count')"
];
for(const item of required)assert(release.includes(item),'Falta na release conjunta: '+item);
for(const s of ['draft: true','make_latest: false','--draft=false --latest',
 'Proibir colisão com versões oficiais existentes',
 'Conferir no GitHub os cinco artefatos antes de ativar os atualizadores',
 'gh release view'])assert(release.includes(s),'Falha no preparo/validação da release: '+s);
const cert=signer.match(/const expectedCert='([0-9a-f]{64})'/)?.[1];
assert(cert,'Certificado oficial V99 precisa estar documentado');
assert(android.includes("EXPECTED_CERT='"+cert+"'"));
assert(android.includes('"$APKSIGNER" verify --verbose --print-certs "$APK"'),
 'A conferência deve usar o mesmo relatório verificado pelo assinador V99');
assert(android.includes("grep -Eoi '([[:xdigit:]]{2}:){31}[[:xdigit:]]{2}|[[:xdigit:]]{64}'"),
 'Aceitar formatos apksigner com ou sem dois-pontos nas impressões SHA256');
assert(android.includes('grep -Fx "$EXPECTED_CERT"'),
 'Somente o digest SHA256 completo da identidade V99 é permitido');
assert(!android.includes("awk -F': ' '/^Signer #1"),
 'É proibido depender do label frágil de uma versão específica do apksigner');
assert(android.includes('"$ACTUAL_CERT" != "$EXPECTED_CERT"'));
assert(android.includes("grep -Fq \"package: name='br.com.scoutpro.offline'"));
assert(android.includes("if: steps.keys.outputs.signed == 'true'"));
assert(wf.includes("name: scout-pro-android-assinado"));
const mayPublish=(branch,signed,checks)=>branch==='refs/heads/main'&&signed===true&&checks===true;
assert.equal(mayPublish('refs/heads/main',true,true),true);
for(const context of [
 ['refs/heads/main',false,true],
 ['refs/heads/dev',true,true],
 ['refs/pull/204/merge',true,true],
 ['refs/heads/main',true,false]
])assert.equal(mayPublish(...context),false,'Cenário de release sem pré-requisitos');
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),before);
fs.mkdirSync(path.join(root,'build'),{recursive:true});
fs.writeFileSync(path.join(root,'build/v297-release-safety.json'),JSON.stringify({
 schema:'CRAQUE_V297_RELEASE_SAFETY',cardsUnchanged:246,
 officialSigningRequired:true,mainOnly:true,oneReleaseAction:true,
 androidSha256Checked:true,androidExpectedCertificate:cert,
 windowsAndAndroidInSingleRelease:true,
 signedPackageBuiltInPR:false,physicalInstallValidated:false,
 releaseExecuted:false
},null,2)+'\n');
console.log('V297 PASS: release única com certificado oficial Android, checksum e Windows; 246 cartas intactas.');