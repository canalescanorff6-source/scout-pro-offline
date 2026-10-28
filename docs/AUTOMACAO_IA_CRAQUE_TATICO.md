# Automação controlada de engenharia — Craque Tático

Este documento orienta a execução por um agente de programação; **não habilita, sozinho, um agente autônomo nem cobra serviços de API**.

## Componentes já presentes
- Projeto em `main`, com testes em `scripts/`, verificação `npm run check`, workflows GitHub Actions em `.github/workflows/`.
- GitHub Actions de CI/release, auditoria de dados e QA visual.
- Frontend offline, Electron (Windows) e Capacitor (Android).

## Camadas recomendadas
1. **Monitoramento:** uma tarefa agendada do ChatGPT revisa GitHub Actions/PRs e só alerta sobre regressões ou bloqueios novos. É leitura/análise, não implementação de software.
2. **Trabalho de programação:** configurar um ambiente Codex Cloud para o repositório `canalescanorff6-source/scout-pro-offline` no navegador/desktop. Selecionar Node compatível com workflows (`22`), instalar dependências apenas como necessário e rodar `npm run check`.
3. **Objetivos em ciclos:** executar uma tarefa ou Goal delimitado no Codex, lendo `AGENTS.md`, com testes e correções iterativas. Produzir uma branch e um PR; **não integrar automaticamente em `main`**.
4. **Gatilhos por evento (opcional):** em ChatGPT Work, configurar tarefa acionada por atividade de PR do GitHub, revisando gatilho, conta, permissões e ações que exigem aprovação.

## Prompt para iniciar Codex Cloud
> No repositório `canalescanorff6-source/scout-pro-offline`, leia `AGENTS.md`, `README.md` e os workflows antes de modificar qualquer arquivo. Use a V232 ou a HEAD atual como baseline real. Audite os testes e identifique o maior risco comprovável de regressão. Proponha uma melhoria pequena e verificável, registre critérios de aceite, implemente em branch separada, rode `npm run check` e os testes pertinentes. Corrija falhas detectadas, até 3 ciclos. Abra um PR com diff, evidências, limitações e impacto Android/Windows. Não modifique dados das 246 cartas nem publique release ou faça merge sem minha autorização.

## Prompt para Work com gatilho GitHub
> No repositório `canalescanorff6-source/scout-pro-offline`, quando houver atividade nova de pull request, examine o diff e os resultados dos workflows. Avise somente sobre regressões, falhas de CI ou riscos de integridade de 246 cartas, backups e atualizador Android/Windows. Traga links e recomendações técnicas. Não faça merge, release ou edições em `main` sem aprovação.

## Aceite de uma proposta do agente
- `npm run check` com resultado e logs verificáveis (ou impedimento explícito).
- CI dos fluxos aplicáveis verde e QA visual quando relevante.
- Exatamente 246 cartas preservadas, sem substituição de artes/Card IDs/PP.
- Português-BR e comportamento consistente nas plataformas afetadas.
- PR revisado e aprovado antes de integração.
- Builds de CI **não equivalem** a teste de instalação física de APK/EXE.

## Custos e privacidade
- O monitoramento agendado via ChatGPT é distinto das automações de codificação e está sujeito a limites de plano.
- Uma integração que use OpenAI API, runners extras ou serviços externos pode exigir credenciais e custos; não adicioná-la sem revisão.


## Auditoria diária no GitHub Actions (preparada nesta proposta)
- Arquivo: `.github/workflows/auditoria-diaria.yml`.
- Quando a proposta for aprovada e integrada em `main`, o GitHub executará `npm run check` diariamente em torno de **08:10 (UTC-3)** e também permitirá execução manual.
- A rotina valida código e integridade dos dados, guarda o relatório disponível da auditoria das 246 cartas e apresenta falhas no GitHub Actions; **não altera código, não invoca IA e não produz releases**.
- Este cron não é ativado por commits somente em branches de proposta: agendas do GitHub Actions usam a branch padrão.
- A tarefa de monitoramento do ChatGPT pode observar esses resultados e comunicar falhas, mas **não deve ser confundida com uma automação de implementação**.
- Para programação autônoma com Codex Cloud ainda é necessário o **consentimento e a autenticação do proprietário no Codex**. ChatGPT Plus e OpenAI API são produtos distintos; não se deve instalar fluxos que exijam chave paga sem autorização.
