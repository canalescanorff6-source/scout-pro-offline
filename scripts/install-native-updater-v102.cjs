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
        super.onCreate(savedInstanceState);
    }
}
`;
fs.writeFileSync(path.join(base,'MainActivity.java'),activity);
fs.copyFileSync(path.join(root,'native/android/ScoutUpdaterPlugin.java'),path.join(base,'ScoutUpdaterPlugin.java'));
fs.copyFileSync(path.join(root,'native/android/ScoutUpdateFileProvider.java'),path.join(base,'ScoutUpdateFileProvider.java'));
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
if(!manifest.includes('scout_update_paths')||!manifest.includes('REQUEST_INSTALL_PACKAGES')||!manifest.includes(PROVIDER_CLASS)||!manifest.includes(PROVIDER_AUTHORITY))
 throw Error('Native installer manifest incomplete or FileProvider authority mismatch');
fs.writeFileSync(file,manifest);
console.log('V167: dedicated ScoutUpdateFileProvider (authority '+PROVIDER_AUTHORITY+'), private APK paths and native updater registered for '+app.appId);
