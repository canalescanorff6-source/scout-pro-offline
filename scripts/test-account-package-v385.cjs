'use strict';const a=require('node:assert/strict'),fs=require('node:fs');
for(const file of ['craque-account-library-v385.js','craque-account-catalog-v385.js','craque-account-catalog-v385.css','craque-account-editor-v385.js','craque-account-sheet-v385.js','ficha-da-conta-v385.html']){
 a(fs.existsSync('web/'+file),file);a(fs.readFileSync('web/sw.js','utf8').includes('./'+file),'Cache offline: '+file);a(fs.readFileSync('scripts/stamp-bundle-v189.cjs','utf8').includes("'"+file+"'"),'Paridade: '+file);a(fs.readFileSync('scripts/verify-android-premium-payload-v356.py','utf8').includes('"'+file+'"'),'Verificação do APK: '+file);}
console.log('V385 PACKAGE PASS: catálogo, editor e fichas nas duas plataformas/offline.');
