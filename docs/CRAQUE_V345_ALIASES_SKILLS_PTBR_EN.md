# V345 — Identidade documental de habilidades: PT-BR/EN e listas multilinha

## Defeito rastreado
O catálogo `skills-booster-v162.js` já contém equivalências documentadas de
nomes, incluindo `One-touch Pass` e `Passe de primeira`, `Double Touch`
e `Toque duplo`, `Through Passing` e `Passe em profundidade`.
A filtragem V344 comparava apenas grafia normalizada, o que podia deixar
uma habilidade nativa em inglês reaparecer como **nova candidata**
em português. Também ignorava quebra de linha como separador de nativas.

## Correção
1. `V324.skillEvidenceKey(nome,keyFor)` só reconhece equivalências se
   a função `V162.keyFor` estiver disponível e tiver uma chave
   documentada. Para nomes não encontrados, mantém o identificador
   textual normalizado, sem propor tradução/família/efeito novo.
2. `V324.screenContextualSuggestions`, `reviewSkillCandidates`,
   `auditEquipmentSelection` e `reviewDraftReadiness` usam a
   mesma chave V162 passada pelo chamador — desde que disponível — para
   detectar nativas, adicionais informadas e duplicatas entre idiomas.
3. A UI V311 passa `host.SCOUT_RECOMMENDATIONS_V162?.keyFor` em
   todos os pontos. O check é novamente feito no clique de salvar e
   `V324.save` aceita um `skillKeyFor` opcional para bloquear
   aliases duplicados em **novas** revisões. Não endurece a leitura nem
   altera registros antigos sem assinatura/carta comprovada.
4. `V324.skillList` passa a dividir também `\n` e `\r`,
   de acordo com o parser já usado no V162. Dados incompletos,
   ausentes ou sem equivalência documentada continuam **pendentes**.
5. Não altera a lista de habilidades oficialmente disponíveis, cinco
   vagas, Card IDs, imagens, builds aprovadas, treinamentos, ímpetos,
   certificado Android ou arquivos de atualização.

## Verificação
- `scripts/test-documented-skill-alias-v345.cjs`: instancia o
   **mesmo V162.keyFor**, checa equivalência PT/EN, ausência de
   inferência para nomes desconhecidos, nativas multilinha,
   filtro/recomendações/editor, rascunho antigo, revisão rejeitada sem
   escrita, isolamento das coleções e 246 cartas originais.
- `scripts/qa-skill-alias-v345.py`: testa o Chromium Android/Windows,
   no acervo externo, com nativa `One-touch Pass`, rascunho legado
   `Passe de primeira`, troca MAT→SA→MAT, bloqueio de salvamento
   inconsistente e reabilitação ao desmarcar.
- Integrado ao `npm run check`, workflow de 8 resoluções e cache
   PWA. A V345 é cumulativa sobre V339–V344, sem merge em `main`.

## Limites
Aliasing de texto não é prova de equipamento no eFootball, liberação
de slot ou qualidade em partida. A confirmação ainda depende da versão
exata da carta, print e evidência no jogo. Em ausência do V162, o código
mantém comparação textual segura, sem atribuir equivalências.
Exigir CI e QA visual completos, compilação Android/Windows,
revisão humana e autorização explícita antes de publicar.
