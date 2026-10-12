'use strict';
/* Official Android signer: stable certificate stored as encrypted PKCS12 + one GitHub secret.
   Do not print the secret, passwords, unencrypted key, or command environment. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const enc=JSON.parse(fs.readFileSync(path.join(root,'.github/android-signing/scout-release.enc.json'),'utf8'));
const packageId='br.com.scoutpro.offline';
const expectedCert='818a2b4144234810b9e6e68bddb1ccb1cf9f3b6636dcc0adc31536a4fec02c04';
function check(){
 assert.equal(enc.format,'scout-pro-android-encrypted-keystore-v1');
 assert.equal(enc.applicationId,packageId);
 assert.equal(enc.algorithm,'aes-256-gcm');
 assert.equal(enc.aad,'SCOUTPRO|'+packageId+'|v1');
 assert.equal(enc.keyAlias,'scoutpro');
 assert.equal(enc.certificateSha256,expectedCert);
 for(const key of ['iv','tag','ciphertext'])assert.equal(typeof enc[key],'string');
 assert.equal(Buffer.from(enc.iv,'base64').length,12);
 assert.equal(Buffer.from(enc.tag,'base64').length,16);
 assert(Buffer.from(enc.ciphertext,'base64').length>600);
 const config=JSON.parse(fs.readFileSync(path.join(root,'capacitor.config.json'),'utf8'));
 assert.equal(config.appId,packageId);
}
function derive(label,master){return crypto.createHash('sha256').update(label+'\0'+master,'utf8').digest()}
function opensslTools(){
 const sdk=process.env.ANDROID_HOME||process.env.ANDROID_SDK_ROOT;
 if(!sdk)throw Error('Android SDK ausente');
 const root=path.join(sdk,'build-tools');
 const versions=fs.readdirSync(root).filter(name=>/^\d/.test(name)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
 if(!versions.length)throw Error('Android Build Tools ausentes');
 const build=path.join(root,versions[versions.length-1]);
 const align=path.join(build,'zipalign'),signer=path.join(build,'apksigner');
 if(!fs.existsSync(align)||!fs.existsSync(signer))throw Error('zipalign/apksigner ausentes');
 return {align,signer};
}
function recover(master){
 if(!/^[A-Za-z0-9_-]{40,90}$/.test(master||''))throw Error('ANDROID_RELEASE_SECRET ausente ou inválido');
 const key=derive('SCOUTPRO-ANDROID/keystore-v1',master);
 const password=derive('SCOUTPRO-ANDROID/password-v1',master).toString('hex').slice(0,48);
 const decipher=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(enc.iv,'base64'));
 decipher.setAAD(Buffer.from(enc.aad,'utf8'));
 decipher.setAuthTag(Buffer.from(enc.tag,'base64'));
 const secret=Buffer.concat([decipher.update(Buffer.from(enc.ciphertext,'base64')),decipher.final()]);
 if(secret.length<600)throw Error('Keystore inválida');
 return {secret,password};
}
function certCheck(keystore,password){
 const out=cp.execFileSync('keytool',['-list','-v','-keystore',keystore,'-storepass:env','SCOUT_SIGN_PASSWORD','-alias',enc.keyAlias],{encoding:'utf8',env:{...process.env,SCOUT_SIGN_PASSWORD:password},stdio:['ignore','pipe','pipe']});
 const match=out.match(/SHA256:\s*([0-9a-f:]+)/i);
 if(!match||match[1].replace(/:/g,'').toLowerCase()!==expectedCert)throw Error('Certificado da chave diferente da identidade fixa do Scout PRO');
}
function run(){
 check();
 const mode=process.argv[2]||'check';
 if(mode==='check'){process.stdout.write('V99 OK: identidade pública fixa, chave protegida e identificador do Android verificados.\n');return}
 if(!['verify-key','sign'].includes(mode))throw Error('Uso: check | verify-key | sign');
 const {secret,password}=recover(process.env.ANDROID_RELEASE_SECRET);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'scout-sign-')),keystore=path.join(dir,'release.p12');
 try{
  fs.writeFileSync(keystore,secret,{mode:0o600});
  certCheck(keystore,password);
  if(mode==='verify-key'){process.stdout.write('V99: chave privada recuperada e certificado fixo conferido. Nenhum APK publicado.\n');return}
  const src=path.join(root,'android/app/build/outputs/apk/release/app-release-unsigned.apk');
  if(!fs.existsSync(src))throw Error('APK release unsigned não compilado');
  const folder=path.join(root,'release-out');fs.mkdirSync(folder,{recursive:true});
  const temp=path.join(dir,'aligned.apk'),out=path.join(folder,'ScoutPRO-Android.apk');
  const {align,signer}=opensslTools();
  cp.execFileSync(align,['-f','4',src,temp],{stdio:'pipe'});
  const signerEnv={...process.env,SCOUT_SIGN_PASSWORD:password};
  cp.execFileSync(signer,['sign','--ks',keystore,'--ks-type','PKCS12','--ks-key-alias',enc.keyAlias,'--ks-pass','env:SCOUT_SIGN_PASSWORD','--key-pass','env:SCOUT_SIGN_PASSWORD','--out',out,temp],{env:signerEnv,stdio:'pipe'});
  const proof=cp.execFileSync(signer,['verify','--verbose','--print-certs',out],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
  const signerLine=proof.split(/\r?\n/).find(line=>/Signer\s*#1\s*certificate\s*SHA[- ]?256\s*digest\s*:/i.test(line));
  const actualCertificate=signerLine?(signerLine.split(/digest\s*:/i)[1]||'').replace(/[^0-9a-f]/gi,'').toLowerCase():'';
  if(actualCertificate!==expectedCert){
    fs.rmSync(out,{force:true});
    const info=actualCertificate?'digit count '+actualCertificate.length+', prefix '+actualCertificate.slice(0,12):'certificate digest line not found';
    throw Error('Android signing certificate validation failed ('+info+'). The signing check remains enforced.');
  }
  const sha=crypto.createHash('sha256').update(fs.readFileSync(out)).digest('hex');
  fs.writeFileSync(path.join(folder,'ScoutPRO-Android.apk.sha256'),sha+'  ScoutPRO-Android.apk\n');
  process.stdout.write('APK Android de release assinado com certificado permanente, SHA256 e verificação apksigner OK.\n');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
try{run()}catch(e){process.stderr.write('Falha na assinatura oficial: '+e.message+'\n');process.exitCode=1}
