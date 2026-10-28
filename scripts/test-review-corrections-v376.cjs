'use strict';
const assert=require('node:assert/strict');
const S=require('../web/skills-booster-v162.js'),L=require('../web/skill-names-v196.js');
assert.equal(L.display('Phenomenal Pass'),'Passador nato','Usar correspondência oficial PT-BR, sem perder a habilidade especial na conferência da edição');
assert.equal(S.contextForNative('Passador nato'),'distribuicao');
assert.equal(S.keyFor('Passador nato'),'','Habilidade especial nativa não se torna adicional treinável');
assert.equal(S.keyFor('Phenomenal Pass'),'');
console.log('V376: Passador nato reconhecido como nativa especial; não oferece gasto de token adicional.');
