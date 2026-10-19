'use strict';
/* Scout PRO V221 — derivação auditável, sem alterar o catálogo, PP ou fichas HTML.
 * A edição e o Card ID devem coincidir no índice, nunca somente o nome do jogador.
 */
const fs=require('node:fs'),path=require('node:path');
const createIndex=function createIndex(roster,audit,similar){
 const src=roster.cards,review=audit.cards;
 if(!Array.isArray(src)||src.length!==246||!Array.isArray(review)||review.length!==246||!Array.isArray(similar.groups))throw Error("Fonte incompleta; nenhum índice criado");
 const byNo=new Map(src.map(c=>[Number(c.numero),c]));
 const auditByNo=new Map(review.map(c=>[Number(c.numero),c]));
 if(byNo.size!==246||auditByNo.size!==246)throw Error("Identidade/numeração duplicada");
 const counts=new Map();
 for(const c of src){const id=String(c.id||'');counts.set(id,(counts.get(id)||0)+1)}
 const ppCost=n=>{let p=0;for(let i=0;i<n;i++)p+=1+Math.floor(i/4);return p};
 const trainValid=c=>Array.isArray(c.niveis)&&c.niveis.length===10&&c.niveis.every(n=>Number.isInteger(n)&&n>=0&&n<=20)&&c.niveis.reduce((n,k)=>n+ppCost(k),0)===Number(c.pp);
 const cards=src.map(c=>{
  const no=Number(c.numero),v=auditByNo.get(no);
  if(!v||String(v.card_id)!==String(c.id)||String(v.nome)!==String(c.name)||Number(v.pp)!==Number(c.pp))throw Error("Fonte cruzada divergente #"+no);
  const id=String(c.id||''),pendingID=!id||/^PENDENTE\b/i.test(id)||/N.A.O INFERIDO/i.test(id);
  const idStatus=pendingID?'sem_card_id':(counts.get(id)>1?'card_id_compartilhado':'card_id_no_catalogo');
  const peers=Array.isArray(v.repeticao?.peers)?v.repeticao.peers.map(n=>Number(n)).filter(n=>byNo.has(n)&&n!==no):[];
  const train=trainValid(c)&&c.treino_status!=='proposta_nao_validada'?'treino_registrado':'treino_sem_validacao';
  const skills=String(c.habilidades_nativas||'').split(';').map(x=>x.trim()).filter(Boolean);
  const slot=String(v.impeto_extra_auditoria?.estado||'unverified');
  const notes=Array.isArray(v.pendencias)?v.pendencias.map(s=>String(s)).filter(Boolean):[];
  const pp=Number(c.pp);
  return {
   numero:no,card_id:id,nome:String(c.name),edicao:String(c.versao||''),arquivo:String(c.arquivo||''),pp,
   posicao:String(c.posicao||''),estilo:String(c.estilo_ataque||''),treino:train,
   base_stats_confirmados:c.base_stats_known===true,
   nativas_documentadas:skills.length,modelo_corporal_documentado:v.biotipo_documentado===true,
   print_candidato:v.print_candidato?.arquivo||null,
   print_edicao_confirmada:false,
   segundo_impeto:slot,
   id_status:idStatus,
   card_id_compartilhado_com:!pendingID&&counts.get(id)>1?src.filter(x=>String(x.id)===id&&Number(x.numero)!==no).map(x=>x.numero):[],
   grupo_repetido:v.repeticao?.group||null,
   pares_repetidos:peers,
   candidatas_adicionais:Array.isArray(c.adicionais_candidatas)?c.adicionais_candidatas.length:0,
   pendencias:notes
  };
 });
 const total=(p)=>cards.filter(p).length;
 const info={
  schema:"scout-evidence-index-v221",source:"V69 + V213 + V211, cruzamento por numero e Card ID",total:cards.length,
  registrados:total(x=>x.treino==="treino_registrado"),
  pendentes:total(x=>x.treino==="treino_sem_validacao"),
  repetidos:total(x=>x.pares_repetidos.length>0),
  base_confirmada:total(x=>x.base_stats_confirmados),
  nativas_pendentes:total(x=>x.nativas_documentadas===0),
  ids_pendentes:total(x=>x.id_status==="sem_card_id"),
  ids_compartilhados:total(x=>x.id_status==="card_id_compartilhado"),
  prints_candidatos:total(x=>!!x.print_candidato),
  com_biotipo:total(x=>x.modelo_corporal_documentado),
  politica:"Preservar registro; simulações, skills e ímpetos são consultivos e não homologados sem edição exata"
 };
 if(info.registrados!==161||info.pendentes!==85||info.repetidos!==54)throw Error("Contagens divergentes do acervo oficial");
 return {resumo:info,cards};
};

function load(file){return JSON.parse(fs.readFileSync(path.resolve(__dirname,'../web',file),'utf8'))}
function run(){
 const result=createIndex(load('SCOUT_V69_AUDITORIA.json'),load('SCOUT_V213_AUDITORIA_INDIVIDUAL.json'),load('SCOUT_V211_REPETICOES_REVIEW.json'));
 const file=path.resolve(__dirname,'../web/SCOUT_V221_EVIDENCE_INDEX.json');
 const rendered=JSON.stringify(result,null,2)+'\n';
 if(process.argv.includes('--check')){
  if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==rendered)throw Error('Índice V221 desatualizado: regenere com node scripts/build-card-evidence-v221.cjs');
  console.log('V221 INDEX OK: '+result.resumo.total+' cartas · '+result.resumo.registrados+' registrados · '+result.resumo.pendentes+' pendentes · '+result.resumo.repetidos+' repetidos');
 }else{fs.writeFileSync(file,rendered,'utf8');console.log('Índice V221 gerado: '+file)}
 return result;
}
if(require.main===module)run();
module.exports={createIndex,run};
