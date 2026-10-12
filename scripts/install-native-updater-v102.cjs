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
if(!manifest.includes('br.com.scoutpro.offline.scoutupdate.files')&&!manifest.includes('${applicationId}.scoutupdate.files')){
 manifest=manifest.replace('</application>',
 `    <provider
        android:name="androidx.core.content.FileProvider"
        android:authorities="${app.appId}.scoutupdate.files"
        android:exported="false"
        android:grantUriPermissions="true">
        <meta-data android:name="android.support.FILE_PROVIDER_PATHS"
                   android:resource="@xml/scout_update_paths"/>
    </provider>
  </application>`);
}
if(!manifest.includes('scout_update_paths')||!manifest.includes('REQUEST_INSTALL_PACKAGES'))throw Error('Native installer manifest incomplete');
fs.writeFileSync(file,manifest);
console.log('V102: native updater, private FileProvider, install permission and MainActivity registered for '+app.appId);
