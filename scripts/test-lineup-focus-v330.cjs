'use strict';
/* V330 — decisão rápida sem gravações; testes de integridade e integração. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const focus=require('../web/craque-lineup-focus-v330.js');
const cards=JSON.parse(read('web/SCOUT_V69_AUDITORIA.json')).cards;
const baseline=JSON.stringify(cards);
assert.equal(cards.length,246,'Acervo original deve continuar com 246 cartas');
assert(Object.isFrozen(focus.FORMATIONS));
assert(Object.isFrozen(focus.STYLE_NAMES));
const base=focus.lineupSummary({formation:'4312',style:'posse',players:11,bench:12});
assert.equal(base.formation,'4-3-1-2');
assert.equal(base.players,11);assert.equal(base.bench,12);
assert.equal(base.style,'Posse de Bola');
assert.match(base.note,/não grava jogadores, PP, habilidades ou ímpetos/);
assert(Object.isFrozen(base));
const alt=focus.lineupSummary({formation:'4213',style:'rapido',players:11,bench:12});
assert.equal(alt.formation,'4-2-1-3');
assert.equal(alt.style,'Contra-Ataque Rápido');
const exp=focus.lineupSummary({experimental:true,players:11,bench:12});
assert.match(exp.heading,/experimental/);
assert.match(exp.line,/nenhuma carta foi homologada/);
const missing=focus.lineupSummary({formation:'desconhecida',style:'inexistente',players:'inf',bench:-1});
assert.equal(missing.formation,'não documentada');
assert.equal(missing.style,'estilo a conferir');
assert.equal(missing.players,0);assert.equal(missing.bench,0);
const session=focus.laboratorySummary({
 formation:'4213',style:'normal',cycle:2,teams:9,restricted:13,reviewed:true
});
assert.equal(session.formation,'4-2-1-3');
assert.equal(session.cycle,2);
assert.equal(session.teams,9);
assert.equal(session.reviewed,false,'Revisão não fica completa antes de 23 restrições');
assert.match(session.warning,/13 de 23/);
const complete=focus.laboratorySummary({restricted:23,reviewed:true});
assert.equal(complete.reviewed,true);
assert.match(complete.warning,/declaradas pelo usuário/);
assert.match(complete.warning,/externa não verificada/);
assert.equal(focus.laboratorySummary({restricted:99}).restricted,23);
assert.equal(focus.laboratorySummary({restricted:-1}).restricted,0);
assert.equal(focus.laboratorySummary({cycle:120}).cycle,1);
assert.equal(focus.mount(),false,'Sem DOM, aprimoramento é inerte e seguro');
const js=read('web/craque-lineup-focus-v330.js'),css=read('web/craque-lineup-focus-v330.css');
const formation=read('web/meu-time-duas-formacoes-v177.html');
const experiment=read('web/meu-time-posse-4312.html');
const lab=read('web/meu-time-testes-v219.html');
for(const [name,text] of [['duas',formation],['experimental',experiment],['laboratório',lab]]){
 assert(text.includes('src="craque-lineup-focus-v330.js"'),name+' não carrega UI de foco');
 assert(text.includes('href="craque-lineup-focus-v330.css"'),name+' não carrega estilo');
}
assert(js.includes('meu-time-posse-4312\\.html')&&!js.includes("textContent?.includes('V176')"),
 'A formação experimental deve usar rota estável, não o texto/versão legada');
assert(js.includes("choice.insertAdjacentElement('afterend',layout)"),'Campo logo após formação');
assert(js.includes("benchPanel.insertAdjacentElement('afterend',tactic)"),'Estilo após titulares e banco');
assert(js.includes("hero.insertAdjacentElement('afterend',series)"),'No laboratório, séries aparecem primeiro');
assert(js.includes("'Ver 12 reservas desta equipe'"),'Banco da equipe disponível');
assert(js.includes("el(doc,'details','ct330-bench-list')"),'Banco da escalação recolhível');
assert(js.includes('blackDeep.open=true'),'Restrições precisam abrir pelo atalho');
assert(js.includes('team.open=true;openAndScroll(team)'),'Atalho abre a primeira equipe');
assert(js.includes("disclosure(doc,audit"),'Análise detalhada continua acessível');
assert(js.includes("if(!benchSection.closest(")===false||js.includes("!players.querySelector('.ct330-team-bench')"),
 'Não envolver bancos repetidamente');
assert(js.includes('doc.body.classList.add('),'Fallback sem mutação do catálogo');
assert(!js.includes('localStorage.setItem('),'A V330 não pode gravar dados');
assert(!js.includes('fetch('),'V330 precisa ser inteiramente offline');
assert(css.includes('.ct330-focus'));
assert(css.includes('.ct330-bench-list:not([open])'));
assert(css.includes('.ct330-quick-action:focus-visible'));
assert(css.includes('@media(max-width:750px)'));
for(const file of ['craque-lineup-focus-v330.js','craque-lineup-focus-v330.css']){
 assert(read('web/sw.js').includes("'./"+file+"'"),'SW deve incluir '+file);
 assert(read('scripts/stamp-bundle-v189.cjs').includes("'"+file+"'"),'Fingerprint deve incluir '+file);
}
assert(read('web/sw.js').includes('v330-lineup-lab-focus'),'Cache offline V330 inválido');
assert.equal(JSON.stringify(cards),baseline);
console.log('V330 PASS: 3 telas + 246 cartas intactas, campo, banco, etapas, acessibilidade e estado de laboratório somente-leitura.');
