'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web'),flow=fs.readFileSync(path.join(root,'.github/workflows/release.yml'),'utf8');
const java=fs.readFileSync(path.join(root,'native/android/ScoutUpdaterPlugin.java'),'utf8');
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
const installer=fs.readFileSync(path.join(root,'scripts/install-native-updater-v102.cjs'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
const provider=fs.readFileSync(path.join(root,'native/android/ScoutUpdateFileProvider.java'),'utf8');
assert.match(provider,/class ScoutUpdateFileProvider extends FileProvider/,'Provider exclusivo ausente');
assert(!/class ScoutUpdaterPlugin extends FileProvider/.test(java),'O plugin não é o FileProvider');
assert(installer.includes("native/android/ScoutUpdateFileProvider.java"),'Provider exclusivo precisa ser copiado para o projeto Android');
assert(installer.includes("PROVIDER_CLASS=app.appId+'.ScoutUpdateFileProvider'"),'Classe de provider distinta ausente');
assert(installer.includes("PROVIDER_AUTHORITY=app.appId+'.scoutupdate.files'"),'Autoridade de provider customizado ausente');
assert(!installer.includes('android:name="androidx.core.content.FileProvider"'),'Nunca registrar duas instâncias diretas do provider do Capacitor');
assert(java.includes('getContext().getPackageName()+".scoutupdate.files"'),'Plugin deve usar a mesma autoridade do manifesto');

assert.equal(pkg.appId,'br.com.scoutpro.offline');
for(const word of [
 '@CapacitorPlugin(name="ScoutUpdater")',
 'public void getInstalledInfo(PluginCall call)',
 'public void download(PluginCall call)',
 'public void installDownloaded(PluginCall call)',
 'RELEASE.matcher(url).matches()',
 'MessageDigest.getInstance("SHA-256")',
 'APK excede limite permitido',
 'digest.equals(expected)',
 'candidate.packageName',
 'code(candidate)<=code(installed)',
 'getApkContentsSigners',
 'signature_mismatch',
 'Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES',
 'pm.canRequestPackageInstalls()',
 'FileProvider.getUriForFile',
 'Intent.FLAG_GRANT_READ_URI_PERMISSION',
 'Installer' .slice(0,0) // empty string harmless
])assert(java.includes(word),'Missing native safety property: '+word);
// V166: o problema de leitura do URI não é coberto apenas pelo hash do download.
for(const safety of [
 'Intent.ACTION_INSTALL_PACKAGE',
 'ClipData.newUri',
 'install.setClipData(',
 'Intent.FLAG_GRANT_READ_URI_PERMISSION',
 'getContext().grantUriPermission(',
 'getContentResolver().openFileDescriptor(uri,"r")',
 'fd.getStatSize()',
 'getContext().startActivity(install)',
 'ActivityNotFoundException',
 'fallback.setClipData('
])assert(java.includes(safety),'V166: o instalador precisa receber APK por URI legível: '+safety);
assert(java.indexOf('install.setClipData(')<java.indexOf('getContext().startActivity(install)'));
assert(java.includes('ACTION_VIEW'),'Must retain OEM compatibility fallback');
assert(!java.includes('ACTION_DELETE'),'Cannot silently uninstall existing user app');
assert(!java.includes('ACTION_UNINSTALL_PACKAGE'),'Migration requires explicit user backup');
assert(!java.includes('deletePackage'),'App should never delete an installation');
for(const s of [
 'android.permission.REQUEST_INSTALL_PACKAGES',
 'scout_update_paths',
 'scout-updates/',
 'registerPlugin(ScoutUpdaterPlugin.class)',
 'br.com.scoutpro.offline'])assert(installer.includes(s),'Native build integration missing '+s);
assert(flow.includes('node scripts/install-native-updater-v102.cjs'),'Release must embed plugin after cap add');
const smoke=fs.readFileSync(path.join(root,'.github/workflows/v101-validation.yml'),'utf8');
assert(smoke.includes('node scripts/install-native-updater-v102.cjs'),'Android PR must compile native plugin');
for(const s of [
 'const nativeUpdater=()=>',
 "plugin.getInstalledInfo()",
 'native.download({url:androidDownload})',
 'native.installDownloaded()',
 'signature_mismatch',
 'permission_required',
 'installer_opened',
 'version_not_newer',
 'downloadProgress',
 'scout-android-progress',
 'scout-android-install',
 'Baixar APK oficial no app',
 'scout-android-external',
 'Alternativa: baixar no navegador',
 'Faça backup'
])assert(bridge.includes(s),'UI native update step missing '+s);
assert(!bridge.includes('await openReleaseLink(androidDownload)'),'Android must not jump to Chrome for APK download');
assert(bridge.includes('setAndroidDownload(url)'),'Existing release selection unchanged');
assert(fs.existsSync(path.join(web,'SCOUT_V98_AUDITORIA_TATICA.json')));
assert.equal(JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V98_AUDITORIA_TATICA.json'),'utf8')).cartas.length,246);
console.log('V102 OK: internal APK download, SHA256, signature/version checking, system installer and backup protections.');
