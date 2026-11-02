'use strict';
const fs=require('node:fs'),path=require('node:path');
const Main=require('../web/craque-main-sheet-v378.js'),P=require('../web/craque-positional-v311.js');
const F=require('../web/craque-friends-training-v228.js'),T=require('../web/scout-multitactic-engine-v220.js');
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const R=require('../web/craque-rating-v376.js'),model=require('../web/ct376-rating-model.json');
const batch=require('../web/craque-competitive-batch-v380.js').data;
const cards=require('../web/SCOUT_V69_AUDITORIA.json').cards,refs=require('../web/ct376-card-references.json').cards;
function generate(){return batch.cards.map(e=>{
 const c=cards.find(c=>c.numero===e.capture),m=P.fromPersonal(c),ref=refs.find(r=>r.capture===e.capture);
 const review=Main.resolve(Main.cardFromModel(m,m.position),P.compute(m,m.position,'posse').outcome,{reference:ref},
  {training:F,tactical:T,skills:S,boosters:B}).review;
 if(!review.competitiveReview)throw Error('Referência divergente para CAP '+e.capture);
 const estimate=training=>R.evaluate(ref,{cardKey:ref.key,cardId:ref.cardId,edition:ref.edition,position:ref.position,training,budget:c.pp},model);
 const before=estimate(c.niveis),after=estimate(review.proposed);
 if(!before.stats||!after.stats)throw Error('Comparação indisponível para CAP '+e.capture);
 const changes=Object.entries(after.stats).filter(([key,v])=>v!==before.stats[key]).map(([key,to])=>({stat:key,from:before.stats[key],to,delta:to-before.stats[key]}));
 return {capture:e.capture,cardId:e.cardId,edition:e.edition,review,text:Main.text(review),
  comparison:{status:'ESTIMADO',context:'Sem técnico, sem ímpeto adicional; somente base pública, treino e primeiro ímpeto fixo numérico da referência. Não são atributos observados na conta.',
   formula:model.source,officialKonamiFormula:false,before:c.niveis,after:review.proposed,changes}};
});}
if(require.main===module){
 const at=process.argv.indexOf('--out'),target=at>=0?process.argv[at+1]:null;
 if(!target||!path.isAbsolute(target))throw Error('Use --out com pasta absoluta de artefatos.');
 fs.mkdirSync(target,{recursive:true});const sheets=generate();
 const labels={offensive_awareness:'Consciência ofensiva',ball_control:'Controle de bola',dribbling:'Drible',tight_possession:'Posse apertada',low_pass:'Passe rasteiro',lofted_pass:'Passe alto',finishing:'Finalização',heading:'Cabeceio',set_piece_taking:'Bola parada',curl:'Efeito',speed:'Velocidade',acceleration:'Aceleração',kicking_power:'Potência de chute',jumping:'Salto',physical_contact:'Contato físico',balance:'Equilíbrio',stamina:'Resistência',defensive_awareness:'Consciência defensiva',tackling:'Desarme',aggression:'Agressividade',defensive_engagement:'Dedicação defensiva',gk_awareness:'Consciência GO',gk_catching:'Firmeza GO',gk_parrying:'Desvio GO',gk_reflexes:'Reflexos GO',gk_reach:'Alcance GO'};
 const out=['# Fichas, habilidades e ímpetos — lote 01','',
  '13 edições revisadas para Posse pelo centro. Propostas editoriais ESTIMADAS, com custo de PP CALCULADO. Salvar uma ficha cria uma revisão independente; treinos aprovados e equipamentos são preservados. As demais 248 cartas e os outros quatro estilos não recebem esta revisão.','',
  'A pesquisa pública confirmou referências por edição. Nenhum vídeo consultado forneceu, de forma verificável, edição e números completos para homologar uma ficha de criador neste lote. Rentão e Blackjhon permanecem pendentes de conteúdo verificável; não há atribuição de ficha a eles.','',
  'A comparação numérica abaixo usa o modelo público já existente no app, sem técnico/ímpeto extra. Não mede desempenho em partidas. Ímpetos fixos e extras já registrados na carta devem ser conferidos na própria conta.',''];
 for(const row of sheets){const r=row.review;fs.writeFileSync(path.join(target,String(row.capture).padStart(3,'0')+'-'+r.identity.name.replace(/[^\p{L}\p{N}-]+/gu,'-')+'.txt'),row.text+'\n');
  out.push('## #'+String(row.capture).padStart(3,'0')+' — '+r.identity.name,'',r.identity.edition+' · Card ID '+row.cardId,'',r.job,'',r.competitiveReview.strategy,'',r.competitiveReview.tradeoff,'',
   'Níveis por categoria: **'+r.proposed.join(' / ')+'** · '+r.spent+' PP. Ordem: chute, passe, drible, destreza, pernas, aéreo, defesa, GO1, GO2, GO3.','',
   'Adicionais, por prioridade: '+r.skills.map(s=>s.name).join(' → ')+'. Conferir as vagas da conta antes de gastar.','',
   'Ímpeto para comparar: '+(r.boosters[0]?.name||'manter registro; nenhum novo selecionável documentado')+'. '+r.competitiveReview.slotNote,'');
  if(row.comparison.changes.length){out.push('| Atributo estimado, sem técnico/extra | Registro | Proposta |','|---|---:|---:|',...row.comparison.changes.map(c=>'| '+(labels[c.stat]||c.stat)+' | '+c.from+' | '+c.to+' |'),'');}
  else out.push('Treino mantido neste lote.','');
  out.push('[Fonte pública da edição]('+r.competitiveReview.sources[0].url+')','');
 }
 fs.writeFileSync(path.join(target,'LEIA-ME.md'),out.join('\n')+'\n');
 fs.writeFileSync(path.join(target,'fichas-lote-01.json'),JSON.stringify({batch:batch.batch,gameplayValidated:false,sheets},null,2)+'\n');
 console.log('Exportadas '+sheets.length+' fichas, relatório e comparação estimada em '+target);
}
module.exports={generate};
