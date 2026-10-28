# V360 — UX leve e auditoria inicial de nível/PP (24/10/2026)

## Evidência de uso
O vídeo fornecido pelo proprietário (221,7 s) mostra home com muitas ferramentas,
acesso às coleções Bruno Santos CD e 7$, abertura de fichas de amigos e scroll extenso
nas fichas das cartas principais (Daniele Massaro e Sandro Tonali). Também foi relatado
que a interface Premium pode dar lugar ao visual legado após carregamento.

## Alterações propostas (branch isolada)
- Folha V360 **única**, compartilhada Android/Windows, declarada no HTML da home e
  de Outros Elencos, reposicionada ao final da cascata pela ponte nas fichas.
- Layout inicial compacto sem apagar funções; coleção Bruno apresentada em formato compacto.
- Seletor de coleção na abertura de Outros Elencos. Usa os mesmos owners e o mesmo
  `selectOwner` existentes; não duplica armazenamento e mantém `7$` separado.
- Cadastro de cartas mais enxuto: nome, edição, ID, posição, raridade, estilo, nível
  máximo e PP ficam visíveis; skills, ímpetos e treino manual em `details`.
  Um cadastro pré-existente com detalhes preenchidos abre essa seção automaticamente.
- Menu `Mais` na home e nas fichas individuais recebe atalho para Outros Elencos.
- Efeitos **desligados por padrão no bundle**: os módulos V186/V234 encerram antes de
  instalar IntersectionObservers, MutationObservers, listeners e adornos visuais.
  Não apagar imagens/raridades e não alterar armazenamento local.
- Cache offline PWA e fingerprint de empacotamento incluem a folha visual nova.

## Auditoria dos dados originais (leitura, sem correção)
Fonte: `web/SCOUT_V69_AUDITORIA.json`; `scripts/test-ux-lite-v360.cjs`
verifica os invariantes em toda execução.

- Total do acervo: **246**.
- Cartas com `max_level` explícito no JSON: **85**; para todas, o PP registrado
  coincide com `2 × (nível máximo − 1)` (**nenhuma divergência aritmética**).
- Cartas sem `max_level` explícito no mesmo JSON: **161**. Ter PP preenchido
  não equivale a uma prova documental do nível máximo da edição.
- Cartas com 10 grupos de treino registrados e custo conferível: **162**.
  Todas as 162 fecham o PP declarado pelo custo progressivo dos níveis.
- Cartas com `niveis: null`: **84**; isso significa treino individual
  não registrado nessa fonte, não necessariamente erro ou ausência de ficha no app.
- O dossiê V213 marca as **246** com auditoria individual pendente, então
  **não é justificável alterar automaticamente nível, PP ou build**.

## Critérios de aceitação e limites
1. Home Premium e menu Mais oferecem Outros Elencos sem duplicação.
2. Trocar coleção não muda o conteúdo de outra pessoa.
3. A ficha expõe cinco estilos, treinamento, habilidades e ímpetos, sem perder campos.
4. A flag de modo leve impede observers e decoração das cartas.
5. CSS final presente no bundle offline e na assinatura compartilhada.
6. PR sem merge automático. Executar `npm run check`, QA Android/Windows e testar
   APK físico antes de afirmar que o conflito de layout desapareceu no telefone.
7. Confirmar nível máximo **da edição exata** para as 161 pendências documentais;
   coletar evidência individual antes de alterar qualquer dado.

A gravação comprova experiência de uso, não os níveis máximos oficiais das cartas.
