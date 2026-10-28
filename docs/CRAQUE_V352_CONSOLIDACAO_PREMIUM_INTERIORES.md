# V352 — Consolidação visual Premium nas três áreas internas

## Escopo da primeira consolidação
Após o vídeo real enviado em 24/10/2026 e a V351 de abertura estável,
foi constatado que as páginas seguintes ainda conservavam três sistemas
visuais distintos:
1. `outros-elencos-v227.html` e suas fichas contextuais herdavam cores
   verde/turquesa de `craque-friends-v227.css`.
2. `meu-time-duas-formacoes-v177.html` misturava estilos inline legados
   com acabamento posterior V234.
3. `tecnicos-v307.html` possuía um tema próprio sem a folha V234, com
   acentos ciano/neon que não seguiam a identidade do escudo.

## Implementação
A `craque-premium-interiors-v352.css` é uma única camada compartilhada,
com tokens de azul-noite, ouro e marfim do escudo. Atua **somente** nas
páginas `body[data-page="friends"]`, `team` e `manager-hub`.
- Unifica superfícies, cabeçalhos, cartões, hierarquia textual, navegação,
  botões primários/secundários, seleções, campos, foco e diálogos.
- Usa CSS, não substitui DOM, não move campos e não oculta áreas antigas.
  Todas as ferramentas continuam acessíveis.
- Deixa o gramado e seus controles funcionais preservados, assim como
  as pontuações/IDs de técnicos, preferências e fotos do usuário.
- É carregada estaticamente no HTML de cada tela, reduzindo o risco de
  uma primeira pintura com cores antigas.
- Nas telas que possuem `app-bridge.js`, o mesmo `link` é reposicionado
  ao fim da camada global V234 para evitar que o CSS carregado depois
  reverta a paleta. Nenhum segundo download ou estilo duplicado.
- Central de Técnicos, que não possui `app-bridge.js`, usa a folha como
  último CSS do documento.
- A folha entra no pré-cache PWA e na impressão digital de paridade
  compartilhada entre Windows e Android.

## Testes
- `scripts/test-premium-interiors-v352.cjs`, integrado a `npm run check`,
  verifica três páginas, recursos carregados uma vez, precedência depois
  de V234, controles e catálogo original de 246 cartas preservados.
- `scripts/qa-premium-interiors-v352.py` exercita Chromium em
  390×844 (Android) e 1366×768 (Windows): cor/superfície renderizadas,
  nenhum overflow, modal de carta, troca de formação e detalhes do
  técnico, além de prioridade da folha CSS.
- Requer workflows CI, compilação debug Android, Windows e QA visual
  concluídos e aprovados no HEAD do PR para revisão.

## Limites
É a **primeira consolidação de três telas**. O app ainda tem outras
páginas legadas, que serão abordadas gradualmente com QA específico.
Não significa nova release já instalada. Os dados documentais das
246 cartas, Card IDs, builds, níveis, PP, ímpetos, habilidades,
históricos locais, certificados e o atualizador não foram alterados.

## Publicação
Base cumulativa V349–V351, release oficial ainda v1.1.988.
Não integrar `main` nem publicar APK/EXE sem nova autorização expressa.
