'use strict';
/* V256 — a validação de PP de uma edição tem dois estágios:
 * 1) custo da build fecha; 2) nível máximo/origem documental confiáveis.
 * O primeiro NÃO substitui o segundo, independentemente da tática.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const original=read('web/SCOUT_V69_AUDITORIA.json');
const catalog=JSON.parse(original).cards;
const T=require('../web/scout-multitactic-engine-v220.js');
const E=require('../web/craque-role-intelligence-v233.js');
const styles=['posse','normal','rapido','fora','longo'];
assert.equal(catalog.length,246);
assert.equal(new Set(catalog.map(c=>String(c.numero)+'@'+String(c.id))).size,246);
let documented=0,withoutLevel=0,mathematicalButUnverified=0,checks=0;
for(const card of catalog){
 const input={...card,capture:card.numero,edition:card.versao,
  shown_position:card.posicao,native_skills:card.habilidades_nativas,
  recommended_levels:card.niveis};
 const proof=E.levelDocumented(input);
 if(proof)documented++;else withoutLevel++;
 if(!proof&&T.confirmSource(input))mathematicalButUnverified++;
 const before=JSON.stringify(input);
 for(const mode of styles){
  const analysis=E.interpret(input,mode,{});
  const out=E.compare(input,mode,{});
  assert(analysis);
  assert.equal(analysis.levelDocumented,proof);
  if(!proof){
   assert.equal(out.proposal,null,
    'Sem nível documental, não simular redistribuição automática da edição #'+card.numero);
   assert.equal(out.analysis.uncertainty,'pendente');
   assert(out.reason.includes('Nível máximo'));
   assert(analysis.tradeoffs.some(t=>t.includes('sem confirmação documental')));
  }
  if(out.proposal){
   assert(proof&&analysis.confirmed,'Hipótese exige nível/PP documentados e custo exato');
   assert.equal(T.total(out.proposal.levels),card.pp);
   assert.equal(out.proposal.source,'hipotese_v233');
   assert(out.proposal.note.includes('não foi testada em partidas'));
  }
  checks++;
 }
 assert.equal(JSON.stringify(input),before,'Motor de fichas alterou carta '+card.numero);
}
assert.equal(documented,85);
assert.equal(withoutLevel,161);
assert(mathematicalButUnverified>0,
 'O risco de PP matematicamente completos, porém não confirmados, precisa estar coberto');
assert.equal(checks,1230);
const martinelli=catalog.find(c=>c.numero===191);
assert.equal(martinelli.max_level,26);
assert.equal(martinelli.pp,50);
assert(E.levelDocumented(martinelli));
for(const mutation of [
 {...martinelli,max_level:34,pp:50},
 {...martinelli,max_level:26,pp:66},
 {...martinelli,pp_origem:'estimado_pelo_modelo'},
 {...martinelli,pp_estimado:true},
 {...martinelli,max_level:undefined},
 {...martinelli,max_level:'26'}
]){
 assert.equal(E.levelDocumented(mutation),false,'Alteração invalida prova documental');
 const card={...mutation,capture:191,edition:martinelli.versao,
  shown_position:martinelli.posicao,recommended_levels:martinelli.niveis};
 assert.equal(E.compare(card,'posse',{}).proposal,null);
}
const engine=read('web/craque-role-intelligence-v233.js');
assert(engine.includes("const hasLevelEvidence=levelDocumented(card)"));
assert(engine.includes("if(!analysis||!analysis.confirmed||!analysis.levelDocumented"));
assert(read('web/sw.js').includes('v256-level-proof'));
assert(read('package.json').includes('test-level-proof-v256.cjs'));
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),original);
console.log('V256 OK: '+checks+' combinações; '+(withoutLevel*5)+
 ' hipóteses bloqueadas por falta de comprovação de nível; '+
 documented+' edições com fonte de nível documentada.');
console.log('V256 OK: '+mathematicalButUnverified+
 ' cartas tinham custo fechado mas nível sem prova; ficha original e PP preservados.');
