'use strict';
/* Gera prova determinística da revisão e dos arquivos web comuns aos dois instaladores. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const version=require(path.join(root,'package.json')).version;
const revision=(process.env.GITHUB_SHA||process.env.SCOUT_GIT_REVISION||'local').trim();
const paths=[
 'outros-elencos-v227.html','craque-friends-v227.js','craque-friends-training-v228.js','craque-friends-training-ui-v228.js','craque-friends-page-v227.js','craque-friends-v227.css','craque-backup-v226.js','craque-backup-ui-v226.js','craque-theme-v226.css','craque-design-v230.css','craque-experience-v232.css','craque-experience-v232.js','craque-role-intelligence-v233.js','craque-role-panel-v233.js','craque-role-panel-v233.css','craque-visual-system-v234.css','conferir-progresso-v248.html','craque-progresso-v248.js','craque-progresso-v248.css','craque-progress-consistency-v249.js','craque-progress-consistency-v249.css','craque-progress-transfer-v250.js','craque-progress-transfer-v250.css','craque-ficha-individual-v251.js','craque-ficha-individual-v251.css','craque-match-evidence-v256.js','craque-card-effects-v234.css','craque-card-effects-v234.js','craque-impetos-ptbr-v230.js','craque-training-icons-v230.js','craque-tactics-v230.js','craque-lineup-profiles-v231.js','craque-formation-ui-v230.js','assets/craque-tatico-icon.svg','assets/craque-tatica.svg','assets/craque-analise.svg','assets/craque-desempenho.svg','assets/craque-elenco.svg','assets/craque-resultados.svg','meu-time-testes-v219.html','scout-roster-restrictions-v222.js','scout-player-identity-v245.js','scout-position-training-v246.js','scout-position-training-v246.css','craque-bench-advisor-v247.js','scout-rotation-engine-v219.js','scout-rotation-lab-v219.js','scout-rotation-lab-v219.css','sw.js','index.html','premium.css','scout-premium-v73.css','app-bridge.js','app-bridge.css',
 'scout-profile-v188.js','scout-profile-v188.css','scout-ui-v189.js','scout-ui-v189.css','scout-polish-v190.css','scout-visual-v192.css','scout-finish-v197.css','scout-finish-v197.js','scout-finish-v198.css','scout-finish-v198.js','scout-finish-v200.css','scout-training-icons-v201.css','scout-training-icons-v201.js','scout-training-icons-v206.css','scout-training-icons-v206.js','scout-individual-v207.css','scout-individual-v207.js','scout-training-reference-v208.css','scout-training-reference-v208.js','scout-training-unified-v218.js','scout-multitactic-engine-v220.js','scout-card-unified-v220.js','scout-card-curation-v229.js','scout-card-curation-v229.css','scout-card-unified-v220.css','scout-evidence-review-v221.js','scout-evidence-review-v221.css','SCOUT_V221_EVIDENCE_INDEX.json','scout-training-unified-v218.css','scout-theme-v210.css','scout-build-audit-v211.js','scout-dossier-v212.css','scout-dossier-v212.js','scout-evidence-v215.js','scout-evidence-v215.css','SCOUT_V211_REPETICOES_REVIEW.json','scout-finish-v202.css','scout-finish-v203.css','scout-finish-v203.js','scout-finish-v204.css','scout-finish-v205.css','scout-finish-v205.js',
 'skills-booster-v162.js','skill-names-v196.js','booster-engine-v103.js','SCOUT_V69_AUDITORIA.json','SCOUT_V213_AUDITORIA_INDIVIDUAL.json',
 'SCOUT_V101_MODELO_CORPORAL.json','SCOUT_V184_EFHUB_241_COMPLETE.json',
 'SCOUT_V188_EFHUB_BOOSTERS_241.json','SCOUT_V189_CORPO_EXTRAS.json'
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
