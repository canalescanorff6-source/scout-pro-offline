'use strict';
/* Aplica somente a revisão autorizada de níveis/PP; preserva campos anteriores. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const V=require('../web/craque-level-review-v381.js'),P=require('../web/craque-positional-v311.js');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const clone=x=>structuredClone(x),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const patch=(before,after)=>{const fields=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>!eq(before[k],after[k]));
 return {fields,before:Object.fromEntries(fields.filter(k=>Object.hasOwn(before,k)).map(k=>[k,before[k]])),after:Object.fromEntries(fields.filter(k=>Object.hasOwn(after,k)).map(k=>[k,after[k]]))};};
const block=(html,id)=>{const pattern=new RegExp('(<script\\b(?=[^>]*\\bid=["\\\']'+id+'["\\\'])[^>]*>)([\\s\\S]*?)(<\\/script>)','i');
 const m=html.match(pattern);if(!m)throw Error('Metadado ausente: '+id);return {pattern,value:JSON.parse(m[2]),prefix:m[1],suffix:m[3]};};
function build(folder,web){
 const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
 const roster=read(path.join(web,'SCOUT_V69_AUDITORIA.json')),own=read(path.join(web,'ct364-owned-cards.json')),
  references=read(path.join(web,'ct376-card-references.json')),sources=read(path.join(folder,'sources.json')),
  visuals=read(path.join(folder,'missing-editions-evidence.json')).cards;
 const ownerFile=path.join(folder,'owner-level-reports.json'),ownerReports=fs.existsSync(ownerFile)?read(ownerFile):[];
 const archive={schema:'CRAQUE_LEVEL_CORRECTIONS_V381',date:'2026-11-01',
  authorization:'Proprietário solicitou conferir/corrigir todos os níveis e PP e refazer as fichas em 31/10/2026.',
  beforeCatalogueSha256:hash(JSON.stringify(roster,null,2)+'\n'),beforeSummary:clone(roster.summary),originals:[],owned:[],references:[]};
 const audit={schema:'CRAQUE_LEVEL_AUDIT_V381',date:'2026-11-01',cards:[]},files=[];
 const supplementFor=(key,id)=>{const cap=key==='ct364-13'?'ct364-13':key.slice(4),file=path.join(folder,'supplement-'+cap+'.html');
  if(!fs.existsSync(file))return null;const html=fs.readFileSync(file,'utf8'),max=html.match(/"maxLevel"\s*:\s*(\d+)/);
  if(!max||!html.includes(id))return null;const ref=references.cards.find(r=>r.key===key);
  return {id,maxLevel:Number(max[1]),url:ref?.reference?.url,sha256:hash(html)};};
 const all=[...roster.cards.map(c=>({key:'cap:'+c.numero,card:c,owned:false})),...own.cards.map(c=>({key:c.key,card:c,owned:true}))];
 for(const target of all){const c=target.card,r=references.cards.find(r=>r.key===target.key),visual=visuals.find(v=>v.cap===c.numero&&v.matchStatus==='exact_artwork_match');
  const id=String(target.owned?(c.cardId||r?.candidateId||''):c.id),source=sources.find(s=>s.id===id);
  let decision=V.decide({numero:c.numero,id,name:c.name,versao:c.versao,max_level:target.owned?c.maxLevel:c.max_level,pp:c.pp,pp_origem:c.pp_origem},r?.identityUsable===true?source:null,
   {ownerReport:target.owned?null:ownerReports.find(x=>x.capture===c.numero),identityUsable:r?.identityUsable===true,
    supplement:supplementFor(target.key,id),capture:c.numero===41?{capture:41,cardId:'105837389528906',level:32,automaticallyDisplayed:true,source:'Captura eFHUB e resposta explícita do proprietário em 31/10/2026'}:null});
  let artwork=null,sourceId=id,sourceUrl=source?.url,sourceHash=source?.sha256;
  if(decision.status==='pending'&&visual){
   const image=path.join(web,path.relative(web,visual.localImage));
   if(!path.resolve(image).startsWith(path.resolve(web)+path.sep)||hash(fs.readFileSync(image))!==visual.localImageSha256)throw Error('Arte mudou: '+target.key);
   sourceId=visual.candidateId;sourceUrl=visual.url;sourceHash=visual.htmlSha256;
   decision=V.decide({numero:c.numero,id:sourceId,name:c.name,pp:c.pp,max_level:c.max_level},
    {id:sourceId,url:sourceUrl,sha256:sourceHash,data:{cardId:sourceId,levelCap:visual.maxLevel,playerType:visual.data.playerType}});
   artwork={image:path.relative(web,image).replace(/\\/g,'/'),sha256:visual.localImageSha256,publicImage:visual.publicImageUrl,publicImageSha256:visual.publicImageSha256};
  }
  const entry={key:target.key,capture:target.owned?null:c.numero,name:c.name,edition:target.owned?c.edition:c.versao,
   catalogueId:target.owned?String(c.cardId||''):String(c.id),sourceCardId:sourceId,sourceUrl,sourceHash,
   beforeLevel:target.owned?c.maxLevel??null:c.max_level??null,beforePP:c.pp,decision,...(artwork?{artwork}:{}),
   accountConfirmed:false};audit.cards.push(entry);
  if(decision.status!=='reviewed')continue;
  const levelKey=target.owned?'maxLevel':'max_level',changed=c[levelKey]!==decision.maxLevel||c.pp!==decision.pp;
  if(changed||decision.sourceKind==='owner_efhub_report'){const before=clone(c),oldPP=c.pp;c[levelKey]=decision.maxLevel;c.pp=decision.pp;
   const proof={kind:'revisao_nivel_v381',source_kind:decision.sourceKind,url:decision.url,card_id:sourceId,previous_pp:oldPP,
    confirmed_in_game:false,...(decision.ownerSource?{owner_source:decision.ownerSource}:{}),
    ...(decision.identityPending?{identity_pending:true}:{}),...(decision.conflict?{public_level:decision.publicLevel,owner_capture_level:decision.maxLevel,conflict:true}:{})};
   if(target.owned)c.progressReview=proof;
   else {c.pp_origem=decision.sourceKind==='owner_efhub_report'?'informado_pelo_usuario_efhub_2026-11-01':'catalogo_publico_efhub_2026-10-31';c.pp_estimado=false;c.nivel_referencia=proof;
    if(oldPP!==c.pp){c.niveis=null;if(Object.hasOwn(c,'treino_proposto_nao_validado'))c.treino_proposto_nao_validado=false;}
    const file=path.join(web,c.arquivo),html=fs.readFileSync(file,'utf8'),raw=block(html,'scout-v68-data'),lab=block(html,'lab-data'),rawBefore=clone(raw.value),labBefore=clone(lab.value);
    Object.assign(raw.value,{pp:c.pp,max_level:c.max_level,pp_origem:c.pp_origem,pp_estimated:false,nivel_referencia:proof});
    if(oldPP!==c.pp){raw.value.recommended_levels=null;raw.value.alternate_scenarios={};raw.value.recommended_scenario=null;
     Object.assign(lab.value,{pp:c.pp,ppEstimated:false,A:null,B:null,C:null,P:null,recommended:null});
     const model=P.fromPersonal(c),proposal=P.compute(model,model.position,'posse').outcome.plan.levels;
     lab.value.draftA=proposal;lab.value.draftStatus='Proposta com PP revisados; treino anterior arquivado, sem confirmação de aplicação.';
    }
    const changedHtml=html.replace(raw.pattern,()=>raw.prefix+JSON.stringify(raw.value).replace(/</g,'\\u003c')+raw.suffix)
     .replace(lab.pattern,()=>lab.prefix+JSON.stringify(lab.value).replace(/</g,'\\u003c')+lab.suffix);
    files.push({file,before:html,after:changedHtml});
    archive.originals.push({capture:c.numero,cardId:c.id,...patch(before,c),raw:patch(rawBefore,raw.value),lab:patch(labBefore,lab.value)});
   }
   if(target.owned)archive.owned.push({key:c.key,...patch(before,c)});
  }
  if(r){const before=clone(r);r.cataloguePP=c.pp;r.registeredMaxLevel=c[levelKey];r.registeredLevels=target.owned?null:c.niveis||null;
   if(r.reference){r.reference.maxLevel=decision.maxLevel;r.reference.maxPP=decision.pp;r.reference.levelValid=true;
    r.reference.levelSourceUrl=decision.url;r.reference.levelReviewV381={source:decision.sourceKind,sha256:decision.sha256,
     reportedEfhubLevel:decision.publicLevel,confirmedInGame:false,conflict:decision.conflict,
     ...(decision.sourceKind==='owner_efhub_report'?{ownerSource:decision.ownerSource,identityPending:decision.identityPending}: {})};}
   const delta=patch(before,r);if(delta.fields.length)archive.references.push({key:r.key,...delta});
  }
 }
 roster.summary.level_total=roster.cards.filter(c=>Number.isInteger(c.max_level)).length;
 roster.summary.level_public_reference=roster.cards.filter(c=>/^catalogo_publico_/.test(String(c.pp_origem))).length;
 roster.summary.level_user_entered=roster.cards.filter(c=>/^informado_pelo_usuario_/.test(String(c.pp_origem))).length;
 audit.summary={total:261,reviewed:audit.cards.filter(r=>r.decision.status==='reviewed').length,
  pending:audit.cards.filter(r=>r.decision.status==='pending').length,
  ownerReports:audit.cards.filter(r=>r.decision.sourceKind==='owner_efhub_report').length,
  identityPending:audit.cards.filter(r=>r.decision.identityPending).map(r=>r.key),originalCorrections:archive.originals.length,
  ownedCorrections:archive.owned.length,budgetCorrections:archive.originals.filter(r=>r.before.pp!==r.after.pp).length,
  fixedCards:audit.cards.filter(r=>r.decision.fixed).map(r=>r.key),ownerCaptureConflicts:audit.cards.filter(r=>r.decision.conflict).map(r=>r.key)};
 return {roster,own,references,archive,audit,files};
}
function syncSurfaces(web){
 const read=file=>JSON.parse(fs.readFileSync(path.join(web,file),'utf8'));
 const archive=read('ct381-level-corrections.json'),cards=read('SCOUT_V69_AUDITORIA.json').cards;
 const restore=(value,p)=>{const old=clone(value);for(const key of p.fields){if(!eq(value[key],p.after[key]))throw Error('Superfície mudou fora da revisão: '+key);
  if(Object.hasOwn(p.before,key))old[key]=clone(p.before[key]);else delete old[key];}return old;};
 let index=fs.readFileSync(path.join(web,'index.html'),'utf8');
 if(!archive.index){archive.index={beforeSha256:hash(index.replace(/\r\n/g,'\n')),changes:[]};
  for(const p of archive.originals.filter(p=>p.before.pp!==p.after.pp)){
   const pattern=new RegExp('<a\\b[^>]*data-cap="'+p.capture+'"[^>]*>[\\s\\S]*?<\\/a>'),m=index.match(pattern);
   if(!m)throw Error('Carta ausente no índice: '+p.capture);
   const after=m[0].replace(/(<span class="pp">)\d+ PP(<\/span>)/,(_all,a,b)=>a+p.after.pp+' PP'+b);
   if(after===m[0]&&!m[0].includes(p.after.pp+' PP'))throw Error('PP ausentes no índice: '+p.capture);
   archive.index.changes.push({capture:p.capture,before:m[0],after});index=index.replace(pattern,()=>after);
  }
 }
 for(const p of archive.originals){const c=cards.find(c=>c.numero===p.capture),file=path.join(web,c.arquivo),html=fs.readFileSync(file,'utf8');
  const raw=block(html,'scout-v68-data'),lab=block(html,'lab-data'),beforeRaw=restore(raw.value,p.raw),beforeLab=restore(lab.value,p.lab);
  raw.value.pp_source='Revisão V381 por edição; não comprova treino aplicado na conta';
  lab.value.maxLevel=c.max_level;lab.value.pp=c.pp;lab.value.ppEstimated=false;
  p.raw=patch(beforeRaw,raw.value);p.lab=patch(beforeLab,lab.value);
  fs.writeFileSync(file,html.replace(raw.pattern,()=>raw.prefix+JSON.stringify(raw.value).replace(/</g,'\\u003c')+raw.suffix)
   .replace(lab.pattern,()=>lab.prefix+JSON.stringify(lab.value).replace(/</g,'\\u003c')+lab.suffix));
 }
 const owned=read('ct364-owned-cards.json');owned.cards=owned.cards.map(c=>{const p=archive.owned.find(p=>p.key===c.key);return p?restore(c,p):c;});
 archive.beforeOwnedSha256=hash(JSON.stringify(owned,null,2)+'\n');
 fs.writeFileSync(path.join(web,'index.html'),index);fs.writeFileSync(path.join(web,'ct381-level-corrections.json'),JSON.stringify(archive,null,2)+'\n');
}
if(require.main===module){const arg=k=>process.argv[process.argv.indexOf(k)+1],folder=arg('--sources'),out=arg('--out'),apply=process.argv.includes('--apply'),web=path.resolve(__dirname,'../web');
 if(!process.argv.includes('--sources')||!process.argv.includes('--out')||!path.isAbsolute(folder)||!path.isAbsolute(out))throw Error('Use --sources e --out com pastas absolutas.');
 if(fs.existsSync(path.join(web,'ct381-level-corrections.json')))throw Error('Revisão já aplicada; não recriar o arquivo anterior sobre dados revisados.');
 const x=build(folder,web);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'auditoria-261.json'),JSON.stringify(x.audit,null,2)+'\n');
 fs.writeFileSync(path.join(out,'correcoes-reversiveis.json'),JSON.stringify(x.archive,null,2)+'\n');
 if(apply){const save=(file,data)=>fs.writeFileSync(path.join(web,file),JSON.stringify(data,null,2)+'\n');
  save('ct381-level-audit.json',x.audit);save('ct381-level-corrections.json',x.archive);save('SCOUT_V69_AUDITORIA.json',x.roster);
  save('ct364-owned-cards.json',x.own);fs.writeFileSync(path.join(web,'ct376-card-references.json'),JSON.stringify(x.references)+'\n');
  for(const f of x.files)fs.writeFileSync(f.file,f.after);syncSurfaces(web);
 }
 console.log(JSON.stringify({applied:apply,...x.audit.summary,pending:x.audit.cards.filter(r=>r.decision.status==='pending').map(r=>({key:r.key,name:r.name,reason:r.decision.reason})),files:x.files.length}));
}
module.exports={build,patch,syncSurfaces};
