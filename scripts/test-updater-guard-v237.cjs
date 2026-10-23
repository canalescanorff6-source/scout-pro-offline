'use strict';
/* V237 — regressões estáticas + seleção real de releases, sem tocar nos
 * executáveis, chaves, cartões, preferências ou dados do usuário.
 * Testes físicos de instalação/atualização permanecem necessários.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const native=read('native/android/ScoutUpdaterPlugin.java');
const installer=read('scripts/install-native-updater-v102.cjs');
const bridge=read('web/app-bridge.js');
const desktop=read('desktop/main.cjs');
const backup=read('web/craque-backup-v226.js');
const release=read('.github/workflows/release.yml');
const capacitor=JSON.parse(read('capacitor.config.json'));
const roster=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json'));
const pkg=JSON.parse(read('package.json'));
const ordered=(source,first,last,label)=>{
 const a=source.indexOf(first),b=source.indexOf(last);
 assert(a>=0&&b>a, 'Sequência insegura: '+label);
};

// Identidade e certificado de atualização nunca podem mudar silenciosamente.
assert.equal(capacitor.appId,'br.com.scoutpro.offline');
assert.equal(roster.cards.length,246);
assert(pkg.scripts.check.includes('scripts/test-updater-guard-v237.cjs'));

// Motor nativo: só aceitar a URL exata de APK oficial do repositório.
for(const guard of [
 'RELEASE.matcher(url).matches()',
 'https://github.com/canalescanorff6-source/scout-pro-offline/releases/download/',
 'https://github',
 'REDIRECT_HOSTS.contains(url.getHost().toLowerCase(Locale.ROOT))',
 'if(!"https".equalsIgnoreCase(url.getProtocol())',
 'conn.setInstanceFollowRedirects(false)',
 'expectedChecksum(url)',
 'MessageDigest.getInstance("SHA-256")',
 'if(current>MAX_APK)',
 'if(!digest.equals(expected))',
 'if(!expected.equals(hex(sha.digest())))',
 'code(candidate)<=code(installed)',
 'getApkContentsSigners',
 'fingerprint(s1[0]).equals(fingerprint(s2[0]))',
 'pm.canRequestPackageInstalls()',
 'Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES',
 'FileProvider.getUriForFile',
 'getContext().getContentResolver().openFileDescriptor(uri,"r")',
 'Intent.ACTION_INSTALL_PACKAGE',
 'Intent.FLAG_GRANT_READ_URI_PERMISSION',
 'getContext().startActivity(install)',
])assert(native.includes(guard),'Proteção Android ausente: '+guard);

ordered(native,'expectedChecksum(url)','HttpURLConnection conn=connect(url);',
 'Ler checksum antes de obter o APK');
ordered(native,'if(!digest.equals(expected))','if(!temp.renameTo(file))',
 'Comparar hash antes de tornar APK instalável');
ordered(native,'if(!temp.renameTo(file))','putString("verifiedSha256",digest)',
 'Só registrar hash depois de salvar o APK verificado');
// Há uma leitura inicial em getInstalledInfo. Para conferir a ordem de instalação,
// comparar somente o trecho do método installDownloaded.
const installFlow=native.slice(native.indexOf('public void installDownloaded(PluginCall call)'));
assert(installFlow.length>0,'Método de instalação nativa ausente');
ordered(installFlow,'if(!expected.equals(hex(sha.digest())))','PackageInfo installed=info',
 'Verificar alterações após download antes de identificar pacote');
ordered(installFlow,'candidate.packageName','code(candidate)<=code(installed)',
 'Verificar pacote antes de oferecer upgrade');
ordered(installFlow,'code(candidate)<=code(installed)','fingerprint(s1[0]).equals(fingerprint(s2[0]))',
 'Bloquear downgrade antes de comparar assinatura');
ordered(installFlow,'fingerprint(s1[0]).equals(fingerprint(s2[0]))','pm.canRequestPackageInstalls()',
 'Validar assinatura antes de pedir permissão de instalação');
ordered(installFlow,'openFileDescriptor(uri,"r")','getContext().startActivity(install)',
 'Confirmar URI legível antes de abrir instalador');

assert(!native.includes('Intent.ACTION_DELETE'));
assert(!native.includes('Intent.ACTION_UNINSTALL_PACKAGE'));
assert(!native.includes('deletePackage('));
assert(installer.includes("PROVIDER_AUTHORITY=app.appId+'.scoutupdate.files'"));
assert(installer.includes("native/android/ScoutUpdaterPlugin.java"));
assert(release.includes('node scripts/install-native-updater-v102.cjs'));
assert(release.includes("needs.android.outputs.signed == 'true'"));
assert(release.includes('sha256sum -c ScoutPRO-Android.apk.sha256'));

// A UI não pode criar instalação silenciosa nem usar executável Windows como APK.
for(const code of [
 'native.download({url:androidDownload})',
 'native.installDownloaded()',
 "result.status==='signature_mismatch'",
 "result.status==='version_not_newer'",
 "result.status==='permission_required'",
 "result.status==='installer_opened'",
 'if(!androidVerified)return;',
 'Baixar APK oficial no app',
 'Fazer backup',
 'Não desinstale antes de exportar e conferir o backup',
])assert(bridge.includes(code),'Fluxo seguro na UI ausente: '+code);
ordered(bridge,"if(downloaded.status!=='verified')","androidVerified=true",
 'Instalação bloqueada até confirmação do download verificado');
ordered(bridge,'androidVerified=true;', 'await installReadyAPK();',
 'Não instalar antes de registrar confirmação de download');
assert(!bridge.includes('await openReleaseLink(androidDownload)'),
 'APK Android não deve depender da abertura automática do navegador');

// Usa a seleção de releases implementada, não uma aproximação duplicada.
const start=bridge.indexOf('const cmpVersion=');
const end=bridge.indexOf('const nativeAndroid=',start);
assert(start>=0&&end>start,'Funções de atualização não localizadas');
const sandbox={};
vm.runInNewContext(bridge.slice(start,end)+
 ';globalThis.V237={cmpVersion,chooseAndroidRelease};',sandbox,{timeout:3000});
const {cmpVersion,chooseAndroidRelease}=sandbox.V237;
const asset=(version,suffix='ScoutPRO-Android.apk',prefix='https://github.com/official/')=>
 ({name:suffix,browser_download_url:prefix+version+'/'+suffix});
const candidate=(version,assets,flags={})=>
 ({tag_name:'v'+version,assets,...flags});
assert.equal(cmpVersion('1.1.409','1.1.407'),1);
assert.equal(cmpVersion('1.1.410','1.1.409'),1);
assert.equal(cmpVersion('1.1.409','1.1.409'),0);
assert.equal(cmpVersion('1.1.90','1.1.409'),-1);
assert.equal(chooseAndroidRelease([]),null);
assert.equal(chooseAndroidRelease([candidate('1.1.500',[asset('1.1.500','ScoutPRO-Setup-1.1.500.exe')])]),null,
 'Releases somente Windows não devem ser selecionadas');
assert.equal(chooseAndroidRelease([candidate('1.1.500',[asset('1.1.500','ScoutPRO-Android-TESTE.apk')])]),null,
 'Nunca instalar builds de teste');
assert.equal(chooseAndroidRelease([candidate('1.1.501',[asset('1.1.501')],{draft:true})]),null);
assert.equal(chooseAndroidRelease([candidate('1.1.502',[asset('1.1.502')],{prerelease:true})]),null);
assert.equal(chooseAndroidRelease([candidate('1.1.503',[asset('1.1.503','ScoutPRO-Android.apk','http://github.com/')])]),null);
assert.equal(chooseAndroidRelease([candidate('1.1.504',[asset('1.1.504','ScoutPRO-Android.apk','https://evil.example/')])]),null);
assert.equal(chooseAndroidRelease([
 candidate('1.1.407',[asset('1.1.407')]),
 candidate('1.1.900',[asset('1.1.900','ScoutPRO-Setup-1.1.900.exe')]),
 candidate('1.1.409',[asset('1.1.409')]),
 candidate('1.1.411',[asset('1.1.411')],{prerelease:true})
]).release.tag_name,'v1.1.409','Escolher o APK oficial mais recente');

// O Windows deve manter a identidade local e exigir confirmação antes de reiniciar.
for(const guard of [
 "previousDataPaths=['Scout PRO','scout-pro-elite-offline']",
 "if(foundPrevious)app.setPath('userData',foundPrevious)",
 "if(updaterConfigured || !app.isPackaged || process.platform!=='win32')return",
 'autoUpdater.autoDownload=true',
 'autoUpdater.autoInstallOnAppQuit=false',
 "autoUpdater.on('update-downloaded'",
 "buttons:['Instalar agora','Depois']",
 'if(res.response===0)autoUpdater.quitAndInstall(false,true)',
 "ipcMain.handle('scout:install-downloaded'",
 "ipcMain.handle('scout:check-updates'",
])assert(desktop.includes(guard),'Regressão de atualização/dados Windows: '+guard);
ordered(desktop,"app.setPath('userData',foundPrevious)","app.whenReady().then",
 'Preservar userData antes do ciclo de vida do Electron');

// Backup é separado de instalação; falha no snapshot impede restauração.
for(const guard of [
 "const KEY_PREFIX='scoutpro:'",
 "const before=await create();",
 "await nativeSnapshot(before,'pre-restore')",
 "if(bytes(serialized)>MAX_BYTES)",
 "if(await digest(canonical(input.items))!==input.checksum)",
 "localStorage.setItem(k,v)",
])assert(backup.includes(guard),'Barreira de preservação de dados ausente: '+guard);

console.log('V237 PASS: rejeições de release, downgrade, assinatura, URI, SHA256, '
 +'consentimento de instalação, persistência Windows e backup; 246 cartas intactas. '
 +'Testes não simulam instalador real nem afirmam atualização física.');
