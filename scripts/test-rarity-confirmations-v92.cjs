'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../web');
const m=JSON.parse(fs.readFileSync(path.join(root,'SCOUT_V91_RARIDADE_REVISAO.json'),'utf8'));
const audit=JSON.parse(fs.readFileSync(path.join(root,'SCOUT_V69_AUDITORIA.json'),'utf8'));
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const expectedChange=new Map([[104,['DISTINGUIDO','SHOW TIME']]]);
const target=[23,35,36,41,75,79,80,99,100,104,108,109,114,119,120,126,127,141,153,165,167,170,177,185,189,198,199,200,201,204,208,210,215,216,217,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246];
assert.equal(m.version,'V92');assert.equal(m.cartas.length,56);
assert.equal(audit.cards.length,246);assert.equal(audit.summary.raridade_confirmada_pelo_usuario,58);
assert.deepEqual(m.cartas.map(c=>c.numero).sort((a,b)=>a-b),target);
assert.equal(m.confirmacoes.total,56);assert.equal(m.confirmacoes.alteradas,1);
assert.equal(m.confirmacoes.sem_alteracao,55);
let delta=0;
for(const c of m.cartas){
 const original=expectedChange.get(c.numero);
 assert.equal(c.status_raridade,'confirmada');
 assert.equal(c.raridade_confirmada,c.raridade_atual);
 assert.match(c.confirmacao_origem,/usuario/);
 const a=audit.cards.find(a=>a.numero===c.numero);
 assert(a&&a.name===c.nome);
 assert.equal(a.raridade_confirmada,c.raridade_confirmada);
 assert.match(a.raridade_confirmacao_origem,/usuario/);
 if(original){
  assert.equal(c.raridade_anterior,original[0]);assert.equal(c.raridade_confirmada,original[1]);delta++;
 }else assert.equal(c.raridade_anterior,c.raridade_confirmada,'Raridade não autorizada alterada: '+c.numero);
 if(c.grupo==='divergencia'){
  assert(!a.pendencias.includes('Raridade em conflito entre captura do jogo e banco externo'));
  if([75,170].includes(c.numero))assert(!a.pendencias.some(p=>p.includes('Descrição histórica da edição diverge')),'Divergencia ja resolvida #'+c.numero);
  else assert(a.pendencias.some(p=>p.includes('Descrição histórica da edição diverge')));
  const file=path.join(root,'fichas',a.arquivo.replace(/^fichas\//,''));
  const html=fs.readFileSync(file,'utf8');
  assert(!html.includes('RARIDADE: CONFLITO JOGO vs CARD ID'),'Aviso de conflito da raridade não resolvido '+c.numero);
  assert(html.includes('RARIDADE CONFIRMADA VISUALMENTE PELO USUÁRIO'),'Confirmação ausente na ficha '+c.numero);
 }
 const hit=index.match(new RegExp('<a class="player-card"[^>]*data-cap="'+c.numero+'"[^>]*>[\\s\\S]*?<\\/a>'));
 assert(hit,'Carta ausente #'+c.numero);
 assert(hit[0].includes('data-rarity="'+c.raridade_confirmada+'"'));
 assert(hit[0].includes('src="'+c.imagem+'"'),'Imagem original não preservada #'+c.numero);
 if(c.grupo==='divergencia') assert(!hit[0].includes('Raridade a revalidar'));
}
assert.equal(delta,1);
const row104=audit.cards.find(c=>c.numero===104),source=fs.readFileSync(path.join(root,row104.arquivo),'utf8');
assert(source.includes('Frank Rijkaard — SHOW TIME'));
assert(source.includes('Epic — Ajax — ID 88036360719848'),'Histórico da edição apagado');
const row50=index.match(/<a class="player-card"[^>]*data-cap="50"[^>]*>[\s\S]*?<\/a>/);
assert(row50&&row50[0].includes('Raridade a revalidar'),'Carta não confirmada #50 deve ser preservada');
assert.equal((index.match(/<span class="v68-mini-label pending">Raridade a revalidar<\/span>/g)||[]).length,1);
assert.equal(audit.summary.with_pp,246);assert.equal(audit.summary.no_pp,0);
assert.equal(audit.cards.find(c=>c.numero===211).pp,0);
assert.equal(fs.readdirSync(path.join(root,'cartas')).filter(n=>n.startsWith('CAP_')&&n.endsWith('.png')).length,246);
assert.equal(fs.readdirSync(path.join(root,'fichas')).filter(n=>/^\d{3}_.+\.html$/.test(n)).length,246);
console.log('V92/V183 OK: 56 confirmações originais, 2 novas confirmações Distinguido, 2 descrições Show Time reconciliadas, 246 artes intactas.');
