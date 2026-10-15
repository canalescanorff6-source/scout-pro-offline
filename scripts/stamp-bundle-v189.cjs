'use strict';
/* Gera prova determinística da revisão e dos arquivos web comuns aos dois instaladores. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const version=require(path.join(root,'package.json')).version;
const revision=(process.env.GITHUB_SHA||process.env.SCOUT_GIT_REVISION||'local').trim();
const paths=[
 'index.html','premium.css','scout-premium-v73.css','app-bridge.js','app-bridge.css',
 'scout-profile-v188.js','scout-profile-v188.css','scout-ui-v189.js','scout-ui-v189.css',
 'skills-booster-v162.js','booster-engine-v103.js','SCOUT_V69_AUDITORIA.json',
 'SCOUT_V101_MODELO_CORPORAL.json','SCOUT_V184_EFHUB_241_COMPLETE.json',
 'SCOUT_V188_EFHUB_BOOSTERS_241.json'
];
const contentHash=crypto.createHash('sha256');
for(const name of paths){
 const full=path.join(web,name);
 if(!fs.existsSync(full))throw Error('Falta no bundle: '+name);
 const content=fs.readFileSync(full,'utf8').replace(/\r\n/g,'\n');
 contentHash.update(name+'\0'+content.length+'\0'+content);
}
const result={
 schema:'scout_v189_shared_web_bundle',
 version,git_revision:revision,
 bundle_fingerprint:contentHash.digest('hex').slice(0,20),
 common_web_dir:'web',source_count:paths.length,
 mobile_web_container:'Capacitor webDir=web',
 desktop_web_container:'Electron electron-builder files=web/**/*',
 generated_from:'same_GitHub_commit_same_version',
 note:'Instalações Android e Windows são independentes; dados alterados localmente não sincronizam automaticamente.'
};
const output=path.join(web,'scout-build-info.json');
fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log('SCOUT SHARE '+result.version+' '+result.git_revision+' '+result.bundle_fingerprint);
