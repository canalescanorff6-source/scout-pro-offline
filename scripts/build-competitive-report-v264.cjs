'use strict';
/* V264 — dossiê CONSULTIVO das 246 cartas, 5 estilos táticos.
 * Não substitui builds; não injeta progressões, habilidades nem ímpetos
 * inventados nas páginas originais. Gera relatório de auditoria isolado.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(src).cards;
const index=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const P=require('../web/scout-position-training-v246.js');
const V=require('../web/craque-ficha-individual-v251.js');
const C=require('../web/craque-competitive-readiness-v264.js');
assert.equal(cards.length,246);
assert.equal(index.length,246);
const evidence=new Map(index.map(r=>[r.numero,r]));
const original=JSON.stringify(cards);
const entries=[];
for(const card of cards){
 const html=read('web/'+card.arquivo);
 const script=id=>{
  const match=html.match(new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>'));
  if(!match)throw Error('Fonte '+id+' ausente da carta #'+card.numero);
  return JSON.parse(match[1]);
 };
 const raw=script('scout-v68-data'),lab=script('lab-data');
 const proof=V.proofChecklist(card,evidence.get(card.numero),lab,null);
 const styles=[];
 for(const tactic of C.styles){
  const review=V.buildReview(card,raw,lab,cards,tactic,{
   positionTraining:P,targetPosition:card.posicao,store:null
  });
  const advice=V.methodologyGate(card,proof,tactic,null,review);
  const readiness=C.assess(card,proof,tactic,advice);
  const permitted=readiness.allowedToPresentCandidates;
  styles.push({
   estilo:tactic,funcao_original:card.posicao,
   classificacao:readiness.classification,
   status:readiness.label,
   PP_do_catalogo:card.pp,
   treino_original:Array.isArray(card.niveis)?card.niveis.slice():null,
   proposta_matematica_nao_homologada:permitted&&review.proposal?.levels?
    review.proposal.levels.slice():null,
   habilidades_adicionais_hipoteses:permitted?advice.skills.candidates.map((s,i)=>({
    prioridade:i+1,nome:s.name,justificativa:s.reason,
    complementaridade:s.synergy
   })):[],
   habilididades_adicionais_confirmadas:readiness.additional,
   impeto_comparativo:permitted&&advice.booster.name?
    {nome:advice.booster.name,justificativa:advice.booster.reason,
     atributos:advice.booster.attributes,slot:readiness.booster,
     status_equipamento:advice.booster.equipStatus}:null,
   faltam_evidencias:readiness.missing.slice(),
   gameplay_homologado:false,
   metodo:'triagem consultiva; não é build validada por Blackjhon/Rentão'
  });
 }
 entries.push({
  numero:card.numero,card_id:String(card.id),
  nome:card.name,edicao:card.versao,posicao:card.posicao,
  pp:card.pp,nivel_maximo:card.max_level??null,
  habilidades_nativas_cadastradas:card.habilidades_nativas||null,
  status_evidencias:styles[0].classificacao,
  estilos:styles
 });
}
assert.equal(entries.length,246);
assert.equal(entries.reduce((sum,e)=>sum+e.estilos.length,0),1230);
assert.equal(JSON.stringify(cards),original);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),src);
const report={
 schema:'CRAQUE_COMPETITIVE_REPORT_V264',
 status:'HIPOTESES — NAO APLICAR NEM HOMOLOGAR SEM PROVA',
 total_cartas:246,total_avaliacoes:1230,
 preferencia_tatica:'posse',
 fonte_catalogo:'web/SCOUT_V69_AUDITORIA.json',
 fonte_auditoria:'web/SCOUT_V221_EVIDENCE_INDEX.json',
 referencia:'Critérios de Blackjhon e Rentão são metodologia, não autoria de builds',
 aviso:'Não altera cartas, PP, skills, ímpetos, saves ou formações. Não valida gameplay.',
 cartas:entries
};
const outDir=path.join(root,'build');fs.mkdirSync(outDir,{recursive:true});
fs.writeFileSync(path.join(outDir,'v264-competitive-246x5.json'),JSON.stringify(report,null,2)+'\n');
const csv=[['CAP','Card ID','Jogador','Edição','Estilo','Status','Treino registrado','5 habilidades hipotéticas','Ímpeto comparativo','Lacunas']];
for(const e of entries)for(const s of e.estilos)csv.push([
 e.numero,e.card_id,e.nome,e.edicao,s.estilo,s.status,
 s.treino_original?'Sim':'Não',
 s.habilidades_adicionais_hipoteses.map(x=>x.nome).join(' | '),
 s.impeto_comparativo?.nome||'',s.faltam_evidencias.join(' | ')
]);
const escape=v=>'"'+String(v??'').replace(/"/g,'""').replace(/[\r\n]+/g,' ').trim()+'"';
fs.writeFileSync(path.join(outDir,'v264-competitive-246x5.csv'),
 '\uFEFF'+csv.map(row=>row.map(escape).join(',')).join('\n')+'\n');
console.log('V264 EXPORT OK: 246 cartas, 1230 cenários consultivos; JSON e CSV sob build/. Zero alterações em builds.');
