'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,'web',f),'utf8'));
const a=read('SCOUT_V69_AUDITORIA.json');
const v=read('SCOUT_V182_SKILLS_BOOSTERS_EVIDENCE.json');
const engine=require('../web/booster-engine-v103.js');

assert.equal(a.cards.length,246);
assert.equal(v.cartas.length,246);
assert.deepEqual(v.totais.por_proveniencia,{
  legado_sem_proveniencia_individual:130,
  base_externa_card_id:92,
  pendente_identidade:3,
  base_externa_multifatorial_id_nao_autenticado:21
});
assert.deepEqual(v.totais.slots_por_status_cadastrado,{
  selecionavel_indicado_sem_homologacao:95,
  indefinido:144,
  segundo_impeto_nomeado_no_cadastro:4,
  possivel_sem_homologacao:3
});
assert.equal(engine.CRAFTABLE.length,28);
assert.equal(new Set(engine.CRAFTABLE).size,28);
const auditByNo=new Map(a.cards.map(c=>[c.numero,c]));
const seen=new Set();
for(const c of v.cartas){
 const old=auditByNo.get(c.numero);
 assert(old&&!seen.has(c.numero),'Carta ausente ou duplicada: '+c.numero);
 seen.add(c.numero);
 assert.equal(c.jogador,old.name);
 assert.equal(c.card_id_registrado,String(old.id));
 assert.equal(c.impeto_fixo_registrado,String(old.impeto_fixo||''));
 assert.equal(c.impeto_extra_registrado,String(old.impeto_extra||''));
 assert.equal(c.habilidades_nativas_quantidade,(old.habilidades_nativas||'').split(';').filter(Boolean).length);
 assert.equal(c.habilidades_confirmadas_diretamente_na_conta,false);
 assert.equal(c.situacao_slot_confirmada_na_conta,false);
 if(!old.habilidades_nativas)assert.equal(c.habilidades_status,'pendente_identidade');
 else assert.notEqual(c.habilidades_status,'pendente_identidade');
}
assert.equal(seen.size,246);
assert.deepEqual(v.pendencias_habilidades.map(x=>x.numero),[50,151,181]);
for(const n of [50,151,181])
 assert(!auditByNo.get(n).habilidades_nativas,'Sem promoção indevida de habilidades da carta '+n);
const r24=v.cartas.find(x=>x.numero===24);
assert.equal(r24.impeto_fixo_registrado,"Striker's Instinct +4");
assert.equal(r24.impeto_extra_registrado,'Physicality +3');
assert.equal(r24.ressalva_usuario.status_relato_usuario,'dois_impetos_embutidos_sem_slot_livre');
const r81=v.cartas.find(x=>x.numero===81);
assert.equal(r81.ressalva_usuario.status_relato_usuario,'um_fixo_sem_slot_adicional');
assert.equal(r81.impeto_fixo_registrado,'PENDENTE');
for(const x of v.pendencias_habilidades){
 assert(!('skills' in x),'Não transportar habilidades candidatas para comprovadas');
}
console.log('V183 OK: 246 cartas auditadas; 243 listas documentadas (130 legado, 92 ID externo, 21 multifator); 3 pendentes; slots e boosters separados de confirmação direta.');
