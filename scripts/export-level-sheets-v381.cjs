'use strict';
const fs=require('node:fs'),path=require('node:path');
const C=require('../web/SCOUT_V69_AUDITORIA.json').cards,O=require('../web/ct364-owned-cards.json').cards,
 refs=require('../web/ct376-card-references.json').cards,audit=require('../web/ct381-level-audit.json');
const F=require('../web/craque-friends-training-v228.js'),P=require('../web/craque-positional-v311.js'),Main=require('../web/craque-main-sheet-v378.js'),R=require('../web/craque-rating-v376.js');
const deps={training:F,tactical:require('../web/scout-multitactic-engine-v220.js'),skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
function generate(){const sheets=[];
 for(const record of audit.cards){const own=record.capture===null,c=own?O.find(c=>c.key===record.key):C.find(c=>c.numero===record.capture),ref=refs.find(r=>r.key===record.key);
  const meta=own?R.ownedMetadata(c,{},ref):null,m=own?null:P.fromPersonal(c);
  for(const tactic of F.MODES){
   const card=own?{localKey:c.key,name:c.name,cardId:meta.cardId,edition:meta.engineEdition||'',position:c.position,originalPosition:c.position,
    level:meta.level,pp:null,style:c.style,nativeSkills:c.observed.nativeSkills.join('; '),skills:'',fixedBooster:'',booster:'',boosterSlot:'pendente',trainingLevels:''}:Main.cardFromModel(m,m.position);
   const out=own?F.evaluate(card,tactic,deps):P.compute(m,m.position,tactic).outcome;
   const review=Main.resolve(card,out,{reference:ref},deps).review;
   const text=['CRAQUE TÁTICO · REVISÃO DE NÍVEL E PP V381',record.name,
    record.decision.status==='reviewed'?'Nível de referência: '+record.decision.maxLevel+' · '+record.decision.pp+' PP · '+record.decision.sourceKind:
     'FONTE PENDENTE: orçamento anterior preservado; esta ficha não comprova a revisão do nível.',
    record.decision.conflict?'A captura do proprietário foi priorizada; a página pública diverge. Não é confirmação no jogo.':'Referência de edição separada de treino/equipamento aplicados na conta.',
    record.decision.identityPending?'Nível informado pelo proprietário; edição/ID exatos ainda pendentes. Este relato não identifica a carta.':'',
    'Fonte: '+(record.decision.ownerSource||record.decision.url||record.sourceUrl||'Edição exata ainda pendente'),'',Main.text(review)].join('\n');
   sheets.push({key:record.key,tactic,levelReviewStatus:record.decision.status,identityPending:record.decision.identityPending===true,maxLevel:record.decision.maxLevel,pp:review.pp,review,text});
  }
 }return {schema:'CRAQUE_LEVEL_SHEETS_V381',cards:261,sheetCount:sheets.length,styles:F.MODES,
  reviewedCards:audit.summary.reviewed,pendingCards:audit.summary.pending,
  ownerReportedCards:audit.summary.ownerReports,identityPendingCards:audit.summary.identityPending.length,gameplayValidated:false,sheets};
}
if(require.main===module){const at=process.argv.indexOf('--out'),folder=at>=0&&process.argv[at+1];if(!folder||!path.isAbsolute(folder))throw Error('Use --out com pasta absoluta.');
 const data=generate(),dir=path.join(folder,'fichas');fs.mkdirSync(dir,{recursive:true});
 const report=['# Níveis, PP e fichas revisados','',
  '**261 cartas com referência de nível; nenhum nível pendente.** Metadados de 34 originais revisados e níveis/PP das 15 próprias preenchidos. Dentro das originais, 30 orçamentos de PP foram corrigidos. Três níveis foram informados pelo proprietário; isso não equivale a verificação pública ou dentro do jogo.','',
  '**Havertz #041:** 32 níveis e 62 PP conforme a captura e confirmação explícita do proprietário de que o eFHUB exibiu esse nível automaticamente. A página pública limpa dessa mesma ID retorna 26/50. A diferença está registrada; não foi tratada como confirmação dentro do jogo.','',
  '**Beckham #004:** fonte pública 33/64, em acordo com o catálogo. A conferência local 34/66 é distinta e, se continuar salva no dispositivo, aparece como divergência; não foi apagada.','',
  '**Resposta do proprietário em 01/11/2026:** Aubameyang #183 32/62; Savinho #196 34/66 (antes 42/82); Messi #050 29/56. São relatos do eFHUB, sem confirmação no jogo. A edição/ID exatos de Messi continuam pendentes; seu nível informado não resolve a identidade.','',
  '**Fichas:** 1.305 contextos (261 cartas × cinco estilos) calculados com os orçamentos efetivos. Os cinco contextos do Messi preservam o aviso de identidade pendente. São propostas consultivas, não prova de melhor desempenho online.','',
  'Treinos antigos incompatíveis foram arquivados, sem reaproveitá-los como treino atual. Não foram alterados imagens, IDs, nativas, equipamentos, formações ou dados pessoais do programa instalado. Os históricos salvos por você continuam preservados.','',
  'Daniel Muñoz #126 e Xavi Simons #204 são edições Trending sem progressão: 1 nível e 0 PP. A ficha não recomenda novos treinos, habilidades ou ímpeto selecionável para essas edições. [Regra oficial de evolução](https://www.konami.com/efootball/pt-br/page/overview).','',
  '| Carta | Nível anterior | Nível revisado | PP anteriores | PP revisados | Fonte | Fichas dos cinco estilos |','|---|---:|---:|---:|---:|---|---|'];
 for(const record of audit.cards){const rows=data.sheets.filter(s=>s.key===record.key),name=(record.capture===null?record.key:String(record.capture).padStart(3,'0'))+'_'+record.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_')+'.txt',file=path.join(dir,name);
  fs.writeFileSync(file,rows.map(r=>r.text).join('\n\n'+'='.repeat(70)+'\n\n')+'\n');
  report.push('| '+record.name+' | '+(record.beforeLevel??'—')+' | '+(record.decision.maxLevel??'pendente')+' | '+(record.beforePP??'—')+' | '+(record.decision.pp??'mantidos')+' | '+(record.decision.ownerSource?'Relato/captura do proprietário':record.decision.url?'[referência]('+record.decision.url+')':'pendente')+' | [abrir]('+file.replace(/\\/g,'/')+') |');
 }
 fs.writeFileSync(path.join(folder,'LEIA-ME.md'),report.join('\n')+'\n');
 fs.writeFileSync(path.join(folder,'261-cartas-5-estilos.json'),JSON.stringify(data,null,2)+'\n');
 for(const name of ['ct381-level-audit.json','ct381-level-corrections.json'])fs.copyFileSync(path.join(__dirname,'../web',name),path.join(folder,name));
 console.log(JSON.stringify({cards:261,sheets:data.sheetCount,reviewedCards:data.reviewedCards,pendingCards:data.pendingCards,output:folder}));
}
module.exports={generate};
