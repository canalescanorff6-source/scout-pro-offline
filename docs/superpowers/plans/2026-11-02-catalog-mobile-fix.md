# Correção do catálogo móvel V386

> Executar no worktree existente, com diagnóstico, teste antes da correção e revisão final independente.

**Objetivo:** publicar a correção da contagem do catálogo e da sobreposição dos controles de conta no Android, mantendo Principal/Secundária independentes.

**Base:** 56c2bca / versão oficial 1.1.1284. Pedido atual autoriza corrigir, publicar e atualizar o aplicativo.

**Arquitetura:** o total calculado pelo motor existente permanece a fonte da contagem; o resumo deve observar suas atualizações assíncronas. O cabeçalho móvel já usa posição relativa, mas herda um deslocamento Android pensado para posição fixa/sticky, somado ao padding de segurança do corpo. Corrigir somente esse deslocamento no catálogo, preservando a área segura.

## Critérios e etapas

- [x] Reproduzir falha com as 15 cartas próprias atrasadas, busca/reset e acervos secundários vazio/preenchido. Criar QA de contagem assíncrona e área segura Android de 28/48px em 320–412px.
- [x] Corrigir `scout-finish-v205.js`: atualizar resumo quando `#all-count` mudar; texto de limpar sem quantidade fixa. Corrigir `craque-account-catalog-v385.css`: remover deslocamento duplicado da topbar apenas no catálogo Android.
- [ ] Executar QA focado, catálogo/editor/navegação existentes, oito viewports e todos os checks. Confirmar cliques dos controles, isolamento e preservação dos 246 originais.
- [ ] Revisão independente do diff; PR, CI de Android/Windows/visual; merge e publicação autorizados. Verificar arquivos oficiais, assinaturas e paridade.
- [ ] Backup e atualização Windows; entregar Android no aparelho disponível, respeitando eventual confirmação/restrição do sistema. Não remover instalação ou dados para contornar restrição.

## Evidências / decisões

- Reproduzido: resumo de filtro 246, total real 261 após carregamento assíncrono. V205 só reage a controles.
- Reproduzido: cabeçalho Android relativo com `top:28px` e corpo com padding de 28px; sobreposição de 4px em 320px, pior com área segura maior. No web/Windows não há esse deslocamento.
- Sem alterações a cartas, PP, builds, assinatura, pacote, atualizador ou conteúdo do manual.
- O aparelho conectado não tem o pacote instalado; não confundir com o dispositivo da captura enviada. Captura privada não foi inspecionada por não estar no app.
- Checkpoint de V385 local preservado nesta branch. Arquivos privados e gerados não entram em Git.
- RED: resumo permaneceu em 246 após total 261; depois de corrigir a contagem, falha geométrica em 320px confirmou cabeçalho terminando em 116px e contas começando em 112px. GREEN: ambos os casos passaram, incluindo 28/48px de área segura, duas contas, cadastro real e reset.
- Verificação: 304/304 checks PASS; catálogo V385 em cinco larguras, editor e navegação em três larguras PASS. Matriz ampliada de oito viewports em andamento antes da publicação.
- Revisão independente de toda a correção concluída sem achados: observer sem ciclo/duplicação, reset e isolamento preservados; CSS restrito ao Android/catálogo. Nenhum dado privado ou arte original alterado.
