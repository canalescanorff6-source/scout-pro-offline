# Craque Tático — estado verificado e atualização (18/10/2026)

> Documento de referência datado. Consulte [GitHub Releases](https://github.com/canalescanorff6-source/scout-pro-offline/releases) para identificar a versão mais recente após esta data.

## Baseline verificada

- Repositório: `canalescanorff6-source/scout-pro-offline`, branch `main`, commit `6047f79b6f2070157cb3e8ed148d79924499a958` (18/10/2026).
- Release pública mais recente **na data desta conferência**: `v1.1.425`.
- Artefatos publicados nessa release: `ScoutPRO-Android.apk`, `ScoutPRO-Android.apk.sha256`, `ScoutPRO-Setup-1.1.425.exe`, `ScoutPRO-Setup-1.1.425.exe.blockmap` e `latest.yml`.
- A execução da CI associada à publicação V240 concluiu com sucesso: [workflow](https://github.com/canalescanorff6-source/scout-pro-offline/actions/runs/39155180339).
- O catálogo original contém 246 cartas. Esta documentação não modifica cartas, Card IDs, imagens, PP, builds, escalações nem código de atualização.

## Aviso sobre o README histórico

O `README.md` na raiz ainda contém instruções da implantação inicial **V72**, incluindo a descrição antiga de download Android pelo navegador e passos de primeira publicação. **Não trate esse procedimento histórico como instrução para atualizar o aplicativo atual.** Não reinicialize o repositório nem envie alterações diretamente à `main` para testes. Consulte `AGENTS.md` para o fluxo de contribuição por branch isolada e pull request.

## Atualização Android e Windows em uso

**Android (desde V102):** o botão de atualização baixa o APK oficial **dentro do aplicativo**, sem depender da abertura do navegador. O fluxo nativo confere URL de release, SHA-256, identificador de pacote, versão superior e certificado antes de solicitar permissão e abrir o instalador oficial do Android. Não há instalação silenciosa. Veja [documentação técnica V102](ATUALIZACAO_ANDROID_INTERNA_V102.md).

**Windows:** o Electron usa `electron-updater` e os metadados publicados com a release. O aplicativo oferece confirmação antes de reiniciar para aplicar a atualização. O Windows e o Android possuem fluxos de instalação distintos.

**Limite das evidências:** verificações estáticas, builds e auditoria de compatibilidade entre APKs publicados não provam que a atualização foi concluída em um aparelho físico. Antes de migração de assinatura ou reinstalação, faça e confira um backup. Uma atualização do aplicativo não sincroniza automaticamente os dados locais entre Android e Windows.

## Contribuição segura

1. Criar branch isolada a partir da `main` atual e limitar o diff ao objetivo aprovado.
2. Executar `npm run check` quando houver ambiente Node compatível; verificar os jobs do PR e registrar as limitações.
3. Manter a revisão humana como barreira: não fazer merge, publicar release, trocar assinatura ou alterar dados das 246 cartas sem autorização explícita.

Referências: [releases oficiais](https://github.com/canalescanorff6-source/scout-pro-offline/releases), `AGENTS.md`, `docs/ATUALIZACAO_ANDROID_INTERNA_V102.md` e `.github/workflows/release.yml`.
