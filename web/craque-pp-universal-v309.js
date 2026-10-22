/* V309 — regra de PP compartilhada entre todas as cartas e acervos.
 * Orçamento matemático exato quando o nível MÁXIMO desta edição é conhecido.
 * Não comprova a edição nem substitui PP manuais e builds existentes.
 */
(function(host,factory){'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(host)host.CRAQUE_PP_UNIVERSAL_V309=api;
})(typeof window!=='undefined'?window:null,function(){'use strict';
const MIN_LEVEL=1,MAX_LEVEL=120;
function budget(maxLevel){
 return Number.isInteger(maxLevel)&&maxLevel>=MIN_LEVEL&&maxLevel<=MAX_LEVEL?
  2*(maxLevel-1):null;
}
function resolve(card){
 const level=Number.isInteger(card?.max_level)?card.max_level:card?.level;
 const expected=budget(level);
 const manual=card?.pp;
 if(Number.isInteger(manual)&&manual>=0&&manual<=300){
  if(expected!==null&&expected!==manual)return Object.freeze({
   pp:manual,manual,expected,level,source:'manual_divergente',
   reason:'DIVERGÊNCIA: nível máximo '+level+' corresponde a '+expected+
    ' PP, mas foram informados '+manual+
    ' PP manualmente. Preservado para consulta; confira antes de homologar.'
  });
  return Object.freeze({pp:manual,manual,expected,level,source:'manual',reason:null});
 }
 if(expected!==null)return Object.freeze({
  pp:expected,manual:null,expected,level,source:'nivel_maximo',reason:null
 });
 return Object.freeze({pp:null,manual:null,expected:null,level:null,source:'pendente',
  reason:'Informe o NÍVEL MÁXIMO comprovado da carta, não seu Overall nem nível atual.'});
}
return Object.freeze({budget,resolve,MIN_LEVEL,MAX_LEVEL});
});
