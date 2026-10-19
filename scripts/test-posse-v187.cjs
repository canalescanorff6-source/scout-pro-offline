'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const web=path.resolve(__dirname,'../web');
const read=p=>JSON.parse(fs.readFileSync(path.join(web,p),'utf8'));
const S=require('../web/skills-booster-v162.js'),B=require('../web/booster-engine-v103.js');
const P=require('../web/scout-posse-v187.js');
const roster=read('SCOUT_V69_AUDITORIA.json').cards;
const photos=read('SCOUT_V184_EFHUB_241_COMPLETE.json');
assert.equal(roster.length,246);
assert.equal(photos.image_manifest.length,241);
assert.equal(photos.visual_observations.length,15);
assert.equal(P.matchPhysical(75,photos).length,1);
assert.equal(P.matchPhysical(225,photos).length,1);
assert.equal(P.matchPhysical(246,photos).length,0);
const sample=P.compactModel(P.matchPhysical(75,photos)[0]);
assert.equal(sample.height,180);
assert.equal(sample.source,'Luis_D_az_efhub.jpg');
assert.equal(sample.cardIdSeen,false);
assert(sample.leg&&sample.arm&&sample.collision);
assert.equal(P.compactModel(null),null);
assert.equal(S.keyFor('Chute de primeira'),S.keyFor('First-time Shot'));
assert.equal(S.keyFor('Reposição alta do GO'),S.keyFor('GK High Punt'));
assert.equal(S.keyFor('Precisão à distância'),S.keyFor('Long-range Shooting'));
assert.equal(S.keyFor('Chute ascendente'),'','Não confundir Rising Shot com Long-range Shooting');
let inspected=0,unproven=0,withBooster=0;
for(const c of roster){
 const d={capture:c.numero,id:c.id,shown_position:c.posicao,role_used:c.posicao,
 attack_style:c.estilo_ataque,defence_style:c.estilo_defesa,native_skills:c.habilidades_nativas,
 additional_candidates:c.adicionais_candidatas,boost1:c.impeto_fixo,boost2:c.impeto_extra};
 const skills=S.evaluate(d,'posse');
 assert(skills.recommendations.length>=1&&skills.recommendations.length<=5,'Top 5 faltando '+c.numero);
 const native=new Set(String(c.habilidades_nativas||'').split(';').map(S.keyFor).filter(Boolean));
 for(const skill of skills.recommendations)assert(!native.has(skill.key),'Skill nativa duplicada '+c.numero+': '+skill.key);
 const ranked=S.booster(d,'posse',B);
 assert(ranked.primary&&B.CRAFTABLE.includes(ranked.primary.nome),'Ímpeto de posse não calculado '+c.numero);
 assert(ranked.primary.atributos.length===4);
 assert(['slot_nao_documentado','slot_nao_verificado','condicionado_a_slot','comparacao_segundo_fixo','impossivel_na_conta'].includes(ranked.equipStatus));
 if(!ranked.able)unproven++;if(ranked.primary)withBooster++;inspected++;
}
assert.equal(inspected,246);assert.equal(withBooster,246);assert(unproven>=100);
const ronaldo=roster.find(x=>x.numero===24);
const double=S.booster({shown_position:ronaldo.posicao,boost1:ronaldo.impeto_fixo,boost2:ronaldo.impeto_extra},'posse',B);
assert(double.primary);assert.equal(double.able,false);assert.equal(double.equipStatus,'comparacao_segundo_fixo');
const none=S.booster({shown_position:'VOL',boost1:'PENDENTE',boost2:'PENDENTE'},'posse',B,'ausente');
assert(none.primary);assert.equal(none.able,false);assert.equal(none.equipStatus,'impossivel_na_conta');
const bridge=fs.readFileSync(path.join(web,'app-bridge.js'),'utf8');
const main=fs.readFileSync(path.join(web,'scout-posse-v187.js'),'utf8');
const posseCss=fs.readFileSync(path.join(web,'scout-posse-v187.css'),'utf8');
const sw=fs.readFileSync(path.join(web,'sw.js'),'utf8');
const rarity=fs.readFileSync(path.join(web,'raridade-cadastro-v91.html'),'utf8');
const skills=fs.readFileSync(path.join(web,'skills-booster-v162.js'),'utf8');
assert(bridge.includes("scout-profile-v188.js")&&bridge.includes("scout-profile-v188.css"),"Layout unico V188 substitui o painel redundante V187");
assert(sw.includes("./scout-posse-v187.js")&&sw.includes("./scout-posse-v187.css"));
assert(sw.includes('v187-posse'));
assert(main.includes("localStorage.getItem(KEY)"),'Preferencia da ficha tem que persistir');
assert(posseCss.includes('section.topic')&&main.includes('Ver análises detalhadas'),'Seções antigas devem recolher e continuar acessíveis');
assert(main.includes('compactModel')&&main.includes('get(x.arm'),'Biotipo só onde houver evidência');
assert(skills.includes('Ímpeto para comparar em'), 'A ficha V254 deve apresentar a opção como consultiva, não automaticamente como melhor');;
assert(skills.includes('não uma opção para substituir'));
assert(rarity.includes('Somente mudanças ainda não enviadas'));
assert(rarity.includes('Raridades desta revisão: tudo registrado'));
assert(rarity.includes('candidates.filter(c=>saved[c.numero]?.raridade&&saved[c.numero].raridade!==c.raridade_confirmada)'));
for(const card of ['fichas/075_Luis_Diaz.html','fichas/181_Serhou_Guirassy.html','fichas/225_Rodri.html']){
 const h=fs.readFileSync(path.join(web,card),'utf8');assert(h.includes('app-bridge.js'),'Integração da ficha '+card);
}
console.log('V187 OK: 246 prioridades de ímpeto, skills sem duplicatas nativas, 15 dados físicos rastreáveis, 56 raridades com revisão pendente isolada e ficha principal de Posse.');
