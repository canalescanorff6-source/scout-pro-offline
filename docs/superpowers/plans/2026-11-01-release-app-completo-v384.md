# Atualização integrada V384

Pedido atual: atualizar o app porque as entregas ficaram fora da instalação. Autorização explícita do mantenedor nesta conversa cobre integração em main, publicação conjunta oficial e atualização Windows com backup. Android físico somente se houver aparelho conectado. AGENTS exige autorização; ela foi dada no pedido atual, continuando a autorização anterior de receber a atualização.

Base: PR311/adf6723, main312992d, release pública1267, Windows instalado1205. Não recomeçar níveis/PP,500formações,contas/fichasporfunção já testados. Compartilhamento de dados pessoais da Secundária permanece fora do Git.

- [x] Teste inicialmente falhando para manual embarcado e acesso interno.
- [x] Importar manual97p/13fichas/6cenas no webDir comum, com origem/proveniência; menu Mais e acesso de retorno.
- [x] Adaptar exportação JSON/PDF às pontes nativas; PDF somente do recurso fixo empacotado, destino escolhido pelo usuário. Sem mudança de assinatura/atualizador.
- [x] Incluir assets no cache único e fingerprint, provar integridade do payload compilado.
- [ ] Rodarcheck:sequential eQAalvo/manual/contas, revisãofinalindependente eCI doHEAD.
- [ ] IntegrarPR311 eaguardarbuild/publicaçãoconjuntaAndroid/Windows.
- [ ] Baixar/verificar5artefatos,APK/assinatura/paridade,backupprivado eWindowsupdate.
- [ ] Importar23cartasprivadas naSecundária somentelocalmente, sepossívelpelaUI;nenhum dado privado nareceita pública.

Limites a declarar:53cartas daSecundária não mostradas;identidadeMessi050pendente;auditoriacompetitivaindividualalém13ediçõesnãoconcluída;rendimentoonline nãovalidado por menus. Esses limites não impedem distribuir as melhorias funcionais existentes.
