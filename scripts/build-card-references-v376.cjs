'use strict';
// Produz referências públicas separadas: não regrava cartas/recibos da conta.
const fs=require('node:fs'),path=require('node:path');
const S=require('../web/skills-booster-v162.js'),L=require('../web/skill-names-v196.js');
const root=path.resolve(__dirname,'../web'),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const token=s=>S.keyFor(s)||L.norm(L.display(s));
const names=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/^savio$/,'savinho');
const position=s=>({AC:'CA',DC:'ZG',ZC:'ZG',MC:'MLG',ME:'MLG',MDF:'VOL',GR:'GO',DD:'LD',DE:'LE',MO:'MAT'})[s]||s;
function build(folder){
 const originals=read(path.join(root,'SCOUT_V69_AUDITORIA.json')).cards,owned=read(path.join(root,'ct364-owned-cards.json')).cards;
 const originalSources=read(path.join(folder,'fontes-coletadas.json')),newSources=read(path.join(folder,'novas-fontes-candidatas.json'));
 const byId=new Map(originalSources.filter(x=>x.data).map(x=>[x.id,x]));
 const supplementFile=path.join(folder,'fontes-suplementares.json');
 const supplements=fs.existsSync(supplementFile)?read(supplementFile):[];
 const correctionsFile=path.join(root,'ct377-identity-corrections.json');
 const corrections=fs.existsSync(correctionsFile)?read(correctionsFile).cards:[];
 const shared=new Set(originals.filter(c=>originals.filter(x=>String(x.id)===String(c.id)).length>1).map(c=>String(c.id)));
 const ref=r=>{
  if(!r?.data)return null;const d=r.data;
  const supplement=supplements.find(x=>x.cardId===String(d.compare.playerId));
  const maxLevel=d.maxLevel>1?d.maxLevel:supplement?.maxLevel??d.maxLevel;
  const levelValid=Number.isInteger(maxLevel)&&maxLevel>1&&maxLevel<=120;
  return {cardId:String(d.compare.playerId),name:d.compare.playerName,edition:d.compare.featuredName,type:d.compare.cardType,
   url:r.url,htmlSha256:r.html_sha256,fetchedUtc:r.fetched_utc,position:d.position,positions:d.positions,
   height:d.height,weakFootAccuracy:d.weakFootAccuracy,baseOverall:d.baseOverall,databaseMaxOverall:d.databaseMaxOverall,
   maxLevel:levelValid?maxLevel:null,levelValid,maxPP:levelValid?2*(maxLevel-1):null,
   levelSourceUrl:supplement&&d.maxLevel<=1?supplement.url:r.url,
   reportedMaxLevel:d.maxLevel,baseStats:d.baseStats,nativeSkills:d.compare.playerSkills,
   fixedBoosters:d.boosters.filter(b=>!b.selectable&&b.active).map(b=>({name:b.name,stats:b.stats})),
   extraSlotInPublicEdition:d.boosters.some(b=>b.selectable),accountConfirmed:false};
 };
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const cards=originals.map(c=>{
  const r=ref(byId.get(String(c.id))),repeated=shared.has(String(c.id));
  const allowed=!!r&&!repeated&&names(r.name)===names(c.name);
  const p=html.indexOf('data-cap="'+c.numero+'"'),part=html.slice(p,p+1000),image=part.match(/<img[^>]+src="([^"]+)"/)?.[1]||null;
  const ficha=fs.readFileSync(path.join(root,c.arquivo),'utf8');
  const labMatch=ficha.match(/<script\b(?=[^>]*\bid=["']lab-data["'])[^>]*>([\s\S]*?)<\/script>/i);
  const lab=labMatch?JSON.parse(labMatch[1]):null;
  const correction=corrections.find(x=>x.capture===c.numero);
  return {key:'cap:'+c.numero,capture:c.numero,cardKey:c.numero+'@'+c.id,name:c.name,cardId:String(c.id),edition:c.versao,
   ...(correction?{previousIdentity:{cardId:correction.beforeCanonical.id,edition:correction.beforeCanonical.versao},identityCorrectionKey:c.numero}:{}),
   position:position(c.posicao),image,file:c.arquivo,labKey:lab?'scoutpro:v67:'+lab.id+':'+lab.card:null,
   cataloguePP:c.pp,registeredMaxLevel:c.max_level??null,
   registeredLevels:c.niveis||null,identityStatus:!r?'missing':repeated?'shared_id':allowed?'registered_id':'name_mismatch',
   identityUsable:allowed,reference:r};
 });
 for(const c of owned){
  const source=newSources.find(x=>x.key===c.key),r=ref(source);
  const sameSkills=!!r&&JSON.stringify(c.observed.nativeSkills.map(token).sort())===JSON.stringify(r.nativeSkills.map(token).sort());
  // O proprietário declarou possuir o pack completo; a transcrição discrimina
  // os seus membros. Isto não é recibo de atributos/treino confirmado no jogo.
  const packMatch=!!r&&r.edition==='Borussia Dortmund Pack 26-27'&&sameSkills&&r.height===c.observed.heightCm&&names(r.name)===names(c.name);
  // Specific owner reply of 27/10: these four exact outside editions were confirmed.
  const declaredEditions={'ct364-11':"European Clubs Selection Midfielders 19 Oct '26",
   'ct364-12':'Ranking Event Rewards 2027','ct364-13':'Advertisement Reward 2027','ct364-14':'Villarreal A 04-05'};
  const editionMatch=!!r&&declaredEditions[c.key]===r.edition&&r.height===c.observed.heightCm&&names(r.name)===names(c.name);
  cards.push({key:c.key,capture:null,cardKey:c.key,name:c.name,cardId:c.cardId||'',edition:c.edition,
   position:position(c.position),image:c.image,file:null,cataloguePP:c.pp,registeredMaxLevel:c.maxLevel,
   registeredLevels:null,identityStatus:packMatch?'declared_pack_match':editionMatch?'declared_edition_match':'candidate',identityUsable:packMatch||editionMatch,
   candidateId:r?.cardId||null,candidateSkillsMatch:sameSkills,reference:r});
 }
 const model=read(path.join(folder,'modelo-referencia.json'));
 const sample=originalSources.find(x=>x.data?.boosters?.some(b=>b.options?.length))?.data;
 model.schema='CRAQUE_RATING_MODEL_V376';model.version='pesdb-1791793226-reference';
 model.officialKonamiFormula=false;
 model.boosters=Object.fromEntries((sample?.boosters.flatMap(b=>b.options||[])||[]).map(b=>[names(b.name.replace(/\s*\+\s*\d+$/,'')),b.stats]));
 const boosterNames=require('../web/booster-engine-v103.js');
 for(const [en,pt] of Object.entries(boosterNames.PTBR)){
  const stats=model.boosters[names(en)];if(stats)model.boosters[names(pt)]=stats;
 }
 const data={schema:'CRAQUE_CARD_REFERENCES_V376',sourceDescription:'Catálogos externos; não comprovam equipamento, treino ou identidade da conta.',
  ownerPackDeclaration:'Usuário declara possuir o pacote completo Borussia Dortmund 26-27 e confirma as quatro edições externas: Ezequiel19/10/26,ProvedelRanking2027,PavlovićAnúncio2027,ForlánVillarreal04-05. Não confirma treinos/equipamentos.',cards};
 const ownerMaxima={'cap:171':106,'cap:185':97,'cap:205':103,'ct364-12':103};
 for(const card of cards)if(ownerMaxima[card.key])card.ownerMaximumOverall={
  value:ownerMaxima[card.key],source:'usuario_2026-10-28',currentTrainingConfirmed:false,
  manager:null,training:null};
 return {data,model};
}
if(require.main===module){
 if(!process.argv[2])throw Error('Informe a pasta das fontes previamente coletadas.');
 const {data,model}=build(path.resolve(process.argv[2]));
 fs.writeFileSync(path.join(root,'ct376-card-references.json'),JSON.stringify(data)+'\n');
 fs.writeFileSync(path.join(root,'ct376-rating-model.json'),JSON.stringify(model)+'\n');
 console.log(JSON.stringify({cards:data.cards.length,withSource:data.cards.filter(x=>x.reference).length,
  identityUsable:data.cards.filter(x=>x.identityUsable).length,packMatches:data.cards.filter(x=>x.identityStatus==='declared_pack_match').length}));
}
module.exports={build};
