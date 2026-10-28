# Craque Tático V313 — prova documental no histórico posicional

## Continuidade sem reiniciar V311/V312
A `v1.1.824` já publicou seleção da posição de uso para as 246 cartas originais e Outros Elencos. Esta correção atua em lacunas de **integridade e reatividade**, não recria os motores.

## Falha auditada e proteção
A importação de uma coleção no motor V312 recalculava a assinatura local de uma revisão importada mesmo sem conseguir demonstrar que os equipamentos/PP da carta importada eram idênticos aos da fonte. Isso podia fazer o histórico aparecer como **vigente** quando eram diferentes.

V313 introduz `contentSignature`: hash local determinístico da identidade da carta, edição, posição original, PP, nível, estilo, habilidades nativas/equipadas, ímpetos e slots. Não é prova criptográfica nem equivalente a conferência na conta.

- Importação com assinatura documental coerente: reindexar o cenário ao novo ID e manter histórico/revisões/aprovações existentes.
- Importação com dados divergentes: preservar snapshot anterior intacto; sinalizar revisão **desatualizada**, sem reaplicá-la.
- Revisões legadas V311/V312 sem assinatura: preservar histórico, mas não promover automaticamente para vigente.
- Mudança de técnico, estilo ou posição ainda gera chave independente; nenhuma build originalmente aprovada é sobrescrita.
- Não converter uma habilidade sugerida ou slot desconhecido em equipamento confirmado.

## Mapa de posições e reação
`positionMap()` lista as 13 posições e seus status com base no motor V246 por edição, nos casos em que essa documentação existe. Em Outros Elencos, a posição original permanece registrada e as alternativas não são presumidas familiares.

No acervo pessoal, quando o usuário registra familiaridade ou treino de posição por V246, o painel V311 reavalia seu status imediatamente por evento `craque:data-changed`. Não modifica a função original ou um PP.

## Testes de regressão
`scripts/test-position-scenarios-v311.cjs`:
- MAT→SA→MAT, PP e ranking de habilidades/ímpetos independentes.
- 5 estilos, duas versões de técnico, isolamento entre proprietários.
- PTE→CA, 246 cartas intocadas.
- Importação de carta fiel vs. carta com skill equipada diferente.
- Importação de histórico antigo sem prova permanece desatualizada.
- Aprovação histórica não se torna automaticamente nova aprovação.

`scripts/qa-position-v311.py`: Android e Windows validam mapa, seleção, simulação e confirmação documentada instantânea na ficha principal.

## Limites
Não afirmar que a posição selecionada foi treinada, nem estilo ativado, sem comprovação da mesma edição. Integração com todas as vagas das formações não é abordada nesta revisão e não deve ser descrita como concluída. O teste visual Chromium não substitui inspeção física do APK e EXE.
