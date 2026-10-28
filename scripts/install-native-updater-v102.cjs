'use strict';
// Called AFTER "cap add android": Android sources are generated in CI and intentionally not committed.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const app=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
assert.equal(app.appId,'br.com.scoutpro.offline','Never change the installed Android package name');
const android=path.join(root,'android/app/src/main'),base=path.join(android,'java','br/com/scoutpro/offline');
if(!fs.existsSync(path.join(android,'AndroidManifest.xml')))throw Error('Run npx cap add android first');
fs.mkdirSync(base,{recursive:true});
const activity=`package br.com.scoutpro.offline;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(ScoutUpdaterPlugin.class);
        registerPlugin(ScoutRecorderPlugin.class);
        registerPlugin(ScoutFileExportPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
`;
fs.writeFileSync(path.join(base,'MainActivity.java'),activity);
fs.copyFileSync(path.join(root,'native/android/ScoutUpdaterPlugin.java'),path.join(base,'ScoutUpdaterPlugin.java'));
fs.copyFileSync(path.join(root,'native/android/ScoutUpdateFileProvider.java'),path.join(base,'ScoutUpdateFileProvider.java'));
fs.copyFileSync(path.join(root,'native/android/ScoutRecorderPlugin.java'),path.join(base,'ScoutRecorderPlugin.java'));
fs.copyFileSync(path.join(root,'native/android/ScoutFileExportPlugin.java'),path.join(base,'ScoutFileExportPlugin.java'));
fs.copyFileSync(path.join(root,'native/android/ScoutRecorderService.java'),path.join(base,'ScoutRecorderService.java'));
const xml=path.join(android,'res/xml');fs.mkdirSync(xml,{recursive:true});
fs.writeFileSync(path.join(xml,'scout_update_paths.xml'),
 `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
  <cache-path name="scout-update-apk" path="scout-updates/"/>
</paths>
`);
const file=path.join(android,'AndroidManifest.xml');let manifest=fs.readFileSync(file,'utf8');
if(!manifest.includes('android.permission.INTERNET'))throw Error('Internet permission must remain present');
if(!manifest.includes('android.permission.REQUEST_INSTALL_PACKAGES')){
 manifest=manifest.replace(/(<application\b)/,
   '    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />\n\n    $1');
}
// V219: gravação de jogo só após autorização do sistema, sempre em foreground.
for(const permission of ['android.permission.FOREGROUND_SERVICE','android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION']){
 if(!manifest.includes(permission)){
  manifest=manifest.replace(/(<application\b)/,
   '    <uses-permission android:name="'+permission+'" />\n\n    $1');
 }
}
if(!manifest.includes('ScoutRecorderService')){
 manifest=manifest.replace('</application>',
  '    <service android:name="'+app.appId+'.ScoutRecorderService" android:exported="false" android:foregroundServiceType="mediaProjection" />\n  </application>');
}
const PROVIDER_AUTHORITY=app.appId+'.scoutupdate.files';
const PROVIDER_CLASS=app.appId+'.ScoutUpdateFileProvider';
// Classe distinta da usada pelo Capacitor (.fileprovider): o manifest merger
// nunca deve fundir dois FileProviders do mesmo android:name.
if(!manifest.includes(PROVIDER_AUTHORITY)){
 manifest=manifest.replace('</application>',
 `    <provider
        android:name="${PROVIDER_CLASS}"
        android:authorities="${PROVIDER_AUTHORITY}"
        android:exported="false"
        android:grantUriPermissions="true">
        <meta-data android:name="android.support.FILE_PROVIDER_PATHS"
                   android:resource="@xml/scout_update_paths"/>
    </provider>
  </application>`);
}
if(!manifest.includes('FOREGROUND_SERVICE_MEDIA_PROJECTION')||!manifest.includes('ScoutRecorderService')||!manifest.includes('mediaProjection'))throw Error('V219 recorder service manifest incomplete');
if(!manifest.includes('scout_update_paths')||!manifest.includes('REQUEST_INSTALL_PACKAGES')||!manifest.includes(PROVIDER_CLASS)||!manifest.includes(PROVIDER_AUTHORITY))
 throw Error('Native installer manifest incomplete or FileProvider authority mismatch');
fs.writeFileSync(file,manifest);
console.log('V167: dedicated ScoutUpdateFileProvider (authority '+PROVIDER_AUTHORITY+'), private APK paths and native updater registered for '+app.appId);
