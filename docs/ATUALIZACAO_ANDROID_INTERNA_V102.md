# Atualização Android interna V102 — Scout PRO
## Objetivo
A partir do APK V102, o menu **Atualizar APK** baixa o arquivo oficial **dentro do Scout PRO** e mostra o progresso sem abrir o Google Chrome. O arquivo fica no cache privado do app e só é oferecido ao instalador nativo do Android após:
1. Download somente de `github.com/canalescanorff6-source/scout-pro-offline/releases/download/v*/ScoutPRO-Android.apk`;
2. Consulta e conferência do SHA-256 publicado ao lado do APK pela CI;
3. Conferência do pacote `br.com.scoutpro.offline` e `versionCode` **superior**;
4. Conferência da assinatura do APK atual contra a assinatura do APK baixado;
5. Permissão explícita do usuário para instalar apps a partir do Scout PRO e confirmação do instalador Android.

O APK V102 **não** instala nada em silêncio. O Android abre seu instalador oficial e pede confirmação. Requer conexão durante o download; o catálogo continua offline.
## Limitação inevitável: assinatura incompatível
Se o APK anteriormente instalado tiver assinatura diferente — por exemplo, um APK **debug/teste** ou emitido com outro certificado — **nenhum método de download** permite atualizar por cima sem desinstalar. O próprio sistema Android barra essa substituição.
- O app mostrará mensagem **ASSINATURA INCOMPATÍVEL** e impedirá tentar instalar o APK incompatível.
- **Nunca desinstale antes de exportar, localizar e verificar o backup** pelo botão **Meus dados**.
- Faça uma **migração única e manual**, instalando a release oficial assinada permanentemente e restaurando o backup. Quando esta identidade estável estiver instalada, as próximas releases oficiais poderão ser instaladas por cima sem perder os dados.
- O código não executa desinstalação nem apaga dados do usuário.
## Primeira transição para V102
O APK antigo (V101 e anteriores) **não possui o plugin nativo**. Não é possível adicionar código Java ao APK instalado apenas com uma alteração no GitHub. Para entrar no novo fluxo, o usuário deve instalar **uma única vez** o APK V102 publicado pela CI; se o atual já compartilha o certificado oficial, pode instalar por cima pelo método anterior. Se o Android rejeitar a assinatura, use o processo de backup e migração descrito acima.
## Assinatura
O projeto oficial V99 usa assinatura estável, protegida no CI. Este atualizador **não cria nem modifica o certificado** e não consegue contornar validações de assinatura do sistema operacional.
## Arquitetura
- Fonte: `native/android/ScoutUpdaterPlugin.java` — plugin Capacitor 8.
- Injeção na compilação: `scripts/install-native-updater-v102.cjs` entre `cap add android` e `cap sync android`.
- Manifest: `android.permission.REQUEST_INSTALL_PACKAGES`, `FileProvider` privado limitado a `cache/scout-updates/`.
- UI: `web/app-bridge.js`, `web/app-bridge.css`. Windows não usa o plugin.
- Verificações: `node scripts/test-native-updater-v102.cjs`, `npm run check`, compilação Android e Windows no PR, e CI principal completa após merge.
## Avisos
A compilação sem erros confirma que o pacote foi construído, mas não substitui teste de instalação em aparelho físico com diferentes versões e assinaturas. O botão **Meus dados** continua sendo obrigatório antes de uma migração de certificado.
