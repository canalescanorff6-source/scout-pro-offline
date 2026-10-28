# Scout PRO V192 — refinamento visual premium (Android e Windows)

## Escopo
Continuar a V191 sem refazer o app, com azul-petróleo/grafite, turquesa discreto, dourado pontual e hierarquia visual clara. A referência de imagem exata aprovada anteriormente não está disponível neste ciclo; portanto **não afirmar fidelidade pixel a pixel ao mockup original** sem comparação visual.

## Home Android / Windows
- Busca **real** de `#search` movida para o painel inicial (mesmo campo DOM; filtros, ordenação e paginação permanecem ativos).
- Quatro ações mais importantes em grade: elenco, formações, ímpetos/habilidades, biotipo.
- Vídeos, auditorias e relatórios preservados no menu expandível.
- Respiro visual e contraste; área tocável de busca, cartões com tamanho proporcional em telas estreitas.
- No Windows, hero e imagens originais permanecem disponíveis, com layout largo e cards sem excesso de efeito.

## Ficha individual
- O motor **original** V162 passa a inserir o painel de cinco habilidades dentro de `#scout-v188-principal`, imediatamente antes do painel físico. Não cria cópia nem modifica sugestões, slots ou skills nativas.
- Continuidade visual única para treino, dois ímpetos mostrados nos prints, ímpeto recomendado, habilidades e biotipo.
- Biotipo renderizado como `<details>`: fechado inicialmente no mobile, aberto no desktop. Origem e confiabilidade permanecem explícitas.
- Visual desktop em colunas para treino e ímpetos; visual Android empilhado com espaçamento padronizado.
- Análises antigas permanecem acessíveis; nada removido dos arquivos originais.

## Integridade e publicação
- `web/scout-visual-v192.css` é carregado por `web/app-bridge.js` para as duas plataformas.
- Cache offline V192 atualizado.
- Fingerprint do bundle compartilhado ampliado de 17 para **18 fontes**; o CSS V192 é monitorado.
- Novo teste `scripts/test-ui-v192.cjs`: busca DOM original, atalhos e ferramentas, inserção única das skills, biotipo recolhível no mobile, cache e 246 fichas. `npm run check` inclui todos os testes anteriores.
- CI em PR antes de integrar; merge somente verde; builds Android/Windows e assinatura oficial na main.
- CI confirma integridade e build, mas **não substitui QA visual em aparelho físico nem comparação pixel a pixel com referência externa**.

## Dados preservados
246 cartas, artes PNG, Card IDs, PP, builds, níveis, habilidades nativas, ímpetos e informações locais do usuário. Nenhuma atualização remota de atributos nem sincronização automática de dados pessoais.
