'use strict';
const a=require('node:assert/strict'),fs=require('node:fs');
for(const file of ['plano-do-time-v382.html','craque-team-plan-v382.js','craque-team-plan-v382.css','craque-account-ui-v382.js'])a(fs.existsSync('web/'+file),file);
const html=fs.readFileSync('web/plano-do-time-v382.html','utf8');
for(const id of ['account','manager','style','family','formation','pitch','lineup','results','history','import-account','roster','card-editor'])a(html.includes('id="'+id+'"'),id);
const sw=fs.readFileSync('web/sw.js','utf8'),stamp=fs.readFileSync('scripts/stamp-bundle-v189.cjs','utf8');
for(const file of ['plano-do-time-v382.html','craque-team-plan-v382.js','craque-accounts-v382.js','craque-team-context-v382.js','craque-functional-rules-v382.js','ct382-formations.json']){a(sw.includes(file),'offline '+file);a(stamp.includes(file),'bundle '+file);}
a(fs.readFileSync('web/app-bridge.js','utf8').includes('craque-account-ui-v382.js'));
console.log('V382 UI CONTRACT PASS: contas, edição, workspace e arquivos offline integrados.');
