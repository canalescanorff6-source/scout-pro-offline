# Craque Tático — Android e Windows

**Atualização de 30/10/2026: [v1.1.1184 publicada e verificada](https://github.com/canalescanorff6-source/scout-pro-offline/releases/tag/v1.1.1184).** Inclui editor individual de nível/PP/raridade/Overall máximo e correções verificadas de navegação Windows, cache offline e layout móvel.

- [APK Android oficial](https://github.com/canalescanorff6-source/scout-pro-offline/releases/download/v1.1.1184/ScoutPRO-Android.apk) — atualizar por cima da instalação oficial anterior, preservando dados.
- [Instalador Windows 1.1.1184](https://github.com/canalescanorff6-source/scout-pro-offline/releases/download/v1.1.1184/ScoutPRO-Setup-1.1.1184.exe).
- [Última release disponível](https://github.com/canalescanorff6-source/scout-pro-offline/releases/latest) · [checkpoint](docs/CLAUDE_PROGRESS.md) · [revisão e limites](docs/CLAUDE_APP_AUDIT.md).

## Histórico da base V72

**O que existe neste pacote:** código-fonte para Windows (Electron/NSIS) e Android (Capacitor 8), catálogo completo de 246 cartas e suas imagens, verificações automáticas, laboratório de PP e rotina de atualização usando GitHub Releases. O projeto **não contém um EXE ou APK já compilado**: estes serão gerados no GitHub Actions após envio dos arquivos.

**Repositório separado e já criado:** https://github.com/canalescanorff6-source/scout-pro-offline

## As 21 cartas corrigidas

As imagens 226–246 foram substituídas **pelas 21 novas artes enviadas pelo usuário**, inclusive Justin Kluivert. Corrigido também o cartão de imagem no modo mobile que ainda mostrava um marcador de imagem ausente. As demais 225 artes, builds e fichas foram preservadas. Confira `web/V72_AUDITORIA_21_ARTES.json` com os identificadores SHA-256 para cada imagem nova.

A versão anterior V71 serve como backup das antigas imagens. Imagens antigas não ficam embarcadas no novo aplicativo para não ocupar espaço nem reaparecer.

## 1. Publicar o código no GitHub, sem serviço pago

1. Extraia o ZIP inteiro no Windows, incluindo a pasta oculta `.github`.
2. Instale **Git for Windows** se não tiver: https://git-scm.com/downloads/win (gratuito).
3. No PowerShell, dentro da pasta extraída, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\PUBLICAR_NO_GITHUB_WINDOWS.ps1
```

Esse script confirma o destino **somente** `canalescanorff6-source/scout-pro-offline` e envia para a branch `main`. Será necessário entrar no GitHub no próprio PC se solicitado. **Não inclua o diretório-pai do ZIP**: envie os arquivos do projeto direto para a raiz do repositório. Alternativamente:

```powershell
git init
git branch -M main
git add .
git commit -m "Scout PRO V72"
git remote add origin https://github.com/canalescanorff6-source/scout-pro-offline.git
git push -u origin main
```

Um `push` à `main` dispara **Actions > Scout PRO | CI, Windows, Android e Releases**. Alterações feitas e confirmadas direto pelo editor do GitHub também disparam o CI. **Uma edição apenas nos arquivos do computador não pode aparecer automaticamente no GitHub sem fazer `git push`**.

## 2. Primeiro teste, antes da assinatura

O CI confere 246 fichas, 246 imagens, links, JavaScript, integridade das 21 imagens novas e gera:

- Instalador **Windows `.exe`**, disponível na aba **Actions > Artifacts** após o job passar.
- **APK Android de TESTE**, com chave debug temporária, também em **Actions > Artifacts**. É apenas para testes: **não use como versão definitiva** ou depois pode não conseguir atualizar sobre ela.

A geração de **Releases oficiais** é bloqueada enquanto os quatro segredos de assinatura Android não estiverem configurados. Não será publicado APK provisório por engano. Se apenas alguns segredos forem configurados, o job falha de propósito, para deixar o erro claro.

## 3. Ativar versões oficiais e atualizações pelo GitHub

Gere **uma única chave Android** que será preservada em todas as versões futuras:

```powershell
keytool -genkeypair -v -keystore scout-pro-release.jks -alias scoutpro -keyalg RSA -keysize 3072 -validity 10000
```

`keytool` vem com o JDK, por exemplo Temurin 21. Nunca envie essa chave ao repositório! Guarde também as senhas em lugar seguro e faça cópia privada do `.jks`.

No repositório abra **Settings > Secrets and variables > Actions > New repository secret** e registre exatamente estes quatro segredos:

| Segredo | Conteúdo |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64 do arquivo `.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Senha da keystore |
| `ANDROID_KEY_ALIAS` | `scoutpro` |
| `ANDROID_KEY_PASSWORD` | Senha do alias (pode ser a mesma) |

Converter `.jks` em Base64 no PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("scout-pro-release.jks")) | Set-Clipboard
```

Feito isso, abra **Actions > Scout PRO | CI, Windows, Android e Releases > Run workflow** para criar a primeira versão oficial. As próximas versões são produzidas ao editar qualquer arquivo de código, ficha ou imagem e fazer `push` em `main`. A GitHub Release inclui `ScoutPRO-Setup-<version>.exe`, `latest.yml` e `ScoutPRO-Android.apk` assinado e verificado.

**Atenção:** a instalação Android de uma versão nova sempre precisa da confirmação do Android/usuário; não há instalação silenciosa. A assinatura de APK tem de ser a **mesma em todas as versões**. Se você instalar um APK debug, terá de desinstalá-lo para instalar a versão oficial — faça antes backup dos treinos.

## 4. Funcionamento offline e atualização

| Função | Windows | Android |
|---|---|---|
| Consultar todas as fichas e imagens offline | Sim | Sim |
| Usar e ajustar laboratório de PP | Sim | Sim |
| Salvar dados e exportar backups | Sim | Sim |
| Verificar novas versões ao estar online | Sim | Sim |
| Download e instalação | Baixa automaticamente; pede confirmação para reiniciar | Abre navegador/arquivo APK; instalação depende de permissão |

O Windows usa `electron-updater` e releases públicas do GitHub com metadados e checksums SHA-512; a atualização é procurada ao abrir e a cada 4h. A build Windows não inclui certificado de assinatura paga e **pode acionar alertas do Windows SmartScreen**. O projeto está configurado explicitamente sem verificação de assinatura Authenticode (`verifyUpdateCodeSignature: false`), pois não existe certificado Windows. Para uma distribuição mais segura fora do uso pessoal, o recomendado é autenticar e assinar os binários.

O Android consulta a última release pela internet, baixa um APK assinado via navegador e solicita autorização de instalação. **Todo o conteúdo do Scout PRO já está dentro do aplicativo**. O Service Worker/PWA não é usado no app Android nativo, evitando imagens antigas em cache após atualizações. Se estiver offline, nenhuma tela do catálogo precisa acessar GitHub.

**Os dados pessoais não são enviados ao GitHub.** Eles permanecem no armazenamento local. Faça backup pelo botão **Meus dados** antes de limpar dados do app ou trocar de dispositivo.

## 5. Editar novas cartas ou builds

As fichas estão em `web/fichas/`, as artes em `web/cartas/`, a página inicial em `web/index.html`. Alterações salvas localmente devem ser enviadas para o GitHub (pelo script de publicação ou por `git push`). No GitHub, modificações na `main` disparam build e lançamento; não é necessário contratar servidor, domínio ou banco de dados.

Para testar o projeto localmente antes de publicar:

```bash
npm install
npm run check
npm run desktop:dev
```

Para gerar EXE local use Windows; para gerar APK local instale também JDK 21/Android SDK, rode `npm run android:init`, `npm run android:sync` e compilação. **O projeto é um app instalável com interface web embarcada em Electron/Capacitor**, não uma reescrita em Kotlin nativo. Requer internet **somente na primeira instalação das dependências de compilação e no recebimento de atualizações**.

## 6. Limitações e privacidade

- O repositório `scout-pro-offline` é **público**: código e imagens das 246 cartas ficam públicos ao fazer o `push`. Verifique se deseja publicar esse acervo contendo materiais de eFootball/Konami e evite enviar qualquer dado privado ou credenciais. Para uso pessoal privado, publicar código e imagens no GitHub público **não é obrigatório** para instalar versões feitas localmente.
- O download das dependências e os testes reais de APK/EXE não foram executados neste ambiente. O código passou em verificações estáticas, mas **não constitui uma garantia de compilação GREEN ou de funcionamento físico**.
- A implementação de builds continua sendo orientação técnica, não validação de que todas as 246 cartas atingem desempenho máximo.
- **Atualização de código** não sincroniza automaticamente seus registros locais entre PC e celular: use o backup/exportação dos seus dados quando necessário.

## Estrutura principal

- `.github/workflows/release.yml`: validação, builds, assinatura persistente, publicação condicional.
- `desktop/`: janela Electron, protocolo local e atualizador Windows.
- `web/`: catálogo e 246 fichas/246 imagens, UI e barra de backup/atualização.
- `scripts/`: validação dos arquivos, auditoria das 21 imagens, versionamento, metadados Windows.
- `PUBLICAR_NO_GITHUB_WINDOWS.ps1`: publica somente no repositório Scout PRO correto.

## Correção de atualização Android V93

O botão **Atualizar** do aplicativo Android só apresenta arquivos chamados `ScoutPRO-Android.apk` publicados em GitHub Releases. Instaladores Windows e APKs de teste não podem ser usados como atualização oficial. A verificação ocorre ao abrir o aplicativo e ao retornar para ele após quatro horas; o download e a instalação dependem de confirmação do usuário.

Para habilitar atualizações Android estáveis, configure os quatro segredos de assinatura `ANDROID_*` citados acima com **uma keystore privada e permanente**. Sem isso, a CI compila apenas APK de teste, cujo certificado pode variar entre máquinas/execuções. O certificado do APK instalado tem de coincidir com o da nova versão. Se o aplicativo foi instalado com chave de teste diferente, exporte **Meus dados** antes de desinstalar e instalar a primeira versão oficial. Nunca envie a keystore ou senhas na conversa nem no código do GitHub.

Os PP de todas as 246 cartas estão registrados, mas 84 fichas ainda não possuem distribuição de atributos aprovada. Esses valores serão tratados em uma etapa específica, sem gravar heurísticas como builds confirmadas.

## V96 — Atualizar APK no Android

Dentro do APK, toque em **Atualizar APK**. O painel exibe a versão instalada, a versão oficial Android mais recente (quando publicada), o botão **Verificar atualização**, **Baixar APK oficial** (somente quando a release contém um APK oficial assinado) e **Fazer backup**. O usuário autoriza o download e a instalação. O programa Windows mantém seu atualizador independente.

**Importante:** a assinatura oficial deve usar a mesma chave do APK Android já instalado para permitir atualização sobre a instalação existente. As quatro secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`) precisam ser configuradas privadamente em GitHub Actions. Nunca compartilhe a keystore ou senhas no chat. Se a instalação atual usa certificado de teste diferente, faça backup e teste a restauração antes de qualquer reinstalação. APKs de teste dos artefatos da CI não são oferecidos pelo painel como atualizações.
