# V297 — publicação conjunta e condicionada dos aplicativos Android/Windows

**Base:** PR #204 V296; a branch V297 inclui os patches acumulados V289–V296, não deve ser integrada em duplicidade com as demais branches.

## Diagnóstico anterior
O job `release` publicava Windows quando `validate`, `windows` e `android` tinham sucesso, **mesmo com `needs.android.outputs.signed == false`**. Depois outro job `release_android` adicionava o APK apenas se assinado, permitindo releases Windows sem correspondente instalável Android. O script `scripts/verify-release-workflow.cjs` exigia esse comportamento como regressão histórica.

Além disso, o modo de assinatura legado fazia `apksigner verify`, mas não comparava o certificado com a identidade oficial imutável da V99.

## Correções efetivas
- Exigir `github.ref == 'refs/heads/main'` **e** `needs.android.outputs.signed == 'true'` na etapa de release.
- Validar hash SHA256 do APK oficial **antes** da chamada de publicação.
- Baixar os dois instaladores e publicá-los no **mesmo job/ação GitHub Release**, após validações de integridade e paridade Android/Windows. Isso reduz a possibilidade de uma release Windows incompleta; não é transação atômica da API do GitHub.
- Barrar certificados Android divergentes do certificado oficial V99 também no caminho de assinatura legado, sem revelar nem modificar chaves.
- Atualizar os verificadores do workflow e acrescentar cenários positivos/negativos e registro JSON reproduzível em `scripts/test-coordinated-release-v297.cjs`.
- Preservar todos os dados, imagens, Card IDs, PP, builds, nativas e ímpetos das 246 cartas.

## Critérios de aceite e limites
- PR com `npm run check`, auditoria física, QA visual e builds de teste Android/Windows GREEN.
- Em PR não há empacotamento oficial assinado; a CI da branch verifica a configuração e compila versões de teste. Não há teste de instalação física, compatibilidade real com certificado do aparelho, nem confirmação de que os segredos privados estão atualmente configurados.
- Sem assinatura oficial, a `main` continua capaz de executar testes e compilar builds de teste, **mas não cria release parcial**.
- Não integrar nem publicar automaticamente até verificar os critérios do Prompt Mestre, especialmente as assinaturas e a compatibilidade real do atualizador. O usuário pode precisar revisar o workflow antes do merge.
- Depois da integração, uma execução na `main` fará `v1.1.<run_number>` apenas com ambos os pacotes elegíveis.

**Retomada:** V297 PR pendente; próximo passo auditar os logs do PR e corrigir regressões, confirmar o certificado e a instalação Android/Windows, revisar dependências cumulativas, só então integrar/publicar ou iniciar V298.
