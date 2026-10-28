'use strict';
/* Compare latest.yml with the actual Windows setup EXE and blockmap.
 * This script neither signs nor modifies any release artifact. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const os=require('node:os');

function scalar(v){return String(v||'').trim().replace(/^(?:'([^']*)'|"([^"]*)")$/,(m,a,b)=>a??b)}
function topLevel(text,key){
  const line=text.split(/\r?\n/).find(row=>row.startsWith(key+':'));
  return line===undefined?null:scalar(line.slice(key.length+1));
}
function entries(text){
  const out=[];let current=null,inFiles=false;
  for(const line of text.split(/\r?\n/)){
    if(line==='files:'){inFiles=true;continue}
    if(inFiles && line && !/^\s/.test(line)){inFiles=false;current=null}
    if(!inFiles)continue;
    const start=line.match(/^  - url:\s*(.*)$/);
    if(start){current={url:scalar(start[1])};out.push(current);continue}
    const field=line.match(/^    (sha512|size):\s*(.*)$/);
    if(field&&current)current[field[1]]=scalar(field[2]);
  }
  return out;
}
function validDigest(value){
  if(typeof value!=='string'||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))return false;
  try{const bytes=Buffer.from(value,'base64');return bytes.length===64&&bytes.toString('base64')===value}catch{return false}
}
async function digest(file){
  const hash=crypto.createHash('sha512');
  for await(const chunk of fs.createReadStream(file))hash.update(chunk);
  return hash.digest('base64');
}
async function verify(dir,expectedVersion){
  const manifest=path.join(dir,'latest.yml');
  if(!fs.statSync(manifest).isFile())throw Error('latest.yml ausente');
  const text=fs.readFileSync(manifest,'utf8');
  const version=topLevel(text,'version');
  if(!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('Versão inválida em latest.yml');
  if(expectedVersion&&version!==expectedVersion)throw Error(`Versão divergente: ${version} versus ${expectedVersion}`);
  const name=`ScoutPRO-Setup-${version}.exe`;
  if(topLevel(text,'path')!==name)throw Error('path do latest.yml não corresponde ao instalador');
  const files=entries(text);
  if(files.length!==1||files[0].url!==name)throw Error('files[].url não aponta unicamente ao instalador esperado');
  const local=path.join(dir,name);
  const stats=fs.statSync(local);
  if(!stats.isFile()||stats.size===0)throw Error('Instalador Windows ausente ou vazio');
  const blockmap=fs.statSync(local+'.blockmap');
  if(!blockmap.isFile()||blockmap.size===0)throw Error('blockmap ausente ou vazio');
  if(!/^\d+$/.test(files[0].size||'')||Number(files[0].size)!==stats.size)throw Error('Tamanho do instalador diverge do latest.yml');
  const topDigest=topLevel(text,'sha512'),fileDigest=files[0].sha512;
  if(!validDigest(topDigest)||!validDigest(fileDigest)||topDigest!==fileDigest)throw Error('SHA512 inválido ou divergente no manifesto');
  const actual=await digest(local);
  if(actual!==topDigest)throw Error('SHA512 do instalador difere do latest.yml');
  return {version,installer:name,size:stats.size,sha512:actual};
}
async function selfTest(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'craque-win-manifest-'));
  try{
    const version='1.1.999',name=`ScoutPRO-Setup-${version}.exe`;
    const exe=path.join(dir,name),manifest=path.join(dir,'latest.yml');
    fs.writeFileSync(exe,Buffer.from('teste-ficticio-sem-executavel-real'));
    fs.writeFileSync(exe+'.blockmap','fixture de teste');
    const sha=await digest(exe);
    const good=`version: ${version}\nfiles:\n  - url: ${name}\n    sha512: ${sha}\n    size: ${fs.statSync(exe).size}\npath: ${name}\nsha512: ${sha}\nreleaseDate: '2026-01-01T00:00:00.000Z'\n`;
    fs.writeFileSync(manifest,good);
    assert.equal((await verify(dir,version)).version,version);
    await assert.rejects(()=>verify(dir,'1.1.998'),/Versão divergente/);
    fs.writeFileSync(manifest,good.replace('path: '+name,'path: anterior.exe'));
    await assert.rejects(()=>verify(dir,version),/path/);
    fs.writeFileSync(manifest,good.replace('size: '+fs.statSync(exe).size,'size: 99'));
    await assert.rejects(()=>verify(dir,version),/Tamanho/);
    fs.writeFileSync(manifest,good.replace('sha512: '+sha,'sha512: '+Buffer.alloc(64,1).toString('base64')));
    await assert.rejects(()=>verify(dir,version),/SHA512/);
    fs.writeFileSync(manifest,good);
    fs.appendFileSync(exe,'corrupcao');
    await assert.rejects(()=>verify(dir,version),/Tamanho/);
    fs.writeFileSync(exe,Buffer.from('teste-ficticio-sem-executavel-real'));
    fs.unlinkSync(exe+'.blockmap');
    await assert.rejects(()=>verify(dir,version),/blockmap/);
    console.log('PASS: latest.yml válido; versão, URL, tamanho, SHA512, adulteração e blockmap inválidos bloqueados.');
  }finally{fs.rmSync(dir,{recursive:true,force:true})}
}
if(require.main===module){
  const argv=process.argv.slice(2);
  const run=argv.includes('--self-test')?selfTest():verify(
    path.resolve(argv.includes('--dir')?argv[argv.indexOf('--dir')+1]:'dist'),
    argv.includes('--version')?argv[argv.indexOf('--version')+1]:null
  ).then(x=>console.log(`PASS: latest.yml ${x.version}, ${x.installer}, ${x.size} bytes, SHA512 confere.`));
  run.catch(e=>{console.error('FALHA: '+e.message);process.exitCode=1});
}
module.exports={verify,entries,topLevel};
