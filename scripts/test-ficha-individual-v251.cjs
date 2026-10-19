'use strict';
/* V251 — auditoria FORENSE das 246 cartas, cinco estilos, dados por edição.
 * Não é validação de gameplay ou atribuição automática de meta.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const V=require('../web/craque-ficha-individual-v251.js');
const T=require('../web/scout-multitactic-engine-v220.js');
const R=require('../web/craque-role-intelligence-v233.js');
const B=require('../web/booster-engine-v103.js');
const S=require('../web/skills-booster-v162.js');
const sourceText=read('web/SCOUT_V69_AUDITORIA.json');
const source=JSON.parse(sourceText),cards=source.cards;
const before=JSON.stringify(cards);
const summary=V.catalogAudit(cards);
assert.equal(summary.total,246);
assert.equal(summary.withLevelAndBuild,1);
assert.equal(summary.withLevelNoBuild,84);
assert.equal(summary.withBuildNoLevel,161);
assert.equal(summary.withoutLevelAndBuild,0);
assert.equal(summary.duplicateGroups,20);
assert.equal(summary.duplicatedCards,56);
assert.equal(summary.nativeDocumented,243);
assert.equal(summary.baseFlag,14);
assert.equal(summary.confirmedBuildsByGameplay,0);
assert.equal(summary.proposalsAreVerified,false);
const statuses={complete:0,no_build:0,no_level:0,unsupported:0};
const mismatches=[],gaps=[],styleVariations=[];
let proposed=0,withDiffs=0,skipped=0,compared=0,mainCards=0;
for(const c of cards){
 const html=read('web/'+c.arquivo);
 const find=id=>{
  const re=new RegExp('<script id="'+id+'"[^>]*>([\\s\\S]*?)<\\/script>');
  const match=html.match(re);
  assert(match,'JSON da ficha ausente: '+c.numero+' '+id);
  return JSON.parse(match[1]);
 };
 const raw=find('scout-v68-data'),lab=find('lab-data');
 if(!V.exact(c,raw))mismatches.push('#'+c.numero+' CAP/Card ID/nome/edição diferentes');
 if(Number(raw.pp)!==c.pp)mismatches.push('#'+c.numero+' PP HTML '+raw.pp+' != catálogo '+c.pp);
 const canonical=V.sourceFor(c,raw);
 if(!canonical){statuses.unsupported++;continue}
 assert.equal(canonical.capture,c.numero);
 assert.equal(String(canonical.id),String(c.id));
 assert.equal(canonical.native_skills,c.habilidades_nativas);
 assert.equal(canonical.boost1,c.impeto_fixo);
 assert.equal(canonical.boost2,c.impeto_extra);
 assert.equal(canonical.pp,c.pp);
 assert.equal(Boolean(canonical.recommended_levels),V.hasValidBuild(c));
 const peers=V.related(c,cards);
 const groupSignature=V.signature(c);
 for(const peer of peers){
  assert.equal(V.signature(cards.find(x=>x.numero===peer.numero)),groupSignature);
  assert.notEqual(peer.numero,c.numero);
 }
 let variants=new Set();
 for(const style of T.STYLES){
  const review=V.buildReview(c,raw,lab,cards,style.id);
  statuses[review.status]++;
  assert.equal(review.sourceCompatible,true);
  assert.equal(review.evidenceLevel,V.confirmedLevel(c)?'documental_usuario':'pendente');
  assert.equal(review.trainingProof,'sem_teste_independente_de_partida');
  assert.equal(review.nativeSkills.length,c.habilidades_nativas?c.habilidades_nativas.split(';').filter(Boolean).length:0);
  assert.equal(review.role,T.roleOf({shown_position:c.posicao}));
  assert.equal(review.related.length,peers.length);
  assert.equal(review.canDraft,V.confirmedLevel(c),'Sem nível comprovado, não criar build alternativa');
  if(review.canDraft){
   assert(review.proposal,'Orçamento confirmado deve produzir pelo menos uma hipótese: #'+c.numero);
   assert(T.valid(review.proposal.levels),'Vetor V251 inválido #'+c.numero);
   assert.equal(T.total(review.proposal.levels),c.pp,'Gastar PP com custo exato #'+c.numero);
   assert.equal(review.proposal.spent,c.pp);
   if(review.role==='GO')assert(review.proposal.levels.slice(0,7).every(n=>n===0));
   else assert(review.proposal.levels.slice(7).every(n=>n===0));
   assert(!review.proposal.note.includes('homologado'),'Proposta não pode ser homologada');
   variants.add(review.proposal.levels.join(':'));
   proposed++;
   if(review.changes?.length)withDiffs++;
  }else{
   assert.equal(review.proposal,null);
   skipped++;
  }
  const sourceSkills=S.evaluate(canonical,style.id,'');
  assert(sourceSkills);
  if(canonical.native_skills)assert(sourceSkills.nativeKnown,'Nativas cadastradas precisam entrar no motor.');
  const boost=B.rank(c,style.id);
  assert(boost.length>0);
  assert(!boost.some(x=>x.nome===B.boosterName(c.impeto_fixo)));
  compared++;
 }
 if(V.confirmedLevel(c))mainCards++;
 if(variants.size>1)styleVariations.push(c.numero);
 if(V.norm(raw.native_skills)!==V.norm(c.habilidades_nativas))gaps.push({number:c.numero,name:c.name});
}
assert.equal(mismatches.length,0,'Corrigir fontes com identidade ou PP diferentes:\n'+mismatches.join('\n'));
assert.deepEqual(statuses,{complete:5,no_build:420,no_level:805,unsupported:0});
assert.equal(mainCards,85);
assert.equal(proposed,85*5);
assert.equal(skipped,161*5);
assert(styleVariations.length>15,'Estilos precisam gerar propostas realmente distintas quando PP documentados.');
assert(gaps.some(x=>x.number===191),'Falta de habilidades nativas do Martinelli na ficha legada precisa ser detectada.');
const martinelli=cards.find(x=>x.numero===191),raw=JSON.parse(read('web/'+martinelli.arquivo).match(/<script id="scout-v68-data"[^>]*>([\s\S]*?)<\/script>/)[1]);
const correct=V.buildReview(martinelli,raw,{},cards,'posse');
assert.equal(correct.level,26);
assert.equal(correct.pp,50);
assert.equal(correct.status,'complete');
assert(correct.differences.some(s=>s.includes('habilidades nativas')));
assert(correct.differences.some(s=>s.includes('não confirmadas dentro do jogo')));
const wrong={...raw,id:'edição-diferente'};
assert.equal(V.sourceFor(martinelli,wrong),null);
assert.equal(V.buildReview(martinelli,wrong,{},cards,'posse').canDraft,false);
assert.equal(V.sourceFor(martinelli,{...raw,edition:'outro pack'}),null);
assert.equal(V.sourceFor(martinelli,{...raw,pp:66}),null);
// V246: Martinelli #191 é PTE original. CA só vira opção TÁTICA
// quando o usuário confirma treinamento/familiaridade da edição EXATA.
const P=require('../web/scout-position-training-v246.js');
const saved=new Map();
const storage={
 getItem:k=>saved.has(k)?saved.get(k):null,
 setItem:(k,v)=>saved.set(k,String(v)),
 removeItem:k=>saved.delete(k)
};
const beforeTraining=V.buildReview(martinelli,raw,{},cards,'posse',{
 targetPosition:'CA',positionTraining:P,store:storage
});
assert.equal(beforeTraining.status,'unsupported');
assert.equal(beforeTraining.canDraft,false);
assert(beforeTraining.reason.includes('não confirmada'));
const approvedTraining=P.confirm(martinelli,'CA',true,storage);
assert.equal(approvedTraining.eligible,true);
const chosen=V.buildReview(martinelli,raw,{},cards,'posse',{
 targetPosition:'CA',positionTraining:P,store:storage
});
assert.equal(chosen.positionUsed,'CA');
assert.equal(chosen.positionEvidence,'treinada');
assert.equal(chosen.role,'CA');
assert.equal(T.total(chosen.proposal.levels),50);
assert(!chosen.proposal.levels.slice(7).some(Boolean));
const editionOfSomeoneElse={...martinelli,id:'id-edicao-diferente'};
assert.equal(P.status(editionOfSomeoneElse,'CA',storage).eligible,false);
P.confirm(martinelli,'CA',false,storage);
assert.equal(V.buildReview(martinelli,raw,{},cards,'posse',{
 targetPosition:'CA',positionTraining:P,store:storage
}).canDraft,false);
assert(read('web/app-bridge.js').includes("position251.onload=loadReadiness;"),
 'V264 precisa carregar readiness antes do V251 e manter fallback offline');
assert(read('web/app-bridge.js').includes("v264.onload=loadV251;v264.onerror=loadV251;"),
 'Motor V251 permanece acessível mesmo sem arquivo V264 no cache antigo');

// O estado de níveis original continua protegido mesmo após 425 hipóteses.
assert.equal(JSON.stringify(cards),before);
assert.equal(read('web/SCOUT_V69_AUDITORIA.json'),sourceText);
const code=read('web/craque-ficha-individual-v251.js');
const gui=read('web/scout-card-unified-v220.js');
const training=read('web/scout-training-unified-v218.js');
const css=read('web/craque-ficha-individual-v251.css');
for(const name of ['craque-ficha-individual-v251.js','craque-ficha-individual-v251.css']){
 assert(read('web/sw.js').includes("'./"+name+"'"),'Offline sem '+name);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+name+"'"),'Bundle sem '+name);
 assert(read('web/app-bridge.js').includes("v189Root+'"+name+"'"),'App-bridge sem '+name);
}
assert(gui.includes("scoutpro:v251:canonical-data"));
assert(training.includes("scoutpro:v251:apply-proposal"));
assert(training.includes("total(info.levels)!==budget"));
assert(code.includes("scoutpro:v251:apply-proposal"));
assert(code.includes("Não foi encontrada")===false);
assert(!/localStorage\.setItem|cards\.push|recommended_levels\s*=/.test(code),'V251 não pode alterar o acervo.');
assert(css.includes('azul')||css.includes('Azul'));
assert(css.includes('@media(max-width:720px)'));
assert.equal((read('web/index.html').match(/class="player-card"/g)||[]).length,246);
console.log('V251 OK: 246 edições, 85 orçamentos documentados, '+proposed+
 ' propostas experimentais nos cinco estilos, '+skipped+' alternativas bloqueadas sem nível comprovado.');
console.log('V251 DUPLICADOS: '+summary.duplicateGroups+' grupos, '+summary.duplicatedCards+
 ' cartas; '+styleVariations.length+' cartas com hipóteses distintas conforme estilo.');
console.log('V251 FONTE: '+gaps.length+' fichas HTML com habilidades nativas diferentes do catálogo; reconciliadas na interface por CAP + Card ID + edição.');
