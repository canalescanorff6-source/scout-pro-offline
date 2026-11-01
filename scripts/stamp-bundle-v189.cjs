'use strict';
/* Gera prova determinística da revisão e dos arquivos web comuns aos dois instaladores. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const version=require(path.join(root,'package.json')).version;
const revision=(process.env.GITHUB_SHA||process.env.SCOUT_GIT_REVISION||'local').trim();
// O Service Worker precisa de uma identidade nova a CADA release.
// Sem isso, o cache-first pode servir telas V73/V353 mesmo após instalar
// um aplicativo mais novo. Use a mesma versão/revisão para Android e Windows.
const swPath=path.join(web,'sw.js');
const swContent=fs.readFileSync(swPath,'utf8');
const cacheName='craque-tatico-'+version+'-'+revision.slice(0,12).replace(/[^a-zA-Z0-9_-]/g,'');
const cacheDeclaration=/^const CRAQUE_RELEASE_CACHE='[^']+';/m;
if(!cacheDeclaration.test(swContent))throw Error('Declaração CACHE ausente no Service Worker');
const swUpdated=swContent.replace(cacheDeclaration,"const CRAQUE_RELEASE_CACHE='"+cacheName+"';");
if(swUpdated!==swContent)fs.writeFileSync(swPath,swUpdated);

const paths=['conferir-cartas.html','craque-card-review-v379.js','craque-card-review-ui-v379.js','craque-card-review-v379.css','craque-main-sheet-v378.js','craque-main-layout-v378.js','craque-main-sheet-v378.css','craque-identity-archive-v377.js','ct377-identity-corrections.json',
 'craque-rating-v376.js','craque-rating-context-v376.js','craque-rating-ui-v376.js','craque-rating-ui-v376.css','ct376-card-references.json','ct376-rating-model.json',
 'outros-elencos-v227.html','craque-friends-v227.js','craque-pp-universal-v309.js','craque-friends-training-v228.js','craque-positional-v311.js','craque-manager-fichas-v324.js','craque-formation-context-v314.js','craque-positional-ui-v311.js','craque-ficha-decision-v327.js','craque-frontier-context-v339.js','craque-manager-selector-v328.js','craque-positional-v311.css','craque-formation-context-v314.css','craque-friends-training-ui-v228.js','craque-friends-page-v227.js','craque-bruno-v304.js','craque-sete-v357.js','craque-friends-v227.css','craque-backup-v226.js','craque-backup-ui-v226.js','craque-theme-v226.css','craque-design-v230.css','craque-premium-interiors-v352.css','craque-premium-workspaces-v353.css','craque-ux-lite-v360.css','craque-detail-focus-v360.js','craque-visual-rebuild-v361.css','craque-visual-rebuild-v361.js','craque-app-shell-v362.css','craque-app-shell-v362.js','ct364-owned-main.css','ct364-owned-main.js','ct364-owned-cards.json','cartas/novas/ct364_Karetsas.webp','cartas/novas/ct364_Nwaneri.webp','cartas/novas/ct364_Jobe_Bellingham.webp','cartas/novas/ct364_Schlotterbeck.webp','cartas/novas/ct364_Ryerson.webp','cartas/novas/ct364_Anton.webp','cartas/novas/ct364_Kobel.webp','cartas/novas/ct364_Svensson.webp','cartas/novas/ct364_Guirassy.webp','cartas/novas/ct364_Nmecha.webp','cartas/novas/ct364_Ezequiel.webp','cartas/novas/ct364_Provedel.webp','cartas/novas/ct364_Pavlovic.webp','cartas/novas/ct364_Forlan.webp','cartas/novas/ct364_Gadou.webp','craque-friends-focus-v363.css','lote-8-conferencia.html','lote-9-cadastro.html','raridade-cadastro-v91.html','craque-experience-v232.css','craque-experience-v232.js','craque-role-intelligence-v233.js','craque-role-panel-v233.js','craque-role-panel-v233.css','craque-visual-system-v234.css','conferir-progresso-v248.html','craque-progresso-v248.js','craque-progresso-v248.css','craque-progress-consistency-v249.js','craque-progress-consistency-v249.css','craque-progress-transfer-v250.js','craque-progress-transfer-v250.css','craque-ficha-individual-v251.js','craque-ficha-individual-v251.css','craque-card-effects-v234.css','craque-card-effects-v234.js','craque-impetos-ptbr-v230.js','craque-training-icons-v230.js','craque-tactics-v230.js','craque-lineup-profiles-v231.js','craque-formation-ui-v230.js','assets/craque-tatico-icon.svg','assets/craque-tatica.svg','assets/craque-analise.svg','assets/craque-desempenho.svg','assets/craque-elenco.svg','assets/craque-resultados.svg','meu-time-testes-v219.html','scout-roster-restrictions-v222.js','scout-player-identity-v245.js','scout-position-training-v246.js','scout-position-training-v246.css','craque-bench-advisor-v247.js','scout-rotation-engine-v219.js','scout-rotation-lab-v219.js','scout-rotation-lab-v219.css','craque-lineup-focus-v330.js','craque-lineup-focus-v330.css','sw.js','index.html','craque-ui-bootstrap-v351.js','premium.css','scout-premium-v73.css','app-bridge.js','app-bridge.css',
 'scout-profile-v188.js','scout-profile-v188.css','scout-ui-v189.js','scout-ui-v189.css','scout-polish-v190.css','scout-visual-v192.css','scout-finish-v197.css','scout-finish-v197.js','scout-finish-v198.css','scout-finish-v198.js','scout-finish-v200.css','scout-training-icons-v201.css','scout-training-icons-v201.js','scout-training-icons-v206.css','scout-training-icons-v206.js','scout-individual-v207.css','scout-individual-v207.js','scout-training-reference-v208.css','scout-training-reference-v208.js','scout-training-unified-v218.js','scout-multitactic-engine-v220.js','craque-managers-v302.js','craque-managers-v302.css','craque-managers-v306.css','craque-managers-v307.css','craque-manager-hub-v307.js','tecnicos-v307.html','craque-style-planner-v303.js','scout-card-unified-v220.js','scout-card-curation-v229.js','scout-card-curation-v229.css','scout-card-unified-v220.css','scout-evidence-review-v221.js','scout-evidence-review-v221.css','SCOUT_V221_EVIDENCE_INDEX.json','scout-training-unified-v218.css','scout-theme-v210.css','scout-build-audit-v211.js','scout-dossier-v212.css','scout-dossier-v212.js','scout-evidence-v215.js','scout-evidence-v215.css','SCOUT_V211_REPETICOES_REVIEW.json','scout-finish-v202.css','scout-finish-v203.css','scout-finish-v203.js','scout-finish-v204.css','scout-finish-v205.css','scout-finish-v205.js',
 'skills-booster-v162.js','skill-names-v196.js','booster-engine-v103.js','SCOUT_V69_AUDITORIA.json','SCOUT_V213_AUDITORIA_INDIVIDUAL.json',
 'SCOUT_V101_MODELO_CORPORAL.json','SCOUT_V184_EFHUB_241_COMPLETE.json',
 'SCOUT_V188_EFHUB_BOOSTERS_241.json','SCOUT_V189_CORPO_EXTRAS.json',
 // Atualizadores, navegação Premium e PWA precisam participar da mesma prova.
 'premium.js','pwa.js','scout-config.js','position-order.js','lab.js','manifest.webmanifest'
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
