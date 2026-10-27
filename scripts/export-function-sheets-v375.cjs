'use strict';
/* Consulta reproduzível das mesmas propostas exibidas no app. Não altera catálogo. */
const fs=require('node:fs'),path=require('node:path');
const F=require('../web/craque-friends-training-v228.js'),P=require('../web/craque-positional-v311.js');
const deps={tactical:require('../web/scout-multitactic-engine-v220.js'),
 skills:require('../web/skills-booster-v162.js'),boosters:require('../web/booster-engine-v103.js')};
const web=path.join(__dirname,'../web');
function generate(){
 const originals=JSON.parse(fs.readFileSync(path.join(web,'SCOUT_V69_AUDITORIA.json'),'utf8')).cards;
 const additions=JSON.parse(fs.readFileSync(path.join(web,'ct364-owned-cards.json'),'utf8')).cards;
 const sheets=[];
 for(const c of originals)for(const tactic of F.MODES){
  const m=P.fromPersonal(c);sheets.push(P.compute(m,m.position,tactic).outcome.functionReview);
 }
 for(const c of additions)for(const tactic of F.MODES){
  sheets.push(F.evaluate({localKey:c.key,name:c.name,position:c.position,originalPosition:c.position,
   style:c.style,level:c.maxLevel,pp:c.pp,cardId:c.cardId||'',edition:c.edition,
   nativeSkills:c.observed.nativeSkills.join('; '),skills:'',fixedBooster:'',booster:'',
   boosterSlot:'pendente',trainingLevels:''},tactic,deps).functionReview);
 }
 const adaptations=[];
 for(const [cap,role] of [[90,'SA'],[10,'ZG']])for(const tactic of F.MODES){
  const c=originals.find(x=>x.numero===cap);
  adaptations.push(P.compute(P.fromPersonal(c),role,tactic).outcome.functionReview);
 }
 return {schema:'CRAQUE_FUNCTION_SHEETS_V375',cards:originals.length+additions.length,
  styles:F.MODES,sheetCount:sheets.length,adaptationCount:adaptations.length,
  basis:'Motores existentes V251/V233/V162/V103. Novas propostas de consulta; sem validação em partidas online.',
  limits:['Orçamento do catálogo não comprova nível/edição no jogo.',
   'Sem atributos-base completos: não afirmar melhor build, limites finais ou ganho competitivo.',
   'As 15 adições mantêm PP pendentes; nível simulado não substitui nível máximo.',
   'Adaptações exigem familiaridade/treino da edição exata; skills/ímpetos não são equipados.',
   'Nenhuma build numérica atribuída a Rentão/Blackjhon sem referência específica da edição.'],
  sources:[
   {url:'https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-00',scope:'Estilos ofensivo e defensivo, treino de posição; não valida builds numéricas.'},
   {url:'https://www.konami.com/efootball/pt-br/page/v6/versioninfo_v6-10',scope:'Escolha entre habilidades/posições elegíveis; não prova elegibilidade de uma carta específica.'},
   {url:'https://www.youtube.com/watch?v=T6RSqfhl3Ck',scope:'Transcrição previamente consultada para critérios gerais; sem treino exato destas cartas.'},
   {url:'https://www.tiktok.com/@blackjhontiktok96',scope:'Perfil indicado pelo usuário; conteúdo inacessível nesta revisão, sem atribuição de método específico.'}
  ],sheets,adaptations};
}
if(require.main===module){
 if(!process.argv[2])throw Error('Informe uma pasta de saída para o pacote de consulta.');
 const out=path.resolve(process.argv[2]),data=generate();fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'Novas-fichas-Craque-Tatico.json'),JSON.stringify(data,null,2)+'\n');
 const text=['# Craque Tático — fichas por edição, função e estilo',data.basis,...data.limits,
  '\n## Fontes e limites de atribuição',...data.sources.map(x=>x.url+' — '+x.scope),
  '\n## 261 cartas · cinco estilos · 1.305 fichas',
  ...data.sheets.map(x=>'\n---\n\n```text\n'+F.functionSheetText(x)+'\n```'),
  '\n## Exemplos de adaptação — familiaridade pendente',
  ...data.adaptations.map(x=>'\n---\n\n```text\n'+F.functionSheetText(x)+'\n```')].join('\n\n');
 fs.writeFileSync(path.join(out,'Novas-fichas-Craque-Tatico.md'),text+'\n');
 console.log(JSON.stringify({cards:data.cards,sheets:data.sheetCount,adaptations:data.adaptationCount,
  pending:data.sheets.filter(x=>!x.proposed).length,output:out}));
}
module.exports={generate};
