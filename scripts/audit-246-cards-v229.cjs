'use strict';
/* V229: per-card audit of all 246 ORIGINAL pages.
 * Read-only. Doesn't replace, regenerate, or change any player data/build.
 * Flags leftover six competing V72 panels; V229 UI collapses them via common app bridge.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),web=path.join(root,'web');
const master=JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8'));
const files=fs.readdirSync(path.join(web,'fichas')).filter(n=>/^\d{3}_.+\.html$/.test(n)).sort();
assert.equal(master.cards.length,246,'246 cards are mandatory');
assert.equal(files.length,246,'Expected exactly 246 original card HTML files');
const expectedIds=['engenharia','foco','pontos','performance','status','jogar'];
const details=master.cards.slice().sort((a,b)=>a.numero-b.numero);
const issues=[],warnings=[],reports=[];
const script=(html,id)=>{
 const match=html.match(new RegExp('<script\\b(?=[^>]*\\bid=["\\x27]'+id+'["\\x27])[^>]*>([\\s\\S]*?)<\\/script>','i'));
 if(!match)return null;
 try{return JSON.parse(match[1]);}
 catch(e){return {parseError:String(e.message||e)};}
};
const appearances=(source,pattern)=>[...source.matchAll(pattern)].length;
for(let n=1;n<=246;n++){
 const prefix=String(n).padStart(3,'0')+'_';
 const file=files.find(x=>x.startsWith(prefix));
 const masterCard=details[n-1];
 if(!file||!masterCard||Number(masterCard.numero)!==n){
  issues.push({number:n,problem:'Card position missing or ordered incorrectly'});continue;
 }
 const source=fs.readFileSync(path.join(web,'fichas',file),'utf8');
 const card=script(source,'scout-v68-data'),lab=script(source,'lab-data');
 const assetPath='fichas/'+file;
 const expected=String(masterCard.arquivo);
 const issue=problem=>issues.push({number:n,name:masterCard.name,problem});
 const warn=problem=>warnings.push({number:n,name:masterCard.name,problem});
 if(assetPath!==expected)issue('Official catalog path mismatch');
 if(!card||card.parseError)issue('Structured card JSON absent or invalid');
 if(!lab||lab.parseError)issue('Old lab JSON absent or invalid');
 if(card&& !card.parseError){
  if(Number(card.capture)!==n)issue('Embedded capture number differs');
  if(String(card.id)!==String(masterCard.id))issue('Card ID diverges from master catalog');
  if(Number(card.pp)!==Number(masterCard.pp))issue('PP diverges from master catalog');
  if(String(card.name)!==String(masterCard.name))issue('Player name diverges from master catalog');
  if(!Array.isArray(card.recommended_levels)&&Array.isArray(masterCard.niveis))warn('Master reports approved levels but page lacks levels');
  if(Array.isArray(card.recommended_levels)&&card.recommended_levels.length!==10)issue('Ten training groups expected');
 }
 if(!source.includes('../app-bridge.js'))issue("Global curator will not load");
 const ids=expectedIds.map(id=>({
  id,count:appearances(source,new RegExp('\\bid=["\\x27]'+id+'["\\x27]','gi'))
 }));
 for(const item of ids)if(item.count!==1)issue('Legacy section id='+item.id+' occurs '+item.count+' time(s)');
 // Every card formerly carries all 6 sections; a single shared runtime curator archives
 // those exact ORIGINAL DOM nodes without changing recorded attributes or training.
 const legacy=ids.reduce((sum,x)=>sum+x.count,0);
 const pageHasOldBrand=/(?:SCOUT PRO V72|BUILD ENGINE • V72)/.test(source);
 const duplicateTable=appearances(source,/\bid=["']scout-v208-training["']/gi);
 if(duplicateTable)issue('A second training table is hardcoded in the static page');
 if(!source.includes('class="profile-content"'))issue('Profile root absent');
 if(!source.includes('../lab.js'))issue('Legacy advanced lab module absent; shouldn't remove functionality');
 const sectionPreview=expectedIds.filter(id=>ids.some(x=>x.id===id&&x.count===1));
 reports.push({
  number:n,name:String(masterCard.name),file:assetPath,cardId:String(masterCard.id),
  pp:Number(masterCard.pp),registeredTraining:Array.isArray(masterCard.niveis)&&masterCard.niveis.length===10,
  nativeSkillsKnown:Boolean(masterCard.habilidades_nativas),
  legacySectionsFound:sectionPreview,legacyPanels:legacy,oldBrandMarkup:pageHasOldBrand,
  template:'V72 preserved, V220 main sheet with V229 optional archive'
 });
}
assert.equal(reports.length,246,'Every card should have a report');
if(issues.length){
 for(const issue of issues.slice(0,45))console.error('V229 CARTA '+String(issue.number).padStart(3,'0')+': '+issue.problem);
}
const summary={
 version:229,
 audited:reports.length,
 originalCards:master.cards.length,
 distinctCaps:new Set(reports.map(x=>x.number)).size,
 archivedLegacySectionsExpected:reports.reduce((v,x)=>v+x.legacyPanels,0),
 expectedArchivePerCard:6,
 withApprovedLevels:reports.filter(x=>x.registeredTraining).length,
 pendingLevels:reports.filter(x=>!x.registeredTraining).length,
 cardsWithOldV72Markup:reports.filter(x=>x.oldBrandMarkup).length,
 errors:issues.length,warnings:warnings.length,
 policy:'Audit is read-only. Static legacy HTML and gameplay data are preserved; V229 unifies visual display at runtime.'
};
const output=path.resolve(process.env.SCOUT_V229_AUDIT_REPORT||path.join(root,'build','v229-audit-246.json'));
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify({summary,cards:reports,issues,warnings},null,2)+'\n');
console.log('V229 | '+summary.audited+' cartas auditadas; '+summary.archivedLegacySectionsExpected+
 ' seções antigas arquiváveis; '+summary.withApprovedLevels+' builds registradas; '+
 summary.pendingLevels+' sem build validada; '+issues.length+' erros, '+warnings.length+' alertas.');
console.log('Auditoria individual salva em '+output);
if(issues.length)process.exitCode=1;
