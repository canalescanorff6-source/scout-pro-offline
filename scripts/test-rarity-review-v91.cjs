'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'../web');
const manifest=JSON.parse(fs.readFileSync(path.join(base,'SCOUT_V91_RARIDADE_REVISAO.json'),'utf8'));
const index=fs.readFileSync(path.join(base,'index.html'),'utf8');
const arts=fs.readdirSync(path.join(base,'cartas'));
assert.equal(manifest.version,'V91');
assert.equal(manifest.total_catalogo,246);
assert.equal(manifest.cartas.length,56);
for(const [group,count] of Object.entries({'divergencia':33,'edicao-pendente':21,'sem-classificacao':2}))
 assert.equal(manifest.cartas.filter(c=>c.grupo===group).length,count,'Lista de revisão divergente');
for(const c of manifest.cartas){
 assert(Number.isInteger(c.numero)&&c.numero>=1&&c.numero<=246);
 const el=index.match(new RegExp('<a class="player-card"[^>]*data-cap="'+c.numero+'"[^>]*>[\\s\\S]*?<\\/a>'));
 assert(el,'Carta original ausente do índice #'+c.numero);
 assert(el[0].includes('data-rarity="'+c.raridade_atual+'"'),'Rótulo atual foi modificado sem consentimento #'+c.numero);
 assert(el[0].includes('src="'+c.imagem+'"'),'Caminho original divergente #'+c.numero);
 assert(arts.includes(path.basename(c.imagem)),'Arte original ausente #'+c.numero);
}
const panel=fs.readFileSync(path.join(base,'raridade-cadastro-v91.html'),'utf8');
assert(panel.includes('✓ Salvar e avançar'));
assert(panel.includes('id="art"'));
assert(panel.includes('id="group"'));
assert(panel.includes('localStorage.setItem(key'));
assert(panel.includes('navigator.clipboard.writeText(text)'));
console.log('V91 OK: 56 candidatos de revisão; 33 divergências, 21 edições pendentes, 2 inconclusivos; 246 artes e raridades originais preservadas.');
