# Revisão funcional ampliada — 30/10/2026

## Veredito e limites
O editor passou nos testes locais e no CI; a revisão inicial não cobria o aplicativo inteiro. Nesta etapa, a inspeção foi ampliada às 15 páginas de ferramentas e a duas fichas (17 páginas × 3 larguras = 51 aberturas), mais fluxos interativos de coleções, técnicos, formações e conferência. Nenhum erro JavaScript ou recurso HTTP local ausente nessas 51 aberturas.

Isso não é homologação física dos aplicativos nem prova de todas as combinações de ações. Imagens sem `src` em formulários recolhidos foram identificadas como placeholders, não como cartas quebradas.

## Defeitos reproduzidos e corrigidos

| Prioridade | Defeito e evidência | Correção e prova |
| --- | --- | --- |
| P2 | Windows descartava links de sete domínios presentes nas fichas: Konami, PES Master, www.pesdb.net, efootbase, ef-labo, efootball-world e efootballmeta. Teste do handler falhou ao abrir a referência Konami. | Permitir somente esses hosts HTTPS exatos. Testes positivos para as sete fontes; negativos para domínio falso, credenciais, portas e protocolos arbitrários. Atualizador/instalação não alterados. |
| P2 | Instalação do cache PWA falhava: `Cache.addAll(): duplicate requests (.../SCOUT_V101_MODELO_CORPORAL.json)`. Worker ficava `redundant`, sem controlar a página. | Remover duplicatas antes de preencher o cache. Chromium real instalou/ativou o worker e recarregou o catálogo com 261 cartas sem rede. Aplicável ao navegador/PWA; Capacitor/Electron empacotam arquivos separadamente. |
| P3 | Revisão tática ultrapassava em 14 px a tela de 320 px e cortava o rótulo “Base cadastrada”. | Indicadores em duas colunas nas telas estreitas; QA em 320/390/1366 sem corte ou rolagem horizontal. |
| P3 | Cada execução do normalizador acrescentava prefixos repetidos à busca das cartas 149, 150 e 237. Conflitos também repetiam o aviso no papel de uso. | Normalização idempotente, testada por duas execuções reais sobre cópia descartável das 246 fichas e um conflito de teste. Limpeza do índice restrita aos três atributos `data-search`; nenhum outro conteúdo do índice alterado. |

## Evidência de funcionamento
- Suíte completa após as quatro correções: `npm run check:sequential` — **286 comandos aprovados**. Testes novos reproduziram os defeitos antes das correções.
- Rotas gerais: 17 páginas em 320×700, 390×844 e 1366×768; navegação global adicional em 10 rotas × 2 telas.
- Coleções: criar cartas, trocar proprietário e filtrar por posição/PP em três larguras.
- Formações: abrir ficha pela vaga, simular posição e trocar titular nos dois acervos, preservando contexto/escalação fora da ação testada.
- Técnicos: 23 em destaque/71 no catálogo, pesquisa de duas edições Klopp, comparação, marcação e seleção, celular/desktop.
- Conferência: busca, raridade, ficha e confirmação/rascunho persistentes em três larguras.
- Backup real: exportar, conferir SHA-256, adulterar somente o registro descartável e restaurar exatamente os dados do editor; backup adulterado rejeitado.
- Editor: testes locais anteriores registrados em CLAUDE_PROGRESS; CI do commit `ea06dd0` abriu **261 fichas, zero falhas**, e passou nos testes de interface e integridade. Jobs nativos Android/Windows foram **skipped** no PR, não compilados.
- CI anterior: https://github.com/canalescanorff6-source/scout-pro-offline/actions/runs/41158461497 (visual) e https://github.com/canalescanorff6-source/scout-pro-offline/actions/runs/41158461504 (integridade).

## Pendências reais
- Windows instalado localizado: versão 1.1.1181. A janela foi identificada e seus controles básicos lidos; captura falhou com `FrameArrived timed out` e `window capture timed out`. Não houve teste visual completo da versão instalada nem gravação de dados pessoais.
- Android: instalação/atualização, botão Voltar, teclado e restauração por seletor nativo em aparelho real.
- Windows: gerar e instalar versão com estas mudanças, testar atualização/reinício e diálogos nativos de backup com perfil de teste.
- Revalidar CI após enviar este complemento ao PR #297. Sem merge, release ou APK/EXE novo publicado nesta etapa.
- Conferir manualmente as ações não exercitadas de cada ferramenta e, em etapa separada, dados de cartas/evidências competitivas pendentes. Não transformar ausência de evidência de gameplay em erro de programação.
