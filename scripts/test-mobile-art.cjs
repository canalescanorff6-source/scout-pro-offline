'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../web');
const meta=JSON.parse(fs.readFileSync(path.join(root,'V72_AUDITORIA_21_ARTES.json')));
if(meta.cartas.length!==21)throw Error('Era esperado o lote de 21 cartas atualizado');
for(const p of meta.cartas){
 const bytes=fs.readFileSync(path.join(root,'cartas',p.arquivo));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==p.sha256)throw Error('Arte alterada sem conferência: '+p.nome);
 const f=fs.readdirSync(path.join(root,'fichas')).find(n=>n.startsWith(String(p.ficha)+'_'));
 if(!f)throw Error('Ficha ausente: '+p.ficha);
 const html=fs.readFileSync(path.join(root,'fichas',f),'utf8');
 if(!html.includes('class="mobile-profile"><img')||!html.includes('../cartas/'+p.arquivo))throw Error('Arte mobile ausente: '+p.ficha);
 if(html.includes('Imagem original<br/>não disponível'))throw Error('Placeholder antigo: '+p.ficha);
}
console.log('PASSOU: 21 artes novas e visualização mobile vinculadas corretamente.');
