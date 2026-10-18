# AGENTS.md — Craque Tático (Scout PRO Offline)

## Missão e escopo
Evoluir incrementalmente o aplicativo existente **Craque Tático — Laboratório de Futebol** (eFootball 2027), com frontend offline em `web/`, desktop Electron em `desktop/` e Android Capacitor em `native/` e arquivos relacionados. **Não recriar o projeto**. A branch `main` é a referência do aplicativo, e alterações devem ser propostas em branches específicas e pull requests.

## Regras não negociáveis de integridade
1. Preservar todas as **246 cartas originais**, imagens, Card IDs, níveis, PP, evoluções, habilidades, ímpetos e referências. Nunca preencher evidência inexistente, substituir cartas ou gerar estatísticas fictícias.
2. Não reutilizar automaticamente fichas de treinamento entre cartas parecidas. Considerar edição exata, função, estilo, movimentos, build e evidência por carta; documentar lacunas como **pendentes**.
3. Preservar a lógica de **todas as formações e elencos independentes**, incluindo 4-3-1-2 e a formação personalizada, restrições de jogadores e estilos táticos já implementados.
4. Exibir estilos, habilidades e ímpetos em **português brasileiro**, respeitando as nomenclaturas oficiais fornecidas no projeto; não fazer traduções improvisadas.
5. Melhorias de UX/UI devem respeitar a identidade visual e a logo existentes, com foco em legibilidade móvel e Windows, sem copiar recursos protegidos de terceiros.
6. Não quebrar armazenamento offline, importação/exportação, backups, identificador do pacote Android, assinaturas, atualizadores e compatibilidade Windows/Android.
7. Jamais ler, alterar ou expor senhas, tokens, chaves de assinatura, segredos GitHub Actions ou dados pessoais no código/logs.
8. Nenhum merge em `main`, publicação de release, alteração de assinatura/APK/EXE ou implantação automática sem autorização explícita do mantenedor.

## Ciclo obrigatório em tarefas de código
1. **Inspecionar:** ler `README.md`, `package.json`, `docs/`, código relacionado, testes e estado atual do CI/PRs; procurar soluções já existentes antes de criar módulos novos.
2. **Definir objetivo verificável:** registrar bug ou melhoria, evidências, escopo, critérios de aceitação e risco de regressão.
3. **Implementar o mínimo necessário** em branch isolada, mantendo mudanças reversíveis e compatíveis.
4. **Testar:** executar `npm run check` quando o ambiente permitir; executar testes focados e validações de sintaxe. Quando afetar UI, conferir os testes visuais; quando afetar Android/Windows, conferir os jobs de build respectivos no GitHub Actions.
5. **Corrigir e retestar** erros relevantes. Não remover ou afrouxar testes só para obter aprovação.
6. **Entregar PR revisável** com resumo, lista de arquivos, testes realmente executados, resultados, riscos, evidências de integridade das 246 cartas e pendências. Não alegar instalação validada sem teste físico.

## Critérios de interrupção e confirmação
- Se uma decisão exigir modificar dados das cartas, PP, identidade exata da carta, regras táticas aprovadas ou mecanismos de atualização, **interromper essa alteração e pedir aprovação**.
- Se houver falta de fontes, Card IDs inconclusivos, comportamento físico não verificável ou testes impossíveis, relatar explicitamente as limitações sem inventar.
- Depois de até **três ciclos de correção** sem estabilizar a mesma falha, documentar o bloqueio e a causa provável em vez de entrar em loop infinito.
- Não iniciar alterações em módulos fora do escopo da tarefa.

## Prioridades de melhoria
1. Estabilidade: instalação/atualizador Android, sincronismo e integridade de dados, backup com restauração.
2. UX premium consistente Android/Windows: fichas unificadas por estilo de técnico, ícones originais e tela inicial móvel enxuta.
3. Precisão tática individual: posicionamento, rotação de elenco, habilidades, ímpetos e evidências reais para cada uma das 246 cartas.
4. Testes de regressão e documentação operacional.

## Instrução de acionamento
Ao receber um objetivo, começar identificando a baseline e os critérios de aceitação. Trabalhar em ciclos limitados de inspeção → implementação → testes → correção → PR; manter a aprovação humana como barreira para produção.
