'use strict';
const fs=require('fs'),path=require('path');
const version=process.argv[2],repo=process.argv[3]||process.env.GITHUB_REPOSITORY||'canalescanorff6-source/scout-pro-offline';
if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Versão inválida: '+version);
if(!/^[\w.-]+\/[\w.-]+$/.test(repo))throw Error('owner/repository inválido: '+repo);
const root=path.resolve(__dirname,'..'),p=path.join(root,'package.json'),d=JSON.parse(fs.readFileSync(p));d.version=version;fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
fs.writeFileSync(path.join(root,'web/scout-config.js'),`window.SCOUT_GITHUB_REPO = '${repo}';
window.SCOUT_VERSION = '${version}';
`);
// Toda compilação usa seu próprio identificador de cache. Evita mostrar imagens antigas depois do update.
const swFile=path.join(root,'web/sw.js');
const source=fs.readFileSync(swFile,'utf8');
const updated=source.replace(/const CACHE='scout-pro-[^']+';/,`const CACHE='scout-pro-${version}';`);
if(updated===source && !source.includes(`scout-pro-${version}`)) throw Error('Versão de cache não encontrada em sw.js');
fs.writeFileSync(swFile,updated);
console.log('Versão '+version+' -> '+repo);
