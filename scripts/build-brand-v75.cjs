'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'web/assets'),svg=fs.readFileSync(path.join(assets,'craque-tatico-icon.svg'));
(async()=>{
 const sizes=[16,32,48,64,72,96,144,192,256,512],pngs=new Map();
 for(const n of sizes)pngs.set(n,await sharp(svg).resize(n,n).png().toBuffer());
 for(const n of [192,512])fs.writeFileSync(path.join(assets,'icon-'+n+'.png'),pngs.get(n));
 const chosen=[16,32,48,256],h=Buffer.alloc(6+16*chosen.length);
 h.writeUInt16LE(0,0);h.writeUInt16LE(1,2);h.writeUInt16LE(chosen.length,4);
 let off=h.length;
 for(let i=0;i<chosen.length;i++){
  const n=chosen[i],buf=pngs.get(n),p=6+i*16;
  h.writeUInt8(n===256?0:n,p);h.writeUInt8(n===256?0:n,p+1);
  h.writeUInt16LE(1,p+4);h.writeUInt16LE(32,p+6);
  h.writeUInt32LE(buf.length,p+8);h.writeUInt32LE(off,p+12);off+=buf.length;
 }
 fs.writeFileSync(path.join(assets,'icon.ico'),Buffer.concat([h,...chosen.map(x=>pngs.get(x))]));
 for(const [folder,size] of [['mipmap-mdpi',48],['mipmap-hdpi',72],['mipmap-xhdpi',96],['mipmap-xxhdpi',144],['mipmap-xxxhdpi',192]]){
  const loc=path.join(root,'resources/android',folder);fs.mkdirSync(loc,{recursive:true});
  for(const name of ['ic_launcher.png','ic_launcher_round.png'])fs.writeFileSync(path.join(loc,name),pngs.get(size));
 }
 const android=path.join(root,'resources/android');fs.writeFileSync(path.join(android,'scout_foreground.png'),pngs.get(512));
 console.log('Craque Tático V226: ícones Android, Windows e PWA gerados a partir do brasão.');
})().catch(e=>{console.error(e);process.exit(1)});
