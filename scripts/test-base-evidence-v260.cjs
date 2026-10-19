'use strict';
/* V260 — distinguir snapshot numérico parcial de prova completa da edição.
 * O teste não altera nenhuma das 246 cartas, builds ou dados de laboratório.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const raw=read('web/SCOUT_V69_AUDITORIA.json');
const cards=JSON.parse(raw).cards;
const index=JSON.parse(read('web/SCOUT_V221_EVIDENCE_INDEX.json')).cards;
assert.equal(cards.length,246);
assert.equal(index.length,246);
const baseline=JSON.stringify(cards),rows=new Map(index.map(x=>[x.numero,x]));
let registered=0,scanned=0;
const labFor=c=>{
 const text=read('web/'+c.arquivo);
 const match=text.match(/<script id="lab-data"[^>]*>([\s\S]*?)<\/script>/);
 assert(match,'Laboratório da carta ausente: '+c.numero);
 return JSON.parse(match[1]);
};
for(const card of cards){
 const lab=labFor(card),row=rows.get(card.numero);
 const proof=V.baseEvidence(card,row,lab);
 const checklist=V.proofChecklist(card,row,lab,null);
 const field=checklist.checks.find(x=>x.id==='base');
 assert(field&&typeof field.documented==='boolean');
 assert.equal(proof.complete,false,'Não há prova completa com origem confirmada: #'+card.numero);
 assert.equal(field.documented,false,'Não homologar base por flag+dados parciais: #'+card.numero);
 assert.equal(field.partial,proof.partial);
 assert.equal(checklist.baseEvidence.count,proof.count);
 assert.equal(checklist.documented+checklist.pending,10);
 assert.equal(checklist.competitivelyVerified,false);
 if(proof.recorded){registered++;assert(proof.count>0)}
 if(row.base_stats_confirmados!==true)assert.equal(proof.recorded,false);
 scanned++;
}
assert.equal(scanned,246);
assert(registered>0,'É necessário identificar snapshots parciais existentes');
const raul=cards.find(c=>c.numero===2),rrow=rows.get(2),lab=labFor(raul);
assert(raul&&rrow&&rrow.base_stats_confirmados===true);
const source=V.baseEvidence(raul,rrow,lab);
assert.equal(source.identity,true);
assert.equal(source.count,9,'Raúl possui nove valores-base cadastrados');
assert.equal(source.partial,true);
assert.equal(source.complete,false);
assert.match(source.note,/PARCIAIS/);
const partialProof={schema:'CRAQUE_BASE_PROOF_V260',card_id:raul.id,
 edition:raul.versao,confirmed_in_game:true,complete:true,
 attribute_count:1,source_ref:'print_raúl_same_card_id'};
const shallow={...lab,stats:{'Controle de bola':{base:77}},stats_proof:partialProof};
const rowWithPrint={...rrow,print_edicao_confirmada:true};
assert.equal(V.baseEvidence(raul,rowWithPrint,shallow).complete,false,
 'Um valor isolado não comprova base completa mesmo com flag e print');
const stats=Object.fromEntries(Array.from({length:20},(_,i)=>[
 'Atributo de teste '+(i+1),{base:65+i}
]));
const complete={...lab,stats,stats_proof:{...partialProof,attribute_count:20}};
const approved=V.baseEvidence(raul,rowWithPrint,complete);
assert.equal(approved.count,20);
assert.equal(approved.complete,true,
 'Uma fixture com edição, fonte e atributos explicitamente conferidos pode ser elegível');
assert.equal(approved.partial,false);
const checks=V.proofChecklist(raul,rowWithPrint,complete,null);
assert.equal(checks.checks.find(x=>x.id==='base').documented,true);
assert.equal(checks.competitivelyVerified,false,'Prova de base não homologa treino em partidas');
for(const altered of [
 {...complete,stats_proof:{...complete.stats_proof,card_id:'outra-edicao'}},
 {...complete,stats_proof:{...complete.stats_proof,edition:'outro pack'}},
 {...complete,stats_proof:{...complete.stats_proof,complete:false}},
 {...complete,stats_proof:{...complete.stats_proof,source_ref:''}},
 {...complete,stats_proof:{...complete.stats_proof,attribute_count:19}},
 {...complete,id:'outro_id'},
 {...complete,pp:62},
 {...complete,name:'outra pessoa'},
 {...complete,stats:{...stats,'Atributo inválido':{base:NaN}}}
]){
 assert.equal(V.baseEvidence(raul,rowWithPrint,altered).complete,false,
  'Prova incompleta ou fonte divergente não confirma atributos-base');
}
assert.equal(V.baseEvidence(raul,rrow,complete).complete,false,
 'Sem print da edição confirmada no índice não marcar completo');
const screen=read('web/craque-ficha-individual-v251.js');
assert(screen.includes("item.partial?'PARCIAL':'PENDENTE'"));
assert(screen.includes("li.dataset.proof=item.documented?'documented':item.partial?'partial':'pending'"));
assert(read('web/sw.js').includes('v260-base-source-evidence'));
assert(read('package.json').includes('test-base-evidence-v260.cjs'));
assert.equal(JSON.stringify(cards),baseline);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),raw);
console.log('V260 PASS: '+scanned+' fichas conferidas; '+registered+
 ' snapshots parciais preservados, zero provas completas declaradas sem fonte.');
