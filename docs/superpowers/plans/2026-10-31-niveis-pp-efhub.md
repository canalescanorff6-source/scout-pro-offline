# Conferência integral de níveis e PP — plano

> Executar com superpowers:executing-plans. Revisão independente ao final.

**Objetivo:** conferir as 246 originais + 15 próprias no eFHUB, corrigir níveis/PP com evidência por edição e recalcular as fichas dos cinco estilos.

**Autorização:** pedido explícito de 31/10/2026 para corrigir todos os níveis e PP errados e refazer as fichas. Substitui a restrição anterior de lote de 13 para esta conferência. Não autoriza inventar nível ausente, identidade ou comprovação de desempenho.

**Arquitetura:** fontes públicas e relatório separado de 261 cartas; correção mínima de metadados com arquivo reversível; reutilizar motores de treino e persistência. Orçamento revisado invalida o uso de treino antigo incompatível, preservando o conteúdo anterior no arquivo de revisão/históricos. Propostas recalculadas não viram treino aplicado.

**Tecnologia:** JavaScript offline existente e consultas HTTPS públicas do eFHUB, sem créditos pagos.

## Regras e decisões

- CAP, identidade, edição e arte precisam coincidir; não transportar nível entre cartas do mesmo jogador.
- Fonte: campo público `levelCap`, conferido também na tela limpa. Nível 0/1 de carta treinável pode ser dado ausente: não converter automaticamente em 0 PP.
- Cartas Trending fixas, quando a edição exata documenta ausência de treino, usam 1 nível/0 PP. Demais lacunas ficam explícitas.
- Havertz CAP041: captura do proprietário mostra 32/62 e resposta confirma exibição automática. Página pública limpa retorna 26/50. Usar 32/62 como referência expressamente fornecida pelo proprietário, registrar conflito e não chamá-la de confirmação dentro do jogo.
- Beckham CAP004: página pública retorna 33/64. A conferência local 34/66 é evidência distinta; preservar e sinalizar divergência, sem inventar resolução.
- Guardar campos e vetores anteriores; não escrever nos dados privados do programa instalado durante desenvolvimento.
- Preservar cinco estilos, equipamentos, imagens, armazenamento, assinaturas e atualização.

## Tarefas

- [x] Consultar as 239 URLs públicas vinculadas; nenhum erro de coleta. Conferir variantes/IDs ausentes em pesquisa separada.
- [x] Testar primeiro: limites 0/1, exceção explícita Havertz, reversibilidade e PP correto em todas as superfícies (RED/GREEN).
- [x] Gerar relatório das 261 cartas e correções rastreáveis; 261 níveis com referência (três relatos); identidade exata de Messi050 ainda pendente. Aplicar 34 originais/15 próprias e arquivar treinos do orçamento anterior.
- [x] Recalcular/exportar 1.305 contextos dos cinco estilos com orçamento efetivo; cinco contextos do Messi com aviso de identidade pendente.
- [x] Testar integridade e regressões (289/289), UI original/próprias, histórico com orçamento alterado, laboratório e conferência; revisão independente com os dois achados corrigidos.
- [ ] Abrir PR revisável e consultar CI; nenhuma publicação automática.

## Foco da revisão

- Página de outra edição/ID e fonte sem nível: não alterar orçamento por suposição.
- Fonte pública contra captura do proprietário: registrar ambas e sua origem.
- PP reduzidos: nenhuma ficha antiga acima do orçamento aparece como válida.
- PP aumentados: nova proposta usa orçamento revisado; histórico antigo não é apagado.
- Editor manual/recibos atuais: identidade e escolhas são preservadas e divergências explicadas.

Publicação/instalação ficam separadas da correção e dependem da autorização de produção exigida pelo repositório.
