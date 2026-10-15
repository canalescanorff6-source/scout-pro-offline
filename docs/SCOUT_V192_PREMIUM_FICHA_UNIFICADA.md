# Scout PRO V192 — ficha unificada e acabamento premium

Continuação incremental do redesign V189–V191, seguindo o modelo aprovado para Android e Windows. A imagem original do mockup não está anexada a este PR, então não existe comprovação de equivalência pixel a pixel.

## Ordem visual da ficha
1. Arte original e identidade da carta, preservadas.
2. Treino principal, distribuição de PP e avisos.
3. Dois ímpetos observados no print e recomendação competitiva, sem presumir equipamento.
4. Cinco habilidades adicionais do motor V162, com nativas e já equipadas excluídas.
5. Biotipo com fonte e grau de confiança.
6. Análises técnicas avançadas acessíveis pelo botão existente.

O painel de habilidades é movido, não duplicado, para dentro da ficha principal. Todo cálculo, armazenamento local e navegação interna permanecem no elemento original.

## Paridade e testes
- O arquivo web/scout-premium-v192.css carrega no Android e no Windows pelo bridge compartilhado.
- O CSS entra no cache offline e no fingerprint do código para ambas as plataformas.
- O teste de fingerprint passa a exigir 18 fontes, em vez de 17.
- O teste V192 confere 246 fichas, os dois ímpetos, o motor de cinco habilidades, a inserção única e os breakpoints.
- Nenhuma arte, Card ID, Player ID, PP, habilidade nativa, ímpeto, build, preferências ou backup foi modificado.

## Homologação
CI e build não comprovam identidade pixel a pixel com o mockup. A validação de capturas reais Android/Windows ainda é necessária antes de declarar idêntico.