'use strict';
// Backup for electron-builder versions that don't emit latest.yml for --publish never.
// The workflow publishes both files TOGETHER only after Android signing and CI pass.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),pkg=require(path.join(root,'package.json'));
const dir=path.join(root,'dist'),target=path.join(dir,'latest.yml');
if(fs.existsSync(target)){
  const s=fs.readFileSync(target,'utf8');
  if(!s.includes('version: '+pkg.version))throw Error('latest.yml não corresponde ao instalador '+pkg.version);
  console.log('electron-builder já gerou latest.yml para '+pkg.version);
  process.exit(0);
}
const exe=`ScoutPRO-Setup-${pkg.version}.exe`,p=path.join(dir,exe);
if(!fs.existsSync(p))throw Error('Instalador Windows não encontrado: '+p);
const bytes=fs.readFileSync(p),sha=crypto.createHash('sha512').update(bytes).digest('base64');
// Conservative full installer download when a .blockmap is absent.
const yml=`version: ${pkg.version}\nfiles:\n  - url: ${exe}\n    sha512: ${sha}\n    size: ${bytes.length}\npath: ${exe}\nsha512: ${sha}\nreleaseDate: '${new Date().toISOString()}'\n`;
fs.writeFileSync(target,yml);
console.log('Criado latest.yml para '+exe+' com SHA512 verificado.');
