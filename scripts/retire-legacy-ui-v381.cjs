'use strict';
/**
 * V381 — Retirada do HTML visual antigo no bundle distribuído.
 *
 * Transformação determinística e idempotente do texto de APRESENTAÇÃO.
 * Nunca modifica JSON das cartas, scripts, dados de PP, HTML estrutural,
 * IDs, atributos de navegação nem as próprias imagens dos jogadores.
 * Aplica-se a todas as 246 fichas e às rotas HTML da raiz antes dos builds.
 */
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..','web');
const LEGACY_LOGO=/scout-pro-icon-premium-original\.png/i;
const MASK=/<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>/gi;
function cleanVisibleText(t){
 return t.replace(/\bSCOUT\s+PRO\b/gi,'CRAQUE TÁTICO')
  .replace(/\bBUILD ENGINE\b/gi,'LABORATÓRIO DE FUTEBOL')
  .replace(/\s*[·•|—-]\s*V\d+\b/gi,'')
  .replace(/\bV\d+\s*[·•|—-]\s*/gi,'')
  .replace(/\bV\d+\b/gi,'')
  .replace(/\s{2,}/g,' ')
  .replace(/\s+([<.,;:])/g,'$1');
}
function rewrite(source,card=false){
 const masked=[];
 let html=source.replace(MASK,part=>{
  const idx=masked.push(part)-1;
  return '<!--CRAQUE_MASK_'+idx+'_END-->';
 });
 // O título e os cabeçalhos não devem anunciar uma versão histórica do app.
 html=html.replace(/(<title\b[^>]*>)([\s\S]*?)(<\/title>)/gi,
  (_,a,t,z)=>a+cleanVisibleText(t)+z);
 html=html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi,header=>{
  let h=header.replace(/(<img\b[^>]*\bsrc=["'][^"']*)scout-pro-icon-premium-original\.png/gi,
    (_,a)=>a+'craque-tatico-icon.svg');
  h=h.replace(/<span class=["']brand-logo["']>\s*S\s*<\/span>/gi,
   '<img class="brand-logo-img" src="'+(card?'../':'')+'assets/craque-tatico-icon.svg" alt="Craque Tático">');
  h=h.replace(/(<small\b[^>]*>)([\s\S]*?)(<\/small>)/gi,(_,a,t,z)=>
    a+cleanVisibleText(t)+z);
  h=h.replace(/>([^<>]+)</g,(_,t)=>'>'+cleanVisibleText(t)+'<');
  return h;
 });
 // Menus e textos históricos da página podem dizer SCOUT PRO/V72; nunca
 // fazer replace dentro de JSON/scripts/styles/atributos: só nos nós de texto.
 html=html.replace(/>([^<>]+)</g,(_,t)=>'>'+cleanVisibleText(t)+'<');
 return html.replace(/<!--CRAQUE_MASK_(\d+)_END-->/g,(_,n)=>masked[Number(n)]);
}
function run(root=ROOT){
 const pages=fs.readdirSync(root).filter(n=>n.endsWith('.html'));
 const dir=path.join(root,'fichas');
 const cards=fs.readdirSync(dir).filter(n=>/^\d{3}_.*\.html$/.test(n));
 if(cards.length!==246)throw Error('Esperadas 246 fichas; encontradas '+cards.length);
 let updated=0;
 for(const [folder,list,card] of [[root,pages,false],[dir,cards,true]]){
  for(const file of list){
   const dest=path.join(folder,file),before=fs.readFileSync(dest,'utf8');
   const after=rewrite(before,card);
   if(after!==before){fs.writeFileSync(dest,after);updated++;}
  }
 }
 const result={pages:pages.length,cards:cards.length,updated};
 console.log('UI V381 source:',JSON.stringify(result));
 return result;
}
module.exports={rewrite,run,cleanVisibleText};
if(require.main===module)run();
