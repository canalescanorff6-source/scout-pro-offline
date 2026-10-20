'use strict';
/* V268 — 246 edições × cinco estilos, sem elevar flags e 9 atributos
 * parciais a status base completo. Rank só muda com prova V260 válida.
 */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(original).cards;
const rows=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
const B=require('../web/booster-engine-v103.js');
const S=require('../web/skills-booster-v162.js');
const V=require('../web/craque-ficha-individual-v251.js');
const index=new Map(rows.map(z=>[z.numero,z]));
assert.equal(cards.length,246);
assert.equal(index.size,246);
let checks=0,partial=0;
const labFor=c=>{
 const html=read('web/'+c.arquivo);
 const m=html.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(m,'Laboratório ausente CAP '+c.numero);
 return JSON.parse(m[1]);
};
for(const c of cards){
 const snapshot=JSON.stringify(c),lab=labFor(c),row=index.get(c.numero);
 const proof=V.baseEvidence(c,row,lab);
 assert.equal(proof.complete,false,'Nenhuma das fontes atuais possui V260 completo');
 const base=lab.stats;
 if(proof.partial)partial++;
 for(const style of B.tactics){
  const originalRank=B.rank(c,style);
  const unconfirmed={
   ...c,edition:c.versao,base_stats:base,
   base_stats_proof:lab.stats_proof||null,
   base_catalog_proof:{base_stats_confirmados:row.base_stats_confirmados,
    print_edicao_confirmada:row.print_edicao_confirmada}
  };
  const audit=B.baseStatsAudit(unconfirmed);
  assert.notEqual(audit.status,'base_completa_confirmada');
  const rank=B.rank(unconfirmed,style);
  assert.deepEqual(rank.map(x=>[x.nome,x.score]),originalRank.map(x=>[x.nome,x.score]),
   'Base parcial sem fonte não pode distorcer ranking CAP '+c.numero);
  assert(rank.every(x=>x.evidencias.base_status!=='base_completa_confirmada'&&
   x.evidencias.score_base===0));
  checks++;
 }
 assert.equal(JSON.stringify(c),snapshot,'Não editar os dados originais');
}
assert.equal(checks,1230);
assert(partial>0);
const raul=cards.find(c=>c.numero===2),lab=labFor(raul);
assert.equal(V.baseEvidence(raul,index.get(2),lab).partial,true);
assert.equal(B.baseStatsAudit({
 ...raul,edition:raul.versao,base_stats:lab.stats,
 base_catalog_proof:{base_stats_confirmados:true,print_edicao_confirmada:true}
}).status,'base_parcial_sem_prova');
const syntheticStats=Object.fromEntries(
 Object.values(B.BASE_STAT_LABELS).slice(0,21)
  .map((name,i)=>[name,{base:68+(i*7)%25}]));
assert.equal(Object.keys(syntheticStats).length,21);
const proof={
 schema:'CRAQUE_BASE_PROOF_V260',card_id:raul.id,
 edition:raul.versao,confirmed_in_game:true,complete:true,
 source_ref:'print_mesmo_card_id_confirmado',attribute_count:21
};
const exact={...raul,edition:raul.versao,base_stats:syntheticStats,
 base_stats_proof:proof,base_catalog_proof:{
  base_stats_confirmados:true,print_edicao_confirmada:true}};
const ready=B.baseStatsAudit(exact);
assert.equal(ready.status,'base_completa_confirmada');
assert.equal(ready.recognized,21);
assert.equal(ready.count,21);
let diff=0;
for(const t of B.tactics){
 const chosen=B.rank(exact,t),plain=B.rank(raul,t);
 const byName=new Map(plain.map(x=>[x.nome,x.score]));
 assert(chosen.every(x=>Math.abs(x.evidencias.score_base)<=2));
 assert(chosen.every(x=>x.evidencias.base_status==='base_completa_confirmada'));
 assert(chosen.every(x=>x.evidencias.base_fonte===proof.source_ref));
 if(chosen.some(x=>x.score!==byName.get(x.nome)))diff++;
}
assert(diff>0,'Prova completa deve permitir ajuste relativo limitado');
for(const altered of [
 {...exact,base_stats_proof:{...proof,card_id:'ID_DIFERENTE'}},
 {...exact,base_stats_proof:{...proof,edition:'PACK DIFERENTE'}},
 {...exact,base_stats_proof:{...proof,source_ref:''}},
 {...exact,base_stats_proof:{...proof,complete:false}},
 {...exact,base_stats_proof:{...proof,attribute_count:20}},
 {...exact,base_stats_proof:{...proof,confirmed_in_game:false}},
 {...exact,base_catalog_proof:{...exact.base_catalog_proof,print_edicao_confirmada:false}},
 {...exact,base_catalog_proof:{...exact.base_catalog_proof,base_stats_confirmados:false}},
 {...exact,base_stats:{...syntheticStats,'HABILIDADE IRREAL':{base:Infinity}}},
 {...exact,base_stats:Object.fromEntries(Object.entries(syntheticStats).slice(0,9))},
 {...exact,id:'outra-edicao'},
 {...exact,edition:'outro-pack'}
]){
 assert.notEqual(B.baseStatsAudit(altered).status,'base_completa_confirmada');
 assert(B.rank(altered,'posse').every(x=>x.evidencias.score_base===0),
  'Prova corrompida nunca afeta ranking');
}
const adapter=S.booster({
 capture:2,id:raul.id,edition:raul.versao,shown_position:raul.posicao,
 attack_style:raul.estilo_ataque,defence_style:raul.estilo_defesa,
 native_skills:raul.habilidades_nativas,recommended_levels:raul.niveis,
 pp:raul.pp,boost1:raul.impeto_fixo,boost2:raul.impeto_extra,
 base_stats:syntheticStats,base_stats_proof:proof,
 base_catalog_proof:exact.base_catalog_proof
},'posse',B);
assert.equal(adapter.primary?.nome,B.rank(exact,'posse')[0]?.nome);
assert.equal(adapter.primary?.evidencias.base_status,'base_completa_confirmada');
assert.equal(adapter.able,false);
const src=read('web/craque-ficha-individual-v251.js');
assert(src.includes('const baseVerified=base.complete===true'));
assert(src.includes('const canonical=sourceFor(card,raw,lab,evidenceByCap.get(card.numero))'));
assert(src.includes('base_stats:baseVerified?lab.stats:null'));
const skills=read('web/skills-booster-v162.js');
assert(skills.includes('base_stats_proof:d.base_stats_proof'));
assert(skills.includes("'Atributos-base pendentes ou parciais: ignorados na pontuação. '"));
assert(read('web/sw.js').includes('v268-verified-base'));
assert(read('package.json').includes('test-verified-base-booster-v268.cjs'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
console.log('V268 OK: '+checks+' cenários intactos; '+partial+
 ' bases parciais sem uso; fixture V260 completa usa ajuste relativo limitado; sem inventar status finais.');
