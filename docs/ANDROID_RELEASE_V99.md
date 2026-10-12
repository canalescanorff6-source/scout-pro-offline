# Scout PRO — assinatura oficial Android V99

**Primeira configuração, uma única vez.** O repositório guarda uma PKCS12 privada criptografada com AES-256-GCM. Ela só pode ser descriptografada com o segredo mestre. Nenhum arquivo privado ou senha está em commits públicos.

1. Baixe o arquivo privado **recovery-key.txt** fornecido nesta conversa e guarde duas cópias protegidas. Não envie esse segredo no chat nem em issues.
2. Abra https://github.com/canalescanorff6-source/scout-pro-offline/settings/secrets/actions
3. Clique em **New repository secret** e informe o nome **ANDROID_RELEASE_SECRET**, com o valor indicado no arquivo privado.
4. Abra https://github.com/canalescanorff6-source/scout-pro-offline/actions/workflows/release.yml e clique **Run workflow** na branch `main`. A validação, o Windows e o Android devem ficar GREEN. O workflow verificará se o APK contém a mesma identidade SHA256 `818a2b4144234810b9e6e68bddb1ccb1cf9f3b6636dcc0adc31536a4fec02c04` antes de anexá-lo à release.
5. No app, toque **Atualizar APK**. O botão **Baixar APK oficial** aparecerá quando houver uma versão assinada superior à instalada.

**Primeira migração:** o APK de teste instalado (ex.: 1.1.52) normalmente tem certificado diferente. Android não permite atualizar por cima de certificado diferente. Faça **Meus dados → Exportar meus dados**, confira que o backup foi salvo, depois desinstale apenas se a assinatura impedir a instalação oficial. Instale a primeira versão oficial e importe o backup em **Meus dados**. A partir dessa instalação, futuras releases oficialmente assinadas atualizam por cima sem desinstalar.

O instalador nunca executa instalação silenciosa: Android exige confirmação. A atualização Windows continua independente. Se perder o segredo mestre e também apagar o segredo do GitHub, perde-se a capacidade de publicar atualizações com esta identidade.
