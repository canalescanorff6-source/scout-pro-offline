// Fixture histórica anterior à correção autorizada V381; dados atuais são verificados no teste de integração V381.
const {historicalRead}=require('./historical-level-fixtures-v381.cjs');
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>historicalRead(path.resolve(__dirname,'..',p),'utf8');
const source=read('web/SCOUT_V69_AUDITORIA.json'),cards=JSON.parse(source).cards;
const B=require('../web/booster-engine-v103.js');
const S=require('../web/skills-booster-v162.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const V=require('../web/craque-ficha-individual-v251.js');
const P=require('../web/scout-position-training-v246.js');
assert.equal(cards.length,246);
assert.equal(new Set(cards.map(x=>x.numero+'@'+x.id)).size,246);
assert.equal(B.POS.LE,'LE');assert.equal(B.POS.DE,'LE');
assert.equal(B.POS.LD,'LD');assert.equal(B.POS.MLE,'ALA');
assert.equal(B.ROLE.LE.defaware,B.ROLE.LD.defaware);
assert.deepEqual(B.rank({posicao:'LE'},'posse').map(x=>[x.nome,x.score]),
 B.rank({posicao:'LD'},'posse').map(x=>[x.nome,x.score]),
 'LE e LD conservam pesos numéricos equivalentes sem trocar a identidade lateral');
const positions=[...new Set(cards.map(x=>x.posicao))];
assert(positions.every(p=>B.POS[p]),'Posições sem função: '+positions.filter(p=>!B.POS[p]));
const styles=['posse','normal','rapido','fora','longo'];
let evaluations=0,mlEs=0,lefts=0;
for(const c of cards){
 const original=JSON.stringify(c);
 if(c.posicao==='MLE')mlEs++;
 if(c.posicao==='LE'||c.posicao==='DE')lefts++;
 const role=B.POS[c.posicao];
 const data={posicao:c.posicao,shown_position:c.posicao,role_used:c.posicao,
  estilo_ataque:c.estilo_ataque,estilo_defesa:c.estilo_defesa,
  habilidades_nativas:c.habilidades_nativas,
  impeto_fixo:c.impeto_fixo,impeto_extra:c.impeto_extra,
  niveis:c.niveis,boost1:c.impeto_fixo,boost2:c.impeto_extra};
 for(const t of styles){
  const ranked=B.rank(data,t);
  // Goleiro só possui Saving/Goalkeeping; ímpetos fixos existentes são
  // excluídos, e lista vazia é correta se não há outro tipo elegível.
  assert(role==='GO'?ranked.length<=2:ranked.length>=2,
   'Ranking não esperado #'+c.numero+' '+c.posicao+' '+t);
  assert(ranked.every(x=>x.funcao_considerada===role),'Função divergente #'+c.numero);
  assert(ranked.every(x=>Array.isArray(x.atributos)&&x.atributos.length===4));
  const adapted=S.booster({...data,capture:c.numero,id:c.id},t,B);
  if(ranked.length){
   assert(adapted.primary,'Adapter sem ímpeto para #'+c.numero);
   assert.equal(adapted.primary.funcao_considerada,role);
   assert.equal(adapted.primary.nome,ranked[0].nome);
  }else assert.equal(adapted.primary,null,
   'Não inventar terceiro tipo de ímpeto elegível para goleiro');
  assert.equal(adapted.able,false,'Sem confirmar slot local: não equipável');
  evaluations++;
 }
 assert.equal(JSON.stringify(c),original,'Build alterada #'+c.numero);
}
assert.equal(evaluations,1230);
assert.equal(mlEs,8);assert(lefts>=13);
const martinelli=cards.find(c=>c.numero===191);
assert(martinelli&&martinelli.posicao==='PTE'&&martinelli.pp===50&&martinelli.max_level===26);
const values=new Map();
const memory={getItem:k=>values.has(k)?values.get(k):null,
 setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
assert.equal(V.confirmedRole(martinelli,'CA',P,memory).eligible,false);
P.confirm(martinelli,'CA',true,memory);
assert.equal(V.confirmedRole(martinelli,'CA',P,memory).evidence,'treinada');
const asCA={posicao:'PTE',shown_position:'CA',role_used:'CA',
 estilo_ataque:martinelli.estilo_ataque,estilo_defesa:martinelli.estilo_defesa,
 habilidades_nativas:martinelli.habilidades_nativas,niveis:martinelli.niveis,
 impeto_fixo:martinelli.impeto_fixo,impeto_extra:martinelli.impeto_extra,
 boost1:martinelli.impeto_fixo,boost2:martinelli.impeto_extra};
for(const tactic of styles){
 const ranked=B.rank(asCA,tactic);
 assert.equal(ranked[0].funcao_considerada,'CA');
 assert.equal(T.roleOf(asCA),'CA');assert.equal(S.roleOf(asCA),'CA');
 const adapted=S.booster({...asCA,capture:191,id:martinelli.id},tactic,B);
 assert.equal(adapted.primary.nome,ranked[0].nome);
 assert.equal(adapted.primary.funcao_considerada,'CA');
 const original=B.rank({...asCA,shown_position:'PTE',role_used:'PTE'},tactic);
 assert.equal(original[0].funcao_considerada,'ALA');
 assert.equal(V.confirmedRole({...martinelli,id:'OUTRA_EDICAO'},'CA',P,memory).eligible,false);
}
P.confirm(martinelli,'CA',false,memory);
assert.equal(V.confirmedRole(martinelli,'CA',P,memory).eligible,false);
assert(read('web/sw.js').includes('v265-booster-role'));
assert(read('package.json').includes('test-booster-role-v265.cjs'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),source);
console.log('V265 PASS: 1230 cenários, 8 MLE, '+lefts+' laterais, Martinelli PTE/CA isolado por V246; 246 cartas preservadas.');
